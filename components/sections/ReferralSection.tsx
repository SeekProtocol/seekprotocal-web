"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  ACTIVE_CATCHES,
  BONUS_PER_ACTIVE,
  CODE_LENGTH,
  EXAMPLE_BASE_XP,
  RULES,
  TEAM,
} from "@/content/referrals";
import { withCopy } from "@/lib/content-i18n";

/**
 * The referral mechanic, drawn as the thing it is.
 *
 * A team assembles around you and the multiplier climbs with it. That is the
 * whole mechanic, and it is worth drawing rather than listing, because the part
 * people get wrong is the part a bullet cannot carry: a friend who installed
 * the app and stopped is worth nothing. Two of the six arrive short of the bar
 * and stay dim, with their real catch count visible, so the rule reads off the
 * figure instead of being asserted underneath it.
 *
 * **No WebGL, and no blur.** This section could have been a scene and should
 * not be. It is six nodes, some lines and a counter, which SVG and transforms
 * do for nothing; a sixth WebGL slot would cost the phone real memory for a
 * diagram. `filter: blur()` is avoided for the same reason — each one is a
 * compositing surface on iOS, and the thirteen already on the homepage are the
 * largest unexplained cost left on it.
 *
 * Everything animates on `transform` and `opacity` only, which the compositor
 * can carry on its own. The site learned that once already: `rise` and
 * `.reveal` used to animate `filter: blur()` and Chrome refused to composite
 * them, dropping both onto the main thread.
 */

/** Where each member sits on the ellipse, in per cent of the stage box. */
function seatFor(index: number, total: number) {
  /* Starting at the top and going clockwise, so the order the members arrive in
     reads as a ring being filled rather than as a list being appended. */
  const angle = (-90 + (360 / total) * index) * (Math.PI / 180);
  return {
    x: 50 + Math.cos(angle) * 38,
    y: 50 + Math.sin(angle) * 38,
  };
}

/** How long each member waits before arriving. */
const STEP_MS = 420;

