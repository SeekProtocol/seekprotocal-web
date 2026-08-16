"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import PhoneFrame, { StatusBar } from "@/components/app/PhoneFrame";
import { SeekMark } from "@/components/brand/SeekLogo";
import {
  EVENT_SCREENS,
  FOUND_MAP,
  REWARD_CATEGORIES,
  REWARD_ITEMS,
  SLOTS,
  randomReward,
  type RewardCategory,
  type RewardItem,
} from "@/content/rewards";

/**
 * What can be waiting at a coordinate.
 *
 * The job of this section is range. A reader who has just come past the
 * collectibles section knows the drop can be a coin; what they do not know is
 * that it can be a memecoin with no distribution channel, a voucher worth
 * something at a till, an NFT, a games console in a box, or all of those at
 * once for the length of an event. Saying that in a list would be a list. This
 * shows the objects.
 *
 * ## How the field works
 *
 * Every reward is mounted once and never unmounted. Choosing a category does
 * not swap the contents of the stage, it **re-ranks** them: the chosen category
 * takes the four front slots and everything else redistributes behind, getting
 * smaller, dimmer and softer as it goes.
 *
 * That is the reason the composition survives an uneven set. NFTs has one
 * artwork and tokens has six, and a layout that emptied the stage for one and
 * filled it for the other would flash between a crowd and a void on every
 * switch. Here the stage is always full and only the ordering changes, so the
 * transition is a depth change rather than a repaint.
 *
 * ## Two elements per reward, on purpose
 *
 * The outer element carries the slot transform, which React sets and CSS
 * transitions. The inner one carries the idle drift, which is a keyframe
 * animation. They cannot share an element: an animation on `transform` wins
 * over an inline `transform` however specific the inline one is, so a single
 * element would drift correctly and then refuse to move between slots.
 */

/** Milliseconds a category holds before the rail advances on its own. */
const DWELL = 5200;
/** Milliseconds between the phone's two event screens. */
const SCREEN_SWAP = 6400;

