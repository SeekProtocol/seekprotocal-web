import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  getMultilingualAlternates,
  OG_IMAGE,
  getOpenGraph,
  getBreadcrumbJsonLd,
} from "@/lib/seo";
import {
  ARIcon,
  GeospatialIcon,
  RewardsIcon,
  SyncIcon,
} from "@/components/brand/TechIcons";

/**
 * The page for the app.
 *
 * It was written when the app and the site had different names, to give the
 * app's own name a URL that was about it — the site ranked for the app
 * nowhere, and an unrelated platform on a similar domain took the result. The
 * app carries the site's name now, so that particular problem has been solved
 * by the rename rather than by this page.
 *
 * The page stays, and so does its slug. Two reasons, and neither is
 * sentimental. Anyone who searches the old name, or follows a link that has
 * been out in the world for months, lands here rather than on a 404 — and this
 * is where the announcement post sends them. And the site-wide
 * SoftwareApplication node names this URL as the app's home, so it has to keep
 * resolving for the graph to be true.
 *
 * The FAQ still answers "What is Seekprotocol?" and "Who makes Seekprotocol?"
 * in the format Google lifts into a rich result. Only the name in them changed.
 */


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seekarPage" });
  const description = t("metaDescription");

  return {
    title: t("metaTitle"),
    description,
    openGraph: getOpenGraph({
      title: t("ogTitle"),
      description,
      path: `/${locale}/seekar`,
      locale,
    }),
    twitter: {
      title: t("ogTitle"),
      description,
      images: [OG_IMAGE],
    },
    alternates: getMultilingualAlternates("/seekar", locale),
  };
}

const breadcrumbJsonLd = getBreadcrumbJsonLd([
  { name: "Seekprotocol", path: "/seekar" },
]);

/* English regardless of locale, matching the about page. Structured data is
   read by a crawler rather than a reader, and the questions worth winning
   — "what is seekar", "who makes seekar" — are asked in English. */
const seekarFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Seekprotocol?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Seekprotocol is the augmented reality app by Seekprotocol, free on iOS and Android. It anchors tokens, NFTs and rewards to real-world coordinates on Solana: you walk to the spot, open the camera, and claim what has been placed there. Proof of Location verifies on-chain that you were physically present.",
      },
    },
    {
      "@type": "Question",
      name: "Who makes Seekprotocol?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Seekprotocol is built by Seekprotocol, a product of Block Protocol L.L.C-FZ in Dubai, UAE. The app is published on the App Store and Google Play and the project's home is seekprotocol.ai.",
      },
    },
    {
      "@type": "Question",
      name: "Is Seekprotocol free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Seekprotocol is free to download on iOS and Android. Some in-app items are paid, but hunting and claiming are not.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need to know anything about crypto to use Seekprotocol?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. A wallet is created for you when you first open the app, and you can collect and hold assets without ever handling a seed phrase yourself.",
      },
    },
    {
      "@type": "Question",
      name: "Can I fake my location in Seekprotocol?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Proof of Location verifies your real presence on-chain, which is what makes a claim worth anything to the publisher who placed the reward.",
      },
    },
  ],
};

const STORES = [
  {
    href: "https://apps.apple.com/app/seekar/id6752813761",
    img: "/images/app-store.svg",
    alt: "Download Seekprotocol on the App Store",
  },
  {
    href: "https://play.google.com/store/apps/details?id=com.seekar.seekar",
    img: "/images/google-play.svg",
    alt: "Get Seekprotocol on Google Play",
  },
] as const;

export default async function SeekarPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SeekarContent />;
}

