"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { Session } from "@supabase/supabase-js";
import { getSupabase, supabaseConfigured } from "@/lib/supabase-browser";
import { recoverOrders } from "@/lib/shop/checkout";
import ShopProviders from "./ShopProviders";
import SignIn from "./SignIn";
import Storefront from "./Storefront";
import PacksPanel from "./PacksPanel";

/**
 * The shop, once it is on the client.
 *
 * Owns the session and nothing else. Signed out it shows the sign-in card;
 * signed in it mounts the wallet providers around the storefront and the
 * packs panel, so the wallet JavaScript is only ever loaded for somebody who
 * can actually buy.
 */
export default function Shop() {
  const t = useTranslations("shop");
  const configured = supabaseConfigured();
  /* undefined while the stored session is being read; null when there is none. */
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  /* Bumped whenever a purchase settles, so the packs panel refetches even if
     the realtime channel is not delivering. */
  const [settledCount, setSettledCount] = useState(0);

  useEffect(() => {
    if (!configured) return;
    const supabase = getSupabase();
    let live = true;
    supabase.auth.getSession().then(({ data }) => {
      if (live) setSession(data.session);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, next) => {
      if (!live) return;
      setSession(next);
      /* The OAuth round trip comes back with ?code= in the address bar. Once
         it has been exchanged, the URL should read as the page it is. */
      if (event === "SIGNED_IN" && /[?&]code=/.test(window.location.search)) {
        window.history.replaceState(null, "", window.location.pathname);
      }
    });
    return () => {
      live = false;
      subscription.unsubscribe();
    };
  }, [configured]);

  /* Once per signed-in account: settle any order an earlier visit created and
     never got to confirm. Fire and forget; a recovered order bumps the panel. */
  const userId = session?.user.id ?? null;
  useEffect(() => {
    if (!userId) return;
    let live = true;
    recoverOrders()
      .then((recovered) => {
        if (live && recovered > 0) setSettledCount((c) => c + 1);
      })
      .catch(() => {
        /* Recovery is a courtesy; the server's reconciler runs regardless. */
      });
    return () => {
      live = false;
    };
  }, [userId]);

  const signOut = useCallback(async () => {
    await getSupabase().auth.signOut();
  }, []);
  const onSettled = useCallback(() => setSettledCount((c) => c + 1), []);

  if (!configured) {
    return (
      <p className="form-status form-status-error" role="alert">
        {t("notConfigured")}
      </p>
    );
  }

  if (session === undefined) {
    return (
      <div className="card shop-skeleton" aria-busy="true">
        <span className="shop-flow-spinner" aria-hidden="true" />
        <span>{t("loadingAccount")}</span>
      </div>
    );
  }

  if (!session) return <SignIn />;

  const metadata = session.user.user_metadata as { full_name?: string } | undefined;
  const who = session.user.email ?? metadata?.full_name ?? session.user.id.slice(0, 8);

  return (
    <div className="shop">
      <div className="shop-account">
        <div className="shop-account-who">
          <span className="t-mono">{t("signedInAs")}</span>
          <span className="shop-account-email">{who}</span>
        </div>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => void signOut()}>
          {t("signOut")}
        </button>
      </div>
      <ShopProviders>
        <div className="shop-layout">
          <Storefront onSettled={onSettled} />
          <PacksPanel userId={session.user.id} refreshKey={settledCount} />
        </div>
      </ShopProviders>
    </div>
  );
}