export default function RewardsSection() {
  const t = useTranslations("rewards");
  const [active, setActive] = useState<RewardCategory>(REWARD_CATEGORIES[0]);
  const [screen, setScreen] = useState(0);
  /**
   * The tap.
   *
   * `pull` is the rewards being drawn into the phone, `open` is the alert
   * standing on top of it. They are separate because the alert has to arrive
   * *after* the field has closed, and one flag cannot express "in flight".
   * `armed` is the invitation, which is dropped the first time somebody
   * accepts it: an affordance that keeps waving after you have used it is
   * telling you to do something you already did.
   */
  const [pay, setPay] = useState(false);
  const [paid, setPaid] = useState(false);
  const [pull, setPull] = useState(false);
  const [open, setOpen] = useState(false);
  const [found, setFound] = useState(false);
  /** What was drawn. Held past the reset so the screen can fade out with it. */
  const [prize, setPrize] = useState<RewardItem | null>(null);
  const [armed, setArmed] = useState(true);
  const timers = useRef<number[]>([]);

  /**
   * Whether the rail is still advancing on its own.
   *
   * Cleared the moment the reader touches anything, and never set again: a
   * stage that keeps moving while someone reads the panel under it is worse
   * than one that never moved. Same rule the offers rail follows.
   *
   * State rather than a ref, even though the interval is its main reader,
   * because the progress bar under the active tab renders from it. A ref read
   * during render does not re-render when it changes, so the bar would have
   * kept counting down after the reader had taken over.
   */
  const [auto, setAuto] = useState(true);
  const stageRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const tapRef = useRef<HTMLButtonElement>(null);

  const choose = useCallback((category: RewardCategory) => {
    setAuto(false);
    setActive(category);
  }, []);

  /* Every timeout this fires is tracked, because the sequence outlives the
     click by four seconds and a reader who scrolls away and comes back would
     otherwise land mid-animation with a stale alert opening over them. */
  const clearTimers = useCallback(() => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  }, []);

  const participate = useCallback(() => {
    setAuto(false);
    setArmed(false);
    clearTimers();

    // Replay from the start if it is already running, rather than stacking.
    setOpen(false);
    setFound(false);
    setPull(false);
    setPay(false);
    setPaid(false);
    setPrize(randomReward());

    /* Where the coin has to land, measured rather than guessed.
       Against the *field* and not the stage, because the field is inset on a
       phone (`inset: 2% 7%`) and the slots are percentages of it. Measuring
       against the stage put the coin about a coin's width off centre on mobile
       and nowhere near on a narrow one. */
    const field = fieldRef.current;
    const tap = tapRef.current;
    if (field && tap) {
      const f = field.getBoundingClientRect();
      const b = tap.getBoundingClientRect();
      field.style.setProperty("--pay-x", `${((b.left + b.width / 2 - f.left) / f.width) * 100}%`);
      field.style.setProperty("--pay-y", `${((b.top + b.height / 2 - f.top) / f.height) * 100}%`);
    }
    const at = (ms: number, fn: () => void) =>
      timers.current.push(window.setTimeout(fn, ms));

    /* The whole beat, in order. It is a story rather than a flourish: the
       rewards are pulled in, the phone says one is nearby and that other people
       are already moving, and then it pays off by showing the thing being won
       on the map. Cutting any step leaves the previous one unresolved. */
    /* The coin goes first. Paying for a thing and then getting the thing are
       two events, and running them together loses the first one entirely: the
       500 SEEK simply disappeared into a general commotion. */
    at(20, () => setPay(true));
    at(760, () => setPaid(true));
    at(1400, () => setPull(true));
    // The field takes 0.75s to close. The alert arrives as it lands, which is
    // what makes it read as the phone having caught something.
    at(2000, () => setOpen(true));
    at(4050, () => setOpen(false));
    // The win screen comes up as the alert clears, not over it.
    at(4400, () => setFound(true));
    at(8750, () => setFound(false));
    at(9250, () => {
      setPull(false);
      setPay(false);
      setPaid(false);
    });
  }, [clearTimers]);

  useEffect(() => clearTimers, [clearTimers]);

  /**
   * Slot index per reward id, recomputed when the category changes.
   *
   * The chosen category leads, in its authored order; everything else follows
   * in its authored order. Nothing is shuffled, so a reward returns to the same
   * back slot each time rather than jumping somewhere new, and the field reads
   * as one scene being re-sorted instead of a fresh draw.
   */
  const placement = useMemo(() => {
    const chosen = REWARD_ITEMS.filter((item) => item.category === active);
    const rest = REWARD_ITEMS.filter((item) => item.category !== active);
    const map = new Map<string, number>();
    [...chosen, ...rest].forEach((item, i) => map.set(item.id, i));
    return map;
  }, [active]);

  // Auto-advance the rail, and stop for good on the first interaction.
  useEffect(() => {
    if (!auto) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const stage = stageRef.current;
    if (!stage) return;

    let onScreen = false;
    const observer = new IntersectionObserver(
      ([entry]) => (onScreen = entry.isIntersecting),
      { threshold: 0.35 },
    );
    observer.observe(stage);

    const id = window.setInterval(() => {
      if (!onScreen) return;
      setActive((prev) => {
        const at = REWARD_CATEGORIES.indexOf(prev);
        return REWARD_CATEGORIES[(at + 1) % REWARD_CATEGORIES.length];
      });
    }, DWELL);

    return () => {
      window.clearInterval(id);
      observer.disconnect();
    };
  }, [auto]);

  // The phone cycles its two event screens independently of the rail, so the
  // two rhythms drift against each other and the stage never pulses as one.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(
      () => setScreen((prev) => (prev + 1) % EVENT_SCREENS.length),
      SCREEN_SWAP,
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="rewards">
      {/* Centred, unlike most section heads here, because everything under it
          is symmetric about the phone. A left-aligned head over a centred stage
          reads as two compositions sharing a section. */}
      <div className="sec-head-center reveal">
        <p className="eyebrow eyebrow-center">{t("eyebrow")}</p>
        <h2 className="t-h2">{t("title")}</h2>
        <p className="t-lead" style={{ marginTop: "1.25rem" }}>
          {t("lead")}
        </p>
      </div>

      {/* ── The stage ─────────────────────────────────────────────────────
          `data-events` pulls the whole field back and lifts the phone, because
          the events category is not a sixth kind of reward. It is every kind,
          handed out at a time and a place, so the right way to show it is to
          make the thing handing them out the subject. */}
      <div
        ref={stageRef}
        className="rewards-stage reveal"
        data-events={active === "events" || undefined}
        data-pull={pull || undefined}
        data-pay={pay || undefined}
      >
        <div ref={fieldRef} className="rewards-field" aria-hidden="true">
          {REWARD_ITEMS.map((item) => {
            const index = placement.get(item.id) ?? SLOTS.length;
            const slot = SLOTS[index];
            return (
              <span
                key={item.id}
                className="reward-slot"
                data-front={index < 4 || undefined}
                /* The one coin that flies to the button before the rest move. */
                data-seek={item.id === "seek" || undefined}
                style={
                  {
                    "--x": `${slot ? slot.x : 50}%`,
                    "--y": `${slot ? slot.y : 50}%`,
                    "--s": slot ? slot.scale : 0.2,
                    "--o": slot ? slot.opacity : 0,
                    "--blur": `${slot ? slot.blur : 4}px`,
                    // Spread the drift so no two rewards rise together.
                    "--delay": `${(REWARD_ITEMS.indexOf(item) % 7) * -1.9}s`,
                  } as React.CSSProperties
                }
              >
                <span className="reward-drift">
                  <Image
                    src={item.src}
                    alt=""
                    width={item.w}
                    height={item.h}
                    className="reward-art"
                    loading="lazy"
                    decoding="async"
                    sizes="180px"
                  />
                </span>
              </span>
            );
          })}
        </div>

        <div className="rewards-phone">
          <span className="rewards-phone-glow" aria-hidden="true" />
          {/* Rings leaving the device on impact. Outside the frame, because
              their whole job is to reach past its edges. */}
          <span className="rewards-shock" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <PhoneFrame glow={false}>
            {EVENT_SCREENS.map((entry, i) => (
              <Image
                key={entry.id}
                src={entry.src}
                alt={i === screen ? t("phoneAlt") : ""}
                fill
                sizes="300px"
                className="rewards-screen"
                data-shown={i === screen || undefined}
                loading="lazy"
                decoding="async"
              />
            ))}

            {/* The participate button is painted into the screen artwork, so
                the real control is a transparent overlay sitting exactly on
                top of it. Its box is measured off the source file rather than
                eyeballed: the pill runs 4.98% from the left, 88.56% down,
                89.8% wide and 6.41% tall of the 402x874 panel. If the screens
                are ever re-exported, re-measure. */}
            <button
              ref={tapRef}
              type="button"
              className="rewards-tap"
              data-armed={armed || undefined}
              onClick={participate}
              aria-label={t("participateLabel")}
            >
              <span className="rewards-tap-ring" aria-hidden="true" />
              <span className="rewards-tap-hand" aria-hidden="true">
                <TapGlyph />
              </span>
            </button>

            {/* Paid. Mint, which is the colour this site keeps for states that
                mean something: shipped, a perfect catch, an anchor locked. */}
            <span className="rewards-paid" data-on={paid || undefined} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="m5.5 12.6 4.2 4.2 8.8-9.6"
                  stroke="currentColor"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>

            <span className="rewards-flash" aria-hidden="true" />

            {/* The payoff. Sits over the static screen rather than replacing
                it, so there is nothing to load and nothing to lay out when it
                arrives: it fades in over a screen that is already there. */}
            <FoundScreen prize={prize} shown={found} />

            {/* The alert rises out of the screen once the field has closed. */}
            <div className="rewards-alert" data-open={open || undefined} role="status">
              <span className="rewards-alert-mark" aria-hidden="true">
                <SeekMark size={26} gradientId="rewards-alert-mark" />
              </span>
              <p className="rewards-alert-title">{t("alertTitle")}</p>
              <p className="rewards-alert-body">{t("alertBody")}</p>
              <span className="rewards-alert-seekers">
                <i aria-hidden="true" />
                <i aria-hidden="true" />
                <i aria-hidden="true" />
                {t("alertSeekers")}
              </span>
            </div>
          </PhoneFrame>

          {/* The chip carries the mark rather than a plain dot. It is the one
              place on the stage where the product name belongs, and a coloured
              dot said "something is live" without saying whose. */}
          <span className="rewards-live">
            <SeekMark size={16} gradientId="rewards-live-mark" />
            {t("liveChip")}
            <i className="rewards-live-pulse" aria-hidden="true" />
          </span>
        </div>
      </div>

      {/* ── The rail ──────────────────────────────────────────────────────── */}
      <div className="rewards-rail reveal" role="tablist" aria-label={t("railLabel")}>
        {REWARD_CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            role="tab"
            id={`reward-tab-${category}`}
            aria-selected={category === active}
            aria-controls="reward-panel"
            className="rewards-tab"
            data-active={category === active || undefined}
            onClick={() => choose(category)}
          >
            {t(`categories.${category}.label`)}
            {/* A bar that fills over one dwell, so the rail visibly *is*
                advancing rather than appearing to change its mind. Keyed on the
                category so it restarts, and gone entirely once the reader has
                taken over, because then it would be counting down to nothing. */}
            {category === active && auto ? (
              <span key={category} className="rewards-tab-progress" aria-hidden="true" />
            ) : null}
          </button>
        ))}
      </div>

      <div
        className="rewards-panel reveal"
        id="reward-panel"
        role="tabpanel"
        aria-labelledby={`reward-tab-${active}`}
        key={active}
      >
        <h3 className="t-h3 rewards-panel-title">{t(`categories.${active}.headline`)}</h3>
        <p className="t-body">{t(`categories.${active}.body`)}</p>
      </div>

      {/* One line, outside the panel, because the answer does not change with
          the category. Whatever is in the box, the thing that stops it being
          claimed by someone who was never there is the same mechanism. The
          offers section used to ask this question five times over. */}
      <p className="t-small rewards-proof reveal">{t("proofNote")}</p>
    </div>
  );
}

