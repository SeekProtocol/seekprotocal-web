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
 *  - header state: marks the document once it has moved below the top edge
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

    // --- header state -----------------------------------------------------
    /* This used to write --scroll-progress to <html> on every scroll frame,
       even though no stylesheet reads that variable. A custom property on the
       root is inherited, so WebKit can invalidate style across the entire
       33,000px document for an unused value. That is particularly costly on
       iOS when Reduce Motion leaves fewer sections on compositor layers.

       The only live consumer of page-wide scroll state is the header. It needs
       one class change when the reader crosses 12px, not a root style mutation
       for every pixel travelled. */
    let scrolled = document.documentElement.classList.contains("is-scrolled");
    const onScroll = () => {
      const next = window.scrollY > 12;
      if (next === scrolled) return;
      scrolled = next;
      document.documentElement.classList.toggle("is-scrolled", next);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      mutation.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  return null;
}
