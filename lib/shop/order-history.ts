import type { SupabaseClient } from '@supabase/supabase-js';
import type { ShopProduct } from './catalog';

export interface ProductSnapshot {
  id?: string; name?: string; kind?: string; quantity?: number; revision?: number;
  price_cents?: number; currency?: string; items?: ProductSnapshot[];
  fulfillment?: {kind?: string; packs?: number; grants?: {powerupKey:string;quantity:number}[]};
}
export interface Receipt {
  id: string; status: string; fulfilled_at: string | null; paid_at: string | null;
  price_usd_cents: number | null; created_at: string; signature: string | null;
  product_snapshot?: ProductSnapshot | null;
  checkout_snapshot: {email?:string;beneficiary_name?:string;beneficiary_code?:string;is_self?:boolean} | null;
}
export interface HistoryOrder extends Receipt {product_id:string;mint:string;expires_at?:string}
export type OrderCursor = {created_at:string;id:string};
export const HISTORY_PAGE_SIZE = 10;
export const HISTORY_COLUMNS = 'id,product_id,mint,status,paid_at,fulfilled_at,price_usd_cents,created_at,expires_at,signature,checkout_snapshot,product_snapshot';

/** Bounded API pagination. Ownership is also enforced by the table's RLS. */
export async function fetchOrderPage(client: SupabaseClient, userId:string, cursor:OrderCursor|null, signal:AbortSignal) {
  let query=client.from('solana_orders').select(HISTORY_COLUMNS).eq('user_id',userId).eq('channel','web')
    .order('created_at',{ascending:false}).order('id',{ascending:false});
  if(cursor) {
    if(!/^[0-9a-f-]{36}$/i.test(cursor.id) || !/^\d{4}-\d\d-\d\dT[\d:.+-]+Z?$/.test(cursor.created_at)) throw new Error('invalid_cursor');
    query=query.or(`created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.lt.${cursor.id})`);
  }
  const {data,error}=await query.limit(HISTORY_PAGE_SIZE+1).abortSignal(signal);
  if(error) throw error;
  return {orders:(data??[]).slice(0,HISTORY_PAGE_SIZE) as HistoryOrder[],hasNext:(data?.length??0)>HISTORY_PAGE_SIZE};
}

/** Render the immutable receipt, including its original currency and prices. */
export function receiptItems(receipt:Receipt & {product_id?:string}): {product:ShopProduct;quantity:number}[] {
  const snapshot=receipt.product_snapshot;
  if(!snapshot) return [];
  return (snapshot.items ?? [snapshot]).map((item,index)=>{
    const kind=item.kind ?? item.fulfillment?.kind;
    return {quantity:item.quantity ?? 1,product:{
      id:item.id ?? receipt.product_id ?? `receipt_${index}`,name:item.name ?? '',
      kind:kind==='pack'||kind==='pass'||kind==='bundle' ? kind : 'consumable',
      packs:item.fulfillment?.packs,grants:item.fulfillment?.grants ?? [],
      priceCents:item.price_cents ?? receipt.price_usd_cents ?? 0,currency:item.currency==='eur'?'eur':'usd',
      revision:item.revision ?? 1,description:'',
    }};
  });
}

export function historyAction(order:HistoryOrder, now=Date.now()): 'resume'|'reorder'|'check'|null {
  if(order.fulfilled_at || order.paid_at || order.status==='paid') return null;
  if(order.signature) return 'check';
  const expires=Date.parse(order.expires_at??'');
  if(order.status==='failed'||order.status==='expired'||order.status==='pending'&&Number.isFinite(expires)&&expires<=now) return 'reorder';
  if(order.status==='pending'&&order.mint==='RADOM'&&Number.isFinite(expires)&&expires>now) return 'resume';
  return order.status==='pending' ? 'check' : null;
}

/** Only restore a selection; the normal checkout re-prices and revalidates the recipient. */
export function restoreOrderCart(order:HistoryOrder, catalog:ShopProduct[]) {
  if(historyAction(order)!=='reorder') throw new Error('order_not_closed');
  const items=receiptItems(order);
  if(!items.length||items.length>20) throw new Error('products_unavailable');
  const quantities:Record<string,number>={};let total=0;let packs=0;
  for(const item of items){
    const current=catalog.find(p=>p.id===item.product.id);
    if(!current||quantities[current.id]||!Number.isSafeInteger(item.quantity)||item.quantity<1||item.quantity>(current.kind==='pass'?1:20)) throw new Error('products_unavailable');
    quantities[current.id]=item.quantity;total+=item.quantity;packs+=(current.packs??0)*item.quantity;
  }
  if(total>50||packs>50) throw new Error('products_unavailable');
  const friendsId=order.checkout_snapshot?.is_self!==true ? order.checkout_snapshot?.beneficiary_code??'' : '';
  if(friendsId&&!/^[A-Za-z0-9]{8}$/.test(friendsId)) throw new Error('recipient_unavailable');
  if(order.checkout_snapshot?.is_self===false&&!friendsId) throw new Error('recipient_unavailable');
  return {quantities,friendsId};
}
