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
    const tick = () => {
      if (document.visibilityState !== "visible") return;
      const now = Date.now();
      if (now - last < 2000) return;
      last = now;
      recordBreadcrumb();
    };
    /* scroll rather than an interval: the failure is bound to scrolling, and an
       idle tab has nothing worth recording. passive so it never delays a frame. */
    window.addEventListener("scroll", tick, { passive: true });
    /* pagehide fires on a normal navigation away, which a kill does not, so it is
       a bonus rather than the mechanism. */
    window.addEventListener("pagehide", recordBreadcrumb);
    tick();

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
      window.removeEventListener("scroll", tick);
      window.removeEventListener("pagehide", recordBreadcrumb);
    };
  }, []);

  return null;
}
