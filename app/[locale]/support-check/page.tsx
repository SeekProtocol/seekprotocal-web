import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import SupportPreview from '@/components/shop/SupportPreview';
export const metadata:Metadata={title:'Voorbeeld supportdossier',robots:{index:false,follow:false}};
export default function SupportCheckPage(){if(process.env.NODE_ENV!=='development')notFound();return <SupportPreview/>;}
