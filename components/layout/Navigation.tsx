"use client";

import { useState, useCallback, useEffect } from "react";
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

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

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
            data-nav-menu-open={isOpen || undefined}
            style={
              isOpen
                ? {
                    display: "block",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 99,
                    paddingTop: "80px",
                    overflowY: "auto",
                  }
                : {}
            }
          >
            <ul role="list" className="nav-menus">
              <li className="nav-item">
                <Link
                  href="/"
                  className={`nav-link-text ${pathname === "/" ? "w--current" : ""}`}
                  onClick={closeMenu}
                >
                  {t("home")}
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  href="/about"
                  className={`nav-link-text ${pathname === "/about" ? "w--current" : ""}`}
                  onClick={closeMenu}
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
                  onClick={closeMenu}
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
              aria-expanded={isOpen}
              role="button"
              tabIndex={0}
              style={{ position: "relative", zIndex: 100 }}
            >
              <span
                style={{
                  fontSize: "24px",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  height: "100%",
                  lineHeight: 1,
                }}
              >
                {isOpen ? "✕" : "☰"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
