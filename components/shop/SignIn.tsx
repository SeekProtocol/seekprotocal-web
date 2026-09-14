"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getPathname, useRouter } from "@/i18n/navigation";
import { getSupabase } from "@/lib/supabase-browser";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Three ways in, all of them the app's own: Google, Apple, or an 8-digit code
 * by email. The OAuth buttons navigate away and come back with a PKCE code
 * that the browser client exchanges. Every completed login starts in the
 * shop, keeping the selected language. Existing sessions can browse orders.
 */
export default function SignIn({purpose="shop"}: {purpose?: "shop" | "orders"}) {
  const t = useTranslations("shop");
  const locale = useLocale();
  const router = useRouter();
  const [stage, setStage] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState<null | "google" | "apple" | "email" | "code">(null);
  const [error, setError] = useState("");

  const returnUrl = () => `${window.location.origin}${getPathname({href: "/shop", locale})}`;

  const oauth = async (provider: "google" | "apple") => {
    setBusy(provider);
    setError("");
    const { error: authError } = await getSupabase().auth.signInWithOAuth({
      provider,
      options: { redirectTo: returnUrl() },
    });
    /* On success the browser is already leaving; only the failure needs handling. */
    if (authError) {
      setError(t("signInFailed"));
      setBusy(null);
    }
  };

  const sendCode = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_REGEX.test(trimmed)) {
      setError(t("emailInvalid"));
      return;
    }
    setBusy("email");
    setError("");
    const { error: otpError } = await getSupabase().auth.signInWithOtp({
      email: trimmed,
      options: { emailRedirectTo: returnUrl() },
    });
    setBusy(null);
    if (otpError) {
      setError(otpError.status === 429 ? t("errRateLimited") : t("signInFailed"));
      return;
    }
    setEmail(trimmed);
    setCode("");
    setStage("code");
  };

  const verify = async (event: FormEvent) => {
    event.preventDefault();
    const token = code.replace(/\D/g, "");
    if (token.length < 6) {
      setError(t("codeInvalid"));
      return;
    }
    setBusy("code");
    setError("");
    const { data, error: verifyError } = await getSupabase().auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    if (verifyError || !data.session) {
      setError(t("codeInvalid"));
      setBusy(null);
      return;
    }
    router.replace("/shop");
  };

  return (
    <div className="card shop-signin">
      <div>
        <p className="eyebrow">{t(purpose === "orders" ? "history.signInTitle" : "signInTitle")}</p>
        <p className="t-body text-muted">{t(purpose === "orders" ? "history.signInLead" : "signInLead")}</p>
      </div>

      <div className="shop-signin-providers">
        <button
          type="button"
          className="btn btn-outline btn-lg"
          disabled={busy !== null}
          onClick={() => void oauth("google")}
        >
          <GoogleGlyph />
          {t("continueGoogle")}
        </button>
        <button
          type="button"
          className="btn btn-outline btn-lg"
          disabled={busy !== null}
          onClick={() => void oauth("apple")}
        >
          <AppleGlyph />
          {t("continueApple")}
        </button>
      </div>

      <p className="shop-signin-divider">{t("orEmail")}</p>

      {stage === "email" ? (
        <form onSubmit={sendCode} className="stack gap-sm" noValidate>
          <div className="field">
            <label htmlFor="shop-email" className="field-label">
              {t("emailLabel")}
            </label>
            <input
              id="shop-email"
              name="email"
              type="email"
              className="input"
              autoComplete="email"
              inputMode="email"
              maxLength={256}
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-brand" disabled={busy !== null}>
            {busy === "email" ? t("sendingCode") : t("sendCode")}
          </button>
        </form>
      ) : (
        <form onSubmit={verify} className="stack gap-sm" noValidate>
          <p className="t-small">{t("codeSentTo", { email })}</p>
          <div className="field">
            <label htmlFor="shop-code" className="field-label">
              {t("codeLabel")}
            </label>
            <input
              id="shop-code"
              name="code"
              type="text"
              className="input shop-code-input"
              autoComplete="one-time-code"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={8}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              autoFocus
            />
          </div>
          <div className="btn-row">
            <button type="submit" className="btn btn-brand" disabled={busy !== null}>
              {busy === "code" ? t("verifying") : t("verifyCode")}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={busy !== null}
              onClick={() => {
                setStage("email");
                setError("");
              }}
            >
              {t("useAnotherEmail")}
            </button>
          </div>
        </form>
      )}

      {error && (
        <p className="form-status form-status-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/* Both marks in currentColor, on the same 24-grid as the rest of the site's
   icons, so they sit in an outline button like any other glyph. */
function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M12 10.2v3.9h5.5c-.25 1.4-1.65 4.1-5.5 4.1-3.3 0-6-2.75-6-6.1s2.7-6.1 6-6.1c1.9 0 3.15.8 3.85 1.5l2.65-2.55C16.8 3.35 14.6 2.3 12 2.3 6.65 2.3 2.3 6.65 2.3 12s4.35 9.7 9.7 9.7c5.6 0 9.3-3.95 9.3-9.5 0-.65-.05-1.15-.15-1.65Z" />
    </svg>
  );
}

function AppleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M16.4 12.7c0-2.5 2.05-3.7 2.15-3.75-1.15-1.7-2.95-1.95-3.6-1.95-1.55-.15-3 .9-3.8.9-.8 0-2-.9-3.3-.85-1.7.05-3.25 1-4.1 2.5-1.75 3.05-.45 7.55 1.25 10 .85 1.2 1.85 2.55 3.15 2.5 1.25-.05 1.75-.8 3.25-.8s1.95.8 3.3.8c1.35-.05 2.2-1.25 3.05-2.45.95-1.4 1.35-2.75 1.4-2.8-.05-.05-2.75-1.05-2.75-4.1ZM13.9 5.35c.7-.85 1.15-2 1.05-3.15-1 .05-2.2.65-2.9 1.5-.65.75-1.2 1.95-1.05 3.1 1.1.1 2.2-.55 2.9-1.45Z" />
    </svg>
  );
}
