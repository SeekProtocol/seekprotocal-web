"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

function ShopSkeleton() {
  const t = useTranslations("shop");
  return (
    <div className="card shop-skeleton" aria-busy="true">
      <span className="shop-flow-spinner" aria-hidden="true" />
      <span>{t("loadingAccount")}</span>
    </div>
  );
}

/**
 * `ssr: false` is only allowed in a client component, and this file exists to
 * be that boundary (the ninth pass in HANDOVER.md records why). The shop reads
 * the session out of localStorage and the wallet adapter reads window, neither
 * of which a server render has; and web3.js plus the adapter is a lot of
 * JavaScript to put in front of a crawler that only wants the heading.
 */
const Shop = dynamic(() => import("./Shop"), { ssr: false, loading: ShopSkeleton });

export default function ShopMount() {
  return <Shop />;
}
