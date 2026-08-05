import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getMultilingualAlternates, OG_IMAGE } from "@/lib/seo";
import styles from "./privacy-policy.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacyPolicyPage" });
  const description = t("metaDescription");

  return {
    title: t("metaTitle"),
    description,
    openGraph: {
      title: t("ogTitle"),
      description,
      url: `/${locale}/privacy-policy`,
      images: [OG_IMAGE],
    },
    twitter: {
      title: t("ogTitle"),
      description,
      images: [OG_IMAGE],
    },
    alternates: getMultilingualAlternates("/privacy-policy", locale),
  };
}

function PrivacyPolicyContent() {
  const t = useTranslations("privacyPolicyPage");

  return (
    <div className={styles.content}>
      <p className={styles.subtitle}>
        {t("subtitle1")}
        <br />
        {t("subtitle2")}
      </p>

      <h2>{t("introTitle")}</h2>
      <p>{t("introP1")}</p>
      <p>{t("introP2")}</p>
      <p>{t("introP3")}</p>

      <h2>{t("part1Title")}</h2>
      <p>{t("part1P1")}</p>
      <p>{t("part1P2")}</p>
      <p>{t("part1P3")}</p>

      <h3>{t("part1s1Title")}</h3>
      <p>{t("part1s1P1")}</p>

      <h3>{t("part1s2Title")}</h3>
      <p>{t("part1s2P1")}</p>
      <p>{t("part1s2P2")}</p>
      <p>{t("part1s2P3")}</p>
      <p>{t("part1s2P4")}</p>

      <h3>{t("part1s3Title")}</h3>
      <p>{t("part1s3P1")}</p>
      <p>{t("part1s3P2")}</p>
      <p>{t("part1s3P3")}</p>

      <h3>{t("part1s4Title")}</h3>
      <p>{t("part1s4P1")}</p>
      <p>{t("part1s4P2")}</p>
      <p>{t("part1s4P3")}</p>
      <p>{t("part1s4P4")}</p>

      <h3>{t("part1s5Title")}</h3>
      <p>{t("part1s5P1")}</p>

      <h3>{t("part1s6Title")}</h3>
      <p>{t("part1s6P1")}</p>
      <p>{t("part1s6P2")}</p>
      <p>{t("part1s6P3")}</p>

      <h3>{t("part1s7Title")}</h3>
      <p>{t("part1s7P1")}</p>
      <p>{t("part1s7P2")}</p>
      <p>{t("part1s7P3")}</p>

      <h3>{t("part1s8Title")}</h3>
      <p>{t("part1s8P1")}</p>

      <h3>{t("part1s9Title")}</h3>
      <p>{t("part1s9P1")}</p>
      <p>{t("part1s9P2")}</p>

      <h2>{t("part2Title")}</h2>
      <p>{t("part2P1")}</p>
      <p>{t("part2P2")}</p>
      <p>{t("part2P3")}</p>
      <ul role="list">
        <li>
          <a href="https://www.google.com/policies/privacy/">
            Google Play Services
          </a>
        </li>
        <li>
          <a href="https://unity3d.com/legal/privacy-policy">Unity</a>
        </li>
        <li>
          <a href="https://www.mapbox.com/legal/privacy">Mapbox</a>
        </li>
      </ul>

      <h2>{t("part3Title")}</h2>
      <p>{t("part3P1")}</p>
      <p>{t("part3P2")}</p>
      <p>{t("part3P3")}</p>

      <h2>{t("part4Title")}</h2>
      <p>{t("part4P1")}</p>
      <p>
        {t.rich("part4P2", {
          email: (chunks) => (
            <a href="mailto:support@seekprotocol.ai">{chunks}</a>
          ),
        })}
      </p>

      <h2>{t("part5Title")}</h2>
      <p>
        {t.rich("part5P1", {
          email: (chunks) => (
            <a href="mailto:support@seekprotocol.ai">{chunks}</a>
          ),
        })}
      </p>

      <h2>{t("part6Title")}</h2>
      <p>{t("part6P1")}</p>

      <h2>{t("part7Title")}</h2>
      <p>
        {t("part7P1")}{" "}
        <a href="https://www.seekprotocol.ai/">https://www.seekprotocol.ai/</a>
      </p>
      <p>
        {t.rich("part7P2", {
          email: (chunks) => (
            <a href="mailto:support@seekprotocol.ai">{chunks}</a>
          ),
        })}
      </p>

      <h2>{t("part8Title")}</h2>
      <p>{t("part8P1")}</p>

      <h2>{t("consentTitle")}</h2>
      <p>{t("consentP1")}</p>

      <h2>{t("contactTitle")}</h2>
      <p>{t("contactP1")}</p>
      <p>
        {t("contactAddress")
          .split("\n")
          .map((line, i, arr) => (
            <span key={i}>
              {line}
              {i < arr.length - 1 && <br />}
            </span>
          ))}
      </p>
      <p>
        Email:{" "}
        <a href="mailto:support@seekprotocol.ai">support@seekprotocol.ai</a>
        <br />
        Website:{" "}
        <a href="https://www.seekprotocol.ai">https://www.seekprotocol.ai</a>
      </p>
    </div>
  );
}

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PrivacyPolicyPageContent />;
}

function PrivacyPolicyPageContent() {
  const t = useTranslations("privacyPolicyPage");

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
            <PrivacyPolicyContent />
          </div>
        </div>
      </section>
    </>
  );
}
