"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cartKey, cartTotal, canSetQuantity, type CartItem } from "@/lib/shop/cart";
import {productName} from "./ProductCatalog";
import { useCatalog } from "@/lib/shop/use-catalog";
import { CheckoutLayout } from "./CheckoutLayout";
import OrderReceipt from "./OrderReceipt";
import { useLocale, useTranslations } from "next-intl";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { BaseWalletMultiButton, useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useTurnstile } from "@/lib/use-turnstile";
import { createVerificationQueue } from "@/lib/shop/verification-queue";
import { isLocalShopDevelopment } from "@/lib/shop/local-development";
import {
  abortOrder,
  buildOrderTransaction,
  CheckoutError,
  confirmOrder,
  createOrder,
  createRadomOrder,
  formatSol,
  isWalletRejection,
  looksInsufficient,
  orderExpired,
  quoteOrder,
  quoteCart,
  radomOrderStatus,
  recordCheckoutEvent,
  sleep,
  CONFIRM_ATTEMPTS,
  CONFIRM_INTERVAL_MS,
  ORDER_TTL_MS,
  type CheckoutSelection,
  type ShopOrder,
} from "@/lib/shop/checkout";

type ErrorKey =
  | "errPassUnavailable" | "errPassOwned" | "errPassPending"
  | "errCart" | "errCatalogChanged"
  | "errRecipient" | "errPreparing"
  | "errCheckoutUnavailable"
  | "errArenaUnavailable"
  | "errBuildRefused"
  | "errRateLimited"
  | "errOrderExpired"
  | "errUnknownAction"
  | "errUnknownProduct"
  | "errAccountBlocked"
  | "login.appRequired"
  | "errUnauthorized"
  | "errWalletRejected"
  | "errInsufficient"
  | "errWalletFailed"
  | "errNetwork"
  | "errCaptcha"
  | "errRadomUnavailable"
  | "errGeneric";

/**
 * The purchase as a state machine. Every phase names what the page is
 * waiting on, and the two terminal phases after a broadcast, `paid` and
 * `pending`, are the only two the page is allowed to end a payment in: a
 * signature that went out is never reported as a failure.
 *
 * The Radom path adds two phases of its own. `redirecting` covers the
 * moment between asking for the order and the browser leaving for the hosted
 * page; `returning` is the poll after the player comes back with `?order=`.
 * It ends in the same `paid`, `pending` and `cancelled` as the wallet, with
 * no signature and, when the browser forgot which bundle it left with, no
 * product either.
 */
type Flow =
  | { phase: "idle" }
  | { phase: "verifying"; product: CartItem[] }
  | { phase: "creating"; product: CartItem[] }
  | { phase: "ready"; product: CartItem[]; order: ShopOrder }
  | { phase: "signing"; product: CartItem[]; order: ShopOrder }
  | { phase: "confirming"; product: CartItem[]; order: ShopOrder; signature: string; attempt: number }
  | { phase: "redirecting"; product: CartItem[] }
  | { phase: "returning"; product: CartItem[] | null; orderId: string; attempt: number }
  | { phase: "paid"; product: CartItem[] | null; signature: string }
  | { phase: "pending"; product: CartItem[] | null; signature: string }
  | { phase: "cancelled" }
  | { phase: "error"; code: ErrorKey };

/** A quote older than this is shown as possibly moved. The order's own price is fixed regardless. */
const QUOTE_FRESH_MS = 3 * 60_000;
/** How long to wait for the Turnstile widget to hand over a token before giving up. */
const TOKEN_WAIT_MS = 25_000;
/** The bundle a Radom order was made for, kept for the return so the paid line can count packs. */

/** Order ids the server hands out. Anything else on the URL is ignored rather than asked about. */
const ORDER_ID_SHAPE = /^[A-Za-z0-9_-]{8,64}$/;

