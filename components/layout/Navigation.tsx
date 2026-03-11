"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("nav");

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <div
      role="banner"
      className={`navbar-container w-nav ${isOpen ? "w--open" : ""}`}
      data-animation="default"
      data-collapse="medium"
      data-duration="600"
    >
      <div className="navbar-container-wrap">
        <div className="navbar-wrapper">
          <Link
            href="/"
            aria-current={pathname === "/" ? "page" : undefined}
            className={`navbar-brand w-nav-brand ${pathname === "/" ? "w--current" : ""}`}
          >
            <img
              loading="eager"
              src="/images/seekprotocol-logo.avif"
              alt="Seek Protocol"
              className="navbar-brand-logo"
            />
          </Link>
          <nav
            role="navigation"
            className="nav-menu-wrapper w-nav-menu"
            style={isOpen ? { display: "block" } : {}}
          >
            <ul role="list" className="nav-menus w-list-unstyled">
              <li className="nav-item">
                <Link
                  href="/"
                  className={`nav-link-text ${pathname === "/" ? "w--current" : ""}`}
                  onClick={() => setIsOpen(false)}
                >
                  {t("home")}
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  href="/about"
                  className={`nav-link-text ${pathname === "/about" ? "w--current" : ""}`}
                  onClick={() => setIsOpen(false)}
                >
                  {t("about")}
                </Link>
              </li>
              <li className="nav-item">
                <a
                  href="https://seekprotocol.gitbook.io/seekprotocol"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-link-text"
                >
                  {t("whitepaper")}
                </a>
              </li>
              <li className="nav-item show-tablet">
                <Link
                  href="/contact"
                  className={`nav-link-text ${pathname === "/contact" ? "w--current" : ""}`}
                  onClick={() => setIsOpen(false)}
                >
                  {t("contact")}
                </Link>
              </li>
              <li className="nav-item show-tablet">
                <LanguageSwitcher />
              </li>
            </ul>
          </nav>
          <div className="nav-right-wrap">
            <div className="nav-right">
              <div className="nav-button-wrapper">
                <ul role="list" className="nav-menus w-list-unstyled">
                  <li className="nav-item">
                    <Link
                      href="/contact"
                      className={`nav-link-text ${pathname === "/contact" ? "w--current" : ""}`}
                    >
                      {t("contact")}
                    </Link>
                  </li>
                  <li className="nav-item">
                    <LanguageSwitcher />
                  </li>
                </ul>
              </div>
            </div>
            <div
              className={`menu-button w-nav-button ${isOpen ? "w--open" : ""}`}
              onClick={toggleMenu}
              aria-label={t("toggleMenu")}
              role="button"
              tabIndex={0}
            >
              <div className="w-icon-nav-menu" style={{ fontSize: "24px", color: "white" }}>
                {isOpen ? "✕" : "☰"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
