"use client";

import {useEffect,useState,type FormEvent} from 'react';
import {useLocale,useTranslations} from 'next-intl';
import {getPathname,useRouter} from '@/i18n/navigation';
import {shopReturnPath} from '@/lib/shop/checkout-return';
import {getSupabase} from '@/lib/supabase-browser';
import {availableSocialProviders,finishSocialLogin,hasSocialLoginReturn,startSocialLogin,type SocialProvider} from '@/lib/shop/auth';
import ShopProviders from './ShopProviders';
import WalletSignIn from './WalletSignIn';

const EMAIL_REGEX=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAMES:Record<SocialProvider,string>={google:'Google',apple:'Apple',discord:'Discord',line:'LINE',tiktok:'TikTok'};

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
  const visibleProviders:SocialProvider[]=['google','apple','discord','line',...(providers.includes('tiktok')?['tiktok' as const]:[])];

  return <div className="card shop-signin shop-signin-login">
    <div>
      <p className="eyebrow">{t(purpose==='orders'?'history.signInTitle':'signInTitle')}</p>
      <h2 className="shop-signin-heading">{l('heading')}</h2>
      <p className="t-small text-muted">{l('existingOnly')}</p>
    </div>
    <div className="shop-signin-options">
      <section className="shop-signin-social" aria-labelledby="shop-social-heading">
        <h3 id="shop-social-heading" className="shop-signin-method-heading">{l('methods')}</h3>
        <div className="shop-signin-providers">
          {visibleProviders.map(provider=><button key={provider} type="button" className="btn btn-outline btn-lg"
            aria-label={l('continueWith',{provider:NAMES[provider]})}
            aria-describedby={providersLoaded && !providers.includes(provider)?`shop-provider-${provider}-status`:undefined}
            disabled={busy!==null || !providers.includes(provider)} onClick={()=>void oauth(provider)}>
            <ProviderGlyph provider={provider}/><span>{NAMES[provider]}</span>
            {providersLoaded && !providers.includes(provider) && <span id={`shop-provider-${provider}-status`} className="shop-provider-unavailable">{l('notAvailable')}</span>}
          </button>)}
          <ShopProviders><WalletSignIn disabled={busy!==null} onSuccess={completed}
            onBusy={value=>setBusy(value?'wallet':null)} onError={setError}/></ShopProviders>
        </div>
        {providerFailure && <div className="shop-login-retry"><p className="t-small text-muted">{l('methodsFailed')}</p>
          <button className="btn btn-ghost btn-sm" type="button" onClick={()=>{setProvidersLoaded(false);setProviderRetry(n=>n+1);}}>{t('tryAgain')}</button></div>}
      </section>
      <section className="shop-signin-email" aria-labelledby="shop-email-heading">
        <div>
          <h3 id="shop-email-heading" className="shop-signin-method-heading">{l('emailCode')}</h3>
          <p className="t-small text-muted">{l('emailHelp')}</p>
        </div>
        <form onSubmit={submit} className="stack gap-sm" noValidate>
          {stage==='code'?<>
            <p className="t-small">{t('codeSentTo',{email})}</p>
            <div className="field"><label htmlFor="shop-code" className="field-label">{t('codeLabel')}</label>
              <input id="shop-code" name="code" type="text" className="input shop-code-input" autoComplete="one-time-code"
                inputMode="numeric" pattern="[0-9]*" maxLength={8} value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,''))} autoFocus/></div>
          </>:<div className="field"><label htmlFor="shop-email" className="field-label">{t('emailLabel')}</label>
            <input id="shop-email" name="email" type="email" className="input" autoComplete="email" inputMode="email"
              maxLength={256} placeholder={t('emailPlaceholder')} value={email} onChange={e=>setEmail(e.target.value)}/></div>}
          <button type="submit" className="btn btn-brand" disabled={busy!==null}>
            {stage==='email'?(busy==='email'?t('sendingCode'):t('sendCode')):(busy==='code'?t('verifying'):t('verifyCode'))}
          </button>
          {stage==='code' && <button type="button" className="btn btn-ghost" disabled={busy!==null} onClick={()=>{setStage('email');setError('');}}>{t('useAnotherEmail')}</button>}
        </form>
      </section>
    </div>
    {busy==='callback' && <p role="status" className="t-small">{t('verifying')}</p>}
    {errorText && <p className="form-status form-status-error" role="alert">{errorText}</p>}
    <p className="shop-login-footnote t-small text-muted">{l('noAccount')}</p>
  </div>;
}

function ProviderGlyph({provider}:{provider:SocialProvider}) {
  if(provider==='google') return <GoogleGlyph/>;
  if(provider==='apple') return <AppleGlyph/>;
  if(provider==='discord') return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.7 5.4a18 18 0 0 0-4.4-1.4l-.5 1a16.8 16.8 0 0 0-5.6 0l-.5-1a18 18 0 0 0-4.4 1.4C1.5 9.6.7 13.7 1.1 17.8a18 18 0 0 0 5.4 2.7l1.1-1.8-1.7-.8.4-.3a13.4 13.4 0 0 0 11.4 0l.4.3-1.7.8 1.1 1.8a18 18 0 0 0 5.4-2.7c.5-4.8-.8-8.9-3.2-12.4ZM8.5 15.3c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Zm7 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Z"/></svg>;
  if(provider==='line') return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M21 10.5C21 6.4 17 3 12 3S3 6.4 3 10.5s4 7.5 9 7.5v3c4-2 9-6 9-10.5Z"/><path d="M7 8v5h2m2-5v5m3 0V8l3 5V8"/></svg>;
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M14 3v13a4 4 0 1 1-4-4m4-9c1 4 3 5 6 5"/></svg>;
}
function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M12 10.2v3.9h5.5c-.25 1.4-1.65 4.1-5.5 4.1-3.3 0-6-2.75-6-6.1s2.7-6.1 6-6.1c1.9 0 3.15.8 3.85 1.5l2.65-2.55C16.8 3.35 14.6 2.3 12 2.3 6.65 2.3 2.3 6.65 2.3 12s4.35 9.7 9.7 9.7c5.6 0 9.3-3.95 9.3-9.5 0-.65-.05-1.15-.15-1.65Z" />
    </svg>
  );
}

function AppleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M16.4 12.7c0-2.5 2.05-3.7 2.15-3.75-1.15-1.7-2.95-1.95-3.6-1.95-1.55-.15-3 .9-3.8.9-.8 0-2-.9-3.3-.85-1.7.05-3.25 1-4.1 2.5-1.75 3.05-.45 7.55 1.25 10 .85 1.2 1.85 2.55 3.15 2.5 1.25-.05 1.75-.8 3.25-.8s1.95.8 3.3.8c1.35-.05 2.2-1.25 3.05-2.45.95-1.4 1.35-2.75 1.4-2.8-.05-.05-2.75-1.05-2.75-4.1ZM13.9 5.35c.7-.85 1.15-2 1.05-3.15-1 .05-2.2.65-2.9 1.5-.65.75-1.2 1.95-1.05 3.1 1.1.1 2.2-.55 2.9-1.45Z" />
    </svg>
  );
}
