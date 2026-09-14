"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getSupabase } from "@/lib/supabase-browser";
import {receiptPrice} from "@/lib/shop/catalog";
import { orderProgress } from "@/lib/shop/order-status";
import { OrderReceiptView, type Receipt } from "./OrderReceipt";

export interface HistoryOrder extends Receipt { product_id: string; mint: string; }
type Cursor = {created_at: string; id: string};
const PAGE_SIZE = 20;

export default function OrderHistory({userId}: {userId: string}) {
  const [orders, setOrders] = useState<HistoryOrder[] | null>(null);
  const [pages, setPages] = useState<(Cursor | null)[]>([null]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const top = useRef<HTMLDivElement>(null);
  const cursor = pages[page];

  useEffect(() => {
    let active = true;
    let inFlight = false;
    let controller: AbortController | undefined;
    const load = async () => {
      if (inFlight) return;
      inFlight = true;
      controller = new AbortController();
      const timeout = setTimeout(() => controller?.abort(), 12000);
      try {
        // RLS enforces buyer ownership even if a caller changes userId or the filters.
        let query = getSupabase().from("solana_orders")
          .select("id,product_id,mint,status,paid_at,fulfilled_at,price_usd_cents,created_at,signature,checkout_snapshot,product_snapshot")
          .eq("user_id", userId).eq("channel", "web")
          .order("created_at", {ascending: false}).order("id", {ascending: false});
        // The cursor comes only from a database row; ties use the immutable order UUID.
        if (cursor) query = query.or(`created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.lt.${cursor.id})`);
        const {data, error} = await query.limit(PAGE_SIZE + 1).abortSignal(controller.signal);
        if (!active) return;
        if (error) throw error;
        setOrders((data ?? []).slice(0, PAGE_SIZE) as HistoryOrder[]);
        setHasNext((data?.length ?? 0) > PAGE_SIZE);
        setFailed(false);
        setUpdatedAt(new Date());
      } catch {
        if (active) setFailed(true);
      } finally {
        clearTimeout(timeout);
        inFlight = false;
        if (active) setLoading(false);
      }
    };
    void load();
    const interval = setInterval(() => { if (document.visibilityState === "visible") void load(); }, 20000);
    const onVisible = () => { if (document.visibilityState === "visible") void load(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { active = false; controller?.abort(); clearInterval(interval); document.removeEventListener("visibilitychange", onVisible); };
  }, [userId, cursor, tick]);

  const refresh = () => { setLoading(true); setTick(n => n + 1); };
  const movePage = (next: number) => {
    if (loading || next < 0) return;
    if (next > page) {
      const last = orders?.at(-1);
      if (!hasNext || !last) return;
      setPages(current => [...current.slice(0, page + 1), {created_at:last.created_at,id:last.id}]);
    }
    setPage(next); setOrders(null); setHasNext(false); setUpdatedAt(null); setLoading(true); setFailed(false);
    top.current?.scrollIntoView({block: "start"});
  };

  return <div ref={top} className="order-history-anchor"><OrderHistoryView orders={orders} failed={failed} loading={loading} updatedAt={updatedAt}
    page={page + 1} hasNext={hasNext} onRefresh={refresh}
    onPrevious={() => movePage(page - 1)} onNext={() => movePage(page + 1)} /></div>;
}

export function OrderHistoryView({orders,failed,loading,updatedAt,page,hasNext,onRefresh,onPrevious,onNext}: {
  orders: HistoryOrder[] | null; failed: boolean; loading: boolean; updatedAt: Date | null;
  page: number; hasNext: boolean; onRefresh: () => void; onPrevious: () => void; onNext: () => void;
}) {
  const t = useTranslations("shop");
  const h = useTranslations("shop.history");
  const locale = useLocale();
  const dateFormat = new Intl.DateTimeFormat(locale, {dateStyle: "medium", timeStyle: "short"});
  return <div className="order-history" aria-busy={loading}>
    <div className="order-history-toolbar">
      <p className="t-small text-muted">{updatedAt ? h("updated", {time:dateFormat.format(updatedAt)}) : h("autoUpdate")}</p>
      <button type="button" className="btn btn-outline btn-sm" onClick={onRefresh} disabled={loading}>{loading ? h("loading") : t("checkout.refreshStatus")}</button>
    </div>
    {failed && <p className="order-history-error" role="alert">{h("loadFailed")}</p>}
    {!orders && loading && <div className="card shop-skeleton"><span className="shop-flow-spinner" aria-hidden="true" /><span>{h("loading")}</span></div>}
    {orders?.length === 0 && <div className="card order-history-empty"><span className="order-history-empty-icon" aria-hidden="true">↗</span><h2>{h("emptyTitle")}</h2><p>{h("emptyLead")}</p><Link href="/shop" className="btn btn-brand">{h("shop")}</Link></div>}
    {!!orders?.length && <ul className="order-history-list">{orders.map(order => {
      const product = order.product_snapshot;
      const progress = orderProgress(order);
      return <li className="order-history-card" key={order.id}>
        <div className="order-history-card-heading">
          <div><time dateTime={order.created_at}>{dateFormat.format(new Date(order.created_at))}</time><h2>{product?.fulfillment?.kind === "pack" && product.fulfillment.packs ? t("packs", {count:product.fulfillment.packs}) : product?.name || h("purchase")}</h2></div>
          <div className="order-history-price"><strong>{receiptPrice(order,locale)}</strong><span>{order.mint === "RADOM" ? "Radom" : "Solana"}</span></div>
        </div>
        <dl className="order-history-statuses">
          <div><dt>{h("paymentLabel")}</dt><dd><span className="order-status" data-state={progress.payment}>{h(`payment.${progress.payment}`)}</span></dd></div>
          <div><dt>{h("deliveryLabel")}</dt><dd><span className="order-status" data-state={progress.delivery}>{h(`delivery.${progress.delivery}`)}</span></dd></div>
          <div><dt>{t("checkout.receivingAccount")}</dt><dd>{order.checkout_snapshot?.beneficiary_name || t("checkout.yourAccount")}{order.checkout_snapshot?.beneficiary_code && <small>#{order.checkout_snapshot.beneficiary_code}</small>}</dd></div>
        </dl>
        {progress.delivery === "processing" && <p className="order-history-notice">{h("paidNotDelivered")}</p>}
        <details className="order-history-details"><summary>{t("checkout.receipt")}<span className="order-history-short-ref">#{order.id.slice(0,8)}</span></summary>
          <OrderReceiptView receipt={order} orderId={order.id} failed={false} loading={loading} onRefresh={onRefresh} />
        </details>
      </li>;
    })}</ul>}
    {(page > 1 || hasNext) && <nav className="order-history-pagination" aria-label={h("pagination")}>
      <button type="button" className="btn btn-outline btn-sm" disabled={page === 1 || loading} onClick={onPrevious}>{h("previous")}</button>
      <span>{h("page", {page})}</span>
      <button type="button" className="btn btn-outline btn-sm" disabled={!hasNext || loading} onClick={onNext}>{h("next")}</button>
    </nav>}
    <p className="order-history-help">{t("checkout.supportNote")}</p>
  </div>;
}
