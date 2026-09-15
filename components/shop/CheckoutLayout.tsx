"use client";

import { useId, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { checkoutContext, CheckoutError, type CheckoutSelection, type ShopProduct } from "@/lib/shop/checkout";

import ProductCatalog, {ProductArt,productName} from "./ProductCatalog";
import { accountCheckError } from "@/lib/shop/account-check-error";
import { cartTotal, canSetQuantity, type CartItem } from "@/lib/shop/cart";
import { formatPrice } from "@/lib/shop/catalog";

export interface CheckoutLayoutProps {
  products: ShopProduct[]; catalogFailed?: boolean; catalogNotice?: ReactNode;
  items: CartItem[]; onQuantity: (product: ShopProduct, quantity: number) => void;
  quotedTotal?: {priceCents:number;currency:"usd"|"eur"} | null;
  onSol: () => void; onRadom: () => void; onRefresh: () => void;
  busy: boolean; connected: boolean; quoting: boolean; rateLine: string;
  sol: string | null; quoteError: boolean; wallet?: ReactNode; verification?: ReactNode;
  verificationNote?: string | null; flow?: ReactNode;
  email?: string; name?: string; selection?: CheckoutSelection | null;
  onSelection?: (selection: CheckoutSelection | null) => void;
  resolveContext?: typeof checkoutContext;
}

export function CheckoutLayout({products,catalogFailed=false,catalogNotice,items,onQuantity,quotedTotal,onSol,onRadom,onRefresh,busy,connected,quoting,rateLine,sol,
  wallet,verification,verificationNote,flow,email="",name:knownName="",selection,onSelection,resolveContext=checkoutContext}: CheckoutLayoutProps) {
  const t = useTranslations("shop");
  const c = useTranslations("shop.checkout");
  const locale = useLocale();
  const id = useId();
  const [contactEmail,setContactEmail] = useState(email);
  const [friendsId,setFriendsId] = useState("");
  const [stage,setStage] = useState<"details" | "payment">("details");
  const [method,setMethod] = useState<"radom" | "sol">("radom");
  const [checking,setChecking] = useState(false);
  const [error,setError] = useState<string | null>(null);
  const total = cartTotal(items) ?? quotedTotal;
  const totalLabel = total ? formatPrice(total,locale) : items.length ? c("calculating") : formatPrice({priceCents:0,currency:"usd"},locale);
  const payable = items.length>0 && !!total;
  const locked = busy || checking || catalogFailed;
  const paying = stage === "payment" && !!selection;

  // Contact comes from the signed-in session. Resolve the recipient once when
  // continuing, rather than on every quantity change (which can hit lookup limits).
  const changeDetails = () => { onSelection?.(null); setError(null); setStage("details"); };
  const continueToPayment = async () => {
    if (locked || !payable) return;
    setChecking(true); setError(null);
    const requestId=crypto.randomUUID();
    try {
      const context=await resolveContext(friendsId,knownName,requestId,items);
      onSelection?.({friends_id:context.friends_id,customer_name:context.name,expected_recipient_id:context.beneficiary_id,request_id:requestId,context});
      setContactEmail(context.email ?? email);
      setStage("payment");
    } catch (cause) {
      const code=cause instanceof CheckoutError ? cause.code : "network";
      const message=accountCheckError(code);
      setError(message.scope === "shop" ? t(message.key) : c(message.key));
      if (process.env.NODE_ENV === "development") console.warn("[shop] account check failed", {code,status:cause instanceof CheckoutError ? cause.status : undefined,requestId});
    } finally { setChecking(false); }
  };

  return <><ProductCatalog products={products} items={items} disabled={locked} onQuantity={(product,quantity)=>{onQuantity(product,quantity);changeDetails();}} /><div className="checkout-layout">
    <div className="checkout-main">
      <nav className="checkout-steps" aria-label={c("steps")}>
        <span>Seekprotocol Shop</span><span aria-hidden="true">/</span>
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
        {catalogNotice}
      {error && <p role="alert" className="checkout-error">{error}</p>}
        {!paying && <button className="checkout-primary" type="submit" disabled={locked || !payable}>{checking ? c("checking") : c("continue")} <span aria-hidden="true">→</span></button>}
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
        {!busy && <button type="button" className="checkout-primary" onClick={method === "radom" ? onRadom : onSol} disabled={locked || !payable}>{method === "sol" && !connected ? t("walletConnect") : c("payNow",{price:totalLabel})}<span aria-hidden="true">→</span></button>}
      </section>}
      {verificationNote !== null && <div className="checkout-verification">{verification}</div>}
      {flow}
      <p className="checkout-footer">{c("supportNote")}</p>
    </div>
    <aside className="checkout-summary">
      <div className="checkout-summary-title"><h3>{c("orderSummary")}</h3><span>{c("oneTime")}</span></div>
      {!items.length && <p className="checkout-hint">{t("cart.empty")}</p>}
      {items.map(({product,quantity})=><div className="checkout-line-item" key={product.id}>
        <div className="checkout-item-art" data-kind={product.kind}><ProductArt product={product}/></div>
        <div><strong>{productName(product,n=>t("packs",{count:n}))}</strong><small>{formatPrice(product,locale)} × {quantity}</small>
          <div className="shop-cart-quantity" role="group" aria-label={t("cart.quantity",{product:productName(product,n=>t("packs",{count:n}))})}>
            <button type="button" disabled={locked} aria-label={t("cart.decrease")} onClick={()=>{onQuantity(product,quantity-1);changeDetails();}}>−</button>
            <span aria-live="polite">{quantity}</span>
            <button type="button" disabled={locked || !canSetQuantity(items,product,quantity+1)} aria-label={t("cart.increase")} onClick={()=>{onQuantity(product,quantity+1);changeDetails();}}>+</button>
            <button type="button" disabled={locked} onClick={()=>{onQuantity(product,0);changeDetails();}}>{t("cart.remove")}</button>
          </div>
        </div><strong>{formatPrice({...product,priceCents:product.priceCents*quantity},locale)}</strong>
      </div>)}
      {items.length>0 && !cartTotal(items) && <p className="checkout-hint">{t("cart.conversion")}</p>}
      <dl className="checkout-totals"><div><dt>{c("subtotal")}</dt><dd>{totalLabel}</dd></div><div><dt>{c("delivery")}</dt><dd>{c("toAccount")}</dd></div><div className="checkout-total"><dt>{c("total")}</dt><dd>{totalLabel}</dd></div></dl>
      <p className="checkout-hint">{c("feeNote")}</p>
      <div className="checkout-summary-assurance"><span aria-hidden="true">✓</span><div><strong>{c("linkedDelivery")}</strong><p>{c("linkedDeliveryNote")}</p></div></div>
    </aside>
  </div></>;
}
