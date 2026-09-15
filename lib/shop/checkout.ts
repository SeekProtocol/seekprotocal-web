import { cartRequest, type CartItem } from "./cart";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { getSupabase, getShopSessionPolicy, SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase-browser";
import { isLocalShopDevelopment } from "@/lib/shop/local-development";

/**
 * The web side of the app's `solana-checkout` edge function.
 *
 * Mirrors `lib/solana/checkout.ts` in the app repo, on the browser's wallet
 * adapter instead of a mobile signer. The server owns the price: this file
 * never proposes an amount, it names a product and pays what comes back.
 *
 * Every call carries the player's Supabase session and `x-app-distribution:
 * web`. In production the two calls `quote_order` and
 * `create_order`, also carry a Turnstile token in `x-turnstile-token`; the
 * server verifies it in place of the app's device attestation. A token is
 * good for one verification, so the widget is reset after each of those.
 * Local development uses a server-signed relay instead of a browser challenge.
 *
 * The second way to pay goes through the `radom-checkout` function: the same
 * headers and the same error codes, but the money moves on Radom's hosted
 * page rather than in a wallet the site can see. `createRadomOrder` hands
 * back a URL to leave for; `radomOrderStatus` is what the page asks when the
 * player comes back.
 */

export type { ShopProduct } from "./catalog";

/** How long the server holds a created order's price. */
export const ORDER_TTL_MS = 5 * 60_000;
/** A Radom order stays open this long; the hosted page carries its own clock. */
export const RADOM_ORDER_TTL_MS = 30 * 60_000;
/** confirm_order is polled this many times, this far apart, before the page stops claiming anything. */
export const CONFIRM_ATTEMPTS = 12;
export const CONFIRM_INTERVAL_MS = 2500;

export type CheckoutCode =
  | "pass_unavailable" | "pass_already_owned" | "pass_order_pending"
  | "invalid_cart" | "catalog_changed"
  | "friends_id_invalid" | "recipient_changed" | "checkout_details_required" | "order_preparing" | "request_conflict"
  | "checkout_unavailable"
  | "arena_unavailable"
  | "checkout_not_available_in_this_build"
  | "rate_limited"
  | "order_expired"
  | "unknown_action"
  | "unknown_product"
  | "account_blocked"
  | "order_unknown"
  | "quote_unavailable"
  | "radom_unavailable"
  | "unauthorized"
  | "captcha"
  | "network"
  | "unknown";

const KNOWN_CODES: ReadonlySet<string> = new Set<CheckoutCode>([
  "pass_unavailable", "pass_already_owned", "pass_order_pending",
  "invalid_cart", "catalog_changed",
  "friends_id_invalid", "recipient_changed", "checkout_details_required", "order_preparing", "request_conflict",
  "checkout_unavailable",
  "arena_unavailable",
  "checkout_not_available_in_this_build",
  "rate_limited",
  "order_expired",
  "unknown_action",
  "unknown_product",
  "account_blocked",
  "order_unknown",
  "quote_unavailable",
  "radom_unavailable",
  "network",
]);

export class CheckoutError extends Error {
  constructor(
    readonly code: CheckoutCode,
    readonly status?: number,
    message?: string,
    readonly orderId?: string,
  ) {
    super(message ?? code);
    this.name = "CheckoutError";
  }
}

function codeFrom(raw: string, status: number): CheckoutCode {
  if (KNOWN_CODES.has(raw)) return raw as CheckoutCode;
  if (status === 401) return "unauthorized";
  if (status === 429 || /rate_limit|too_many/i.test(raw)) return "rate_limited";
  if (/expired/i.test(raw)) return "order_expired";
  if (/unavailable|not_available|paused/i.test(raw)) return "checkout_unavailable";
  return "unknown";
}

type CheckoutFunction = "solana-checkout" | "radom-checkout";

async function call(
  body: Record<string, unknown>,
  turnstileToken?: string,
  fn: CheckoutFunction = "solana-checkout",
  timeoutMs = 20_000,
): Promise<Record<string, unknown>> {
  const {
    data: { session },
  } = await getSupabase().auth.getSession();
  if (!session || !getShopSessionPolicy()?.accepts(session.access_token)) throw new CheckoutError("unauthorized", 401);

  let res: Response;
  try {
    const endpoint = isLocalShopDevelopment()
      ? `/api/shop/dev-checkout?function=${fn}`
      : `${SUPABASE_URL}/functions/v1/${fn}`;
    res = await fetch(endpoint, {
      method: "POST",
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        apikey: SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
        "x-app-distribution": "web",
        ...(turnstileToken ? { "x-turnstile-token": turnstileToken } : {}),
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new CheckoutError("network");
  }

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const raw = typeof data.error === "string" ? data.error : "";
    throw new CheckoutError(codeFrom(raw, res.status), res.status, raw || `http_${res.status}`, typeof data.order_id === "string" ? data.order_id : undefined);
  }
  return data;
}

const wholeNumber = (x: unknown) => /^\d+$/.test(String(x));
const cents = (x: unknown) =>
  Number.isSafeInteger(Number(x)) && Number(x) >= 0 ? Number(x) : 0;

export interface ShopQuote {
  productId: string;
  priceCents: number;
  currency: "usd" | "eur";
  priceUsdCents: number;
  /** Lamports for the whole price at this moment. */
  lamports: bigint;
}

export interface ShopOrder {
  orderId: string;
  productId: string;
  lamports: bigint;
  recipient: string;
  reference: string;
  expiresAt: string;
  priceUsdCents: number;
  coinCents: number;
  solCents: number;
  /** True only when something other than SOL already paid. The web never sends coins, so this stays false. */
  settled: boolean;
}

/** What a product costs in SOL right now. The coins the server also offers are for the app; the web pays in SOL only. */
export async function quoteOrder(items: CartItem[], turnstileToken: string): Promise<ShopQuote> {
  const data = await call({ action: "quote_order", items: cartRequest(items) }, turnstileToken);
  if (!wholeNumber(data.amount) || BigInt(String(data.amount)) <= BigInt(0)) {
    throw new CheckoutError("quote_unavailable");
  }
  return {
    productId: String(data.product_id),
    priceCents: cents(data.price_cents),
    currency: data.currency === "eur" ? "eur" : "usd",
    priceUsdCents: cents(data.price_usd_cents),
    lamports: BigInt(String(data.amount)),
  };
}

/** Make the order. All in SOL: `coins` is empty on purpose. */
export async function createOrder(items: CartItem[], turnstileToken: string, checkout: CheckoutSelection, total: {priceCents:number;currency:"usd"|"eur"}): Promise<ShopOrder> {
  const data = await call(
    { action: "create_order", items: cartRequest(items), coins: [], expected_total:{price_cents:total.priceCents,currency:total.currency}, ...checkoutBody(checkout) },
    turnstileToken,
  );
  const settled = data.settled === true;
  if (!wholeNumber(data.amount) || (!settled && BigInt(String(data.amount)) <= BigInt(0))) {
    throw new CheckoutError("checkout_unavailable");
  }
  if (!settled && (!looksLikeAddress(data.recipient) || !looksLikeAddress(data.reference))) {
    throw new CheckoutError("checkout_unavailable");
  }
  return {
    orderId: String(data.order_id),
    productId: String(data.product_id ?? "seekar_cart"),
    lamports: BigInt(String(data.amount)),
    recipient: String(data.recipient),
    reference: String(data.reference),
    expiresAt: String(data.expires_at),
    priceUsdCents: cents(data.price_usd_cents),
    coinCents: cents(data.coin_cents),
    solCents: cents(data.sol_cents),
    settled,
  };
}

/** One check. The caller polls; see CONFIRM_ATTEMPTS. */
export async function confirmOrder(orderId: string, signature: string): Promise<boolean> {
  const data = await call({ action: "confirm_order", order_id: orderId, signature });
  return data.ok === true && data.status === "paid";
}

/** Settles any earlier order the page never got to confirm. Called once per sign-in. */
export async function recoverOrders(): Promise<number> {
  const data = await call({ action: "recover_orders" });
  return Number(data.recovered ?? 0);
}

/** For a wallet step that failed before anything was broadcast. Best effort: the server's reconciler expires it regardless. */
export async function abortOrder(orderId: string, reason: string): Promise<void> {
  try {
    await call({ action: "abort_order", order_id: orderId, reason: reason.slice(0, 120) });
  } catch {
    /* The reconciler refunds it after expiry either way. */
  }
}

export interface RadomOrder {
  orderId: string;
  /** Where to send the browser. Radom's hosted page; the site never renders it. */
  checkoutUrl: string;
  expiresAt: string;
  priceUsdCents: number;
}

export type RadomStatus = "paid" | "pending" | "closed";

/**
 * A Radom order for one product. `returnPath` is the shop's own path, from
 * `/`; the server turns it into the success and cancel URLs Radom sends the
 * player back to, both carrying `?order=<id>`.
 */
export async function createRadomOrder(
  items: CartItem[],
  turnstileToken: string,
  returnPath: string,
  checkout: CheckoutSelection,
  total: {priceCents:number;currency:"usd"|"eur"},
): Promise<RadomOrder> {
  const data = await call(
    { action: "create", items: cartRequest(items), return_path: returnPath, expected_total:{price_cents:total.priceCents,currency:total.currency}, ...checkoutBody(checkout) },
    turnstileToken,
    "radom-checkout",
  );
  const checkoutUrl = typeof data.checkout_url === "string" ? data.checkout_url : "";
  if (!data.order_id || !/^https:\/\//.test(checkoutUrl)) {
    throw new CheckoutError("radom_unavailable");
  }
  return {
    orderId: String(data.order_id),
    checkoutUrl,
    expiresAt: String(data.expires_at),
    priceUsdCents: cents(data.price_usd_cents),
  };
}

/**
 * One check after the player is back from Radom. The caller polls, as for
 * confirm_order. `closed` is Radom's cancelled or expired; the server also
 * hears about a payment by webhook, so `paid` can arrive on the first ask.
 */
export async function radomOrderStatus(orderId: string): Promise<RadomStatus> {
  const data = await call({ action: "status", order_id: orderId }, undefined, "radom-checkout");
  if (data.status === "paid" && data.ok === true) return "paid";
  if (data.status === "closed") return "closed";
  return "pending";
}

export function orderExpired(order: ShopOrder, now = Date.now()): boolean {
  const at = Date.parse(order.expiresAt);
  return !Number.isFinite(at) || now >= at;
}

/**
 * The transaction the wallet signs: one transfer from the player to the
 * treasury, with the order's reference key on the instruction so the server
 * can find the payment by reference rather than by trusting a signature it
 * was told about. Non-signer, non-writable, exactly as the app appends it.
 */
export function buildOrderTransaction(input: {
  order: ShopOrder;
  payer: PublicKey;
  blockhash: string;
  lastValidBlockHeight: number;
}): Transaction {
  const transfer = SystemProgram.transfer({
    fromPubkey: input.payer,
    toPubkey: new PublicKey(input.order.recipient),
    lamports: input.order.lamports,
  });
  transfer.keys.push({
    pubkey: new PublicKey(input.order.reference),
    isSigner: false,
    isWritable: false,
  });
  const tx = new Transaction({
    feePayer: input.payer,
    blockhash: input.blockhash,
    lastValidBlockHeight: input.lastValidBlockHeight,
  });
  tx.add(transfer);
  return tx;
}

function looksLikeAddress(x: unknown): boolean {
  return typeof x === "string" && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(x);
}

/** A refusal inside the wallet, as opposed to a failure after it. */
export function isWalletRejection(error: unknown): boolean {
  const e = error as { name?: string; message?: string; code?: number } | null;
  if (!e) return false;
  if (e.code === 4001) return true;
  const text = `${e.name ?? ""} ${e.message ?? ""}`;
  return /reject|denied|declin|cancel|user refused|dismiss/i.test(text);
}

export function looksInsufficient(error: unknown): boolean {
  const message = (error as { message?: string } | null)?.message ?? "";
  return /insufficient|0x1\b|not enough/i.test(message);
}

/** Lamports to a SOL string with at most `maxFraction` decimals, trailing zeros dropped. */
export function formatSol(lamports: bigint, maxFraction = 6): string {
  const perSol = BigInt(1_000_000_000);
  const whole = lamports / perSol;
  let fraction = (lamports % perSol).toString().padStart(9, "0").slice(0, maxFraction);
  fraction = fraction.replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : `${whole}`;
}

export function formatUsd(centsValue: number, locale: string): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency: "USD" }).format(centsValue / 100);
}

