import Image from "next/image";
import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getMultilingualAlternates, OG_IMAGE, getOpenGraph } from "@/lib/seo";
import CoinStage from "@/components/sections/CoinStage";
import WorldDescent from "@/components/sections/WorldDescent";
import GlobeSection from "@/components/sections/GlobeSection";
import AppWalkthrough from "@/components/app/AppWalkthrough";
import VideoReveal from "@/components/sections/VideoReveal";
import CollectiblesSection from "@/components/sections/CollectiblesSection";
import OffersSection from "@/components/sections/OffersSection";
import MobiSection from "@/components/sections/MobiSection";
import ARSection from "@/components/sections/ARSection";
import ProgressionSection from "@/components/sections/ProgressionSection";
import ClansSection from "@/components/sections/ClansSection";
import ReferralSection from "@/components/sections/ReferralSection";
import SocialSection from "@/components/sections/SocialSection";
import FeatureGroups from "@/components/sections/FeatureGroups";
import BetaForm from "@/components/shared/BetaForm";
import Marquee from "@/components/ui/Marquee";
import Counter from "@/components/ui/Counter";
import { PRESS_LOGOS, HOME_STEPS, HOME_STATS } from "@/content/home";
import { withCopy } from "@/lib/content-i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  const description = t("metaDescription");

  return {
    /* `metaTitle` is the whole title, with no brand suffix appended.

       The layout's `%s | Seekprotocol` template never reaches this page — it
       applies to *child* segments, and this page sits in the same segment as
       the layout that declares it — so the suffix used to be added here by
       hand. It is gone, and now that the app and the site share one name there
       is nothing for it to add: "Seekprotocol | ... | Seekprotocol" would say
       the name twice inside a limit that already has no room for it.

       Longest of the eight is Spanish at 48, well inside the ~60 Google
       renders. */
    title: t("metaTitle"),
    description,
    openGraph: getOpenGraph({
      title: t("ogTitle"),
      description,
      path: `/${locale}`,
      locale,
    }),
    twitter: {
      title: t("ogTitle"),
      description,
      images: [OG_IMAGE],
    },
    alternates: getMultilingualAlternates("/", locale),
  };
}

/* Homepage FAQPage schema.

   English regardless of the visitor's locale, following the same pattern as
   the seekar page's own FAQ node: structured data is read by crawlers and by
   LLM retrieval, and the queries worth winning ("what is seekprotocol", "is
   seekprotocol on solana", "what is $SEEK", "who builds seekprotocol") are
   asked in English overwhelmingly. Answers are canonical short-form and pull
   from the same facts the visible content is built on, so a reader who arrives
   from an assistant citation lands on a page that says the same thing.

   Deliberately outside the SoftwareApplication FAQ that lives on /seekar: that
   one answers app-usage questions ("is it free", "what phones"), this one
   answers protocol/brand-level questions ("what is it", "on which chain"). */
const homeFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Seekprotocol?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Seekprotocol is the first augmented reality and AI platform on Solana. It anchors digital assets — tokens, NFTs, brand rewards — to real-world coordinates. A publisher places a reward at a location, someone walks to it, and the protocol verifies they were actually there before settling the claim on Solana. The consumer surface is the Seekprotocol mobile app on iOS and Android.",
      },
    },
    {
      "@type": "Question",
      name: "Is Seekprotocol built on Solana?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Every claim settles on Solana. The chain is chosen for its low transaction cost — collecting a reward worth a few cents has to cost a small fraction of a cent to record, or the economics do not work — and for its sub-second confirmation, which matters when a user is standing on a street corner waiting.",
      },
    },
    {
      "@type": "Question",
      name: "What is $SEEK, the native token?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "$SEEK is the settlement asset of the Seekprotocol protocol. Publishers spend $SEEK to place location-based campaigns, and a majority of that fee routes back to the seekers who claim the resulting drops. Token distribution and vesting details are in the whitepaper at https://www.seekprotocol.ai/en/whitepaper.",
      },
    },
    {
      "@type": "Question",
      name: "How does proof of location work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Presence is verified against four independent signals — satellite fix, ambient radio environment, device attestation and motion continuity — that must all agree before a claim is accepted. The goal is to make forgery cost more than the reward is worth. The protocol does not claim forgery is impossible; the whitepaper documents the specific attacks and the limits.",
      },
    },
    {
      "@type": "Question",
      name: "Is Seekprotocol free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Seekprotocol mobile app is free on iOS and Android. Discovering and claiming rewards costs nothing to the user, and a wallet is created for you from a social login so no crypto knowledge is required to start. Publishers pay per verified visit when they place a campaign.",
      },
    },
    {
      "@type": "Question",
      name: "Who is behind Seekprotocol?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Seekprotocol is built by Block Protocol L.L.C-FZ, a company based in Dubai, UAE. The app is published on the App Store and Google Play, and the project's home is seekprotocol.ai.",
      },
    },
    {
      "@type": "Question",
      name: "What is location-based AR?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Location-based AR anchors digital objects — 3D models, tokens, NFTs, rewards — to specific real-world coordinates. Unlike marker-based AR (which needs a printed image) or world-scale AR (which places objects relatively), location-based AR uses GPS plus a verification layer so an asset only exists for people who physically visit its coordinate. Seekprotocol is a location-based AR platform in this sense.",
      },
    },
    {
      "@type": "Question",
      name: "What was SeekAR? Is it the same as Seekprotocol?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "SeekAR was the launch name of what is now called Seekprotocol. The same app, the same account, the same map — only the name and icon changed in August 2026, after a separate company filed a trademark application on the old name. The full account is at https://www.seekprotocol.ai/en/blog/seekar-is-now-seekprotocol.",
      },
    },
  ],
};

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HomeContent />;
}

