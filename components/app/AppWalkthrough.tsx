"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import PhoneFrame from "@/components/app/PhoneFrame";
import MapScreen from "@/components/app/screens/MapScreen";
import SpawnScreen from "@/components/app/screens/SpawnScreen";
import CatchScreen from "@/components/app/screens/CatchScreen";
import ResultScreen from "@/components/app/screens/ResultScreen";
import WalletScreen from "@/components/app/screens/WalletScreen";
import {
  COLLECTIBLES,
  MAX_ATTEMPTS,
  RARITY_LADDER,
  RETRY_DECAY,
  type Collectible,
} from "@/content/collectibles";

export type Step = "map" | "spawn" | "catch" | "result" | "wallet";

export type CatchOutcome = {
  caught: boolean;
  attempt: number;
  chance: number;
  charge: number;
  units: number;
  xp: number;
};

/** The five steps, in order. The copy for each is in `walkthrough`. */
const STEPS: Step[] = ["map", "spawn", "catch", "result", "wallet"];

/**
 * A clickable run through Seekprotocol. The odds, the two attempts, the decay and
 * the interrupting mechanics are the app's own — this is the real loop, not a
 * dramatisation of it.
 */
export default function AppWalkthrough() {
  const t = useTranslations("walkthrough");
  const [step, setStep] = useState<Step>("map");
  const [target, setTarget] = useState<Collectible>(COLLECTIBLES[4]);
  const [attempt, setAttempt] = useState(1);
  const [outcome, setOutcome] = useState<CatchOutcome | null>(null);
  const [caughtList, setCaughtList] = useState<Collectible[]>([]);
  const hostRef = useRef<HTMLDivElement>(null);

  const pickSpawn = useCallback((coin: Collectible) => {
    setTarget(coin);
    setAttempt(1);
    setOutcome(null);
    setStep("spawn");
  }, []);

  const resolve = useCallback(
    (charge: number) => {
      const ladder = RARITY_LADDER[target.rarity];
      // Each retry is worth RETRY_DECAY of the last; charge scales the base chance.
      const decay = Math.pow(RETRY_DECAY, attempt - 1);
      const chance = Math.min(0.95, ladder.base * decay * (0.45 + charge * 0.75));
      const caught = Math.random() < chance;
      const units = caught ? Math.max(1, Math.round(1 + charge * 3)) : 0;

      setOutcome({
        caught,
        attempt,
        chance,
        charge,
        units,
        xp: caught ? Math.round(target.xp * (0.6 + charge * 0.6)) : 0,
      });
      if (caught) setCaughtList((prev) => [target, ...prev].slice(0, 4));
      setStep("result");
    },
    [attempt, target]
  );

  const retry = useCallback(() => {
    setAttempt((n) => n + 1);
    setOutcome(null);
    setStep("catch");
  }, []);

  const reset = useCallback(() => {
    setAttempt(1);
    setOutcome(null);
    setStep("map");
  }, []);

  return (
    <div className="walkthrough" ref={hostRef}>
      <div className="walkthrough-copy">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h2 className="t-h2">{t("title")}</h2>
        <p className="t-lead" style={{ marginTop: "1.25rem" }}>
          {t("lead")}
        </p>

        <ol className="walkthrough-steps">
          {STEPS.map((key, i) => (
            <li
              key={key}
              className="walkthrough-step"
              data-active={key === step || undefined}
              data-done={STEPS.indexOf(step) > i || undefined}
            >
              <span className="walkthrough-step-dot">{i + 1}</span>
              <span className="walkthrough-step-label">{t(`${key}.label`)}</span>
            </li>
          ))}
        </ol>

        <div key={step} className="walkthrough-detail">
          <p className="t-mono">
            {String(STEPS.indexOf(step) + 1).padStart(2, "0")} · {t(`${step}.label`)}
          </p>
          <h3 className="t-h3 walkthrough-detail-title">{t(`${step}.title`)}</h3>
          <p className="t-body">{t(`${step}.body`)}</p>
        </div>

        {step !== "map" && (
          <button type="button" className="btn btn-ghost btn-sm walkthrough-reset" onClick={reset}>
            {t("startOver")}
          </button>
        )}
      </div>

      <div className="walkthrough-stage">
        <span className="showcase-halo" aria-hidden="true" />
        <PhoneFrame>
          {step === "map" && <MapScreen onPick={pickSpawn} />}
          {step === "spawn" && (
            <SpawnScreen
              coin={target}
              attempt={attempt}
              onBack={() => setStep("map")}
              onCatch={() => setStep("catch")}
            />
          )}
          {step === "catch" && (
            <CatchScreen coin={target} attempt={attempt} onDone={resolve} />
          )}
          {step === "result" && outcome && (
            <ResultScreen
              coin={target}
              outcome={outcome}
              canRetry={attempt < MAX_ATTEMPTS}
              onRetry={retry}
              onContinue={() => setStep("wallet")}
              onBack={reset}
            />
          )}
          {step === "wallet" && <WalletScreen caught={caughtList} onBack={reset} />}
        </PhoneFrame>
      </div>
    </div>
  );
}
