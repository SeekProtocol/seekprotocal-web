"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  ACTIVE_CATCHES,
  ACTIVE_WINDOW_DAYS,
  BONUS_PER_ACTIVE,
  CODE_LENGTH,
  EXAMPLE_BASE_XP,
  PAYOUT_XP,
  RULES,
  TEAM,
} from "@/content/referrals";
import { withCopy } from "@/lib/content-i18n";
import PixelAvatar from "@/components/ui/PixelAvatar";

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

/**
 * Where each member sits, in per cent of the stage box.
 *
 * Starting at the top and going clockwise, so the order the members arrive in
 * reads as a ring being filled rather than as a list being appended.
 *
 * An ellipse rather than a circle, and taller than it is wide, which is not a
 * stylistic choice. Six seats 60 degrees apart puts four of them at ±30 and
 * ±150, and on a circle those land at 31% and 69% of the height — level with a
 * centre card whose own height is set by the code chips inside it. Measured at
 * 600px, @flinthq's line ran under the card, and the card wins on z-index. A
 * vertical radius of 42 lifts those four clear of it while keeping the top and
 * bottom seats inside the stage.
 */
const SEAT_RX = 38;
const SEAT_RY = 40;

function seatFor(index: number, total: number) {
  const angle = (-90 + (360 / total) * index) * (Math.PI / 180);
  return {
    x: 50 + Math.cos(angle) * SEAT_RX,
    y: 50 + Math.sin(angle) * SEAT_RY,
  };
}

/** How long each member waits before arriving. */
/** How long each member waits before arriving. */
const STEP_MS = 420;
/** How long the finished ring is held before the loop starts over. */
const HOLD_MS = 3200;

export default function ReferralSection() {
  const t = useTranslations("referrals");
  /* The team carries no translated copy at all: a handle is a handle in every
     locale, and the catch counts are numbers. Only the rules need words. */
  const rules = withCopy(useTranslations("referralRules"), RULES, ["title", "body"]);

  const hostRef = useRef<HTMLDivElement>(null);
  /** How many of the team have arrived. Drives everything else. */
  const [arrived, setArrived] = useState(0);
  /**
   * Which active member is paying out right now, as an index into TEAM, or -1
   * for nobody. Only one at a time: six XP pills leaving at once reads as a
   * particle effect, where one at a time reads as a friend having just caught
   * something.
   */
  const [paying, setPaying] = useState(-1);

  const total = TEAM.length;

  /**
   * The figure loops for as long as it is on screen, and stops the moment it is
   * not.
   *
   * It ran once and then sat still, with a button to play it again, which
   * nobody presses: a reader arriving mid-scroll saw a finished diagram and had
   * no way of knowing there had been anything to watch. Looping puts the
   * mechanic in front of whoever happens to be looking.
   *
   * Gated on visibility rather than left running, because a timer that keeps
   * firing behind fifteen thousand pixels of page is exactly the sort of thing
   * this site has spent a week taking off the phone.
   */
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers = new Set<number>();
    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        fn();
      }, ms);
      timers.add(id);
      return id;
    };
    const clearAll = () => {
      for (const id of timers) window.clearTimeout(id);
      timers.clear();
    };

    /* Which of the six are worth animating a payout for. Read once: it is a
       property of the fixture, not of the frame. */
    const actives = TEAM.map((m, i) => (m.caught >= ACTIVE_CATCHES ? i : -1)).filter(
      (i) => i >= 0,
    );

    const cycle = () => {
      setArrived(0);
      setPaying(-1);

      let n = 0;
      const step = () => {
        n += 1;
        setArrived(n);
        /* A member who arrives already playing pays out on arrival, which is
           what ties the pill to the person rather than to the clock. */
        const index = n - 1;
        if (TEAM[index].caught >= ACTIVE_CATCHES) {
          setPaying(index);
          later(() => setPaying((c) => (c === index ? -1 : c)), STEP_MS - 60);
        }
        if (n < total) later(step, STEP_MS);
        else later(hold, HOLD_MS);
      };

      /* Once the ring is full, the actives keep paying out in turn, so the
         section is never a still picture while anyone is looking at it. */
      const hold = () => {
        let k = 0;
        const pulse = () => {
          const index = actives[k % actives.length];
          k += 1;
          setPaying(index);
          later(() => setPaying((c) => (c === index ? -1 : c)), 620);
          if (k <= actives.length * 2) later(pulse, 900);
          else later(cycle, 900);
        };
        pulse();
      };

      later(step, STEP_MS);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (reduced) {
            /* The arrangement is the point; the arriving is decoration. A
               reader who asked for less motion gets the finished ring and no
               loop at all. */
            setArrived(total);
            setPaying(-1);
            return;
          }
          clearAll();
          cycle();
        } else {
          clearAll();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(host);
    return () => {
      observer.disconnect();
      clearAll();
    };
  }, [total]);

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
                  <g key={member.id}>
                    <line
                      x1="50"
                      y1="50"
                      x2={seat.x}
                      y2={seat.y}
                      className="referral-link"
                      data-here={here || undefined}
                      data-active={active || undefined}
                    />
                    {/* The payout travelling in. Drawn seat to centre rather
                        than centre to seat, so the dash runs the way the XP
                        does: off the friend who earned it and toward you. It is
                        a second stroke over the first rather than the first
                        changing, because a dash pattern on the line itself
                        would break it into pieces while it is at rest. */}
                    <line
                      x1={seat.x}
                      y1={seat.y}
                      x2="50"
                      y2="50"
                      className="referral-spark"
                      data-paying={paying === i || undefined}
                    />
                  </g>
                );
              })}
            </svg>

            {/* You, and the code you are handing out. */}
            <div className="referral-you" data-paid={paying >= 0 || undefined}>
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
                  {/* A face rather than a dot. Six identical circles read as a
                      diagram of nodes; six pixel avatars read as six people,
                      which is what a referral team is. PixelAvatar generates
                      them from the handle, so the same seeker is the same face
                      wherever the site draws them — the social band below uses
                      the same component. */}
                  <span className="referral-node-face" aria-hidden="true">
                    <PixelAvatar seed={member.handle} size={38} />
                  </span>

                  {/* The payout. Written the way the app writes it, as a pill
                      reading "+N XP" (see CatchResultSheet), because inventing
                      an icon for XP would be inventing something the app does
                      not have. It rises off the friend and fades, once, when
                      that friend has just caught something. */}
                  <span
                    className="referral-xp"
                    data-paying={paying === i || undefined}
                    aria-hidden="true"
                  >
                    +{PAYOUT_XP} XP
                  </span>

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
              <div className="referral-tally-counts">
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
              {/* The bar under every node says which side of the line a friend
                  is on; this says where the line is. Once, here, rather than
                  spelled out six times in the ring — where it also made the
                  count wider than the node it belonged to, and ran the left
                  seat's line under the centre card. */}
              <p className="t-mono-sm referral-tally-rule">
                {t("activeRule", { needed: ACTIVE_CATCHES, days: ACTIVE_WINDOW_DAYS })}
              </p>
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
