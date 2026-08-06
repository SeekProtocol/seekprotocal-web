"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { StatusBar } from "@/components/app/PhoneFrame";
import { TabIcon } from "@/components/app/screens/MapScreen";
import { RARITY_LADDER, type Collectible } from "@/content/collectibles";

const ASSETS = [
  { name: "SEEK", sub: "Seek Protocol", amount: "12,480", fiat: "$1,842.10", up: true, badge: "/app/seek-coin-3d.png" },
  { name: "SOL", sub: "Solana", amount: "4.28", fiat: "$612.44", up: true },
  { name: "BONK", sub: "Bonk", amount: "1.2M", fiat: "$38.90", up: false },
];

const BADGES = [
  "/app/badges/51-Seeker-Badge.png",
  "/app/badges/30-Diamond-Hands-Badge.png",
  "/app/badges/43-Web3-Wizard-Badge.png",
  "/app/badges/50-Whale-Badge.png",
];

/** The wallet, with its hero video anchored to the top as in the app. */
export default function WalletScreen({
  caught = [],
  onBack,
}: {
  caught?: Collectible[];
  onBack?: () => void;
}) {
  const t = useTranslations("walletScreen");
  const chrome = useTranslations("appChrome");

  return (
    <div className="scr scr-wallet">
      <StatusBar />

      {onBack && (
        <button type="button" className="scr-back scr-back-over" onClick={onBack}>
          {chrome("backToMap")}
        </button>
      )}

      <div className="wallet-hero">
        <video
          src="/app/video/wallet-coins.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
        <span className="wallet-hero-fade" aria-hidden="true" />
        <div className="wallet-balance">
          <span className="wallet-balance-label">{t("totalBalance")}</span>
          <span className="wallet-balance-value">$2,493.44</span>
          <span className="wallet-balance-delta">{t("delta", { amount: "$184.20" })}</span>
        </div>
      </div>

      <div className="wallet-actions">
        {["send", "receive", "swap", "stake"].map((action) => (
          <span key={action} className="wallet-action">
            <b />
            <em>{t(action)}</em>
          </span>
        ))}
      </div>

      {caught.length > 0 && (
        <div className="wallet-section">
          <span className="wallet-section-title">{t("justCaught")}</span>
          <div className="wallet-caught">
            {caught.map((coin, i) => (
              <span
                key={`${coin.key}-${i}`}
                className="wallet-caught-item"
                style={{ ["--rarity" as string]: RARITY_LADDER[coin.rarity].colour }}
              >
                <Image src={coin.image} alt="" width={38} height={38} />
                <em>{coin.symbol}</em>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="wallet-section">
        <span className="wallet-section-title">{t("assets")}</span>
        <ul className="wallet-list">
          {ASSETS.map((asset) => (
            <li key={asset.name} className="wallet-row">
              <span className="wallet-row-icon">
                {asset.badge ? <Image src={asset.badge} alt="" width={38} height={38} /> : <b>{asset.name.slice(0, 1)}</b>}
              </span>
              <span className="wallet-row-main">
                <b>{asset.name}</b>
                <em>{asset.sub}</em>
              </span>
              <span className="wallet-row-value">
                <b>{asset.amount}</b>
                <em data-up={asset.up || undefined}>{asset.fiat}</em>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="wallet-section">
        <span className="wallet-section-title">{t("recentBadges")}</span>
        <div className="wallet-badges">
          {BADGES.map((src) => (
            <Image key={src} src={src} alt="" width={38} height={38} />
          ))}
        </div>
      </div>

      <nav className="tabbar" aria-hidden="true">
        {["home", "map", "quests", "wallet"].map((tab) => (
          <span key={tab} className="tabbar-item" data-active={tab === "wallet" || undefined}>
            <TabIcon name={tab === "quests" ? "quest" : tab} />
            <em>{chrome(tab)}</em>
          </span>
        ))}
      </nav>
    </div>
  );
}
