"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { Session } from "@supabase/supabase-js";
import { Link } from "@/i18n/navigation";
import { getSupabase, supabaseConfigured } from "@/lib/supabase-browser";
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
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!configured) return;
    const supabase = getSupabase();
    let active = true;
    let authChanged = false;
    const {data: {subscription}} = supabase.auth.onAuthStateChange((event, next) => {
      if (!active) return;
      authChanged = true;
      setSession(next);
      setFailed(false);
      if (event === "SIGNED_IN" && /[?&]code=/.test(window.location.search)) {
        window.history.replaceState(null, "", window.location.pathname);
      }
    });
    supabase.auth.getSession().then(({data, error}) => {
      if (!active || authChanged) return;
      if (error) setFailed(true);
      else setSession(data.session);
    }).catch(() => { if (active && !authChanged) setFailed(true); });
    return () => { active = false; subscription.unsubscribe(); };
  }, [configured, retry]);

  if (!configured) return <p className="form-status form-status-error" role="alert">{t("notConfigured")}</p>;

  return <div className="shop">
    <div className="shop-account">
      {session && <div className="shop-account-who">
        <span className="t-mono">{t("signedInAs")}</span>
        <span className="shop-account-email">{session.user.email ?? t("checkout.signedInAccount")}</span>
      </div>}
      <nav className="shop-account-nav" aria-label={h("navigation")}>
        <Link href="/shop" aria-current={page === "shop" ? "page" : undefined}>{h("shop")}</Link>
        <Link href="/shop/orders" aria-current={page === "orders" ? "page" : undefined}>{h("title")}</Link>
        {session && <button type="button" onClick={() => void getSupabase().auth.signOut()}>{t("signOut")}</button>}
      </nav>
    </div>
    {failed ? <div className="card" role="alert"><p>{t("errNetwork")}</p><button className="btn btn-outline btn-sm" onClick={() => {setFailed(false);setRetry(n => n+1);}}>{t("tryAgain")}</button></div>
      : session === undefined ? <div className="card shop-skeleton" aria-busy="true"><span className="shop-flow-spinner" aria-hidden="true" /><span>{t("loadingAccount")}</span></div>
      : session ? children(session) : <SignIn purpose={page} />}
  </div>;
}