export const sleep = (ms: number) => new Promise<void>((done) => setTimeout(done, ms));

export interface CheckoutContext {
  email: string | null; name: string; friends_id: string; buyer_id: string;
  beneficiary_id: string; beneficiary_name: string; beneficiary_code: string | null; is_self: boolean;
}
export interface CheckoutSelection {
  friends_id: string; customer_name: string; expected_recipient_id: string; request_id: string; context: CheckoutContext;
}
function checkoutBody(value: CheckoutSelection) {
  return {friends_id:value.friends_id,customer_name:value.customer_name,expected_recipient_id:value.expected_recipient_id,request_id:value.request_id};
}
export async function checkoutContext(friendsId: string, name: string, requestId?: string, items?: CartItem[]): Promise<CheckoutContext> {
  const data=await call({action:"checkout_context",...(items?.length ? {items:cartRequest(items)} : {}),friends_id:friendsId,customer_name:name,request_id:requestId},undefined,"radom-checkout");
  if (typeof data.beneficiary_id !== "string" || typeof data.beneficiary_name !== "string") throw new CheckoutError("checkout_unavailable");
  return data as unknown as CheckoutContext;
}

/** Client observations support investigation but can never confirm payment or delivery. */
export async function recordCheckoutEvent(orderId: string, event: "wallet_opened" | "wallet_rejected" | "wallet_uncertain" | "transaction_submitted" | "redirect_started", signature?: string): Promise<void> {
  await call({action:"client_event",order_id:orderId,event,signature},undefined,"radom-checkout",3000).catch(() => undefined);
}

/** Total is available independently of the optional SOL wallet payment method. */
export async function quoteCart(items: CartItem[], token: string) {
  const data=await call({action:"quote_cart",items:cartRequest(items)},token,"radom-checkout");
  if (!Number.isSafeInteger(data.price_cents) || Number(data.price_cents)<=0 || !["usd","eur"].includes(String(data.currency))) throw new CheckoutError("quote_unavailable");
  return {priceCents:Number(data.price_cents),currency:data.currency as "usd"|"eur"};
}
