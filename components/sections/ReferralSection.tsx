"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  ACTIVE_CATCHES,
  ACTIVE_WINDOW_DAYS,
  BONUS_PER_ACTIVE,
  CATCH_CYCLE,
  CODE_LENGTH,
  EXAMPLE_BASE_XP,
  RULES,
  TEAM,
} from "@/content/referrals";
import { RARITY_COLOUR } from "@/lib/globe-drops";
import { withCopy } from "@/lib/content-i18n";
import PixelAvatar from "@/components/ui/PixelAvatar";
import XpBolt from "@/components/brand/XpBolt";
import ReferralInfo from "@/components/sections/ReferralInfo";

/**
 * The referral mechanic, as a terminal rather than a diagram.
 *
 * This replaced a dial: six avatars on a ring with threads running into a hub.
 * It was accurate and it never stopped looking like a schematic — what it drew
 * was the *shape* of a referral tree, which nobody needs explaining, while the
 * thing that actually matters was left to a caption underneath.
 *
 * What matters is that a team pays out continuously, and only while its members
 * are playing. That is a feed, not a shape. So this is the panel the globe
 * section already speaks in: rows arriving, a catch landing against a name, a
 * rate at the bottom that moves as the count changes. The site had the
 * vocabulary and the figure was not using it.
 *
 * Two members never file a line, because they are short of the bar. They sit in
 * the list at their real count, so the rule reads off the panel rather than
 * being asserted under it.
 *
 * No WebGL and no blur. Rows of text and one small sprite each cost a phone
 * nothing next to a sixth GL context or another compositing surface, and this
 * page has spent a fortnight getting both of those down.
 */

/** How long between one row arriving and the next. */
const ARRIVE_MS = 260;
/** How long between one friend's catch and the next friend's. */
const CATCH_MS = 1900;
/** The clock the "how long ago" column runs on. */
const TICK_MS = 1000;

type Line = {
  /** Index into CATCH_CYCLE. */
  coin: number;
  /** Seconds since it landed. Counted, never read off a wall clock. */
  age: number;
  /** True for a moment after it lands, which is what the row flashes on. */
  fresh: boolean;
};

