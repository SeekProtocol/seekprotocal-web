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

/** One viewport of reach before the scene is needed. */
const BUILD_MARGIN = "100% 0px";

/**
 * Two and a half viewports before a handheld gives one back.
 *
 * The gap between this and BUILD_MARGIN is the hysteresis. Releasing at the
 * same distance a scene builds at would rebuild it on every small scroll
 * around the boundary, which costs more than holding it ever did.
 */
const RELEASE_MARGIN = "250% 0px";

/**
 * The latch is one-way on a desktop and two-way on a handheld.
 *
 * On a desktop, holding five contexts is unremarkable, and two of these scenes
 * are scrubbed by scroll position, where rebuilding mid-scroll would drop the
 * frame the scene was meant to be showing. So a built scene stays built.
 *
 * A phone does not get that luxury. Scroll to the bottom of the homepage and
 * all five contexts are live at once; Safari does not degrade under that, it
 * kills the tab and the page reloads itself. Two and a half viewports away
 * nobody is scrubbing anything, so the frame that a rebuild would cost is a
 * frame nobody is looking at, and it buys the page a ceiling of roughly two
 * live contexts instead of five.
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
    const reach = window.innerHeight; // mirrors the 100% default rootMargin
    if (box.top < window.innerHeight + reach && box.bottom > -reach) {
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
