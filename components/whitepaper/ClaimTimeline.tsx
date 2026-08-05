"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { withCopy } from "@/lib/content-i18n";

/**
 * One claim, end to end.
 *
 * The chapter around this figure describes seven stages in prose. Prose is bad
 * at two things the reader needs here: how long each stage takes relative to
 * the others, and where each one runs. So the track is drawn to the latency
 * budget, each segment is coloured by the machine it executes on, and pressing
 * play walks it at real speed.
 *
 * Timings are the budget the protocol is built to, not a measurement of any
 * particular claim. Network conditions move the sensor window and the
 * settlement far more than anything else on the list.
 */

type Where = "device" | "verifier" | "chain";

const STAGES: { id: string; where: Where; ms: number }[] = [
  { id: "open", where: "device", ms: 40 },
  { id: "window", where: "device", ms: 1200 },
  { id: "attest", where: "device", ms: 60 },
  { id: "score", where: "verifier", ms: 180 },
  { id: "threshold", where: "verifier", ms: 10 },
  { id: "settle", where: "chain", ms: 420 },
  { id: "confirm", where: "device", ms: 50 },
];

const TOTAL = STAGES.reduce((sum, stage) => sum + stage.ms, 0);

export default function ClaimTimeline() {
  const t = useTranslations("whitepaperFigures");
  const stages = withCopy(useTranslations("timelineStages"), STAGES, [
    "label",
    "detail",
    "payload",
  ]);
  const whereLabel = (where: Where) => t(`timelineWhere.${where}`);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timers = useRef<number[]>([]);

  const stop = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setPlaying(false);
  }, []);

  useEffect(() => stop, [stop]);

  const play = useCallback(() => {
    stop();
    setPlaying(true);
    setActive(0);
    let elapsed = 0;
    STAGES.forEach((stage, i) => {
      elapsed += stage.ms;
      timers.current.push(
        window.setTimeout(() => {
          if (i + 1 < STAGES.length) setActive(i + 1);
          else setPlaying(false);
        }, elapsed) as unknown as number
      );
    });
  }, [stop]);

  const stage = stages[active];
  const cumulative = stages.slice(0, active + 1).reduce((sum, s) => sum + s.ms, 0);

  return (
    <div className="wp-figure timeline">
      <div className="timeline-head">
        <div>
          <p className="t-mono">{t("interactive")}</p>
          <h3 className="t-h4" style={{ marginTop: "0.4rem" }}>
            {t("timelineTitle")}
          </h3>
        </div>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={playing ? stop : play}
        >
          {playing ? t("stop") : t("runReal")}
        </button>
      </div>

      {/* The track is drawn to the latency budget, so the sensor window looks
          as dominant as it actually is. */}
      <div className="timeline-track" role="group" aria-label={t("claimStages")}>
        {stages.map((s, i) => (
          <button
            key={s.id}
            type="button"
            className="timeline-seg"
            data-where={s.where}
            data-active={i === active || undefined}
            data-done={i < active || undefined}
            style={{ flexGrow: s.ms }}
            onClick={() => {
              stop();
              setActive(i);
            }}
            aria-label={t("segAria", { label: s.label, ms: s.ms, where: whereLabel(s.where) })}
          >
            <span className="timeline-seg-fill" />
          </button>
        ))}
      </div>

      <div className="timeline-legend">
        {(["device", "verifier", "chain"] as Where[]).map((where) => (
          <span key={where} className="timeline-key" data-where={where}>
            <i />
            {whereLabel(where)}
          </span>
        ))}
        <span className="timeline-total t-mono-sm">
          {t("endToEnd", { seconds: (TOTAL / 1000).toFixed(2) })}
        </span>
      </div>

      <div className="timeline-detail" key={stage.id}>
        <div className="timeline-detail-head">
          <span className="t-mono-sm timeline-detail-where" data-where={stage.where}>
            {whereLabel(stage.where)}
          </span>
          <h4 className="t-h4">{stage.label}</h4>
        </div>
        <p className="t-body">{stage.detail}</p>
        <dl className="timeline-facts">
          <div>
            <dt className="t-mono-sm">{t("takes")}</dt>
            <dd>{stage.ms} ms</dd>
          </div>
          <div>
            <dt className="t-mono-sm">{t("elapsed")}</dt>
            <dd>{(cumulative / 1000).toFixed(2)} s</dd>
          </div>
          <div>
            <dt className="t-mono-sm">{t("whatMoves")}</dt>
            <dd>{stage.payload}</dd>
          </div>
        </dl>
      </div>

      <p className="t-mono-sm wp-figure-caption">{t("timelineCaption")}</p>
    </div>
  );
}
