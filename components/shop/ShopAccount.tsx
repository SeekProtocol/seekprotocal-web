"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { Session } from "@supabase/supabase-js";
import { Link } from "@/i18n/navigation";
import { getSupabase, getShopSessionPolicy, signOutShop, SHOP_SESSION_EVENT, supabaseConfigured } from "@/lib/supabase-browser";
import SignIn from "./SignIn";

/** Shared login boundary. Private content unmounts on sign-out or account change. */
export default function ShopAccount({page="shop", children}: {
  page?: "shop" | "orders"; children: (session: Session) => ReactNode;
}) {
  const t = useTranslations("shop");
  const h = useTranslations("shop.history");
  const configured = supabaseConfigured();
  const [session, setSession] = useState<Session | null>();
  const [failed, setFailed] = useState(false);
  const [expired, setExpired] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!configured) return;
    let active = true;
    let version = 0;
    let latest: Session | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let supabase: ReturnType<typeof getSupabase>;
    let policy: ReturnType<typeof getShopSessionPolicy>;
    try { supabase = getSupabase(); policy = getShopSessionPolicy(); }
    catch { setFailed(true); return; }

    const schedule = () => {
      clearTimeout(timer);
      const remaining = policy?.remaining();
      if (remaining != null) timer = setTimeout(() => void sync(), remaining + 1);
    };
    const apply = (next: Session | null) => {
      if (!active) return;
      latest = next && policy?.accepts(next.access_token) ? next : null;
      setSession(latest);
      setExpired(!latest && policy?.reason() === "expired");
      setFailed(false);
      schedule();
    };
    const sync = async () => {
      const request = ++version;
      // This also checks elapsed wall time after a sleeping/background tab.
      if (policy?.remaining() == null) { apply(null); return; }
      try {
        const {data, error} = await supabase.auth.getSession();
        if (!active || request !== version) return;
        if (error) throw error;
        apply(data.session);
      } catch { if (active && request === version) { latest = null; setSession(null); setFailed(true); } }
    };
    const changed = () => {
      if (latest && policy?.accepts(latest.access_token)) { schedule(); return; }
      // Hide private content before waiting for auth or a network refresh.
      latest = null;
      setSession(null);
      void sync();
    };
    const storageChanged = (event: StorageEvent) => {
      if (event.key === null || event.key === policy?.policyKey) changed();
    };
    const activity = (event: Event) => {
      if (event.isTrusted && document.visibilityState === "visible") {
        policy?.activity();
        changed();
      }
    };
    const visible = () => { if (document.visibilityState === "visible") void sync(); };
    const focused = () => { void sync(); };
    const {data: {subscription}} = supabase.auth.onAuthStateChange((event, next) => {
      ++version;
      apply(next);
      if (event === "SIGNED_IN" && next && policy?.accepts(next.access_token) && /[?&]code=/.test(window.location.search)) {
        const url = new URL(window.location.href);
        url.searchParams.delete("code");
        window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
      }
    });
    window.addEventListener(SHOP_SESSION_EVENT, changed);
    window.addEventListener("storage", storageChanged);
    window.addEventListener("focus", focused);
    document.addEventListener("visibilitychange", visible);
    const inputs = ["pointerdown", "keydown", "wheel", "touchstart"];
    inputs.forEach(name => window.addEventListener(name, activity, {passive: true, capture: true}));
    // Wait for SDK initialization (including an OAuth code exchange) once.
    const request = ++version;
    supabase.auth.getSession().then(({data, error}) => {
      if (!active || request !== version) return;
      if (error) setFailed(true); else apply(data.session);
    }).catch(() => { if (active && request === version) setFailed(true); });
    return () => {
      active = false;
      ++version;
      clearTimeout(timer);
      subscription.unsubscribe();
      window.removeEventListener(SHOP_SESSION_EVENT, changed);
      window.removeEventListener("storage", storageChanged);
      window.removeEventListener("focus", focused);
      document.removeEventListener("visibilitychange", visible);
      inputs.forEach(name => window.removeEventListener(name, activity, {capture: true}));
    };
  }, [configured, retry]);

  if (!configured) return <p className="form-status form-status-error" role="alert">{t("notConfigured")}</p>;

  return <div className="shop">
    <div className="shop-account">
      {session && <div className="shop-account-who">
        <span className="t-mono">{t("signedInAs")}</span>
        <span className="shop-account-email">{session.user.email ?? t("checkout.signedInAccount")}</span>
      </div>}
      <nav className="shop-account-nav" aria-label={h("navigation")}>
        <Link href="/shop" aria-current={page === "shop" ? "page" : undefined}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M5 7h14l1 14H4L5 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/></svg>
          {h("shop")}
        </Link>
        <Link href="/shop/orders" aria-current={page === "orders" ? "page" : undefined}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z"/><path d="M9 7h6M9 11h6M9 15h4"/></svg>
          {h("title")}
        </Link>
        {session && <button type="button" onClick={signOutShop}>{t("signOut")}</button>}
      </nav>
    </div>
    {failed ? <div className="card" role="alert"><p>{t("errNetwork")}</p><button className="btn btn-outline btn-sm" onClick={() => {setFailed(false);setRetry(n => n+1);}}>{t("tryAgain")}</button></div>
      : session === undefined ? <div className="card shop-skeleton" aria-busy="true"><span className="shop-flow-spinner" aria-hidden="true" /><span>{t("loadingAccount")}</span></div>
      : session ? children(session) : <>{expired && <p className="form-status shop-session-notice" role="status">{t("sessionExpired")}</p>}<SignIn purpose={page} /></>}
  </div>;
}