function SeekarContent() {
  const t = useTranslations("seekarPage");
  const tn = useTranslations("nav");

  const features = [
    { Icon: GeospatialIcon, title: t("f1Title"), desc: t("f1Desc") },
    { Icon: ARIcon, title: t("f2Title"), desc: t("f2Desc") },
    { Icon: SyncIcon, title: t("f3Title"), desc: t("f3Desc") },
    { Icon: RewardsIcon, title: t("f4Title"), desc: t("f4Desc") },
  ];

  const steps = [
    { title: t("s1Title"), desc: t("s1Desc") },
    { title: t("s2Title"), desc: t("s2Desc") },
    { title: t("s3Title"), desc: t("s3Desc") },
  ];

  const faqs = [
    { q: t("q1"), a: t("a1") },
    { q: t("q2"), a: t("a2") },
    { q: t("q3"), a: t("a3") },
    { q: t("q4"), a: t("a4") },
    { q: t("q5"), a: t("a5") },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(seekarFaqJsonLd) }}
      />

      <section className="page-head">
        <div className="grid-field" aria-hidden="true" />
        <div className="noise-layer" aria-hidden="true" />
        <div className="shell">
          <div className="page-head-inner">
            <p className="eyebrow">{t("eyebrow")}</p>
            <h1 className="t-h1 page-head-title">{t("heroTitle")}</h1>
            <p className="t-lead">{t("heroDesc")}</p>
            <div className="store-buttons" style={{ marginTop: "2rem" }}>
              {STORES.map((store) => (
                <a
                  key={store.href}
                  href={store.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="store-button"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={store.img} alt={store.alt} width={140} height={32} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What is Seekprotocol --------------------------------------------------- */}
      <section className="section">
        <div className="shell">
          <div className="about-why reveal">
            <div>
              <p className="eyebrow">Seekprotocol</p>
              <h2 className="t-h2">{t("whatTitle")}</h2>
            </div>
            <div>
              <p className="t-lead">{t("whatBody")}</p>
              <div className="btn-row" style={{ marginTop: "2rem" }}>
                <Link href="/ecosystem" className="btn btn-brand">
                  {tn("ecosystem")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features --------------------------------------------------------- */}
      <section className="section section-sunken">
        <div className="shell">
          <div className="sec-head reveal">
            <p className="eyebrow eyebrow-center">Seekprotocol</p>
            <h2 className="t-h2">{t("featuresTitle")}</h2>
          </div>
          <div className="grid-4">
            {features.map(({ Icon, title, desc }) => (
              <div key={title} className="card card-hover reveal">
                <div className="feature-card-icon feature-card-icon-lit">
                  <Icon />
                </div>
                <h3 className="t-h4">{title}</h3>
                <p className="t-body">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works ----------------------------------------------------- */}
      <section className="section">
        <div className="shell">
          <div className="sec-head reveal">
            <p className="eyebrow eyebrow-center">Step by step</p>
            <h2 className="t-h2">{t("howTitle")}</h2>
          </div>
          <div className="steps">
            {steps.map((step, index) => (
              <div key={step.title} className="step reveal">
                <p className="t-mono step-index">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="t-h3 step-title">{step.title}</h3>
                <p className="t-body step-body">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ -------------------------------------------------------------- */}
      <section className="section section-sunken">
        <div className="shell">
          <div className="sec-head reveal">
            <p className="eyebrow eyebrow-center">FAQ</p>
            <h2 className="t-h2">{t("faqTitle")}</h2>
          </div>
          <div className="grid-3">
            {faqs.map((faq) => (
              <div key={faq.q} className="card reveal">
                <h3 className="t-h4">{faq.q}</h3>
                <p className="t-body">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download --------------------------------------------------------- */}
      <section className="section">
        <div className="shell">
          <div className="cta-band reveal">
            <div className="cta-band-inner">
              <h2 className="t-h2 cta-band-title">{t("ctaTitle")}</h2>
              <p className="t-lead">{t("ctaDesc")}</p>
              <div className="store-buttons" style={{ marginTop: "2rem" }}>
                {STORES.map((store) => (
                  <a
                    key={store.href}
                    href={store.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="store-button"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={store.img} alt={store.alt} width={140} height={32} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
