"use client";
import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {OrderHistoryView,type HistoryOrder} from './OrderHistory';
const pack={id:'seekar_pack_five',kind:'pack',name:'5 card packs',quantity:1,price_cents:1299,currency:'usd',fulfillment:{kind:'pack',packs:5}};
const boost={id:'seekar_spawn_lure',kind:'consumable',name:'Spawn Lure',quantity:1,price_cents:249,currency:'eur',fulfillment:{kind:'consumable',grants:[{powerupKey:'spawn_lure',quantity:1}]}};
const rows:HistoryOrder[]=Array.from({length:12},(_,i)=>({
 id:`f5d06e5${i.toString(16)}-3f06-4dcf-bb23-e2642f3ce3fc`,product_id:'seekar_cart',mint:i===3?'SOL':'RADOM',status:i===0?'pending':i===1?'paid':i===2?'failed':i===3?'pending':'paid',
 paid_at:i===1||i>3?'2026-09-15T21:54:00Z':null,fulfilled_at:i>3?'2026-09-15T21:55:00Z':null,
 expires_at:i===2?'2026-09-15T22:24:00Z':'2099-01-01T00:00:00Z',price_usd_cents:1587,created_at:'2026-09-15T21:54:00Z',signature:null,
 product_snapshot:{name:'Seekprotocol Shop',currency:'usd',price_cents:1587,items:[pack,boost]},
 checkout_snapshot:{beneficiary_name:'Alex',beneficiary_code:'DEMO1234',email:'alex@example.test',is_self:true},
}));
export default function OrderHistoryPreview(){
 const [page,setPage]=useState(1),[updated,setUpdated]=useState(new Date('2026-09-16T12:00:00Z'));const h=useTranslations('shop.history');
 return <main style={{padding:'110px 24px 48px',maxWidth:1168,margin:'auto'}}><p style={{fontSize:12,color:'var(--fg-muted)'}}>Design preview · fictieve bestellingen · geen betaling</p><h1 style={{fontSize:'clamp(28px,4vw,44px)',margin:'16px 0 32px'}}>{h('title')}</h1><OrderHistoryView orders={rows.slice((page-1)*10,page*10)} page={page} hasNext={page===1} loading={false} failed={false} updatedAt={updated} onRefresh={()=>setUpdated(new Date())} onPrevious={()=>setPage(1)} onNext={()=>setPage(2)} onAction={async()=> 'pending'}/></main>;
}
