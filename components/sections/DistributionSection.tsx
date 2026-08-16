"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CALL_TO_ACTIONS, REACH_FAILURES } from "@/content/distribution";
import ChainRoster from "@/components/brand/ChainRoster";
import LiveMark from "@/components/brand/LiveMark";

/**
 * The distribution argument.
 *
 * Web3 has a distribution problem that nobody solved by buying more reach: a
 * wallet is free, a click is cheap, and the cheapest way to produce either at
 * scale is to produce them without a person. Every countermeasure is another
 * filter on a signal that was never evidence in the first place.
 *
 * Presence is different in kind rather than in degree. It is not a better
 * signal of a human, it is a cost a bot cannot pay, and it is the only one on
 * the list that does not get cheaper as the attacker gets more sophisticated.
 *
 * The interactive makes the second half of the argument, which is the one that
 * usually gets missed: the protocol verifies *that someone was there*, and
 * leaves *what they have to do* entirely to the publisher. Picking a different
 * ask rewrites the button a seeker sees and the line the publisher gets back,
 * and the verification underneath does not move. That is the whole point, and
 * it says it better than a sentence claiming the CTA is configurable.
 */
export default function DistributionSection() {
  const t = useTranslations("distribution");
  const [action, setAction] = useState(CALL_TO_ACTIONS[0].id);
  const current = CALL_TO_ACTIONS.find((cta) => cta.id === action) ?? CALL_TO_ACTIONS[0];

  return (
    <div className="dist">
      <div className="sec-head reveal">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h2 className="t-h2">{t("title")}</h2>
        <p className="t-lead" style={{ marginTop: "1.25rem" }}>
          {t("lead")}
        </p>
      </div>

      {/* ── What reach buys, and what it does not ─────────────────────────
          Three rows rather than a paragraph, because the argument is a
          correspondence: each failure has one answer and they read as pairs. */}
      <ul className="dist-pairs reveal">
        {REACH_FAILURES.map((failure) => (
          <li key={failure.id} className="dist-pair">
            <div className="dist-pair-side dist-pair-fail">
              <span className="t-mono-sm dist-pair-tag">{t("failureTag")}</span>
              <p className="t-body">{t(`failures.${failure.id}`)}</p>
            </div>
            <span className="dist-pair-arrow" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12h15" />
                <path d="m13.5 6.5 6 5.5-6 5.5" />
              </svg>
            </span>
            <div className="dist-pair-side dist-pair-answer">
              <span className="t-mono-sm dist-pair-tag">{t("answerTag")}</span>
              <p className="t-body">{t(`answers.${failure.id}`)}</p>
            </div>
          </li>
        ))}
      </ul>

      {/* ── The ask is yours ──────────────────────────────────────────────── */}
      <div className="dist-brief reveal">
        <div className="dist-brief-choices">
          <p className="t-mono dist-brief-legend">{t("askLegend")}</p>
          <div role="tablist" aria-label={t("askLegend")} className="dist-choice-list">
            {CALL_TO_ACTIONS.map((cta) => (
              <button
                key={cta.id}
                type="button"
                role="tab"
                aria-selected={cta.id === action}
                className="dist-choice"
                data-active={cta.id === action || undefined}
                onClick={() => setAction(cta.id)}
              >
                {t(`actions.${cta.id}.label`)}
              </button>
            ))}
          </div>
          <p className="t-small dist-brief-note">{t("askNote")}</p>
        </div>

        {/* The drop as the seeker meets it, then what the publisher gets
            back. Keyed on the action so the panel replays its entrance:
            without the key the copy swaps in place and the change is easy to
            miss on a wide screen, where the choice list is far from it. */}
        <div key={current.id} className="dist-brief-preview">
          <div className="dist-drop">
            <span className="chip chip-live">
              <LiveMark id="dist-drop-live" />
              {t("dropStatus")}
            </span>
            <p className="t-mono-sm dist-drop-where">{t("dropWhere")}</p>
            <h3 className="t-h4 dist-drop-title">{t(`actions.${current.id}.headline`)}</h3>
            <p className="t-small">{t(`actions.${current.id}.body`)}</p>
            <span className="btn btn-brand dist-drop-cta" aria-hidden="true">
              {t(`actions.${current.id}.button`)}
            </span>
            <p className="t-mono-sm dist-drop-fine">{t("dropFine")}</p>
          </div>

          <div className="dist-receipt">
            <p className="t-mono dist-brief-legend">{t("recordedLegend")}</p>
            <p className="t-body dist-receipt-line">{t(`actions.${current.id}.recorded`)}</p>
            <p className="t-small dist-receipt-never">{t("recordedNever")}</p>
          </div>
        </div>
      </div>

      {/* ── Every chain ──────────────────────────────────────────────────── */}
      <div className="reveal" style={{ marginTop: "3rem" }}>
        <p className="t-mono dist-chains-legend">{t("chainsLegend")}</p>
        {/* No `coinsLabel`, so no 3D coin row. The rewards section above now
            shows the chain coins as artwork, and a second spinning coin two
            sections later was the same picture told twice, for a 340 KB Draco
            decoder. `ChainCoins` and the pipeline behind it are untouched in
            the repo; passing `coinsLabel` again turns the row back on. */}
        <ChainRoster anyLabel={t("chainAny")} note={t("chainsNote")} />
      </div>
    </div>
  );
}
