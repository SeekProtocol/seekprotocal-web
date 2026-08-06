"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { isHandheld } from "@/lib/render-budget";

/**
 * The scroll position is the target, not the value.
 *
 * Read straight through, a trackpad flick or a mouse wheel's discrete notches
 * land on the scene unfiltered and it moves in the same steps the input arrives
 * in. This eases toward the scroll position instead: the scroll says where to
 * be and the scene glides there, which is the whole difference between a
 * scrubbed section that feels expensive and one that feels stepped.
 *
 * Both scroll-scrubbed sections on the site run through here, so the descent
 * and the AR story share one implementation and one feel.
 */

type Options = {
  /** The tall section whose scroll range drives the scene. */
  sectionRef: RefObject<HTMLElement | null>;
  /** Written every frame with the eased progress. The scene reads it. */
  progressRef: RefObject<number>;
  /** The `at` value of each stage, ascending. */
  stops: number[];
  /** Called every frame with the eased progress, for CSS custom properties. */
  onProgress?: (p: number) => void;
  /** Where to pin when the reader has asked for reduced motion. */
  restingProgress?: number;
  /** Which stage that resting position corresponds to. */
  restingStage?: number;
  /**
   * How hard the value chases the scroll, per 60 Hz frame. Lower is smoother
   * and laggier; much above 0.25 stops being worth doing at all.
   */
  follow?: number;
};

export function useScrubbedSection({
  sectionRef,
  progressRef,
  stops,
  onProgress,
  restingProgress = 0.5,
  restingStage = 0,
  follow = 0.16,
}: Options) {
  const [stage, setStage] = useState(0);
  // Read inside the loop, which is set up once, so they are mirrored rather
  // than closed over.
  const onProgressRef = useRef(onProgress);
  const stopsRef = useRef(stops);
  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);
  useEffect(() => {
    stopsRef.current = stops;
  }, [stops]);

  /* Both sections this drives are display: none on a handheld (.scene-scrubbed),
     so everything below is work done for something nobody can see. Tracked as
     state rather than read once, because an iPad rotated into landscape crosses
     the 1024px edge and the section becomes real: the listener is what notices.
     Only the listener sets it — the initial value is already known here. */
  const [handheld, setHandheld] = useState(isHandheld);
  useEffect(() => {
    const check = () => setHandheld(isHandheld());
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    /* Nothing to scrub, and more to the point nothing to measure. Left running,
       this attaches a scroll listener that calls getBoundingClientRect on every
       event, for each of the two sections, on the one device that cannot afford
       it. The rect on a display: none element is all zeros, so `scrollable`
       comes out negative and measure() returns having done nothing but force
       the layout — and it forces a full one, because SiteEffects writes
       --scroll-progress to the document element on the frame before it. */
    if (handheld) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      progressRef.current = restingProgress;
      onProgressRef.current?.(restingProgress);
      // Deferred a frame rather than set in the effect body: a synchronous
      // setState there is a cascading render, and nothing is animating anyway.
      const id = requestAnimationFrame(() => setStage(restingStage));
      return () => cancelAnimationFrame(id);
    }

    let target = 0;
    let shown = -1;
    let raf = 0;
    let last = performance.now();

    const measure = () => {
      const rect = section.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      if (scrollable <= 0) return;
      target = Math.min(1, Math.max(0, -rect.top / scrollable));
    };

    const frame = () => {
      raf = requestAnimationFrame(frame);
      const now = performance.now();
      const delta = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (shown < 0) shown = target;
      /* The frame-rate independent form of a lerp. Without the exponent a
         120 Hz screen converges twice as fast as a 60 Hz one and the section
         is a different animation on different hardware. */
      shown += (target - shown) * (1 - Math.pow(1 - follow, delta * 60));
      // Close enough is close enough: stop writing once it has settled.
      if (Math.abs(target - shown) < 0.00015) shown = target;

      progressRef.current = shown;
      onProgressRef.current?.(shown);

      const list = stopsRef.current;
      let next = 0;
      for (let i = 0; i < list.length; i++) if (shown >= list[i]) next = i;
      setStage((prev) => {
        if (prev === next) return prev;
        // A little hysteresis. Resting the scroll exactly on a threshold
        // otherwise flips the copy back and forth.
        const edge = list[Math.max(prev, next)];
        return Math.abs(shown - edge) < 0.004 ? prev : next;
      });
    };

    measure();
    shown = target;
    frame();

    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);

    /* The loop only runs while the section is anywhere near view. Measuring
       stays live either way: gating the measure on visibility meant the scroll
       that brought the section into view was consumed before the observer had
       turned the loop back on, and the target stayed where it was until the
       next scroll event. */
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !raf) {
          measure();
          shown = target;
          last = performance.now();
          frame();
        } else if (!entry.isIntersecting && raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(section);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [sectionRef, progressRef, restingProgress, restingStage, follow, handheld]);

  return stage;
}
