"use client";

import { useId } from "react";
import type { ShopProduct } from "@/lib/shop/catalog";
import { markToSvgPath } from "@/lib/seek-mark";

const SEEK_MARK = markToSvgPath(2);
const COLORS: Record<string, [string, string, string]> = {
  pack: ["#c4f6ff", "#53c9ff", "#3764bd"],
  pass: ["#fff2c2", "#e5bf70", "#94703a"],
  rare_boost: ["#f4d8ff", "#c28aff", "#7544d6"],
  coin_magnet: ["#ffd6c6", "#ff9276", "#bf4a56"],
  xp_boost: ["#d2fff5", "#64e5c0", "#269e99"],
  pump_it: ["#ffe8c5", "#ffb15c", "#d26949"],
  diamond_hands: ["#d5f9ff", "#65cfff", "#367ecc"],
  spawn_lure: ["#e2ffcf", "#a0df77", "#458f76"],
  bundle: ["#d7e2ff", "#97adff", "#6576d6"],
};

/** Decorative product illustrations, shared by the catalog and cart. Geometry
 * and color identify the product; the text beside it remains authoritative. */
export default function ProductArt({ product }: { product: ShopProduct }) {
  const id = `product-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const powerupKey = product.grants[0]?.powerupKey;
  const visual = product.kind === "consumable"
    ? powerupKey === "to_the_moon" ? "xp_boost" : powerupKey ?? "boost"
    : product.kind;
  const [light, accent, shade] = COLORS[visual] ?? COLORS.xp_boost;
  const fill = (name: string) => `url(#${id}-${name})`;
  const gem = <>
    <path d="m120 38 33 19 13 22-46 52-46-52 13-22Z" fill={fill("accent")} stroke={light} strokeWidth="1.2" />
    <path d="m87 57 33-19 33 19-33 22Z" fill={light} fillOpacity=".82" />
    <path d="m74 79 46 52-19-52Z" fill={shade} />
    <path d="m166 79-46 52 19-52Z" fill={accent} />
    <path d="m101 79 19-41 19 41-19 52Z" fill={light} fillOpacity=".4" />
    <path d="M74 79h92M87 57h66" fill="none" stroke={light} strokeOpacity=".7" />
  </>;

  return <svg className="shop-product-illustration" data-visual={visual} viewBox="0 0 240 176" fill="none" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id={`${id}-accent`} x1=".15" y1="0" x2=".85" y2="1"><stop stopColor={light}/><stop offset=".4" stopColor={accent}/><stop offset="1" stopColor={shade}/></linearGradient>
      <linearGradient id={`${id}-body`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#30435a"/><stop offset=".45" stopColor="#142335"/><stop offset="1" stopColor="#0a121f"/></linearGradient>
      <linearGradient id={`${id}-foil`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#2e536b"/><stop offset=".3" stopColor="#102132"/><stop offset=".58" stopColor="#23445a"/><stop offset="1" stopColor="#0b182b"/></linearGradient>
      <linearGradient id={`${id}-brand`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#dba3ff"/><stop offset=".5" stopColor="#8aaaff"/><stop offset="1" stopColor="#80edd8"/></linearGradient>
      <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff3c1"/><stop offset=".45" stopColor="#efbd63"/><stop offset="1" stopColor="#b87b31"/></linearGradient>
      <radialGradient id={`${id}-halo`}><stop stopColor={accent} stopOpacity=".15"/><stop offset="1" stopColor={accent} stopOpacity="0"/></radialGradient>
      <filter id={`${id}-shadow`} x="-45%" y="-35%" width="190%" height="190%"><feDropShadow dx="0" dy="7" stdDeviation="5" floodColor="#020813" floodOpacity=".4"/></filter>
      {visual === "pack" && <g id={`${id}-packet`}>
        <path d="M79 19h82l-2 6 2 6-2 6 2 6v98l-2 6 2 6-2 6H79l2-6-2-6 2-6V43l-2-6 2-6-2-6Z" fill={fill("foil")} stroke="#72b7d4" strokeWidth="1"/>
        <path d="M82 29h76M82 33h76M82 37h76M82 145h76M82 149h76M82 153h76" stroke="#90d7ed" strokeOpacity=".28"/>
        <path d="M86 43v96M154 43v96" stroke="#adcfe0" strokeOpacity=".2"/>
        <path d="m86 139 68-96v45l-35 51Z" fill="#80d9ff" fillOpacity=".06"/>
        <text x="120" y="56" textAnchor="middle" fill="#dcf3ff" fontSize="8" fontWeight="700" letterSpacing="2" fontFamily="sans-serif">SEEKAR</text>
        <g transform="translate(96 69) scale(.48)"><path d={SEEK_MARK} fill={fill("brand")} fillRule="evenodd"/></g>
        <text x="120" y="132" textAnchor="middle" fill="#c0e9f9" fontSize="7" letterSpacing="2.8" fontFamily="sans-serif">ARENA</text>
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
      {visual === "pass" && <g transform="rotate(-10 120 88)">
        <rect x="69" y="21" width="103" height="137" rx="12" fill={fill("body")} stroke={fill("accent")} strokeWidth="1.5"/>
        <rect x="75" y="27" width="91" height="125" rx="8" stroke={accent} strokeOpacity=".3"/>
        <path d="m75 106 91-58v28l-91 58Z" fill={accent} fillOpacity=".08"/>
        <text x="87" y="44" fill={light} fontSize="8" fontWeight="700" letterSpacing="1.3" fontFamily="sans-serif">SEEKAR</text>
        <path d="m91 71 18 14 11-27 12 27 18-14-6 34H97Z" fill={fill("accent")} stroke={light} strokeWidth="1" strokeLinejoin="round"/>
        <path d="M99 99h43" stroke={shade} strokeWidth="3"/>
        <circle cx="120" cy="91" r="4" fill="#715b34"/>
        <text x="120" y="129" textAnchor="middle" fill={light} fontSize="12" fontWeight="700" letterSpacing="4" fontFamily="sans-serif">PASS</text>
        <path d="M106 139h28" stroke={accent} strokeOpacity=".5"/>
      </g>}
      {visual === "rare_boost" && <>
        <g transform="rotate(-8 120 85)">{gem}</g>
        <path d="m173 43 3 9 9 3-9 3-3 9-3-9-9-3 9-3ZM68 111l2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" fill={light}/>
      </>}
      {visual === "coin_magnet" && <>
        <g transform="rotate(-25 112 90)">
          <path d="M76 47h25v48a17 17 0 0 0 34 0V47h25v49a42 42 0 0 1-84 0Z" fill={fill("accent")} stroke={light} strokeWidth="1"/>
          <path d="M82 74v22a36 36 0 0 0 68 16" stroke={light} strokeOpacity=".6" strokeWidth="3"/>
          <path d="M76 47h25v24H76ZM135 47h25v24h-25Z" fill="#e0ebf4"/>
          <path d="M77 65h23M136 65h23" stroke="#b8c7d6" strokeWidth="2"/>
        </g>
        {[{x:177,y:46,r:14},{x:185,y:97,r:10},{x:69,y:35,r:9}].map(({x,y,r})=><g key={x}>
          <circle cx={x+2} cy={y+2} r={r} fill="#9f652d"/><circle cx={x} cy={y} r={r} fill={fill("gold")} stroke="#fff0ba"/>
          <circle cx={x} cy={y} r={r*.7} stroke="#b58237"/><path d={`M${x-2} ${y-r*.4}v${r*.8}m4-${r*.8}v${r*.8}`} stroke="#b58237" strokeWidth="1.5"/>
        </g>)}
      </>}
      {visual === "xp_boost" && <g transform="rotate(-7 120 90)">
        <path d="m120 24 43 20v57c0 22-22 39-43 50-21-11-43-28-43-50V44Z" fill={fill("body")} stroke={accent} strokeWidth="1.5"/>
        <path d="m120 31 36 17v49" stroke={light} strokeOpacity=".55"/>
        <path d="m95 73 25-25 25 25-12 12-13-13-13 13Z" fill={fill("accent")}/>
        <path d="m96 91 24-23 24 23-12 12-12-12-12 12Z" fill={fill("accent")}/>
        <text x="120" y="125" textAnchor="middle" fill={light} fontSize="22" fontFamily="sans-serif" fontWeight="800" letterSpacing="1">XP</text>
      </g>}
      {visual === "pump_it" && <g transform="rotate(32 120 85)">
        <path d="m108 117 12 38 12-38Z" fill={fill("gold")}/><path d="m114 119 6 24 6-24Z" fill="#fff3d3"/>
        <path d="m101 80-17 29v25l25-17M139 80l17 29v25l-25-17" fill={fill("accent")} stroke={light} strokeLinejoin="round"/>
        <path d="M120 24c-24 23-28 58-19 90h38c9-32 5-67-19-90Z" fill="#deebf5" stroke="#f5fcff"/>
        <path d="M120 24c-24 23-28 58-19 90h13c-8-34-4-66 6-90Z" fill="#95afc6"/>
        <path d="M104 47h32c-4-9-10-17-16-23-6 6-12 14-16 23Z" fill={fill("accent")}/>
        <circle cx="122" cy="73" r="14" fill="#253f59" stroke={accent} strokeWidth="4"/>
        <path d="M115 73a7 7 0 0 1 9-7" stroke="#bdeeff" strokeWidth="2" strokeLinecap="round"/>
        <path d="M104 117h32" stroke={shade} strokeWidth="6" strokeLinecap="round"/>
      </g>}
      {visual === "diamond_hands" && <>
        <g transform="translate(27 -6) scale(.78)">{gem}</g>
        <path d="m67 101 11-10 17 15 10 2 15 17-7 18-30-9-22-23Z" fill={fill("accent")} stroke={light} strokeWidth="1.2" strokeLinejoin="round"/>
        <path d="m173 101-11-10-17 15-10 2-15 17 7 18 30-9 22-23Z" fill={fill("accent")} stroke={light} strokeWidth="1.2" strokeLinejoin="round"/>
        <path d="m79 102 17 17 10 3m55-20-17 17-10 3" stroke={shade} strokeWidth="3" strokeLinecap="round"/>
      </>}
      {visual === "spawn_lure" && <>
        <ellipse cx="120" cy="127" rx="65" ry="24" stroke={accent} strokeOpacity=".35" strokeWidth="2"/>
        <ellipse cx="120" cy="127" rx="47" ry="17" stroke={accent} strokeOpacity=".6" strokeWidth="2"/>
        <ellipse cx="120" cy="127" rx="28" ry="10" fill={accent} fillOpacity=".13" stroke={light}/>
        <path d="M120 25c-24 0-41 17-41 39 0 27 41 66 41 66s41-39 41-66c0-22-17-39-41-39Z" fill={fill("accent")} stroke={light} strokeWidth="1.2"/>
        <path d="M87 63c0-18 13-30 31-31" stroke={light} strokeWidth="2" strokeLinecap="round"/>
        <circle cx="120" cy="65" r="21" fill="#1a4b49"/><circle cx="120" cy="65" r="11" stroke={light} strokeWidth="2"/>
        <circle cx="120" cy="65" r="4" fill={light}/>
        <circle cx="66" cy="123" r="4" fill={light}/><circle cx="168" cy="136" r="3" fill={accent}/>
      </>}
      {visual === "bundle" && <>
        <g transform="translate(-13 4) rotate(-13 120 85)"><path d="m104 29 16-10 16 10 8 15-24 30-24-30Z" fill="#c197ee" stroke="#e9d6ff"/><path d="m104 29 16 45 16-45" stroke="#f0dfff"/></g>
        <g transform="translate(31 3)"><circle cx="120" cy="47" r="20" fill={fill("gold")} stroke="#ffe7a1"/><circle cx="120" cy="47" r="13" stroke="#b68741"/></g>
        <path d="m67 71 53-17 53 17v65l-53 20-53-20Z" fill={fill("body")} stroke={accent} strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="m67 71 53 18 53-18-53-17Z" fill={fill("accent")}/>
        <path d="M120 89v67m-53-20 53 20 53-20" stroke={accent}/>
        <path d="m67 75 53 18 53-18v14l-53 18-53-18Z" fill={accent} fillOpacity=".35"/>
        <path d="m107 85 13 4 13-4v27l-13 5-13-5Z" fill={fill("accent")} stroke={light}/>
        <path d="m78 112 24 8m-24 0 24 8m36-8 24-8m-24 16 24-8" stroke={accent} strokeOpacity=".5" strokeWidth="2"/>
      </>}
      {!COLORS[visual] && <>
        <path d="m120 30 40 24v48l-40 25-40-25V54Z" fill={fill("body")} stroke={accent} strokeWidth="1.5"/>
        <path d="m124 45-30 41h22l-5 32 34-45h-23Z" fill={fill("accent")} stroke={light}/>
      </>}
    </g>
  </svg>;
}
