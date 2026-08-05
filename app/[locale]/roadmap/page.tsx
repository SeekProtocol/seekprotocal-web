import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getMultilingualAlternates, OG_IMAGE, getBreadcrumbJsonLd } from "@/lib/seo";
import { PHASES } from "@/content/roadmap";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "roadmapPage" });
  const description = t("metaDescription");

  return {
    title: t("metaTitle"),
    description,
    alternates: getMultilingualAlternates("/roadmap", locale),
    openGraph: {
      title: t("ogTitle"),
      description,
      url: `/${locale}/roadmap`,
      images: [OG_IMAGE],
    },
    twitter: {
      title: t("ogTitle"),
      description,
      images: [OG_IMAGE],
    },
  };
}

const breadcrumbJsonLd = getBreadcrumbJsonLd([
  { name: "Roadmap", path: "/roadmap" },
]);

export default async function RoadmapPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <RoadmapContent />;
}

function RoadmapContent() {
  const t = useTranslations("roadmapPage");
  const phases = useTranslations("roadmapPhases");

  /* Counted off PHASES rather than written out, because the copy said "Five
     phases" while the timeline rendered four. */
  const shipped = PHASES.flatMap((p) => p.items).filter((i) => i.done).length;
  const total = PHASES.flatMap((p) => p.items).length;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <section className="page-head">
        <div className="grid-field" aria-hidden="true" />
        <div className="noise-layer" aria-hidden="true" />
        <div className="shell">
          <div className="page-head-inner">
            <p className="eyebrow">{t("eyebrow")}</p>
            <h1 className="t-h1 page-head-title">
              {t("titleStart")} <span className="text-gradient">{t("titleAccent")}</span>
            </h1>
            <p className="t-lead">
              {t("lead", { phases: PHASES.length, shipped, total })}
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="roadmap-layout">
            <div className="timeline">
              {PHASES.map((phase) => (
                <article
                  key={phase.id}
                  className="timeline-phase reveal"
                  data-status={phase.status}
                >
                  <span className="timeline-marker" aria-hidden="true" />
                  <div>
                    <div className="timeline-head">
                      <span className="t-mono">{phase.period}</span>
                      <span
                        className={`chip ${phase.status === "active" ? "chip-brand" : ""}`}
                      >
                        {t(`status.${phase.status}`)}
                      </span>
                    </div>
                    <h2 className="t-h2 timeline-title">{phases(`${phase.id}.title`)}</h2>
                    <p className="t-body" style={{ marginTop: "0.75rem", maxWidth: "40rem" }}>
                      {phases(`${phase.id}.summary`)}
                    </p>
                    <ul className="timeline-items">
                      {phase.items.map((item) => (
                        <li
                          key={item.id}
                          className="timeline-item"
                          data-done={item.done || undefined}
                          data-group={item.group || undefined}
                        >
                          {item.group && (
                            <span className="t-mono timeline-group">
                              {phases(`${phase.id}.groups.${item.group}`)}
                            </span>
                          )}
                          {phases(`${phase.id}.items.${item.id}`)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>

            <aside className="roadmap-aside">
              <div className="card roadmap-note">
                <p className="t-mono" style={{ marginBottom: "0.75rem" }}>
                  {t("datesTitle")}
                </p>
                <p className="t-small">{t("datesNote")}</p>
              </div>
              <div className="card roadmap-note">
                <p className="t-mono" style={{ marginBottom: "0.75rem" }}>
                  {t("legendTitle")}
                </p>
                <ul className="roadmap-legend">
                  <li>
                    <span className="roadmap-legend-dot" data-status="done" /> {t("status.done")}
                  </li>
                  <li>
                    <span className="roadmap-legend-dot" data-status="active" /> {t("status.active")}
                  </li>
                  <li>
                    <span className="roadmap-legend-dot" data-status="next" /> {t("status.next")}
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="cta-band reveal">
            <div className="cta-band-inner">
              <p className="eyebrow eyebrow-center">{t("ctaEyebrow")}</p>
              <h2 className="t-h2 cta-band-title">{t("ctaTitle")}</h2>
              <p className="t-body">{t("ctaBody")}</p>
              <div className="btn-row">
                <Link href="/whitepaper" className="btn btn-brand">
                  {t("ctaWhitepaper")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
