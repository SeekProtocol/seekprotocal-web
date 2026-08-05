import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSingleLanguageAlternates, OG_IMAGE } from "@/lib/seo";
import { CHAPTERS, WHITEPAPER_META, type Block } from "@/content/whitepaper";
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

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Whitepaper",
    description:
      "How Seek Protocol issues digital assets to real-world coordinates, verifies that someone was actually there, and settles it on Solana. Proof of location, architecture, token design and the attacks we defend against.",
    alternates: getSingleLanguageAlternates("/whitepaper"),
    openGraph: {
      title: "Seek Protocol Whitepaper",
      description:
        "Proof of location, architecture, token design, and an honest account of the attacks and limits.",
      url: "/en/whitepaper",
      images: [OG_IMAGE],
    },
    twitter: {
      title: "Seek Protocol Whitepaper",
      description:
        "Proof of location, architecture, token design, and an honest account of the attacks and limits.",
      images: [OG_IMAGE],
    },
  };
}

export default async function WhitepaperPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const entries = CHAPTERS.map((chapter) => ({
    id: chapter.id,
    index: chapter.index,
    title: chapter.title,
  }));

  return (
    <>
      <section className="page-head">
        <div className="grid-field" aria-hidden="true" />
        <div className="noise-layer" aria-hidden="true" />
        <div className="shell">
          <div className="page-head-inner">
            <p className="eyebrow">Whitepaper · {WHITEPAPER_META.version}</p>
            <h1 className="t-h1 page-head-title">
              Digital assets that live in <span className="text-gradient">a place</span>
            </h1>
            <p className="t-lead">
              The technical account of how Seek Protocol issues assets to
              coordinates, proves someone stood there, and settles it on-chain,
              including what the system cannot do.
            </p>
            <div className="wp-meta-row">
              <span className="chip">{WHITEPAPER_META.readingTime} read</span>
              <span className="chip">Updated {WHITEPAPER_META.updated}</span>
              <a
                href="https://seekprotocol.gitbook.io/seekprotocol"
                target="_blank"
                rel="noopener noreferrer"
                className="arrow-link"
              >
                Full docs on GitBook
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
              {CHAPTERS.map((chapter) => (
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
                  <p className="eyebrow eyebrow-center">Next</p>
                  <h2 className="t-h3 cta-band-title">See it running</h2>
                  <p className="t-body">
                    The ecosystem page shows the live network, and the roadmap
                    tracks what has shipped against what is next.
                  </p>
                  <div className="btn-row">
                    <Link href="/ecosystem" className="btn btn-brand">
                      Explore the ecosystem
                    </Link>
                    <Link href="/roadmap" className="btn btn-outline">
                      View roadmap
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