function errorKeyFor(error: unknown): ErrorKey {
  if (error instanceof CheckoutError) {
    switch (error.code) {
      case "pass_unavailable": return "errPassUnavailable";
      case "pass_already_owned": return "errPassOwned";
      case "pass_order_pending": return "errPassPending";
      case "invalid_cart": return "errCart";
      case "catalog_changed": return "errCatalogChanged";
      case "friends_id_invalid":
      case "recipient_changed":
      case "checkout_details_required":
      case "request_conflict": return "errRecipient";
      case "order_preparing": return "errPreparing";
      case "checkout_unavailable":
      case "quote_unavailable":
        return "errCheckoutUnavailable";
      case "arena_unavailable":
        return "errArenaUnavailable";
      case "checkout_not_available_in_this_build":
        return "errBuildRefused";
      case "rate_limited":
        return "errRateLimited";
      case "order_expired":
        return "errOrderExpired";
      case "unknown_action":
        return "errUnknownAction";
      case "unknown_product":
        return "errUnknownProduct";
      case "account_blocked":
        return "errAccountBlocked";
      case "app_account_required":
        return "login.appRequired";
      case "unauthorized":
        return "errUnauthorized";
      case "captcha":
        return "errCaptcha";
      case "network":
        return "errNetwork";
      case "radom_unavailable":
        return "errRadomUnavailable";
      default:
        return "errGeneric";
    }
  }
  if (isWalletRejection(error)) return "errWalletRejected";
  if (looksInsufficient(error)) return "errInsufficient";
  return "errGeneric";
}

