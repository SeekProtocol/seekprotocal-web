"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { StatusBar } from "@/components/app/PhoneFrame";
import { RARITY_LADDER, type Collectible } from "@/content/collectibles";

/**
 * The catch round, as the app plays it. Tap the orb to fill the ring inside
 * five seconds. A round draws a mechanic — freeze, leak or surge — or nothing
 * at all, because a round is only tense if a calm one was possible.
 */
const ROUND_MS = 5000;
const TAPS_TO_FILL = 9;

type Mechanic = "freeze" | "leak" | "surge" | "none";

const MECHANIC_COPY: Record<Exclude<Mechanic, "none">, string> = {
  freeze: "Frozen, keep tapping to melt it",
  leak: "Leaking, seal the breaches",
  surge: "Surge, every tap counts double",
};

type Breach = { id: number; x: number; y: number };

export default function CatchScreen({
  coin,
  attempt,
  onDone,
}: {
  coin: Collectible;
  attempt: number;
  onDone: (charge: number) => void;
}) {
  const ladder = RARITY_LADDER[coin.rarity];

  const [charge, setCharge] = useState(0);
  const [remaining, setRemaining] = useState(ROUND_MS);
  const [mechanic, setMechanic] = useState<Mechanic>("none");
  const [active, setActive] = useState(false);
  const [breaches, setBreaches] = useState<Breach[]>([]);
  const [pulse, setPulse] = useState(0);

  const chargeRef = useRef(0);
  const doneRef = useRef(false);
  const startRef = useRef(0);
  const rafRef = useRef(0);

  // Draw the round's mechanic once, and when it fires.
  const planRef = useRef<{ kind: Mechanic; at: number; until: number }>({
    kind: "none",
    at: 0,
    until: 0,
  });

  useEffect(() => {
    const roll = Math.random();
    const kind: Mechanic =
      roll < 0.25 ? "none" : roll < 0.5 ? "freeze" : roll < 0.78 ? "leak" : "surge";
    const at = 1200 + Math.random() * 1600;
    planRef.current = { kind, at, until: at + (kind === "surge" ? 1600 : 1900) };

    startRef.current = performance.now();
    doneRef.current = false;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      const elapsed = performance.now() - startRef.current;
      const left = Math.max(0, ROUND_MS - elapsed);
      setRemaining(left);

      const plan = planRef.current;
      const live = elapsed >= plan.at && elapsed < plan.until && plan.kind !== "none";
      setActive(live);
      setMechanic(live ? plan.kind : "none");

      if (live && plan.kind === "leak") {
        // A leak drains what you have earned until the breaches are sealed.
        chargeRef.current = Math.max(0, chargeRef.current - 0.0006 * 16);
        setCharge(chargeRef.current);
        setBreaches((prev) =>
          prev.length
            ? prev
            : [0, 1, 2].map((id) => ({
                id,
                x: 18 + Math.random() * 64,
                y: 14 + Math.random() * 34,
              }))
        );
      } else if (!live) {
        // Returning the same empty array lets React bail out; a fresh []
        // every frame would re-render the screen sixty times a second.
        setBreaches((prev) => (prev.length ? [] : prev));
      }

      if (left <= 0 && !doneRef.current) {
        doneRef.current = true;
        cancelAnimationFrame(rafRef.current);
        onDone(chargeRef.current);
      }
    };

    if (reduced) {
      // No timed round without motion — give a fair charge and resolve.
      chargeRef.current = 0.7;
      setCharge(0.7);
      const id = window.setTimeout(() => onDone(0.7), 900);
      return () => window.clearTimeout(id);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [onDone, attempt]);

  const tapOrb = useCallback(() => {
    if (doneRef.current) return;
    const plan = planRef.current;
    const elapsed = performance.now() - startRef.current;
    const live = elapsed >= plan.at && elapsed < plan.until;

    // A frozen orb takes nothing until it melts; a surge takes double.
    let gain = 1 / TAPS_TO_FILL;
    if (live && plan.kind === "freeze") gain = 0.25 / TAPS_TO_FILL;
    if (live && plan.kind === "surge") gain *= 2;

    chargeRef.current = Math.min(1, chargeRef.current + gain);
    setCharge(chargeRef.current);
    setPulse((n) => n + 1);
  }, []);

  const sealBreach = useCallback((id: number) => {
    setBreaches((prev) => {
      const next = prev.filter((b) => b.id !== id);
      // Sealing them all lifts the leak early.
      if (!next.length) planRef.current = { ...planRef.current, until: 0 };
      return next;
    });
  }, []);

  const seconds = (remaining / 1000).toFixed(1);
  const ringPct = Math.round(charge * 100);

  return (
    <div className="scr scr-catch" style={{ ["--rarity" as string]: ladder.colour }}>
      <StatusBar />

      <video
        className="catch-feed"
        src="/app/video/illustration-3.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
      />
      <span className="catch-scrim" aria-hidden="true" />

      <header className="catch-head">
        <span className="catch-chip">
          <span className="catch-chip-dot" />
          Attempt {attempt} of 3
        </span>
        <span className="catch-chip catch-chip-quiet">{seconds}s</span>
      </header>

      {/* The creature owns the top two thirds; nothing is drawn over it. */}
      <button
        type="button"
        className="catch-orb"
        onClick={tapOrb}
        data-mechanic={active ? mechanic : undefined}
        aria-label="Tap to charge"
      >
        <svg className="catch-orb-ring" viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r="54" className="catch-orb-track" />
          <circle
            cx="60"
            cy="60"
            r="54"
            className="catch-orb-fill"
            style={{ strokeDashoffset: 339.3 * (1 - charge) }}
          />
        </svg>
        <img key={pulse} src={coin.image} alt="" className="catch-orb-coin" />
        {active && mechanic === "freeze" && <span className="catch-frost" aria-hidden="true" />}
      </button>

      {breaches.map((breach) => (
        <button
          key={breach.id}
          type="button"
          className="catch-breach"
          style={{ left: `${breach.x}%`, top: `${breach.y}%` }}
          onClick={() => sealBreach(breach.id)}
          aria-label="Seal the breach"
        />
      ))}

      {/* Every line the catch has to say lands in the bottom band. */}
      <div className="catch-band">
        <div className="catch-prompt">
          {active && mechanic !== "none"
            ? MECHANIC_COPY[mechanic]
            : charge >= 1
              ? "Ring full, hold it"
              : "Tap the coin"}
        </div>

        <div className="catch-charge">
          <span className="catch-charge-bar">
            <span className="catch-charge-fill" style={{ width: `${ringPct}%` }} />
          </span>
          <span className="catch-charge-pct">{ringPct}%</span>
        </div>
      </div>
    </div>
  );
}
