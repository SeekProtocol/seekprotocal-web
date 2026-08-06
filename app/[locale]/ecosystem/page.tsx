import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { baseUrl, getMultilingualAlternates, OG_IMAGE, getBreadcrumbJsonLd, getOpenGraph } from "@/lib/seo";
import { CAPABILITIES, FAQ_IDS, PARTICIPANTS } from "@/content/ecosystem";
import { listCopy, withCopy } from "@/lib/content-i18n";
import en from "@/messages/en.json";
import GlobeSection from "@/components/sections/GlobeSection";
import Accordion from "@/components/ui/Accordion";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ecosystemPage" });
  const description = t("metaDescription");

  return {
    // 56 characters with the template suffix. "Ecosystem" alone was 25 and
    // said nothing a searcher would type.
    title: t("metaTitle"),
    description,
    alternates: getMultilingualAlternates("/ecosystem", locale),
    openGraph: getOpenGraph({
      title: t("ogTitle"),
      description,
      path: `/${locale}/ecosystem`,
      locale,
    }),
    twitter: {
      title: t("ogTitle"),
      description,
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
  // English, because the structured data is attached to the /en canonical.
  mainEntity: FAQ_IDS.map((id) => ({
    "@type": "Question",
    name: en.ecosystemFaq[id as keyof typeof en.ecosystemFaq].question,
    acceptedAnswer: {
      "@type": "Answer",
      text: en.ecosystemFaq[id as keyof typeof en.ecosystemFaq].answer,
    },
  })),
};

const breadcrumbJsonLd = getBreadcrumbJsonLd([
  { name: "Ecosystem", path: "/ecosystem" },
]);

export default async function EcosystemPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <EcosystemContent />;
}

function EcosystemContent() {
  const t = useTranslations("ecosystemPage");
  const parties = withCopy(useTranslations("participants"), PARTICIPANTS, [
    "label",
    "tag",
    "title",
    "body",
  ]);
  const gets = useTranslations("participants");
  const capabilities = withCopy(useTranslations("capabilities"), CAPABILITIES, [
    "meta",
    "title",
    "body",
  ]);
  const faq = useTranslations("ecosystemFaq");
  const faqItems = FAQ_IDS.map((id) => ({
    question: faq(`${id}.question`),
    answer: faq(`${id}.answer`),
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
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
            <p className="t-lead">{t("lead")}</p>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------- */}
      <section className="section">
        <div className="shell">
          <div className="grid-3">
            {parties.map((party) => (
              <article key={party.id} className="card card-hover participant reveal">
                <div className="participant-head">
                  <span className="t-mono">{party.label}</span>
                  <span className="chip">{party.tag}</span>
                </div>
                <h2 className="t-h3 participant-title">{party.title}</h2>
                <p className="t-small">{party.body}</p>
                <ul className="participant-list">
                  {listCopy(gets, `${party.id}.gets`).map((item) => (
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
            <p className="eyebrow eyebrow-center">{t("networkEyebrow")}</p>
            <h2 className="t-h2">{t("networkTitle")}</h2>
            <p className="t-lead" style={{ marginTop: "1.25rem" }}>
              {t("networkLead")}
            </p>
          </div>
          <GlobeSection />
        </div>
      </section>

      {/* --------------------------------------------------------------- */}
      <section className="section">
        <div className="shell">
          <div className="sec-head reveal">
            <p className="eyebrow">{t("capabilitiesEyebrow")}</p>
            <h2 className="t-h2">{t("capabilitiesTitle")}</h2>
          </div>

          <div className="grid-3" style={{ marginTop: "3rem" }}>
            {capabilities.map((cap) => (
              <article key={cap.id} className="card card-spotlight card-hover reveal">
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
              <p className="eyebrow">{t("faqEyebrow")}</p>
              <h2 className="t-h2">{t("faqTitle")}</h2>
              <p className="t-body" style={{ marginTop: "1.25rem" }}>
                {t("faqLead")}
              </p>
            </div>
            <div className="reveal">
              <Accordion items={faqItems} />
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------- */}
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
                <Link href="/business" className="btn btn-outline">
                  {t("ctaBusiness")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
