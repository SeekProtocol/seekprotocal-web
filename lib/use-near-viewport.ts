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
 */
const BUILD_REACH = 1;
const RELEASE_REACH = BUILD_REACH + 0.5;

const BUILD_MARGIN = `${BUILD_REACH * 100}% 0px`;
const RELEASE_MARGIN = `${RELEASE_REACH * 100}% 0px`;

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
 */
export function useNearViewport(
  ref: React.RefObject<HTMLElement | null>,
  rootMargin = BUILD_MARGIN,
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

      const release = new IntersectionObserver(
        (entries) => {
          if (entries.every((entry) => !entry.isIntersecting)) setNear(false);
        },
        { rootMargin: RELEASE_MARGIN },
      );
      release.observe(el);
      return () => release.disconnect();
    }

    /* Anything already in range latches now, from geometry, without waiting on
       the observer. Two reasons. The observer's first callback is async, so the
       scene above the fold would otherwise show a spinner for a frame it did
       not need to. And it removes the observer from the path entirely for the
       one scene that is visible at load, so that scene cannot be held back by
       anything that stops callbacks arriving. */
    const box = el.getBoundingClientRect();
    // Read off BUILD_REACH so the shortcut and the observer cannot disagree.
    const reach = BUILD_REACH * window.innerHeight;

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
      { rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, rootMargin, near]);

  return near;
}
