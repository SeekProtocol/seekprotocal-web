"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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

const STAGES: {
  id: string;
  label: string;
  where: Where;
  ms: number;
  detail: string;
  payload: string;
}[] = [
  {
    id: "open",
    label: "Drop opened",
    where: "device",
    ms: 40,
    detail:
      "You tap an asset on the map or reach for it through the camera. The app takes the position it already holds and starts a fresh sensor window.",
    payload: "Asset id, last known fix",
  },
  {
    id: "window",
    label: "Sensor window",
    where: "device",
    ms: 1200,
    detail:
      "The longest stage by far, and the one that decides everything after it: a new GNSS fix with its accuracy, a scan of the radio environment, and the motion trace since the last confirmed position.",
    payload: "GNSS fix, satellite count, Wi-Fi and cell set, accelerometer trace",
  },
  {
    id: "attest",
    label: "Attestation and signature",
    where: "device",
    ms: 60,
    detail:
      "Play Integrity or App Attest confirms the app is genuine and the OS is untampered. The claim is signed by the key bound to that app instance, which is what makes a relayed claim expensive.",
    payload: "Attestation token, signed claim",
  },
  {
    id: "score",
    label: "Scoring",
    where: "verifier",
    ms: 180,
    detail:
      "Off-chain, because it depends on sensor data that has no business being public. Each signal is scored against what the coordinate should look like and the results are combined into one confidence number.",
    payload: "Confidence score, per-signal breakdown",
  },
  {
    id: "threshold",
    label: "Threshold check",
    where: "verifier",
    ms: 10,
    detail:
      "The score meets the asset's threshold or it does not. A refusal is recorded against the device, and repeated refusals raise the bar for that device rather than only failing again.",
    payload: "Accept or refuse, signed attestation",
  },
  {
    id: "settle",
    label: "Settlement",
    where: "chain",
    ms: 420,
    detail:
      "The claim record and the transfer land on Solana in one transaction. This is the only stage anyone else can see, and all it says is that a claim at a public coordinate succeeded.",
    payload: "Claim record, token transfer",
  },
  {
    id: "confirm",
    label: "In your wallet",
    where: "device",
    ms: 50,
    detail:
      "The wallet updates and the asset is gone from the map for you. From tapping to holding, under two seconds on a good connection.",
    payload: "Balance update, map state",
  },
];

const WHERE_LABEL: Record<Where, string> = {
  device: "On your phone",
  verifier: "Verifier",
  chain: "Solana",
};

const TOTAL = STAGES.reduce((sum, stage) => sum + stage.ms, 0);

export default function ClaimTimeline() {
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

  const stage = STAGES[active];
  const cumulative = STAGES.slice(0, active + 1).reduce((sum, s) => sum + s.ms, 0);

  return (
    <div className="wp-figure timeline">
      <div className="timeline-head">
        <div>
          <p className="t-mono">Interactive</p>
          <h3 className="t-h4" style={{ marginTop: "0.4rem" }}>
            One claim, stage by stage
          </h3>
        </div>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={playing ? stop : play}
        >
          {playing ? "Stop" : "Run it at real speed"}
        </button>
      </div>

      {/* The track is drawn to the latency budget, so the sensor window looks
          as dominant as it actually is. */}
      <div className="timeline-track" role="group" aria-label="Claim stages">
        {STAGES.map((s, i) => (
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
            aria-label={`${s.label}, ${s.ms} milliseconds, ${WHERE_LABEL[s.where]}`}
          >
            <span className="timeline-seg-fill" />
          </button>
        ))}
      </div>

      <div className="timeline-legend">
        {(["device", "verifier", "chain"] as Where[]).map((where) => (
          <span key={where} className="timeline-key" data-where={where}>
            <i />
            {WHERE_LABEL[where]}
          </span>
        ))}
        <span className="timeline-total t-mono-sm">
          {(TOTAL / 1000).toFixed(2)} s end to end
        </span>
      </div>

      <div className="timeline-detail" key={stage.id}>
        <div className="timeline-detail-head">
          <span className="t-mono-sm timeline-detail-where" data-where={stage.where}>
            {WHERE_LABEL[stage.where]}
          </span>
          <h4 className="t-h4">{stage.label}</h4>
        </div>
        <p className="t-body">{stage.detail}</p>
        <dl className="timeline-facts">
          <div>
            <dt className="t-mono-sm">Takes</dt>
            <dd>{stage.ms} ms</dd>
          </div>
          <div>
            <dt className="t-mono-sm">Elapsed</dt>
            <dd>{(cumulative / 1000).toFixed(2)} s</dd>
          </div>
          <div>
            <dt className="t-mono-sm">What moves</dt>
            <dd>{stage.payload}</dd>
          </div>
        </dl>
      </div>

      <p className="t-mono-sm wp-figure-caption">
        These are budgets, not measurements. The sensor window and the
        settlement both move with conditions, and everything between them is
        arithmetic that does not. Note where the boundary sits: raw sensor data
        never leaves the first three stages.
      </p>
    </div>
  );
}
