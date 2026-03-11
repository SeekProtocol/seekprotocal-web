"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useTranslations } from "next-intl";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function BetaForm() {
  const t = useTranslations("forms");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
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

  const validateEmail = (value: string): string => {
    if (!value.trim()) return t("validationRequired");
    if (!EMAIL_REGEX.test(value)) return t("validationEmail");
    return "";
  };

  const handleBlur = () => {
    setEmailTouched(true);
    setEmailError(validateEmail(email));
  };

  const handleChange = (value: string) => {
    setEmail(value);
    if (emailTouched) {
      setEmailError(validateEmail(value));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setEmailTouched(true);
    const error = validateEmail(email);
    setEmailError(error);
    if (error) return;

    if (!turnstileToken) {
      setErrorMessage(t("captchaError"));
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
        throw new Error(data.error || t("genericError"));
      }

      setStatus("success");
      setEmail("");
      setEmailError("");
      setEmailTouched(false);
      setTurnstileToken("");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : t("genericErrorRetry")
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
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-3">
            <div style={{ flex: 1 }}>
              <input
                className={`cta-text-field w-input ${emailTouched && emailError ? "field-error" : ""}`}
                maxLength={256}
                name="email"
                placeholder={t("emailPlaceholder")}
                type="email"
                value={email}
                onChange={(e) => handleChange(e.target.value)}
                onBlur={handleBlur}
              />
              {emailTouched && emailError && (
                <p className="field-error-message">{emailError}</p>
              )}
            </div>
            <div>
              <input
                type="submit"
                className="normal-submit-button w-button"
                value={status === "submitting" ? t("sending") : t("sendNow")}
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
              <div className="paragraph-01 text-black">{t("successMessage")}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
