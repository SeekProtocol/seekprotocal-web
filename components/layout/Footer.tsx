import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import CookieConsentButton from "@/components/shared/CookieConsentButton";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <section className="footer">
      <div className="container">
        <div className="footer-wrap">
          <div className="footer-top-wrap">
            <div className="footer-left-wrap">
              <div className="footer-link-list">
                <Link href="/" className="footer-link w-inline-block">
                  <div className="footer-link-text">{t("home")}</div>
                  <div className="footer-link-text absolute-link">{t("home")}</div>
                  <div className="link-under-line"></div>
                </Link>
                <Link href="/about" className="footer-link w-inline-block">
                  <div className="footer-link-text">{t("about")}</div>
                  <div className="footer-link-text absolute-link">{t("about")}</div>
                  <div className="link-under-line"></div>
                </Link>
                <Link href="/contact" className="footer-link w-inline-block">
                  <div className="footer-link-text">{t("contact")}</div>
                  <div className="footer-link-text absolute-link">{t("contact")}</div>
                  <div className="link-under-line"></div>
                </Link>
                <Link href="/blog" className="footer-link w-inline-block">
                  <div className="footer-link-text">{t("blog")}</div>
                  <div className="footer-link-text absolute-link">{t("blog")}</div>
                  <div className="link-under-line"></div>
                </Link>
                <a
                  href="https://seekprotocol.gitbook.io/seekprotocol"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link w-inline-block"
                >
                  <div className="footer-link-text">{t("whitepaper")}</div>
                  <div className="footer-link-text absolute-link">{t("whitepaper")}</div>
                  <div className="link-under-line"></div>
                </a>
                <a
                  href="https://dashboard.seekprotocol.ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link w-inline-block"
                >
                  <div className="footer-link-text">{t("tokenDashboard")}</div>
                  <div className="footer-link-text absolute-link">{t("tokenDashboard")}</div>
                  <div className="link-under-line"></div>
                </a>
              </div>
            </div>
            <div className="footer-right-wrap">
              <Link href="/" className="footer-logo-wrap w-inline-block">
                <img
                  src="/images/seekprotocol-logo.avif"
                  loading="lazy"
                  alt="Seek Protocol"
                  className="footer-logo"
                />
              </Link>
              <div className="footer-text-wrap">
                <p className="paragraph-03">{t("address")}</p>
                <p className="paragraph-03 text-gray-color">{t("description")}</p>
              </div>
            </div>
          </div>
          <div className="footer-bottom-wrap">
            <p className="paragraph-04">{t("copyright")}</p>
            <div className="copyright-link-wrap">
              <a
                href="https://t.me/+Nrn7K1pRN9M3OTU0"
                target="_blank"
                rel="noopener noreferrer"
                className="w-inline-block"
              >
                <img src="/images/telegram.svg" loading="lazy" width="27" alt="Telegram" />
              </a>
              <a
                href="https://x.com/seekprotocol"
                target="_blank"
                rel="noopener noreferrer"
                className="w-inline-block"
              >
                <img src="/images/twitter.svg" loading="lazy" width="27" alt="X (Twitter)" />
              </a>
              <Link href="/privacy-policy" className="copyright-link paragraph-04">
                {t("privacyPolicy")}
              </Link>
              <div className="horizontal-divider"></div>
              <Link href="/terms-conditions" className="copyright-link paragraph-04">
                {t("termsOfService")}
              </Link>
              <div className="horizontal-divider"></div>
              <CookieConsentButton className="copyright-link paragraph-04" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
