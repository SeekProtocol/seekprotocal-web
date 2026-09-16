import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import OrderHistoryPreview from '@/components/shop/OrderHistoryPreview';
export const metadata:Metadata={title:'Order history preview',robots:{index:false,follow:false}};
export default async function Page({params,searchParams}:{params:Promise<{locale:string}>;searchParams:Promise<{viewport?:string}>}){
 if(process.env.NODE_ENV!=='development')notFound();
 const {locale}=await params;
 if((await searchParams).viewport==='mobile')return <div style={{padding:'100px 0 24px',display:'grid',justifyContent:'center'}}><iframe title="Mobile order history preview" src={`/${locale}/orders-check`} width={390} height={1000} style={{border:'1px solid #333',maxWidth:'100%'}}/></div>;
 return <OrderHistoryPreview/>;
}
