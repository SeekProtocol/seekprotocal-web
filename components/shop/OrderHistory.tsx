"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getSupabase } from "@/lib/supabase-browser";
import {receiptPrice} from "@/lib/shop/catalog";
import { productName } from "@/lib/shop/product-copy";
import { orderProgress } from "@/lib/shop/order-status";
import {fetchOrderPage, HISTORY_PAGE_SIZE, historyAction, receiptItems, type HistoryOrder, type OrderCursor} from "@/lib/shop/order-history";
import {confirmOrder, radomOrderStatus, resumeRadomCheckout} from "@/lib/shop/checkout";
import { OrderReceiptView } from "./OrderReceipt";
import ProductArt from "./ProductArt";
import styles from "./OrderHistory.module.css";
export type {HistoryOrder} from "@/lib/shop/order-history";

type ActionResult = 'paid'|'pending'|'closed'|'redirect';
type RunAction = (order:HistoryOrder,action:'resume'|'check')=>Promise<ActionResult>;
const runAction:RunAction=async(order,action)=>{
  if(action==='resume'){
    const result=await resumeRadomCheckout(order.id);
    if(result.checkoutUrl){window.location.assign(result.checkoutUrl);return 'redirect';}
    return result.status;
  }
  return order.mint==='RADOM' ? radomOrderStatus(order.id) : await confirmOrder(order.id,order.signature??'') ? 'paid' : 'pending';
};

