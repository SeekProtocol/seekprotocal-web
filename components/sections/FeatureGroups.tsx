"use client";

import { useState } from "react";
import { FEATURE_GROUPS } from "@/content/app-features";

/** The full feature set, grouped the way a player meets it. */
export default function FeatureGroups() {
  const [group, setGroup] = useState(0);
  const current = FEATURE_GROUPS[group];

  return (
    <div className="features">
      <div className="features-head">
        <div className="sec-head reveal">
          <p className="eyebrow">What is in there</p>
          <h2 className="t-h2">More than a map with coins on it</h2>
        </div>

        <div className="features-tabs" role="tablist" aria-label="Feature groups">
          {FEATURE_GROUPS.map((entry, i) => (
            <button
              key={entry.key}
              type="button"
              role="tab"
              aria-selected={i === group}
              className="features-tab"
              data-active={i === group || undefined}
              onClick={() => setGroup(i)}
            >
              <span className="t-mono-sm">{String(i + 1).padStart(2, "0")}</span>
              {entry.label}
            </button>
          ))}
        </div>
      </div>

      <div key={current.key} className="features-grid">
        {current.items.map((item, i) => (
          <article
            key={item.title}
            className="card card-hover card-spotlight feature-item"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <h3 className="t-h4">{item.title}</h3>
            <p className="t-small">{item.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
