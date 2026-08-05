"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SeekMark } from "@/components/brand/SeekLogo";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <section className="notfound">
      <div className="grid-field grid-field-full" aria-hidden="true" />
        <div className="noise-layer" aria-hidden="true" />
      <div className="shell notfound-inner">
        <div className="notfound-mark" aria-hidden="true">
          <span className="radar-static notfound-ring" style={{ width: "100%" }} />
          <span className="radar-static notfound-ring" style={{ width: "66%" }} />
          <SeekMark size={56} gradientId="notfound-mark" />
        </div>

        <p className="t-mono notfound-code">Error 404 · No signal at this coordinate</p>
        <h1 className="t-h1 notfound-title">{t("pageNotFound")}</h1>
        <p className="t-lead notfound-desc">{t("pageNotFoundDesc")}</p>

        <div className="btn-row notfound-actions">
          <Link href="/" className="btn btn-brand btn-lg">
            {t("backToHome")}
          </Link>
          <Link href="/ecosystem" className="btn btn-outline btn-lg">
            {t("oops")}
          </Link>
        </div>
      </div>
    </section>
  );
}
