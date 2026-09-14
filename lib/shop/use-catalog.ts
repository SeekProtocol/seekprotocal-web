"use client";
import { useCallback, useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase-browser';
import { parseWebCatalog, type ShopProduct } from './catalog';

export function useCatalog() {
  const [products,setProducts]=useState<ShopProduct[] | null>(null);
  const [failed,setFailed]=useState(false);
  const [loading,setLoading]=useState(true);
  const [tick,setTick]=useState(0);
  const refresh=useCallback(()=>setTick(n=>n+1),[]);
  useEffect(()=>{
    let active=true;
    let pending=false;
    let controller: AbortController | undefined;
    const load=async()=>{
      if (pending) return;
      pending=true;
      controller=new AbortController();
      const timeout=setTimeout(()=>controller?.abort(),12000);
      setLoading(true);
      try {
        const {data,error}=await getSupabase().rpc('shop_catalog',{_channel:'web'}).abortSignal(controller.signal);
        if (error) throw error;
        const result=parseWebCatalog(data);
        if (active) {setProducts(result);setFailed(false);}
      } catch {if (active) setFailed(true);}
      finally {clearTimeout(timeout);pending=false;if (active) setLoading(false);}
    };
    void load();
    const onVisible=()=>{if (document.visibilityState==='visible') void load();};
    const interval=setInterval(onVisible,60000);
    document.addEventListener('visibilitychange',onVisible);
    return ()=>{active=false;controller?.abort();pending=false;clearInterval(interval);document.removeEventListener('visibilitychange',onVisible);};
  },[tick]);
  return {products,failed,loading,refresh};
}