function HomeContent() {
  const t = useTranslations("home");
  const steps = withCopy(useTranslations("homeSteps"), HOME_STEPS, ["title", "meta", "body"]);
  const stats = withCopy(useTranslations("homeStats"), HOME_STATS, ["label"]);

  const pillars = [
    { title: t("pathProofOfLocation"), desc: t("pathProofOfLocationDesc") },
    { title: t("pathBlockchain"), desc: t("pathBlockchainDesc") },
    { title: t("pathAI"), desc: t("pathAIDesc") },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeFaqJsonLd) }}
      />

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="grid-field" aria-hidden="true" />
        <div className="noise-layer" aria-hidden="true" />
        <div className="shell">
          <div className="hero-layout">
            <div>
              <p className="eyebrow enter">AR · AI · Solana</p>
              <h1 className="t-display hero-title enter" style={{ animationDelay: "80ms" }}>
                {t("heroTitle")}{" "}
                <span className="text-gradient">{t("heroTitleHighlight")}</span>
              </h1>
              <p className="t-lead hero-lead enter" style={{ animationDelay: "160ms" }}>
                {t("heroSubtitle")}
              </p>
              <div className="enter" style={{ animationDelay: "240ms" }}>
                <StoreButtons appStore={t("downloadAppStore")} play={t("downloadGooglePlay")} />
              </div>
              <div className="hero-meta enter" style={{ animationDelay: "320ms" }}>
                {stats.map((stat) => (
                  <div key={stat.id} className="hero-meta-item">
                    <span className="hero-meta-value">
                      <Counter to={stat.value} decimals={stat.decimals} suffix={stat.suffix} />
                    </span>
                    <span className="t-mono-sm">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="enter" style={{ animationDelay: "200ms" }}>
              <CoinStage />
            </div>
          </div>
        </div>
      </section>

      {/* ── Press ───────────────────────────────────────────────────────── */}
      <section className="section-tight press-band">
        <div className="shell">
          <p className="t-mono press-band-label">{t("featuredOn")}</p>
        </div>
        <Marquee speed={54}>
          {PRESS_LOGOS.map((logo) => (
            <span key={logo.src} className="logo-wall-item">
              <Image src={`/images/${logo.src}`} alt={logo.alt} width={120} height={40} style={{ height: "auto" }} />
            </span>
          ))}
        </Marquee>
      </section>

      {/* ── The film ────────────────────────────────────────────────────── */}
      <section className="section-tight">
        <div className="shell">
          <VideoReveal />
        </div>
      </section>

      {/* ── Walk through the app ────────────────────────────────────────── */}
      <section className="section">
        <div className="shell">
          <AppWalkthrough />
        </div>
      </section>

      {/* ── Collectibles ────────────────────────────────────────────────── */}
      <section className="section section-sunken">
        <div className="shell">
          <CollectiblesSection />
        </div>
      </section>

      {/* ── What else can be placed ─────────────────────────────────────── */}
      <section className="section">
        <div className="shell">
          <div className="sec-head reveal">
            <p className="eyebrow">{t("beyondEyebrow")}</p>
            <h2 className="t-h2">{t("beyondTitle")}</h2>
            <p className="t-lead" style={{ marginTop: "1.25rem" }}>
              {t("beyondLead")}
            </p>
          </div>

          <div className="reveal" style={{ marginTop: "3rem" }}>
            <OffersSection />
          </div>

          {/* Contextual link out to the business trechter. Publishers who
              read Beyond-coins are the audience for /business — this hand-off
              was missing, so the section dead-ended and everything below it
              stayed a seeker narrative. */}
          <div className="reveal" style={{ marginTop: "2.5rem" }}>
            <Link href="/business" prefetch={false} className="arrow-link">
              {t("placeReward")}
              <ArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section className="section section-sunken">
        <div className="shell">
          <div className="sec-head reveal">
            <p className="eyebrow">{t("howEyebrow")}</p>
            <h2 className="t-h2">{t("howTitle")}</h2>
            <p className="t-lead" style={{ marginTop: "1.25rem" }}>
              {t("futureDesc")}
            </p>
          </div>

          <div className="steps" style={{ marginTop: "3rem" }}>
            {steps.map((step, i) => (
              <div key={step.id} className="step reveal">
                <span className="t-mono step-index">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="t-h3 step-title">{step.title}</h3>
                  <p className="t-mono-sm">{step.meta}</p>
                </div>
                <p className="t-body step-body">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature set ─────────────────────────────────────────────────── */}
      <section className="section">
        <div className="shell">
          <FeatureGroups />
        </div>
      </section>

      {/* ── AR ──────────────────────────────────────────────────────────── */}
      <ARSection />

      {/* ── Mobi ────────────────────────────────────────────────────────── */}
      <section className="section section-inverse mobi-band">
        <div className="grid-field grid-field-full" aria-hidden="true" />
        <div className="noise-layer" aria-hidden="true" />
        <div className="shell">
          <MobiSection />
        </div>
      </section>

      {/* ── Progression ─────────────────────────────────────────────────── */}
      <section className="section">
        <div className="shell">
          <ProgressionSection />
        </div>
      </section>

      {/* ── Orbit to street level, flown into the phone ─────────────────── */}
      <WorldDescent />

      {/* ── The live network, up close ──────────────────────────────────── */}
      <section className="section section-sunken">
        <div className="shell">
          <div className="sec-head-center reveal" style={{ marginBottom: "3rem" }}>
            <p className="eyebrow eyebrow-center">{t("liveEyebrow")}</p>
            <h2 className="t-h2">{t("liveTitle")}</h2>
            <p className="t-lead" style={{ marginTop: "1.25rem" }}>
              {t("liveLead")}
            </p>
          </div>
          <GlobeSection />

          {/* The live network section is where a reader first sees the whole
              picture; hand them off to /ecosystem for the three-party
              structure instead of letting them scroll past to Clans without a
              route into the deeper page. */}
          <div className="reveal" style={{ marginTop: "2.5rem", textAlign: "center" }}>
            <Link href="/ecosystem" prefetch={false} className="arrow-link">
              {t("exploreEcosystem")}
              <ArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Clans ───────────────────────────────────────────────────────── */}
      <section className="section">
        <div className="shell">
          <ClansSection />
        </div>
      </section>

      {/* ── Referrals ───────────────────────────────────────────────────────
          Sits after clans and before social on purpose. Clans are the group you
          join; this is the group you build. Both are about playing with other
          people, and the two together are what the social band underneath is
          then talking about. It brings its own <section>, since the figure
          wants the full width rather than the shell. */}
      <ReferralSection />

      {/* ── Social ──────────────────────────────────────────────────────── */}
      <section className="section section-sunken">
        <div className="shell">
          <SocialSection />
        </div>
      </section>

      {/* ── Foundations ─────────────────────────────────────────────────── */}
      <section className="section section-sunken">
        <div className="shell">
          <div className="sec-head reveal">
            <p className="eyebrow">{t("foundationsEyebrow")}</p>
            <h2 className="t-h2">{t("threePathsTitle")}</h2>
          </div>

          <div className="grid-3" style={{ marginTop: "3rem" }}>
            {pillars.map((pillar, i) => (
              <article key={pillar.title} className="card pillar-card reveal">
                <span className="t-mono pillar-card-index">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="t-h3 pillar-card-title">{pillar.title}</h3>
                <p className="t-body">{pillar.desc}</p>
              </article>
            ))}
          </div>

          <div
            className="reveal"
            style={{
              marginTop: "2.5rem",
              display: "flex",
              flexWrap: "wrap",
              gap: "1.5rem 2rem",
              alignItems: "center",
            }}
          >
            {/* Sits about 18,000px down. Prefetching the whitepaper because it
                scrolled past costs 132 KB across four segment requests, at the
                depth where the tab was being killed. See SiteFooter.tsx for
                what `false` does and does not keep. */}
            <Link href="/whitepaper" prefetch={false} className="arrow-link">
              {t("readWhitepaper")}
              <ArrowRight />
            </Link>
            {/* Companion link out to the roadmap. Pillars answer "what is it?";
                readers who want "when?" belong on /roadmap, and the sitewide
                autoriteit that lands on `/en` should route to both, not one. */}
            <Link href="/roadmap" prefetch={false} className="arrow-link">
              {t("viewRoadmap")}
              <ArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
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

function StoreButtons({ appStore, play }: { appStore: string; play: string }) {
  return (
    <div className="store-buttons">
      <a
        href="https://apps.apple.com/app/seekar/id6752813761"
        target="_blank"
        rel="noopener noreferrer"
        className="store-button"
        aria-label={appStore}
      >
        <img src="/images/app-store.svg" alt="" loading="lazy" />
      </a>
      <a
        href="https://play.google.com/store/apps/details?id=com.seekar.seekar&pcampaignid=web_share"
        target="_blank"
        rel="noopener noreferrer"
        className="store-button"
        aria-label={play}
      >
        <img src="/images/google-play.svg" alt="" loading="lazy" />
      </a>
    </div>
  );
}

function ArrowRight() {
  return (
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
  );
}