export default function Storefront({ onSettled, email, name }: { onSettled?: () => void; email?: string; name?: string }) {
  const t = useTranslations("shop");
  const locale = useLocale();
  const catalog = useCatalog();
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { containerRef, token, error: verificationError, armed, arm, reset } = useTurnstile();
  const [verify] = useState(() => createVerificationQueue());
  const localCheckout = isLocalShopDevelopment();

  // A quote belongs to exactly one product/version and its currency.
  const [rate, setRate] = useState<{key:string;priceCents:number;currency:"usd"|"eur";lamports:bigint;at:number} | null>(null);
  const [totalQuote,setTotalQuote] = useState<{key:string;priceCents:number;currency:"usd"|"eur"}|null>(null);
  const [quoting, setQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState<ErrorKey | null>(null);
  const [flow, setFlow] = useState<Flow>({ phase: "idle" });
  const [quantities, setQuantities] = useState<Record<string,number>>({});
  const products = catalog.products;
  const baseProduct = useMemo(() => (products ?? []).filter(p => quantities[p.id]>0).map(product=>({product,quantity:quantities[product.id]})), [products,quantities]);
  const [selection,setSelection] = useState<CheckoutSelection | null>(null);
  const [receiptId,setReceiptId] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  /* The token is state so the widget re-renders the page; the async flows
     below read it through a ref so they see the value at the moment they ask. */
  const tokenRef = useRef(token);
  const verificationErrorRef = useRef(verificationError);
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);
  useEffect(() => {
    verificationErrorRef.current = verificationError;
  }, [verificationError]);
  const liveRef = useRef(true);
  const paymentBusy = useRef(false);
  useEffect(() => {
    liveRef.current = true;
    return () => {
      liveRef.current = false;
    };
  }, []);

  /* Armed on mount rather than on intent: the reader is signed in, on the shop,
     and the first quote needs it. The homepage caveat in use-turnstile.ts is
     about readers who never asked for a captcha; this one did. */
  useEffect(() => {
    if (!localCheckout) arm();
  }, [arm, localCheckout]);

  const waitForToken = useCallback(async (): Promise<string> => {
    if (!liveRef.current) throw new CheckoutError("network");
    if (localCheckout) return "";
    if (!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) throw new CheckoutError("captcha");
    if (verificationErrorRef.current) {
      verificationErrorRef.current = null;
      tokenRef.current = "";
      reset();
    }
    arm();
    const deadline = Date.now() + TOKEN_WAIT_MS;
    while (liveRef.current && Date.now() < deadline) {
      if (verificationErrorRef.current) throw new CheckoutError("captcha");
      if (tokenRef.current) return tokenRef.current;
      await sleep(200);
    }
    throw new CheckoutError("captcha");
  }, [arm, reset, localCheckout]);

  const runVerified = useCallback(<T,>(request: (value: string) => Promise<T>) =>
    verify(waitForToken, request, () => {
      tokenRef.current = "";
      reset();
    }), [verify, waitForToken, reset]);

  const refreshQuote = useCallback(async () => {
    if (!baseProduct.length) return;
    setQuoting(true);
    setQuoteError(null);
    try {
      const total = await runVerified(value=>quoteCart(baseProduct,value));
      if (liveRef.current) setTotalQuote({key:cartKey(baseProduct),...total});
      const quote = await runVerified((value) => quoteOrder(baseProduct, value));
      if (liveRef.current) setRate({key:cartKey(baseProduct),priceCents:quote.priceCents,currency:quote.currency,lamports:quote.lamports,at:Date.now()});
    } catch (error) {
      if (liveRef.current) setQuoteError(errorKeyFor(error));
    } finally {
      if (liveRef.current) setQuoting(false);
    }
  }, [runVerified, baseProduct]);

  useEffect(() => {
    if (!baseProduct.length || (flow.phase !== 'idle' && flow.phase !== 'error')) return;
    const timer=setTimeout(()=>void refreshQuote(),400);
    return ()=>clearTimeout(timer);
  }, [refreshQuote,baseProduct,flow.phase]);

  /* One clock. A second while an order is being held, so the countdown reads;
     otherwise only often enough to notice the quote going stale. The tick also
     hands back an order that ran out while the wallet was never opened; it
     reads the flow through a ref so the interval need not be rebuilt on every
     state change. */
  const flowRef = useRef(flow);
  useEffect(() => {
    flowRef.current = flow;
  }, [flow]);
  const holding = flow.phase === "ready";
  useEffect(() => {
    const tick = () => {
      const at = Date.now();
      setNow(at);
      const current = flowRef.current;
      if (current.phase === "ready" && orderExpired(current.order, at)) {
        setFlow({ phase: "error", code: "errOrderExpired" });
        void abortOrder(current.order.orderId, "order_expired");
      }
    };
    const id = setInterval(tick, holding ? 1000 : 30_000);
    return () => clearInterval(id);
  }, [holding]);

  const startOrder = useCallback(
    async (product: CartItem[]) => {
      const total=cartTotal(product) ?? (totalQuote?.key===cartKey(product) ? totalQuote : null);
      if (!selection || !product.length || !total || paymentBusy.current) return;
      if (!publicKey) {
        setVisible(true);
        return;
      }
      paymentBusy.current = true;
      setFlow({ phase: "verifying", product });
      try {
        const order = await runVerified((value) => {
          setFlow({ phase: "creating", product });
          return createOrder(product, value, selection, total);
        });
        if (!liveRef.current) return;
        setReceiptId(order.orderId);
        if (order.settled) {
          setFlow({ phase: "paid", product, signature: "" });
          onSettled?.();
          return;
        }
        setFlow({ phase: "ready", product, order });
      } catch (error) {
        if (error instanceof CheckoutError && error.orderId) setReceiptId(error.orderId);
        if (liveRef.current) setFlow({ phase: "error", code: errorKeyFor(error) });
      } finally { paymentBusy.current = false; }
    },
    [publicKey, setVisible, runVerified, onSettled, selection,totalQuote],
  );

  const pay = useCallback(async () => {
    if (flow.phase !== "ready" || paymentBusy.current) return;
    const { product, order } = flow;
    if (!publicKey) {
      setVisible(true);
      return;
    }
    if (orderExpired(order)) {
      setFlow({ phase: "error", code: "errOrderExpired" });
      void abortOrder(order.orderId, "order_expired");
      return;
    }
    paymentBusy.current = true;
    try {
    setFlow({ phase: "signing", product, order });

    /* Everything up to the broadcast can still hand the order back. */
    let transaction;
    try {
      const latest = await connection.getLatestBlockhash("confirmed");
      if (orderExpired(order)) throw new CheckoutError("order_expired");
      transaction = buildOrderTransaction({
        order,
        payer: publicKey,
        blockhash: latest.blockhash,
        lastValidBlockHeight: latest.lastValidBlockHeight,
      });
    } catch (error) {
      void abortOrder(order.orderId, error instanceof CheckoutError ? error.code : "blockhash_failed");
      if (liveRef.current) {
        setFlow({
          phase: "error",
          code: error instanceof CheckoutError ? errorKeyFor(error) : "errNetwork",
        });
      }
      return;
    }

    let signature: string;
    try {
      void recordCheckoutEvent(order.orderId,"wallet_opened");
      signature = await sendTransaction(transaction, connection);
      void recordCheckoutEvent(order.orderId,"transaction_submitted",signature);
    } catch (error) {
      if (isWalletRejection(error)) {
        /* A refusal inside the wallet never broadcast. */
        void recordCheckoutEvent(order.orderId,"wallet_rejected");
        void abortOrder(order.orderId, "wallet_cancelled");
        if (liveRef.current) setFlow({ phase: "cancelled" });
      } else if (liveRef.current) {
        void recordCheckoutEvent(order.orderId,"wallet_uncertain");
        /* Anything else may have reached the network. The reference is the
           record and the server's reconciler the judge, so the order stays. */
        if (looksInsufficient(error)) setFlow({phase:"error",code:"errInsufficient"});
        else setFlow({phase:"pending",product,signature:""});
      }
      return;
    }

    /* Broadcast. From here a network error is an outstanding payment, not a failed purchase. */
    for (let attempt = 1; attempt <= CONFIRM_ATTEMPTS; attempt++) {
      if (!liveRef.current) return;
      setFlow({ phase: "confirming", product, order, signature, attempt });
      try {
        if (await confirmOrder(order.orderId, signature)) {
          if (liveRef.current) {
            setFlow({ phase: "paid", product, signature });
            onSettled?.();
          }
          return;
        }
      } catch {
        /* The server's reconciler also checks the persisted reference. */
      }
      await sleep(CONFIRM_INTERVAL_MS);
    }
    if (liveRef.current) setFlow({ phase: "pending", product, signature });
    } finally { paymentBusy.current = false; }
  }, [flow, publicKey, connection, sendTransaction, setVisible, onSettled]);

  /* The other way to pay. No wallet needed: the order is made here, the
     money moves on Radom's page, and the browser comes back to this path
     with the order id on the URL. The bundle is noted in session storage so
     the paid line can still count packs after the round trip; a browser
     that lost it gets the line without a count. `redirecting` is left
     standing on purpose: the page is unloading. */
  const startRadomOrder = useCallback(
    async (product: CartItem[]) => {
      const total=cartTotal(product) ?? (totalQuote?.key===cartKey(product) ? totalQuote : null);
      if (!selection || !product.length || !total || paymentBusy.current) return;
      paymentBusy.current = true;
      setFlow({ phase: "verifying", product });
      try {
        const order = await runVerified((value) => {
          setFlow({ phase: "creating", product });
          return createRadomOrder(product, value, window.location.pathname, selection, total);
        });
        if (!liveRef.current) return;
        setReceiptId(order.orderId);
        setFlow({ phase: "redirecting", product });
        await recordCheckoutEvent(order.orderId,"redirect_started");
        window.location.assign(order.checkoutUrl);
      } catch (error) {
        if (error instanceof CheckoutError && error.orderId) setReceiptId(error.orderId);
        if (liveRef.current) setFlow({ phase: "error", code: errorKeyFor(error) });
      } finally { paymentBusy.current = false; }
    },
    [runVerified, selection,totalQuote],
  );

  /* Back from Radom. The order may already be paid (the webhook is usually
     ahead of the browser), still open, or closed on Radom's side. The poll
     mirrors the wallet confirm: twelve asks, and the only ends are paid,
     pending and cancelled. A pending order is never a failure, so the copy
     after the last ask says the packs will follow, not "buy again". Only an
     answer that the order is not this account's stops the poll early. */
  const resumeRadomOrder = useCallback(
    async (orderId: string, product: CartItem[] | null) => {
      setReceiptId(orderId);
      for (let attempt = 1; attempt <= CONFIRM_ATTEMPTS; attempt++) {
        if (!liveRef.current) return;
        setFlow({ phase: "returning", product, orderId, attempt });
        try {
          const status = await radomOrderStatus(orderId);
          if (status === "paid") {
            if (liveRef.current) {
              setFlow({ phase: "paid", product, signature: "" });
              onSettled?.();
            }
            return;
          }
          if (status === "closed") {
            if (liveRef.current) setFlow({ phase: "cancelled" });
            return;
          }
        } catch (error) {
          const code = error instanceof CheckoutError ? error.code : null;
          if (code === "order_unknown" || code === "unauthorized" || code === "account_blocked") {
            if (liveRef.current) setFlow({ phase: "error", code: errorKeyFor(error) });
            return;
          }
          /* Anything else is the network; the server's webhook settles it regardless. */
        }
        await sleep(CONFIRM_INTERVAL_MS);
      }
      if (liveRef.current) setFlow({ phase: "pending", product, signature: "" });
    },
    [onSettled],
  );

  /* `?order=<id>` on mount means the browser is back from Radom, with or
     without Radom's `paid=1` hint, which is not trusted: the server is asked
     either way. Retain the order reference while checking it, so an expired
     shop session can sign in again and resume this existing payment. */
  useEffect(() => {
    if (flow.phase !== "paid" && flow.phase !== "cancelled") return;
    const url = new URL(window.location.href);
    url.searchParams.delete("order");
    url.searchParams.delete("paid");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  }, [flow.phase]);
  const resumedOnce = useRef(false);
  useEffect(() => {
    if (resumedOnce.current) return;
    resumedOnce.current = true;
    const url = new URL(window.location.href);
    const orderId = url.searchParams.get("order");
    if (!orderId) return;
    if (!ORDER_ID_SHAPE.test(orderId)) url.searchParams.delete("order");
    url.searchParams.delete("paid");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
    if (!ORDER_ID_SHAPE.test(orderId)) return;

    void resumeRadomOrder(orderId, null);
  }, [resumeRadomOrder, products]);

  const cancel = useCallback(() => {
    if (flow.phase !== "ready") return;
    void abortOrder(flow.order.orderId, "user_cancelled");
    setFlow({ phase: "idle" });
    setSelection(null);
  }, [flow]);

  const resetFlow = useCallback(() => {
    setFlow({ phase: "idle" });
    if (flow.phase === "paid" || flow.phase === "pending") setQuantities({});
    if (flow.phase !== "error" || flow.code === "errOrderExpired") {
      setReceiptId(null);setSelection(null);
    }
  }, [flow]);

  const busy =
    flow.phase === "verifying" ||
    flow.phase === "creating" ||
    flow.phase === "ready" ||
    flow.phase === "signing" ||
    flow.phase === "confirming" ||
    flow.phase === "redirecting" ||
    flow.phase === "returning";
  const stale = rate ? now - rate.at > QUOTE_FRESH_MS : false;
  const activeProduct = busy && "product" in flow && flow.product ? flow.product : baseProduct;
  const timeFormat = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" });
  const solFor = (product: CartItem[]) =>
    rate?.key===cartKey(product) ? formatSol(rate.lamports,5) : null;

  const walletLabels = {
    connecting: t("walletConnecting"),
    "has-wallet": t("walletConnect"),
    "no-wallet": t("walletSelect"),
    "copy-address": t("walletCopy"),
    copied: t("walletCopied"),
    "change-wallet": t("walletChange"),
    disconnect: t("walletDisconnect"),
  };

  let rateLine: string;
  if (rate && rate.key === cartKey(activeProduct)) {
    rateLine = t("rateFrom", { time: timeFormat.format(rate.at) });
    if (stale) rateLine = `${rateLine} ${t("rateStale")}`;
  } else if (quoteError) {
    rateLine = t(quoteError);
  } else {
    rateLine = quoting ? t("refreshing") : t("rateNone");
  }

  const flowView = <><FlowView flow={flow} now={now} onPay={pay} onCancel={cancel} onReset={resetFlow} />{receiptId && <OrderReceipt orderId={receiptId} refreshKey={flow.phase} />}</>;
  const catalogMessage = catalog.failed ? t("catalogFailed") : catalog.loading && !products ? t("catalogLoading") : t("catalogEmpty");
  if (!products?.length) return <div className="card" aria-live="polite"><p>{catalogMessage}</p><button type="button" className="btn btn-outline" disabled={catalog.loading} onClick={catalog.refresh}>{t("tryAgain")}</button>{flowView}</div>;
  return <CheckoutLayout
    products={products ?? []}
    catalogFailed={catalog.failed}
    catalogNotice={(catalog.failed || flow.phase === "error" && flow.code === "errCatalogChanged") && <p role="alert">{catalog.failed ? t("catalogFailed") : t("errCatalogChanged")} <button type="button" className="btn btn-outline btn-sm" disabled={catalog.loading} onClick={() => {catalog.refresh();setSelection(null);setFlow({phase:"idle"});}}>{t("tryAgain")}</button></p>}
    email={email} name={name} selection={selection} onSelection={setSelection}
    items={activeProduct}
    quotedTotal={totalQuote?.key===cartKey(activeProduct) ? totalQuote : null}
    onQuantity={(product,quantity) => {
      if (!canSetQuantity(baseProduct,product,quantity)) return;
      setQuantities(current=>({...current,[product.id]:quantity}));setSelection(null);setReceiptId(null);setFlow({phase:"idle"});
    }}
    onSol={() => void startOrder(activeProduct)}
    onRadom={() => void startRadomOrder(activeProduct)}
    onRefresh={() => void refreshQuote()}
    busy={busy || flow.phase === "paid" || flow.phase === "pending" || flow.phase === "cancelled"}
    connected={connected}
    quoting={quoting}
    rateLine={rateLine}
    sol={solFor(activeProduct)}
    quoteError={!!quoteError}
    wallet={connected && <BaseWalletMultiButton labels={walletLabels} />}
    verificationNote={localCheckout ? null : undefined}
    verification={localCheckout ? null : <>
      {armed && <div ref={containerRef} className="cf-turnstile shop-turnstile" />}
      {verificationError && <div className="shop-verification-error" role="alert">
        <p className="t-small">{t("errCaptcha")}</p>
        <button type="button" className="shop-rate-refresh" disabled={busy || quoting} onClick={() => void refreshQuote()}>{t("tryAgain")}</button>
      </div>}
    </>}
    flow={<>{flow.phase === "error" && selection && !receiptId && <p className="checkout-order-reference">{t("checkout.orderNumber")}<code>{selection.request_id}</code></p>}<FlowView flow={flow} now={now} onPay={pay} onCancel={cancel} onReset={resetFlow} />{receiptId && <OrderReceipt orderId={receiptId} refreshKey={flow.phase} />}</>}
  />;
}

