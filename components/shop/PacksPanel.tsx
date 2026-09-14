"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { getSupabase } from "@/lib/supabase-browser";

interface Credit {
  id: string;
  ordinal: number;
  created_at: string;
}

/** Inventory remains in checkout; the complete history has its own page. */
async function fetchCredits(userId: string): Promise<Credit[] | null> {
  const result = await getSupabase().from("arena_pack_credits")
    .select("id, ordinal, created_at").eq("user_id", userId).is("consumed_at", null)
    .order("ordinal", {ascending: true});
  return result.error ? null : (result.data ?? []) as Credit[];
}

export default function PacksPanel({ userId, refreshKey }: { userId: string; refreshKey: number }) {
  const [credits, setCredits] = useState<Credit[] | null>(null);
  const [live, setLive] = useState(false);
  /* Bumped by the realtime channel; the fetch effect keys on it. */
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchCredits(userId).then((result) => {
      if (cancelled) return;
      if (result) setCredits(result);
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

  return <PacksPanelView count={credits?.length ?? null} live={live} />;
}

export function PacksPanelView({ count, live }: { count: number | null; live: boolean }) {
  const t = useTranslations("shop");

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
        <p className="eyebrow">{t("history.title")}</p>
        <p className="t-small text-muted">{t("history.shortLead")}</p>
        <Link href="/shop/orders" className="btn btn-outline btn-sm">{t("history.viewOrders")} <span aria-hidden="true">→</span></Link>
      </section>
    </aside>
  );
}
