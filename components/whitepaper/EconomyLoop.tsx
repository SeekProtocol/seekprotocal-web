"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { withCopy } from "@/lib/content-i18n";

const STAGES = [
  { id: "fund" },
  { id: "place" },
  { id: "walk" },
  { id: "verify" },
  { id: "settle" },
  { id: "split" },
];

export default function EconomyLoop() {
  const t = useTranslations("whitepaperFigures");
  const stages = withCopy(useTranslations("economyStages"), STAGES, [
    "label",
    "actor",
    "body",
    "flow",
  ]);
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const node = ref.current;
    let visible = false;
    const observer = node
      ? new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.35 })
      : null;
    if (node && observer) observer.observe(node);
    const id = window.setInterval(() => {
      if (visible) setStep((prev) => (prev + 1) % STAGES.length);
    }, 3200);
    return () => {
      window.clearInterval(id);
      observer?.disconnect();
    };
  }, [paused]);

  const current = stages[step];
  const angleFor = (i: number) => (360 / STAGES.length) * i - 90;

  return (
    <div className="wp-figure economy" ref={ref}>
      <div className="economy-ring" role="tablist" aria-label={t("economyLabel")}>
        <span className="economy-orbit" aria-hidden="true" />
        <span
          className="economy-marker"
          style={{ ["--angle" as string]: `${angleFor(step)}deg` }}
          aria-hidden="true"
        />

        {stages.map((stage, i) => (
          <button
            key={stage.id}
            type="button"
            role="tab"
            aria-selected={i === step}
            className="economy-node"
            data-active={i === step || undefined}
            style={{ ["--angle" as string]: `${angleFor(i)}deg` }}
            onClick={() => {
              setStep(i);
              setPaused(true);
            }}
          >
            <span className="economy-node-dot">{i + 1}</span>
            <span className="economy-node-label">{stage.label}</span>
          </button>
        ))}

        <div className="economy-centre">
          <span className="t-mono-sm">{t("stageOf", { step: step + 1, total: stages.length })}</span>
          <span className="economy-flow">{current.flow}</span>
        </div>
      </div>

      <div key={current.id} className="economy-detail">
        <span className="t-mono">{current.actor}</span>
        <h3 className="t-h3 economy-detail-title">{current.label}</h3>
        <p className="t-body">{current.body}</p>
      </div>
    </div>
  );
}
