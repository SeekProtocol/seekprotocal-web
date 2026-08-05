"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

// WebGL is heavy and never needed for first paint — load it after hydration.
const SeekCoin = dynamic(() => import("@/components/three/SeekCoin"), {
  ssr: false,
});

/** Formats a signed decimal degree the way a handheld GPS would. */
function formatCoord(value: number, positive: string, negative: string) {
  const hemisphere = value >= 0 ? positive : negative;
  const abs = Math.abs(value);
  const degrees = Math.floor(abs);
  const minutes = (abs - degrees) * 60;
  return `${String(degrees).padStart(2, "0")}°${minutes.toFixed(3).padStart(6, "0")}′${hemisphere}`;
}

/**
 * The coin sitting inside a proximity field. The rings are the page's
 * signature: they say "there is something findable within this radius",
 * which is the whole product in one image.
 */
export default function CoinStage({ className = "" }: { className?: string }) {
  const t = useTranslations("home");
  const [reading, setReading] = useState({ lat: 25.2048, lon: 55.2708, acc: 12.4 });

  // Drift the readout so it feels like a live lock rather than a label.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      setReading((prev) => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.0016,
        lon: prev.lon + (Math.random() - 0.5) * 0.0016,
        acc: Math.min(29.8, Math.max(4.2, prev.acc + (Math.random() - 0.5) * 2.4)),
      }));
    }, 1400);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className={`coin-stage ${className}`}>
      <div className="radar" aria-hidden="true">
        <span className="radar-static" style={{ width: "38%", aspectRatio: "1" }} />
        <span className="radar-static" style={{ width: "62%", aspectRatio: "1" }} />
        <span className="radar-static" style={{ width: "88%", aspectRatio: "1" }} />
        <span className="radar-ring" />
        <span className="radar-ring" style={{ animationDelay: "2s" }} />
        <span className="radar-ring" style={{ animationDelay: "4s" }} />
      </div>

      <div className="coin-stage-crosshair" aria-hidden="true">
        <span />
        <span />
      </div>

      <SeekCoin className="coin-stage-canvas" />

      <div className="coin-stage-readout">
        <span className="t-mono-sm coin-stage-readout-label">{t("coinReadoutLabel")}</span>
        <span className="coin-stage-readout-coords">
          {formatCoord(reading.lat, "N", "S")} {formatCoord(reading.lon, "E", "W")}
        </span>
        <span className="coin-stage-readout-acc">
          <span className="dot-live" />
          {t("coinReadoutAccuracy", { meters: reading.acc.toFixed(1) })}
        </span>
      </div>
    </div>
  );
}
