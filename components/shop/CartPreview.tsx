"use client";
import {useState} from "react";
import {CheckoutLayout} from "@/components/shop/CheckoutLayout";
import type {CheckoutSelection} from "@/lib/shop/checkout";
import type {ShopProduct} from "@/lib/shop/catalog";
import type {CartItem} from "@/lib/shop/cart";
// Development-only examples: no account, purchase, or live catalog required.
const base = {revision:1,description:"",grants:[],currency:"eur" as const};
const products: ShopProduct[] = [
 {...base,id:"seekar_pack_single",name:"Card pack",kind:"pack",packs:1,priceCents:299,currency:"usd"},
 {...base,id:"seekar_pack_five",name:"5 packs",kind:"pack",packs:5,priceCents:1299,currency:"usd"},
 {...base,id:"seekar_pack_ten",name:"10 packs",kind:"pack",packs:10,priceCents:2399,currency:"usd"},
 {...base,id:"seekar_pass",name:"SeekAR Pass",kind:"pass",priceCents:899},
 ...[
   ["rare_boost","Rare Boost",199], ["coin_magnet","Coin Magnet",199],
   ["xp_boost","XP Boost",99], ["pump_it","Pump It",149],
   ["diamond_hands","Diamond Hands",199], ["spawn_lure","Spawn Lure",249],
 ].map(([key,name,price])=>({...base,id:`seekar_${key}`,name:String(name),kind:"consumable" as const,priceCents:Number(price),grants:[{powerupKey:key === "xp_boost" ? "to_the_moon" : String(key),quantity:1}]})),
 {...base,id:"seekar_boost_bundle",name:"Boost Bundle",kind:"bundle",priceCents:799,grants:[{powerupKey:"rare_boost",quantity:1},{powerupKey:"coin_magnet",quantity:1},{powerupKey:"to_the_moon",quantity:1}]},
];
const context={email:"test@example.test",name:"Test",friends_id:"",beneficiary_id:"test-account",beneficiary_name:"Test",beneficiary_code:"TEST1234",buyer_id:"test-account",is_self:true,version:1};
const resolveContext=async()=>context;
export default function CartPreview(){
 const [items,setItems]=useState<CartItem[]>([]);const [selection,setSelection]=useState<CheckoutSelection|null>(null);const [done,setDone]=useState("");
 return <main style={{padding:"112px 24px 48px",maxWidth:1300,margin:"auto"}}><p role="status">Voorbeeld van het winkelmandje — geen echte bestelling of betaling.</p><CheckoutLayout products={products} items={items} onQuantity={(product,quantity)=>setItems(current=>[...current.filter(item=>item.product.id!==product.id),{product,quantity}].filter(item=>item.quantity>0))} quotedTotal={{priceCents:items.reduce((sum,i)=>sum+(i.product.currency==="usd"?i.product.priceCents:Math.round(i.product.priceCents*1.1))*i.quantity,0),currency:"usd"}} onSol={()=>setDone("Voorbeeld: geen betaling uitgevoerd.")} onRadom={()=>setDone("Voorbeeld: geen betaling uitgevoerd.")} onRefresh={()=>{}} busy={false} connected={true} quoting={false} rateLine="" sol="0.04" quoteError={false} selection={selection} onSelection={setSelection} resolveContext={resolveContext} verificationNote={null} email="test@example.test" flow={<p>{done}</p>}/></main>;
}
