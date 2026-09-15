"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getSupabase } from "@/lib/supabase-browser";
import {formatPrice,receiptPrice} from "@/lib/shop/catalog";
import { orderProgress } from "@/lib/shop/order-status";

export interface Receipt {
  id: string; status: string; fulfilled_at: string | null; paid_at: string | null;
  price_usd_cents: number | null; created_at: string; signature: string | null;
  product_snapshot?: {items?:{id:string;name:string;quantity:number;price_cents:number;currency:"usd"|"eur"}[];price_cents?:number;currency?:string;name?:string;fulfillment?:{kind?:string;packs?:number}} | null;
  checkout_snapshot: {email?: string;beneficiary_name?: string;beneficiary_code?: string} | null;
}

export default function OrderReceipt({orderId,refreshKey}: {orderId:string;refreshKey?:string}) {
  const [receipt,setReceipt]=useState<Receipt | null>(null);
  const [failed,setFailed]=useState(false);
  const [loading,setLoading]=useState(false);
  const [refresh,setRefresh]=useState(0);
  useEffect(() => {
    let active=true;
    getSupabase().from("solana_orders")
      .select("id,status,fulfilled_at,paid_at,price_usd_cents,created_at,signature,checkout_snapshot,product_snapshot")
      .eq("id",orderId).maybeSingle().then(({data,error}) => {
        if (!active) return;
        setFailed(!!error || !data);setReceipt(data as Receipt | null);setLoading(false);
      });
    return () => {active=false;};
  },[orderId,refreshKey,refresh]);
  return <OrderReceiptView receipt={receipt} orderId={orderId} failed={failed} loading={loading} onRefresh={() => {setLoading(true);setRefresh(n => n+1);}} />;
}

export function OrderReceiptView({receipt,orderId,failed,loading,onRefresh}: {receipt:Receipt|null;orderId:string;failed:boolean;loading:boolean;onRefresh:()=>void}) {
  const c=useTranslations("shop.checkout");
  const h=useTranslations("shop.history");
  const locale=useLocale();
  const progress=receipt ? orderProgress(receipt) : null;
  const dateFormat=new Intl.DateTimeFormat(locale,{dateStyle:"medium",timeStyle:"short"});
  return <section className="checkout-receipt" aria-live="polite">
    <div className="checkout-summary-title"><h3>{c("receipt")}</h3><button type="button" disabled={loading} onClick={onRefresh}>{c("refreshStatus")}</button></div>
    <p className="checkout-order-reference">{c("orderNumber")}<code>{orderId}</code></p>
    {failed ? <p role="alert">{c("receiptFailed")}</p> : receipt ? <>
      <ol className="checkout-delivery-status">
        <li data-done="true"><span aria-hidden="true">✓</span>{c("orderSaved")}</li>
        <li data-done={progress?.payment === "paid"}><span aria-hidden="true">{progress?.payment === "paid" ? "✓" : "2"}</span>{h(`payment.${progress!.payment}`)}</li>
        <li data-done={!!receipt.fulfilled_at}><span aria-hidden="true">{receipt.fulfilled_at ? "✓" : "3"}</span>{h(`delivery.${progress!.delivery}`)}</li>
      </ol>
      {receipt.product_snapshot?.items && <ul className="checkout-cart-receipt">{receipt.product_snapshot.items.map(item=><li key={item.id}>{item.quantity} × {item.name} <strong>{formatPrice({priceCents:item.price_cents*item.quantity,currency:item.currency},locale)}</strong></li>)}</ul>}
      <dl className="checkout-receipt-details"><div><dt>{c("total")}</dt><dd>{receiptPrice(receipt,locale)}</dd></div>
        <div><dt>{h("orderedAt")}</dt><dd>{dateFormat.format(new Date(receipt.created_at))}</dd></div>
        {receipt.paid_at && <div><dt>{h("paidAt")}</dt><dd>{dateFormat.format(new Date(receipt.paid_at))}</dd></div>}
        {receipt.fulfilled_at && <div><dt>{h("deliveredAt")}</dt><dd>{dateFormat.format(new Date(receipt.fulfilled_at))}</dd></div>}
        {receipt.checkout_snapshot?.beneficiary_name && <div><dt>{c("receivingAccount")}</dt><dd>{receipt.checkout_snapshot.beneficiary_name}{receipt.checkout_snapshot.beneficiary_code && ` · #${receipt.checkout_snapshot.beneficiary_code}`}</dd></div>}
        {receipt.checkout_snapshot?.email && <div><dt>{c("contact")}</dt><dd>{receipt.checkout_snapshot.email}</dd></div>}
      </dl>
      {receipt.status === "failed" || receipt.status === "expired" ? <p className="checkout-hint">{c("closedOrder")}</p> : !receipt.fulfilled_at && <p className="checkout-hint">{c("pendingNote")}</p>}
    </> : <p>{c("loadingReceipt")}</p>}
  </section>;
}
