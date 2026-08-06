"use client";

import { useEffect, useState } from "react";
import { isHandheld } from "@/lib/render-budget";

/**
 * Whether an element has come within reach of the viewport.
 *
 * The homepage mounts five WebGL scenes. Each one already had an
 * IntersectionObserver, but it only paused the render loop: the context, the
 * shaders and the models were all built the moment the component mounted, for
 * every scene at once, including one sitting sixteen thousand pixels below the
 * fold. Measured on production, five contexts were live at scroll position zero
 * with one on screen, holding thirteen megapixels of drawing buffer between
 * them. That is the load stutter, and render-budget.ts cannot fix it: it makes
 * each context cheaper, not fewer of them.
 *
 * This gates construction instead. A scene builds itself one viewport before it
 * is reached, so the first paint pays for the hero and nothing else.
 *
 * Returns true when IntersectionObserver is unavailable, so an unsupported
 * browser gets every scene rather than none.
 */

/**
 * Build reach, then release reach, both in viewports, and RELEASE must be the
 * larger of the two. It is written as an offset rather than a second literal so
 * that the ordering is structural: the invariant cannot be inverted by editing
 * one number.
 *
 * Why it has to hold. A scene builds while its distance from the viewport edge
 * is under BUILD, and a handheld releases it while that distance is over
 * RELEASE. Set RELEASE below BUILD and the two tests are true at the same time
 * for anything sitting between them, so the scene builds, is released, rebuilds,
 * and so on for as long as the reader rests there. That loop creates and
 * destroys a WebGL context, compiles its shaders and re-uploads its models every
 * cycle, which costs far more than holding a second context ever did. It briefly
 * shipped that way at BUILD 100% and RELEASE 80%, which left a band of about
 * 170px on an iPhone where three scenes could each thrash.
 *
 * The gap is the hysteresis. Half a viewport, roughly 420px on a phone, is more
 * than any scroll settle needs. 250% was the other failure: valid ordering, but
 * so wide that Mobi and the globe stayed alive across most of the page and
 * Safari killed the tab under the two of them.
 *
 * The invariant used to hold only for the default. The hook took a finished
 * rootMargin string for the build side while the release side read a module
 * constant, so a caller that passed its own margin moved one edge and not the
 * other. All four section gates passed "150% 0px", which is exactly the release
 * margin: build reach and release reach identical, hysteresis zero, the state
 * flipping on either side of a single line. The reach is a number now, in
 * viewports, and both margins are derived from it, so there is no longer a way
 * to move one without the other.
 */
const BUILD_REACH = 1;
const RELEASE_GAP = 0.5;

const margin = (reach: number) => `${reach * 100}% 0px`;

/**
 * Every scene currently holding itself built on a handheld.
 *
 * Distance alone has never been able to promise how many of these are alive at
 * once: that depends on how tall the sections between them happen to render,
 * which changes with the copy, the locale and the phone. Both previous failures
 * were attempts to get the number down to one by choosing a better reach, and
 * both missed in a different direction.
 *
 * So the count is enforced instead of estimated. A scene that latches evicts
 * every other one that is off screen, which makes "one context on a phone" a
 * property of the page rather than a hope about its layout. Whatever the reader
 * is actually looking at is never evicted, so this can only ever release
 * something nobody can see.
 *
 * The cost is that scrolling back and forth across two scenes that sit close
 * together rebuilds them, where before they would both have stayed up. That is
 * the trade being made on purpose: a rebuild costs a stutter, and the thing it
 * buys off is Safari killing the tab.
 */
type Holder = { el: HTMLElement; release: () => void };
const live = new Set<Holder>();

function onScreen(el: HTMLElement) {
  const box = el.getBoundingClientRect();
  return box.bottom > 0 && box.top < window.innerHeight;
}

function claim(holder: Holder) {
  for (const other of live) {
    if (other !== holder && !onScreen(other.el)) other.release();
  }
  live.add(holder);
}

/**
 * The latch is one-way on a desktop and two-way on a handheld.
 *
 * On a desktop, holding five contexts is unremarkable, and two of these scenes
 * are scrubbed by scroll position, where rebuilding mid-scroll would drop the
 * frame the scene was meant to be showing. So a built scene stays built.
 *
 * A phone does not get that luxury. Scroll to the bottom of the homepage and
 * Safari kills the tab under multiple live WebGL contexts. Offscreen scenes
 * are released quickly so only the nearest one stays built.
 *
 * `buildReach` is in viewports. The release reach follows it by RELEASE_GAP.
 */
export function useNearViewport(
  ref: React.RefObject<HTMLElement | null>,
  buildReach = BUILD_REACH,
) {
  /* Starts latched where there is no observer to latch it, so an unsupported
     browser builds every scene rather than none. Decided here rather than in
     the effect: setting state synchronously from an effect body cascades a
     second render, and this is knowable before the first one. `near` is never
     rendered, so the server and client disagreeing about it changes no markup. */
  const [near, setNear] = useState(
    () =>
      typeof window !== "undefined" &&
      typeof IntersectionObserver === "undefined",
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") return;

    if (near) {
      // Built already. Only a handheld ever gives one back.
      if (!isHandheld()) return;

      /* Take the slot, evicting whatever else is built and off screen. Done
         here rather than at the moment of latching so that it also runs for the
         scene that latched from geometry before any observer existed. */
      const holder: Holder = { el, release: () => setNear(false) };
      claim(holder);

      const release = new IntersectionObserver(
        (entries) => {
          if (entries.every((entry) => !entry.isIntersecting)) setNear(false);
        },
        { rootMargin: margin(buildReach + RELEASE_GAP) },
      );
      release.observe(el);
      return () => {
        release.disconnect();
        live.delete(holder);
      };
    }

    /* Anything already in range latches now, from geometry, without waiting on
       the observer. Two reasons. The observer's first callback is async, so the
       scene above the fold would otherwise show a spinner for a frame it did
       not need to. And it removes the observer from the path entirely for the
       one scene that is visible at load, so that scene cannot be held back by
       anything that stops callbacks arriving. */
    const box = el.getBoundingClientRect();
    /* Read off the same buildReach the observer below is given, so the shortcut
       and the observer cannot disagree. It used to read the module constant
       while the observer took the caller's margin, which meant a section gate
       asking for 150% got a shortcut that only reached 100%. */
    const reach = buildReach * window.innerHeight;

    /* A display: none element has no layout box, so every edge reads zero and
       the range test would call it visible and build a scene nobody can see.
       The two scrubbed sections are hidden exactly that way on a handheld (see
       .scene-scrubbed), which is the whole point of hiding them.

       Skipping only the shortcut and still observing is deliberate: a tablet
       rotated from portrait into landscape crosses the 1024px edge, the
       section gains a box, and the observer is there to notice. */
    const hasBox = box.width > 0 || box.height > 0;
    if (hasBox && box.top < window.innerHeight + reach && box.bottom > -reach) {
      /* A one-time latch read off geometry. The extra render the rule warns
         about is the intent, and it costs one pass per scene instead of a
         spinner frame the reader did not need to see. */
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNear(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setNear(true);
      },
      { rootMargin: margin(buildReach) },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, buildReach, near]);

  return near;
}
