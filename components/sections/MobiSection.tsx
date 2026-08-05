"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { MobiState } from "@/components/three/MobiOrb";

const MobiOrb = dynamic(() => import("@/components/three/MobiOrb"), { ssr: false });

const SCRIPT: {
  state: MobiState;
  label: string;
  speaker: "you" | "mobi" | "system";
  line: string;
}[] = [
  {
    state: "listening",
    label: "Listening",
    speaker: "you",
    line: "What's worth walking to around here?",
  },
  {
    state: "thinking",
    label: "Reading the street",
    speaker: "system",
    line: "Matching what the camera sees against nearby spawns…",
  },
  {
    state: "speaking",
    label: "Answering",
    speaker: "mobi",
    line: "There's a legendary two streets up, behind the market. Six minutes at your pace, and it closes at six.",
  },
  {
    state: "idle",
    label: "Idle",
    speaker: "system",
    line: "Waiting. Nothing is being recorded.",
  },
];

const BARS = Array.from({ length: 28 }, (_, i) => i);

/**
 * Mobi, the in-app assistant — the app's own Spline model rendered live rather
 * than filmed. Tapping the orb wakes it and moves the conversation on, which
 * is the same gesture the app uses.
 */
export default function MobiSection() {
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  /** Bumped on every tap. The orb reads it as one impulse per increment. */
  const [pulse, setPulse] = useState(0);
  const hostRef = useRef<HTMLDivElement>(null);
  const tapRef = useRef<HTMLButtonElement>(null);

  const advance = useCallback(() => {
    setPaused(true);
    setPulse((n) => n + 1);
    setStep((prev) => (prev + 1) % SCRIPT.length);

    // Restart the DOM shockwave. Removing the attribute and forcing a reflow
    // before setting it again is what lets the animation replay on a rapid
    // second tap rather than being ignored as already running.
    const node = tapRef.current;
    if (node) {
      node.removeAttribute("data-struck");
      void node.offsetWidth;
      node.setAttribute("data-struck", "true");
    }
  }, []);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const host = hostRef.current;
    let visible = true;
    const observer = host
      ? new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.3 })
      : null;
    if (host && observer) observer.observe(host);
    const id = window.setInterval(() => {
      if (visible) setStep((prev) => (prev + 1) % SCRIPT.length);
    }, 4600);
    return () => {
      window.clearInterval(id);
      observer?.disconnect();
    };
  }, [paused]);

  const current = SCRIPT[step];

  return (
    <div className="mobi-layout" ref={hostRef}>
      <div className="mobi-stage">
        <button
          type="button"
          className="mobi-tap"
          ref={tapRef}
          onClick={advance}
          data-state={current.state}
          aria-label={`Mobi is ${current.label.toLowerCase()}. Tap to continue.`}
        >
          <span className="mobi-halo" aria-hidden="true" />
          <span className="mobi-reticle" aria-hidden="true">
            <i /><i /><i /><i />
          </span>
          <MobiOrb state={current.state} pulse={pulse} className="mobi-orb" />
          <span className="mobi-ripple" aria-hidden="true" />
          <span className="mobi-strike" aria-hidden="true" />
          <span className="mobi-sweep" aria-hidden="true" />
        </button>

        <div className="mobi-wave" data-state={current.state} aria-hidden="true">
          {BARS.map((i) => (
            <span key={i} style={{ ["--i" as string]: i }} />
          ))}
        </div>

        <p className="t-mono-sm mobi-tap-hint">
          {pulse === 0 ? "Tap Mobi" : `${current.label} · tap again`}
        </p>
      </div>

      <div className="mobi-copy">
        <p className="eyebrow">Mobi</p>
        <h2 className="t-h2">The companion that can see what you see</h2>
        <p className="t-lead" style={{ marginTop: "1.25rem" }}>
          Ask out loud and Mobi reads the street through the camera: landmarks,
          opening hours, which way the drop is. It runs on-device wherever it
          can, and it never keeps a trace of where you have been.
        </p>

        <div key={step} className="mobi-line" data-speaker={current.speaker}>
          <span className="t-mono mobi-line-label">{current.label}</span>
          <p className="mobi-line-text">
            {current.speaker === "system" ? current.line : `“${current.line}”`}
          </p>
        </div>

        <div className="mobi-states">
          {SCRIPT.map((entry, i) => (
            <button
              key={entry.label}
              type="button"
              className="mobi-state"
              data-active={i === step || undefined}
              onClick={() => {
                setStep(i);
                setPaused(true);
              }}
            >
              {entry.label}
            </button>
          ))}
        </div>

        <ul className="showcase-points" style={{ marginTop: "2rem" }}>
          <li>Voice in, voice out, hands free while you walk</li>
          <li>Reads landmarks and signage from the live camera</li>
          <li>Quests that adapt to how and where you play</li>
        </ul>
      </div>
    </div>
  );
}
