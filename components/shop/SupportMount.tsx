"use client";
import dynamic from 'next/dynamic';
const Support=dynamic(()=>import('./SupportSession'),{ssr:false,loading:()=> <p role="status">Support laden…</p>});
export default function SupportMount(){return <Support/>;}
