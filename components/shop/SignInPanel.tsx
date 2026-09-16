"use client";

import type {FormEvent,ReactNode} from 'react';
import {useTranslations} from 'next-intl';
import {markToSvgPath} from '@/lib/seek-mark';
import type {SocialProvider} from '@/lib/shop/auth';

const NAMES:Record<SocialProvider,string>={google:'Google',apple:'Apple',discord:'Discord',line:'LINE',tiktok:'TikTok'};
const SEEK_MARK=markToSvgPath(2);

/** Presentation only: login and existing-account checks stay in SignIn. */
export default function SignInPanel({purpose,stage,email,code,busy,errorText,emailError,providers,providersLoaded,
  providerFailure,onProvider,onRetry,onSubmit,onEmailChange,onCodeChange,onChangeEmail,wallet}:{
  purpose:'shop'|'orders';stage:'email'|'code';email:string;code:string;busy:string|null;
  errorText:string;emailError:boolean;providers:SocialProvider[];providersLoaded:boolean;providerFailure:boolean;
  onProvider:(provider:SocialProvider)=>void;onRetry:()=>void;onSubmit:(event:FormEvent)=>void;
  onEmailChange:(value:string)=>void;onCodeChange:(value:string)=>void;onChangeEmail:()=>void;wallet:ReactNode;
}) {
  const t=useTranslations('shop');
  const l=useTranslations('shop.login');
  const visibleProviders:SocialProvider[]=['google','apple','discord','line',...(providers.includes('tiktok')?['tiktok' as const]:[])];
  const unavailable=providersLoaded && visibleProviders.some(provider=>!providers.includes(provider));

  return <div className="shop-signin shop-signin-login">
    <header className="shop-login-header">
      <div className="shop-login-brand"><svg viewBox="0 0 100 100" aria-hidden="true"><path d={SEEK_MARK} fill="currentColor" fillRule="evenodd"/></svg><span>Seekprotocol <span>Shop</span></span></div>
      <h2 className="shop-signin-heading">{l('welcome')}</h2>
      <p className="shop-login-lead">{purpose==='orders'?t('history.signInTitle'):l('intro')}</p>
    </header>

    <div className="shop-signin-options">
      <section className="shop-signin-social" aria-labelledby="shop-social-heading">
        <div className="shop-login-section-head"><h3 id="shop-social-heading">{l('socialHeading')}</h3><p>{l('socialHelp')}</p></div>
        <div className="shop-signin-providers" aria-busy={!providersLoaded}>
          {visibleProviders.map(provider=>{
            const disabled=!providers.includes(provider);
            return <button key={provider} type="button" className="shop-login-provider" data-provider={provider}
              aria-label={l('continueWith',{provider:NAMES[provider]})}
              aria-describedby={providersLoaded && disabled?'shop-provider-status':undefined}
              title={providersLoaded && disabled?l('notAvailable'):undefined}
              disabled={busy!==null || disabled} onClick={()=>onProvider(provider)}>
              <span className="shop-provider-logo"><ProviderGlyph provider={provider}/></span><span>{NAMES[provider]}</span>
              {busy===provider?<Spinner/>:providersLoaded && disabled?<UnavailableGlyph/>:null}
            </button>;
          })}
          {wallet}
        </div>
        {providerFailure?<div className="shop-login-provider-note" id="shop-provider-status">
          <p>{l('methodsFailed')}</p><button type="button" onClick={onRetry}>{t('tryAgain')}</button>
        </div>:unavailable?<p className="shop-login-provider-note" id="shop-provider-status">{l('availabilityNote')}</p>:null}
      </section>

      <section className="shop-signin-email" aria-labelledby="shop-email-heading">
        <div className="shop-login-section-head"><h3 id="shop-email-heading">{l('emailCode')}</h3><p>{l('emailHelp')}</p></div>
        <form onSubmit={onSubmit} className="shop-login-form" noValidate>
          {stage==='code'?<>
            <p className="shop-login-recipient">{t('codeSentTo',{email})}</p>
            <div className="field"><label htmlFor="shop-code" className="field-label">{t('codeLabel')}</label>
              <input id="shop-code" name="code" type="text" className="shop-login-code-input" autoComplete="one-time-code"
                inputMode="numeric" pattern="[0-9]*" maxLength={8} value={code} onChange={e=>onCodeChange(e.target.value.replace(/\D/g,''))} autoFocus
                aria-invalid={emailError || undefined} aria-describedby={emailError?'shop-login-email-error':undefined} disabled={busy!==null}/>
            </div>
          </>:<div className="field"><label htmlFor="shop-email" className="field-label">{t('emailLabel')}</label>
            <div className="shop-login-email-field"><MailGlyph/><input id="shop-email" name="email" type="email" autoComplete="email" inputMode="email"
              maxLength={256} placeholder={t('emailPlaceholder')} value={email} onChange={e=>onEmailChange(e.target.value)}
              aria-invalid={emailError || undefined} aria-describedby={emailError?'shop-login-email-error':undefined} disabled={busy!==null}/></div>
          </div>}
          {emailError && errorText && <p id="shop-login-email-error" className="shop-login-field-error" role="alert">{errorText}</p>}
          <button type="submit" className="shop-signin-submit" disabled={busy!==null}>
            <span>{stage==='email'?(busy==='email'?t('sendingCode'):t('sendCode')):(busy==='code'?t('verifying'):t('verifyCode'))}</span>
            {busy===stage?<Spinner/>:<ArrowGlyph/>}
          </button>
          {stage==='code' && <button type="button" className="shop-login-change" disabled={busy!==null} onClick={onChangeEmail}><ArrowGlyph/>{t('useAnotherEmail')}</button>}
        </form>
      </section>
    </div>

    {busy==='callback' && <p role="status" className="shop-login-status"><Spinner/>{t('verifying')}</p>}
    {!emailError && errorText && <p className="shop-login-status shop-login-field-error" role="alert">{errorText}</p>}
    <footer className="shop-login-footnote"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 6v2"/></svg><p>{l('accountNote')}</p></footer>
  </div>;
}

function MailGlyph(){return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></svg>;}
function ArrowGlyph(){return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>;}
function UnavailableGlyph(){return <svg className="shop-provider-state" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/></svg>;}
function Spinner(){return <span className="shop-flow-spinner" aria-hidden="true"/>;}
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
