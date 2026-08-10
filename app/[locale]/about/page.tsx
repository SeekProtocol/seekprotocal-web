import type { Metadata } from "next";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getMultilingualAlternates, OG_IMAGE, getOpenGraph, getBreadcrumbJsonLd } from "@/lib/seo";
import BetaForm from "@/components/shared/BetaForm";
import {
  ARIcon,
  GeospatialIcon,
  RewardsIcon,
  SyncIcon,
} from "@/components/brand/TechIcons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  const description = t("metaDescription");

  return {
    title: t("metaTitle"),
    description,
    openGraph: getOpenGraph({
      title: t("ogTitle"),
      description,
      path: `/${locale}/about`,
      locale,
    }),
    twitter: {
      title: t("ogTitle"),
      description,
      images: [OG_IMAGE],
    },
    alternates: getMultilingualAlternates("/about", locale),
  };
}

const aboutFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Seekprotocol?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Seekprotocol is the first AR and AI platform on Solana that transforms real-world exploration into rewarding adventures through augmented reality and blockchain technology. Users hunt location-based airdrops, collect NFTs, and explore with AI companions.",
      },
    },
    {
      "@type": "Question",
      name: "What is Seekprotocol?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Seekprotocol is the flagship mobile app by Seekprotocol, available on iOS and Android. It uses augmented reality to overlay digital treasures in the real world, turning every location into an interactive treasure hunt with crypto rewards.",
      },
    },
    {
      "@type": "Question",
      name: "What is $SEEK token?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "$SEEK is the native token of Seekprotocol on the Solana blockchain. It is essential for launching campaigns within the Seekprotocol app. Integrating assets into the ecosystem drives demand for $SEEK, creating positive buying pressure and sustainable growth.",
      },
    },
    {
      "@type": "Question",
      name: "How does Proof of Location work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Proof of Location is a verification system that confirms your real-world location on-chain to unlock tokens, NFTs, and digital assets. It uses GPS-based precision with blockchain verification to ensure no cheating or spoofing, only real rewards for real engagement.",
      },
    },
    {
      "@type": "Question",
      name: "Where is Seekprotocol based?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Seekprotocol is founded in Dubai, UAE, and operated by Block Protocol L.L.C-FZ. The team includes professionals from around the world working on AR, AI, blockchain, and game development.",
      },
    },
  ],
};

/* Google draws the breadcrumb trail in place of the URL line. Worth more
   than it sounds where every path opens with a locale code: a reader sees
   "seekprotocol.ai > About" instead of a string. */
const breadcrumbJsonLd = getBreadcrumbJsonLd([
  { name: "About", path: "/about" },
]);

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AboutContent />;
}


const TEAM = [
  { name: "Don Reijke", role: "Founder & CTO", img: "Don-Reijke.avif", linkedin: "https://www.linkedin.com/in/don-reijke-09630921b/" },
  { name: "Lukas Novotny", role: "COO", img: "Lukas-Novotny.avif", linkedin: "" },
  { name: "Senna Kabbaj", role: "CCO", img: "Senna-Kabbaj.avif", linkedin: "https://www.linkedin.com/in/sennakabbaj/" },
  { name: "Tristan Wesenhagen", role: "Business Development & Strategy Lead", img: "Tristan-Wesenhagen_1.avif", linkedin: "https://www.linkedin.com/in/sdewansingh/" },
  { name: "Jonathan Ladislas", role: "Strategic Advisor", img: "Jonathan-Ladislas_1.avif", linkedin: "" },
  { name: "Martin Patzer", role: "Community Manager", img: "Martin-Patzer.avif", linkedin: "https://www.linkedin.com/in/martin-patzer-92885a295/" },
  { name: "Vitor Souza", role: "Lead AI Engineer & Game Development", img: "Vitor-Souza.avif", linkedin: "" },
  { name: "Wilson Bueres", role: "3D Design & Animations", img: "Wilson-Bueres.avif", linkedin: "" },
  { name: "Samuel Pinheiro", role: "Blockchain & Game Development", img: "Samuel-Pinheiro.avif", linkedin: "" },
  { name: "Mateus Henrique", role: "Game Development", img: "Mateus-Henrique.avif", linkedin: "" },
  { name: "Twan Kersting", role: "Innovation Strategist", img: "Twan-Kersting.avif", linkedin: "" },
];

