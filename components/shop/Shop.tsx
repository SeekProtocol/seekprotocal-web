"use client";

import { useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import { recoverOrders } from "@/lib/shop/checkout";
import ShopAccount from "./ShopAccount";
import ShopProviders from "./ShopProviders";
import Storefront from "./Storefront";

export default function Shop() {
  return <ShopAccount>{session => <SignedInShop key={session.user.id} session={session} />}</ShopAccount>;
}

function SignedInShop({session}: {session: Session}) {
  useEffect(() => {
    void recoverOrders().catch(() => { /* The server reconciler also checks unfinished orders. */ });
  }, [session.user.id]);
  const metadata = session.user.user_metadata as { full_name?: string } | undefined;

  return <ShopProviders>
    <div className="shop-commerce">
      <Storefront email={session.user.email} name={metadata?.full_name} />
    </div>
  </ShopProviders>;
}
