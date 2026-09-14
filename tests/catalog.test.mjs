import assert from 'node:assert/strict';
import test from 'node:test';
import { parseWebCatalog, bundleSaving,formatPrice,receiptPrice } from '../lib/shop/catalog.ts';
const row={id:'seekar_new_pack',name:'New pack',kind:'pack',currency:'usd',price_cents:1500,revision:2,fulfillment:{kind:'pack',packs:7}};
test('new products of every supported kind are selectable with their original currency',()=>{
  const rows=[row,{...row,id:'seekar_pass',kind:'pass',currency:'eur',fulfillment:{kind:'pass'}},...['consumable','bundle'].map(kind=>({...row,id:`seekar_${kind}`,kind,currency:'eur',fulfillment:{kind,grants:[{powerupKey:'rare_boost',quantity:2}]}}))];
  const products=parseWebCatalog(rows);assert.equal(products.length,4);assert.equal(products[0].packs,7);assert.equal(products[2].grants[0].quantity,2);
  assert.equal(formatPrice(products[1],'en-US'),'€15.00');assert.equal(formatPrice(products[0],'en-US'),'$15.00');
});
test('unavailable or malformed catalogs do not invent prices or grants',()=>{
  assert.deepEqual(parseWebCatalog([]),[]);
  for(const raw of [null,[{...row,price_cents:0}],[{...row,currency:'bogus'}],[{...row,kind:'unknown'}],[{...row,revision:0}],[{...row,fulfillment:{kind:'pack',packs:0}}],[row,row],[{...row,kind:'bundle',fulfillment:{kind:'bundle',grants:[]}}]]) assert.throws(()=>parseWebCatalog(raw));
});
test('discounts compare only cardpacks in the same currency',()=>{
  const [single,bundle]=parseWebCatalog([{...row,id:'seekar_single',price_cents:400,fulfillment:{kind:'pack',packs:1}},{...row,fulfillment:{kind:'pack',packs:5}}]);
  assert.equal(bundleSaving(bundle,[single,bundle]),25);
  assert.equal(bundleSaving(bundle,[{...single,priceCents:300},bundle]),null);
  assert.equal(bundleSaving(bundle,[{...single,currency:'eur'},bundle]),null);
});
test('history uses the purchased EUR price, preserving legacy USD records',()=>{
  assert.equal(receiptPrice({price_usd_cents:1042,product_snapshot:{price_cents:899,currency:'eur'}},'en-US'),'€8.99');
  assert.equal(receiptPrice({price_usd_cents:299,product_snapshot:{legacy:true}},'en-US'),'$2.99');
});
