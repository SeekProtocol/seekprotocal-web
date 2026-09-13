"use client";

import { useEffect, useState } from "react";
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
  const t = useTranslations("shop");
  const locale = useLocale();
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

  const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });
  const count = credits?.length ?? 0;

  return (
    <aside className="shop-stack">
      <section className="card shop-panel">
        <div className="shop-panel-head">
          <p className="eyebrow">{t("packsEyebrow")}</p>
          {live && <span className="chip chip-live">{t("packsLive")}</span>}
        </div>
        <div className="shop-packs" aria-live="polite">
          <p className="t-num shop-packs-count">{credits === null ? "…" : count}</p>
          <p className="t-body">{t("packsWaiting", { count })}</p>
          <p className="t-small text-muted">{t("packsHint")}</p>
        </div>
      </section>

      <section className="card shop-panel">
        <p className="eyebrow">{t("ordersEyebrow")}</p>
        {orders.length === 0 ? (
          <p className="t-small text-muted">{t("ordersEmpty")}</p>
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
