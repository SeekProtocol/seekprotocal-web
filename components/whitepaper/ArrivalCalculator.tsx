"use client";

import { useMemo, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";

/**
 * What a campaign costs per person who actually turns up, next to what the
 * same budget buys as impressions. Deliberately conservative on the display
 * side — the point is the difference in what is being counted, not a claim
 * that one number beats the other.
 */
const CPM = 6.5; // typical display cost per thousand impressions, USD
const VISIT_RATE = 0.0009; // share of impressions that become a measurable visit

export default function ArrivalCalculator() {
  const t = useTranslations("whitepaperFigures");
  const format = useFormatter();
  const [budget, setBudget] = useState(2500);
  const [reward, setReward] = useState(3);
  const [radius, setRadius] = useState(50);

  const model = useMemo(() => {
    // Placement fee scales with the area held, so a wide radius costs more.
    const areaFactor = Math.pow(radius / 30, 1.35);
    const feePerDrop = 0.12 * areaFactor;
    const costPerArrival = reward + feePerDrop;
    const arrivals = Math.floor(budget / costPerArrival);

    const impressions = Math.floor((budget / CPM) * 1000);
    const inferredVisits = Math.max(1, Math.floor(impressions * VISIT_RATE));
    const displayCostPerVisit = budget / inferredVisits;

    return { arrivals, costPerArrival, impressions, inferredVisits, displayCostPerVisit, feePerDrop };
  }, [budget, reward, radius]);

  return (
    <div className="wp-figure calc">
      <div className="calc-head">
        <p className="t-mono">{t("interactive")}</p>
        <h3 className="t-h4" style={{ marginTop: "0.4rem" }}>
          {t("calcTitle")}
        </h3>
      </div>

      <div className="calc-body">
        <div className="calc-controls">
          <Field
            label={t("calcBudget")}
            value={`$${format.number(budget)}`}
            min={500}
            max={25000}
            step={500}
            current={budget}
            onChange={setBudget}
          />
          <Field
            label={t("calcReward")}
            value={`$${reward.toFixed(2)}`}
            min={0.5}
            max={20}
            step={0.5}
            current={reward}
            onChange={setReward}
          />
          <Field
            label={t("calcRadius")}
            value={`${radius} m`}
            min={5}
            max={300}
            step={5}
            current={radius}
            onChange={setRadius}
          />
          <p className="t-mono-sm calc-fee">
            {t("calcFee", { fee: model.feePerDrop.toFixed(2) })}
          </p>
        </div>

        <div className="calc-results">
          <div className="calc-card calc-card-primary">
            <span className="t-mono-sm">{t("calcArrivals")}</span>
            <span className="t-num calc-figure">
              {format.number(model.arrivals)}
            </span>
            <span className="t-small">
              {t("calcPerPerson", { cost: model.costPerArrival.toFixed(2) })}
            </span>
          </div>

          <div className="calc-card">
            <span className="t-mono-sm">{t("calcDisplay")}</span>
            <span className="t-num calc-figure calc-figure-quiet">
              {format.number(model.impressions)}
            </span>
            <span className="t-small">
              {t("calcInferred", {
                visits: format.number(model.inferredVisits),
                cost: model.displayCostPerVisit.toFixed(2),
              })}
            </span>
          </div>
        </div>
      </div>

      <p className="t-mono-sm wp-figure-caption">
        {t("calcCaption", {
          cpm: CPM.toFixed(2),
          rate: (VISIT_RATE * 100).toFixed(2),
        })}
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  min,
  max,
  step,
  current,
  onChange,
}: {
  label: string;
  value: string;
  min: number;
  max: number;
  step: number;
  current: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="calc-field">
      <span className="calc-field-head">
        <span className="t-mono-sm">{label}</span>
        <b>{value}</b>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={current}
        onChange={(e) => onChange(Number(e.target.value))}
        className="calc-range"
        style={{ ["--pct" as string]: `${((current - min) / (max - min)) * 100}%` }}
      />
    </label>
  );
}
