import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getMultilingualAlternates, OG_IMAGE, getBreadcrumbJsonLd } from "@/lib/seo";
import { MEASUREMENT, USE_CASES } from "@/content/business";
import { listCopy, withCopy } from "@/lib/content-i18n";
import DeployConsole from "@/components/business/DeployConsole";
import AttentionFunnel from "@/components/business/AttentionFunnel";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "businessPage" });
  const description = t("metaDescription");

  return {
    title: t("metaTitle"),
    description,
    alternates: getMultilingualAlternates("/business", locale),
    openGraph: {
      title: t("ogTitle"),
      description,
      url: `/${locale}/business`,
      images: [OG_IMAGE],
    },
    twitter: {
      title: t("ogTitle"),
      description,
      images: [OG_IMAGE],
    },
  };
}

const breadcrumbJsonLd = getBreadcrumbJsonLd([
  { name: "For business", path: "/business" },
]);

export default async function BusinessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <BusinessContent />;
}

function BusinessContent() {
  const t = useTranslations("businessPage");
  const cases = useTranslations("useCases");
  const useCases = withCopy(cases, USE_CASES, ["label", "metric", "title", "body"]);
  const measurement = withCopy(useTranslations("measurement"), MEASUREMENT, [
    "label",
    "value",
  ]);

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
            <p className="eyebrow">{t("eyebrow")}</p>
            <h1 className="t-h1 page-head-title">
              {t("titleStart")} <span className="text-gradient">{t("titleAccent")}</span>
            </h1>
            <p className="t-lead">{t("lead")}</p>
            <div className="btn-row" style={{ marginTop: "2rem" }}>
              <Link href="/contact" className="btn btn-brand btn-lg">
                {t("ctaTalk")}
              </Link>
              <Link href="/whitepaper" className="btn btn-outline btn-lg">
                {t("ctaVerification")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------- */}
      <section className="section">
        <div className="shell">
          <div className="sec-head reveal">
            <p className="eyebrow">{t("argumentEyebrow")}</p>
            <h2 className="t-h2">{t("argumentTitle")}</h2>
            <p className="t-lead" style={{ marginTop: "1.25rem" }}>
              {t("argumentLead")}
            </p>
          </div>

          <div className="reveal" style={{ marginTop: "3rem" }}>
            <AttentionFunnel />
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------- */}
      <section className="section section-sunken">
        <div className="shell">
          <div className="sec-head reveal">
            <p className="eyebrow">{t("useCasesEyebrow")}</p>
            <h2 className="t-h2">{t("useCasesTitle")}</h2>
          </div>

          <div className="usecase-grid">
            {useCases.map((useCase) => (
              <article key={useCase.id} className="card card-hover usecase reveal">
                <div className="usecase-head">
                  <span className="t-mono">{useCase.label}</span>
                  <span className="chip chip-brand">{useCase.metric}</span>
                </div>
                <h3 className="t-h3 usecase-title">{useCase.title}</h3>
                <p className="t-body">{useCase.body}</p>
                <ul className="usecase-list">
                  {listCopy(cases, `${useCase.id}.points`).map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------- */}
      <section className="section">
        <div className="shell">
          <div className="sec-head reveal">
            <p className="eyebrow">{t("setupEyebrow")}</p>
            <h2 className="t-h2">{t("setupTitle")}</h2>
            <p className="t-lead" style={{ marginTop: "1.25rem" }}>
              {t("setupLead")}
            </p>
          </div>

          <div className="reveal" style={{ marginTop: "3rem" }}>
            <DeployConsole />
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------- */}
      <section className="section">
        <div className="shell">
          <div className="measure-layout">
            <div className="sec-head reveal">
              <p className="eyebrow">{t("measurementEyebrow")}</p>
              <h2 className="t-h2">{t("measurementTitle")}</h2>
              <p className="t-body" style={{ marginTop: "1.25rem" }}>
                {t("measurementLead")}
              </p>
            </div>

            <div className="wp-specs reveal">
              {measurement.map((row) => (
                <div key={row.id} className="wp-spec-row">
                  <span className="t-mono">{row.label}</span>
                  <span className="wp-spec-value">{row.value}</span>
                </div>
              ))}
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
                <Link href="/contact" className="btn btn-brand btn-lg">
                  {t("ctaStart")}
                </Link>
                <Link href="/roadmap" className="btn btn-outline btn-lg">
                  {t("ctaRoadmap")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
