"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import LiveMark from "@/components/brand/LiveMark";
import { useFormatter, useTranslations } from "next-intl";

/**
 * Publishing a campaign, played out rather than described.
 *
 * The claim on this page is that placing an asset takes four decisions and no
 * engineering, so the fastest way to prove it is to let someone make the four
 * decisions. Everything the console shows updates from those choices: the
 * radius ring is drawn to scale against the street plate, the spec panel is the
 * campaign object being assembled, and the publish sequence is the real order
 * of operations.
 *
 * The numbers after publish are a projection and say so. What is not a
 * projection is the shape: you pay per person who arrived, and the figure
 * exists because arrival is the event being recorded.
 */

/** Label, place and hint come from `deploy.presets`, keyed by id. */
type Preset = {
  id: string;
  radius: number;
  /** People within walking distance who browse the map in a day. */
  nearby: number;
};

const PRESETS: Preset[] = [
  { id: "store", radius: 25, nearby: 4200 },
  { id: "venue", radius: 220, nearby: 11500 },
  { id: "trail", radius: 60, nearby: 7300 },
];

type AssetKind = {
  id: string;
  unit: string;
  /** Typical per-claim value, in USD, used only for the projection. */
  value: number;
};

const ASSETS: AssetKind[] = [
  { id: "token", unit: "$SEEK", value: 2 },
  { id: "nft", unit: "NFT", value: 4 },
  { id: "offer", unit: "code", value: 6 },
  { id: "ticket", unit: "pass", value: 12 },
];

const TIERS = [
  { id: "standard", threshold: 70 },
  { id: "strict", threshold: 90 },
];

const STEPS = ["location", "asset", "rules", "publish"];

/** The four lines the publish actually runs, in order. */
const SEQUENCE = [
  { id: "signing", at: 0 },
  { id: "writing", at: 700 },
  { id: "indexing", at: 1500 },
  { id: "live", at: 2200 },
];