export default function ReferralSection() {
  const t = useTranslations("referrals");
  const rules = withCopy(useTranslations("referralRules"), RULES, ["title", "body"]);

  const hostRef = useRef<HTMLDivElement>(null);
  /** How many rows have arrived. */
  const [rows, setRows] = useState(0);
  /** The last catch filed against each member, by index into TEAM. */
  const [lines, setLines] = useState<Record<number, Line>>({});

  const total = TEAM.length;
  const shown = TEAM.slice(0, rows);
  const activeCount = shown.filter((m) => m.caught >= ACTIVE_CATCHES).length;
  const multiplier = 1 + BONUS_PER_ACTIVE * activeCount;

  /**
   * The panel runs while it is on screen and stops when it is not.
   *
   * Observed on the panel itself rather than on the section around it. The copy
   * stacks under the panel on a phone, and a threshold against the whole
   * section then cannot be met by scrolling the panel into view — the dial this
   * replaced had exactly that bug and sat there dead at 16% visible.
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

    /** Only these can file a catch. The rule, enforcing itself in the feed. */
    const actives = TEAM.map((m, i) => (m.caught >= ACTIVE_CATCHES ? i : -1)).filter(
      (i) => i >= 0,
    );

    let spin = 0;
    let turn = 0;

    const settle = () => {
      setRows(total);
      /* A resting state that is already populated, so a reader who asked for
         less motion gets a working panel rather than an empty frame. The ages
         are staggered so the column reads as a feed and not as one instant. */
      setLines(
        Object.fromEntries(
          actives.map((i, n) => [
            i,
            { coin: n % CATCH_CYCLE.length, age: n * 14 + 2, fresh: false },
          ]),
        ),
      );
    };

    const start = () => {
      setRows(0);
      setLines({});

      /* A member arrives with their last catch already against their name.
         There is no "waiting" state and there should not be: being active
         *means* having caught five times this week, so an empty line next to a
         lit dot would contradict the row's own dot. It also stopped the count
         column reading "14 / 5", which is what a target means when the member
         is long past it. */
      const arrive = () => {
        setRows((n) => {
          const index = n;
          const next = n + 1;
          if (TEAM[index] && TEAM[index].caught >= ACTIVE_CATCHES) {
            const coin = spin++ % CATCH_CYCLE.length;
            /* Staggered ages, so the column reads as a feed that has been
               running rather than as six things that happened at once. */
            setLines((prev) => ({
              ...prev,
              [index]: { coin, age: 6 + index * 11, fresh: false },
            }));
          }
          if (next < total) later(arrive, ARRIVE_MS);
          else later(file, 900);
          return next;
        });
      };

      /* One catch at a time, round the actives in turn. Several at once reads
         as a generator; one at a time reads as somebody having just found
         something. */
      const file = () => {
        const who = actives[turn % actives.length];
        turn += 1;
        const coin = spin++ % CATCH_CYCLE.length;
        setLines((prev) => ({ ...prev, [who]: { coin, age: 0, fresh: true } }));
        later(
          () =>
            setLines((prev) =>
              prev[who] ? { ...prev, [who]: { ...prev[who], fresh: false } } : prev,
            ),
          520,
        );
        later(file, CATCH_MS);
      };

      /* The age column, on its own clock. Counting rather than reading a wall
         clock keeps the server and the client agreeing, and stops the panel
         jumping when a tab comes back from the background. */
      const tick = () => {
        setLines((prev) => {
          const next: Record<number, Line> = {};
          for (const [k, v] of Object.entries(prev)) {
            next[Number(k)] = { ...v, age: v.age + 1 };
          }
          return next;
        });
        later(tick, TICK_MS);
      };

      later(arrive, 300);
      later(tick, TICK_MS);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        clearAll();
        if (!entry.isIntersecting) return;
        if (reduced) settle();
        else start();
      },
      { threshold: 0.25 },
    );
    observer.observe(host);
    return () => {
      observer.disconnect();
      clearAll();
    };
  }, [total]);

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

        {/* ── The panel ──────────────────────────────────────────────────── */}
        <div className="referral-term" ref={hostRef}>
          <header className="referral-term-head">
            <span className="t-mono-sm referral-term-title">{t("panelTitle")}</span>
            <span className="referral-term-code" aria-label={t("codeLabel")}>
              {"7KQ4MZ9P".slice(0, CODE_LENGTH)}
            </span>
            <ReferralInfo />
          </header>

          <ol className="referral-term-rows">
            {TEAM.map((member, i) => {
              const here = i < rows;
              const active = member.caught >= ACTIVE_CATCHES;
              const line = lines[i];
              const drop = line ? CATCH_CYCLE[line.coin] : null;
              return (
                <li
                  key={member.id}
                  className="referral-row"
                  data-here={here || undefined}
                  data-active={active || undefined}
                  data-fresh={line?.fresh || undefined}
                  style={{
                    ["--i" as string]: i,
                    ...(drop ? { ["--rarity" as string]: RARITY_COLOUR[drop.rarity] } : {}),
                  }}
                >
                  <span className="referral-row-dot" aria-hidden="true" />

                  <span className="referral-row-who">
                    <span className="referral-row-face" aria-hidden="true">
                      <PixelAvatar seed={member.handle} size={22} />
                    </span>
                    <span className="referral-row-handle">@{member.handle}</span>
                  </span>

                  {/* Level. Real data, not filler: get_my_referral_team()
                      returns it alongside the handle and the active flag, so a
                      panel that claims to be that query should show it. It also
                      fills the run between the name and the catch, which was
                      the widest empty space in the row. */}
                  <span className="referral-row-level">
                    {t("levelShort")} {String(member.level).padStart(2, "0")}
                  </span>

                  {/* What they caught, or how far off the bar they are. The two
                      states share a column on purpose: it is the same question
                      being answered either way. */}
                  {active && drop ? (
                    <>
                      <span className="referral-row-coin">
                        <Image src={drop.image} alt="" width={18} height={18} />
                        <span className="referral-row-symbol">{drop.symbol}</span>
                      </span>
                      <span className="referral-row-xp">
                        <XpBolt size={11} id={`xp-${member.id}`} />+{drop.xp}
                      </span>
                      <span className="referral-row-age">{line.age}s</span>
                    </>
                  ) : (
                    <>
                      <span className="referral-row-coin referral-row-idle">
                        {t("idle")}
                      </span>
                      <span className="referral-row-xp referral-row-short">
                        {member.caught} / {ACTIVE_CATCHES}
                      </span>
                      <span className="referral-row-age" />
                    </>
                  )}
                </li>
              );
            })}
          </ol>

          <footer className="referral-term-foot">
            <span className="t-mono-sm">
              {t("activeLabel")}{" "}
              <b data-lit={activeCount > 0 || undefined}>
                {String(activeCount).padStart(2, "0")}
              </b>{" "}
              / {String(rows).padStart(2, "0")}
            </span>

            <span className="referral-term-rate">
              <span className="t-mono-sm">{t("rateLabel")}</span>
              <span className="referral-term-mult">
                <XpBolt size={15} id="xp-rate" />
                {multiplier.toFixed(2)}×
              </span>
            </span>
          </footer>
        </div>

        {/* ── What the panel is saying ───────────────────────────────────── */}
        <div className="referral-under">
          <div className="referral-sum">
            <p className="t-mono-sm referral-sum-label">{t("exampleLabel")}</p>
            <p className="referral-sum-line">
              <span className="referral-sum-base">{EXAMPLE_BASE_XP} XP</span>
              <ArrowRight />
              <span className="referral-sum-out">
                {Math.round(EXAMPLE_BASE_XP * multiplier)} XP
              </span>
            </p>
            <p className="t-body">{t("exampleBody")}</p>
            <p className="t-mono-sm referral-sum-rule">
              {t("activeRule", { needed: ACTIVE_CATCHES, days: ACTIVE_WINDOW_DAYS })}
            </p>
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
