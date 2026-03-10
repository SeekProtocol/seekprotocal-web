import Link from "next/link";
import CookieConsentButton from "@/components/shared/CookieConsentButton";

export default function Footer() {
  return (
    <section className="footer">
      <div className="container">
        <div className="footer-wrap">
          <div className="footer-top-wrap">
            <div className="footer-left-wrap">
              <div className="footer-link-list">
                <Link href="/" className="footer-link w-inline-block">
                  <div className="footer-link-text">Home</div>
                  <div className="footer-link-text absolute-link">Home</div>
                  <div className="link-under-line"></div>
                </Link>
                <Link href="/about" className="footer-link w-inline-block">
                  <div className="footer-link-text">About</div>
                  <div className="footer-link-text absolute-link">About</div>
                  <div className="link-under-line"></div>
                </Link>
                <Link href="/contact" className="footer-link w-inline-block">
                  <div className="footer-link-text">Contact</div>
                  <div className="footer-link-text absolute-link">Contact</div>
                  <div className="link-under-line"></div>
                </Link>
                <Link href="/blog" className="footer-link w-inline-block">
                  <div className="footer-link-text">Blog</div>
                  <div className="footer-link-text absolute-link">Blog</div>
                  <div className="link-under-line"></div>
                </Link>
                <a
                  href="https://seekprotocol.gitbook.io/seekprotocol"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link w-inline-block"
                >
                  <div className="footer-link-text">Whitepaper</div>
                  <div className="footer-link-text absolute-link">Whitepaper</div>
                  <div className="link-under-line"></div>
                </a>
                <a
                  href="https://dashboard.seekprotocol.ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link w-inline-block"
                >
                  <div className="footer-link-text">Token Dashboard</div>
                  <div className="footer-link-text absolute-link">Token Dashboard</div>
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
                <p className="paragraph-03">
                  Block Protocol L.L.C-FZ Meydan Grandstand, 6th floor, Meydan
                  Road, Nad AlSheba, Dubai, U.A.E.
                </p>
                <p className="paragraph-03 text-gray-color">
                  Seek Protocol is a next-gen platform developed by Block Protocol
                  L.L.C-FZ, combining augmented reality, AI, and blockchain to
                  create real-world gamified experiences.
                </p>
              </div>
            </div>
          </div>
          <div className="footer-bottom-wrap">
            <p className="paragraph-04">
              © 2024-2026 Block Protocol All rights reserved
            </p>
            <div className="copyright-link-wrap">
              <a
                href="https://t.me/+Nrn7K1pRN9M3OTU0"
                target="_blank"
                rel="noopener noreferrer"
                className="w-inline-block"
              >
                <img
                  src="/images/telegram.svg"
                  loading="lazy"
                  width="27"
                  alt="Telegram"
                />
              </a>
              <a
                href="https://x.com/seekprotocol"
                target="_blank"
                rel="noopener noreferrer"
                className="w-inline-block"
              >
                <img
                  src="/images/twitter.svg"
                  loading="lazy"
                  width="27"
                  alt="X (Twitter)"
                />
              </a>
              <Link
                href="/privacy-policy"
                className="copyright-link paragraph-04"
              >
                Privacy Policy
              </Link>
              <div className="horizontal-divider"></div>
              <Link
                href="/terms-conditions"
                className="copyright-link paragraph-04"
              >
                Terms of Service
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
