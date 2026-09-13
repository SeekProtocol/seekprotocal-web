"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { BaseWalletMultiButton, useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useTurnstile } from "@/lib/use-turnstile";
import {
  abortOrder,
  buildOrderTransaction,
  CheckoutError,
  confirmOrder,
  createOrder,
  formatSol,
  formatUsd,
  isWalletRejection,
  looksInsufficient,
  orderExpired,
  quoteOrder,
  sleep,
  CONFIRM_ATTEMPTS,
  CONFIRM_INTERVAL_MS,
  ORDER_TTL_MS,
  SHOP_PRODUCTS,
  type ShopOrder,
  type ShopProduct,
} from "@/lib/shop/checkout";

type ErrorKey =
  | "errCheckoutUnavailable"
  | "errArenaUnavailable"
  | "errBuildRefused"
  | "errRateLimited"
  | "errOrderExpired"
  | "errUnknownAction"
  | "errUnknownProduct"
  | "errAccountBlocked"
  | "errUnauthorized"
  | "errWalletRejected"
  | "errInsufficient"
  | "errWalletFailed"
  | "errNetwork"
  | "errCaptcha"
  | "errGeneric";

/**
 * The purchase as a state machine. Every phase names what the page is
 * waiting on, and the two terminal phases after a broadcast, `paid` and
 * `pending`, are the only two the page is allowed to end a payment in: a
 * signature that went out is never reported as a failure.
 */
type Flow =
  | { phase: "idle" }
  | { phase: "creating"; product: ShopProduct }
  | { phase: "ready"; product: ShopProduct; order: ShopOrder }
  | { phase: "signing"; product: ShopProduct; order: ShopOrder }
  | { phase: "confirming"; product: ShopProduct; order: ShopOrder; signature: string; attempt: number }
  | { phase: "paid"; product: ShopProduct; order: ShopOrder; signature: string }
  | { phase: "pending"; product: ShopProduct; order: ShopOrder; signature: string }
  | { phase: "cancelled" }
  | { phase: "error"; code: ErrorKey };

/** A quote older than this is shown as possibly moved. The order's own price is fixed regardless. */
const QUOTE_FRESH_MS = 3 * 60_000;
/** How long to wait for the Turnstile widget to hand over a token before giving up. */
const TOKEN_WAIT_MS = 25_000;

function errorKeyFor(error: unknown): ErrorKey {
  if (error instanceof CheckoutError) {
    switch (error.code) {
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
      case "unauthorized":
        return "errUnauthorized";
      case "captcha":
        return "errCaptcha";
      case "network":
        return "errNetwork";
      default:
        return "errGeneric";
    }
  }
  if (isWalletRejection(error)) return "errWalletRejected";
  if (looksInsufficient(error)) return "errInsufficient";
  return "errGeneric";
}

