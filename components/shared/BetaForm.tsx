"use client";

import { useState, useEffect, useRef, FormEvent } from "react";

export default function BetaForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey) return;

    const renderWidget = () => {
      if (window.turnstile && turnstileRef.current && !widgetIdRef.current) {
        widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
          sitekey: siteKey,
          callback: (token: string) => setTurnstileToken(token),
          "expired-callback": () => setTurnstileToken(""),
          "error-callback": () => setTurnstileToken(""),
          theme: "dark",
        });
      }
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      const existing = document.querySelector(
        'script[src*="challenges.cloudflare.com/turnstile"]'
      );
      if (!existing) {
        const script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.onload = renderWidget;
        document.head.appendChild(script);
      } else {
        existing.addEventListener("load", renderWidget);
      }
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email) return;
    if (!turnstileToken) {
      setErrorMessage("Please complete the captcha verification.");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/beta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, turnstileToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setStatus("success");
      setEmail("");
      setTurnstileToken("");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
      setStatus("error");
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current);
      }
    }
  };

  return (
    <div className="form-block-2 w-form">
      {(status === "idle" || status === "submitting" || status === "error") && (
        <form onSubmit={handleSubmit}>
          <div className="form-3">
            <input
              className="cta-text-field w-input"
              maxLength={256}
              name="email"
              placeholder="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div>
              <input
                type="submit"
                className="normal-submit-button w-button"
                value={status === "submitting" ? "Sending..." : "Send Now"}
                disabled={status === "submitting"}
              />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
            <div ref={turnstileRef} className="cf-turnstile" />
          </div>
          {status === "error" && errorMessage && (
            <div className="w-form-fail" style={{ display: "block", marginTop: "0.75rem", textAlign: "center" }}>
              <div>{errorMessage}</div>
            </div>
          )}
        </form>
      )}
      {status === "success" && (
        <div className="success-message-wrapper w-form-done" style={{ display: "block" }}>
          <div className="success-message-wrap">
            <div className="success-message">
              <div className="paragraph-01 text-black">
                Thank you! Your submission has been received!
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
