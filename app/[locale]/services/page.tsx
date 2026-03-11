import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getMultilingualAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: "Services - AR, AI & Blockchain Solutions",
    description:
      "Explore Seek Protocol's services: location-based AR airdrops, AI-powered personalization, immersive AR experiences, move-to-earn gaming, creator tools, and blockchain reward distribution on Solana.",
    openGraph: {
      title: "Seek Protocol Services - AR, AI & Blockchain Solutions",
      description:
        "Location-based AR airdrops, AI-powered personalization, immersive experiences, move-to-earn, and blockchain rewards. Discover what Seek Protocol can do.",
      url: `/${locale}/services`,
      images: [
        {
          url: "https://cdn.prod.website-files.com/689dda35eca0c273668f15aa/68b7ea7afbe50cfcdef0c342_SeekAR%20(30).png",
          width: 1200,
          height: 630,
          alt: "Seek Protocol Services",
        },
      ],
    },
    twitter: {
      title: "Seek Protocol Services - AR, AI & Blockchain",
      description:
        "AR airdrops, AI personalization, move-to-earn, and blockchain rewards on Solana. Explore Seek Protocol's full service offering.",
    },
    alternates: getMultilingualAlternates("/services", locale),
  };
}

const servicesFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What services does Seek Protocol offer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Seek Protocol offers location-based AR airdrops, AI-powered personalization, immersive AR experiences, move-to-earn gaming, creator tools via the Seek Panel, and blockchain reward distribution on Solana.",
      },
    },
    {
      "@type": "Question",
      name: "How does location-based AR airdrop distribution work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Using advanced geofencing technology, projects can place digital assets at specific GPS coordinates with sub-meter accuracy. Users discover and collect these rewards through the SeekAR app by physically visiting the locations.",
      },
    },
    {
      "@type": "Question",
      name: "What is the Seek Panel?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Seek Panel is a drag-and-drop tool that empowers creators and projects to deploy AR campaigns at scale. You can choose exact coordinates, set reward parameters, and track engagement in real-time without needing AR specialists.",
      },
    },
    {
      "@type": "Question",
      name: "How much does it cost to use Seek Protocol services?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Pricing is flexible and based on the module you select: Small, Medium, or Large. Each module offers different levels of visibility and branding space on the map. Contact us to discuss your specific project needs.",
      },
    },
    {
      "@type": "Question",
      name: "Who can use Seek Protocol services?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Seek Protocol works with small businesses and startups, e-commerce brands, agencies and consultants, local businesses, and large corporations looking to engage audiences through location-based AR experiences on the Solana blockchain.",
      },
    },
  ],
};

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ServicesContent />;
}

