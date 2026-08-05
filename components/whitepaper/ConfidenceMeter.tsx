"use client";

import { useMemo, useState } from "react";

/**
 * The verification stack, made playable. Each signal carries a weight; the
 * claim is accepted when the combined score clears the asset's threshold.
 * Turning signals off is the fastest way to see why no single one is enough.
 */
const SIGNALS = [
  {
    id: "gnss",
    label: "GNSS fix",
    weight: 26,
    detail: "Satellite position and its reported accuracy, plus constellation and satellite count.",
    spoofable: "Trivially spoofed on a rooted device.",
  },
  {
    id: "radio",
    label: "Ambient radio",
    weight: 28,
    detail: "Nearby Wi-Fi SSIDs and cell towers matched against what should be visible here.",
    spoofable: "Hard to fabricate; radio environments change slowly.",
  },
  {
    id: "attest",
    label: "Device attestation",
    weight: 24,
    detail: "Play Integrity or App Attest confirming a genuine app on an untampered OS.",
    spoofable: "Emulator farms fail this outright.",
  },
  {
    id: "motion",
    label: "Motion continuity",
    weight: 22,
    detail: "The accelerometer trace between your last confirmed position and this one.",
    spoofable: "A 400 km jump in 90 seconds has no matching motion profile.",
  },
];

const TIERS = [
  { id: "low", label: "Quest reward", threshold: 45, note: "Low value, low bar." },
  { id: "mid", label: "Partner drop", threshold: 70, note: "The default for funded campaigns." },
  { id: "high", label: "Ticketed event", threshold: 90, note: "High value, everything must agree." },
];

export default function ConfidenceMeter() {
  const [on, setOn] = useState<Record<string, boolean>>({
    gnss: true, radio: true, attest: true, motion: true,
  });
  const [tier, setTier] = useState(1);

  const score = useMemo(
    () => SIGNALS.reduce((sum, s) => sum + (on[s.id] ? s.weight : 0), 0),
    [on]
  );

  const threshold = TIERS[tier].threshold;
  const accepted = score >= threshold;

  return (
    <div className="wp-figure confidence">
      <div className="confidence-head">
        <div>
          <p className="t-mono">Live model</p>
          <h3 className="t-h4" style={{ marginTop: "0.4rem" }}>
            Try refusing a claim
          </h3>
        </div>
        <div className="confidence-tiers" role="group" aria-label="Asset threshold">
          {TIERS.map((t, i) => (
            <button
              key={t.id}
              type="button"
              className="confidence-tier"
              data-active={i === tier || undefined}
              onClick={() => setTier(i)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="confidence-body">
        <ul className="confidence-signals">
          {SIGNALS.map((signal) => (
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
            <span className="t-mono-sm">confidence · threshold {threshold}</span>
          </div>

          <p className="confidence-verdict">
            {accepted ? "Claim accepted" : "Claim refused"}
          </p>
          <p className="t-small confidence-note">
            {accepted
              ? TIERS[tier].note
              : `Short by ${threshold - score}. Repeated refusals from one device raise its threshold further.`}
          </p>
        </div>
      </div>

      <p className="t-mono-sm wp-figure-caption">
        Weights are illustrative. The point is the shape: no signal alone clears
        a funded campaign, and forging all four at once costs more than the drop.
      </p>
    </div>
  );
}
