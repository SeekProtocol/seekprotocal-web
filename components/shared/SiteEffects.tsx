"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isOff } from "@/lib/bisect";

/**
 * Page-wide micro-interactions, run from one place so pages can stay server
 * components and just use `.reveal` / `.card-spotlight` class names.
 *
 *  - reveal: releases elements as they scroll into view, staggered per group
 *  - spotlight: feeds pointer position into cards as --mx/--my
 *  - scroll progress: exposes --scroll-progress on <html> for reading bars
 */
export default function SiteEffects() {
  const pathname = usePathname();

  useEffect(() => {
    /* ?effects=off. Everything this component owns is observers and listeners
       that live for the life of the page: an IntersectionObserver per reveal, a
       MutationObserver over the whole body subtree, a ResizeObserver, and
       pointermove and scroll on the window. This is the switch that asks
       whether any of that is what the page cannot afford. Reveals are forced
       visible by the same flag in CSS, so the page still reads. */
    if (isOff("effects")) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // --- reveal on scroll -------------------------------------------------
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
    );

    const observe = () => {
      const groups = new Map<Element | null, number>();
      document.querySelectorAll<HTMLElement>(".reveal:not(.is-in)").forEach((el) => {
        if (reduced) {
          el.classList.add("is-in");
          return;
        }
        // Siblings inside the same container cascade rather than pop together.
        if (!el.style.getPropertyValue("--reveal-delay")) {
          const parent = el.parentElement;
          const index = groups.get(parent) ?? 0;
          groups.set(parent, index + 1);
          el.style.setProperty("--reveal-delay", `${Math.min(index, 6) * 90}ms`);
        }
        observer.observe(el);
      });
    };

    observe();

    /* Catch anything mounted after hydration (client islands, tab panels).
       The rescan is a `querySelectorAll` across the whole document plus a run
       of style writes, and it used to fire on every mutation anywhere. The
       scroll-scrubbed sections re-render their copy as they pass each stage,
       so it was running mid-scroll and showing up as a stutter at exactly the
       points where a stage changed. It is now coalesced into one rescan per
       frame, and only when nodes were actually added. */
    let rescanQueued = false;
    const mutation = new MutationObserver((records) => {
      if (rescanQueued) return;
      if (!records.some((record) => record.addedNodes.length > 0)) return;
      rescanQueued = true;
      requestAnimationFrame(() => {
        rescanQueued = false;
        observe();
      });
    });
    mutation.observe(document.body, { childList: true, subtree: true });

    // --- spotlight --------------------------------------------------------
    const onPointerMove = (event: PointerEvent) => {
      const card = (event.target as HTMLElement | null)?.closest<HTMLElement>(
        ".card-spotlight"
      );
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    // --- scroll progress --------------------------------------------------
    /* `scrollHeight` is a layout-forcing read, and it was being taken on every
       scroll frame. By then the scrubbed sections have already written their
       own custom properties, so the read flushed a synchronous layout of the
       whole document, every frame, on a page that is 25,000px tall and carries
       five WebGL contexts. It was the single largest cost in a scroll frame.

       The document does not change height while you scroll, so it is measured
       once and re-measured only when something could have changed it. */
    let scrollable = 0;
    const measure = () => {
      scrollable = document.documentElement.scrollHeight - window.innerHeight;
    };
    measure();

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const y = window.scrollY;
        const root = document.documentElement;
        root.style.setProperty(
          "--scroll-progress",
          (scrollable > 0 ? y / scrollable : 0).toFixed(4)
        );
        const scrolled = y > 12;
        if (scrolled !== root.classList.contains("is-scrolled")) {
          root.classList.toggle("is-scrolled", scrolled);
        }
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Re-measure when the document could have changed height. Coalesced, and
    // never during a scroll frame's write phase.
    let measureQueued = false;
    const queueMeasure = () => {
      if (measureQueued) return;
      measureQueued = true;
      requestAnimationFrame(() => {
        measureQueued = false;
        measure();
      });
    };
    window.addEventListener("resize", queueMeasure);
    const heightObserver = new ResizeObserver(queueMeasure);
    heightObserver.observe(document.documentElement);

    return () => {
      observer.disconnect();
      mutation.disconnect();
      heightObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", queueMeasure);
    };
  }, [pathname]);

  return null;
}
