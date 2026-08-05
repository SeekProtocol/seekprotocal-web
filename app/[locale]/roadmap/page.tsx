import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSingleLanguageAlternates, OG_IMAGE, getBreadcrumbJsonLd } from "@/lib/seo";
import { PHASES, ROADMAP_NOTE } from "@/content/roadmap";

const DESCRIPTION =
  "What Seek Protocol has shipped and what comes next, from the proof-of-location prototype through the public SeekAR launch to the self-serve business portal and on-chain governance.";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Roadmap: Shipped and What Comes Next",
    description: DESCRIPTION,
    alternates: getSingleLanguageAlternates("/roadmap"),
    openGraph: {
      title: "Seek Protocol roadmap",
      description: DESCRIPTION,
      url: "/en/roadmap",
      images: [OG_IMAGE],
    },
    twitter: {
      title: "Seek Protocol roadmap",
      description: DESCRIPTION,
      images: [OG_IMAGE],
    },
  };
}

/* Read off PHASES rather than written out, because the copy said "Five phases"
   while the timeline rendered four. */
const PHASE_WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven"];
const PHASE_COUNT_WORD = PHASE_WORDS[PHASES.length] ?? String(PHASES.length);

const STATUS_LABEL: Record<string, string> = {
  done: "Shipped",
  active: "In progress",
  next: "Planned",
};

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
            <p className="eyebrow">Roadmap</p>
            <h1 className="t-h1 page-head-title">
              What is built, and what is <span className="text-gradient">next</span>
            </h1>
            <p className="t-lead">
              {PHASE_COUNT_WORD} phases, tracked against what has actually
              shipped. {shipped} of {total} milestones complete.
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
                        {STATUS_LABEL[phase.status]}
                      </span>
                    </div>
                    <h2 className="t-h2 timeline-title">{phase.title}</h2>
                    <p className="t-body" style={{ marginTop: "0.75rem", maxWidth: "40rem" }}>
                      {phase.summary}
                    </p>
                    <ul className="timeline-items">
                      {phase.items.map((item) => (
                        <li
                          key={item.text}
                          className="timeline-item"
                          data-done={item.done || undefined}
                          data-group={item.group || undefined}
                        >
                          {item.group && (
                            <span className="t-mono timeline-group">{item.group}</span>
                          )}
                          {item.text}
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
                  On these dates
                </p>
                <p className="t-small">{ROADMAP_NOTE}</p>
              </div>
              <div className="card roadmap-note">
                <p className="t-mono" style={{ marginBottom: "0.75rem" }}>
                  Legend
                </p>
                <ul className="roadmap-legend">
                  <li>
                    <span className="roadmap-legend-dot" data-status="done" /> Shipped
                  </li>
                  <li>
                    <span className="roadmap-legend-dot" data-status="active" /> In progress
                  </li>
                  <li>
                    <span className="roadmap-legend-dot" data-status="next" /> Planned
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
              <p className="eyebrow eyebrow-center">Detail</p>
              <h2 className="t-h2 cta-band-title">The reasoning behind the order</h2>
              <p className="t-body">
                The whitepaper explains why verification came before scale, and
                why governance comes last.
              </p>
              <div className="btn-row">
                <Link href="/whitepaper" className="btn btn-brand">
                  Read the whitepaper
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
