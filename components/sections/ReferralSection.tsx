"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  ACTIVE_CATCHES,
  ACTIVE_WINDOW_DAYS,
  BONUS_PER_ACTIVE,
  CODE_LENGTH,
  EXAMPLE_BASE_XP,
  CATCH_CYCLE,
  RULES,
  TEAM,
} from "@/content/referrals";
import { withCopy } from "@/lib/content-i18n";
import PixelAvatar from "@/components/ui/PixelAvatar";
import XpBolt from "@/components/brand/XpBolt";
import ReferralInfo from "@/components/sections/ReferralInfo";
import Image from "next/image";
import { RARITY_COLOUR } from "@/lib/globe-drops";

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

/**
 * The connector from the centre to a seat, as a curve rather than a spoke.
 *
 * Six straight radial lines is what a diagram of a hub looks like, and it read
 * as one: flat, even, and cheap. A quadratic bowed off the chord gives the same
 * connection a hand, and six of them bowing the same way around the ring turn a
 * wheel into an orbit.
 *
 * The control point is the midpoint pushed along the chord's normal, so the bow
 * is proportional to the distance and every connector curves by the same amount
 * whatever angle it leaves at.
 */
const BOW = 0.16;

function connectorFor(index: number, total: number) {
  const seat = seatFor(index, total);
  const cx = 50;
  const cy = 50;
  const dx = seat.x - cx;
  const dy = seat.y - cy;
  /* Normal to the chord, consistently to one side, so all six bow clockwise. */
  const mx = cx + dx / 2 - dy * BOW;
  const my = cy + dy / 2 + dx * BOW;
  return {
    seat,
    /** Centre to seat, which is the direction the eye reads the team in. */
    out: `M ${cx} ${cy} Q ${mx} ${my} ${seat.x} ${seat.y}`,
    /** Seat to centre, which is the direction the XP travels. */
    back: `M ${seat.x} ${seat.y} Q ${mx} ${my} ${cx} ${cy}`,
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
  const [paying, setPaying] = useState<{ member: number; coin: number } | null>(null);

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

    /* Walks the coin list one step per payout, so a reader watching the loop
       sees the range that is actually out there rather than the same drop over
       and over. Kept outside cycle() so it carries across restarts and the
       second pass does not open on the coin the first one did. */
    let spin = 0;

    const cycle = () => {
      setArrived(0);
      setPaying(null);

      let n = 0;
      const step = () => {
        n += 1;
        setArrived(n);
        /* A member who arrives already playing pays out on arrival, which is
           what ties the pill to the person rather than to the clock. */
        const index = n - 1;
        if (TEAM[index].caught >= ACTIVE_CATCHES) {
          const coin = spin++ % CATCH_CYCLE.length;
          setPaying({ member: index, coin });
          later(
            () => setPaying((c) => (c && c.member === index ? null : c)),
            STEP_MS - 60,
          );
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
          const coin = spin++ % CATCH_CYCLE.length;
          setPaying({ member: index, coin });
          later(
            () => setPaying((c) => (c && c.member === index ? null : c)),
            720,
          );
          if (k <= actives.length * 2) later(pulse, 980);
          else later(cycle, 980);
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
            setPaying(null);
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
            {/* A slow sweep around the ring, which is the idiom the hero's
                radar and the business page's claim plate already use. It gives
                the figure a pulse between payouts, so it is never a still
                picture, and it costs one rotating element rather than anything
                per frame. */}
            <span className="referral-sweep" aria-hidden="true" />
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
              <defs>
                {/* A connector fades as it reaches the centre rather than
                    running at one weight the whole way. The eye then reads the
                    ring as the lit part and the hub as where it all arrives,
                    which is what the section is about. */}
                <linearGradient id="referral-thread" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--brand-3)" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="var(--brand-3)" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="referral-thread-dim" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--line-strong)" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="var(--line-strong)" stopOpacity="0.08" />
                </linearGradient>
              </defs>

              {/* Ticks where the ring meets each seat. They mark the six places
                  a friend can stand whether or not one is standing there, which
                  is what turns a plain dashed circle into a dial. */}
              {TEAM.map((member, i) => {
                const seat = seatFor(i, total);
                const a = (-90 + (360 / total) * i) * (Math.PI / 180);
                return (
                  <line
                    key={`tick-${member.id}`}
                    className="referral-tick"
                    x1={seat.x - Math.cos(a) * 1.6}
                    y1={seat.y - Math.sin(a) * 1.8}
                    x2={seat.x + Math.cos(a) * 1.6}
                    y2={seat.y + Math.sin(a) * 1.8}
                  />
                );
              })}

              {TEAM.map((member, i) => {
                const { out, back } = connectorFor(i, total);
                const here = i < arrived;
                const active = member.caught >= ACTIVE_CATCHES;
                return (
                  <g key={member.id}>
                    {/* Drawn seat to centre so the gradient's lit end is at the
                        friend, where the XP comes from. */}
                    <path
                      d={back}
                      className="referral-link"
                      data-here={here || undefined}
                      data-active={active || undefined}
                      fill="none"
                    />
                    {/* The payout, running the curve itself rather than a
                        straight line laid over it. animateMotion follows the
                        same path element, so the mark cannot drift off the
                        thread however the stage is resized. */}
                    {active && here && (
                      <g
                        className="referral-spark"
                        data-paying={paying?.member === i || undefined}
                        /* offset-path rather than animateMotion. SMIL needs
                           beginElement() from script to fire and is on its way
                           out of the platform; a CSS animation restarts cleanly
                           when the attribute below flips, and the compositor
                           can carry it. The path is the same curve the thread
                           is stroked with, so the mark cannot drift off it. */
                        style={{ offsetPath: `path("${back}")` } as React.CSSProperties}
                      >
                        <circle r="3.4" className="referral-spark-halo" />
                        <circle r="1.5" className="referral-spark-head" />
                      </g>
                    )}
                    {/* Kept out of the paint: the unstroked twin the ring's
                        tick marks and the arriving animation both measure
                        against. */}
                    <path d={out} className="referral-link-ghost" fill="none" />
                  </g>
                );
              })}
            </svg>

            {/* You, and the code you are handing out. */}
            <div className="referral-you" data-paid={paying !== null || undefined}>
              {/* The long version, for the two things the figure cannot carry
                  at a glance: that the bonus has no ceiling, and that a friend
                  does not start counting when they install. */}
              <ReferralInfo />
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
                <XpBolt size={15} id="xp-hub" className="referral-mult-bolt" />
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
                  {/* The face, inside the ring that says how far this friend
                      is toward the bar. An arc around the portrait rather than
                      a bar under it: it reads at a glance as "this one is
                      full", it needs no label, and it puts the state on the
                      person instead of beside them. */}
                  <span className="referral-node-face" aria-hidden="true">
                    <svg className="referral-node-arc" viewBox="0 0 44 44">
                      <circle className="referral-node-arc-track" cx="22" cy="22" r="20" />
                      <circle
                        className="referral-node-arc-fill"
                        cx="22"
                        cy="22"
                        r="20"
                        /* 2πr, so the dash is in per cent of the circle without
                           anyone having to know the radius twice. */
                        strokeDasharray={2 * Math.PI * 20}
                        strokeDashoffset={2 * Math.PI * 20 * (1 - pct)}
                      />
                    </svg>
                    <span className="referral-node-portrait">
                      {/* Sized generously and scaled down by the box: the portrait is
                          28px on a phone and 34 on a desktop, and a single raster at
                          the larger size stays crisp at both. */}
                      <PixelAvatar seed={member.handle} size={34} />
                    </span>
                  </span>

                  {/* The payout. Written the way the app writes it, as a pill
                      reading "+N XP" (see CatchResultSheet), because inventing
                      an icon for XP would be inventing something the app does
                      not have. It rises off the friend and fades, once, when
                      that friend has just caught something. */}
                  {/* What this friend just caught, and what it was worth.
                      A coin rather than a bare number: the range of drops is
                      part of the point, and a legendary at 900 XP next to a
                      common at 80 says more about the bonus than any single
                      figure could. Both come from the app's own ladder.
                      The rarity colour is on the chip's rim, which is where
                      the collectibles section puts it too. */}
                  {(() => {
                    const drop = CATCH_CYCLE[(paying?.coin ?? 0) % CATCH_CYCLE.length];
                    return (
                      <span
                        className="referral-xp"
                        data-paying={paying?.member === i || undefined}
                        style={{ ["--rarity" as string]: RARITY_COLOUR[drop.rarity] }}
                        aria-hidden="true"
                      >
                        <Image
                          src={drop.image}
                          alt=""
                          width={16}
                          height={16}
                          className="referral-xp-coin"
                        />
                        <span className="referral-xp-symbol">{drop.symbol}</span>
                        <span className="referral-xp-amount">
                          <XpBolt size={10} id={`xp-${member.id}`} />
                          +{drop.xp}
                        </span>
                      </span>
                    );
                  })()}

                  <span className="referral-node-handle">@{member.handle}</span>
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
