"use client";
import {useState} from "react";
import {CheckoutLayout} from "@/components/shop/CheckoutLayout";
import type {CheckoutSelection} from "@/lib/shop/checkout";
import {visibleShopProducts, type ShopProduct} from "@/lib/shop/catalog";
import {PAYMENT_ASSETS,formatPaymentAmount,type PaymentAsset} from "@/lib/shop/payment-assets";
import type {CartItem} from "@/lib/shop/cart";
// Development-only examples: no account, purchase, or live catalog required.
const base = {revision:1,description:"",grants:[],currency:"eur" as const};
const products: ShopProduct[] = visibleShopProducts([
 {...base,id:"seekar_pack_basic",name:"Basic pack",kind:"pack",packs:1,priceCents:199,currency:"usd",pack:{"tier":"basic","policy_version":"arena-balance-v1-seek02-20261006-tiers","points_per_pack":100,"slots":[{"slot":0,"card_rarity":"common","weight":1000},{"slot":1,"card_rarity":"common","weight":1000},{"slot":2,"card_rarity":"common","weight":1000},{"slot":3,"card_rarity":"uncommon","weight":1000},{"slot":4,"card_rarity":"uncommon","weight":800},{"slot":4,"card_rarity":"rare","weight":180},{"slot":4,"card_rarity":"epic","weight":20}]}},
 {...base,id:"seekar_pack_premium",name:"Premium pack",kind:"pack",packs:1,priceCents:249,currency:"usd",pack:{"tier":"premium","policy_version":"arena-balance-v1-seek02-20261006-tiers","points_per_pack":200,"slots":[{"slot":0,"card_rarity":"common","weight":1000},{"slot":1,"card_rarity":"common","weight":1000},{"slot":2,"card_rarity":"uncommon","weight":1000},{"slot":3,"card_rarity":"uncommon","weight":1000},{"slot":4,"card_rarity":"rare","weight":820},{"slot":4,"card_rarity":"epic","weight":150},{"slot":4,"card_rarity":"legendary","weight":26},{"slot":4,"card_rarity":"mythic","weight":4}]}},
 {...base,id:"seekar_pack_elite",name:"Elite pack",kind:"pack",packs:1,priceCents:599,currency:"usd",pack:{"tier":"elite","policy_version":"arena-balance-v1-seek02-20261006-tiers","points_per_pack":500,"slots":[{"slot":0,"card_rarity":"uncommon","weight":1000},{"slot":1,"card_rarity":"uncommon","weight":1000},{"slot":2,"card_rarity":"rare","weight":1000},{"slot":3,"card_rarity":"rare","weight":1000},{"slot":4,"card_rarity":"epic","weight":800},{"slot":4,"card_rarity":"legendary","weight":170},{"slot":4,"card_rarity":"mythic","weight":30}]}},
 {...base,id:"seekar_pass",name:"Season Pass",kind:"pass",priceCents:995},
 ...[
   ["rare_boost","Rare Boost",199], ["coin_magnet","Coin Magnet",199],
   ["xp_boost","XP Boost",99], ["pump_it","Pump It",149],
   ["diamond_hands","Diamond Hands",299], ["spawn_lure","Spawn Lure",249],
   ["cash","Cash",79], ["fitness","Fitness",149], ["chill_guy","Chill Guy",199], ["this_is_fine","This Is Fine",299],
 ].map(([key,name,price])=>({...base,id:`seekar_${key}`,name:String(name),kind:"consumable" as const,priceCents:Number(price),grants:[{powerupKey:key === "xp_boost" ? "to_the_moon" : String(key),quantity:1}]})),
 {...base,id:"seekar_boost_bundle",name:"Boost Bundle",kind:"bundle",priceCents:799,grants:[{powerupKey:"rare_boost",quantity:1},{powerupKey:"coin_magnet",quantity:1},{powerupKey:"to_the_moon",quantity:1}]},
]);
const context={email:"test@example.test",name:"Test",friends_id:"",beneficiary_id:"test-account",beneficiary_name:"Test",beneficiary_code:"TEST1234",buyer_id:"test-account",is_self:true,version:1};
const resolveContext=async()=>context;
export default function CartPreview(){
 const [asset,setAsset]=useState<PaymentAsset>("USDC");
 const [items,setItems]=useState<CartItem[]>([]);const [selection,setSelection]=useState<CheckoutSelection|null>(null);const [done,setDone]=useState("");
 const totalCents=items.reduce((sum,i)=>sum+(i.product.currency==="usd"?i.product.priceCents:Math.round(i.product.priceCents*1.1))*i.quantity,0);
 // Fixed example rates for this clearly labelled preview, never a live quote.
 const exampleRate={SOL:32500,USDC:100,USDT:100,BNB:86500,ETH:370000}[asset];
 const units=(BigInt(totalCents)*BigInt(10)**BigInt(PAYMENT_ASSETS[asset].decimals)+BigInt(exampleRate)-BigInt(1))/BigInt(exampleRate);
 return <main style={{padding:"112px 24px 48px",maxWidth:1300,margin:"auto"}}><p role="status">Voorbeeld van het winkelmandje — geen echte bestelling of betaling.</p><CheckoutLayout products={products} items={items} onQuantity={(product,quantity)=>setItems(current=>[...current.filter(item=>item.product.id!==product.id),{product,quantity}].filter(item=>item.quantity>0))} quotedTotal={{priceCents:totalCents,currency:"usd"}} onSol={()=>setDone("Voorbeeld: geen betaling uitgevoerd.")} asset={asset} assets={["USDC","USDT","SOL","BNB","ETH"]} onAsset={setAsset} onRefresh={()=>{}} busy={false} connected={true} quoting={false} rateLine="" sol={formatPaymentAmount(units,asset)} quoteError={false} selection={selection} onSelection={setSelection} resolveContext={resolveContext} verificationNote={null} email="test@example.test" flow={<p>{done}</p>}/></main>;
}
