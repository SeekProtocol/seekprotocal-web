"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { withCopy } from "@/lib/content-i18n";
import { COLLECTIBLES, POWERUPS, RARITY_LADDER, type Rarity } from "@/content/collectibles";

const ORDER: Rarity[] = ["legendary", "epic", "rare", "uncommon", "common"];

/** What you can actually catch, and what the ladder says it is worth. */
export default function CollectiblesSection() {
  const t = useTranslations("collectiblesSection");
  const rarity = useTranslations("rarity");
  const powerups = withCopy(useTranslations("powerups"), POWERUPS, ["label", "effect"]);
  const [filter, setFilter] = useState<Rarity | "all">("all");

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

      <div className="collectibles-grid">
        {shown.map((coin) => {
          const ladder = RARITY_LADDER[coin.rarity];
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
                  <dd>{Math.round(ladder.base * 100)}%</dd>
                </div>
                <div>
                  <dt>{t("overThree")}</dt>
                  <dd>{Math.round(ladder.overall * 100)}%</dd>
                </div>
                <div>
                  <dt>{t("perUnit")}</dt>
                  <dd>${ladder.value.toFixed(2)}</dd>
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
