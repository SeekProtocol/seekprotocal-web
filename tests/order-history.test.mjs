import assert from 'node:assert/strict';
import test from 'node:test';
import {fetchOrderPage,HISTORY_PAGE_SIZE,HISTORY_COLUMNS,historyAction,receiptItems,restoreOrderCart} from '../lib/shop/order-history.ts';
import {shopReturnPath} from '../lib/shop/checkout-return.ts';
const base={id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',product_id:'seekar_cart',mint:'RADOM',status:'pending',expires_at:'2099-01-01T00:00:00Z',created_at:'2026-09-16T12:00:00Z',paid_at:null,fulfilled_at:null,signature:null,price_usd_cents:1600,checkout_snapshot:{is_self:false,beneficiary_code:'FRND1234'},product_snapshot:{items:[{id:'seekar_cash',kind:'consumable',name:'Cash',quantity:2,price_cents:79,currency:'eur',fulfillment:{kind:'consumable',grants:[{powerupKey:'cash',quantity:1}]}}]}};
test('API loads one bounded page and uses the immutable UUID for timestamp ties',async()=>{
 const calls=[];const rows=Array.from({length:HISTORY_PAGE_SIZE+1},(_,i)=>({...base,id:String(i)}));
 const chain=new Proxy({then:resolve=>resolve({data:rows,error:null})},{get(target,key){if(key==='then')return target.then;return (...args)=>{calls.push([key,...args]);return chain;};}});
 const cursor={created_at:base.created_at,id:base.id};
 const page=await fetchOrderPage(chain,'buyer-id',cursor,new AbortController().signal);
 assert.equal(page.orders.length,10);assert.equal(page.hasNext,true);
 assert.deepEqual(calls.filter(c=>c[0]==='eq'),[['eq','user_id','buyer-id'],['eq','channel','web']]);
 assert.deepEqual(calls.find(c=>c[0]==='limit'),['limit',11]);
 assert.deepEqual(calls.filter(c=>c[0]==='order'),[['order','created_at',{ascending:false}],['order','id',{ascending:false}]]);
 assert.equal(calls.find(c=>c[0]==='or')[1],`created_at.lt.${base.created_at},and(created_at.eq.${base.created_at},id.lt.${base.id})`);
 assert.ok(!HISTORY_COLUMNS.includes('radom_checkout_url'));
 await assert.rejects(fetchOrderPage(chain,'buyer-id',{...cursor,id:'anything),user_id.neq.null'},new AbortController().signal),/invalid_cursor/);
});
test('resume never appears for paid, delivered, closed or potentially broadcast orders',()=>{
 assert.equal(historyAction(base),'resume');
 assert.equal(historyAction({...base,mint:'SOL'}),'check');
 assert.equal(historyAction({...base,signature:'broadcast'}),'check');
 for(const row of [{status:'paid'},{paid_at:base.created_at},{fulfilled_at:base.created_at}])assert.equal(historyAction({...base,...row}),null);
 for(const row of [{status:'failed'},{status:'expired'},{expires_at:'2020-01-01T00:00:00Z'}])assert.equal(historyAction({...base,...row}),'reorder');
 assert.equal(historyAction({...base,expires_at:'invalid'}),'check');
});
test('receipts preserve historical item price while restored carts use current catalog',()=>{
 const [old]=receiptItems(base);assert.equal(old.quantity,2);assert.equal(old.product.priceCents,79);
 const fresh={...old.product,priceCents:99,revision:3};
 assert.deepEqual(restoreOrderCart({...base,status:'expired'},[fresh]),{quantities:{seekar_cash:2},friendsId:'FRND1234'});
 assert.equal(receiptItems(base)[0].product.priceCents,79);
 assert.throws(()=>restoreOrderCart(base,[fresh]),/order_not_closed/);
 assert.throws(()=>restoreOrderCart({...base,status:'expired'},[]),/products_unavailable/);
 assert.throws(()=>restoreOrderCart({...base,status:'expired',checkout_snapshot:{is_self:false}},[fresh]),/recipient_unavailable/);
});
test('reorder keeps only the validated order id across sign-in',()=>{
 assert.equal(shopReturnPath('/nl/shop','?reorder='+base.id+'&price=1&recipient=someone'),'/nl/shop?reorder='+base.id);
 assert.equal(shopReturnPath('/nl/shop','?reorder=https://evil.test'),'/nl/shop');
});
