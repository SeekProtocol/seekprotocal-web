"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { useScrubbedSection } from "@/lib/use-scrubbed-section";

const ARStory = dynamic(() => import("@/components/three/ARStory"), { ssr: false });

/**
 * The AR pipeline as a scroll-driven story. Each stage names the thing the
 * phone is doing at that moment, in the order it actually does it.
 */
const STAGES = [
  {
    id: "see",
    at: 0,
    index: "01",
    label: "The camera looks",
    title: "A camera does not see a street",
    body: "It sees brightness changing across a grid. Before anything can be placed anywhere, the scene has to be turned into something with structure, and at this point there is none.",
    readout: "FRAME 1/60 · NO TRACKING",
  },
  {
    id: "track",
    at: 0.25,
    index: "02",
    label: "Features resolve",
    title: "Corners are what the world is made of",
    body: "Points where brightness changes in two directions at once survive movement, so the engine keeps them and throws the rest away. Track enough of them across enough frames and the phone knows how it moved.",
    readout: "TRACKING · 2,412 FEATURES",
  },
  {
    id: "plane",
    at: 0.48,
    index: "03",
    label: "A plane is found",
    title: "Something to stand on",
    body: "Features that share a surface get grouped into a plane. That is the moment a drop stops being a picture on your screen and becomes an object with a place to sit.",
    readout: "PLANE DETECTED · 6.0 × 6.0 M",
  },
  {
    id: "anchor",
    at: 0.68,
    index: "04",
    label: "The anchor sets",
    title: "Pinned to the world, not to the phone",
    body: "The drop is bound to that patch of geometry and to the coordinate it was published at. Walk around it and it stays where it was. Two people standing in the same place see it in the same spot.",
    readout: "ANCHOR LOCKED · 52.3702 N 4.8952 E",
  },
  {
    id: "persist",
    at: 0.86,
    index: "05",
    label: "It persists",
    title: "Still there tomorrow",
    body: "The anchor is stored against the location rather than the session, so closing the app does not move it. That persistence is what separates an AR toy from an AR protocol.",
    readout: "ANCHOR PERSISTED · SESSION-INDEPENDENT",
  },
];

const STOPS = STAGES.map((s) => s.at);

export default function ARSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef(0);

  const stage = useScrubbedSection({
    sectionRef,
    progressRef,
    stops: STOPS,
    restingProgress: 0.5,
  });

  const current = STAGES[stage];

  return (
    <section className="ar-section section-inverse" ref={sectionRef}>
      <div className="ar-sticky">
        <ARStory progressRef={progressRef} />

        <div className="ar-overlay shell">
          <div className="ar-copy">
            <p className="eyebrow">Augmented reality</p>

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

        <p className="t-mono-sm ar-scroll-hint">Keep scrolling</p>
      </div>
    </section>
  );
}
