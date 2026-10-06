"use client";

import { useId } from "react";
import type { ShopProduct } from "@/lib/shop/catalog";
import { markToSvgPath } from "@/lib/seek-mark";
import AppProductArt from "./AppProductArt";

const SEEK_MARK = markToSvgPath(2);
/** The app finishes: blue Basic, violet/gold Premium, black/gold Elite. */
export default function ProductArt({ product }: { product: ShopProduct }) {
  return product.kind === "pack" ? <PackArt product={product} /> : <AppProductArt product={product} />;
}

function PackArt({ product }: { product: ShopProduct }) {
  const id = `product-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const visual = "pack";
  const tier = product.pack?.tier;
  const [light, accent, shade] = tier === "elite" ? ["#fff0b8", "#ffd36a", "#9c7133"] : tier === "premium" ? ["#ebddff", "#c79bff", "#69439d"] : ["#c4f6ff", "#53c9ff", "#3764bd"];
  const foil = tier === "elite" ? ["#332818", "#090909", "#49371a", "#080807"] : tier === "premium" ? ["#683d98", "#221239", "#58316e", "#170e2b"] : ["#2e536b", "#102132", "#23445a", "#0b182b"];
  const fill = (name: string) => `url(#${id}-${name})`;
  return <svg className="shop-product-illustration" data-visual={visual} data-tier={tier} viewBox="0 0 240 176" fill="none" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id={`${id}-accent`} x1=".15" y1="0" x2=".85" y2="1"><stop stopColor={light}/><stop offset=".4" stopColor={accent}/><stop offset="1" stopColor={shade}/></linearGradient>
      <linearGradient id={`${id}-body`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#30435a"/><stop offset=".45" stopColor="#142335"/><stop offset="1" stopColor="#0a121f"/></linearGradient>
      <linearGradient id={`${id}-foil`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={foil[0]}/><stop offset=".3" stopColor={foil[1]}/><stop offset=".58" stopColor={foil[2]}/><stop offset="1" stopColor={foil[3]}/></linearGradient>
      <linearGradient id={`${id}-brand`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#dba3ff"/><stop offset=".5" stopColor="#8aaaff"/><stop offset="1" stopColor="#80edd8"/></linearGradient>
      <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff3c1"/><stop offset=".45" stopColor="#efbd63"/><stop offset="1" stopColor="#b87b31"/></linearGradient>
      <radialGradient id={`${id}-halo`}><stop stopColor={accent} stopOpacity=".15"/><stop offset="1" stopColor={accent} stopOpacity="0"/></radialGradient>
      <filter id={`${id}-shadow`} x="-45%" y="-35%" width="190%" height="190%"><feDropShadow dx="0" dy="7" stdDeviation="5" floodColor="#020813" floodOpacity=".4"/></filter>
      {visual === "pack" && <g id={`${id}-packet`}>
        <path d="M79 19h82l-2 6 2 6-2 6 2 6v98l-2 6 2 6-2 6H79l2-6-2-6 2-6V43l-2-6 2-6-2-6Z" fill={fill("foil")} stroke={accent} strokeWidth="1"/>
        <path d="M82 29h76M82 33h76M82 37h76M82 145h76M82 149h76M82 153h76" stroke={tier ? "#e8c76f" : "#90d7ed"} strokeOpacity=".28"/>
        <path d="M86 43v96M154 43v96" stroke="#adcfe0" strokeOpacity=".2"/>
        <path d="m86 139 68-96v45l-35 51Z" fill="#80d9ff" fillOpacity=".06"/>
        <text x="120" y="56" textAnchor="middle" fill="#dcf3ff" fontSize="7.5" fontWeight="700" letterSpacing=".35" fontFamily="sans-serif">Seekprotocol</text>
        <g transform="translate(96 69) scale(.48)"><path d={SEEK_MARK} fill={fill("brand")} fillRule="evenodd"/></g>
        {tier === "elite" && <path d="m90 45 6-5h48l6 5v88l-6 5H96l-6-5Z" stroke="#e9c46a" strokeOpacity=".65"/>}
        <text x="120" y="130" textAnchor="middle" fill={light} fontSize="7" letterSpacing="1.8" fontFamily="sans-serif">{tier ? tier.toUpperCase() : 'ARENA'}</text>
      </g>}
    </defs>
    <ellipse cx="120" cy="99" rx="111" ry="74" fill={fill("halo")}/>
    <ellipse cx="120" cy="156" rx="49" ry="5" fill="#061022" opacity=".18"/>
    <g filter={fill("shadow")}>
      {visual === "pack" && <>
        {(product.packs ?? 1) >= 10 && <>
          <use href={`#${id}-packet`} transform="translate(-29 8) rotate(-22 120 90) scale(.97)"/>
          <use href={`#${id}-packet`} transform="translate(33 9) rotate(24 120 90) scale(.97)"/>
        </>}
        {(product.packs ?? 1) > 1 && <>
          <use href={`#${id}-packet`} transform="translate(-15 3) rotate(-13 120 90)"/>
          <use href={`#${id}-packet`} transform="translate(19 3) rotate(14 120 90)"/>
        </>}
        <use href={`#${id}-packet`} transform="rotate(-5 120 90)"/>
        {(product.packs ?? 1) > 1 && <g transform="translate(155 126)">
          <rect width="34" height="29" rx="8" fill="#b9eeff" stroke="#e4f8ff"/>
          <text x="17" y="20" textAnchor="middle" fontSize="17" fontFamily="sans-serif" fontWeight="800" fill="#18374d">{product.packs}</text>
        </g>}
      </>}
    </g>
  </svg>;
}
