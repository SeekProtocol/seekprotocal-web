"use client";

import { useState, FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useTurnstile } from "@/lib/use-turnstile";

/* The Window.turnstile declaration lives in lib/use-turnstile.ts, which is the
   only thing that touches the global now. */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[\d\s\-().]{7,20}$/;

export default function ContactForm() {
  const t = useTranslations("forms");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  /* Armed on the first focus anywhere in the form. See lib/use-turnstile.ts. */
  const {
    containerRef: turnstileRef,
    token: turnstileToken,
    armed: turnstileArmed,
    arm: armTurnstile,
    reset: resetTurnstile,
  } = useTurnstile();

  const validateField = (name: string, value: string): string => {
    if (name === "name") {
      if (!value.trim()) return t("validationName");
    }
    if (name === "email") {
      if (!value.trim()) return t("validationRequired");
      if (!EMAIL_REGEX.test(value)) return t("validationEmail");
    }
    if (name === "phone") {
      if (value.trim() && !PHONE_REGEX.test(value)) return t("validationPhone");
    }
    if (name === "message") {
      if (!value.trim()) return t("validationRequired");
    }
    return "";
  };

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name as keyof typeof formData]);
    setFieldErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const error = validateField(name, value);
      setFieldErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const validateAll = (): boolean => {
    const errors: Record<string, string> = {};
    for (const key of ["name", "email", "phone", "message"] as const) {
      errors[key] = validateField(key, formData[key]);
    }
    setFieldErrors(errors);
    setTouched({ name: true, email: true, phone: true, message: true });
    return !Object.values(errors).some((e) => e);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateAll()) return;
    if (!turnstileToken) {
      /* Also arms, for the autofill-and-Enter path that never focuses a field. */
      armTurnstile();
      setErrorMessage(t("captchaError"));
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, turnstileToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || t("genericError"));
      }

      setStatus("success");
      setFormData({ name: "", email: "", phone: "", message: "" });
      setFieldErrors({});
      setTouched({});
      resetTurnstile();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : t("genericErrorRetry")
      );
      setStatus("error");
      resetTurnstile();
    }
  };

  return (
    <>
      {/* onFocus on the form rather than one handler per field: React implements
          it with focusin, which bubbles, so any of the four arms the widget. */}
      {(status === "idle" || status === "submitting" || status === "error") && (
        <form
          onSubmit={handleSubmit}
          onFocus={armTurnstile}
          className="contact-form"
          noValidate
        >
          <div className="field">
            <label htmlFor="name" className="field-label">
              {t("yourName")} <span className="field-required">*</span>
            </label>
            <input
              className={`input ${touched.name && fieldErrors.name ? "field-error" : ""}`}
              maxLength={256}
              name="name"
              placeholder={t("namePlaceholder")}
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              onBlur={() => handleBlur("name")}
            />
            {touched.name && fieldErrors.name && (
              <p className="field-error-message">{fieldErrors.name}</p>
            )}
          </div>
          <div className="field">
            <label htmlFor="Email" className="field-label">
              {t("yourEmail")} <span className="field-required">*</span>
            </label>
            <input
              className={`input ${touched.email && fieldErrors.email ? "field-error" : ""}`}
              maxLength={256}
              name="Email"
              placeholder={t("emailInputPlaceholder")}
              type="email"
              id="Email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              onBlur={() => handleBlur("email")}
            />
            {touched.email && fieldErrors.email && (
              <p className="field-error-message">{fieldErrors.email}</p>
            )}
          </div>
          <div className="field">
            <label htmlFor="phone" className="field-label">
              {t("yourPhone")} <span className="field-optional">({t("optional")})</span>
            </label>
            <input
              className={`input ${touched.phone && fieldErrors.phone ? "field-error" : ""}`}
              maxLength={20}
              name="phone"
              placeholder={t("phonePlaceholder")}
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              onBlur={() => handleBlur("phone")}
            />
            {touched.phone && fieldErrors.phone && (
              <p className="field-error-message">{fieldErrors.phone}</p>
            )}
          </div>
          <div className="field field-full">
            <label htmlFor="message" className="field-label">
              {t("message")} <span className="field-required">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              maxLength={5000}
              placeholder={t("messagePlaceholder")}
              className={`textarea ${touched.message && fieldErrors.message ? "field-error" : ""}`}
              value={formData.message}
              onChange={(e) => handleChange("message", e.target.value)}
              onBlur={() => handleBlur("message")}
            />
            {touched.message && fieldErrors.message && (
              <p className="field-error-message">{fieldErrors.message}</p>
            )}
          </div>
          {/* In the tree only once armed. Refs are attached before effects run,
              so the node exists by the time the widget renders into it. */}
          {turnstileArmed && (
            <div ref={turnstileRef} className="cf-turnstile contact-form-turnstile" />
          )}
          {status === "error" && errorMessage && (
            <p className="form-status form-status-error contact-form-full" role="alert">
              {errorMessage}
            </p>
          )}
          <button
            type="submit"
            className="btn btn-brand btn-lg contact-form-submit"
            disabled={status === "submitting"}
          >
            {status === "submitting" ? t("sending") : t("sendNow")}
          </button>
        </form>
      )}
      {status === "success" && (
        <p className="form-status form-status-success" role="status">
          {t("successMessage")}
        </p>
      )}
    </>
  );
}
