import Image from "next/image";
import type { CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { listCopy, withCopy } from "@/lib/content-i18n";
import { ScreenSlides, TabletLandscape } from "@/components/app/DeviceMockups";
import { ARENA_FACTS, ARENA_FEATURES, ARENA_SLIDES } from "@/content/devices";

/**
 * Seek Arena, the card battler inside the app, on the iPad it was laid out
 * for in landscape. The screens are real iPad captures of the app (a match on
 * a critical hit, the opening hand, a Mythic pull, the season), taking turns;
 * the captions under the device follow them on the same timer.
 */
export default function ArenaSection() {
  const t = useTranslations("arenaSection");
  const features = withCopy(t, ARENA_FEATURES, ["title", "body"]);
  const facts = withCopy(t, ARENA_FACTS, ["label"]);
  const slides = withCopy(t, ARENA_SLIDES, ["caption"]);

  return (
    <div className="arena" id="seek-arena">
      <div className="arena-head">
        <div className="sec-head reveal">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h2 className="t-h2">{t("title")}</h2>
          <p className="t-lead" style={{ marginTop: "1.25rem" }}>
            {t("lead")}
          </p>
          <ul className="showcase-points">
            {listCopy(t, "points").map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>

        <div className="arena-stage reveal">
          <span className="arena-stage-glow" aria-hidden="true" />
          <TabletLandscape label={t("tabletLabel")}>
            <ScreenSlides slides={ARENA_SLIDES} sizes="(max-width: 768px) 100vw, 640px" position="50% 58%" />
          </TabletLandscape>
          <ol className="slide-captions" data-count={slides.length} aria-hidden="true">
            {slides.map((slide, i) => (
              <li key={slide.id} style={{ ["--i" as string]: i } as CSSProperties}>
                {slide.caption}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <dl className="arena-facts reveal">
        {facts.map((fact) => (
          <div key={fact.id}>
            <dt>{fact.label}</dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
      </dl>

      <div className="arena-features">
        {features.map((feature, i) => (
          <article
            key={feature.id}
            className="arena-feature reveal"
            style={{ ["--reveal-delay" as string]: `${i * 70}ms` }}
          >
            <Image src={feature.mark} alt="" width={64} height={64} className="arena-feature-mark" />
            <h3 className="arena-feature-title">{feature.title}</h3>
            <p className="t-body">{feature.body}</p>
          </article>
        ))}
      </div>

      <div className="reveal arena-cta">
        <Link href="/shop" prefetch={false} className="arrow-link">
          {t("cta")}
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path
              d="M3 8h10m0 0l-4-4m4 4l-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}
