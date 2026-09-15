import assert from 'node:assert/strict';
import test from 'node:test';
import {createClient} from '@supabase/supabase-js';
import {createShopSessionStorage, SHOP_IDLE_MS, SHOP_MAX_SESSION_MS} from '../lib/shop/session-storage.ts';
import {shopReturnPath} from '../lib/shop/checkout-return.ts';
const key = 'sb-test-auth-token';
const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
function session(id = 'session-one', revision = 1) {
  const iat = Math.floor(Date.now()/1000);
  return {access_token:`${encode({alg:'HS256',typ:'JWT'})}.${encode({session_id:id,sub:'test-user',iat,exp:iat+3600,revision})}.test-signature`,
    refresh_token:`refresh-${id}-${revision}`, token_type:'bearer', expires_in:3600, expires_at:iat+3600,
    user:{id:'test-user',aud:'authenticated',role:'authenticated',email:'test@example.test',app_metadata:{},user_metadata:{},created_at:new Date().toISOString()}};
}
function fixture() {
  const values = new Map();
  let time = Date.now();
  const ended = [];
  const storage = {getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
  const options = {now:()=>time,onEnd:(token,reason)=>ended.push({token,reason})};
  const policy = createShopSessionStorage(storage,key,options);
  return {values,storage,policy,ended,options,advance:ms=>time+=ms,save:(data=session())=>policy.setItem(key,JSON.stringify(data)),read:()=>policy.getItem(key)};
}

test('idle expiry clears credentials at the deadline and cannot be revived by input or a late refresh',()=>{
  const f=fixture();f.save();f.advance(SHOP_IDLE_MS-1);assert.ok(f.read());
  f.advance(1);f.policy.activity();assert.equal(f.read(),null);assert.equal(f.policy.reason(),'expired');
  f.save(session('session-one',2));assert.equal(f.read(),null);
  assert.equal(f.ended.length,1);assert.equal(f.ended[0].reason,'expired');
  assert.ok(!f.values.get(f.policy.policyKey).includes('refresh_token'));
});
test('real input extends idle time, but periodic reads and token refreshes do not',()=>{
  const f=fixture();f.save();f.advance(20*60_000);f.policy.activity();
  f.advance(20*60_000);f.save(session('session-one',2));assert.ok(f.read());
  assert.equal(f.policy.remaining(),10*60_000);
  for(let i=0;i<10;i++){f.advance(60_000);f.read();}
  assert.equal(f.read(),null);
});
test('active sessions still expire after eight hours',()=>{
  const f=fixture();f.save();
  for(let elapsed=10*60_000;elapsed<SHOP_MAX_SESSION_MS;elapsed+=10*60_000){f.advance(10*60_000);f.policy.activity();assert.ok(f.read());}
  f.advance(10*60_000);assert.equal(f.read(),null);assert.equal(f.policy.reason(),'expired');
});
test('reload and a second tab share the same deadline and activity',()=>{
  const f=fixture();f.save();f.advance(20*60_000);
  const other=createShopSessionStorage(f.storage,key,f.options);
  assert.equal(other.remaining(),10*60_000);other.activity();
  f.advance(20*60_000);assert.ok(f.read());assert.equal(f.policy.remaining(),10*60_000);
  f.advance(10*60_000);assert.equal(other.getItem(key),null);assert.equal(f.read(),null);
});
test('manual logout removes credentials immediately and all tabs reject the ended login',()=>{
  const f=fixture();f.save();const other=createShopSessionStorage(f.storage,key,f.options);
  f.policy.signOut();assert.equal(f.read(),null);assert.equal(other.getItem(key),null);
  assert.equal(f.policy.reason(),'signed-out');other.setItem(key,JSON.stringify(session('session-one',2)));
  assert.equal(f.read(),null);assert.equal(f.ended.length,1);
});
test('fresh authentication works after timeout; a late result from the old login cannot replace it',()=>{
  const f=fixture();f.save();f.advance(SHOP_IDLE_MS);assert.equal(f.read(),null);
  const fresh=session('session-two');f.save(fresh);assert.equal(f.policy.accepts(fresh.access_token),true);
  assert.equal(f.policy.remaining(),SHOP_IDLE_MS);assert.equal(f.policy.reason(),null);
  f.save(session('session-one',2));assert.equal(f.policy.accepts(fresh.access_token),true);
});
test('legacy indefinite sessions need a fresh login, while PKCE verifier storage remains available',()=>{
  const f=fixture();f.storage.setItem(key,JSON.stringify(session()));
  f.policy.setItem(`${key}-code-verifier`,'pkce-value');
  assert.equal(f.read(),null);assert.equal(f.storage.getItem(key),null);
  assert.equal(f.policy.getItem(`${key}-code-verifier`),'pkce-value');
  f.save(session('new-oauth-session'));assert.ok(f.read());
  f.policy.removeItem(`${key}-code-verifier`);assert.equal(f.policy.getItem(`${key}-code-verifier`),null);
});
test('sleeping tabs and backwards clock changes cannot extend an old login',()=>{
  for(const shift of [SHOP_IDLE_MS+24*60*60_000,-1]){
    const f=fixture();f.save();f.advance(shift);assert.equal(f.policy.remaining(),null);assert.equal(f.read(),null);
  }
});
test('corrupt metadata and malformed sessions fail closed',()=>{
  const f=fixture();f.save();f.storage.setItem(f.policy.policyKey,'broken');assert.equal(f.read(),null);
  f.policy.setItem(key,JSON.stringify({access_token:'broken'}));assert.equal(f.read(),null);
});
test('an auth event from another session is not accepted as the signed-in account',()=>{
  const f=fixture();f.save();assert.equal(f.policy.accepts(session('other').access_token),false);
});
test('checkout sign-in retains only a valid order reference and never trusts paid hints or redirect URLs',()=>{
  assert.equal(shopReturnPath('/nl/shop','?order=order_12345678&paid=1&code=secret&next=https://evil.test'),'/nl/shop?order=order_12345678');
  assert.equal(shopReturnPath('/shop','?order=https://evil.test'),'/shop');
  assert.equal(shopReturnPath('/shop','?order=bad'),'/shop');
  assert.equal(shopReturnPath('/shop',''),'/shop');
});
test('installed Supabase SDK restores, refreshes, expires and signs in again through the storage policy',async()=>{
  const f=fixture();let id='sdk-first';let revision=0;const calls=[];
  const client=createClient('https://shop-session-test.supabase.co','test-anon-key',{
    auth:{storage:f.policy,storageKey:key,persistSession:true,autoRefreshToken:false,detectSessionInUrl:false},
    global:{fetch:async(url)=>{
      const parsed=new URL(url);calls.push(parsed.pathname+parsed.search);
      assert.equal(parsed.hostname,'shop-session-test.supabase.co');
      assert.equal(parsed.pathname,'/auth/v1/token');
      return new Response(JSON.stringify(session(id,++revision)),{status:200,headers:{'Content-Type':'application/json'}});
    }},
  });
  try {
    const login=()=>client.auth.signInWithPassword({email:'test@example.test',password:'synthetic-test-password'});
    assert.equal((await login()).error,null);
    assert.ok((await client.auth.getSession()).data.session);
    f.advance(20*60_000);assert.equal((await client.auth.refreshSession()).error,null);
    assert.equal(f.policy.remaining(),10*60_000);
    f.advance(10*60_000);assert.equal((await client.auth.getSession()).data.session,null);
    id='sdk-second';assert.equal((await login()).error,null);
    assert.ok((await client.auth.getSession()).data.session);
    f.policy.signOut();assert.equal((await client.auth.getSession()).data.session,null);
    assert.equal(calls.length,3);
  } finally { await client.auth.stopAutoRefresh(); }
});
