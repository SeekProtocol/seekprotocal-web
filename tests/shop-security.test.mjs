import test from 'node:test';
import assert from 'node:assert/strict';
import {Connection,Keypair,SystemProgram,Transaction} from '@solana/web3.js';
import {shopContentSecurity,isShopPath} from '../lib/shop/content-security.ts';

test('production shop policy requires nonces, excludes analytics, and pins API hosts',()=>{
 const policy=shopContentSecurity('abcdef0123456789abcdefghij',true,false,{supabase:'https://project.supabase.co',solanaRpc:'https://rpc.example.test/path?secret=ignored'});
 const scripts=policy.split('; ').find(s=>s.startsWith('script-src '));
 assert.match(scripts,/'nonce-abcdef0123456789abcdefghij'/);assert.doesNotMatch(scripts,/unsafe-inline|unsafe-eval/);
 assert.match(policy,/script-src-attr 'none'/);assert.doesNotMatch(policy,/google-analytics|googletagmanager|secret=/);
 assert.match(policy,/https:\/\/rpc.example.test/);
 assert.ok(isShopPath('/nl/shop/orders'));assert.ok(isShopPath('/sr-Latn/shop/support'));assert.ok(!isShopPath('/nl/about'));
});
test('repaired JSON RPC client remains compatible with Solana blockhash and transaction building',async()=>{
 let called=0;
 const connection=new Connection('https://rpc.example.test',{fetch:async(_url,options)=>{
  const request=JSON.parse(options.body);called++;assert.equal(request.method,'getLatestBlockhash');assert.equal(typeof request.id,'string');
  return new Response(JSON.stringify({jsonrpc:'2.0',id:request.id,result:{context:{slot:1},value:{blockhash:'11111111111111111111111111111111',lastValidBlockHeight:100}}}));
 }});
 const result=await connection.getLatestBlockhash();assert.equal(called,1);assert.equal(result.lastValidBlockHeight,100);
 const payer=Keypair.generate(),to=Keypair.generate().publicKey;
 const transaction=new Transaction({feePayer:payer.publicKey,recentBlockhash:result.blockhash}).add(SystemProgram.transfer({fromPubkey:payer.publicKey,toPubkey:to,lamports:1000}));
 transaction.sign(payer);assert.ok(transaction.serialize().length>0);
});
