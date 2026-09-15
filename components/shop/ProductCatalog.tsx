"use client";
import { canSetQuantity, type CartItem } from "@/lib/shop/cart";
import ProductArt from "./ProductArt";
export { default as ProductArt } from "./ProductArt";
import {useLocale,useTranslations} from 'next-intl';
import {bundleSaving,formatPrice,type ShopProduct} from '@/lib/shop/catalog';

export function productName(product:ShopProduct, packs:(n:number)=>string) {return product.kind==='pack' ? packs(product.packs!) : product.name.replace(/\bSeekAR\b/g, 'Seekprotocol');}
export default function ProductCatalog({products,items,onQuantity,disabled}: {products:ShopProduct[];items:CartItem[];onQuantity:(p:ShopProduct,q:number)=>void;disabled:boolean}) {
  const t=useTranslations('shop');const locale=useLocale();
  return <section className="shop-catalog" aria-labelledby="shop-catalog-title">
    <div className="shop-catalog-heading"><span className="eyebrow">Seekprotocol Shop</span><h2 id="shop-catalog-title">{t('catalogTitle')}</h2><p>{t('catalogLead')}</p></div>
    <fieldset disabled={disabled} className="shop-product-grid"><legend className="sr-only">{t('catalogTitle')}</legend>
      {products.map(product => {
        const quantity = items.find(item => item.product.id === product.id)?.quantity ?? 0;
        const name = productName(product, n => t('packs', {count:n}));
        return <article className="shop-product-card" key={product.id} data-selected={quantity>0} data-kind={product.kind}>
          <div className="shop-product-art"><ProductArt product={product}/></div>
          <span className="shop-product-kind">{t(`productKinds.${product.kind}`)}</span>
          <strong>{name}</strong>
          <span className="shop-product-detail">{product.kind==='pack' ? t('cardsInPacks') : product.kind==='pass' ? t('passSeason') : product.grants.map(g=>`${g.quantity} × ${t.has(`powerupNames.${g.powerupKey}`) ? t(`powerupNames.${g.powerupKey}`) : g.powerupKey}`).join(' · ')}</span>
          <div className="shop-product-price"><b>{formatPrice(product,locale)}</b>{bundleSaving(product,products)!>0 && <small>{t('bundleSaving',{percent:bundleSaving(product,products)!})}</small>}</div>
          <div className="shop-product-quantity" role="group" aria-label={t('cart.quantity',{product:name})}>
            <button type="button" disabled={disabled || quantity===0} aria-label={`${t('cart.decrease')}: ${name}`} onClick={()=>onQuantity(product,quantity-1)}>−</button>
            <span aria-live="polite">{quantity}</span>
            <button type="button" disabled={disabled || !canSetQuantity(items,product,quantity+1)} aria-label={`${t('cart.increase')}: ${name}`} onClick={()=>onQuantity(product,quantity+1)}>+</button>
          </div>
        </article>;
      })}
    </fieldset>
  </section>;
}
