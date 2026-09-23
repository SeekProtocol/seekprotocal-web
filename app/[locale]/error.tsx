"use client";

import { useEffect, useSyncExternalStore } from "react";
import { record } from "@/lib/crash-log";
import { routeErrorCopy } from "@/lib/route-error-copy";

/**
 * Route-level error boundary.
 *
 * Without one of these, an unhandled exception in any client component takes the
 * whole route down to Next's bare fallback: a white page reading "Application
 * error: a client-side exception has occurred". That is what a reader hitting the
 * globe crash was seeing. A boundary cannot prevent the exception, but it keeps
 * the header, the footer and a way out, and it turns a dead end into something
 * the reader can retry.
 *
 * Deliberately free of dependencies. No useTranslations, no data, no icons. An
 * error boundary that needs anything to render is a boundary that can fail while
 * reporting a failure, and a missing message key is one of the things it has to
 * be able to report. For the same reason its copy is not in messages/*.json but
 * in lib/route-error-copy.ts, plain data with no imports, and the locale is
 * read off the URL rather than asked of next-intl. A locale without an entry
 * there reads English.
 *
 * The message and digest are shown on purpose. Next strips server-side error
 * messages in production, but a client-side exception keeps its text, and that
 * text is the difference between a bug report saying "it crashed" and one that
 * names the line. If that is ever felt to be too much for a visitor to see, hide
 * the block behind a details element rather than removing it.
 */
const noSubscription = () => () => {};
const readPathname = () => window.location.pathname;
/* Null on the server, so the server render and the hydration pass agree on
   English; the client then settles on the real path straight after. */
const serverPathname = () => null;

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Goes to the browser console, and to Vercel's log drain if one is attached.
    console.error("[route error]", error.digest ?? "", error.message, error.stack);
    /* And to local storage, which is the only one of the three that survives a
       tap on "try again" or a swipe away. Read it back at /en/diag. */
    record("boundary", error.message || "route error", {
      source: error.digest ? `digest ${error.digest}` : undefined,
      stack: error.stack,
    });
  }, [error]);

  const pathname = useSyncExternalStore(noSubscription, readPathname, serverPathname);
  const { locale, copy } = routeErrorCopy(pathname);

  return (
    <section className="page-head">
      <div className="grid-field" aria-hidden="true" />
      <div className="noise-layer" aria-hidden="true" />
      <div className="shell">
        <div className="page-head-inner">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1 className="t-h1 page-head-title">
            {copy.titleStart}
            <span className="text-gradient">{copy.titleEmphasis}</span>
            {copy.titleEnd}
          </h1>
          <p className="t-lead">{copy.lead}</p>

          <div className="btn-row" style={{ marginTop: "2rem" }}>
            <button type="button" onClick={reset} className="btn btn-brand btn-lg">
              {copy.tryAgain}
            </button>
            {/* A plain anchor, not next/link, and on purpose. A Link navigates
                through the same router that has just failed; a full document
                load is the thing most likely to actually get the reader out. */}
            <a href={`/${locale}`} className="btn btn-outline btn-lg">
              {copy.home}
            </a>
          </div>

          <pre
            style={{
              marginTop: "2.5rem",
              padding: "1rem 1.15rem",
              border: "1px solid var(--line)",
              borderRadius: "var(--radius-md, 12px)",
              background: "var(--bg-sunken)",
              color: "var(--fg-muted)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.8125rem",
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
              overflowX: "auto",
              maxWidth: "48rem",
            }}
          >
            {error.digest ? `digest ${error.digest}\n` : ""}
            {error.message || copy.noMessage}
          </pre>
        </div>
      </div>
    </section>
  );
}
