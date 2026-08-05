"use client";

import { useMemo, useState } from "react";

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
        { label: "Impressions served", value: impressions, measured: true },
        { label: "Rendered in view", value: viewable, measured: true },
        { label: "Clicks", value: clicks, measured: true },
        { label: "Store visits", value: modelled, measured: false },
      ],
      seek: [
        { label: "Saw the pin nearby", value: seen, measured: true },
        { label: "Opened the drop", value: opened, measured: true },
        { label: "Walked to it", value: walked, measured: true },
        { label: "Claimed at the door", value: arrivals, measured: true },
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
            <span className="t-mono-sm">Campaign budget</span>
            <b>${budget.toLocaleString("en-US")}</b>
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
          title="Bought as display"
          stages={model.display}
          cost={`$${model.costDisplay.toFixed(2)}`}
          costLabel="per modelled visit"
          tone="quiet"
        />
        <Column
          title="Bought as arrivals"
          stages={model.seek}
          cost={`$${model.costSeek.toFixed(2)}`}
          costLabel="per verified arrival"
          tone="brand"
        />
      </div>

      <p className="t-mono-sm funnel-caption">
        Display uses a ${CPM.toFixed(2)} CPM, {Math.round(VIEWABLE * 100)}%
        viewability, a {(CTR * 100).toFixed(2)}% click rate and the{" "}
        {(MODELLED_VISIT * 100).toFixed(2)}% impression-to-visit figure ad
        platforms model. That last row is the one to look at: it is not counted,
        it is estimated, and it does not follow from the clicks above it. In the
        right-hand column every row is a thing that happened on a device inside
        your radius.
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
  stages: { label: string; value: number; measured: boolean }[];
  cost: string;
  costLabel: string;
  tone: "quiet" | "brand";
}) {
  const top = Math.max(...stages.map((s) => s.value));

  return (
    <div className="funnel-col" data-tone={tone}>
      <h3 className="t-h4 funnel-col-title">{title}</h3>

      <ol className="funnel-stages">
        {stages.map((stage) => (
          <li key={stage.label} data-modelled={!stage.measured || undefined}>
            <span className="funnel-stage-head">
              <span className="t-small">{stage.label}</span>
              <b className="t-num">{stage.value.toLocaleString("en-US")}</b>
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
              {stage.measured ? "Counted" : "Estimated"}
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
