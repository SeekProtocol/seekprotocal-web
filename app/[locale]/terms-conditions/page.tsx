import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getMultilingualAlternates, OG_IMAGE } from "@/lib/seo";
import styles from "../privacy-policy/privacy-policy.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "termsPage" });
  const description = t("metaDescription");

  return {
    title: t("metaTitle"),
    description,
    openGraph: {
      title: t("ogTitle"),
      description,
      url: `/${locale}/terms-conditions`,
      images: [OG_IMAGE],
    },
    twitter: {
      title: t("ogTitle"),
      description,
      images: [OG_IMAGE],
    },
    alternates: getMultilingualAlternates("/terms-conditions", locale),
  };
}

function TermsContent() {
  const t = useTranslations("termsPage");

  return (
    <div className={styles.content}>
      <p className={styles.subtitle}>
        {t("subtitle1")}
        <br />
        {t("subtitle2")}
      </p>

      <p>{t("p1")}</p>
      <p>{t("p2")}</p>
      <p>{t("p3")}</p>
      <p>{t("p4")}</p>
      <p>{t("thirdPartyIntro")}</p>
      <ul role="list">
        <li>
          <a href="https://play.google.com/intl/en_US/about/play-terms/">
            Google Play Services
          </a>
        </li>
        <li>
          <a href="https://unity.com/legal/terms-of-service">Unity</a>
        </li>
        <li>
          <a href="https://www.mapbox.com/legal/tos">Mapbox</a>
        </li>
      </ul>
      <p>{t("p6")}</p>
      <p>{t("p7")}</p>
      <p>{t("p8")}</p>
      <p>{t("p9")}</p>
      <p>{t("p10")}</p>

      <h2>{t("changesTitle")}</h2>
      <p>{t("changesP1")}</p>

      <h2>{t("contactTitle")}</h2>
      <p>
        {t.rich("contactP1", {
          email: (chunks) => (
            <a href="mailto:support@seekprotocol.ai">{chunks}</a>
          ),
        })}
      </p>
    </div>
  );
}

export default async function TermsConditionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <TermsPageContent />;
}

function TermsPageContent() {
  const t = useTranslations("termsPage");

  return (
    <>
      <section className="page-head">
        <div className="grid-field" aria-hidden="true" />
        <div className="noise-layer" aria-hidden="true" />
        <div className="shell">
          <div className="page-head-inner">
            <p className="eyebrow">Legal</p>
            <h1 className="t-h1 page-head-title">{t("title")}</h1>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="legal-body">
            <TermsContent />
          </div>
        </div>
      </section>
    </>
  );
}
