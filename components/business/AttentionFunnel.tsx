"use client";

import { useMemo, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";

/**
 * The marketing argument, drawn.
 *
 * Both columns spend the same money. The difference is not that one funnel is
 * wider, it is where each one stops being measured: a display campaign counts
 * impressions and clicks and then *models* the visit, while a placed asset
 * counts the arrival itself because arrival is the event that releases the
 * reward.
 *
 * Every rate below is an industry rule of thumb and is printed on the figure.
 * The bars are deliberately not nested for display, because the store-visit
 * number there genuinely does not come from the clicks above it, and drawing it
 * as if it did would be the same sleight of hand the page is arguing against.
 */

const CPM = 6.5; // display cost per thousand impressions, USD
const VIEWABLE = 0.62; // share of served impressions actually rendered in view
const CTR = 0.0008; // display click-through rate
const MODELLED_VISIT = 0.0009; // impression-to-store-visit, as modelled by ad platforms

const COST_PER_ARRIVAL = 2.6; // reward plus placement fee, mid-range campaign
const CLAIM_RATE = 0.88; // people who reach the radius and complete the claim
const WALK_RATE = 0.18; // people who open a drop and go to it
const OPEN_RATE = 0.22; // people who see a pin nearby and open it

export default function AttentionFunnel() {
  const t = useTranslations("funnel");
  const format = useFormatter();
  const [budget, setBudget] = useState(5000);

  const model = useMemo(() => {
    const impressions = Math.floor((budget / CPM) * 1000);
    const viewable = Math.floor(impressions * VIEWABLE);
    const clicks = Math.floor(impressions * CTR);
    const modelled = Math.max(1, Math.floor(impressions * MODELLED_VISIT));

    const arrivals = Math.floor(budget / COST_PER_ARRIVAL);
    const walked = Math.round(arrivals / CLAIM_RATE);
    const opened = Math.round(walked / WALK_RATE);
    const seen = Math.round(opened / OPEN_RATE);

    return {
      display: [
        { id: "impressions", value: impressions, measured: true },
        { id: "viewable", value: viewable, measured: true },
        { id: "clicks", value: clicks, measured: true },
        { id: "visits", value: modelled, measured: false },
      ],
      seek: [
        { id: "saw", value: seen, measured: true },
        { id: "opened", value: opened, measured: true },
        { id: "walked", value: walked, measured: true },
        { id: "claimed", value: arrivals, measured: true },
      ],
      costDisplay: budget / modelled,
      costSeek: COST_PER_ARRIVAL,
    };
  }, [budget]);

  return (
    <div className="funnel">
      <div className="funnel-head">
        <label className="calc-field funnel-budget">
          <span className="calc-field-head">
            <span className="t-mono-sm">{t("budget")}</span>
            <b>${format.number(budget)}</b>
          </span>
          <input
            type="range"
            min={1000}
            max={50000}
            step={1000}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="calc-range"
            style={{ ["--pct" as string]: `${((budget - 1000) / 49000) * 100}%` }}
          />
        </label>
      </div>

      <div className="funnel-cols">
        <Column
          title={t("displayTitle")}
          stages={model.display}
          cost={`$${model.costDisplay.toFixed(2)}`}
          costLabel={t("displayCost")}
          tone="quiet"
        />
        <Column
          title={t("seekTitle")}
          stages={model.seek}
          cost={`$${model.costSeek.toFixed(2)}`}
          costLabel={t("seekCost")}
          tone="brand"
        />
      </div>

      <p className="t-mono-sm funnel-caption">
        {t("caption", {
          cpm: CPM.toFixed(2),
          viewability: Math.round(VIEWABLE * 100),
          ctr: (CTR * 100).toFixed(2),
          modelled: (MODELLED_VISIT * 100).toFixed(2),
        })}
      </p>
    </div>
  );
}

function Column({
  title,
  stages,
  cost,
  costLabel,
  tone,
}: {
  title: string;
  stages: { id: string; value: number; measured: boolean }[];
  cost: string;
  costLabel: string;
  tone: "quiet" | "brand";
}) {
  const t = useTranslations("funnel");
  const format = useFormatter();
  const top = Math.max(...stages.map((s) => s.value));

  return (
    <div className="funnel-col" data-tone={tone}>
      <h3 className="t-h4 funnel-col-title">{title}</h3>

      <ol className="funnel-stages">
        {stages.map((stage) => (
          <li key={stage.id} data-modelled={!stage.measured || undefined}>
            <span className="funnel-stage-head">
              <span className="t-small">{t(`stages.${stage.id}`)}</span>
              <b className="t-num">{format.number(stage.value)}</b>
            </span>
            <span className="funnel-bar">
              <i
                style={{
                  // Square-rooted so the last rows stay legible next to a top
                  // row three orders of magnitude bigger.
                  width: `${Math.max(3, Math.sqrt(stage.value / top) * 100)}%`,
                }}
              />
            </span>
            <span className="t-mono-sm funnel-stage-tag">
              {stage.measured ? t("counted") : t("estimated")}
            </span>
          </li>
        ))}
      </ol>

      <div className="funnel-cost">
        <span className="t-num">{cost}</span>
        <span className="t-mono-sm">{costLabel}</span>
      </div>
    </div>
  );
}
