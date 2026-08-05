"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FEATURE_GROUPS } from "@/content/app-features";

type FeatureItem = { title: string; body: string };

/** The full feature set, grouped the way a player meets it. */
export default function FeatureGroups() {
  const t = useTranslations("featureGroups");
  const [group, setGroup] = useState(0);
  const current = FEATURE_GROUPS[group];
  const items = t.raw(`${current.key}.items`) as FeatureItem[];

  return (
    <div className="features">
      <div className="features-head">
        <div className="sec-head reveal">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h2 className="t-h2">{t("title")}</h2>
        </div>

        <div className="features-tabs" role="tablist" aria-label={t("tablist")}>
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
              {t(`${entry.key}.label`)}
            </button>
          ))}
        </div>
      </div>

      <div key={current.key} className="features-grid">
        {items.map((item, i) => (
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
