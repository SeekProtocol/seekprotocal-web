import type {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';
import SupportMount from '@/components/shop/SupportMount';
export const metadata:Metadata={title:'Supportdossiers | Seekprotocol',robots:{index:false,follow:false}};
export default async function SupportPage({params}:{params:Promise<{locale:string}>}) {
  const {locale}=await params;setRequestLocale(locale);
  return <main className="shell" style={{paddingTop:150,paddingBottom:80}}>
    <p className="eyebrow">Seekprotocol · Beheer</p><h1 className="t-h2" style={{marginBottom:24}}>Supportdossiers</h1><SupportMount/>
  </main>;
}