export default function OrderHistory({userId}: {userId: string}) {
  const [orders, setOrders] = useState<HistoryOrder[] | null>(null);
  const [pages, setPages] = useState<(OrderCursor | null)[]>([null]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const top = useRef<HTMLDivElement>(null);
  const cursor = pages[page];
  useEffect(() => {
    let active=true,inFlight=false;let controller:AbortController|undefined;
    const load=async()=>{
      if(inFlight)return;
      inFlight=true;controller=new AbortController();
      const timeout=setTimeout(()=>controller?.abort(),12000);
      try{
        const result=await fetchOrderPage(getSupabase(),userId,cursor,controller.signal);
        if(!active)return;
        setOrders(result.orders);setHasNext(result.hasNext);setFailed(false);setUpdatedAt(new Date());
      }catch{if(active)setFailed(true);}
      finally{clearTimeout(timeout);inFlight=false;if(active)setLoading(false);}
    };
    void load();
    const onVisible=()=>{if(document.visibilityState==='visible')void load();};
    const interval=setInterval(onVisible,20000);
    document.addEventListener('visibilitychange',onVisible);
    return()=>{active=false;controller?.abort();clearInterval(interval);document.removeEventListener('visibilitychange',onVisible);};
  },[userId,cursor,tick]);
  const refresh=()=>{setLoading(true);setTick(n=>n+1);};
  const movePage=(next:number)=>{
    if(loading||next<0)return;
    if(next>page){
      const last=orders?.at(-1);if(!hasNext||!last)return;
      setPages(current=>[...current.slice(0,page+1),{created_at:last.created_at,id:last.id}]);
    }
    setPage(next);setOrders(null);setHasNext(false);setUpdatedAt(null);setLoading(true);setFailed(false);
    top.current?.scrollIntoView({block:'start',behavior:'instant'});
  };
  return <div ref={top} className={styles.anchor}><OrderHistoryView orders={orders} failed={failed} loading={loading} updatedAt={updatedAt}
    page={page+1} hasNext={hasNext} onRefresh={refresh} onPrevious={()=>movePage(page-1)} onNext={()=>movePage(page+1)} /></div>;
}

export function OrderHistoryView({orders,failed,loading,updatedAt,page,hasNext,onRefresh,onPrevious,onNext,onAction=runAction}: {
  orders:HistoryOrder[]|null;failed:boolean;loading:boolean;updatedAt:Date|null;page:number;hasNext:boolean;
  onRefresh:()=>void;onPrevious:()=>void;onNext:()=>void;onAction?:RunAction;
}){
  const t=useTranslations('shop'),h=useTranslations('shop.history');const locale=useLocale();
  return <div className={styles.history} aria-busy={loading}>
    <div className={styles.toolbar}><div><strong>{h('overview')}</strong><p>{updatedAt?h('updated',{time:new Intl.DateTimeFormat(locale,{hour:'2-digit',minute:'2-digit'}).format(updatedAt)}):h('autoUpdate')}</p></div>
      <button className={styles.quietButton} type="button" onClick={onRefresh} disabled={loading}><span aria-hidden="true">↻</span>{loading?h('loading'):t('checkout.refreshStatus')}</button></div>
    {failed&&<p className={styles.notice} role="alert">{h('loadFailed')}</p>}
    {!orders&&loading&&<div className={styles.empty}><span className="shop-flow-spinner" aria-hidden="true"/>{h('loading')}</div>}
    {orders?.length===0&&<div className={styles.empty}><h2>{h('emptyTitle')}</h2><p>{h('emptyLead')}</p><Link href="/shop" className="btn btn-brand">{h('shop')}</Link></div>}
    {!!orders?.length&&<ul className={styles.list}>{orders.map(order=><OrderCard key={order.id} order={order} onRefresh={onRefresh} onAction={onAction}/>)}</ul>}
    {orders&&<nav className={styles.pagination} aria-label={h('pagination')}>
      <span className={styles.pageCount}>{h('pageSize',{count:HISTORY_PAGE_SIZE})}</span>
      <div><button className={styles.quietButton} type="button" disabled={page===1||loading} onClick={onPrevious}><span aria-hidden="true">←</span>{h('previous')}</button>
        <span aria-live="polite">{h('page',{page})}</span><button className={styles.quietButton} type="button" disabled={!hasNext||loading} onClick={onNext}>{h('next')}<span aria-hidden="true">→</span></button></div>
    </nav>}
    <p className={styles.help}>{t('checkout.supportNote')}</p>
  </div>;
}

function OrderCard({order,onRefresh,onAction}:{order:HistoryOrder;onRefresh:()=>void;onAction:RunAction}){
  const t=useTranslations('shop'),h=useTranslations('shop.history');const locale=useLocale();
  const [busy,setBusy]=useState(false);const [message,setMessage]=useState<string|null>(null);
  const items=receiptItems(order),progress=orderProgress(order),action=historyAction(order);
  const summary=items.slice(0,2).map(({product,quantity})=>`${quantity>1?`${quantity} × `:''}${productName(product,t)}`).join(' · ');
  const run=async()=>{
    if(busy||!action||action==='reorder')return;
    setBusy(true);setMessage(null);
    try{const result=await onAction(order,action);if(result!=='redirect'){setMessage(h(`actionResult.${result}`));onRefresh();}}
    catch{setMessage(h('actionFailed'));}finally{setBusy(false);}
  };
  return <li className={styles.card}>
    <div className={styles.cardHeader}><div className={styles.reference}><strong>{h('orderShort',{reference:order.id.slice(0,8).toUpperCase()})}</strong><time dateTime={order.created_at}>{new Intl.DateTimeFormat(locale,{dateStyle:'medium',timeStyle:'short'}).format(new Date(order.created_at))}</time></div>
      <div className={styles.price}><strong>{receiptPrice(order,locale)}</strong><span>{order.mint==='RADOM'?'Radom':'Solana'}</span></div></div>
    <div className={styles.productSummary}><div className={styles.thumbnails} aria-hidden="true">{items.slice(0,3).map(({product})=><div key={product.id} className={styles.thumbnail}><ProductArt product={product}/></div>)}</div>
      <div><h2>{summary||h('purchase')}</h2>{items.length>2&&<p>{h('moreProducts',{count:items.length-2})}</p>}
        <p>{h('recipient',{name:order.checkout_snapshot?.beneficiary_name||t('checkout.yourAccount')})}</p></div></div>
    <div className={styles.cardFooter}><div className={styles.statuses}>
      <span className={styles.status} data-state={progress.payment}><i aria-hidden="true"/>{h(`payment.${progress.payment}`)}</span>
      <span className={styles.delivery}>{h(`delivery.${progress.delivery}`)}</span></div>
      {action==='reorder'?<Link className={styles.quietButton} href={`/shop?reorder=${encodeURIComponent(order.id)}`}>{h('reorder')}<span aria-hidden="true">↗</span></Link>
        :action&&<button type="button" className={action==='resume'?styles.primaryButton:styles.quietButton} disabled={busy} onClick={()=>void run()}>{busy?h('checkingPayment'):h(action==='resume'?'resume':'checkPayment')}<span aria-hidden="true">→</span></button>}
    </div>
    {message&&<p className={styles.notice} role="status">{message}</p>}
    {progress.delivery==='processing'&&<p className={styles.notice}>{h('paidNotDelivered')}</p>}
    <details className={styles.details}><summary>{h('viewDetails')}<span aria-hidden="true">⌄</span></summary>
      <OrderReceiptView receipt={order} orderId={order.id} failed={false} loading={false} onRefresh={onRefresh} embedded/>
    </details>
  </li>;
}
