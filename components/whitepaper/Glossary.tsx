"use client";

import { useMemo, useState } from "react";
import { GLOSSARY } from "@/content/whitepaper";

/**
 * The terms, filterable.
 *
 * A glossary at the end of a thirty-minute document is only useful if you can
 * get to the one word you came back for, so it takes a query and matches on the
 * definition as well as the term. Someone who half-remembers "the pity thing"
 * finds the cold streak.
 */
export default function Glossary() {
  const [query, setQuery] = useState("");

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return GLOSSARY;
    return GLOSSARY.filter(
      (entry) =>
        entry.term.toLowerCase().includes(q) ||
        entry.definition.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="wp-figure glossary">
      <div className="glossary-head">
        <p className="t-mono">{GLOSSARY.length} terms</p>
        <label className="glossary-search">
          <span className="sr-only">Filter terms</span>
          <SearchIcon />
          <input
            type="search"
            value={query}
            placeholder="Filter"
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>

      <dl className="glossary-list">
        {shown.map((entry) => (
          <div key={entry.term} className="glossary-entry">
            <dt>{entry.term}</dt>
            <dd className="t-small">{entry.definition}</dd>
          </div>
        ))}
      </dl>

      {shown.length === 0 && (
        <p className="t-small glossary-empty">
          Nothing matches that. The document itself is searchable with your
          browser&apos;s own find.
        </p>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.4 15.4 20 20" />
    </svg>
  );
}
