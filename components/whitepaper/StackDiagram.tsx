"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { withCopy } from "@/lib/content-i18n";

const LAYERS = [
  { id: "app", color: "#e341f9" },
  { id: "intelligence", color: "#8f5cf7" },
  { id: "location", color: "#5d74f9" },
  { id: "settlement", color: "#4fd1e0" },
];

/** Interactive stack. Expanding one layer collapses the others. */
export default function StackDiagram() {
  const t = useTranslations("whitepaperFigures");
  const layers = withCopy(useTranslations("stackLayers"), LAYERS, ["label", "sub", "detail"]);
  const [open, setOpen] = useState("location");

  return (
    <div className="wp-figure">
      <div className="stack-diagram">
        {layers.map((layer, i) => {
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
                    L{layers.length - i}
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
      <p className="t-mono-sm wp-figure-caption">{t("stackCaption")}</p>
    </div>
  );
}
