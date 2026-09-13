import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getMultilingualAlternates, OG_IMAGE, getOpenGraph, getBreadcrumbJsonLd } from "@/lib/seo";
import ShopMount from "@/components/shop/ShopMount";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "shop" });
  const description = t("metaDescription");

  return {
    title: t("metaTitle"),
    description,
    openGraph: getOpenGraph({
      title: t("ogTitle"),
      description,
      path: `/${locale}/shop`,
      locale,
    }),
    twitter: {
      title: t("ogTitle"),
      description,
      images: [OG_IMAGE],
    },
    alternates: getMultilingualAlternates("/shop", locale),
  };
}

const breadcrumbJsonLd = getBreadcrumbJsonLd([{ name: "Shop", path: "/shop" }]);

/**
 * The pack shop. The head and the three-step strip are server-rendered copy;
 * everything that needs a session or a wallet lives behind `ShopMount`, which
 * is the client boundary and loads the shop only in the browser.
 */
export default async function ShopPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("shop");

  const steps = [
    { title: t("stepSignIn"), body: t("stepSignInBody") },
    { title: t("stepPay"), body: t("stepPayBody") },
    { title: t("stepOpen"), body: t("stepOpenBody") },
  ];

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
            <h1 className="t-h1 page-head-title">{t("title")}</h1>
            <p className="t-lead">{t("lead")}</p>
          </div>
        </div>
      </section>

      <section className="section section-tight">
        <div className="shell">
          <ShopMount />
        </div>
      </section>

      <section className="section section-tight section-sunken">
        <div className="shell">
          <p className="eyebrow">{t("howEyebrow")}</p>
          <div className="grid-3">
            {steps.map((step, i) => (
              <div key={step.title} className="card reveal">
                <p className="t-mono-sm" style={{ marginBottom: "0.75rem" }}>
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h2 className="t-h4" style={{ marginBottom: ".5rem" }}>
                  {step.title}
                </h2>
                <p className="t-body">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
