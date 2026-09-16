"use client";

import {useEffect,useState,type FormEvent} from 'react';
import {useLocale,useTranslations} from 'next-intl';
import {getPathname,useRouter} from '@/i18n/navigation';
import {shopReturnPath} from '@/lib/shop/checkout-return';
import {getSupabase} from '@/lib/supabase-browser';
import {availableSocialProviders,finishSocialLogin,hasSocialLoginReturn,startSocialLogin,type SocialProvider} from '@/lib/shop/auth';
import ShopProviders from './ShopProviders';
import WalletSignIn from './WalletSignIn';
import SignInPanel from './SignInPanel';

const EMAIL_REGEX=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Every entry uses the app's existing identity. This screen has no signup path. */
export default function SignIn({purpose='shop'}:{purpose?:'shop'|'orders'}) {
  const t=useTranslations('shop');
  const l=useTranslations('shop.login');
  const locale=useLocale();
  const router=useRouter();
  const [stage,setStage]=useState<'email'|'code'>('email');
  const [email,setEmail]=useState('');
  const [code,setCode]=useState('');
  const [busy,setBusy]=useState<string|null>(null);
  const [error,setError]=useState('');
  const [providers,setProviders]=useState<SocialProvider[]>([]);
  const [providersLoaded,setProvidersLoaded]=useState(false);
  const [providerRetry,setProviderRetry]=useState(0);
  const [providerFailure,setProviderFailure]=useState(false);
  const returnUrl=()=>`${window.location.origin}${shopReturnPath(getPathname({href:'/shop',locale}),window.location.search)}`;
  const completed=()=>router.replace(shopReturnPath('/shop',window.location.search));

  function message(reason:string) {
    if(!reason) return '';
    if(reason==='app_account_required') return l('appRequired');
    if(reason==='account_blocked') return t('errAccountBlocked');
    if(reason==='rate_limited') return t('errRateLimited');
    if(reason==='provider_unavailable' || reason==='service_unavailable') return l('unavailable');
    if(reason==='login_expired') return l('expired');
    if(reason==='wallet_cannot_sign') return l('walletCannotSign');
    if(reason==='wallet_failed') return l('walletFailed');
    return t('signInFailed');
  }

  useEffect(()=>{
    let active=true;
    availableSocialProviders().then(result=>{
      if(active) { setProviders(result);setProviderFailure(false); }
    }).catch(()=>{if(active) setProviderFailure(true);}).finally(()=>{if(active) setProvidersLoaded(true);});
    return ()=>{active=false;};
  },[providerRetry]);

  useEffect(()=>{
    let active=true;
    if(!hasSocialLoginReturn()) return;
    queueMicrotask(()=>{if(active) setBusy('callback');});
    finishSocialLogin().then(done=>{
      if(active && done) router.replace(shopReturnPath('/shop',window.location.search));
    }).catch(reason=>{
      if(active) setError(reason instanceof Error?reason.message:'sign_in_failed');
    }).finally(()=>{if(active) setBusy(null);});
    return ()=>{active=false;};
  },[router]);

  async function oauth(provider:SocialProvider) {
    setBusy(provider);setError('');
    try { await startSocialLogin(provider,returnUrl()); }
    catch(reason) { setError(reason instanceof Error?reason.message:'sign_in_failed');setBusy(null); }
  }
  async function submit(event:FormEvent) {
    event.preventDefault();setError('');
    const trimmed=email.trim();
    if(!EMAIL_REGEX.test(trimmed)) {setError('email_invalid');return;}
    setBusy(stage);
    try {
      if(stage==='email') {
        const {error:authError}=await getSupabase().auth.signInWithOtp({email:trimmed,
          options:{emailRedirectTo:returnUrl(),shouldCreateUser:false}});
        if(authError) {setError(authError.status===429?'rate_limited':'email_not_sent');return;}
        setEmail(trimmed);setCode('');setStage('code');
      } else {
        const token=code.replace(/\D/g,'');
        if(token.length<6) {setError('code_invalid');return;}
        const {data,error:authError}=await getSupabase().auth.verifyOtp({email:trimmed,token,type:'email'});
        if(authError || !data.session) {setError('code_invalid');return;}
        completed();
      }
    } catch {setError('service_unavailable');}
    finally {setBusy(null);}
  }
  const errorText=error==='email_invalid'?t('emailInvalid'):error==='code_invalid'?t('codeInvalid')
    :error==='email_not_sent'?l('emailNotSent'):message(error);

  return <SignInPanel purpose={purpose} stage={stage} email={email} code={code} busy={busy}
    errorText={errorText} emailError={['email_invalid','code_invalid','email_not_sent'].includes(error)}
    providers={providers} providersLoaded={providersLoaded} providerFailure={providerFailure}
    onProvider={provider=>void oauth(provider)}
    onRetry={()=>{setProvidersLoaded(false);setProviderRetry(n=>n+1);}}
    onSubmit={submit} onEmailChange={setEmail} onCodeChange={setCode}
    onChangeEmail={()=>{setStage('email');setCode('');setError('');}}
    wallet={<ShopProviders><WalletSignIn disabled={busy!==null} onSuccess={completed}
      onBusy={value=>setBusy(value?'wallet':null)} onError={setError}/></ShopProviders>} />;
}
