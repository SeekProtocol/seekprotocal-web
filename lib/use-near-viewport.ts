"use client";

import { useEffect, useState } from "react";
import { isOff } from "@/lib/bisect";
import { isHandheld } from "@/lib/render-budget";

/**
 * Whether an element is currently within reach of the viewport.
 *
 * This file used to do two jobs. It gated the *download* — holding back a
 * `dynamic()` so the 603 KB chunk that three.js and all five scenes share was
 * not fetched for a section nobody had scrolled to — and it gated the *build*,
 * deciding when a scene was allowed to open a WebGL context and, on a handheld,
 * when it had to give one back.
 *
 * The build gate has moved to lib/three-stage.ts, which now owns one context
 * for the whole page. What is here is the mount gate: whether the wrapper
 * component that owns the three-host div and its canvas is in the tree at all.
 *
 * ## Desktop: one-way. Handheld: two-way.
 *
 * On desktop the latch is one-way, as it was before: a section that has been
 * near the viewport keeps its scene mounted for the rest of the page. Memory
 * is plentiful there and remounting is what would be expensive — it disposes
 * the slot and makes the stage build the whole scene graph again.
 *
 * On a handheld the latch is two-way: a section that has scrolled far enough
 * away unmounts, which disposes the slot (via useSceneSlot's cleanup) and
 * lets React reclaim its DOM. Reversed as a memory measure — three scenes
 * held live across a 20,000px page pushed the tab over.
 *
 * ## Why the numbers are these numbers
 *
 * Two earlier attempts to add release both thrashed: 80% release against 100%
 * build left a band where three scenes could rebuild for as long as a reader
 * rested there, and 250% left the globe and Mobi alive across most of the
 * page until Safari killed the tab. Neither release was *wrong*; they were
 * too close to build without a time gate to stop the flapping.
 *
 * So this uses both: a wide gap between the two margins, and a dwell that
 * must elapse in the outer band before an unmount fires. Any scroll back
 * toward the section cancels the timer, so nothing thrashes.
 *
 *  - `BUILD_REACH = 1` viewport (or whatever the caller passed). Mount when
 *    the section is within that reach of the fold.
 *  - `RELEASE_MARGIN = 3` viewports on top of the build reach — so with the
 *    default the release band is at 4 viewports. Reading pace never sweeps a
 *    section out that fast and then back within the dwell, and a deliberate
 *    scroll-back inside the outer band cancels the timer anyway.
 *  - `UNMOUNT_DELAY_MS = 8000`. Even after crossing the outer band, the
 *    section has eight seconds to be scrolled back to before it disappears.
 *
 * ## Fallbacks
 *
 * Returns true when IntersectionObserver is unavailable, so an unsupported
 * browser gets every scene rather than none. `?3d=off` returns false and no
 * observer runs at all.
 */

/** How far ahead a section starts fetching its chunk, in viewports. */
const BUILD_REACH = 1;
/**
 * How much wider the release band is than the build band, in viewports.
 *
 * Derived from `buildReach` rather than pinned so a caller that widens the
 * build reach automatically gets a release that stays strictly outside it —
 * if the two ever met the section would unmount and remount in the same
 * frame, which is exactly the thrash the docstring above names.
 */
const RELEASE_MARGIN = 3;
/** How long the section must stay past the release band before unmount. */
const UNMOUNT_DELAY_MS = 8000;

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
    const el = ref.current;
    if (!el) return;
    /* ?3d=off. One return covers every scene on the site, because they all
       come through this gate. See lib/bisect.ts. */
    if (isOff("3d")) return;
    if (typeof IntersectionObserver === "undefined") return;

    const handheld = isHandheld();
    let unmountTimer: number | undefined;
    const cancelUnmount = () => {
      if (unmountTimer !== undefined) {
        window.clearTimeout(unmountTimer);
        unmountTimer = undefined;
      }
    };

    const buildObs = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          cancelUnmount();
          setNear(true);
        }
      },
      { rootMargin: `${buildReach * 100}% 0px` },
    );
    buildObs.observe(el);

    /* Desktop keeps the one-way behaviour: the release observer only runs on
       a handheld, which is where holding every scene at once is what killed
       the tab. On desktop, unmounting a scene the reader may pan back to
       costs a rebuild for no memory the browser was short of. */
    let releaseObs: IntersectionObserver | undefined;
    if (handheld) {
      releaseObs = new IntersectionObserver(
        (entries) => {
          const outside = entries.every((entry) => !entry.isIntersecting);
          if (outside) {
            /* Start the dwell. Only sections still outside the release band
               after UNMOUNT_DELAY_MS are actually unmounted. Any callback that
               reports inside cancels the timer, so a scroll back into the
               band before it fires keeps the scene mounted. */
            cancelUnmount();
            unmountTimer = window.setTimeout(() => {
              unmountTimer = undefined;
              setNear(false);
            }, UNMOUNT_DELAY_MS);
          } else {
            cancelUnmount();
          }
        },
        { rootMargin: `${(buildReach + RELEASE_MARGIN) * 100}% 0px` },
      );
      releaseObs.observe(el);
    }

    return () => {
      buildObs.disconnect();
      releaseObs?.disconnect();
      cancelUnmount();
    };
  }, [ref, buildReach]);

  return near;
}
