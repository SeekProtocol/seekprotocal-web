"use client";
import {useEffect,useState} from 'react';
import {getSupabase} from '@/lib/supabase-browser';
import {mergeEvents,object,text,type AuditEvent,type SupportDossier} from '@/lib/shop/support-dossier';
import SupportDossierView from './SupportDossierView';
import styles from './SupportDesk.module.css';

export default function SupportDesk() {
  const [allowed,setAllowed]=useState<boolean|null>(null),[query,setQuery]=useState(''),[searched,setSearched]=useState(false);
  const [matches,setMatches]=useState<AuditEvent[]>([]),[searchCursor,setSearchCursor]=useState<string|null>(null),[activeQuery,setActiveQuery]=useState('');
  const [dossier,setDossier]=useState<SupportDossier|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const [accessRetry,setAccessRetry]=useState(0);
  useEffect(()=>{
    let active=true;
    void (async()=>{
      try {
        const {data,error}=await getSupabase().rpc('is_dashboard_admin');
        if(error)throw error;
        if(active)setAllowed(data===true);
      } catch {if(active)setError('De toegangscontrole is niet gelukt. Probeer het opnieuw.');}
    })();
    return ()=>{active=false;};
  },[accessRetry]);

  function failed(cause:unknown) {
    const detail=object(cause);
    if(detail.code==='42501'||detail.message==='Forbidden') {
      setDossier(null);setMatches([]);setAllowed(false);
      setError('Je hebt geen toegang tot supportdossiers.');
    } else setError(detail.message==='order_unknown'?'Deze bestelling is niet gevonden. Controleer de referentie.':'Het dossier kon niet volledig worden geladen. Je zoekopdracht blijft staan; probeer het opnieuw.');
  }
  async function search(older=false) {
    if(busy)return;
    const value=older?activeQuery:query.trim();
    if(value.length<3)return;
    setBusy(true);setError('');
    if(!older){setMatches([]);setDossier(null);setSearchCursor(null);setSearched(false);}
    try {
      const {data,error}=await getSupabase().rpc('shop_support_search',{_query:value,_before_id:older?searchCursor:null});
      if(error)throw error;
      const events=data as AuditEvent[];
      if(!Array.isArray(events))throw Error('invalid_response');
      setMatches(current=>older?mergeEvents(current,events):events);
      setSearchCursor(events.length===500?events.at(-1)!.id:null);setActiveQuery(value);setSearched(true);
    } catch(cause){failed(cause);} finally{setBusy(false);}
  }
  async function readPage(id:string,before:string|null=null,through:string|null=null):Promise<SupportDossier> {
    const {data,error}=await getSupabase().rpc('shop_order_support',{_order_id:id,_before_id:before,_through_id:through});
    if(error)throw error;
    if(!data||!Array.isArray(data.events)||typeof data.through_id!=='string')throw Error('invalid_response');
    return data as SupportDossier;
  }
  async function open(id:string) {
    if(busy)return;setBusy(true);setError('');setDossier(null);
    try {setDossier(await readPage(id));}catch(cause){failed(cause);}finally{setBusy(false);}
  }
  async function olderEvents() {
    if(busy||!dossier?.next_before_id)return;setBusy(true);setError('');
    try {
      const page=await readPage(text(dossier.order.id),dossier.next_before_id,dossier.through_id);
      setDossier({...dossier,events:mergeEvents(dossier.events,page.events),next_before_id:page.next_before_id});
    }catch(cause){failed(cause);}finally{setBusy(false);}
  }
  async function download() {
    if(busy||!dossier)return;setBusy(true);setError('');
    try {
      // Reauthorize before exporting retained private data, even with one page.
      const current=await readPage(text(dossier.order.id));
      let events=current.events,cursor=current.next_before_id;
      for(let page=0;cursor!==null;page++){
        if(page>=100)throw Error('export_too_large');
        const next=await readPage(text(current.order.id),cursor,current.through_id);
        if(next.next_before_id===cursor)throw Error('invalid_cursor');
        events=mergeEvents(events,next.events);cursor=next.next_before_id;
      }
      const exported={...current,events,next_before_id:null,exported_at:new Date().toISOString(),complete_through_id:current.through_id};
      const blob=new Blob([JSON.stringify(exported,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');
      link.href=url;link.download=`besteldossier-${text(current.order.id)}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    }catch(cause){failed(cause);}finally{setBusy(false);}
  }
  const orders=[...new Set(matches.map(event=>event.order_id).filter((id):id is string=>!!id))];
  if(allowed===null)return <div className={styles.desk}>{error?<><p role="alert">{error}</p><button type="button" className="btn btn-outline" onClick={()=>{setError('');setAccessRetry(n=>n+1);}}>Opnieuw proberen</button></>:<p role="status">Toegang controleren…</p>}</div>;
  if(!allowed)return <p role="alert">Supportdossiers zijn alleen beschikbaar voor actieve beheerders. Er zijn geen klantgegevens geladen.</p>;
  return <div className={styles.desk}>
    <p>Zoek op volledige bestelreferentie, transactiecode, e-mailadres, account-ID of Friends ID. Deel alleen de gegevens die nodig zijn voor de klantvraag.</p>
    <form className={styles.search} onSubmit={e=>{e.preventDefault();void search();}}>
      <label htmlFor="support-query">Bestelling terugzoeken<input id="support-query" value={query} onChange={e=>setQuery(e.target.value)} maxLength={256} autoComplete="off" spellCheck={false} placeholder="Bestelreferentie of transactiecode"/></label>
      <button className="btn btn-brand" type="submit" disabled={busy||query.trim().length<3}>{busy?'Laden…':'Zoeken'}</button>
    </form>
    {error&&<p role="alert" className={styles.notice}>{error}</p>}
    {searched&&!orders.length&&<p role="status">Geen gekoppelde bestelling gevonden.{matches.length?' Er zijn wel gebeurtenissen van vóór het aanmaken van een bestelling.':''}</p>}
    <ul className={styles.results}>{orders.map(id=><li key={id}><button type="button" disabled={busy} onClick={()=>void open(id)}><strong>{id}</strong><span>Open bestelling en tijdlijn</span></button></li>)}</ul>
    {matches.some(e=>!e.order_id)&&<details><summary>Gebeurtenissen vóór het aanmaken van de bestelling</summary><pre style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{JSON.stringify(matches.filter(e=>!e.order_id),null,2)}</pre></details>}
    {searchCursor&&<button type="button" className="btn btn-outline" disabled={busy} onClick={()=>void search(true)}>Meer zoekresultaten</button>}
    {dossier&&<><div className={styles.toolbar}><button type="button" className="btn btn-outline" disabled={busy} onClick={()=>void open(text(dossier.order.id))}>Dossier vernieuwen</button><button type="button" className="btn btn-outline" disabled={busy} onClick={()=>void download()}>Volledig dossier downloaden</button></div>
      <SupportDossierView dossier={dossier}/>
      {dossier.next_before_id&&<button type="button" className="btn btn-outline" disabled={busy} onClick={()=>void olderEvents()}>Oudere gebeurtenissen laden</button>}
    </>}
  </div>;
}
