import assert from 'node:assert/strict';
import test from 'node:test';
import {buildEvmPayment,prepareEvmWallet} from '../lib/shop/evm-wallet.ts';
import {formatPaymentAmount,parsePaymentQuote,PAYMENT_ASSETS} from '../lib/shop/payment-assets.ts';
const account='0x'+'a'.repeat(40),router='0x'+'b'.repeat(40),reference='0x'+'c'.repeat(64);
test('ETH and BNB preserve all 18 decimals and reject quotes on another chain',()=>{
 assert.equal(formatPaymentAmount(100000000000000001n,'ETH'),'0.100000000000000001');
 assert.equal(formatPaymentAmount(1n,'BNB'),'0.000000000000000001');
 for(const asset of ['ETH','BNB']) {
   const info=PAYMENT_ASSETS[asset],data={asset,...info,amount:'100000000000000001'};
   assert.equal(parsePaymentQuote(data,asset).amount,100000000000000001n);
   for(const change of [{network:undefined},{network:'solana-mainnet'},{decimals:9},{mint:'SOL'},{amount:100000000000000001}])assert.throws(()=>parsePaymentQuote({...data,...change},asset));
 }
});
test('unsigned EVM transaction binds exact amount, router, reference and network',()=>{
 const order={asset:'BNB',amount:100000000000000001n,chainId:56,router,reference};
 const tx=buildEvmPayment(order,account);
 assert.equal(tx.chainId,'0x38');assert.equal(BigInt(tx.value),order.amount);assert.equal(tx.to,router);assert.equal(tx.from,account);
 assert.equal(tx.data,'0x8609cad1'+reference.slice(2));
 assert.deepEqual(Object.keys(tx).sort(),['chainId','data','from','to','value']);
 for(const change of [{chainId:1},{asset:'SOL'},{amount:0n},{router:'0x'+'0'.repeat(40)},{reference:'0x'+'0'.repeat(64)}])assert.throws(()=>buildEvmPayment({...order,...change},account));
});
test('wallet switches network and checks the active account again before signing',async()=>{
 let chain='0x1';const calls=[];
 const provider={request:async({method,params})=>{calls.push(method);if(method==='eth_chainId')return chain;if(method==='eth_accounts')return [account];if(method==='wallet_switchEthereumChain')chain=params[0].chainId;}};
 await prepareEvmWallet(provider,'BNB',account);
 assert.ok(calls.includes('wallet_switchEthereumChain'));assert.equal(chain,'0x38');
 await assert.rejects(()=>prepareEvmWallet({...provider,request:async({method})=>method==='eth_chainId'?'0x38':['0x'+'d'.repeat(40)]},'BNB',account),/wallet_changed/);
});
test('rejected network switches never fall through to sending a payment',async()=>{
 const calls=[];
 await assert.rejects(()=>prepareEvmWallet({request:async({method})=>{calls.push(method);if(method==='eth_chainId')return '0x1';throw {code:4001};}},'BNB',account));
 assert.deepEqual(calls,['eth_chainId','wallet_switchEthereumChain']);
});
