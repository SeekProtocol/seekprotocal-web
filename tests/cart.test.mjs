import assert from 'node:assert/strict';
import test from 'node:test';
import {cartKey,cartRequest,cartTotal,canSetQuantity} from '../lib/shop/cart.ts';
const pack={id:'seekar_pack',priceCents:299,currency:'usd',kind:'pack',packs:1,revision:2};
const boost={id:'seekar_boost',priceCents:199,currency:'eur',kind:'consumable',revision:1};
test('cart keeps several products and quantities in one request without browser prices',()=>{
 const items=[{product:pack,quantity:2},{product:boost,quantity:3}];
 assert.equal(cartRequest(items).length,2);assert.deepEqual(cartRequest(items)[1],{product_id:pack.id,quantity:2,catalog_revision:2});
 assert.equal(cartKey(items),cartKey([...items].reverse()));assert.notEqual(cartKey(items),cartKey([{product:pack,quantity:1},{product:boost,quantity:3}]));
});
test('same-currency totals multiply quantities; mixed currencies require server conversion',()=>{
 assert.deepEqual(cartTotal([{product:pack,quantity:2}]),{priceCents:598,currency:'usd'});
 assert.equal(cartTotal([{product:pack,quantity:2},{product:boost,quantity:1}]),null);
 assert.equal(cartTotal([]),null);
});
test('quantities allow removal, prevent duplicate Pass and respect pack grant capacity',()=>{
 assert.equal(canSetQuantity([{product:pack,quantity:2}],pack,0),true);
 assert.equal(canSetQuantity([],pack,2),true);
 assert.equal(canSetQuantity([],{...pack,packs:10},6),false);
 assert.equal(canSetQuantity([],{...boost,kind:'pass'},2),false);
 assert.equal(canSetQuantity([],pack,-1),false);assert.equal(canSetQuantity([],pack,1.5),false);
});
