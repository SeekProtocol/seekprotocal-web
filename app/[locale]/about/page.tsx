import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import SplineScene from "@/components/shared/SplineScene";
import BetaForm from "@/components/shared/BetaForm";

export const metadata: Metadata = {
  title: "About Us - Meet the Team Behind SeekAR",
  description:
    "Meet the Seek Protocol team building the future of location-based AR experiences on Solana. Discover our mission, core technologies, values, and the people behind $SEEK and SeekAR.",
  openGraph: {
    title: "About Seek Protocol - The Team Behind SeekAR",
    description:
      "Discover how Seek Protocol bridges physical and digital worlds through location-based AR technology, blockchain rewards, and AI-powered exploration on Solana.",
    url: "/about",
    images: [
      {
        url: "https://cdn.prod.website-files.com/689dda35eca0c273668f15aa/68b7ea7afbe50cfcdef0c342_SeekAR%20(30).png",
        width: 1200,
        height: 630,
        alt: "About Seek Protocol - AR & AI Platform on Solana",
      },
    ],
  },
  twitter: {
    title: "About Seek Protocol - Meet the SeekAR Team",
    description:
      "Meet the team building the future of location-based AR experiences on Solana. AR technology, blockchain rewards, and AI-powered exploration.",
  },
  alternates: { canonical: "/about" },
};

const aboutFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Seek Protocol?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Seek Protocol is the first AR and AI platform on Solana that transforms real-world exploration into rewarding adventures through augmented reality and blockchain technology. Users hunt location-based airdrops, collect NFTs, and explore with AI companions.",
      },
    },
    {
      "@type": "Question",
      name: "What is SeekAR?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "SeekAR is the flagship mobile app by Seek Protocol, available on iOS and Android. It uses augmented reality to overlay digital treasures in the real world, turning every location into an interactive treasure hunt with crypto rewards.",
      },
    },
    {
      "@type": "Question",
      name: "What is $SEEK token?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "$SEEK is the native token of Seek Protocol on the Solana blockchain. It is essential for launching campaigns within the SeekAR app. Integrating assets into the ecosystem drives demand for $SEEK, creating positive buying pressure and sustainable growth.",
      },
    },
    {
      "@type": "Question",
      name: "How does Proof of Location work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Proof of Location is a verification system that confirms your real-world location on-chain to unlock tokens, NFTs, and digital assets. It uses GPS-based precision with blockchain verification to ensure no cheating or spoofing — only real rewards for real engagement.",
      },
    },
    {
      "@type": "Question",
      name: "Where is Seek Protocol based?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Seek Protocol is founded in Dubai, UAE, and operated by Block Protocol L.L.C-FZ. The team includes professionals from around the world working on AR, AI, blockchain, and game development.",
      },
    },
  ],
};

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AboutContent />;
}

