"use client";

import { useState, FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useTurnstile } from "@/lib/use-turnstile";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function BetaForm() {
  const t = useTranslations("forms");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  /* Armed on first focus rather than on mount. This form is on the homepage, so
     mounting it eagerly ran a failing captcha in a cross-origin iframe for every
     reader who ever scrolled past. See lib/use-turnstile.ts. */
  const {
    containerRef: turnstileRef,
    token: turnstileToken,
    armed: turnstileArmed,
    arm: armTurnstile,
    reset: resetTurnstile,
  } = useTurnstile();

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
      /* Autofill and Enter can reach submit without ever focusing the field, so
         this is the second place the widget can be armed from. The message asks
         for a retry, and by then the challenge is already running. */
      armTurnstile();
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
      resetTurnstile();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : t("genericErrorRetry")
      );
      setStatus("error");
      resetTurnstile();
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
            onFocus={armTurnstile}
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

      {/* Only in the tree once armed. React attaches refs before it runs the
          effect that renders into this, so the node is there in time. */}
      {turnstileArmed && (
        <div className="beta-form-turnstile">
          <div ref={turnstileRef} className="cf-turnstile" />
        </div>
      )}

      {status === "error" && errorMessage && (
        <p className="form-status form-status-error" role="alert">
          {errorMessage}
        </p>
      )}
    </form>
  );
}
