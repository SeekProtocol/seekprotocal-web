"use client";
import Image from 'next/image';
import {useLocale,useTranslations} from 'next-intl';
import {bundleSaving,formatPrice,type ShopProduct} from '@/lib/shop/catalog';

export function ProductArt({product}: {product:ShopProduct}) {
  if(product.kind==='pack') return <Image src="/app/shop/card-back.png" width={66} height={93} alt="" />;
  return <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    {product.kind==='pass' ? <><path d="m10 20 12 10 10-18 10 18 12-10-5 30H15Z"/><path d="M18 42h28"/></> : product.kind==='bundle' ? <><rect x="13" y="24" width="38" height="29" rx="4"/><path d="M10 24h44v-9H10Zm22-9v38M32 15c-17 0-16-15-7-10Zm0 0c17 0 16-15 7-10Z"/></> : <path d="m35 6-21 29h15l-3 23 24-32H35Z"/>}
  </svg>;
}
export function productName(product:ShopProduct, packs:(n:number)=>string) {return product.kind==='pack' ? packs(product.packs!) : product.name;}
export default function ProductCatalog({products,selected,onSelect,disabled}: {products:ShopProduct[];selected:ShopProduct;onSelect:(p:ShopProduct)=>void;disabled:boolean}) {
  const t=useTranslations('shop');const locale=useLocale();
  return <section className="shop-catalog" aria-labelledby="shop-catalog-title">
    <div className="shop-catalog-heading"><span className="eyebrow">SeekAR Shop</span><h2 id="shop-catalog-title">{t('catalogTitle')}</h2><p>{t('catalogLead')}</p></div>
    <fieldset disabled={disabled} className="shop-product-grid"><legend className="sr-only">{t('catalogTitle')}</legend>
      {products.map(p=><label className="shop-product-card" key={p.id} data-selected={p.id===selected.id} data-kind={p.kind}>
        <input type="radio" name="shop-product" checked={p.id===selected.id} onChange={()=>onSelect(p)}/>
        <div className="shop-product-art"><ProductArt product={p}/><span className="shop-product-check" aria-hidden="true">{p.id===selected.id ? '✓' : '+'}</span></div>
        <span className="shop-product-kind">{t(`productKinds.${p.kind}`)}</span>
        <strong>{productName(p,n=>t('packs',{count:n}))}</strong>
        <span className="shop-product-detail">{p.kind==='pack' ? t('cardsInPacks') : p.kind==='pass' ? t('passSeason') : p.grants.map(g=>`${g.quantity} × ${t.has(`powerupNames.${g.powerupKey}`) ? t(`powerupNames.${g.powerupKey}`) : g.powerupKey}`).join(' · ')}</span>
        <div className="shop-product-price"><b>{formatPrice(p,locale)}</b>{bundleSaving(p,products)!>0 && <small>{t('bundleSaving',{percent:bundleSaving(p,products)!})}</small>}</div>
      </label>)}
    </fieldset>
  </section>;
}
