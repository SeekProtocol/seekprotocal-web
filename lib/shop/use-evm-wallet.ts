'use client';
import {useCallback,useEffect,useState} from 'react';
import {connectEvmWallet,type EthereumProvider} from './evm-wallet';

type Wallet={id:string;name:string;provider:EthereumProvider};
export function useEvmWallet() {
  const [wallets,setWallets]=useState<Wallet[]>([]),[selected,setSelected]=useState(''),[account,setAccount]=useState<string|null>(null);
  useEffect(()=>{
    const announce=(event:Event)=>{
      const detail=(event as CustomEvent).detail;
      if(typeof detail?.info?.uuid!=='string'||typeof detail.info.name!=='string'||typeof detail.provider?.request!=='function')return;
      const wallet={id:detail.info.uuid,name:detail.info.name.slice(0,60),provider:detail.provider as EthereumProvider};
      setWallets(current=>current.some(w=>w.provider===wallet.provider||w.id===wallet.id)?current:[...current.filter(w=>w.id!=='injected'),wallet]);
    };
    window.addEventListener('eip6963:announceProvider',announce);
    const ethereum=(window as Window&{ethereum?:EthereumProvider}).ethereum;
    let active=true;
    if(ethereum?.request)queueMicrotask(()=>{if(active)setWallets(current=>current.length?current:[{id:'injected',name:'Browser wallet',provider:ethereum}]);});
    window.dispatchEvent(new Event('eip6963:requestProvider'));
    return()=>{active=false;window.removeEventListener('eip6963:announceProvider',announce);};
  },[]);
  const wallet=wallets.find(w=>w.id===selected)??wallets[0];
  const provider=wallet?.provider;
  useEffect(()=>{
    let active=true;
    const changed=(value:unknown)=>{if(active)setAccount(Array.isArray(value)&&typeof value[0]==='string'?value[0]:null);};
    const disconnected=()=>changed([]);
    if(provider)void provider.request({method:'eth_accounts'}).then(changed,disconnected);else queueMicrotask(disconnected);
    provider?.on?.('accountsChanged',changed);provider?.on?.('disconnect',disconnected);
    return()=>{active=false;provider?.removeListener?.('accountsChanged',changed);provider?.removeListener?.('disconnect',disconnected);};
  },[provider]);
  const connect=useCallback(async()=>{
    if(!provider)throw new Error('wallet_unavailable');
    const address=await connectEvmWallet(provider);setAccount(address);return address;
  },[provider]);
  return {wallets,selected:wallet?.id??'',select:setSelected,account,provider,connect};
}
