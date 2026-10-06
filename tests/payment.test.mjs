import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import {PublicKey,SystemProgram} from '@solana/web3.js';
import {formatPaymentAmount,parsePaymentQuote,PAYMENT_ASSETS} from '../lib/shop/payment-assets.ts';
import {buildPaymentTransaction} from '../lib/shop/payment-transaction.ts';
import {historyAction} from '../lib/shop/order-history.ts';

test('amounts preserve token precision without floating point',()=>{
 assert.equal(formatPaymentAmount(12990000n,'USDC'),'12.99');
 assert.equal(formatPaymentAmount(1n,'USDT'),'0.000001');
 assert.equal(formatPaymentAmount(1n,'SOL'),'0.000000001');
 assert.equal(formatPaymentAmount(999999999999999999n,'SOL'),'999999999.999999999');
});
test('server response must match the selected asset and mainnet',()=>{
 const data={asset:'USDT',mint:PAYMENT_ASSETS.USDT.mint,decimals:6,amount:'12990000',network:'solana-mainnet'};
 assert.deepEqual(parsePaymentQuote(data,'USDT'),{asset:'USDT',amount:12990000n});
 for(const mutation of [{asset:'SOL'},{mint:'fake-usdt'},{decimals:9},{network:'devnet'},{amount:'0'},{amount:12990000},{amount:'1.1'},{amount:'9223372036854775808'}])
  assert.throws(()=>parsePaymentQuote({...data,...mutation},'USDT'));
 assert.throws(()=>parsePaymentQuote({amount:'12990000'},'USDT'));
});
test('unsigned transactions match the official Solana SDK for all supported assets',()=>{
 const f=JSON.parse(fs.readFileSync(new URL('./fixtures/solana-payment-messages.json',import.meta.url)));
 for(const asset of ['SOL','USDC','USDT']){
  const tx=buildPaymentTransaction({payer:new PublicKey(f.payer),blockhash:f.blockhash,lastValidBlockHeight:f.lastValidBlockHeight,
   order:{asset,amount:BigInt(f.amount),recipient:f.recipient,reference:f.reference}});
  assert.equal(tx.serializeMessage().toString('hex'),f.messages[asset]);
  assert.equal(tx.instructions.length,asset==='SOL'?1:2);
  assert.ok(tx.instructions.at(-1).keys.some(k=>k.pubkey.toBase58()===f.reference&&!k.isSigner&&!k.isWritable));
  assert.ok(tx.signatures.every(s=>s.signature===null));
  if(asset==='SOL')assert.ok(tx.instructions[0].programId.equals(SystemProgram.programId));
 }
});
test('orders with a partial or late payment cannot offer another purchase',()=>{
 const order={status:'expired',fulfilled_at:null,paid_at:null,signature:null,expires_at:'2020-01-01T00:00:00Z'};
 assert.equal(historyAction({...order,payment_received_base_units:'1'}),'check');
 assert.equal(historyAction({...order,payment_review_reason:'late_payment'}),'check');
 assert.equal(historyAction(order),'reorder');
});
