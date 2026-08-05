"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { listCopy, withCopy } from "@/lib/content-i18n";
import type { MobiState } from "@/components/three/MobiOrb";

const MobiOrb = dynamic(() => import("@/components/three/MobiOrb"), { ssr: false });

/** The demo exchange. Label and line come from `mobiSection`, keyed by id. */
const SCRIPT: {
  id: string;
  state: MobiState;
  speaker: "you" | "mobi" | "system";
}[] = [
  { id: "listening", state: "listening", speaker: "you" },
  { id: "thinking", state: "thinking", speaker: "system" },
  { id: "answering", state: "speaking", speaker: "mobi" },
  { id: "idle", state: "idle", speaker: "system" },
];

const BARS = Array.from({ length: 28 }, (_, i) => i);

/**
 * Mobi, the in-app assistant — the app's own Spline model rendered live rather
 * than filmed. Tapping the orb wakes it and moves the conversation on, which
 * is the same gesture the app uses.
 */
export default function MobiSection() {
  const t = useTranslations("mobiSection");
  const script = withCopy(t, SCRIPT, ["label", "line"]);
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

  const current = script[step];

  return (
    <div className="mobi-layout" ref={hostRef}>
      <div className="mobi-stage">
        <button
          type="button"
          className="mobi-tap"
          ref={tapRef}
          onClick={advance}
          data-state={current.state}
          aria-label={t("tapAria", { state: current.label.toLowerCase() })}
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
          {pulse === 0 ? t("tapHint") : t("tapAgain", { label: current.label })}
        </p>
      </div>

      <div className="mobi-copy">
        <p className="eyebrow">Mobi</p>
        <h2 className="t-h2">{t("title")}</h2>
        <p className="t-lead" style={{ marginTop: "1.25rem" }}>
          {t("lead")}
        </p>

        <div key={step} className="mobi-line" data-speaker={current.speaker}>
          <span className="t-mono mobi-line-label">{current.label}</span>
          <p className="mobi-line-text">
            {current.speaker === "system" ? current.line : `“${current.line}”`}
          </p>
        </div>

        <div className="mobi-states">
          {script.map((entry, i) => (
            <button
              key={entry.id}
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
          {listCopy(t, "points").map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
