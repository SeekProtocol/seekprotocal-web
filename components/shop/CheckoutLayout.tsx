"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { checkoutContext, CheckoutError, formatUsd, SHOP_PRODUCTS, type CheckoutSelection, type ShopProduct } from "@/lib/shop/checkout";

export interface CheckoutLayoutProps {
  selectedProduct: ShopProduct; onSelect: (product: ShopProduct) => void;
  onSol: () => void; onRadom: () => void; onRefresh: () => void;
  busy: boolean; connected: boolean; quoting: boolean; rateLine: string;
  sol: string | null; quoteError: boolean; wallet?: ReactNode; verification?: ReactNode;
  verificationNote?: string | null; flow?: ReactNode;
  email?: string; name?: string; selection?: CheckoutSelection | null;
  onSelection?: (selection: CheckoutSelection | null) => void;
  resolveContext?: typeof checkoutContext;
}

export function CheckoutLayout({selectedProduct,onSelect,onSol,onRadom,onRefresh,busy,connected,quoting,rateLine,sol,
  wallet,verification,verificationNote,flow,email="",name:knownName="",selection,onSelection,resolveContext=checkoutContext}: CheckoutLayoutProps) {
  const t = useTranslations("shop");
  const c = useTranslations("shop.checkout");
  const locale = useLocale();
  const id = useId();
  const [customerName,setCustomerName] = useState(knownName);
  const [contactEmail,setContactEmail] = useState(email);
  const [friendsId,setFriendsId] = useState("");
  const [stage,setStage] = useState<"details" | "payment">("details");
  const [method,setMethod] = useState<"radom" | "sol">("radom");
  const [checking,setChecking] = useState(false);
  const [error,setError] = useState<string | null>(null);
  const locked = busy || checking;
  const paying = stage === "payment" && !!selection;

  useEffect(() => {
    let active=true;
    resolveContext("", "").then(context => {
      if (!active) return;
      setContactEmail(context.email ?? email);
      setCustomerName(current => current || context.name || knownName);
    }).catch(() => { /* The form remains available; continuing validates on the server. */ });
    return () => { active=false; };
  },[email,knownName,resolveContext]);

  const changeDetails = () => { onSelection?.(null); setError(null); setStage("details"); };
  const continueToPayment = async () => {
    if (locked) return;
    setChecking(true); setError(null);
    const requestId=crypto.randomUUID();
    try {
      const context=await resolveContext(friendsId,customerName,requestId);
      onSelection?.({friends_id:context.friends_id,customer_name:context.name,expected_recipient_id:context.beneficiary_id,request_id:requestId,context});
      setContactEmail(context.email ?? email);
      setStage("payment");
    } catch (cause) {
      const code=cause instanceof CheckoutError ? cause.code : "network";
      setError(c(code === "friends_id_invalid" ? "invalidFriend" : code === "arena_unavailable" ? "recipientUnavailable" : "detailsFailed"));
    } finally { setChecking(false); }
  };

  return <div className="checkout-layout">
    <div className="checkout-main">
      <nav className="checkout-steps" aria-label={c("steps")}>
        <span>SeekAR Shop</span><span aria-hidden="true">/</span>
        <button type="button" onClick={() => setStage("details")} disabled={locked} aria-current={!paying ? "step" : undefined}>{c("details")}</button>
        <span aria-hidden="true">/</span><span aria-current={paying ? "step" : undefined}>{c("payment")}</span>
      </nav>
      <div className="checkout-heading"><span className="eyebrow">{c("digitalDelivery")}</span><h2>{!paying ? c("yourDetails") : c("reviewPay")}</h2><p>{c("intro")}</p></div>
      <form onSubmit={event => {event.preventDefault(); void continueToPayment();}}>
        <fieldset className="checkout-fields" disabled={locked}>
          <legend>{c("signedInAccount")}</legend>
          <div className="checkout-contact-summary"><strong>{contactEmail || c("signedInAccount")}</strong></div>
          <div className="checkout-recipient-heading"><h3>{c("deliverTo")}</h3><span>{c("inApp")}</span></div>
          <label htmlFor={`${id}-friend`}>{c("friendsId")} <span>({c("optional")})</span></label>
          <input id={`${id}-friend`} value={friendsId} onChange={event => {setFriendsId(event.target.value.toUpperCase());changeDetails();}} maxLength={9} autoComplete="off" autoCapitalize="characters" spellCheck={false} placeholder="#ABCD1234" aria-describedby={`${id}-friend-note`} aria-invalid={!!error} />
          <p id={`${id}-friend-note`} className="checkout-hint">{c("friendsNote")}</p>
        </fieldset>
        {error && <p role="alert" className="checkout-error">{error}</p>}
        {!paying && <button className="checkout-primary" type="submit" disabled={locked}>{checking ? c("checking") : c("continue")} <span aria-hidden="true">→</span></button>}
      </form>
      {paying && selection && <section className="checkout-payment">
        <div className="checkout-recipient-confirmed" role="status"><span className="checkout-confirmed-icon" aria-hidden="true">✓</span><div><span>{c("receivingAccount")}</span><strong>{selection.context.beneficiary_name}{selection.context.beneficiary_code && ` · #${selection.context.beneficiary_code}`}</strong><small>{selection.context.is_self ? c("yourAccount") : c("otherAccount")}</small></div><button type="button" disabled={locked} onClick={() => setStage("details")}>{c("change")}</button></div>
        <fieldset className="checkout-methods" disabled={locked}>
          <legend>{c("payment")}</legend>
          <label data-selected={method === "radom"}><input type="radio" name={`${id}-method`} checked={method === "radom"} onChange={() => {setMethod("radom");if (selection) onSelection?.({...selection,request_id:crypto.randomUUID()});}} /><span><strong>{t("paymentCrypto")}</strong><small>USDC · USDT · ETH · BTC · SOL</small></span><span className="checkout-method-brand">Radom ↗</span></label>
          <label data-selected={method === "sol"}><input type="radio" name={`${id}-method`} checked={method === "sol"} onChange={() => {setMethod("sol");if (selection) onSelection?.({...selection,request_id:crypto.randomUUID()});}} /><span><strong>{c("solWallet")}</strong><small>Phantom · Solflare · Backpack</small></span><span className="checkout-method-brand">≋ SOL</span></label>
        </fieldset>
        {method === "sol" && <div className="checkout-rate"><span>{sol ? t("solApprox",{sol}) : rateLine}</span><button type="button" disabled={locked || quoting} onClick={onRefresh}>{quoting ? t("refreshing") : t("refreshRate")}</button>{wallet}</div>}
        <p className="checkout-hint">{method === "radom" ? c("radomNote") : c("walletNote")}</p>
        {!busy && <button type="button" className="checkout-primary" onClick={method === "radom" ? onRadom : onSol} disabled={locked}>{method === "sol" && !connected ? t("walletConnect") : c("payNow",{price:formatUsd(selectedProduct.priceUsdCents,locale)})}<span aria-hidden="true">→</span></button>}
      </section>}
      {verificationNote !== null && <div className="checkout-verification">{verification}</div>}
      {flow}
      <p className="checkout-footer">{c("supportNote")}</p>
    </div>
    <aside className="checkout-summary">
      <div className="checkout-summary-title"><h3>{c("orderSummary")}</h3><span>{c("oneTime")}</span></div>
      <div className="checkout-line-item"><div className="checkout-item-art"><Image src="/app/shop/card-back.png" alt="" width={66} height={93} loading="eager" /><span>{selectedProduct.packs}</span></div><div><strong>SeekAR Arena</strong><span>{t("packs",{count:selectedProduct.packs})}</span><small>{c("digitalPacks")}</small></div><strong>{formatUsd(selectedProduct.priceUsdCents,locale)}</strong></div>
      <fieldset className="checkout-bundles" disabled={locked}><legend>{c("bundle")}</legend>{SHOP_PRODUCTS.map(product => <label key={product.id} data-selected={selectedProduct.id === product.id}><input type="radio" name={`${id}-bundle`} checked={selectedProduct.id === product.id} onChange={() => {onSelect(product);changeDetails();}} /><strong>{t("packs",{count:product.packs})}</strong><span>{formatUsd(product.priceUsdCents,locale)}</span>{product.packs > 1 && <small>{t("bundleSaving",{percent:Math.round((1-product.priceUsdCents/(299*product.packs))*100)})}</small>}</label>)}</fieldset>
      <dl className="checkout-totals"><div><dt>{c("subtotal")}</dt><dd>{formatUsd(selectedProduct.priceUsdCents,locale)}</dd></div><div><dt>{c("delivery")}</dt><dd>{c("toAccount")}</dd></div><div className="checkout-total"><dt>{c("total")}</dt><dd>{formatUsd(selectedProduct.priceUsdCents,locale)}</dd></div></dl>
      <p className="checkout-hint">{c("feeNote")}</p>
      <div className="checkout-summary-assurance"><span aria-hidden="true">✓</span><div><strong>{c("linkedDelivery")}</strong><p>{c("linkedDeliveryNote")}</p></div></div>
    </aside>
  </div>;
}
