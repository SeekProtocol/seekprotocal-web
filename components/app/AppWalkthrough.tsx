"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

const COPY: Record<Step, { eyebrow: string; title: string; body: string }> = {
  map: {
    eyebrow: "01 · The map",
    title: "Everything nearby, standing where it actually is",
    body: "Spawns sit on fixed coordinates and stay there until someone claims them. Tap one to see what it is and how far you have to walk.",
  },
  spawn: {
    eyebrow: "02 · The spawn",
    title: "Rarity tells you what you are walking towards",
    body: "Common through legendary, each with its own catch chance. You get two attempts, and the retry is worth 0.65 of the first, so the opening tap matters most.",
  },
  catch: {
    eyebrow: "03 · The catch",
    title: "Tap to charge, and hold your nerve",
    body: "The ring fills as you tap. Something interrupts every round or two: the orb freezes, the charge springs a leak, or a surge opens where taps count double.",
  },
  result: {
    eyebrow: "04 · The roll",
    title: "Charge buys chance, it does not buy certainty",
    body: "A full ring on a legendary is still a one-in-five. That is what makes a legendary worth having, and what makes the tap decide something.",
  },
  wallet: {
    eyebrow: "05 · Yours",
    title: "It lands in a wallet you never had to set up",
    body: "Created from a social login, so a first-time player collects something within a minute. Export the key whenever you want custody.",
  },
};

/**
 * A clickable run through SeekAR. The odds, the two attempts, the decay and
 * the interrupting mechanics are the app's own — this is the real loop, not a
 * dramatisation of it.
 */
export default function AppWalkthrough() {
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

  const copy = COPY[step];

  return (
    <div className="walkthrough" ref={hostRef}>
      <div className="walkthrough-copy">
        <p className="eyebrow">Walk through it</p>
        <h2 className="t-h2">This is the whole loop</h2>
        <p className="t-lead" style={{ marginTop: "1.25rem" }}>
          Not a video of the app. These are its own rules, running here. Tap a
          spawn on the map and take it from there.
        </p>

        <ol className="walkthrough-steps">
          {(Object.keys(COPY) as Step[]).map((key, i) => (
            <li
              key={key}
              className="walkthrough-step"
              data-active={key === step || undefined}
              data-done={
                (Object.keys(COPY) as Step[]).indexOf(step) > i || undefined
              }
            >
              <span className="walkthrough-step-dot">{i + 1}</span>
              <span className="walkthrough-step-label">
                {COPY[key].eyebrow.split(" · ")[1]}
              </span>
            </li>
          ))}
        </ol>

        <div key={step} className="walkthrough-detail">
          <p className="t-mono">{copy.eyebrow}</p>
          <h3 className="t-h3 walkthrough-detail-title">{copy.title}</h3>
          <p className="t-body">{copy.body}</p>
        </div>

        {step !== "map" && (
          <button type="button" className="btn btn-ghost btn-sm walkthrough-reset" onClick={reset}>
            Start over
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
