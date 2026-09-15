import type { ShopProduct } from './catalog';
export interface CartItem { product: ShopProduct; quantity: number }
export const MAX_CART_ITEMS = 50;
export function cartRequest(items: CartItem[]) {
  return items.map(({product,quantity})=>({product_id:product.id,quantity,catalog_revision:product.revision})).sort((a,b)=>a.product_id.localeCompare(b.product_id));
}
export function cartKey(items: CartItem[]) { return JSON.stringify(cartRequest(items)); }
export function cartTotal(items: CartItem[]): {priceCents:number;currency:'usd'|'eur'} | null {
  if (!items.length || items.some(item=>item.product.currency!==items[0].product.currency)) return null;
  return {priceCents:items.reduce((sum,{product,quantity})=>sum+product.priceCents*quantity,0),currency:items[0].product.currency};
}
export function canSetQuantity(items: CartItem[], product: ShopProduct, quantity: number) {
  if (!Number.isSafeInteger(quantity) || quantity<0 || quantity>(product.kind==='pass' ? 1 : 20)) return false;
  const next=[...items.filter(item=>item.product.id!==product.id),{product,quantity}].filter(item=>item.quantity>0);
  return next.length<=20 && next.reduce((n,item)=>n+item.quantity,0)<=MAX_CART_ITEMS &&
    next.reduce((n,item)=>n+(item.product.packs??0)*item.quantity,0)<=50 && next.filter(item=>item.product.kind==='pass').length<=1;
}
