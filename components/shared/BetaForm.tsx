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
          theme: "auto",
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

  if (status === "success") {
    return (
      <p className="form-status form-status-success beta-form-status" role="status">
        {t("successMessage")}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="beta-form">
      <div className="beta-form-row">
        <div className="beta-form-field">
          <label htmlFor="beta-email" className="sr-only">
            {t("emailPlaceholder")}
          </label>
          <input
            id="beta-email"
            className={`input ${emailTouched && emailError ? "field-error" : ""}`}
            maxLength={256}
            name="email"
            placeholder={t("emailPlaceholder")}
            type="email"
            value={email}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            aria-invalid={emailTouched && Boolean(emailError)}
            aria-describedby={emailTouched && emailError ? "beta-email-error" : undefined}
          />
        </div>
        <button type="submit" className="btn btn-brand" disabled={status === "submitting"}>
          {status === "submitting" ? t("sending") : t("sendNow")}
        </button>
      </div>

      {emailTouched && emailError && (
        <p id="beta-email-error" className="field-error-message">
          {emailError}
        </p>
      )}

      <div className="beta-form-turnstile">
        <div ref={turnstileRef} className="cf-turnstile" />
      </div>

      {status === "error" && errorMessage && (
        <p className="form-status form-status-error" role="alert">
          {errorMessage}
        </p>
      )}
    </form>
  );
}
