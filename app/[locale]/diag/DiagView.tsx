"use client";

import { useCallback, useEffect, useState } from "react";
import { clearCrashLog, readCrashLog, type CrashEntry } from "@/lib/crash-log";

/**
 * Renders whatever the crash log holds, with a button that copies the lot.
 *
 * Read on the client after mount rather than during render: localStorage does not
 * exist on the server, and a value that differs between the two would be a
 * hydration mismatch.
 */
export default function DiagView() {
  const [entries, setEntries] = useState<CrashEntry[] | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(() => setEntries(readCrashLog()), []);
  /* The cascading render the rule warns about is the intent. localStorage does
     not exist on the server, so the first render has to be the null placeholder
     and the read has to happen after mount; doing it during render would be a
     hydration mismatch. One extra pass, once, on a page nobody but us opens. */
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(load, [load]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(entries, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* Clipboard needs a secure context and a gesture; the text is on screen
         either way, so a failure here costs nothing. */
    }
  };

  return (
    <section className="page-head">
      <div className="shell">
        <div className="page-head-inner">
          <p className="eyebrow">Diagnostics</p>
          <h1 className="t-h1 page-head-title">Crash log</h1>
          <p className="t-lead">
            Errors and the last known position, kept on this device only. Nothing
            here is sent anywhere. Newest first.
          </p>

          <div className="btn-row" style={{ marginTop: "1.75rem", flexWrap: "wrap" }}>
            <button type="button" className="btn btn-brand" onClick={copy}>
              {copied ? "Copied" : "Copy all"}
            </button>
            <button type="button" className="btn btn-outline" onClick={load}>
              Refresh
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                clearCrashLog();
                load();
              }}
            >
              Clear
            </button>
          </div>

          {entries === null ? (
            <p className="t-small" style={{ marginTop: "2rem" }}>
              Reading…
            </p>
          ) : entries.length === 0 ? (
            <p className="t-small" style={{ marginTop: "2rem" }}>
              Nothing recorded yet. Reproduce the problem, then come back to this
              page. A reload does not clear it.
            </p>
          ) : (
            <div style={{ marginTop: "2rem", display: "grid", gap: "1rem" }}>
              {entries.map((e, i) => (
                <pre
                  key={`${e.at}-${i}`}
                  style={{
                    margin: 0,
                    padding: "0.9rem 1rem",
                    border: "1px solid var(--line)",
                    borderRadius: 12,
                    background: "var(--bg-sunken)",
                    color: "var(--fg-muted)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.75rem",
                    lineHeight: 1.65,
                    whiteSpace: "pre-wrap",
                    overflowX: "auto",
                  }}
                >
{`${e.kind.toUpperCase()}  ${e.at}
${e.message}
${e.source ? `at ${e.source}\n` : ""}url        ${e.url}
scrollY    ${e.scrollY}
viewport   ${e.viewport} @ ${e.dpr}x
canvases   ${e.canvases}  (${e.megapixels} MP of drawing buffer)
exit       ${e.exit ?? "not recorded"}
build      ${e.deployment ?? "not recorded"}${
  e.memoryMB !== undefined ? `\nJS heap    ${e.memoryMB} MB` : ""
}${e.stack ? `\n\n${e.stack}` : ""}`}
                </pre>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