export { CheckoutLayout as StorefrontView } from "./CheckoutLayout";

function FlowView({
  flow,
  now,
  onPay,
  onCancel,
  onReset,
}: {
  flow: Flow;
  now: number;
  onPay: () => void;
  onCancel: () => void;
  onReset: () => void;
}) {
  const t = useTranslations("shop");

  if (flow.phase === "idle") return null;

  if (flow.phase === "verifying" || flow.phase === "creating" || flow.phase === "signing" || flow.phase === "redirecting") {
    const line =
      flow.phase === "verifying"
        ? t("flowVerifying")
        : flow.phase === "creating"
        ? t("flowCreating")
        : flow.phase === "signing"
          ? t("flowSigning")
          : t("flowRedirecting");
    return (
      <div className="shop-flow" role="status" aria-live="polite">
        <div className="shop-flow-box">
          <p className="shop-flow-row">
            <span className="shop-flow-spinner" aria-hidden="true" />
            <span>{line}</span>
          </p>
        </div>
      </div>
    );
  }

  if (flow.phase === "returning") {
    return (
      <div className="shop-flow" role="status" aria-live="polite">
        <div className="shop-flow-box">
          <p className="shop-flow-row">
            <span className="shop-flow-spinner" aria-hidden="true" />
            <span>{t("flowChecking", { attempt: flow.attempt, total: CONFIRM_ATTEMPTS })}</span>
          </p>
          <div className="shop-flow-progress" aria-hidden="true">
            <i style={{ width: `${(flow.attempt / CONFIRM_ATTEMPTS) * 100}%` }} />
          </div>
        </div>
      </div>
    );
  }

  if (flow.phase === "ready") {
    /* Clamped to the TTL: the clock only ticks every 30 s while nothing is
       held, so the first render after "ready" can carry a `now` from before
       the order existed. */
    const expiresAt = Date.parse(flow.order.expiresAt);
    const remaining = Math.min(ORDER_TTL_MS, Math.max(0, expiresAt - now));
    const left = Math.floor(remaining / 1000);
    const fraction = remaining / ORDER_TTL_MS;
    return (
      <div className="shop-flow" role="status" aria-live="polite">
        <div className="shop-flow-box">
          <p className="t-mono">{t("flowReady")}</p>
          <p className="t-num shop-flow-amount">
            {t("flowPay", { sol: formatSol(flow.order.lamports) })}
          </p>
          <p className="t-small text-muted">{t("flowFor", { product: flow.product.map(item=>`${item.quantity} × ${productName(item.product,t)}`).join(" · ") })}</p>
          <p className="t-mono-sm">{t("flowHeld", { seconds: left })}</p>
          <div className="shop-flow-progress" aria-hidden="true">
            <i style={{ width: `${fraction * 100}%` }} />
          </div>
          <div className="shop-flow-row">
            <button type="button" className="btn btn-brand" onClick={onPay}>
              {t("payInWallet")}
            </button>
            <button type="button" className="btn btn-ghost" onClick={onCancel}>
              {t("cancelOrder")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (flow.phase === "confirming") {
    return (
      <div className="shop-flow" role="status" aria-live="polite">
        <div className="shop-flow-box">
          <p className="shop-flow-row">
            <span className="shop-flow-spinner" aria-hidden="true" />
            <span>{t("flowConfirming", { attempt: flow.attempt, total: CONFIRM_ATTEMPTS })}</span>
          </p>
          <div className="shop-flow-progress" aria-hidden="true">
            <i style={{ width: `${(flow.attempt / CONFIRM_ATTEMPTS) * 100}%` }} />
          </div>
        </div>
      </div>
    );
  }

  if (flow.phase === "paid" || flow.phase === "pending") {
    return (
      <div className="shop-flow" role="status" aria-live="polite">
        <p className={`form-status ${flow.phase === "paid" ? "form-status-success" : "shop-flow-pending"}`}>
          {flow.phase !== "paid"
            ? t("flowPending")
            : flow.product
              ? t("checkout.delivered")
              : t("checkout.delivered")}
        </p>
        <div className="shop-flow-row">
          {flow.signature && (
            <a
              className="arrow-link"
              href={`https://solscan.io/tx/${flow.signature}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("viewTransaction")}
            </a>
          )}
          <button type="button" className="btn btn-outline btn-sm" onClick={onReset}>
            {t("flowDone")}
          </button>
        </div>
      </div>
    );
  }

  if (flow.phase === "cancelled") {
    return (
      <div className="shop-flow" role="status" aria-live="polite">
        <p className="form-note">{t("flowCancelled")}</p>
        <div className="shop-flow-row">
          <button type="button" className="btn btn-outline btn-sm" onClick={onReset}>
            {t("flowDone")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-flow">
      <p className="form-status form-status-error" role="alert">
        {t(flow.code)}
      </p>
      <div className="shop-flow-row">
        <button type="button" className="btn btn-outline btn-sm" onClick={onReset}>
          {t("tryAgain")}
        </button>
      </div>
    </div>
  );
}
