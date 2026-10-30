import {parseTierPack, type TierPack} from './pack-tiers.ts';

export type ProductKind = 'pack' | 'pass' | 'consumable' | 'bundle';
export interface ShopProduct {
  id: string; name: string; kind: ProductKind; packs?: number; pack?: TierPack;
  description: string; priceCents: number; currency: 'usd' | 'eur'; revision: number;
  /** The price before a running sale, and when that sale ends (shop_sale_start). */
  listPriceCents?: number; saleEndsAt?: string;
  grants: {powerupKey:string;quantity:number}[];
}
// Temporary storefront visibility only; keep the product and order history intact.
// Set to true when the Season Pass should appear in the shop again.
const SHOW_SEASON_PASS = false;
export function visibleShopProducts(products: ShopProduct[]): ShopProduct[] {
  return products.filter(product => SHOW_SEASON_PASS || product.kind !== 'pass');
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
    const sale = Number.isSafeInteger(p.list_price_cents) && p.list_price_cents > p.price_cents && typeof p.sale_ends_at === 'string' && Date.parse(p.sale_ends_at) > Date.now();
    return {id:p.id,name:p.name,kind:p.kind,packs:p.fulfillment.packs,pack:p.kind === 'pack' ? parseTierPack(p.fulfillment) : undefined,description:p.description ?? '',priceCents:p.price_cents,currency:p.currency,revision:p.revision,grants:p.fulfillment.grants ?? [],...(sale ? {listPriceCents:p.list_price_cents,saleEndsAt:p.sale_ends_at} : {})};
  });
}
export function formatPrice(product: Pick<ShopProduct,'priceCents'|'currency'>, locale: string): string {
  return new Intl.NumberFormat(locale,{style:'currency',currency:product.currency.toUpperCase()}).format(product.priceCents/100);
}
/** Percent off during a sale, rounded as the shop states it; null without one. */
export function salePercent(product: Pick<ShopProduct,'priceCents'|'listPriceCents'>): number | null {
  if (!product.listPriceCents || product.listPriceCents <= product.priceCents) return null;
  return Math.round((1 - product.priceCents / product.listPriceCents) * 100);
}
/** The sale running on the catalog, if any: the most common percent and the earliest end. */
export function catalogSale(products: ShopProduct[]): {percent: number; endsAt: string} | null {
  const on = products.filter(p => salePercent(p) !== null && p.saleEndsAt);
  if (!on.length) return null;
  const counts = new Map<number, number>();
  for (const p of on) counts.set(salePercent(p)!, (counts.get(salePercent(p)!) ?? 0) + 1);
  const percent = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]![0];
  const endsAt = on.map(p => p.saleEndsAt!).sort()[0]!;
  return {percent, endsAt};
}
export function bundleSaving(product: ShopProduct, products: ShopProduct[]): number | null {
  const single = products.find(p => p.kind==='pack' && p.packs === 1 && p.currency===product.currency && p.pack?.tier===product.pack?.tier && p.pack?.policy_version===product.pack?.policy_version);
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
