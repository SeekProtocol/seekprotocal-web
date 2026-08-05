import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { baseUrl, getSingleLanguageAlternates, OG_IMAGE } from "@/lib/seo";
import { CAPABILITIES, FAQ, PARTICIPANTS } from "@/content/ecosystem";
import GlobeSection from "@/components/sections/GlobeSection";
import Accordion from "@/components/ui/Accordion";

const DESCRIPTION =
  "How the Seek Protocol ecosystem fits together: seekers who collect, publishers who place, and the protocol that verifies presence and settles it on Solana.";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Ecosystem",
    description: DESCRIPTION,
    alternates: getSingleLanguageAlternates("/ecosystem"),
    openGraph: {
      title: "Three parties, one coordinate",
      description: DESCRIPTION,
      url: "/en/ecosystem",
      images: [OG_IMAGE],
    },
    twitter: {
      title: "Three parties, one coordinate",
      description: DESCRIPTION,
      images: [OG_IMAGE],
    },
  };
}

/**
 * The page already answers these questions in an accordion. Restating them as
 * FAQPage is what makes them eligible for a SERP rich result, and it is the one
 * form an answer engine can lift verbatim rather than paraphrase.
 */
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${baseUrl}/en/ecosystem#faq`,
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export default async function EcosystemPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="page-head">
        <div className="grid-field" aria-hidden="true" />
        <div className="noise-layer" aria-hidden="true" />
        <div className="shell">
          <div className="page-head-inner">
            <p className="eyebrow">Ecosystem</p>
            <h1 className="t-h1 page-head-title">
              Three parties, one <span className="text-gradient">coordinate</span>
            </h1>
            <p className="t-lead">
              Someone places an asset. Someone travels to it. The protocol
              confirms they were really there and settles it. Everything else is
              detail on top of that loop.
            </p>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------- */}
      <section className="section">
        <div className="shell">
          <div className="grid-3">
            {PARTICIPANTS.map((party) => (
              <article key={party.id} className="card card-hover participant reveal">
                <div className="participant-head">
                  <span className="t-mono">{party.label}</span>
                  <span className="chip">{party.tag}</span>
                </div>
                <h2 className="t-h3 participant-title">{party.title}</h2>
                <p className="t-small">{party.body}</p>
                <ul className="participant-list">
                  {party.gets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------- */}
      <section className="section section-sunken">
        <div className="shell">
          <div className="sec-head-center reveal" style={{ marginBottom: "3.5rem" }}>
            <p className="eyebrow eyebrow-center">The network</p>
            <h2 className="t-h2">Every pin is a real place</h2>
            <p className="t-lead" style={{ marginTop: "1.25rem" }}>
              Drag the globe. The coordinates are genuine city positions, and
              every arc is a drop moving between them.
            </p>
          </div>
          <GlobeSection />
        </div>
      </section>

      {/* --------------------------------------------------------------- */}
      <section className="section">
        <div className="shell">
          <div className="sec-head reveal">
            <p className="eyebrow">Capabilities</p>
            <h2 className="t-h2">What the protocol actually provides</h2>
          </div>

          <div className="grid-3" style={{ marginTop: "3rem" }}>
            {CAPABILITIES.map((cap) => (
              <article key={cap.title} className="card card-spotlight card-hover reveal">
                <div className="feature-card">
                  <span className="t-mono">{cap.meta}</span>
                  <h3 className="t-h4">{cap.title}</h3>
                  <p className="t-small">{cap.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------- */}
      <section className="section section-sunken">
        <div className="shell">
          <div className="faq-layout">
            <div className="sec-head reveal">
              <p className="eyebrow">Questions</p>
              <h2 className="t-h2">The ones worth asking</h2>
              <p className="t-body" style={{ marginTop: "1.25rem" }}>
                Including the ones with uncomfortable answers.
              </p>
            </div>
            <div className="reveal">
              <Accordion items={FAQ} />
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------- */}
      <section className="section">
        <div className="shell">
          <div className="cta-band reveal">
            <div className="cta-band-inner">
              <p className="eyebrow eyebrow-center">Go deeper</p>
              <h2 className="t-h2 cta-band-title">The technical account</h2>
              <p className="t-body">
                Proof of location, the architecture, the token design, and a
                straight list of the attacks we defend against and the limits we
                accept.
              </p>
              <div className="btn-row">
                <Link href="/whitepaper" className="btn btn-brand">
                  Read the whitepaper
                </Link>
                <Link href="/business" className="btn btn-outline">
                  Place your own assets
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
