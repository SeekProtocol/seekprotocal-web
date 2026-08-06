"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isOff } from "@/lib/bisect";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        },
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/**
 * Turnstile, loaded on intent rather than on mount.
 *
 * Both forms used to fetch the script and render the widget from a mount
 * effect. The beta form is on the homepage, so that meant every reader on every
 * visit paid for a captcha nobody had asked to solve — and on production it was
 * not merely idle. Measured live on 6 August:
 *
 *   /cdn-cgi/challenge-platform/.../auto/fbE/new/normal            403
 *   /cdn-cgi/challenge-platform/.../auto/fbE/crashed_retry/normal  403
 *
 * `crashed_retry` is Cloudflare's own endpoint name. The challenge fails, the
 * widget crashes, it restarts itself, and it goes round again, indefinitely,
 * inside a cross-origin iframe that the page cannot see into or clean up. It is
 * also the one thing on the homepage that none of the bisect flags reached:
 * `fx`, `anim`, `img`, `3d` and `effects` were each tested against the mobile
 * tab kill and every one of those tests ran with this going underneath it.
 *
 * Arming on interaction takes it off the page for the overwhelming majority of
 * readers, who scroll the homepage and never touch the form. Whatever the 403
 * turns out to be, it can no longer be part of a scroll.
 *
 * **This does not fix the 403 itself.** That is a dashboard setting, not a code
 * one: the sitekey's allowed-hostnames list has to include the hostname the
 * page is actually served from, and note that production serves
 * `www.seekprotocol.ai` rather than the apex. Until that is right, both forms
 * return "please complete the verification" and cannot be submitted at all,
 * which is worth more attention than the crash was.
 *
 * `arm()` is idempotent and cheap to call from a focus handler. The script is
 * shared between the two forms: whichever arms first fetches it, and the second
 * waits on the same element rather than adding another.
 */
export function useTurnstile() {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [token, setToken] = useState("");
  const [armed, setArmed] = useState(false);

  /** First touch of the form. Safe to call on every focus; only the first counts. */
  const arm = useCallback(() => setArmed(true), []);

  useEffect(() => {
    if (!armed) return;
    /* ?cf=off — skip the widget and its script entirely. See lib/bisect.ts. */
    if (isOff("cf")) return;
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey) return;

    /* The effect can be torn down between the script resolving and the render
       landing, and Turnstile has no way to cancel a pending render. This guards
       the callback instead, so a widget is never rendered into a detached node. */
    let live = true;

    const renderWidget = () => {
      if (!live) return;
      if (!window.turnstile || !containerRef.current || widgetIdRef.current) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (value: string) => setToken(value),
        "expired-callback": () => setToken(""),
        "error-callback": () => setToken(""),
        theme: "auto",
      });
    };

    if (window.turnstile) {
      renderWidget();
      return () => {
        live = false;
      };
    }

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src*="challenges.cloudflare.com/turnstile"]',
    );
    if (existing) {
      existing.addEventListener("load", renderWidget);
      return () => {
        live = false;
        existing.removeEventListener("load", renderWidget);
      };
    }

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.addEventListener("load", renderWidget);
    document.head.appendChild(script);

    return () => {
      live = false;
      script.removeEventListener("load", renderWidget);
    };
  }, [armed]);

  /* Removal is its own effect, keyed on nothing, so it runs when the form
     unmounts rather than every time `armed` changes. Tying it to the effect
     above would have torn the widget down and rebuilt it on any re-arm. */
  useEffect(() => {
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, []);

  /** After a successful submit, so the next one needs a fresh challenge. */
  const reset = useCallback(() => {
    setToken("");
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  }, []);

  return { containerRef, token, armed, arm, reset };
}
