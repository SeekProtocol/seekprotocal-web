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

export default function ContactForm() {
  const t = useTranslations("forms");
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
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

    if (!formData.name || !formData.email || !formData.message) return;
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
      setFormData({ name: "", email: "", message: "" });
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
        <form onSubmit={handleSubmit} className="form-2">
          <div className="filed-wrap">
            <label htmlFor="name" className="text-field-label paragraph-02">
              {t("yourName")}
            </label>
            <input
              className="text-field-option w-input"
              maxLength={256}
              name="name"
              placeholder={t("namePlaceholder")}
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>
          <div className="filed-wrap">
            <label htmlFor="Email" className="text-field-label paragraph-02">
              {t("yourEmail")}
            </label>
            <input
              className="text-field-option w-input"
              maxLength={256}
              name="Email"
              placeholder={t("emailInputPlaceholder")}
              type="email"
              id="Email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </div>
          <div className="filed-wrap _01">
            <label htmlFor="message" className="text-field-label paragraph-02">
              {t("message")}
            </label>
            <textarea
              id="message"
              name="message"
              maxLength={5000}
              placeholder={t("messagePlaceholder")}
              required
              className="textarea w-input"
              value={formData.message}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, message: e.target.value }))
              }
            />
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