function AboutContent() {
  const t = useTranslations("about");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutFaqJsonLd) }}
      />
      <div className="page-bg">
        <SplineScene
          url="https://prod.spline.design/XOzWv5kao0gKP7SK/scene.splinecode"
          className="hero-background-video"
        />
        <div className="hero-background-overlay"></div>
      </div>
      <div className="page-wrapper">
        <Navigation />

        {/* Hero */}
        <section className="about-hero">
          <div className="container">
            <div className="about-hero-wrap">
              <div className="hero-top-wrap">
                <div className="hero-01-text-wrap">
                  <h1
                    data-w-id="about-hero-title"
                    style={{ opacity: 0, transform: "translate3d(0, 20%, 0)", filter: "blur(3px)" }}
                    className="h1 front-size-22"
                  >
                    {t("heroTitle")}
                  </h1>
                  <p
                    data-w-id="about-hero-desc"
                    style={{ opacity: 0, transform: "translate3d(0, 20%, 0)", filter: "blur(3px)" }}
                    className="paragraph-03 text-gray-color"
                  >
                    {t("heroDesc")}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="about-hero-bottom-wrap">
            <img
              className="about-bg"
              src="/images/ChatGPT-Image-10-sep-2025-02_18_11.png"
              alt="Seek Protocol augmented reality experience"
              sizes="(max-width: 1536px) 100vw, 1536px"
              loading="lazy"
              srcSet="/images/ChatGPT-Image-10-sep-2025-02_18_11-p-500.png 500w, /images/ChatGPT-Image-10-sep-2025-02_18_11-p-800.png 800w, /images/ChatGPT-Image-10-sep-2025-02_18_11-p-1080.png 1080w, /images/ChatGPT-Image-10-sep-2025-02_18_11.png 1536w"
            />
            <div className="container about-into-card-wrap">
              <div
                data-w-id="about-card"
                style={{ opacity: 0, transform: "translate3d(0, 20%, 0)", filter: "blur(3px)" }}
                className="about-into-card"
              >
                <div className="heading-about">
                  <h2 className="h2 text-black _02">{t("whySeekProtocol")}</h2>
                </div>
                <div className="details-about">
                  <p className="paragraph-03 text-black _01">{t("whyDesc")}</p>
                </div>
                <div className="about-button-wrap">
                  <Link href="/contact" className="button-01 w-variant-ae89c003-9ca6-5eb5-7340-85db27fb3748 w-inline-block">
                    <div className="button-text-icon-wrap">
                      <div className="button-text-wrapper">
                        <div className="paragraph-02 text-black">{t("letsConnect")}</div>
                        <div className="paragraph-02 text-black">{t("letsConnect")}</div>
                      </div>
                      <div className="button-icon-wrapper">
                        <img src="/images/Button-Icon-1.svg" loading="lazy" alt="" className="button-icon" />
                      </div>
                    </div>
                    <div className="hover-color"></div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="values">
          <div className="container">
            <div className="values-wrap">
              <div className="values-top-wrap">
                <p data-w-id="values-label" style={{ opacity: 0, transform: "translate3d(0, 20%, 0)", filter: "blur(3px)" }} className="paragraph-03 text-primary">{t("ourValues")}</p>
                <h2 data-w-id="values-title" style={{ opacity: 0, transform: "translate3d(0, 20%, 0)", filter: "blur(3px)" }} className="h2">{t("whatDrivesUs")}</h2>
              </div>
              <div className="values-bottom-wrap">
                {[
                  { title: t("valueLocationIntelligence"), descKey: "valueLocationIntelligenceDesc" },
                  { title: t("valueARInnovation"), descKey: "valueARInnovationDesc" },
                  { title: t("valueSocialDiscovery"), descKey: "valueSocialDiscoveryDesc" },
                  { title: t("valueCrossChainRewards"), descKey: "valueCrossChainRewardsDesc" },
                  { title: t("valueProofOfExploration"), descKey: "valueProofOfExplorationDesc" },
                ].map((item) => (
                  <div key={item.descKey} className="values-card">
                    <h4 className="h4"><strong>{item.title}</strong></h4>
                    <p className="paragraph-03 text-gray-color">{t(item.descKey as "valueLocationIntelligenceDesc")}</p>
                    <div className="glow-main-block"><div style={{ opacity: 0 }} className="glow-block"></div></div>
                  </div>
                ))}
                <div className="values-card _01">
                  <h4 className="h4">{t("readyToSeek")}</h4>
                  <div className="glow-main-block"><div style={{ opacity: 0 }} className="glow-block"></div></div>
                  <Link href="/contact" className="button-01 w-inline-block">
                    <div className="button-text-icon-wrap">
                      <div className="button-text-wrapper">
                        <div className="paragraph-02 text-black">{t("startExploring")}</div>
                        <div className="paragraph-02 text-black">{t("startExploring")}</div>
                      </div>
                      <div className="button-icon-wrapper"><img src="/images/Button-Icon-1.svg" loading="lazy" alt="" className="button-icon" /></div>
                    </div>
                    <div className="hover-color"></div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Technologies */}
        <section className="marketing">
          <div className="container">
            <div className="marketing-wrap">
              <div className="marketing-top-wrap">
                <div className="marketing-heading-text">
                  <div className="heading-wrap marketing-heading-wrap"><h2 className="h2">{t("coreTechnologies")}</h2></div>
                  <div className="sub-heading-wrap marketing-sub-heading-wrap">
                    <p className="paragraph-03 text-gray-color">{t("coreTechDesc")}</p>
                  </div>
                </div>
              </div>
              <div className="marketing-bottom-wrap">
                {[
                  { icon: "Marketing-Icon--4.svg", title: t("techGeospatial"), descKey: "techGeospatialDesc" },
                  { icon: "Marketing-Icon--3.svg", title: t("techAR"), descKey: "techARDesc" },
                  { icon: "Marketing-Icon--1.svg", title: t("techBlockchain"), descKey: "techBlockchainDesc" },
                  { icon: "Marketing-Icon--2.svg", title: t("techSync"), descKey: "techSyncDesc" },
                ].map((item) => (
                  <div key={item.descKey} className="marketing-box-list">
                    <div className="marketing-icon-wrap"><img src={`/images/${item.icon}`} loading="lazy" alt="" className="fit-cover" /></div>
                    <div className="marketing-details">
                      <h3 className="h3">{item.title}</h3>
                      <p className="paragraph-03 text-gray-color">{t(item.descKey as "techGeospatialDesc")}</p>
                    </div>
                    <div className="glow-main-block"><div style={{ opacity: 0 }} className="glow-block"></div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Three Pillars */}
        <section className="three-pillars">
          <div className="container">
            <div className="three-pillars-wrap">
              <div className="three-pillars-top-wrap">
                <h1 data-w-id="pillars-title" style={{ opacity: 0, transform: "translate3d(0, 20%, 0)", filter: "blur(3px)" }} className="h1">{t("threePillars")}</h1>
                <p data-w-id="pillars-desc" style={{ opacity: 0, transform: "translate3d(0, 20%, 0)", filter: "blur(3px)" }} className="paragraph-03 text-gray-color">{t("threePillarsDesc")}</p>
              </div>
              <div className="three-pillars-bottom-wrap">
                <div className="three-pillars-image-wrap"><img src="/images/Three-Pillars_1Three-Pillars.avif" loading="lazy" alt="Three Pillars" className="fit-cover _01" /></div>
                <div className="three-pillars-text-wrap">
                  <div className="three-pillars-card absolute-pillars">
                    <h2 className="h4">{t("pillarAR")}</h2>
                    <p className="paragraph-03 text-gray-color text-mobile-white">{t("pillarARDesc")}</p>
                  </div>
                  <div className="absolute-path absolute-pillars-03">
                    <h2 className="h4 text-black">{t("pillarLocation")}</h2>
                    <p className="paragraph-03 text-black">{t("pillarLocationDesc")}</p>
                    <img src="/images/Subtract.svg" loading="lazy" alt="" className="image-path" />
                  </div>
                  <div className="three-pillars-card absolute-pillars-01">
                    <h3 className="h4">{t("pillarReward")}</h3>
                    <p className="paragraph-03 text-gray-color text-mobile-white">{t("pillarRewardDesc")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Approach */}
        <section className="approach">
          <div className="container">
            <div className="approach-wrap">
              <div data-w-id="approach-left" style={{ opacity: 0, transform: "translate3d(0, 20%, 0)", filter: "blur(3px)" }} className="approach-left-wrap">
                <div className="approach-left-text-wrap">
                  <p className="paragraph-03 text-primary">{t("ourApproach")}</p>
                  <div className="approach-heading">
                    <h2 className="h2">{t("approachTitle")}</h2>
                    <p className="paragraph-03 text-gray-color">{t("approachDesc")}</p>
                  </div>
                </div>
              </div>
              <div className="approach-bottom-wrap">
                <div className="approach-line-wrap"><div className="approach-line"></div></div>
                <div className="approach-text-wrap">
                  {[
                    { titleKey: "approachTreasureHunts", descKey: "approachTreasureHuntsDesc", point: "_01" },
                    { titleKey: "approachARExperiences", descKey: "approachARExperiencesDesc", point: "_02" },
                    { titleKey: "approachRewardPools", descKey: "approachRewardPoolsDesc", point: "_03" },
                    { titleKey: "approachSocial", descKey: "approachSocialDesc", point: "_04" },
                    { titleKey: "approachAnalytics", descKey: "approachAnalyticsDesc", point: "_05" },
                    { titleKey: "approachEvents", descKey: "approachEventsDesc", point: "_06" },
                    { titleKey: "approachCollaborations", descKey: "approachCollaborationsDesc", point: "_07" },
                  ].map((item) => (
                    <div key={item.titleKey} className="approach-text-list">
                      <h4 className="h4">{t(item.titleKey as "approachTreasureHunts")}</h4>
                      <div className="point-text-wrap">
                        <p className="paragraph-03 text-gray-color">{t(item.descKey as "approachTreasureHuntsDesc")}</p>
                        <div className={`point-wrap ${item.point}`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="section team-one">
          <div className="w-layout-blockcontainer container w-container">
            <div className="team-wrapper">
              <div className="secondary-title-wrap team">
                <h2 data-w-id="team-title" style={{ opacity: 0 }} className="h2 max-width">{t("ourTeam")}</h2>
              </div>
              <div className="team-v1-grid">
                {[
                  { name: "Don Reijke", role: "Founder & CTO", img: "Don-Reijke.avif", linkedin: "https://www.linkedin.com/in/don-reijke-09630921b/" },
                  { name: "Lukas Novotny", role: "COO", img: "Lukas-Novotny.avif", linkedin: "#" },
                  { name: "Senna Kabbaj", role: "CCO", img: "Senna-Kabbaj.avif", linkedin: "https://www.linkedin.com/in/sennakabbaj/" },
                  { name: "Tristan Wesenhagen", role: "Business Development & Strategy Lead", img: "Tristan-Wesenhagen_1.avif", linkedin: "https://www.linkedin.com/in/sdewansingh/" },
                  { name: "Jonathan Ladislas", role: "Strategic Advisor", img: "Jonathan-Ladislas_1.avif", linkedin: "https://www.linkedin.com/in/martin-patzer-92885a295/" },
                  { name: "Martin Patzer", role: "Community Manager", img: "Martin-Patzer.avif", linkedin: "https://www.linkedin.com/in/martin-patzer-92885a295/" },
                  { name: "Vitor Souza", role: "Lead AI Engineer & Game Development", img: "Vitor-Souza.avif", linkedin: "#" },
                  { name: "Wilson Bueres", role: "3D Design & Animations", img: "Wilson-Bueres.avif", linkedin: "#" },
                  { name: "Samuel Pinheiro", role: "Blockchain & Game Development", img: "Samuel-Pinheiro.avif", linkedin: "#" },
                  { name: "Mateus Henrique", role: "Game Development", img: "Mateus-Henrique.avif", linkedin: "#" },
                  { name: "Twan Kersting", role: "Innovation Strategist", img: "Twan-Kersting.avif", linkedin: "#" },
                ].map((member) => (
                  <div key={member.name} className="team-v1-wrap">
                    <div className="team-v1-img-wrap"><img loading="lazy" src={`/images/${member.img}`} alt={member.name} className="team-v1-img" /></div>
                    <div className="team-v1-author-wrap">
                      <div className="team-v1-author-inner-wrap">
                        <div className="team-v1-author-name">{member.name}</div>
                        <div className="team-v1-author-bio">{member.role}</div>
                      </div>
                      <div className="team-v1-social-wrap">
                        <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="team-v1-social-link w-inline-block">
                          <img loading="lazy" src="/images/Linkdin-Image.svg" alt="LinkedIn" className="team-v1-social-img" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA / Beta Form */}
        <section className="cta-v2">
          <div className="container">
            <div className="cta-v2-wrap">
              <div className="cta-v2-top-wrap align-center">
                <p className="paragraph-03 text-primary">{t("joinBeta")}</p>
                <div className="heading-wrap cta-v2-heading"><h3 className="h2">{t("getReady")}</h3></div>
                <div className="sub-heading-wrap cta-v2-sub-heading">
                  <p className="paragraph-03 text-gray-color">{t("ctaDesc")}</p>
                </div>
              </div>
              <div className="cta-v2-bottom-wrap"><BetaForm /></div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