export default function DeployConsole() {
  const t = useTranslations("deploy");
  const format = useFormatter();
  const [step, setStep] = useState(0);
  const [preset, setPreset] = useState(PRESETS[0]);
  const [asset, setAsset] = useState(ASSETS[0]);
  const [quantity, setQuantity] = useState(500);
  const [radius, setRadius] = useState(PRESETS[0].radius);
  const [tier, setTier] = useState(0);

  const [phase, setPhase] = useState<"idle" | "publishing" | "live">("idle");
  const [line, setLine] = useState(-1);
  const [arrivals, setArrivals] = useState(0);
  const timers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const pickPreset = useCallback((next: Preset) => {
    setPreset(next);
    setRadius(next.radius);
  }, []);

  const model = useMemo(() => {
    // The placement fee is charged for holding an area for a window, so it
    // scales with the radius rather than being flat.
    const areaFactor = Math.pow(radius / 30, 1.35);
    const fee = 0.12 * areaFactor * (TIERS[tier].threshold / 70);
    const costPerArrival = asset.value + fee;
    const budget = costPerArrival * quantity;

    // How many of the people who see the pin walk to it. A tighter radius means
    // a shorter walk from wherever they already are, so it converts harder.
    const walkRate = Math.min(0.24, 0.05 + 0.5 / Math.max(12, radius));
    const seen = Math.round(preset.nearby * (0.35 + Math.min(0.45, radius / 600)));
    const projected = Math.min(quantity, Math.round(seen * walkRate));

    return { fee, costPerArrival, budget, seen, projected };
  }, [radius, tier, asset, quantity, preset]);

  const publish = useCallback(() => {
    clearTimers();
    setPhase("publishing");
    setArrivals(0);
    setLine(-1);

    SEQUENCE.forEach((entry, i) => {
      timers.current.push(
        window.setTimeout(() => setLine(i), entry.at) as unknown as number
      );
    });

    timers.current.push(
      window.setTimeout(() => {
        setPhase("live");
        // Arrivals come in on a decaying curve, the way a real launch does:
        // a rush while the pin is new, then a long tail.
        const target = model.projected;
        const start = performance.now();
        const tick = () => {
          const t = Math.min(1, (performance.now() - start) / 2600);
          setArrivals(Math.round(target * (1 - Math.pow(1 - t, 3))));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }, 3000) as unknown as number
    );
  }, [clearTimers, model.projected]);

  const reset = useCallback(() => {
    clearTimers();
    setPhase("idle");
    setLine(-1);
    setArrivals(0);
    setStep(0);
  }, [clearTimers]);

  return (
    <div className="deploy" data-phase={phase}>
      {/* ---------------------------------------------------------------- */}
      <ol className="deploy-rail" aria-label={t("stepsLabel")}>
        {STEPS.map((id, i) => (
          <li key={id}>
            <button
              type="button"
              className="deploy-step"
              data-active={i === step || undefined}
              data-done={i < step || undefined}
              onClick={() => setStep(i)}
              disabled={phase !== "idle"}
            >
              <span className="t-mono-sm">{String(i + 1).padStart(2, "0")}</span>
              {t(`steps.${id}`)}
            </button>
          </li>
        ))}
      </ol>

      <div className="deploy-body">
        {/* ------------------------------------------------ controls ----- */}
        <div className="deploy-controls">
          {step === 0 && (
            <fieldset className="deploy-field">
              <legend className="t-mono">{t("whereLegend")}</legend>
              <div className="deploy-options">
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="deploy-option"
                    data-active={p.id === preset.id || undefined}
                    onClick={() => pickPreset(p)}
                  >
                    <b>{t(`presets.${p.id}.label`)}</b>
                    <span className="t-small">{t(`presets.${p.id}.hint`)}</span>
                  </button>
                ))}
              </div>
              <p className="deploy-note t-small">{t("whereNote")}</p>
            </fieldset>
          )}

          {step === 1 && (
            <fieldset className="deploy-field">
              <legend className="t-mono">{t("assetLegend")}</legend>
              <div className="deploy-chips">
                {ASSETS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className="deploy-chip"
                    data-active={a.id === asset.id || undefined}
                    onClick={() => setAsset(a)}
                  >
                    {t(`assets.${a.id}`)}
                  </button>
                ))}
              </div>

              <Slider
                label={t("quantity")}
                value={format.number(quantity)}
                min={50}
                max={5000}
                step={50}
                current={quantity}
                onChange={setQuantity}
              />
              <p className="deploy-note t-small">{t("assetNote")}</p>
            </fieldset>
          )}

          {step === 2 && (
            <fieldset className="deploy-field">
              <legend className="t-mono">{t("rulesLegend")}</legend>
              <Slider
                label={t("claimRadius")}
                value={`${radius} m`}
                min={5}
                max={500}
                step={5}
                current={radius}
                onChange={setRadius}
              />
              <div className="deploy-chips">
                {TIERS.map((tier_, i) => (
                  <button
                    key={tier_.id}
                    type="button"
                    className="deploy-chip"
                    data-active={i === tier || undefined}
                    onClick={() => setTier(i)}
                  >
                    {t(`tiers.${tier_.id}.label`)}
                  </button>
                ))}
              </div>
              <p className="deploy-note t-small">{t(`tiers.${TIERS[tier].id}.note`)}</p>
            </fieldset>
          )}

          {step === 3 && (
            <fieldset className="deploy-field">
              <legend className="t-mono">{t("campaignLegend")}</legend>
              <dl className="deploy-summary">
                <div>
                  <dt className="t-mono-sm">{t("summaryLocation")}</dt>
                  <dd>{t(`presets.${preset.id}.place`)}</dd>
                </div>
                <div>
                  <dt className="t-mono-sm">{t("summaryAsset")}</dt>
                  <dd>
                    {format.number(quantity)} × {t(`assets.${asset.id}`)}
                  </dd>
                </div>
                <div>
                  <dt className="t-mono-sm">{t("summaryRadius")}</dt>
                  <dd>{radius} m</dd>
                </div>
                <div>
                  <dt className="t-mono-sm">{t("summaryVerification")}</dt>
                  <dd>
                    {t("summaryThreshold", {
                      tier: t(`tiers.${TIERS[tier].id}.label`),
                      threshold: TIERS[tier].threshold,
                    })}
                  </dd>
                </div>
                <div>
                  <dt className="t-mono-sm">{t("summaryBudget")}</dt>
                  <dd>
                    {t("summaryBudgetValue", {
                      budget: format.number(Math.round(model.budget)),
                      cost: model.costPerArrival.toFixed(2),
                    })}
                  </dd>
                </div>
              </dl>

              {phase === "idle" && (
                <button type="button" className="btn btn-brand deploy-publish" onClick={publish}>
                  {t("publish")}
                </button>
              )}

              {phase !== "idle" && (
                <ol className="deploy-log" aria-live="polite">
                  {SEQUENCE.map((entry, i) => (
                    <li key={entry.id} data-done={i <= line || undefined}>
                      <span className="deploy-log-mark" aria-hidden="true" />
                      {t(`sequence.${entry.id}`)}
                    </li>
                  ))}
                </ol>
              )}

              {phase === "live" && (
                <button type="button" className="btn btn-outline btn-sm deploy-reset" onClick={reset}>
                  {t("again")}
                </button>
              )}
            </fieldset>
          )}

          {phase === "idle" && step < 3 && (
            <div className="deploy-nav">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
              >
                {t("back")}
              </button>
              <button
                type="button"
                className="btn btn-brand btn-sm"
                onClick={() => setStep((s) => Math.min(3, s + 1))}
              >
                {step === 2 ? t("review") : t("next")}
              </button>
            </div>
          )}
        </div>

        {/* ------------------------------------------------- preview ----- */}
        <div className="deploy-preview">
          <StreetPlate radius={radius} label={t(`presets.${preset.id}.label`)} live={phase === "live"} />

          <div className="deploy-readout">
            {phase === "live" ? (
              <>
                <div className="deploy-metric deploy-metric-lead">
                  <span className="t-mono-sm">{t("verifiedArrivals")}</span>
                  <span className="t-num">{format.number(arrivals)}</span>
                </div>
                <div className="deploy-metric">
                  <span className="t-mono-sm">{t("costPerArrival")}</span>
                  <span className="t-num">${model.costPerArrival.toFixed(2)}</span>
                </div>
                <div className="deploy-metric">
                  <span className="t-mono-sm">{t("sawPin")}</span>
                  <span className="t-num">{format.number(model.seen)}</span>
                </div>
              </>
            ) : (
              <>
                <div className="deploy-metric deploy-metric-lead">
                  <span className="t-mono-sm">{t("claimRadius")}</span>
                  <span className="t-num">{radius} m</span>
                </div>
                <div className="deploy-metric">
                  <span className="t-mono-sm">{t("placementFee")}</span>
                  <span className="t-num">${model.fee.toFixed(2)}</span>
                </div>
                <div className="deploy-metric">
                  <span className="t-mono-sm">{t("perArrival")}</span>
                  <span className="t-num">${model.costPerArrival.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          <p className="t-mono-sm deploy-caption">
            {phase === "live" ? t("captionLive") : t("captionIdle")}
          </p>
        </div>
      </div>
    </div>
  );
}

/* The city under the pin. Not a real map: a plausible one, drawn once and
   reused at every radius, because the only thing it has to communicate
   honestly is how much ground a given claim radius actually covers.

   Blocks are hand-placed rather than generated so the grain reads like a city
   and not like a chessboard, and so the roads have somewhere to go. */
const BLOCKS = [
  [10, 8, 38, 30], [54, 8, 34, 30], [112, 8, 30, 30], [148, 8, 42, 30],
  [10, 44, 38, 22], [54, 44, 34, 22], [112, 44, 30, 22], [148, 44, 42, 22],
  [10, 72, 38, 46], [54, 72, 34, 46], [112, 72, 30, 46], [148, 72, 42, 46],
  [10, 124, 38, 26], [54, 124, 34, 26], [112, 124, 30, 26], [148, 124, 42, 26],
  [10, 156, 38, 36], [54, 156, 34, 36], [112, 156, 30, 36], [148, 156, 42, 36],
];

/** Claims come in around the drop, not on top of it. */
const CLAIM_DOTS = [
  [0.42, -0.28], [-0.55, 0.16], [0.18, 0.58], [-0.22, -0.62],
  [0.68, 0.3], [-0.7, -0.34], [0.06, -0.8], [0.5, 0.66],
];

function StreetPlate({ radius, label, live }: { radius: number; label: string; live: boolean }) {
  const t = useTranslations("deploy");
  // 500 m fills the plate, so the ring is comparable across every setting.
  // Square-rooted because what the reader is judging is ground covered, and
  // area goes as the square of the radius.
  const ring = 11 + Math.sqrt(radius / 500) * 78;
  // The scale bar is whatever round number fits sensibly under the ring.
  const barMetres = radius >= 300 ? 200 : radius >= 120 ? 100 : radius >= 40 ? 50 : 20;
  const barLength = (11 + Math.sqrt(barMetres / 500) * 78) - 11;

  return (
    <div className="deploy-plate" data-live={live || undefined}>
      <svg viewBox="0 0 200 200" className="deploy-plate-map" aria-hidden="true">
        <defs>
          <radialGradient id="deploy-ring-fill">
            <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.3" />
            <stop offset="62%" stopColor="var(--brand)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="var(--brand)" stopOpacity="0.02" />
          </radialGradient>
          <linearGradient id="deploy-sweep" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
          </linearGradient>
          {/* The sweep and the claims are clipped to the ring, so nothing the
              radius does not cover ever appears to be covered. */}
          <clipPath id="deploy-ring-clip">
            <circle cx="100" cy="100" r={ring} />
          </clipPath>
        </defs>

        <g className="deploy-plate-blocks">
          {BLOCKS.map(([x, y, w, h]) => (
            <g key={`${x}-${y}`}>
              <rect x={x} y={y + 1.5} width={w} height={h} rx="2" className="plate-block-shadow" />
              <rect x={x} y={y} width={w} height={h} rx="2" className="plate-block" />
            </g>
          ))}
        </g>

        {/* A park and a canal, because a grid with nothing in it reads as a
            diagram rather than as somewhere you could stand. */}
        <rect x="112" y="72" width="30" height="46" rx="3" className="plate-park" />
        <path d="M0 138 Q48 132 96 140 T200 134 L200 146 Q152 152 100 146 T0 150 Z" className="plate-water" />

        <g className="deploy-plate-roads">
          <path d="M0 100h200M100 0v200" className="plate-road-main" />
          <path d="M0 36h200M0 122h200M0 152h200M50 0v200M144 0v200" className="plate-road" />
          <path d="M-10 210 L210 -10" className="plate-road-avenue" />
        </g>

        {/* Claim radius. */}
        <circle cx="100" cy="100" r={ring} fill="url(#deploy-ring-fill)" className="deploy-plate-ring" />
        <g clipPath="url(#deploy-ring-clip)">
          <g className="plate-sweep">
            <path d={`M100 100 L${100 + ring} 100 A${ring} ${ring} 0 0 0 ${100 + ring * 0.5} ${100 - ring * 0.866} Z`} fill="url(#deploy-sweep)" />
          </g>
          {live &&
            CLAIM_DOTS.map(([dx, dy], i) => (
              <circle
                key={i}
                cx={100 + dx * ring * 0.82}
                cy={100 + dy * ring * 0.82}
                r="2"
                className="plate-claim"
                style={{ animationDelay: `${i * 260}ms` }}
              />
            ))}
        </g>
        <circle cx="100" cy="100" r={ring} className="deploy-plate-ring-line" />

        {/* Crosshair ticks on the ring, so the radius reads as measured. */}
        <g className="plate-ticks">
          <path d={`M100 ${100 - ring - 4}v6M100 ${100 + ring - 2}v6M${100 - ring - 4} 100h6M${100 + ring - 2} 100h6`} />
        </g>

        {/* A bar you can hold against the ring, in the ring's own units. */}
        <g className="plate-scale" transform="translate(10 186)">
          <line x1="0" y1="0" x2={barLength} y2="0" />
          <line x1="0" y1="-3" x2="0" y2="3" />
          <line x1={barLength} y1="-3" x2={barLength} y2="3" />
          <text x="0" y="-6">{barMetres} m</text>
        </g>

        {/* The drop itself: a pin standing on the ground, not a dot on paper. */}
        <g className="plate-pin" transform="translate(100 100)">
          <ellipse cx="0" cy="1" rx="7" ry="2.6" className="plate-pin-shadow" />
          <path d="M0 -18c-4.4 0-8 3.6-8 8 0 5.8 8 10 8 10s8-4.2 8-10c0-4.4-3.6-8-8-8Z" className="plate-pin-body" />
          <circle cx="0" cy="-10" r="3" className="plate-pin-eye" />
        </g>
      </svg>

      <span className="deploy-plate-tag t-mono-sm">
        {live && <LiveMark id="deploy-plate-live" size={12} />}
        {live ? t("live") : label}
      </span>

      <span className="deploy-plate-radius t-mono-sm">{t("radiusOf", { radius })}</span>
    </div>
  );
}

function Slider({
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
