import type {ShopProduct} from './catalog';

type Translate = {
  (key: string, values?: Record<string, string | number>): string;
  has(key: string): boolean;
};

export function powerupCopyKey(key: string): string {
  return ({xp_boost:'to_the_moon',shiba:'rare_boost',whale:'spawn_lure'} as Record<string,string>)[key] ?? key;
}

/** Product names follow the selected language in both the catalog and the cart. */
export function productName(product: ShopProduct, t: Translate): string {
  if (product.kind === 'pack') return t('packs', {count:product.packs ?? 1});
  if (product.kind === 'pass') return t('productInfo.passName');
  if (product.kind === 'bundle') return product.id === 'seekar_boost_bundle' ? t('productInfo.bundleName') : product.name;
  const key = `powerupNames.${powerupCopyKey(product.grants[0]?.powerupKey ?? '')}`;
  return t.has(key) ? t(key) : product.name.replace(/\bSeekAR\b/g, 'Seekprotocol');
}

export function productDescription(product: ShopProduct, t: Translate): string {
  if (product.kind === 'pack') return t('cardsInPacks');
  if (product.kind === 'pass') return t('passSeason');
  if (product.kind === 'bundle') return product.grants.map(g => {
    const key = `powerupNames.${powerupCopyKey(g.powerupKey)}`;
    return `${g.quantity} × ${t.has(key) ? t(key) : g.powerupKey}`;
  }).join(' · ');
  const key = `powerupDescriptions.${powerupCopyKey(product.grants[0]?.powerupKey ?? '')}`;
  return t.has(key) ? t(key) : product.description;
}
