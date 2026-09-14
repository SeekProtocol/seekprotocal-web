"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { recoverOrders } from "@/lib/shop/checkout";
import ShopAccount from "./ShopAccount";
import ShopProviders from "./ShopProviders";
import Storefront from "./Storefront";
import PacksPanel from "./PacksPanel";

export default function Shop() {
  return <ShopAccount>{session => <SignedInShop key={session.user.id} session={session} />}</ShopAccount>;
}

function SignedInShop({session}: {session: Session}) {
  const [settledCount, setSettledCount] = useState(0);
  useEffect(() => {
    let active = true;
    recoverOrders().then(recovered => {
      if (active && recovered > 0) setSettledCount(n => n + 1);
    }).catch(() => { /* The server reconciler also checks unfinished orders. */ });
    return () => { active = false; };
  }, [session.user.id]);
  const onSettled = useCallback(() => setSettledCount(n => n + 1), []);
  const metadata = session.user.user_metadata as { full_name?: string } | undefined;

  return <ShopProviders>
    <div className="shop-commerce">
      <Storefront onSettled={onSettled} email={session.user.email} name={metadata?.full_name} />
      <PacksPanel userId={session.user.id} refreshKey={settledCount} />
    </div>
  </ShopProviders>;
}
