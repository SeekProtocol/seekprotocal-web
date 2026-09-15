import {getSupabase, SUPABASE_URL, SUPABASE_ANON_KEY} from '@/lib/supabase-browser';

export const SOCIAL_PROVIDERS=['google','apple','discord','line','tiktok'] as const;
export type SocialProvider=typeof SOCIAL_PROVIDERS[number];
const PENDING_KEY='seek-shop-login';
const TOKEN=/^[A-Za-z0-9_-]{43}$/;
type Pending={id:string;verifier:string;createdAt:number};
export class ShopLoginError extends Error {}

async function request(path:string,body?:Record<string,unknown>) {
  const response=await fetch(`${SUPABASE_URL}/functions/v1/shop-auth/${path}`,{
    method:body?'POST':'GET',headers:{apikey:SUPABASE_ANON_KEY,...(body?{'Content-Type':'application/json'}:{})},
    body:body?JSON.stringify(body):undefined,cache:'no-store',signal:AbortSignal.timeout(body?45000:10000),
  });
  const data=await response.json();
  if(!response.ok || data.error) throw new ShopLoginError(data.error??'service_unavailable');
  return data;
}
export async function availableSocialProviders():Promise<SocialProvider[]> {
  const data=await request('providers');
  return SOCIAL_PROVIDERS.filter(provider=>Array.isArray(data.providers) && data.providers.includes(provider));
}
function base64url(bytes:Uint8Array) {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
export async function startSocialLogin(provider:SocialProvider,returnUrl:string):Promise<void> {
  const verifier=base64url(crypto.getRandomValues(new Uint8Array(32)));
  const challenge=base64url(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier))));
  const result=await request('start',{provider,return_url:returnUrl,challenge});
  // Verify storage works before leaving; only this tab may finish its request.
  sessionStorage.setItem(PENDING_KEY,JSON.stringify({id:result.id,verifier,createdAt:Date.now()} satisfies Pending));
  const destination=new URL(result.url);
  const hosts=['accounts.google.com','appleid.apple.com','discord.com','access.line.me','www.tiktok.com'];
  if(destination.protocol!=='https:' || !hosts.includes(destination.hostname)) throw new ShopLoginError('service_unavailable');
  window.location.assign(destination.toString());
}

let completion:Promise<boolean>|null=null;
export function hasSocialLoginReturn():boolean {
  return completion!==null || new URLSearchParams(window.location.hash.slice(1)).has('shop_login');
}
/** One exchange even under React StrictMode; the verifier/code are single-use. */
export function finishSocialLogin():Promise<boolean> {
  if(completion) return completion;
  const params=new URLSearchParams(window.location.hash.slice(1));
  const id=params.get('shop_login');
  if(!id) return Promise.resolve(false);
  window.history.replaceState(window.history.state,'',`${window.location.pathname}${window.location.search}`);
  completion=(async()=>{
    let pending:Pending|null=null;
    try { pending=JSON.parse(sessionStorage.getItem(PENDING_KEY)??'null'); } catch { /* fail closed */ }
    sessionStorage.removeItem(PENDING_KEY);
    if(!pending || pending.id!==id || !TOKEN.test(pending.verifier) || Date.now()-pending.createdAt>600000 || pending.createdAt>Date.now()) {
      throw new ShopLoginError('login_expired');
    }
    const result=await request('exchange',{id,verifier:pending.verifier,state:params.get('state'),
      code:params.get('oauth_code'),error:params.get('oauth_error')});
    if(result.type!=='recovery' || typeof result.token_hash!=='string') throw new ShopLoginError('sign_in_failed');
    const {data,error}=await getSupabase().auth.verifyOtp({type:'recovery',token_hash:result.token_hash});
    if(error || !data.session) throw new ShopLoginError('sign_in_failed');
    return true;
  })();
  const current=completion;
  void current.then(()=>{completion=null;},()=>{completion=null;});
  return current;
}

export type AppAccess={allowed:boolean;reason:'allowed'|'app_account_required'|'account_blocked'};
export function parseAppAccess(value:unknown):AppAccess {
  if(!value || typeof value!=='object') throw new ShopLoginError('service_unavailable');
  const result=value as Record<string,unknown>;
  if(result.allowed===true && result.reason==='allowed') return {allowed:true,reason:'allowed'};
  if(result.allowed===false && (result.reason==='app_account_required' || result.reason==='account_blocked')) return {allowed:false,reason:result.reason};
  throw new ShopLoginError('service_unavailable');
}
export async function checkAppAccess():Promise<AppAccess> {
  const {data,error}=await getSupabase().rpc('shop_account_access').abortSignal(AbortSignal.timeout(15000));
  if(error) throw new ShopLoginError('service_unavailable');
  return parseAppAccess(data);
}