function AboutContent() {
  const t = useTranslations("about");

  const values = [
    { title: t("valueLocationIntelligence"), desc: t("valueLocationIntelligenceDesc") },
    { title: t("valueARInnovation"), desc: t("valueARInnovationDesc") },
    { title: t("valueSocialDiscovery"), desc: t("valueSocialDiscoveryDesc") },
    { title: t("valueCrossChainRewards"), desc: t("valueCrossChainRewardsDesc") },
    { title: t("valueProofOfExploration"), desc: t("valueProofOfExplorationDesc") },
  ];

  const tech = [
    { Icon: GeospatialIcon, title: t("techGeospatial"), desc: t("techGeospatialDesc") },
    { Icon: ARIcon, title: t("techAR"), desc: t("techARDesc") },
    { Icon: RewardsIcon, title: t("techBlockchain"), desc: t("techBlockchainDesc") },
    { Icon: SyncIcon, title: t("techSync"), desc: t("techSyncDesc") },
  ];

  const pillars = [
    { title: t("pillarAR"), desc: t("pillarARDesc") },
    { title: t("pillarLocation"), desc: t("pillarLocationDesc") },
    { title: t("pillarReward"), desc: t("pillarRewardDesc") },
  ];

  const approach = [
    { title: t("approachTreasureHunts"), desc: t("approachTreasureHuntsDesc") },
    { title: t("approachARExperiences"), desc: t("approachARExperiencesDesc") },
    { title: t("approachRewardPools"), desc: t("approachRewardPoolsDesc") },
    { title: t("approachSocial"), desc: t("approachSocialDesc") },
    { title: t("approachAnalytics"), desc: t("approachAnalyticsDesc") },
    { title: t("approachEvents"), desc: t("approachEventsDesc") },
    { title: t("approachCollaborations"), desc: t("approachCollaborationsDesc") },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutFaqJsonLd) }}
      />

      <section className="page-head">
        <div className="grid-field" aria-hidden="true" />
        <div className="noise-layer" aria-hidden="true" />
        <div className="shell">
          <div className="page-head-inner">
            <p className="eyebrow">About</p>
            <h1 className="t-h1 page-head-title">{t("heroTitle")}</h1>
            <p className="t-lead">{t("heroDesc")}</p>
          </div>
        </div>
      </section>

      {/* Why -------------------------------------------------------------- */}
      <section className="section">
        <div className="shell">
          <div className="about-why reveal">
            <div>
              <p className="eyebrow">Why we build this</p>
              <h2 className="t-h2">{t("whySeekprotocol")}</h2>
            </div>
            <div>
              <p className="t-lead">{t("whyDesc")}</p>
              <div className="btn-row" style={{ marginTop: "2rem" }}>
                <Link href="/contact" className="btn btn-brand">
                  {t("letsConnect")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values ----------------------------------------------------------- */}
      <section className="section section-sunken">
        <div className="shell">
          <div className="sec-head reveal">
            <p className="eyebrow">{t("ourValues")}</p>
            <h2 className="t-h2">{t("whatDrivesUs")}</h2>
          </div>

          <div className="grid-3" style={{ marginTop: "3rem" }}>
            {values.map((value) => (
              <article key={value.title} className="card card-hover card-spotlight reveal">
                <div className="feature-card">
                  <h3 className="t-h4">{value.title}</h3>
                  <p className="t-small">{value.desc}</p>
                </div>
              </article>
            ))}
            <article className="card about-values-cta reveal">
              <h3 className="t-h4">{t("readyToSeek")}</h3>
              <Link href="/contact" className="btn btn-brand btn-sm mt-auto">
                {t("startExploring")}
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* Core technologies ------------------------------------------------ */}
      <section className="section">
        <div className="shell">
          <div className="sec-head reveal">
            <p className="eyebrow">Technology</p>
            <h2 className="t-h2">{t("coreTechnologies")}</h2>
            <p className="t-lead" style={{ marginTop: "1.25rem" }}>{t("coreTechDesc")}</p>
          </div>

          <div className="grid-4" style={{ marginTop: "3rem" }}>
            {tech.map((item) => (
              <article key={item.title} className="card card-hover reveal">
                <div className="feature-card">
                  <span className="feature-card-icon feature-card-icon-lit">
                    <item.Icon />
                  </span>
                  <h3 className="t-h4">{item.title}</h3>
                  <p className="t-small">{item.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Three pillars ---------------------------------------------------- */}
      <section className="section section-sunken">
        <div className="shell">
          <div className="sec-head reveal">
            <p className="eyebrow">Pillars</p>
            <h2 className="t-h2">{t("threePillars")}</h2>
            <p className="t-lead" style={{ marginTop: "1.25rem" }}>{t("threePillarsDesc")}</p>
          </div>

          <div className="grid-3" style={{ marginTop: "3rem" }}>
            {pillars.map((pillar, i) => (
              <article key={pillar.title} className="card pillar-card reveal">
                <span className="t-mono pillar-card-index">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="t-h3 pillar-card-title">{pillar.title}</h3>
                <p className="t-body">{pillar.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Approach --------------------------------------------------------- */}
      <section className="section">
        <div className="shell">
          <div className="sec-head reveal">
            <p className="eyebrow">{t("ourApproach")}</p>
            <h2 className="t-h2">{t("approachTitle")}</h2>
            <p className="t-lead" style={{ marginTop: "1.25rem" }}>{t("approachDesc")}</p>
          </div>

          <div className="steps" style={{ marginTop: "3rem" }}>
            {approach.map((item, i) => (
              <div key={item.title} className="step reveal">
                <span className="t-mono step-index">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="t-h3 step-title">{item.title}</h3>
                </div>
                <p className="t-body step-body">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team ------------------------------------------------------------- */}
      <section className="section section-sunken">
        <div className="shell">
          <div className="sec-head reveal">
            <p className="eyebrow">Team</p>
            <h2 className="t-h2">{t("ourTeam")}</h2>
          </div>

          <div className="team-grid">
            {TEAM.map((member) => (
              <article key={member.name} className="team-card reveal">
                <div className="team-card-photo">
                  {/* fill: the sources run from 800x598 to 1888x2048, so there is no one
                      ratio to state. .team-card-photo already squares the box. */}
                  <Image
                    src={`/images/${member.img}`}
                    alt={member.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
                  />
                </div>
                <div className="team-card-body">
                  <h3 className="team-card-name">{member.name}</h3>
                  <p className="t-mono-sm team-card-role">{member.role}</p>
                </div>
                {member.linkedin && (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="team-card-social"
                    aria-label={`${member.name} on LinkedIn`}
                  >
                    <img loading="lazy" src="/images/Linkdin-Image.svg" alt="" width={16} height={16} />
                  </a>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA -------------------------------------------------------------- */}
      <section className="section">
        <div className="shell">
          <div className="cta-band reveal">
            <div className="cta-band-inner">
              <p className="eyebrow eyebrow-center">{t("joinBeta")}</p>
              <h2 className="t-h2 cta-band-title">{t("getReady")}</h2>
              <p className="t-body">{t("ctaDesc")}</p>
              <div style={{ marginTop: "2rem" }}>
                <BetaForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
