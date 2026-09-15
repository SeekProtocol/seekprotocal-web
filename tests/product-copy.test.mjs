import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync,readdirSync} from 'node:fs';
import {createTranslator} from 'next-intl';
import {productName,productDescription} from '../lib/shop/product-copy.ts';

const example={id:'seekar_rare_boost',name:'Rare Boost',kind:'consumable',description:'Increases rare/epic/legendary spawn weight for 30 minutes',grants:[{powerupKey:'rare_boost',quantity:1}]};
const keys=['rare_boost','coin_magnet','to_the_moon','pump_it','diamond_hands','spawn_lure','cash','fitness','chill_guy','this_is_fine'];
const locales=readdirSync(new URL('../messages/',import.meta.url)).filter(x=>x.endsWith('.json'));
for(const file of locales) test(`product information resolves in ${file}`,()=>{
  const locale=file.slice(0,-5),messages=JSON.parse(readFileSync(new URL(`../messages/${file}`,import.meta.url),'utf8'));
  const t=createTranslator({locale,messages,namespace:'shop',onError:error=>{throw error;}});
  for(const key of keys){
    const p={...example,grants:[{powerupKey:key,quantity:1}]};
    assert.equal(productName(p,t),messages.shop.powerupNames[key]);
    assert.equal(productDescription(p,t),messages.shop.powerupDescriptions[key]);
    assert.ok(productDescription(p,t).trim().length>10);
  }
  for(const key of ['more','includes','use','pack','pass','bundle','activate','delivery','passName','bundleName'])assert.ok(t(`productInfo.${key}`).length>1);
  assert.equal(productName({...example,grants:[{powerupKey:'shiba',quantity:1}]},t),messages.shop.powerupNames.rare_boost);
  assert.equal(productName({...example,kind:'pass'},t),messages.shop.productInfo.passName);
  assert.equal(productName({...example,kind:'pack',packs:5},t),t('packs',{count:5}));
  const bundle={...example,id:'seekar_boost_bundle',kind:'bundle',grants:[{powerupKey:'fitness',quantity:2}]};
  assert.equal(productDescription(bundle,t),`2 × ${messages.shop.powerupNames.fitness}`);
  if(locale!=='en'){
    const en=JSON.parse(readFileSync(new URL('../messages/en.json',import.meta.url),'utf8'));
    for(const key of keys)assert.notEqual(messages.shop.powerupDescriptions[key],en.shop.powerupDescriptions[key]);
  }
});
test('future catalog products retain their own names and actual grant counts',()=>{
  const t=createTranslator({locale:'en',messages:JSON.parse(readFileSync(new URL('../messages/en.json',import.meta.url),'utf8')),namespace:'shop'});
  const future={...example,name:'New booster',description:'A new effect',grants:[{powerupKey:'future_boost',quantity:1}]};
  assert.equal(productName(future,t),'New booster');
  assert.equal(productDescription(future,t),'A new effect');
});
