"use client";

import {useState} from 'react';
import {useWallet} from '@solana/wallet-adapter-react';
import {useWalletModal} from '@solana/wallet-adapter-react-ui';
import {useTranslations} from 'next-intl';
import {getSupabase} from '@/lib/supabase-browser';

export default function WalletSignIn({disabled,onSuccess,onBusy,onError}:{
  disabled:boolean;onSuccess:()=>void;onBusy:(busy:boolean)=>void;onError:(reason:string)=>void;
}) {
  const t=useTranslations('shop.login');
  const {wallet,connect,publicKey,signMessage,connected,connecting}=useWallet();
  const {setVisible}=useWalletModal();
  const [signing,setSigning]=useState(false);
  async function login() {
    onError('');
    if(!wallet) { setVisible(true); return; }
    if(!connected || !publicKey) {
      try { await connect(); } catch { onError('wallet_failed'); }
      return;
    }
    if(!signMessage) { onError('wallet_cannot_sign'); return; }
    setSigning(true);onBusy(true);
    try {
      const address=publicKey.toBase58();
      const call=async(body:Record<string,unknown>)=>{
        const {data,error}=await getSupabase().functions.invoke('solana-wallet',{body});
        if(error || data?.error) {
          let reason=data?.error;
          if(error?.context instanceof Response) {
            try { reason=(await error.context.json()).error; } catch { /* generic message */ }
          }
          throw new Error(reason==='wallet_not_linked'?'app_account_required':reason==='account_blocked'?'account_blocked':'wallet_failed');
        }
        return data;
      };
      const challenge=await call({action:'login_challenge',address});
      if(typeof challenge.message!=='string' || typeof challenge.nonce!=='string' || !challenge.message || !challenge.nonce) throw new Error('wallet_failed');
      const signature=await signMessage(new TextEncoder().encode(challenge.message));
      const verified=await call({action:'login',address,nonce:challenge.nonce,signature:btoa(String.fromCharCode(...signature))});
      if(typeof verified.token_hash!=='string' || !verified.token_hash) throw new Error('wallet_failed');
      const {data,error}=await getSupabase().auth.verifyOtp({token_hash:verified.token_hash,type:'magiclink'});
      if(error || !data.session) throw new Error('wallet_failed');
      onSuccess();
    } catch(error) { onError(error instanceof Error?error.message:'wallet_failed'); }
    finally { setSigning(false);onBusy(false); }
  }
  return <div className="shop-wallet-login">
    <button type="button" className="btn btn-outline btn-lg" aria-label={signing?t('walletSigning'):connected?t('walletSignIn'):wallet?t('connectWallet'):t('wallet')} disabled={disabled || connecting || signing} onClick={()=>void login()}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M20 7H5a2 2 0 0 1 0-4h13v4M3 5v14a2 2 0 0 0 2 2h15V7M16 12h5v5h-5z"/></svg>
      <span>{signing?t('walletSigning'):connected?t('walletSignIn'):wallet?t('connectWallet'):'Solana'}</span>
    </button>
    {wallet && <button type="button" className="btn btn-ghost btn-sm shop-wallet-login-change" disabled={disabled || connecting || signing} onClick={()=>setVisible(true)}>{t('changeWallet')}</button>}
  </div>;
}
