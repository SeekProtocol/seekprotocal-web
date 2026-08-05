"use client";

import { useState } from "react";

const LAYERS = [
  {
    id: "app",
    label: "Application",
    sub: "SeekAR · business portal · campaign builder",
    detail:
      "What people touch. The mobile app renders assets in AR and handles collection; the portal is where publishers place them. Both are ordinary clients of the layers below and hold no privileged access.",
    color: "#e341f9",
  },
  {
    id: "intelligence",
    label: "Intelligence",
    sub: "AI companion · quest generation · routing",
    detail:
      "Reads the camera feed and your play history to suggest where to go next and what you are looking at. Runs on-device where it can, and never sees raw position history it does not need.",
    color: "#8f5cf7",
  },
  {
    id: "location",
    label: "Location verification",
    sub: "GNSS · radio fingerprint · attestation · motion",
    detail:
      "Scores a claim across independent signals and emits a signed attestation when the score clears the asset's threshold. Off-chain by design: the sensor data that makes verification work is exactly the data that should not be public.",
    color: "#5d74f9",
  },
  {
    id: "settlement",
    label: "Settlement",
    sub: "Solana · SPL assets · claim records",
    detail:
      "Holds asset definitions, coordinates and claim records, and moves value when a claim is accepted. Chosen for fees low enough that collecting a small reward is not dominated by the cost of collecting it.",
    color: "#4fd1e0",
  },
];

/** Interactive stack. Expanding one layer collapses the others. */
export default function StackDiagram() {
  const [open, setOpen] = useState("location");

  return (
    <div className="wp-figure">
      <div className="stack-diagram">
        {LAYERS.map((layer, i) => {
          const expanded = open === layer.id;
          return (
            <button
              key={layer.id}
              type="button"
              className="stack-layer"
              data-open={expanded || undefined}
              style={{ ["--layer-color" as string]: layer.color }}
              onClick={() => setOpen(expanded ? "" : layer.id)}
              aria-expanded={expanded}
            >
              <span className="stack-layer-bar" aria-hidden="true" />
              <span className="stack-layer-main">
                <span className="stack-layer-head">
                  <span className="t-mono-sm stack-layer-index">
                    L{LAYERS.length - i}
                  </span>
                  <span className="stack-layer-label">{layer.label}</span>
                </span>
                <span className="stack-layer-sub t-mono-sm">{layer.sub}</span>
                {expanded && <span className="stack-layer-detail">{layer.detail}</span>}
              </span>
            </button>
          );
        })}
      </div>
      <p className="t-mono-sm wp-figure-caption">
        Claims travel down the stack; value travels back up. Select a layer for detail.
      </p>
    </div>
  );
}
