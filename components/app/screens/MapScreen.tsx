"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { StatusBar } from "@/components/app/PhoneFrame";
import { COLLECTIBLES, RARITY_LADDER, type Collectible } from "@/content/collectibles";
import { APP_MAP } from "@/content/rewards";

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

      <Image
        src={APP_MAP.src}
        alt=""
        fill
        sizes="300px"
        className="map-photo"
        aria-hidden="true"
      />
      {/* The drawn street plan that used to be here is gone. It was accurate to
          the app's own layout and it still read as a diagram, which is exactly
          the thing a map screen cannot afford to look like. */}
      <span className="map-photo-scrim" aria-hidden="true" />

      <svg className="map-canvas" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="trail-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00D2FF" />
            <stop offset="100%" stopColor="#CFF7FF" />
          </linearGradient>
        </defs>

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
        <Image src={WIF.image} alt="" width={30} height={30} className="map-banner-coin" />
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
          <Image src={spawn.coin.image} alt="" width={56} height={56} />
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
