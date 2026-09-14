export type ProductKind = 'pack' | 'pass' | 'consumable' | 'bundle';
export interface ShopProduct {
  id: string; name: string; kind: ProductKind; packs?: number;
  description: string; priceCents: number; currency: 'usd' | 'eur'; revision: number;
  grants: {powerupKey:string;quantity:number}[];
}
export function parseWebCatalog(raw: unknown): ShopProduct[] {
  if (!Array.isArray(raw)) throw new Error('catalog_unavailable');
  const ids = new Set<string>();
  return raw.map(p => {
    if (!p || typeof p.id !== 'string' || !/^seekar_[a-z0-9_]+$/.test(p.id) || ids.has(p.id) ||
      !['pack','pass','consumable','bundle'].includes(p.kind) || !['usd','eur'].includes(p.currency) || typeof p.name !== 'string' || !p.name ||
      !Number.isSafeInteger(p.price_cents) || p.price_cents <= 0 ||
      !Number.isSafeInteger(p.revision) || p.revision < 1 || p.fulfillment?.kind !== p.kind ||
      (p.kind==='pack' && (!Number.isSafeInteger(p.fulfillment.packs) || p.fulfillment.packs < 1)) ||
      (['consumable','bundle'].includes(p.kind) && (!Array.isArray(p.fulfillment.grants) || !p.fulfillment.grants.length || p.fulfillment.grants.some((g: {powerupKey?:unknown;quantity?:number}) => typeof g.powerupKey!=='string' || !Number.isSafeInteger(g.quantity) || (g.quantity ?? 0)<1)))) throw new Error('catalog_unavailable');
    ids.add(p.id);
    return {id:p.id,name:p.name,kind:p.kind,packs:p.fulfillment.packs,description:p.description ?? '',priceCents:p.price_cents,currency:p.currency,revision:p.revision,grants:p.fulfillment.grants ?? []};
  });
}
export function formatPrice(product: Pick<ShopProduct,'priceCents'|'currency'>, locale: string): string {
  return new Intl.NumberFormat(locale,{style:'currency',currency:product.currency.toUpperCase()}).format(product.priceCents/100);
}
export function bundleSaving(product: ShopProduct, products: ShopProduct[]): number | null {
  const single = products.find(p => p.kind==='pack' && p.packs === 1 && p.currency===product.currency);
  if (!single || product.kind!=='pack' || !product.packs || product.packs <= 1) return null;
  const percent = Math.round((1 - product.priceCents / (single.priceCents * product.packs)) * 100);
  return percent > 0 ? percent : null;
}
/** Original currency and price for new orders; historical orders retain their recorded USD amount. */
export function receiptPrice(receipt: {price_usd_cents: number|null;product_snapshot?:{price_cents?:number;currency?:string}|null},locale: string): string {
  const p=receipt.product_snapshot;
  if (p && Number.isSafeInteger(p.price_cents) && (p.currency==='usd' || p.currency==='eur')) return formatPrice({priceCents:p.price_cents!,currency:p.currency},locale);
  return receipt.price_usd_cents===null ? '—' : formatPrice({priceCents:receipt.price_usd_cents,currency:'usd'},locale);
}
