"use client";

import { useMemo, useState } from "react";
import { DRAFT_FIGURES, VESTING } from "@/content/whitepaper";

/**
 * Circulating supply over the first four years, stacked by allocation.
 *
 * The allocation ring above answers who holds what. This answers when, which is
 * the question that actually decides whether a schedule is reasonable: a
 * fourteen percent treasury is unremarkable and a fourteen percent treasury
 * that unlocks in one month is not. Dragging the month shows the cliffs as
 * steps rather than as a footnote under a pie chart.
 */

const MONTHS = 48;
const W = 720;
const H = 240;

/** Share of one allocation that is liquid at a given month. */
function unlocked(entry: (typeof VESTING)[number], month: number) {
  if (month < entry.cliff) return entry.unlockAtTge;
  if (entry.vest === 0) return 1;
  const through = Math.min(1, (month - entry.cliff) / entry.vest);
  return entry.unlockAtTge + (1 - entry.unlockAtTge) * through;
}

export default function VestingSchedule() {
  const [month, setMonth] = useState(12);

  /**
   * One stacked band per allocation, bottom to top. Each band's floor is the
   * running total of everything under it, so the outline is drawn forwards
   * along its own top edge and back along the floor it sits on.
   */
  const bands = useMemo(() => {
    const steps = Array.from({ length: MONTHS + 1 }, (_, m) => m);
    const y = (share: number) => H - share * (H / 100);
    const out: ((typeof VESTING)[number] & { path: string })[] = [];
    const running = steps.map(() => 0);

    for (const entry of VESTING) {
      const top = steps.map((m, i) => running[i] + entry.share * unlocked(entry, m));
      const forward = steps
        .map((m, i) => `L${(m / MONTHS) * W},${y(top[i])}`)
        .join("");
      const back = steps
        .map((m, i) => `L${(m / MONTHS) * W},${y(running[i])}`)
        .reverse()
        .join("");
      out.push({ ...entry, path: `M0,${H}${forward}${back}Z` });
      top.forEach((v, i) => (running[i] = v));
    }

    return out;
  }, []);

  const atMonth = useMemo(
    () =>
      VESTING.map((entry) => ({
        ...entry,
        live: entry.share * unlocked(entry, month),
      })),
    [month]
  );

  const circulating = atMonth.reduce((sum, entry) => sum + entry.live, 0);

  return (
    <div className="wp-figure vesting">
      {DRAFT_FIGURES && (
        <p className="chip wp-draft-chip">Draft figures, not final tokenomics</p>
      )}

      <div className="vesting-head">
        <div>
          <p className="t-mono">Interactive</p>
          <h3 className="t-h4" style={{ marginTop: "0.4rem" }}>
            Circulating supply, month by month
          </h3>
        </div>
        <div className="vesting-readout">
          <span className="t-num vesting-figure">{circulating.toFixed(1)}%</span>
          <span className="t-mono-sm">
            circulating at month {month}
            {month === 0 ? ", at launch" : ""}
          </span>
        </div>
      </div>

      <div className="vesting-chart">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Circulating supply by allocation over 48 months">
          {/* Quarter grid, so the cliffs can be read off rather than guessed. */}
          <g className="vesting-grid">
            {[25, 50, 75].map((pct) => (
              <line key={pct} x1="0" x2={W} y1={H - pct * (H / 100)} y2={H - pct * (H / 100)} />
            ))}
          </g>

          {bands.map((band) => (
            <path key={band.label} d={band.path} fill={band.color} fillOpacity="0.85" />
          ))}

          <line
            className="vesting-marker"
            x1={(month / MONTHS) * W}
            x2={(month / MONTHS) * W}
            y1="0"
            y2={H}
          />
        </svg>

        <div className="vesting-axis t-mono-sm">
          <span>Launch</span>
          <span>Year 1</span>
          <span>Year 2</span>
          <span>Year 3</span>
          <span>Year 4</span>
        </div>
      </div>

      <label className="calc-field vesting-slider">
        <span className="calc-field-head">
          <span className="t-mono-sm">Month</span>
          <b>{month}</b>
        </span>
        <input
          type="range"
          min={0}
          max={MONTHS}
          step={1}
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="calc-range"
          style={{ ["--pct" as string]: `${(month / MONTHS) * 100}%` }}
        />
      </label>

      <div className="vesting-legend">
        {atMonth.map((entry) => (
          <div key={entry.label} className="vesting-row">
            <span className="legend-swatch" style={{ background: entry.color }} />
            <span className="vesting-row-label">{entry.label}</span>
            <span className="vesting-row-bar">
              <i
                style={{
                  width: `${(entry.live / entry.share) * 100}%`,
                  background: entry.color,
                }}
              />
            </span>
            <span className="vesting-row-value t-mono-sm">
              {entry.live.toFixed(1)} / {entry.share}%
            </span>
          </div>
        ))}
      </div>

      <p className="t-mono-sm wp-figure-caption">
        Read the steps, not the curve. A flat stretch followed by a jump is a
        cliff, and a cliff is where a schedule either holds or does not. Team and
        backer allocations are the ones worth checking, because they are the two
        that unlock into a market rather than out to the people using the
        network.
      </p>
    </div>
  );
}
