"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { withCopy } from "@/lib/content-i18n";

/**
 * The verification stack, made playable. Each signal carries a weight; the
 * claim is accepted when the combined score clears the asset's threshold.
 * Turning signals off is the fastest way to see why no single one is enough.
 */
const SIGNALS = [
  { id: "gnss", weight: 26 },
  { id: "radio", weight: 28 },
  { id: "attest", weight: 24 },
  { id: "motion", weight: 22 },
];

const TIERS = [
  { id: "low", threshold: 45 },
  { id: "mid", threshold: 70 },
  { id: "high", threshold: 90 },
];

export default function ConfidenceMeter() {
  const t = useTranslations("whitepaperFigures");
  const signals = withCopy(useTranslations("confidenceSignals"), SIGNALS, [
    "label",
    "detail",
    "spoofable",
  ]);
  const tiers = withCopy(useTranslations("confidenceTiers"), TIERS, ["label", "note"]);
  const [on, setOn] = useState<Record<string, boolean>>({
    gnss: true, radio: true, attest: true, motion: true,
  });
  const [tier, setTier] = useState(1);

  const score = useMemo(
    () => SIGNALS.reduce((sum, s) => sum + (on[s.id] ? s.weight : 0), 0),
    [on]
  );

  const threshold = tiers[tier].threshold;
  const accepted = score >= threshold;

  return (
    <div className="wp-figure confidence">
      <div className="confidence-head">
        <div>
          <p className="t-mono">{t("liveModel")}</p>
          <h3 className="t-h4" style={{ marginTop: "0.4rem" }}>
            {t("confidenceTitle")}
          </h3>
        </div>
        <div className="confidence-tiers" role="group" aria-label={t("thresholdLabel")}>
          {tiers.map((tierOption, i) => (
            <button
              key={tierOption.id}
              type="button"
              className="confidence-tier"
              data-active={i === tier || undefined}
              onClick={() => setTier(i)}
            >
              {tierOption.label}
            </button>
          ))}
        </div>
      </div>

      <div className="confidence-body">
        <ul className="confidence-signals">
          {signals.map((signal) => (
            <li key={signal.id}>
              <button
                type="button"
                className="confidence-signal"
                data-on={on[signal.id] || undefined}
                onClick={() => setOn((prev) => ({ ...prev, [signal.id]: !prev[signal.id] }))}
                aria-pressed={on[signal.id]}
              >
                <span className="confidence-switch" aria-hidden="true">
                  <i />
                </span>
                <span className="confidence-signal-main">
                  <b>
                    {signal.label}
                    <em>+{signal.weight}</em>
                  </b>
                  <span className="t-small">
                    {on[signal.id] ? signal.detail : signal.spoofable}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div className="confidence-gauge" data-accepted={accepted || undefined}>
          <div className="confidence-track">
            <span
              className="confidence-fill"
              style={{ width: `${score}%` }}
            />
            <span
              className="confidence-threshold"
              style={{ left: `${threshold}%` }}
              aria-hidden="true"
            />
          </div>

          <div className="confidence-readout">
            <span className="t-num confidence-score">{score}</span>
            <span className="t-mono-sm">{t("confidenceThreshold", { threshold })}</span>
          </div>

          <p className="confidence-verdict">
            {accepted ? t("claimAccepted") : t("claimRefused")}
          </p>
          <p className="t-small confidence-note">
            {accepted
              ? tiers[tier].note
              : t("shortBy", { short: threshold - score })}
          </p>
        </div>
      </div>

      <p className="t-mono-sm wp-figure-caption">{t("confidenceCaption")}</p>
    </div>
  );
}
