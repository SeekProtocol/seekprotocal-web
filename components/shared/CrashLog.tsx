"use client";

import { useEffect } from "react";
import { record, recordBreadcrumb, recordReload } from "@/lib/crash-log";

/**
 * Writes uncaught errors and a position breadcrumb to local storage.
 *
 * Renders nothing. Mounted once from the layout so it is running before anything
 * on the page has had a chance to fail.
 *
 * The breadcrumb is what makes a memory kill legible. Safari gives no warning and
 * no event when it drops a tab, so the only record of where the reader was is one
 * written in advance. It is throttled to once every two seconds and only while
 * the page is visible, which is cheap enough to leave on and frequent enough that
 * the last entry is never more than two seconds stale.
 *
 * Read it at /en/diag on the same phone.
 */
export default function CrashLog() {
  useEffect(() => {
    /* Before anything else, and before the first breadcrumb below: if the page
       has just come back on its own, the breadcrumb still in storage is the
       last state before it went, and tick() is about to overwrite it. */
    recordReload();

    const onError = (event: ErrorEvent) => {
      record("error", event.message || "uncaught error", {
        source: event.filename ? `${event.filename}:${event.lineno}:${event.colno}` : undefined,
        stack: event.error?.stack,
      });
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      record(
        "rejection",
        reason instanceof Error ? reason.message : String(reason),
        { stack: reason instanceof Error ? reason.stack : undefined },
      );
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);

    let last = 0;
    let queued = false;
    /* localStorage.setItem is synchronous, and a diagnostic has no business
       landing in a scroll frame on the device it is diagnosing. Deferred to an
       idle slot, so the write happens between frames rather than inside one.
       requestIdleCallback is missing on older Safari; a timeout gets it out of
       the current task there, which is the part that matters. */
    const defer =
      typeof requestIdleCallback === "function"
        ? (fn: () => void) => requestIdleCallback(fn, { timeout: 1000 })
        : (fn: () => void) => window.setTimeout(fn, 0);

    const tick = () => {
      if (document.visibilityState !== "visible") return;
      const now = Date.now();
      if (now - last < 2000 || queued) return;
      last = now;
      queued = true;
      defer(() => {
        queued = false;
        recordBreadcrumb();
      });
    };
    /* scroll rather than an interval: the failure is bound to scrolling, and an
       idle tab has nothing worth recording. passive so it never delays a frame. */
    window.addEventListener("scroll", tick, { passive: true });
    /* pagehide is the mechanism, not a bonus. It fires when the document is told
       it is going — a refresh, a back tap, a link — and does not fire when the
       tab is killed. Stamping which one happened is the only way to tell a crash
       from a reader pressing refresh, because the navigation type that follows
       reads the same either way. Written synchronously on purpose: there is no
       idle slot left once this fires. */
    const onPageHide = (event: PageTransitionEvent) =>
      recordBreadcrumb(event.persisted ? "bfcache" : "unload");
    window.addEventListener("pagehide", onPageHide);
    tick();

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
      window.removeEventListener("scroll", tick);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, []);

  return null;
}
