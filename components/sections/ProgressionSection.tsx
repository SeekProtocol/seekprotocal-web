"use client";

import { useState } from "react";
import { ACHIEVEMENTS, COLLECTIBLE_BADGES, RANKS } from "@/content/app-features";

/**
 * Rank ladder, collectible badges and platform achievements — all real
 * artwork from the app rather than icons standing in for it.
 */
export default function ProgressionSection() {
  const [rank, setRank] = useState(RANKS.length - 1);
  const current = RANKS[rank];

  return (
    <div className="progression">
      <div className="progression-head sec-head reveal">
        <p className="eyebrow">Progression</p>
        <h2 className="t-h2">Ten ranks, sixty-one badges, and no way to buy either</h2>
        <p className="t-lead" style={{ marginTop: "1.25rem" }}>
          Rank comes from distance covered and places visited. Everything on
          this wall is earned by going outside.
        </p>
      </div>

      {/* Rank ladder ------------------------------------------------------ */}
      <div className="rank-ladder reveal">
        <div className="rank-display">
          <img
            key={current.img}
            src={`/app/badges/${current.img}`}
            alt={`${current.name} rank badge`}
            className="rank-display-badge"
          />
          <div>
            <span className="t-mono">Rank {current.tier} of 10</span>
            <h3 className="t-h2 rank-display-name">{current.name}</h3>
          </div>
        </div>

        <div className="rank-track" role="tablist" aria-label="Rank tiers">
          {RANKS.map((entry, i) => (
            <button
              key={entry.name}
              type="button"
              role="tab"
              aria-selected={i === rank}
              className="rank-step"
              data-active={i === rank || undefined}
              data-reached={i <= rank || undefined}
              onMouseEnter={() => setRank(i)}
              onFocus={() => setRank(i)}
              onClick={() => setRank(i)}
              title={entry.name}
            >
              <img src={`/app/badges/${entry.img}`} alt="" loading="lazy" />
              <span className="t-mono-sm">{entry.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Badges + achievements -------------------------------------------- */}
      <div className="collect-grid">
        <div className="collect-panel reveal">
          <div className="collect-panel-head">
            <h3 className="t-h4">Collectible badges</h3>
            <span className="chip">8 of 61 shown</span>
          </div>
          <div className="badge-wall">
            {COLLECTIBLE_BADGES.map((badge) => (
              <figure key={badge.img} className="badge-tile">
                <img src={`/app/badges/${badge.img}`} alt={badge.name} loading="lazy" />
                <figcaption className="t-mono-sm">{badge.name}</figcaption>
              </figure>
            ))}
          </div>
        </div>

        <div className="collect-panel reveal">
          <div className="collect-panel-head">
            <h3 className="t-h4">Achievements</h3>
            <span className="chip">Game Center · Play Games</span>
          </div>
          <ul className="achievement-list">
            {ACHIEVEMENTS.map((achievement) => (
              <li key={achievement.img} className="achievement-row">
                <img
                  src={`/app/achievements/${achievement.img}`}
                  alt=""
                  loading="lazy"
                />
                <span>
                  <b>{achievement.name}</b>
                  <em>{achievement.detail}</em>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