export default function ReferralSection() {
  const t = useTranslations("referrals");
  /* The team carries no translated copy at all: a handle is a handle in every
     locale, and the catch counts are numbers. Only the rules need words. */
  const rules = withCopy(useTranslations("referralRules"), RULES, ["title", "body"]);

  const hostRef = useRef<HTMLDivElement>(null);
  /** How many of the team have arrived. Drives everything else. */
  const [arrived, setArrived] = useState(0);
  const [replay, setReplay] = useState(0);

  const total = TEAM.length;

  /* Runs once the figure is on screen, and again on a replay. A reader who
     asked for less motion gets the finished state rather than the sequence:
     the point of the figure is the arrangement, not the arriving. */
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let timer = 0;
    let started = false;
    /* Reduced motion lands on the finished arrangement in one step rather than
       skipping the figure: the arrangement is the point, the arriving is
       decoration. Handled here rather than by an early return in the effect
       body, so the state is only ever written from a callback — writing it
       synchronously from the effect cascades a second render, and the initial
       value cannot be lazily computed instead because `arrived` is rendered
       into the markup and the server has no media query to read. */
    const run = () => {
      if (reduced) {
        setArrived(total);
        return;
      }
      setArrived(0);
      let n = 0;
      const step = () => {
        n += 1;
        setArrived(n);
        if (n < total) timer = window.setTimeout(step, STEP_MS);
      };
      timer = window.setTimeout(step, STEP_MS);
    };

    if (replay > 0) {
      run();
      return () => window.clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started) return;
        started = true;
        run();
      },
      { threshold: 0.35 },
    );
    observer.observe(host);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [total, replay]);

  const onReplay = useCallback(() => setReplay((n) => n + 1), []);

  const shown = TEAM.slice(0, arrived);
  const activeCount = shown.filter((m) => m.caught >= ACTIVE_CATCHES).length;
  const bonus = BONUS_PER_ACTIVE * activeCount;
  const multiplier = 1 + bonus;
  const exampleXp = Math.round(EXAMPLE_BASE_XP * multiplier);

  return (
    <section className="section referral-band">
      <div className="shell">
        <div className="sec-head reveal">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h2 className="t-h2">{t("title")}</h2>
          <p className="t-lead" style={{ marginTop: "1.25rem" }}>
            {t("lead")}
          </p>
        </div>

        <div className="referral-layout" ref={hostRef}>
          {/* ── The figure ───────────────────────────────────────────────── */}
          <div className="referral-stage" data-running={arrived < total || undefined}>
            {/* The lines are drawn under the nodes, in their own layer, so a
                node never has a seam across it. viewBox units are per cent,
                which lets the seats below share one coordinate system with the
                CSS that positions the nodes. */}
            <svg
              className="referral-web"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {TEAM.map((member, i) => {
                const seat = seatFor(i, total);
                const here = i < arrived;
                const active = member.caught >= ACTIVE_CATCHES;
                return (
                  <line
                    key={member.id}
                    x1="50"
                    y1="50"
                    x2={seat.x}
                    y2={seat.y}
                    className="referral-link"
                    data-here={here || undefined}
                    data-active={active || undefined}
                  />
                );
              })}
            </svg>

            {/* You, and the code you are handing out. */}
            <div className="referral-you">
              <span className="referral-you-label t-mono-sm">{t("youLabel")}</span>
              <span className="referral-code" aria-label={t("codeLabel")}>
                {/* Drawn as characters rather than a string so the code reads as
                    something to be copied off a screen, which is how it is
                    actually used. Eight, from generate_share_code(). */}
                {"7KQ4MZ9P".slice(0, CODE_LENGTH).split("").map((c, i) => (
                  <span key={i} className="referral-code-char">
                    {c}
                  </span>
                ))}
              </span>
              <span className="referral-mult" aria-live="polite">
                <span className="referral-mult-value">{multiplier.toFixed(2)}</span>
                <span className="referral-mult-x">×</span>
              </span>
              <span className="t-mono-sm referral-mult-label">{t("multiplierLabel")}</span>
            </div>

            {/* The team. */}
            {TEAM.map((member, i) => {
              const seat = seatFor(i, total);
              const here = i < arrived;
              const active = member.caught >= ACTIVE_CATCHES;
              const pct = Math.min(1, member.caught / ACTIVE_CATCHES);
              return (
                <div
                  key={member.id}
                  className="referral-node"
                  data-here={here || undefined}
                  data-active={active || undefined}
                  style={{
                    left: `${seat.x}%`,
                    top: `${seat.y}%`,
                    ["--delay" as string]: `${i * 60}ms`,
                  }}
                >
                  <span className="referral-node-dot" aria-hidden="true" />
                  <span className="referral-node-handle">@{member.handle}</span>
                  {/* The bar is the rule. A friend is active because of what is
                      on it, not because a label says so. */}
                  <span className="referral-node-bar" aria-hidden="true">
                    <span style={{ width: `${pct * 100}%` }} />
                  </span>
                  {/* Two forms, because one does not fit both. A friend past
                      the bar is at "14 catches this week"; writing that as
                      "14 of 5" reads as a broken counter. Only someone short of
                      it needs the target spelled out, and for them it is the
                      whole point. */}
                  <span className="t-mono-sm referral-node-count">
                    {active
                      ? t("catchCountActive", { caught: member.caught })
                      : t("catchCount", { caught: member.caught, needed: ACTIVE_CATCHES })}
                  </span>
                </div>
              );
            })}
          </div>

          {/* ── What the figure is saying ────────────────────────────────── */}
          <div className="referral-side">
            <div className="referral-tally">
              <div className="referral-tally-row">
                <span className="referral-tally-value">{activeCount}</span>
                <span className="t-mono-sm">{t("activeLabel")}</span>
              </div>
              <div className="referral-tally-row">
                <span className="referral-tally-value referral-tally-dim">
                  {arrived - activeCount}
                </span>
                <span className="t-mono-sm">{t("dormantLabel")}</span>
              </div>
            </div>

            {/* One catch, before and after. The whole bonus in one line. */}
            <div className="referral-example">
              <p className="t-mono-sm referral-example-label">{t("exampleLabel")}</p>
              <p className="referral-example-sum">
                <span className="referral-example-base">{EXAMPLE_BASE_XP} XP</span>
                <ArrowRight />
                <span className="referral-example-out">{exampleXp} XP</span>
              </p>
              <p className="t-body">{t("exampleBody")}</p>
            </div>

            <ul className="referral-rules">
              {rules.map((rule) => (
                <li key={rule.id} className="referral-rule">
                  <span className="referral-rule-mark" aria-hidden="true" />
                  <div>
                    <h3 className="referral-rule-title">{rule.title}</h3>
                    <p className="t-body">{rule.body}</p>
                  </div>
                </li>
              ))}
            </ul>

            <button type="button" className="referral-replay t-mono-sm" onClick={onReplay}>
              {t("replay")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ArrowRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M3 8h10m0 0l-4-4m4 4l-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
