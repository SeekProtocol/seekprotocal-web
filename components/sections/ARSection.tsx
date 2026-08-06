"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { withCopy } from "@/lib/content-i18n";
import { useNearViewport } from "@/lib/use-near-viewport";
import { useScrubbedSection } from "@/lib/use-scrubbed-section";

const ARStory = dynamic(() => import("@/components/three/ARStory"), { ssr: false });

/**
 * The AR pipeline as a scroll-driven story. Each stage names the thing the
 * phone is doing at that moment, in the order it actually does it.
 */
const STAGES = [
  { id: "see", at: 0, index: "01" },
  { id: "track", at: 0.25, index: "02" },
  { id: "plane", at: 0.48, index: "03" },
  { id: "anchor", at: 0.68, index: "04" },
  { id: "persist", at: 0.86, index: "05" },
];

const STOPS = STAGES.map((s) => s.at);

export default function ARSection() {
  const t = useTranslations("arSection");
  const stages = withCopy(t, STAGES, ["label", "title", "body", "readout"]);
  const sectionRef = useRef<HTMLElement>(null);
  /* Gated at the section rather than inside the scene. The scene's own
     useNearViewport stops it building, but a rendered dynamic() still fetches
     its chunk, and all five scenes share one 603 KB bundle with three.js in
     it. Holding the render back holds the download back with it. */
  const nearScene = useNearViewport(sectionRef, 1.5);
  const progressRef = useRef(0);

  const stage = useScrubbedSection({
    sectionRef,
    progressRef,
    stops: STOPS,
    restingProgress: 0.5,
  });

  const current = stages[stage];

  return (
    <section className="ar-section section-inverse scene-scrubbed" ref={sectionRef}>
      <div className="ar-sticky">
        {nearScene && <ARStory progressRef={progressRef} />}

        <div className="ar-overlay shell">
          <div className="ar-copy">
            <p className="eyebrow">{t("eyebrow")}</p>

            <div key={current.id} className="ar-stage">
              <span className="t-mono ar-stage-index">
                {current.index} · {current.label}
              </span>
              <h2 className="t-h2 ar-stage-title">{current.title}</h2>
              <p className="t-lead ar-stage-body">{current.body}</p>
            </div>

            <ol className="ar-track" aria-hidden="true">
              {STAGES.map((s, i) => (
                <li key={s.id} data-active={i === stage || undefined} data-done={i < stage || undefined}>
                  <span />
                </li>
              ))}
            </ol>
          </div>

          <div className="ar-readout">
            <span className="ar-readout-dot" />
            <span className="t-mono-sm">{current.readout}</span>
          </div>
        </div>

        <p className="t-mono-sm ar-scroll-hint">{t("hint")}</p>
      </div>
    </section>
  );
}
