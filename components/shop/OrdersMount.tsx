"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

function Loading() {
  const t = useTranslations("shop");
  return <div className="card shop-skeleton" aria-busy="true"><span className="shop-flow-spinner" aria-hidden="true" /><span>{t("loadingAccount")}</span></div>;
}

const Orders = dynamic(() => import("./Orders"), {ssr: false, loading: Loading});

export default function OrdersMount() { return <Orders />; }
