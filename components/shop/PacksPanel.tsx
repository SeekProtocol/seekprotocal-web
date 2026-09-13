"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { getSupabase } from "@/lib/supabase-browser";
import { formatUsd, productById } from "@/lib/shop/checkout";

interface Credit {
  id: string;
  ordinal: number;
  created_at: string;
}

interface Order {
  id: string;
  product_id: string;
  status: "pending" | "paid" | "expired" | "failed";
  price_usd_cents: number | null;
  created_at: string;
}

const STATUS_KEY = {
  pending: "statusPending",
  paid: "statusPaid",
  expired: "statusExpired",
  failed: "statusFailed",
} as const;

/**
 * What the account holds: unopened pack credits and the last ten orders.
 *
 * Both tables let a player read their own rows and nothing else, so the
 * queries carry no filter beyond the user id, for clarity rather than for
 * safety. The credits are also watched over realtime, so the count moves the
 * moment a payment settles; `refreshKey` covers the case where the channel
 * is not delivering, since the storefront bumps it on every settlement.
 */
async function fetchAccount(userId: string): Promise<{ credits: Credit[] | null; orders: Order[] | null }> {
  const supabase = getSupabase();
  const [c, o] = await Promise.all([
    supabase
      .from("arena_pack_credits")
      .select("id, ordinal, created_at")
      .eq("user_id", userId)
      .is("consumed_at", null)
      .order("ordinal", { ascending: true }),
    supabase
      .from("solana_orders")
      .select("id, product_id, status, price_usd_cents, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);
  return {
    credits: c.error ? null : ((c.data ?? []) as Credit[]),
    orders: o.error ? null : ((o.data ?? []) as Order[]),
  };
}

export default function PacksPanel({ userId, refreshKey }: { userId: string; refreshKey: number }) {
  const [credits, setCredits] = useState<Credit[] | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [live, setLive] = useState(false);
  /* Bumped by the realtime channel; the fetch effect keys on it. */
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchAccount(userId).then((result) => {
      if (cancelled) return;
      if (result.credits) setCredits(result.credits);
      if (result.orders) setOrders(result.orders);
    });
    return () => {
      cancelled = true;
    };
  }, [userId, refreshKey, tick]);

  useEffect(() => {
    const supabase = getSupabase();
    const channel = supabase
      .channel(`arena_pack_credits:${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "arena_pack_credits", filter: `user_id=eq.${userId}` },
        () => setTick((n) => n + 1),
      )
      .subscribe((status) => setLive(status === "SUBSCRIBED"));
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  return <PacksPanelView count={credits?.length ?? null} orders={orders} live={live} />;
}

export function PacksPanelView({ count, orders, live }: { count: number | null; orders: Order[]; live: boolean }) {
  const t = useTranslations("shop");
  const locale = useLocale();
  const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });

  return (
    <aside className="shop-stack shop-account-panels">
      <section className="card shop-panel shop-inventory">
        <div className="shop-panel-head">
          <p className="eyebrow">{t("packsEyebrow")}</p>
          {live && <span className="shop-live"><i aria-hidden="true" />{t("packsLive")}</span>}
        </div>
        <div className="shop-packs" aria-live="polite">
          <div className="shop-packs-balance">
            <p className="t-num shop-packs-count">{count === null ? "…" : count}</p>
            <Image src="/app/shop/card-back.png" alt="" width={48} height={68} loading="eager" />
          </div>
          <p className="t-body">{t("packsWaiting", { count: count ?? 0 })}</p>
          <p className="t-small text-muted">{t("packsHint")}</p>
        </div>
      </section>

      <section className="card shop-panel shop-history">
        <p className="eyebrow">{t("ordersEyebrow")}</p>
        {orders.length === 0 ? (
          <div className="shop-orders-empty">
            <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M9 5h14v23l-3-2-4 2-4-2-3 2V5ZM13 11h6m-6 5h6m-6 5h3" /></svg>
            <p className="t-small text-muted">{t("ordersEmpty")}</p>
          </div>
        ) : (
          <ul className="shop-orders">
            {orders.map((order) => {
              const product = productById(order.product_id);
              const centsValue = order.price_usd_cents ?? product?.priceUsdCents ?? null;
              return (
                <li key={order.id} className="shop-order">
                  <span className="shop-order-name">
                    {product ? t(product.key) : order.product_id}
                  </span>
                  <span className="shop-order-status t-mono-sm" data-status={order.status}>
                    {t(STATUS_KEY[order.status] ?? "statusPending")}
                  </span>
                  <span className="shop-order-meta">
                    {centsValue !== null && <span>{formatUsd(centsValue, locale)}</span>}
                    <time dateTime={order.created_at}>{dateFormat.format(new Date(order.created_at))}</time>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </aside>
  );
}
