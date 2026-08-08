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
    /* `metaTitle` is the whole title, and it leads with SeekAR.

       The layout's `%s | Seek Protocol` template never reaches this page — it
       applies to *child* segments, and this page sits in the same segment as
       the layout that declares it — so the suffix used to be appended here by
       hand. It is gone on purpose.

       SeekAR is the name of the app, and therefore the name people type. The
       site said "Seek Protocol" in the title, the H1 and the domain and said
       SeekAR nowhere Google weighs heavily, so it ranked for the app's own name
       nowhere at all while an unrelated seekar.io took the result. The parent
       brand is not lost: it stays in og:site_name, the Organization schema, the
       breadcrumbs, the footer and the legal pages.

       Longest of the eight is Spanish at 48, well inside the ~60 Google
       renders. There is no room for both names — "SeekAR | The First AR & AI
       Platform on Solana | Seek Protocol" is 61 in English and 67 in French. */
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
        </div>
      </section>

      {/* ── Clans ───────────────────────────────────────────────────────── */}
      <section className="section">
        <div className="shell">
          <ClansSection />
        </div>
      </section>

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

          <div className="reveal" style={{ marginTop: "2.5rem" }}>
            {/* Sits about 18,000px down. Prefetching the whitepaper because it
                scrolled past costs 132 KB across four segment requests, at the
                depth where the tab was being killed. See SiteFooter.tsx for
                what `false` does and does not keep. */}
            <Link href="/whitepaper" prefetch={false} className="arrow-link">
              {t("readWhitepaper")}
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
