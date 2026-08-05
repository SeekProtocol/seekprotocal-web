"use client";

import { useState } from "react";
import { COLLECTIBLES, POWERUPS, RARITY_LADDER, type Rarity } from "@/content/collectibles";

const ORDER: Rarity[] = ["legendary", "epic", "rare", "uncommon", "common"];

/** What you can actually catch, and what the ladder says it is worth. */
export default function CollectiblesSection() {
  const [filter, setFilter] = useState<Rarity | "all">("all");

  const shown =
    filter === "all"
      ? COLLECTIBLES
      : COLLECTIBLES.filter((coin) => coin.rarity === filter);

  return (
    <div className="collectibles">
      <div className="collectibles-head">
        <div className="sec-head reveal">
          <p className="eyebrow">Collectibles</p>
          <h2 className="t-h2">These are the coins out there</h2>
          <p className="t-lead" style={{ marginTop: "1.25rem" }}>
            Rarity decides how often one spawns and how likely you are to keep
            it. A caught unit is a game unit. What it pays out in real tokens
            is the market's business.
          </p>
        </div>

        <div className="collectibles-filters" role="group" aria-label="Filter by rarity">
          <button
            type="button"
            className="collectibles-filter"
            data-active={filter === "all" || undefined}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          {ORDER.map((rarity) => (
            <button
              key={rarity}
              type="button"
              className="collectibles-filter"
              data-active={filter === rarity || undefined}
              style={{ ["--rarity" as string]: RARITY_LADDER[rarity].colour }}
              onClick={() => setFilter(rarity)}
            >
              {RARITY_LADDER[rarity].label}
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
                <img src={coin.image} alt={coin.name} loading="lazy" />
              </div>
              <span className="collectible-rarity">{ladder.label}</span>
              <h3 className="collectible-name">{coin.name}</h3>
              <p className="collectible-symbol t-mono-sm">${coin.symbol}</p>

              <dl className="collectible-stats">
                <div>
                  <dt>Catch chance</dt>
                  <dd>{Math.round(ladder.base * 100)}%</dd>
                </div>
                <div>
                  <dt>Over 3 tries</dt>
                  <dd>{Math.round(ladder.overall * 100)}%</dd>
                </div>
                <div>
                  <dt>Per unit</dt>
                  <dd>${ladder.value.toFixed(2)}</dd>
                </div>
              </dl>
            </article>
          );
        })}
      </div>

      <div className="powerups reveal">
        <h3 className="t-h4 powerups-title">Power-ups that change the round</h3>
        <ul className="powerups-list">
          {POWERUPS.map((p) => (
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
