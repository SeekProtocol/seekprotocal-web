"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { withCopy } from "@/lib/content-i18n";
import {
  COLLECTIBLES,
  POWERUPS,
  RARITY_LADDER,
  overAllAttempts,
  type Rarity,
} from "@/content/collectibles";

/** Only the tiers that hold a coin today: a filter that empties the grid is a dead end. */
const ORDER = (["legendary", "epic", "rare", "uncommon", "common"] as Rarity[]).filter((tier) =>
  COLLECTIBLES.some((coin) => coin.rarity === tier),
);

/** What you can actually catch, and what the ladder says it is worth. */
export default function CollectiblesSection() {
  const t = useTranslations("collectiblesSection");
  const rarity = useTranslations("rarity");
  const powerups = withCopy(useTranslations("powerups"), POWERUPS, ["label", "effect"]);
  const [filter, setFilter] = useState<Rarity | "all">("all");
  const grid = useRef<HTMLDivElement>(null);

  // On a phone the grid is a sideways rail; a new filter starts it from the left.
  useEffect(() => {
    grid.current?.scrollTo({ left: 0 });
  }, [filter]);

  const shown =
    filter === "all"
      ? COLLECTIBLES
      : COLLECTIBLES.filter((coin) => coin.rarity === filter);

  return (
    <div className="collectibles">
      <div className="collectibles-head">
        <div className="sec-head reveal">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h2 className="t-h2">{t("title")}</h2>
          <p className="t-lead" style={{ marginTop: "1.25rem" }}>
            {t("lead")}
          </p>
        </div>

        <div className="collectibles-filters" role="group" aria-label={t("filterLabel")}>
          <button
            type="button"
            className="collectibles-filter"
            data-active={filter === "all" || undefined}
            onClick={() => setFilter("all")}
          >
            {t("all")}
          </button>
          {ORDER.map((tier) => (
            <button
              key={tier}
              type="button"
              className="collectibles-filter"
              data-active={filter === tier || undefined}
              style={{ ["--rarity" as string]: RARITY_LADDER[tier].colour }}
              onClick={() => setFilter(tier)}
            >
              {rarity(tier)}
            </button>
          ))}
        </div>
      </div>

      <div className="collectibles-grid" ref={grid}>
        {shown.map((coin) => {
          const ladder = RARITY_LADDER[coin.rarity];
          // Odds and value are the coin's own; the ladder only lends its colour.
          return (
            <article
              key={coin.key}
              className="collectible reveal"
              style={{ ["--rarity" as string]: ladder.colour }}
            >
              <div className="collectible-art">
                <span className="collectible-glow" aria-hidden="true" />
                <Image src={coin.image} alt={coin.name} width={104} height={104} />
              </div>
              <span className="collectible-rarity">{rarity(coin.rarity)}</span>
              <h3 className="collectible-name">{coin.name}</h3>
              <p className="collectible-symbol t-mono-sm">${coin.symbol}</p>

              <dl className="collectible-stats">
                <div>
                  <dt>{t("catchChance")}</dt>
                  <dd>{Math.round(coin.base * 100)}%</dd>
                </div>
                <div>
                  <dt>{t("overAttempts")}</dt>
                  <dd>{Math.round(overAllAttempts(coin.base) * 100)}%</dd>
                </div>
                <div>
                  <dt>{t("perUnit")}</dt>
                  <dd>{coin.value === null ? t("atTge") : `$${coin.value.toFixed(2)}`}</dd>
                </div>
              </dl>
            </article>
          );
        })}
      </div>

      <div className="powerups reveal">
        <h3 className="t-h4 powerups-title">{t("powerupsTitle")}</h3>
        <ul className="powerups-list">
          {powerups.map((p) => (
            <li key={p.key} className="powerup-chip">
              <b>{p.label}</b>
              <em>{p.effect}</em>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
