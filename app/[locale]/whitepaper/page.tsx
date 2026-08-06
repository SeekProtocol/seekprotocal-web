import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getMultilingualAlternates, OG_IMAGE, getBreadcrumbJsonLd, getOpenGraph } from "@/lib/seo";
import { CHAPTER_IDS, WHITEPAPER_META, type Block, type Chapter } from "@/content/whitepaper";
import ReaderChrome from "@/components/whitepaper/ReaderChrome";
import TokenomicsDonut from "@/components/whitepaper/TokenomicsDonut";
import StackDiagram from "@/components/whitepaper/StackDiagram";
import ConfidenceMeter from "@/components/whitepaper/ConfidenceMeter";
import EconomyLoop from "@/components/whitepaper/EconomyLoop";
import ArrivalCalculator from "@/components/whitepaper/ArrivalCalculator";
import ClaimTimeline from "@/components/whitepaper/ClaimTimeline";
import CatchLadder from "@/components/whitepaper/CatchLadder";
import VestingSchedule from "@/components/whitepaper/VestingSchedule";
import Glossary from "@/components/whitepaper/Glossary";
import RichText from "@/components/whitepaper/RichText";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "whitepaper" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: getMultilingualAlternates("/whitepaper", locale),
    openGraph: getOpenGraph({
      title: t("ogTitle"),
      description: t("ogDescription"),
      path: `/${locale}/whitepaper`,
      locale,
    }),
    twitter: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      images: [OG_IMAGE],
    },
  };
}

const breadcrumbJsonLd = getBreadcrumbJsonLd([
  { name: "Whitepaper", path: "/whitepaper" },
]);

export default async function WhitepaperPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <WhitepaperContent />;
}

function WhitepaperContent() {
  const t = useTranslations("whitepaper");

  const chapters: Chapter[] = CHAPTER_IDS.map((id) => ({
    id,
    ...(t.raw(`chapters.${id}`) as Omit<Chapter, "id">),
  }));

  const entries = chapters.map((chapter) => ({
    id: chapter.id,
    index: chapter.index,
    title: chapter.title,
  }));

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
            <p className="eyebrow">
              {t("eyebrow")} · {WHITEPAPER_META.version}
            </p>
            <h1 className="t-h1 page-head-title">
              {t("titleStart")} <span className="text-gradient">{t("titleAccent")}</span>
            </h1>
            <p className="t-lead">{t("lead")}</p>
            <div className="wp-meta-row">
              <span className="chip">
                {t("readingTime", { minutes: WHITEPAPER_META.readingMinutes })}
              </span>
              <span className="chip">{t("updated", { date: t("updatedValue") })}</span>
              <a
                href="https://seekprotocol.gitbook.io/seekprotocol"
                target="_blank"
                rel="noopener noreferrer"
                className="arrow-link"
              >
                {t("gitbook")}
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                  <path
                    d="M3 11L11 3M11 3H5M11 3v6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="wp-layout">
            <ReaderChrome entries={entries} />

            <div className="wp-body" id="wp-body">
              {chapters.map((chapter) => (
                <article key={chapter.id} id={chapter.id} className="wp-chapter">
                  <header className="wp-chapter-head reveal">
                    <p className="t-mono">
                      {chapter.index} · {chapter.eyebrow}
                    </p>
                    <h2 className="t-h2 wp-chapter-title">{chapter.title}</h2>
                  </header>
                  <div className="wp-prose">
                    {chapter.blocks.map((block, i) => (
                      <BlockView key={i} block={block} />
                    ))}
                  </div>
                </article>
              ))}

              <div className="cta-band wp-end-cta">
                <div className="cta-band-inner">
                  <p className="eyebrow eyebrow-center">{t("ctaEyebrow")}</p>
                  <h2 className="t-h3 cta-band-title">{t("ctaTitle")}</h2>
                  <p className="t-body">{t("ctaBody")}</p>
                  <div className="btn-row">
                    <Link href="/ecosystem" className="btn btn-brand">
                      {t("ctaEcosystem")}
                    </Link>
                    <Link href="/roadmap" className="btn btn-outline">
                      {t("ctaRoadmap")}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case "p":
      return (
        <p className="reveal">
          <RichText text={block.text} />
        </p>
      );
    case "h":
      return <h3 className="t-h3 reveal">{block.text}</h3>;
    case "list":
      return (
        <ul className="reveal">
          {block.items.map((item, i) => (
            <li key={i}>
              <RichText text={item} />
            </li>
          ))}
        </ul>
      );
    case "callout":
      return (
        <aside className="wp-callout reveal">
          <p>
            <RichText text={block.text} />
          </p>
        </aside>
      );
    case "specs":
      return (
        <div className="wp-specs reveal">
          {block.rows.map((row) => (
            <div key={row.label} className="wp-spec-row">
              <span className="t-mono">{row.label}</span>
              <span className="wp-spec-value">{row.value}</span>
            </div>
          ))}
        </div>
      );
    case "tokenomics":
      return <TokenomicsDonut />;
    case "stack":
      return <StackDiagram />;
    case "confidence":
      return <ConfidenceMeter />;
    case "economy":
      return <EconomyLoop />;
    case "calculator":
      return <ArrivalCalculator />;
    case "timeline":
      return <ClaimTimeline />;
    case "catch":
      return <CatchLadder />;
    case "vesting":
      return <VestingSchedule />;
    case "glossary":
      return <Glossary />;
    default:
      return null;
  }
}
