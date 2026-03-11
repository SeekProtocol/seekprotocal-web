"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <div className="utility-page-wrap">
      <div className="utility-page-content">
        <img
          src="https://d3e54v103j8qbb.cloudfront.net/static/page-not-found.211a85e40c.svg"
          alt="Page not found"
        />
        <h2>{t("pageNotFound")}</h2>
        <div>{t("pageNotFoundDesc")}</div>
      </div>
      <div className="_404-page-wrap">
        <div className="_404-image">
          <img
            src="/images/404_1404.avif"
            loading="lazy"
            alt="404"
            className="fit-cover"
          />
        </div>
        <div className="_404-text-wrap">
          <h4 className="h4 text-gray">{t("oops")}</h4>
          <div className="_404-button-wrap">
            <Link href="/" className="button-01 w-inline-block">
              <div className="button-text-icon-wrap">
                <div className="button-text-wrapper">
                  <div className="paragraph-02 text-black">{t("backToHome")}</div>
                  <div className="paragraph-02 text-black">{t("backToHome")}</div>
                </div>
                <div className="button-icon-wrapper">
                  <img
                    src="/images/Button-Icon-1.svg"
                    loading="lazy"
                    alt=""
                    className="button-icon"
                  />
                </div>
              </div>
              <div className="hover-color"></div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
