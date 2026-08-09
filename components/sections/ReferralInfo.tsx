"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import {
  ACTIVE_CATCHES,
  ACTIVE_WINDOW_DAYS,
  BONUS_PER_ACTIVE,
  EXAMPLE_BASE_XP,
  LADDER,
  LIFECYCLE,
} from "@/content/referrals";
import { withCopy } from "@/lib/content-i18n";
import XpBolt from "@/components/brand/XpBolt";

/**
 * The long version of the referral mechanic, behind an info button.
 *
 * The section itself has to be readable at a glance and cannot carry the two
 * things people actually get wrong: that the bonus has no ceiling, and that a
 * friend does not start counting when they install. Both need room and both are
 * better shown than stated, so they live here.
 *
 * Built on the same shape as the whitepaper's chapter sheet — a scrim button
 * over a `role="dialog"` panel, Escape to close, the page underneath locked —
 * rather than a second dialog idiom invented for one section.
 */

/** How long the ladder rests on each rung before climbing to the next. */
const RUNG_MS = 900;
/** And how long each lifecycle step holds before the marker moves on. */
const STEP_MS = 1400;

export default function ReferralInfo() {
  const t = useTranslations("referralInfo");
  const steps = withCopy(useTranslations("referralLifecycle"), LIFECYCLE, [
    "title",
    "body",
  ]);

  const [open, setOpen] = useState(false);
  /* The panel is rendered into document.body rather than where the button sits.
     The button is inside the hub card, which centres its text and paints a
     gradient into its border box, and a fixed-position child still inherits
     both — the first version came out centred with a coloured rim around it.
     A portal also puts the dialog outside every transform and overflow on the
     way down, which is what stops a scrim being clipped by an ancestor.

     Only mounted while open, which is what makes the portal safe without a
     `mounted` flag: `document.body` does not exist during the server render,
     and this cannot run there because it takes a click to reach. */
  /** Index into LADDER. The ladder climbs on its own while the panel is up. */
  const [rung, setRung] = useState(0);
  /** Index into LIFECYCLE. */
  const [step, setStep] = useState(0);

  /* A plain function, not useCallback. The compiler memoises this file, and a
     hand-written useCallback here is something it cannot preserve — it says so.
     Nothing downstream depends on the identity being stable. */
  const close = () => setOpen(false);
  const panelRef = useRef<HTMLDivElement>(null);
  /** Where focus was before the panel took it, so it can be given back. */
  const openerRef = useRef<HTMLButtonElement>(null);

  /* Escape closes it, the page underneath does not scroll while it is up, and
     focus moves into the panel and comes back out to the button that opened
     it. Same contract as the whitepaper sheet. */
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      /* setOpen rather than close(), so this effect does not depend on a
         function identity that changes every render. It did, briefly, and the
         effect then re-ran on each one: adding and removing the listener and
         writing document.body.style.overflow every time. A state setter is
         stable by contract, so there is nothing left to depend on but `open`. */
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    /* Read now rather than in the cleanup. A ref read on the way out is the ref
       as it stands then, which for a node React owns is not necessarily the one
       that was there on the way in. */
    const opener = openerRef.current;
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
      opener?.focus();
    };
  }, [open]);

  /* The two figures run only while the panel is up. A timer left going behind a
     closed dialog is the sort of thing this site has spent a week removing. */
  useEffect(() => {
    if (!open) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      /* The finished state, not the climb: a reader who asked for less motion
         still needs to see that the top of the ladder is 20 friends and 2.00x,
         which is the whole claim.

         Written from a frame callback rather than from the effect body. Both
         land in the same paint, and a synchronous write here cascades a second
         render before the first has committed. */
      const frame = requestAnimationFrame(() => {
        setRung(LADDER.length - 1);
        setStep(LIFECYCLE.length - 1);
      });
      return () => cancelAnimationFrame(frame);
    }

    const reset = requestAnimationFrame(() => {
      setRung(0);
      setStep(0);
    });
    const climb = window.setInterval(
      () => setRung((r) => (r + 1) % LADDER.length),
      RUNG_MS,
    );
    const walk = window.setInterval(
      () => setStep((s) => (s + 1) % LIFECYCLE.length),
      STEP_MS,
    );
    return () => {
      cancelAnimationFrame(reset);
      window.clearInterval(climb);
      window.clearInterval(walk);
    };
  }, [open]);

  const friends = LADDER[rung];
  const multiplier = 1 + BONUS_PER_ACTIVE * friends;

  const panel = (
    <div className="referral-info">
      <button
        type="button"
        className="referral-info-scrim"
        onClick={close}
        aria-label={t("close")}
      />

      <div
        ref={panelRef}
        className="referral-info-panel"
        role="dialog"
        aria-modal="true"
        aria-label={t("title")}
        tabIndex={-1}
      >
        <div className="referral-info-head">
          <div>
            <p className="eyebrow">{t("eyebrow")}</p>
            <h2 className="t-h3 referral-info-title">{t("title")}</h2>
          </div>
          <button
            type="button"
            className="referral-info-close"
            onClick={close}
            aria-label={t("close")}
          >
            ✕
          </button>
        </div>

        <div className="referral-info-body">
          <p className="t-body">{t("lead")}</p>

          {/* ── The ladder ─────────────────────────────────────────────
              The claim is that nothing caps this, so the figure has to go
              somewhere a cap would have shown up. Twenty active friends is a
              straight doubling, and the bars keep their proportions all the
              way there because the arithmetic is linear. */}
          <section className="referral-ladder">
            <p className="t-mono-sm referral-ladder-label">{t("ladderLabel")}</p>

            <div className="referral-ladder-rows">
              {LADDER.map((n, i) => (
                <div
                  key={n}
                  className="referral-ladder-row"
                  data-on={i <= rung || undefined}
                  data-now={i === rung || undefined}
                >
                  <span className="t-mono-sm referral-ladder-n">{n}</span>
                  <span className="referral-ladder-track">
                    <span
                      className="referral-ladder-bar"
                      style={{
                        /* Against the top rung, so the last bar is full and
                           every other one is honestly proportional to it. */
                        width: `${((1 + BONUS_PER_ACTIVE * n) / (1 + BONUS_PER_ACTIVE * LADDER[LADDER.length - 1])) * 100}%`,
                      }}
                    />
                  </span>
                  <span className="referral-ladder-mult">
                    {(1 + BONUS_PER_ACTIVE * n).toFixed(2)}×
                  </span>
                </div>
              ))}
            </div>

            <p className="referral-ladder-sum" aria-live="polite">
              <span className="t-mono-sm">{t("ladderFriends", { count: friends })}</span>
              <span className="referral-ladder-xp">
                <XpBolt size={14} id="xp-ladder" />
                {Math.round(EXAMPLE_BASE_XP * multiplier)} XP
              </span>
            </p>
            <p className="t-mono-sm referral-ladder-note">{t("noCap")}</p>
          </section>

          {/* ── The lifecycle ──────────────────────────────────────────
              Four stages the database can actually be in. The fourth is the
              one worth drawing, because it is the one people assume happens
              at the second. */}
          <section className="referral-life">
            <p className="t-mono-sm referral-life-label">{t("lifecycleLabel")}</p>
            <ol className="referral-life-steps">
              {steps.map((entry, i) => (
                <li
                  key={entry.id}
                  className="referral-life-step"
                  data-on={i <= step || undefined}
                  data-now={i === step || undefined}
                >
                  <span className="referral-life-mark" aria-hidden="true">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="referral-life-title">{entry.title}</h3>
                    <p className="t-body">{entry.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <p className="t-mono-sm referral-info-foot">
            {t("foot", { needed: ACTIVE_CATCHES, days: ACTIVE_WINDOW_DAYS })}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        ref={openerRef}
        type="button"
        className="referral-info-open"
        onClick={() => setOpen(true)}
        aria-label={t("openLabel")}
      >
        <InfoIcon />
      </button>
      {open && createPortal(panel, document.body)}
    </>
  );
}

function InfoIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="7.6" r="1.15" fill="currentColor" />
      <path
        d="M12 10.9v6.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