function ServicesContent() {
  const t = useTranslations("services");

  const expertiseItems = [
    { titleKey: "businessStrategy" as const, descKey: "businessStrategyDesc" as const },
    { titleKey: "visualDirection" as const, descKey: "visualDirectionDesc" as const },
    { titleKey: "websiteCreation" as const, descKey: "websiteCreationDesc" as const },
    { titleKey: "contentSolutions" as const, descKey: "contentSolutionsDesc" as const },
    { titleKey: "campaignExecution" as const, descKey: "campaignExecutionDesc" as const },
    { titleKey: "uiuxSystems" as const, descKey: "uiuxSystemsDesc" as const },
    { titleKey: "growthTactics" as const, descKey: "growthTacticsDesc" as const },
    { titleKey: "copywriting" as const, descKey: "copywritingDesc" as const },
  ];

  const pricingItems = [
    { icon: "Net-Icon.svg", titleKey: "smallModule" as const, descKey: "smallModuleDesc" as const },
    { icon: "sun.svg", titleKey: "mediumModule" as const, descKey: "mediumModuleDesc" as const },
    { icon: "container.svg", titleKey: "largeModule" as const, descKey: "largeModuleDesc" as const },
  ];

  const workWithItems = [
    { icon: "Work-Icon.svg", titleKey: "smallBusinesses" as const, descKey: "smallBusinessesDesc" as const },
    { icon: "Work-Icon-4.svg", titleKey: "ecommerce" as const, descKey: "ecommerceDesc" as const },
    { icon: "Work-Icon-1.svg", titleKey: "agencies" as const, descKey: "agenciesDesc" as const },
    { icon: "Work-Icon-2.svg", titleKey: "localBusinesses" as const, descKey: "localBusinessesDesc" as const },
    { icon: "Work-Icon-3.svg", titleKey: "largeCorporations" as const, descKey: "largeCorporationsDesc" as const },
  ];

  return (
    <div className="page-wrapper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesFaqJsonLd) }}
      />
      {/* Hero */}
      <section className="service-hero">
        <div className="container">
          <div className="service-hero-wrap">
            <div className="hero-top-wrap">
              <div className="hero-01-text-wrap">
                <h1
                  data-w-id="services-title"
                  style={{ opacity: 0, transform: "translate3d(0, 20%, 0)", filter: "blur(3px)" }}
                  className="h1"
                >
                  {t("heroTitle")}
                </h1>
                <p
                  data-w-id="services-desc"
                  style={{ opacity: 0, transform: "translate3d(0, 20%, 0)", filter: "blur(3px)" }}
                  className="paragraph-03 text-gray-color"
                >
                  {t("heroDesc")}
                </p>
              </div>
              <div
                data-w-id="services-btn"
                style={{ opacity: 0, transform: "translate3d(0, 20%, 0)", filter: "blur(3px)" }}
                className="hero-01-bottom-wrap"
              >
                <Link href="/contact" className="button-01 w-inline-block">
                  <div className="button-text-icon-wrap">
                    <div className="button-text-wrapper">
                      <div className="paragraph-02 text-black">{t("letsContact")}</div>
                      <div className="paragraph-02 text-black">{t("letsContact")}</div>
                    </div>
                    <div className="button-icon-wrapper">
                      <img src="/images/Button-Icon-1.svg" loading="lazy" alt="" className="button-icon" />
                    </div>
                  </div>
                  <div className="hover-color"></div>
                </Link>
              </div>
            </div>
            <div className="expertise-bottom-wrap">
              {expertiseItems.map((item, idx) => (
                <div key={`${item.titleKey}-${idx}`} className="expetise-card-list">
                  <div className="expertise-card-text-wrap">
                    <div className="expetise-card-text">
                      <h3 className="h4">{t(item.titleKey)}</h3>
                      <p className="paragraph-03 text-gray-color">{t(item.descKey)}</p>
                    </div>
                    <div className="expetise-card-button">
                      <Link href="/contact" className="button-04 w-inline-block">
                        <div className="button-text-icon-wrap _01">
                          <div className="button-text-wrapper">
                            <div className="paragraph-02">{t("details")}</div>
                            <div className="paragraph-02 text-black">{t("details")}</div>
                          </div>
                          <div className="button-icon-wrapper">
                            <img loading="lazy" src="/images/Button-Icon-Blue.svg" alt="" className="button-icon _001" />
                            <img loading="lazy" src="/images/Button-Icon-1.svg" alt="" className="button-icon _01" />
                          </div>
                        </div>
                        <div className="hover-color bg-primary-color _01"></div>
                      </Link>
                    </div>
                  </div>
                  <div className="border-square" style={{ transform: "translate3d(-1%, -90%, 0)" }}></div>
                  <div className="glow-main-block">
                    <div style={{ opacity: 0 }} className="glow-block"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="custom-solution">
        <div className="container">
          <div className="custom-solution-wrap">
            <div className="custom-solution-top-wrap">
              <div className="heading-top-full-wrap">
                <div className="heading-wrap solution-heading">
                  <h2 className="h2">{t("pricingTitle")}</h2>
                </div>
                <div className="sub-heading-wrap solution-sub-heading">
                  <p className="paragraph-03 text-gray-color">{t("pricingDesc")}</p>
                  <p className="paragraph-03">{t("pricingQuestion")}</p>
                </div>
              </div>
              <div
                data-w-id="pricing-btn"
                style={{ opacity: 0, transform: "translate3d(0, 20%, 0)", filter: "blur(3px)" }}
                className="heading-top-button-wrap"
              >
                <Link href="/contact" className="button-01 cta-call-button w-inline-block">
                  <div className="button-text-icon-wrap">
                    <div className="button-icon-wrapper">
                      <img loading="lazy" alt="" src="/images/calendar-plus-02.svg" className="button-icon" />
                    </div>
                    <div className="button-text-wrapper">
                      <div className="paragraph-02 text-black">{t("scheduleConsultation")}</div>
                      <div className="paragraph-02 text-black">{t("scheduleConsultation")}</div>
                    </div>
                  </div>
                  <div className="hover-color"></div>
                </Link>
              </div>
            </div>
            <div className="custom-solution-bottom-wrap _02">
              {pricingItems.map((item) => (
                <div key={item.titleKey} className="custom-solution-box">
                  <div className="custom-solution-icon-wrap">
                    <img src={`/images/${item.icon}`} loading="lazy" alt={t(item.titleKey)} className="icon" />
                  </div>
                  <div className="solution-details">
                    <h3 className="h4">{t(item.titleKey)}</h3>
                    <p className="paragraph-03 text-gray-color">{t(item.descKey)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Who We Work With */}
      <section className="we-work">
        <div className="container">
          <div className="we-work-wrrap">
            <div
              data-w-id="work-top"
              style={{ opacity: 0, transform: "translate3d(0, 20%, 0)", filter: "blur(3px)" }}
              className="we-work-top-wrap"
            >
              <h2 className="h2">{t("whoWeWorkWith")}</h2>
              <Link href="/contact" className="button-01 w-inline-block">
                <div className="button-text-icon-wrap">
                  <div className="button-text-wrapper">
                    <div className="paragraph-02 text-black">{t("letsContact")}</div>
                    <div className="paragraph-02 text-black">{t("letsContact")}</div>
                  </div>
                  <div className="button-icon-wrapper">
                    <img src="/images/Button-Icon-1.svg" loading="lazy" alt="" className="button-icon" />
                  </div>
                </div>
                <div className="hover-color"></div>
              </Link>
            </div>
            <div className="we-work-bottom-wrap">
              {workWithItems.map((item) => (
                <div key={item.titleKey} className="work-list">
                  <div className="work-icon-wrap">
                    <img src={`/images/${item.icon}`} loading="lazy" alt={t(item.titleKey)} className="fit-cover" />
                  </div>
                  <div className="work-text-wrap">
                    <h4 className="h4">{t(item.titleKey)}</h4>
                    <p className="paragraph-03 text-gray-color">{t(item.descKey)}</p>
                  </div>
                  <div className="glow-main-block">
                    <div className="glow-block"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-v1">
        <div className="container">
          <div className="cta-v1-wrap">
            <div className="cta-v1-text-wrap">
              <div className="paragraph-01 text-primary-color">{t("ctaConnect")}</div>
              <h2 className="h1 align-center">{t("ctaTitle")}</h2>
            </div>
            <div className="cta-v1-button-wrap">
              <Link href="/contact" className="button-01 cta-button w-inline-block">
                <div className="button-text-icon-wrap">
                  <div className="button-text-wrapper">
                    <div className="paragraph-02 text-black">{t("letsContact")}</div>
                    <div className="paragraph-02 text-black">{t("letsContact")}</div>
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
      </section>
    </div>
  );
}
