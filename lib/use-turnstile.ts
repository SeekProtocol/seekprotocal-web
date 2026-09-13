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
          "error-callback"?: (code: string) => void;
          "timeout-callback"?: () => void;
          "unsupported-callback"?: () => void;
          retry?: "auto" | "never";
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

/** Shared script, one widget per form. Failures remain visible until a retry. */
export function useTurnstile() {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const errorRef = useRef<string | null>(null);
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [armed, setArmed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const reset = useCallback(() => {
    setToken("");
    setError(null);
    errorRef.current = null;
    if (widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.reset(widgetIdRef.current);
        return;
      } catch {
        // A removed or broken widget needs a fresh render.
      }
    }
    setAttempt((value) => value + 1);
  }, []);

  const arm = useCallback(() => {
    if (errorRef.current) reset();
    setArmed(true);
  }, [reset]);

  useEffect(() => {
    if (!armed) return;
    let live = true;
    let script: HTMLScriptElement | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined = undefined;

    const fail = (code: string) => {
      if (!live) return;
      setToken("");
      errorRef.current = code;
      setError(code);
      // Codes identify configuration/network failures without recording tokens.
      console.warn("[Turnstile] Verification failed:", code);
    };
    const cleanup = () => {
      live = false;
      clearTimeout(timer);
      script?.removeEventListener("load", renderWidget);
      script?.removeEventListener("error", scriptFailed);
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
    const renderWidget = () => {
      if (!live) return;
      clearTimeout(timer);
      if (!window.turnstile || !containerRef.current) {
        fail("script_unavailable");
        return;
      }
      if (widgetIdRef.current) return;
      try {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
          callback: (value) => {
            if (!live) return;
            errorRef.current = null;
            setError(null);
            setToken(value);
          },
          "expired-callback": () => { if (live) setToken(""); },
          "error-callback": fail,
          "timeout-callback": () => fail("challenge_timeout"),
          "unsupported-callback": () => fail("browser_unsupported"),
          retry: "never",
          theme: "auto",
        });
      } catch {
        fail("render_failed");
      }
    };
    const scriptFailed = () => {
      clearTimeout(timer);
      if (script) script.dataset.turnstileFailed = "true";
      fail("script_unavailable");
    };

    if (isOff("cf") || !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
      queueMicrotask(() => fail("configuration_missing"));
      return cleanup;
    }
    if (window.turnstile) {
      renderWidget();
      return cleanup;
    }

    script = document.querySelector<HTMLScriptElement>('script[src*="challenges.cloudflare.com/turnstile"]');
    if (script?.dataset.turnstileFailed) {
      script.remove();
      script = null;
    }
    const needsScript = !script;
    if (!script) {
      script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
    }
    script.addEventListener("load", renderWidget);
    script.addEventListener("error", scriptFailed);
    timer = setTimeout(scriptFailed, 15_000);
    if (needsScript) document.head.appendChild(script);
    return cleanup;
  }, [armed, attempt]);

  return { containerRef, token, error, armed, arm, reset };
}
