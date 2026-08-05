"use client";

import { useTranslations } from "next-intl";
import { StatusBar } from "@/components/app/PhoneFrame";
import { COLLECTIBLES, RARITY_LADDER, type Collectible } from "@/content/collectibles";

/** Where each spawn stands on the street grid, in 390 × 844 screen points. */
const PLACEMENTS = [
  { key: "wif", x: 112, y: 318, size: 50 },
  { key: "trump", x: 272, y: 244, size: 56 },
  { key: "bonk", x: 196, y: 474, size: 44 },
  { key: "popcat", x: 318, y: 408, size: 40 },
  { key: "fartcoin", x: 66, y: 520, size: 38 },
];

/** The coin the banner is pointing at, so the artwork matches the name. */
const WIF = COLLECTIBLES.find((c) => c.key === "wif") ?? COLLECTIBLES[0];

export default function MapScreen({
  onPick,
}: {
  onPick?: (coin: Collectible) => void;
}) {
  const t = useTranslations("appChrome");
  const rarity = useTranslations("rarity");
  const spawns = PLACEMENTS.map((p) => ({
    ...p,
    coin: COLLECTIBLES.find((c) => c.key === p.key)!,
  })).filter((s) => s.coin);

  return (
    <div className="scr scr-map">
      <StatusBar />

      <svg className="map-canvas" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="map-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d0d12" />
            <stop offset="100%" stopColor="#08080b" />
          </linearGradient>
          <radialGradient id="map-vignette" cx="50%" cy="42%" r="70%">
            <stop offset="55%" stopColor="transparent" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.75" />
          </radialGradient>
          <linearGradient id="trail-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00D2FF" />
            <stop offset="100%" stopColor="#CFF7FF" />
          </linearGradient>
        </defs>

        <rect width="390" height="844" fill="url(#map-sky)" />

        <g fill="#111117">
          <rect x="18" y="188" width="120" height="96" rx="4" />
          <rect x="152" y="188" width="88" height="96" rx="4" />
          <rect x="254" y="200" width="120" height="84" rx="4" />
          <rect x="18" y="300" width="120" height="130" rx="4" />
          <rect x="152" y="300" width="88" height="130" rx="4" />
          <rect x="18" y="446" width="120" height="110" rx="4" />
          <rect x="152" y="446" width="88" height="110" rx="4" />
          <rect x="254" y="446" width="120" height="110" rx="4" />
          <rect x="18" y="572" width="150" height="100" rx="4" />
          <rect x="184" y="572" width="190" height="100" rx="4" />
        </g>

        <path d="M254 300h120v130H254z" fill="#0d1a14" />
        <path
          d="M262 420c22-14 30-40 26-64 22 10 46 4 62-12 6 30 24 50 48 58-18 14-26 34-24 56h-96a52 52 0 0 0-16-38Z"
          fill="#10241b"
        />

        <path d="M0 700c60-18 120-6 180 8s120 20 210-4v140H0Z" fill="#08141c" />
        <path d="M0 700c60-18 120-6 180 8s120 20 210-4" fill="none" stroke="#0f2632" strokeWidth="1.5" />

        <g stroke="#1d1d25" strokeWidth="9" strokeLinecap="round">
          <path d="M0 292h390M0 438h390M0 564h390M0 680h390" />
          <path d="M146 150v560M248 150v560" />
        </g>
        <g stroke="#26262f" strokeWidth="12" strokeLinecap="round">
          <path d="M0 180h390" />
        </g>
        <path d="M-20 700 210 150" stroke="#212129" strokeWidth="8" strokeLinecap="round" fill="none" />
        <g stroke="#33333f" strokeWidth="1" strokeDasharray="10 12" opacity="0.7">
          <path d="M0 180h390" />
          <path d="M0 438h390" />
        </g>

        <rect width="390" height="844" fill="url(#map-vignette)" />

        <g className="map-trail">
          <path d="M195 622C182 560 150 500 122 452" fill="none" stroke="#00D2FF" strokeWidth="14" strokeLinecap="round" opacity="0.16" />
          <path
            d="M195 622C182 560 150 500 122 452"
            fill="none"
            stroke="url(#trail-grad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="12 10"
            className="map-trail-core"
          />
        </g>
      </svg>

      <div className="map-banner">
        <img src={WIF.image} alt="" className="map-banner-coin" loading="lazy" decoding="async" />
        <span className="map-banner-text">
          <b>{spawns[0]?.coin.name}</b>
          <i>{t("distanceAway", { metres: 84 })}</i>
        </span>
        <span className="map-banner-x">✕</span>
      </div>

      {spawns.map((spawn, i) => (
        <button
          key={spawn.key}
          type="button"
          className="map-spawn"
          data-rarity={spawn.coin.rarity}
          style={{
            left: `${(spawn.x / 390) * 100}%`,
            top: `${(spawn.y / 844) * 100}%`,
            width: spawn.size,
            animationDelay: `${i * 0.7}s`,
            ["--rarity" as string]: RARITY_LADDER[spawn.coin.rarity].colour,
          }}
          onClick={() => onPick?.(spawn.coin)}
          aria-label={`${spawn.coin.name}, ${rarity(spawn.coin.rarity)}`}
        >
          <img src={spawn.coin.image} alt="" loading="lazy" decoding="async" />
          <span className="map-spawn-shadow" />
        </button>
      ))}

      <span className="map-me">
        <span className="map-me-accuracy" />
        <span className="map-me-dot" />
        <span className="map-me-cone" />
      </span>

      <div className="map-hud map-hud-left">
        <span className="hud-btn hud-mobi">
          <span className="hud-mobi-orb" />
        </span>
      </div>

      <div className="map-hud map-hud-right">
        <div className="hud-btn hud-stack">
          <span className="hud-zoom">+</span>
          <span className="hud-divider" />
          <span className="hud-zoom">−</span>
        </div>
        <div className="hud-btn hud-mode">3D</div>
        <div className="hud-btn hud-compass">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M12 3.5 15 12l-3 8.5L9 12Z" fill="#ff4d5e" />
            <path d="M12 20.5 9 12l3-8.5" fill="#fff" opacity="0.85" />
          </svg>
        </div>
      </div>

      {onPick && <p className="map-hint">{t("tapCoin")}</p>}

      <nav className="tabbar" aria-hidden="true">
        {["home", "map", "quests", "wallet"].map((tab) => (
          <span key={tab} className="tabbar-item" data-active={tab === "map" || undefined}>
            <TabIcon name={tab === "quests" ? "quest" : tab} />
            <em>{t(tab)}</em>
          </span>
        ))}
      </nav>
    </div>
  );
}

export function TabIcon({ name }: { name: string }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (name === "home")
    return (
      <svg {...common}>
        <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z" />
      </svg>
    );
  if (name === "map")
    return (
      <svg {...common}>
        <path d="M9 4 3 6.5v14L9 18l6 3 6-2.5v-14L15 7 9 4Z" />
        <path d="M9 4v14M15 7v14" />
      </svg>
    );
  if (name === "quest")
    return (
      <svg {...common}>
        <path d="M12 3 14.6 8.7 21 9.5l-4.6 4.4 1.2 6.3L12 17.2 6.4 20.2l1.2-6.3L3 9.5l6.4-.8L12 3Z" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M3 8a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v2" />
      <path d="M3 8v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a1 1 0 0 0-1-1H5a2 2 0 0 1-2-2Z" />
      <circle cx="16.5" cy="14" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}
