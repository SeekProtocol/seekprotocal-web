"use client";

import Image from "next/image";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { withCopy } from "@/lib/content-i18n";
import { ACHIEVEMENTS, COLLECTIBLE_BADGES, RANKS } from "@/content/app-features";

/**
 * Rank ladder, collectible badges and platform achievements, all real artwork
 * from the app rather than icons standing in for it.
 */
export default function ProgressionSection() {
  const t = useTranslations("progression");
  const ranks = withCopy(useTranslations("ranks"), RANKS, ["name"]);
  const badges = withCopy(useTranslations("badges"), COLLECTIBLE_BADGES, ["name"]);
  const achievements = withCopy(useTranslations("achievements"), ACHIEVEMENTS, [
    "name",
    "detail",
  ]);
  const [rank, setRank] = useState(ranks.length - 1);
  const current = ranks[rank];

  return (
    <div className="progression">
      <div className="progression-head sec-head reveal">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h2 className="t-h2">{t("title")}</h2>
        <p className="t-lead" style={{ marginTop: "1.25rem" }}>
          {t("lead")}
        </p>
      </div>

      {/* Rank ladder ------------------------------------------------------ */}
      <div className="rank-ladder reveal">
        <div className="rank-display">
          <Image
            key={current.img}
            src={`/app/badges/${current.img}`}
            alt={t("badgeAlt", { name: current.name })}
            width={132}
            height={132}
            className="rank-display-badge"
          />
          <div>
            <span className="t-mono">
              {t("rankOf", { tier: current.tier, total: ranks.length })}
            </span>
            <h3 className="t-h2 rank-display-name">{current.name}</h3>
          </div>
        </div>

        <div className="rank-track" role="tablist" aria-label={t("rankTablist")}>
          {ranks.map((entry, i) => (
            <button
              key={entry.id}
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
              <Image src={`/app/badges/${entry.img}`} alt="" width={64} height={64} />
              <span className="t-mono-sm">{entry.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Badges + achievements -------------------------------------------- */}
      <div className="collect-grid">
        <div className="collect-panel reveal">
          <div className="collect-panel-head">
            <h3 className="t-h4">{t("badgesTitle")}</h3>
            <span className="chip">{t("badgesShown", { shown: badges.length, total: 61 })}</span>
          </div>
          <div className="badge-wall">
            {badges.map((badge) => (
              <figure key={badge.img} className="badge-tile">
                <Image src={`/app/badges/${badge.img}`} alt={badge.name} width={76} height={76} />
                <figcaption className="t-mono-sm">{badge.name}</figcaption>
              </figure>
            ))}
          </div>
        </div>

        <div className="collect-panel reveal">
          <div className="collect-panel-head">
            <h3 className="t-h4">{t("achievementsTitle")}</h3>
            <span className="chip">Game Center · Play Games</span>
          </div>
          <ul className="achievement-list">
            {achievements.map((achievement) => (
              <li key={achievement.img} className="achievement-row">
                <Image
                  width={46}
                  height={46}
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
