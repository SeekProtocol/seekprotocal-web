"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useTranslations } from "next-intl";

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
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[\d\s\-().]{7,20}$/;

export default function ContactForm() {
  const t = useTranslations("forms");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
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
    <div className="contact-form-block w-form">
      {(status === "idle" || status === "submitting" || status === "error") && (
        <form onSubmit={handleSubmit} className="form-2" noValidate>
          <div className="filed-wrap">
            <label htmlFor="name" className="text-field-label paragraph-02">
              {t("yourName")} <span className="field-required">*</span>
            </label>
            <input
              className={`text-field-option w-input ${touched.name && fieldErrors.name ? "field-error" : ""}`}
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
          <div className="filed-wrap">
            <label htmlFor="Email" className="text-field-label paragraph-02">
              {t("yourEmail")} <span className="field-required">*</span>
            </label>
            <input
              className={`text-field-option w-input ${touched.email && fieldErrors.email ? "field-error" : ""}`}
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
          <div className="filed-wrap">
            <label htmlFor="phone" className="text-field-label paragraph-02">
              {t("yourPhone")} <span className="field-optional">({t("optional")})</span>
            </label>
            <input
              className={`text-field-option w-input ${touched.phone && fieldErrors.phone ? "field-error" : ""}`}
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
          <div className="filed-wrap _01">
            <label htmlFor="message" className="text-field-label paragraph-02">
              {t("message")} <span className="field-required">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              maxLength={5000}
              placeholder={t("messagePlaceholder")}
              className={`textarea w-input ${touched.message && fieldErrors.message ? "field-error" : ""}`}
              value={formData.message}
              onChange={(e) => handleChange("message", e.target.value)}
              onBlur={() => handleBlur("message")}
            />
            {touched.message && fieldErrors.message && (
              <p className="field-error-message">{fieldErrors.message}</p>
            )}
          </div>
          <div ref={turnstileRef} className="cf-turnstile" style={{ marginBottom: "1rem" }} />
          {status === "error" && errorMessage && (
            <div className="w-form-fail" style={{ display: "block", marginBottom: "1rem" }}>
              <div>{errorMessage}</div>
            </div>
          )}
          <input
            type="submit"
            className="normal-submit-button _03 w-button"
            value={status === "submitting" ? t("sending") : t("sendNow")}
            disabled={status === "submitting"}
          />
        </form>
      )}
      {status === "success" && (
        <div className="success-message w-form-done" style={{ display: "block" }}>
          <div className="paragraph-02 text-black">{t("successMessage")}</div>
        </div>
      )}
    </div>
  );
}