/** A hand about to press, with the two contact arcs that say it just did. */
function TapGlyph() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 11.2V5.6a1.6 1.6 0 0 1 3.2 0v5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M12.2 10.6V9.4a1.5 1.5 0 0 1 3 0v1.2m0-.4a1.5 1.5 0 0 1 3 0v4.2a5.4 5.4 0 0 1-5.4 5.4h-1a4.3 4.3 0 0 1-3.5-1.8l-2.4-3.4a1.5 1.5 0 0 1 2.2-2l1.9 1.7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * The win screen: found on the map, and it is yours.
 *
 * Drawn rather than screenshotted, because a still of this would be a still.
 * The map is a compact version of the same idiom `MapScreen` uses, dark blocks
 * and two roads and a park, at the 402x874 the aperture expects. It is
 * deliberately quiet: it is a backdrop for the reward, not a map to read.
 *
 * `prize` is held after `shown` goes false so the screen can fade out with the
 * artwork it came in with. Clearing both together made the reward vanish a
 * frame before the panel did.
 */
function FoundScreen({ prize, shown }: { prize: RewardItem | null; shown: boolean }) {
  const t = useTranslations("rewards");
  if (!prize) return null;

  return (
    <div className="found" data-shown={shown || undefined} role="status" aria-label={t("foundAlt")}>
      <StatusBar />

      <Image
        src={FOUND_MAP.src}
        alt=""
        fill
        sizes="300px"
        className="found-map"
        aria-hidden="true"
      />
      {/* Two scrims rather than a flat darkening of the file: the map has to
          stay a map in the middle, where the reward sits, and get out of the
          way at the top and bottom, where the status bar and the copy are. */}
      <span className="found-scrim" aria-hidden="true" />

      {/* The walk that got there, drawn once as the screen arrives. */}
      <svg className="found-trail" viewBox="0 0 402 874" aria-hidden="true">
        <path d="M120 792 Q150 690 186 620 T214 470" />
      </svg>

      {/* Rings around the spot. They were the same size as the reward and sat
          straight behind it, which is to say they were invisible. Bigger than
          the artwork is the only place they can be seen. */}
      <span className="found-pin" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>

      <div className="found-prize">
        <span className="found-rays" aria-hidden="true" />
        <Image
          src={prize.src}
          alt=""
          width={prize.w}
          height={prize.h}
          className="found-art"
          sizes="200px"
        />
      </div>

      <div className="found-copy">
        {/* The site's own eyebrow device, made symmetrical and in mint: a
            mono line between two rules. It replaced a mint pill with a check
            in it, which read as every success toast ever shipped. This one is
            the typography the rest of the page already speaks in, and the
            rules draw outward as it lands rather than just appearing. */}
        <p className="found-label">{t("foundLabel")}</p>
        <h3 className="found-name">{t(`items.${prize.id}`)}</h3>
        <p className="found-where">{t("foundWhere")}</p>
        <p className="found-fine">{t("foundFine")}</p>
      </div>

      {/* Mapbox require this wherever their imagery appears. See FOUND_MAP. */}
      <p className="found-credit">{t("mapCredit")}</p>
    </div>
  );
}
