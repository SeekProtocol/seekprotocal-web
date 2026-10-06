"use client";
import {useEffect,useState} from 'react';
import {useLocale,useTranslations} from 'next-intl';
import {getSupabase} from '@/lib/supabase-browser';
import {formatPrice,receiptPrice} from '@/lib/shop/catalog';
import {receiptItems,type Receipt} from '@/lib/shop/order-history';
import {productName} from '@/lib/shop/product-copy';
import {orderProgress} from '@/lib/shop/order-status';
import ProductArt from './ProductArt';
import {formatPaymentAmount,paymentAssetForMint} from '@/lib/shop/payment-assets';
import styles from './OrderHistory.module.css';
export type {Receipt} from '@/lib/shop/order-history';

export default function OrderReceipt({orderId,refreshKey}:{orderId:string;refreshKey?:string}){
 const [receipt,setReceipt]=useState<Receipt|null>(null),[failed,setFailed]=useState(false),[loading,setLoading]=useState(true),[refresh,setRefresh]=useState(0);
 useEffect(()=>{
  let active=true;const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);
  let poll:ReturnType<typeof setTimeout>|undefined;
  void (async()=>{
   try{
    const {data,error}=await getSupabase().from('solana_orders').select('id,status,fulfilled_at,paid_at,price_usd_cents,created_at,signature,checkout_snapshot,product_snapshot,mint,amount_base_units,payment_protocol,payment_received_base_units,payment_review_reason,payment_amount_text,payment_received_text').eq('id',orderId).abortSignal(controller.signal).maybeSingle();
    if(active){setFailed(!!error||!data);setReceipt(data as Receipt|null);if(data&&!data.fulfilled_at)poll=setTimeout(()=>setRefresh(n=>n+1),15_000);}
   }catch{if(active)setFailed(true);}finally{clearTimeout(timeout);if(active)setLoading(false);}
  })();
  return()=>{active=false;controller.abort();clearTimeout(timeout);clearTimeout(poll);};
 },[orderId,refreshKey,refresh]);
 return <OrderReceiptView receipt={receipt} orderId={orderId} failed={failed} loading={loading} onRefresh={()=>{setLoading(true);setRefresh(n=>n+1);}}/>;
}

export function OrderReceiptView({receipt,orderId,failed,loading,onRefresh,embedded=false}:{receipt:Receipt|null;orderId:string;failed:boolean;loading:boolean;onRefresh:()=>void;embedded?:boolean}){
 const t=useTranslations('shop'),c=useTranslations('shop.checkout'),h=useTranslations('shop.history'),locale=useLocale();
 const dates=new Intl.DateTimeFormat(locale,{dateStyle:'medium',timeStyle:'short'}),items=receipt?receiptItems(receipt):[],progress=receipt?orderProgress(receipt):null;
 const mixed=new Set(items.map(i=>i.product.currency)).size>1;
 const asset=receipt?.mint ? paymentAssetForMint(receipt.mint) : null;
 return <section className={embedded?undefined:styles.receipt} aria-live="polite">
  {!embedded&&<div className={styles.receiptHeader}><h3>{c('receipt')}</h3><button className={styles.quietButton} type="button" disabled={loading} onClick={onRefresh}>{c('refreshStatus')}</button></div>}
  {failed?<p className={styles.notice} role="alert">{c('receiptFailed')}</p>:receipt?<>
   <div className={styles.detailsBody}>
    <ul className={styles.items}>{items.map(({product,quantity})=><li key={product.id} className={styles.item}><div className={styles.thumbnail} aria-hidden="true"><ProductArt product={product}/></div><div><strong>{productName(product,t)}</strong><small>{h('quantity',{count:quantity})}</small></div><span className={styles.itemPrice}>{formatPrice({priceCents:product.priceCents*quantity,currency:product.currency},locale)}</span></li>)}</ul>
    <dl className={styles.facts}>
     <div className={styles.total}><dt>{c('total')}</dt><dd>{receiptPrice(receipt,locale)}</dd></div>
     {!embedded&&<><div><dt>{h('paymentLabel')}</dt><dd>{h(`payment.${progress!.payment}`)}</dd></div><div><dt>{h('deliveryLabel')}</dt><dd>{h(`delivery.${progress!.delivery}`)}</dd></div></>}
     <div><dt>{c('orderNumber')}</dt><dd><code>{orderId}</code></dd></div>
     {asset&&receipt?.payment_protocol&&<div><dt>{t('direct.received')}</dt><dd>{formatPaymentAmount(BigInt(receipt.payment_received_text??receipt.payment_received_base_units??0),asset)} / {formatPaymentAmount(BigInt(receipt.payment_amount_text??receipt.amount_base_units??0),asset)} {asset}</dd></div>}
     {receipt.paid_at&&<div><dt>{h('paidAt')}</dt><dd>{dates.format(new Date(receipt.paid_at))}</dd></div>}
     {receipt.fulfilled_at&&<div><dt>{h('deliveredAt')}</dt><dd>{dates.format(new Date(receipt.fulfilled_at))}</dd></div>}
     {receipt.checkout_snapshot?.beneficiary_name&&<div><dt>{c('receivingAccount')}</dt><dd>{receipt.checkout_snapshot.beneficiary_name}{receipt.checkout_snapshot.beneficiary_code&&<><br/>#{receipt.checkout_snapshot.beneficiary_code}</>}</dd></div>}
     {receipt.checkout_snapshot?.email&&<div><dt>{c('contact')}</dt><dd>{receipt.checkout_snapshot.email}</dd></div>}
    </dl>
    {mixed&&<p className={styles.currencyNote}>{h('currencyNote')}</p>}
   </div>
   {receipt.payment_review_reason&&<p className={styles.notice}>{t('direct.review')}</p>}
   {!embedded&&!receipt.fulfilled_at&&!receipt.payment_review_reason&&<p className={styles.notice}>{c(progress?.payment==='failed'||progress?.payment==='expired'?'closedOrder':'pendingNote')}</p>}
  </>:<p className={styles.notice}>{c('loadingReceipt')}</p>}
 </section>;
}
