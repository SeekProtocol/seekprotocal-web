"use client";

import { useEffect, useRef, useState } from "react";

const STAGES = [
  {
    id: "fund",
    label: "Publisher funds",
    actor: "Brand · project · venue",
    body: "A campaign is denominated and funded in $SEEK, with a placement fee weighted by radius, duration and how contested the area is.",
    flow: "$SEEK in",
  },
  {
    id: "place",
    label: "Asset is placed",
    actor: "Protocol",
    body: "The drop is written to its coordinates with a claim radius, a window, and the confidence threshold it demands.",
    flow: "Fee to treasury",
  },
  {
    id: "walk",
    label: "Someone walks there",
    actor: "Seeker",
    body: "The only step that cannot be automated. Travel is the cost that makes farming expensive.",
    flow: "Time and distance",
  },
  {
    id: "verify",
    label: "Presence is verified",
    actor: "Verification layer",
    body: "Four signals are scored off-chain. What reaches the chain is a signed attestation, not your sensor data.",
    flow: "Attestation",
  },
  {
    id: "settle",
    label: "It settles",
    actor: "Solana",
    body: "The transfer confirms in under a second for a fraction of a cent, and the claim record is public.",
    flow: "Reward out",
  },
  {
    id: "split",
    label: "Fees flow back",
    actor: "Protocol",
    body: "The majority of protocol fees route to the people doing the walking; the rest funds the treasury and the ecosystem.",
    flow: "Majority to seekers",
  },
];

/** The economic loop, walked one stage at a time. */
export default function EconomyLoop() {
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

  const current = STAGES[step];
  const angleFor = (i: number) => (360 / STAGES.length) * i - 90;

  return (
    <div className="wp-figure economy" ref={ref}>
      <div className="economy-ring" role="tablist" aria-label="Economic loop">
        <span className="economy-orbit" aria-hidden="true" />
        <span
          className="economy-marker"
          style={{ ["--angle" as string]: `${angleFor(step)}deg` }}
          aria-hidden="true"
        />

        {STAGES.map((stage, i) => (
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
          <span className="t-mono-sm">Stage {step + 1} of {STAGES.length}</span>
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
