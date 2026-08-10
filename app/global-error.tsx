"use client";

import { useEffect } from "react";
import { record } from "@/lib/crash-log";

/**
 * The last boundary, for errors thrown by the root layout itself.
 *
 * This one replaces the whole document, which is why it has to render its own
 * html and body: at the point it runs, the layout that would normally provide
 * them is the thing that failed. That also means none of the site's CSS is
 * loaded, so the styling here is inline and plain on purpose.
 *
 * The route-level boundary in [locale]/error.tsx catches everything inside a
 * page and is the one a reader will normally meet. This exists so that even a
 * failure in the layout, the theme script or the intl provider lands on a page
 * with words on it rather than a blank tab.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global error]", error.digest ?? "", error.message, error.stack);
    /* Written to local storage as well. This boundary replaces the document, so
       the console is the only other record and it does not survive the reload
       the reader is about to do. Read it back at /en/diag. */
    record("boundary", error.message || "global error", {
      source: error.digest ? `digest ${error.digest}` : undefined,
      stack: error.stack,
    });
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "2rem",
          background: "#000",
          color: "#fff",
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        <main style={{ maxWidth: "34rem" }}>
          <p
            style={{
              margin: 0,
              fontSize: "0.75rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#9096a6",
            }}
          >
            Seekprotocol
          </p>
          <h1 style={{ margin: "0.75rem 0 0", fontSize: "1.75rem", lineHeight: 1.2 }}>
            The page could not load
          </h1>
          <p style={{ color: "#9096a6", lineHeight: 1.6 }}>
            Something failed before the site could start. Reloading usually
            clears it.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={reset}
              style={{
                padding: "0.7rem 1.4rem",
                borderRadius: 999,
                border: 0,
                background: "#2dabff",
                color: "#000",
                font: "inherit",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            {/* Has to be an anchor here: this boundary replaces the document,
                so there is no router left to navigate through. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/en"
              style={{
                padding: "0.7rem 1.4rem",
                borderRadius: 999,
                border: "1px solid #2a2a33",
                color: "#fff",
                font: "inherit",
                textDecoration: "none",
              }}
            >
              Homepage
            </a>
          </div>
          <pre
            style={{
              marginTop: "2rem",
              padding: "0.9rem 1rem",
              border: "1px solid #2a2a33",
              borderRadius: 12,
              background: "#08080b",
              color: "#9096a6",
              fontSize: "0.78rem",
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
              overflowX: "auto",
            }}
          >
            {error.digest ? `digest ${error.digest}\n` : ""}
            {error.message || "No message was attached to the error."}
          </pre>
        </main>
      </body>
    </html>
  );
}
