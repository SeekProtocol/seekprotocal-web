"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { withCopy } from "@/lib/content-i18n";
import { DRAFT_FIGURES, TOKENOMICS, TOKEN_FACTS } from "@/content/whitepaper";

const SIZE = 200;
const RADIUS = 78;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Allocation ring. Hovering or focusing a row isolates that slice, so the
 * legend and the chart are one control rather than two things to compare.
 */
export default function TokenomicsDonut() {
  const t = useTranslations("whitepaperFigures");
  const allocations = withCopy(useTranslations("allocations"), TOKENOMICS, ["label", "note"]);
  const facts = withCopy(useTranslations("tokenFacts"), TOKEN_FACTS, ["label", "value"]);
  const [active, setActive] = useState<number | null>(null);
  const [drawn, setDrawn] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Draw the ring on first view.
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDrawn(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setDrawn(true);
        observer.disconnect();
      },
      { threshold: 0.3 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const total = allocations.reduce((sum, slice) => sum + slice.value, 0);
  const shown = active !== null ? allocations[active] : null;

  let offset = 0;
  const slices = allocations.map((slice, i) => {
    const fraction = slice.value / total;
    const length = fraction * CIRCUMFERENCE;
    const node = { ...slice, i, length, offset };
    offset += length;
    return node;
  });

  return (
    <div className="wp-figure" ref={ref}>
      {DRAFT_FIGURES && (
        <p className="chip wp-draft-chip">{t("draft")}</p>
      )}

      <div className="tokenomics-layout">
        <div className="donut-wrap">
          <svg
            className="donut"
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            role="img"
            aria-label={t("donutAria")}
          >
            {slices.map((slice) => (
              <circle
                key={slice.id}
                className="donut-slice"
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                stroke={slice.color}
                strokeDasharray={`${drawn ? slice.length - 2 : 0} ${CIRCUMFERENCE}`}
                strokeDashoffset={-slice.offset}
                data-active={active === slice.i || undefined}
                data-dim={active !== null && active !== slice.i ? "" : undefined}
                style={{ transition: `stroke-dasharray 0.9s cubic-bezier(0.22,1,0.36,1) ${slice.i * 90}ms, stroke-width 0.3s, opacity 0.3s` }}
                onMouseEnter={() => setActive(slice.i)}
                onMouseLeave={() => setActive(null)}
              />
            ))}
          </svg>

          <div className="donut-center">
            {shown ? (
              <>
                <span className="t-num donut-center-value">{shown.value}%</span>
                <span className="t-mono-sm">{shown.label}</span>
              </>
            ) : (
              <>
                <span className="t-num donut-center-value">100%</span>
                <span className="t-mono-sm">{t("totalSupply")}</span>
              </>
            )}
          </div>
        </div>

        <div>
          <div className="legend">
            {allocations.map((slice, i) => (
              <button
                key={slice.id}
                type="button"
                className="legend-row"
                data-dim={active !== null && active !== i ? "" : undefined}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
              >
                <span className="legend-swatch" style={{ background: slice.color }} />
                <span>
                  <span className="legend-label">{slice.label}</span>
                  <br />
                  <span className="legend-sub">{slice.note}</span>
                </span>
                <span className="legend-value">{slice.value}%</span>
              </button>
            ))}
          </div>

          <dl className="token-facts">
            {facts.map((fact) => (
              <div key={fact.id} className="token-fact">
                <dt className="t-mono-sm">{fact.label}</dt>
                <dd className="token-fact-value">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
