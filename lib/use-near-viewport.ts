"use client";

import { useEffect, useState } from "react";
import { isOff } from "@/lib/bisect";

/**
 * Whether an element has come within reach of the viewport, once and for good.
 *
 * This file used to do two jobs. It gated the *download* — holding back a
 * `dynamic()` so the 603 KB chunk that three.js and all five scenes share was
 * not fetched for a section nobody had scrolled to — and it gated the *build*,
 * deciding when a scene was allowed to open a WebGL context and, on a handheld,
 * when it had to give one back.
 *
 * The second job is gone. There is one context now, held by lib/three-stage.ts
 * for the whole page, and the stage decides which slots to draw from their own
 * geometry. So everything this file grew in order to manage five contexts has
 * been deleted with them:
 *
 *  - the release observer, and the RELEASE_GAP that had to stay wider than the
 *    build reach or a scene sitting between the two would build, be released,
 *    and rebuild for as long as a reader rested there
 *  - the LINGER grace period on the way out
 *  - the `live` set that evicted every offscreen scene whenever another
 *    latched, which was the only way to promise a phone held one context when
 *    the layout would not
 *
 * Two earlier attempts to get that count down by choosing better distances both
 * missed, in different directions: 80% release against 100% build left a band
 * where three scenes could thrash, and 250% left Mobi and the globe alive
 * across most of the page until Safari killed the tab. Neither number was
 * wrong so much as the question was — none of it is asked any more.
 *
 * What is left is a one-way latch. A section within reach renders its scene and
 * keeps rendering it. Unmounting is what would be expensive now: it would
 * dispose the slot and make the stage build the whole scene graph again.
 *
 * Returns true when IntersectionObserver is unavailable, so an unsupported
 * browser gets every scene rather than none.
 */

/** How far ahead a section starts fetching its chunk, in viewports. */
const BUILD_REACH = 1;

/*
 * There used to be a settle delay here, so that nothing mounted mid-flick. It
 * has gone, and it is worth saying why rather than leaving a gap.
 *
 * Two things happen when this latches: a chunk is fetched, and — before the
 * shared stage existed — a scene was built. The second is the expensive one,
 * and it is not this file's any more. lib/three-stage.ts decides when to build,
 * and it gates on scroll *speed*, which is the thing the settle delay was
 * standing in for.
 *
 * Leaving the delay here as well made two gates in series, and the pair failed
 * in a way neither did alone: a reader scrolling steadily down the page never
 * stops for 180ms, so the section never mounted, so the stage never saw a slot
 * to build, and every scroll-driven section arrived empty. That was a
 * regression against the old behaviour and it was reported as one.
 *
 * What is left is a network fetch, which does not compete for the main thread
 * and is worth starting early in any case.
 */
export function useNearViewport(
  ref: React.RefObject<HTMLElement | null>,
  buildReach = BUILD_REACH,
) {
  /* Starts latched where there is no observer to latch it, so an unsupported
     browser renders every scene rather than none. Decided here rather than in
     the effect: setting state synchronously from an effect body cascades a
     second render, and this is knowable before the first one. `near` is never
     rendered, so the server and client disagreeing about it changes no markup. */
  const [near, setNear] = useState(
    () =>
      typeof window !== "undefined" &&
      typeof IntersectionObserver === "undefined",
  );

  useEffect(() => {
    if (near) return; // One way. Nothing takes it back.
    const el = ref.current;
    if (!el) return;
    /* ?3d=off. One return covers every scene on the site, because they all
       come through this gate. See lib/bisect.ts. */
    if (isOff("3d")) return;
    if (typeof IntersectionObserver === "undefined") return;

    /* Anything already in range latches now, from geometry, without waiting on
       the observer. The observer's first callback is async, so the section
       above the fold would otherwise hold a spinner for a frame it did not
       need to. */
    const box = el.getBoundingClientRect();
    const reach = buildReach * window.innerHeight;

    /* A display: none element has no layout box, so every edge reads zero and
       the range test would call it visible and mount a scene nobody can see.
       The two scrubbed sections are hidden exactly that way on a handheld (see
       .scene-scrubbed), which is the whole point of hiding them.

       Skipping only the shortcut and still observing is deliberate: a tablet
       rotated from portrait into landscape crosses the 1024px edge, the
       section gains a box, and the observer is there to notice. */
    const hasBox = box.width > 0 || box.height > 0;
    if (hasBox && box.top < window.innerHeight + reach && box.bottom > -reach) {
      setNear(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setNear(true);
      },
      { rootMargin: `${buildReach * 100}% 0px` },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, buildReach, near]);

  return near;
}
