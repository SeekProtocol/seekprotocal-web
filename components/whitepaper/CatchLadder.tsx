"use client";

import { useCallback, useMemo, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import {
  GAME_CONFIG as G,
  MAX_ATTEMPTS,
  RARITY_LADDER,
  RETRY_DECAY,
  type Rarity,
} from "@/content/collectibles";

/**
 * The catch roll, reproduced.
 *
 * This is not an illustration of the mechanic, it is the mechanic. The
 * arithmetic below is `supabase/functions/collect-coin/chance.ts` from the app,
 * term for term, and the constants come out of the `game_config` table rather
 * than being chosen to make the figure behave. Set the sliders to a level 5
 * player who fills the charge bar and the numbers land exactly on the table
 * published in the `two_attempts_per_spawn` migration.
 *
 * Two things are worth seeing rather than reading. Skill nudges and never
 * decides: the charge ring is a multiplier of 0.85 to 1.0, so a perfect tap on
 * a legendary is still a legendary. And a small sample tells you nothing, which
 * is why the simulation runs to a thousand spawns.
 */

const RARITIES: Rarity[] = ["common", "uncommon", "rare", "epic", "legendary"];

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

type Inputs = {
  base: number;
  level: number;
  clan: number;
  coldStreak: number;
  tap: number;
  attempt: number;
};

/** `computeChance` from the app, with the powerup multiplier left at 1. */
function finalChance({ base, level, clan, coldStreak, tap, attempt }: Inputs) {
  const boostedBase = Math.min(G.maxChance, base);
  const beforeTap = clamp(
    boostedBase + level * G.levelBonusPerLevel + clan + coldStreak,
    G.minChance,
    G.maxChance
  );
  const tapMult = G.tapFloor + G.tapSpan * tap;
  const retryMult = Math.pow(RETRY_DECAY, Math.max(0, attempt - 1));
  return clamp(beforeTap * tapMult * retryMult, G.minChance, G.maxChance);
}

export default function CatchLadder() {
  const t = useTranslations("whitepaperFigures");
  const format = useFormatter();
  const rarityLabel = useTranslations("rarity");
  const [rarity, setRarity] = useState<Rarity>("rare");
  const [level, setLevel] = useState(5);
  const [tap, setTap] = useState(1);
  const [clan, setClan] = useState(0);

  const [run, setRun] = useState({ spawns: 0, caught: 0 });
  const [last, setLast] = useState<boolean[] | null>(null);

  const ladder = RARITY_LADDER[rarity];

  /** The two attempts, with the pity bonus arriving on the retry. */
  const attempts = useMemo(
    () =>
      Array.from({ length: MAX_ATTEMPTS }, (_, i) => ({
        n: i + 1,
        chance: finalChance({
          base: ladder.base,
          level,
          clan,
          // The cold-streak bonus is paid per consecutive miss, so it is worth
          // nothing on the first attempt and one step on the retry.
          coldStreak: Math.min(G.coldStreakCap, i * G.coldStreakPerFail),
          tap,
          attempt: i + 1,
        }),
      })),
    [ladder.base, level, clan, tap]
  );

  /** Chance of catching at least once across the spawn. */
  const across = useMemo(
    () => 1 - attempts.reduce((miss, a) => miss * (1 - a.chance), 1),
    [attempts]
  );

  const spawn = useCallback(() => {
    const rolls: boolean[] = [];
    for (const attempt of attempts) {
      const hit = Math.random() < attempt.chance;
      rolls.push(hit);
      if (hit) break;
    }
    return rolls;
  }, [attempts]);

  const reset = useCallback(() => {
    setRun({ spawns: 0, caught: 0 });
    setLast(null);
  }, []);

  const runOne = useCallback(() => {
    const rolls = spawn();
    setLast(rolls);
    setRun((prev) => ({
      spawns: prev.spawns + 1,
      caught: prev.caught + (rolls[rolls.length - 1] ? 1 : 0),
    }));
  }, [spawn]);

  const runMany = useCallback(() => {
    let caught = 0;
    for (let i = 0; i < 1000; i++) {
      const rolls = spawn();
      if (rolls[rolls.length - 1]) caught += 1;
    }
    setLast(null);
    setRun((prev) => ({ spawns: prev.spawns + 1000, caught: prev.caught + caught }));
  }, [spawn]);

  const observed = run.spawns > 0 ? run.caught / run.spawns : 0;
  const gap = run.spawns > 0 ? Math.abs(observed - across) * 100 : 0;

  /** The same model at the reference player the migration quotes its table for. */
  const published = useMemo(
    () =>
      Array.from({ length: MAX_ATTEMPTS }, (_, i) =>
        finalChance({
          base: ladder.base,
          level: 5,
          clan: 0,
          coldStreak: Math.min(G.coldStreakCap, i * G.coldStreakPerFail),
          tap: 1,
          attempt: i + 1,
        })
      ),
    [ladder.base]
  );

  return (
    <div className="wp-figure ladder" style={{ ["--rarity" as string]: ladder.colour }}>
      <div className="ladder-head">
        <div>
          <p className="t-mono">{t("liveModel")}</p>
          <h3 className="t-h4" style={{ marginTop: "0.4rem" }}>
            {t("ladderTitle")}
          </h3>
        </div>
        <div className="ladder-rarities" role="group" aria-label={t("rarityLabel")}>
          {RARITIES.map((r) => (
            <button
              key={r}
              type="button"
              className="ladder-rarity"
              data-active={r === rarity || undefined}
              style={{ ["--rarity" as string]: RARITY_LADDER[r].colour }}
              onClick={() => {
                setRarity(r);
                reset();
              }}
            >
              {rarityLabel(r)}
            </button>
          ))}
        </div>
      </div>

      <div className="ladder-body">
        {/* ------------------------------------------------------- terms */}
        <div className="ladder-terms">
          <Slider
            label={t("playerLevel")}
            value={String(level)}
            min={1}
            max={10}
            step={1}
            current={level}
            onChange={(v) => {
              setLevel(v);
              reset();
            }}
          />
          <Slider
            label={t("chargeRing")}
            value={tap === 0 ? t("missed") : `${Math.round(tap * 100)}%`}
            min={0}
            max={1}
            step={0.05}
            current={tap}
            onChange={(v) => {
              setTap(v);
              reset();
            }}
          />
          <Slider
            label={t("clanBonus")}
            value={t("points", { points: (clan * 100).toFixed(1) })}
            min={0}
            max={G.clanBonusCap}
            step={0.005}
            current={clan}
            onChange={(v) => {
              setClan(v);
              reset();
            }}
          />

          <ul className="ladder-breakdown">
            <li>
              <span>{t("baseChance")}</span>
              <b>{(ladder.base * 100).toFixed(0)}%</b>
            </li>
            <li>
              <span>{t("levelBonus")}</span>
              <b>{t("points", { points: (level * G.levelBonusPerLevel * 100).toFixed(1) })}</b>
            </li>
            <li>
              <span>{t("ringMultiplier")}</span>
              <b>×{(G.tapFloor + G.tapSpan * tap).toFixed(3)}</b>
            </li>
            <li>
              <span>{t("retryMultiplier")}</span>
              <b>×{RETRY_DECAY}</b>
            </li>
          </ul>
        </div>

        {/* ---------------------------------------------------- attempts */}
        <div className="ladder-sim">
          <div className="ladder-attempts">
            {attempts.map((attempt, i) => (
              <div
                key={attempt.n}
                className="ladder-attempt"
                data-outcome={
                  last && i < last.length ? (last[i] ? "hit" : "miss") : undefined
                }
              >
                <span className="t-mono-sm">
                  {attempt.n === 1 ? t("firstAttempt") : t("retry")}
                </span>
                <span className="t-num ladder-chance">
                  {(attempt.chance * 100).toFixed(1)}%
                </span>
                <span className="ladder-meter">
                  <i style={{ width: `${attempt.chance * 100}%` }} />
                </span>
              </div>
            ))}
          </div>

          <div className="ladder-figures">
            <div>
              <span className="t-mono-sm">{t("acrossSpawn")}</span>
              <span className="t-num ladder-figure">{(across * 100).toFixed(1)}%</span>
            </div>
            <div>
              <span className="t-mono-sm">{t("youCaught")}</span>
              <span className="t-num ladder-figure">
                {run.spawns > 0 ? `${(observed * 100).toFixed(1)}%` : t("notYet")}
              </span>
            </div>
          </div>

          <div className="ladder-bars">
            <span className="ladder-bar" data-kind="theory">
              <i style={{ width: `${across * 100}%` }} />
            </span>
            <span className="ladder-bar" data-kind="observed">
              <i style={{ width: `${observed * 100}%` }} />
            </span>
          </div>

          <p className="t-small ladder-tally">
            {run.spawns === 0
              ? t("ladderHint")
              : t("ladderTally", {
                  caught: format.number(run.caught),
                  spawns: format.number(run.spawns),
                  gap: gap.toFixed(1),
                })}
          </p>

          <div className="ladder-controls">
            <button type="button" className="btn btn-brand btn-sm" onClick={runOne}>
              {t("runOne")}
            </button>
            <button type="button" className="btn btn-outline btn-sm" onClick={runMany}>
              {t("runThousand")}
            </button>
            {run.spawns > 0 && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={reset}>
                {t("reset")}
              </button>
            )}
          </div>
        </div>
      </div>

      <p className="t-mono-sm wp-figure-caption">
        {t("ladderCaption", {
          rarity: rarityLabel(rarity).toLowerCase(),
          first: (published[0] * 100).toFixed(0),
          second: (published[1] * 100).toFixed(0),
          overall: Math.round(ladder.overall * 100),
        })}
      </p>
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