export default function Storefront({ onSettled }: { onSettled: () => void }) {
  const t = useTranslations("shop");
  const locale = useLocale();
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { containerRef, token, armed, arm, reset } = useTurnstile();

  /* One quote fixes the SOL per USD cent; the three shelf prices are derived
     from it. A Turnstile token verifies once, so quoting all three would cost
     three challenges for one number. The order's own amount comes from the
     server at create time and is what the wallet is asked to pay. */
  const [rate, setRate] = useState<{ lamportsPerCent: number; at: number } | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState<ErrorKey | null>(null);
  const [flow, setFlow] = useState<Flow>({ phase: "idle" });
  const [now, setNow] = useState(() => Date.now());

  /* The token is state so the widget re-renders the page; the async flows
     below read it through a ref so they see the value at the moment they ask. */
  const tokenRef = useRef(token);
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);
  const liveRef = useRef(true);
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
    arm();
  }, [arm]);

  const waitForToken = useCallback(async (): Promise<string> => {
    if (!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) return "";
    arm();
    const deadline = Date.now() + TOKEN_WAIT_MS;
    while (Date.now() < deadline) {
      if (tokenRef.current) return tokenRef.current;
      await sleep(200);
    }
    throw new CheckoutError("captcha");
  }, [arm]);

  const refreshQuote = useCallback(async () => {
    setQuoting(true);
    setQuoteError(null);
    try {
      const tokenValue = await waitForToken();
      const quote = await quoteOrder(SHOP_PRODUCTS[0].id, tokenValue);
      reset();
      const base = quote.priceUsdCents || SHOP_PRODUCTS[0].priceUsdCents;
      if (liveRef.current) setRate({ lamportsPerCent: Number(quote.lamports) / base, at: Date.now() });
    } catch (error) {
      reset();
      if (liveRef.current) setQuoteError(errorKeyFor(error));
    } finally {
      if (liveRef.current) setQuoting(false);
    }
  }, [waitForToken, reset]);

  const quotedOnce = useRef(false);
  useEffect(() => {
    if (quotedOnce.current) return;
    quotedOnce.current = true;
    void refreshQuote();
  }, [refreshQuote]);

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
    async (product: ShopProduct) => {
      if (!publicKey) {
        setVisible(true);
        return;
      }
      setFlow({ phase: "creating", product });
      try {
        const tokenValue = await waitForToken();
        const order = await createOrder(product.id, tokenValue);
        reset();
        if (!liveRef.current) return;
        if (order.settled) {
          setFlow({ phase: "paid", product, order, signature: "" });
          onSettled();
          return;
        }
        setFlow({ phase: "ready", product, order });
      } catch (error) {
        reset();
        if (liveRef.current) setFlow({ phase: "error", code: errorKeyFor(error) });
      }
    },
    [publicKey, setVisible, waitForToken, reset, onSettled],
  );

  const pay = useCallback(async () => {
    if (flow.phase !== "ready") return;
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
      signature = await sendTransaction(transaction, connection);
    } catch (error) {
      if (isWalletRejection(error)) {
        /* A refusal inside the wallet never broadcast. */
        void abortOrder(order.orderId, "wallet_cancelled");
        if (liveRef.current) setFlow({ phase: "cancelled" });
      } else if (liveRef.current) {
        /* Anything else may have reached the network. The reference is the
           record and the server's reconciler the judge, so the order stays. */
        setFlow({
          phase: "error",
          code: looksInsufficient(error) ? "errInsufficient" : "errWalletFailed",
        });
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
            setFlow({ phase: "paid", product, order, signature });
            onSettled();
          }
          return;
        }
      } catch {
        /* The server's reconciler also checks the persisted reference. */
      }
      await sleep(CONFIRM_INTERVAL_MS);
    }
    if (liveRef.current) setFlow({ phase: "pending", product, order, signature });
  }, [flow, publicKey, connection, sendTransaction, setVisible, onSettled]);

  const cancel = useCallback(() => {
    if (flow.phase !== "ready") return;
    void abortOrder(flow.order.orderId, "user_cancelled");
    setFlow({ phase: "idle" });
  }, [flow]);

  const resetFlow = useCallback(() => setFlow({ phase: "idle" }), []);

  const busy =
    flow.phase === "creating" ||
    flow.phase === "ready" ||
    flow.phase === "signing" ||
    flow.phase === "confirming";
  const stale = rate ? now - rate.at > QUOTE_FRESH_MS : false;
  const selectedId = "product" in flow ? flow.product.id : null;
  const timeFormat = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" });
  const solFor = (product: ShopProduct) =>
    rate ? formatSol(BigInt(Math.round(rate.lamportsPerCent * product.priceUsdCents)), 5) : null;

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
  if (rate) {
    rateLine = t("rateFrom", { time: timeFormat.format(rate.at) });
    if (stale) rateLine = `${rateLine} ${t("rateStale")}`;
  } else if (quoteError) {
    rateLine = t(quoteError);
  } else {
    rateLine = quoting ? t("refreshing") : t("rateNone");
  }

  return (
    <div className="shop-stack">
      <section className="card shop-panel">
        <p className="eyebrow">{t("productsEyebrow")}</p>
        <h2 className="t-h3">{t("productsTitle")}</h2>
        <div className="shop-products">
          {SHOP_PRODUCTS.map((product) => {
            const sol = solFor(product);
            return (
              <article
                key={product.id}
                className="shop-product"
                data-selected={selectedId === product.id || undefined}
                data-featured={product.packs === 5 || undefined}
              >
                <p className="t-mono">{t(product.key)}</p>
                <p className="t-num shop-product-packs">{t("packs", { count: product.packs })}</p>
                <div className="shop-product-price">
                  <span className="shop-product-usd">{formatUsd(product.priceUsdCents, locale)}</span>
                  <span className="shop-product-sol">
                    {sol ? t("solApprox", { sol }) : t("solPending")}
                  </span>
                </div>
                <p className="t-small text-muted shop-product-per">
                  {product.packs > 1
                    ? t("perPack", {
                        price: formatUsd(Math.round(product.priceUsdCents / product.packs), locale),
                      })
                    : " "}
                </p>
                <button
                  type="button"
                  className={`btn ${connected ? "btn-brand" : "btn-outline"}`}
                  disabled={busy}
                  onClick={() => void startOrder(product)}
                >
                  {connected ? t("buy") : t("connectToBuy")}
                </button>
              </article>
            );
          })}
        </div>
        <div className="shop-rate">
          <div className="stack gap-xs">
            <p className="t-small" aria-live="polite">
              {rateLine}
            </p>
            <p className="shop-rate-note">{t("rateNote")}</p>
          </div>
          <button
            type="button"
            className={`btn btn-sm ${stale || !rate ? "btn-brand" : "btn-outline"}`}
            disabled={quoting || busy}
            onClick={() => void refreshQuote()}
          >
            {quoting ? t("refreshing") : t("refreshRate")}
          </button>
        </div>
      </section>

      <section className="card shop-panel">
        <p className="eyebrow">{t("walletEyebrow")}</p>
        <h2 className="t-h3">{t("walletTitle")}</h2>
        <p className="t-body text-muted">{t("walletLead")}</p>
        <div className="shop-wallet-row">
          <BaseWalletMultiButton labels={walletLabels} />
        </div>
        {/* In the tree only once armed. Refs are attached before effects run,
            so the node exists by the time the widget renders into it. */}
        {armed && <div ref={containerRef} className="cf-turnstile shop-turnstile" />}
        <p className="form-note">{t("verificationNote")}</p>
        <FlowView flow={flow} now={now} onPay={pay} onCancel={cancel} onReset={resetFlow} />
      </section>
    </div>
  );
}

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

  if (flow.phase === "creating" || flow.phase === "signing") {
    return (
      <div className="shop-flow" role="status" aria-live="polite">
        <div className="shop-flow-box">
          <p className="shop-flow-row">
            <span className="shop-flow-spinner" aria-hidden="true" />
            <span>{flow.phase === "creating" ? t("flowCreating") : t("flowSigning")}</span>
          </p>
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
          <p className="t-small text-muted">{t("flowFor", { product: t(flow.product.key) })}</p>
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
          {flow.phase === "paid"
            ? t("flowPaid", { count: flow.product.packs })
            : t("flowPending")}
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
