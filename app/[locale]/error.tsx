"use client";

import { useEffect } from "react";

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
 * be able to report. English only for the same reason.
 *
 * The message and digest are shown on purpose. Next strips server-side error
 * messages in production, but a client-side exception keeps its text, and that
 * text is the difference between a bug report saying "it crashed" and one that
 * names the line. If that is ever felt to be too much for a visitor to see, hide
 * the block behind a details element rather than removing it.
 */
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
  }, [error]);

  return (
    <section className="page-head">
      <div className="grid-field" aria-hidden="true" />
      <div className="noise-layer" aria-hidden="true" />
      <div className="shell">
        <div className="page-head-inner">
          <p className="eyebrow">Something broke</p>
          <h1 className="t-h1 page-head-title">
            This page stopped <span className="text-gradient">halfway</span>
          </h1>
          <p className="t-lead">
            Not your connection. Something in the page threw an error and could
            not finish drawing. Trying again usually works, and the details below
            are what we need to stop it happening twice.
          </p>

          <div className="btn-row" style={{ marginTop: "2rem" }}>
            <button type="button" onClick={reset} className="btn btn-brand btn-lg">
              Try again
            </button>
            {/* A plain anchor, not next/link, and on purpose. A Link navigates
                through the same router that has just failed; a full document
                load is the thing most likely to actually get the reader out. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/en" className="btn btn-outline btn-lg">
              Back to the homepage
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
            {error.message || "No message was attached to the error."}
          </pre>
        </div>
      </div>
    </section>
  );
}
