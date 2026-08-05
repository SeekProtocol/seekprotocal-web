"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import SeekLogo from "@/components/brand/SeekLogo";
import ThemeToggle from "@/components/theme/ThemeToggle";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";

const LINKS = [
  { href: "/ecosystem", key: "ecosystem" },
  { href: "/whitepaper", key: "whitepaper" },
  { href: "/roadmap", key: "roadmap" },
  { href: "/business", key: "business" },
  { href: "/about", key: "about" },
  { href: "/blog", key: "blog" },
] as const;

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("nav");

  const close = useCallback(() => setOpen(false), []);

  // Close the mobile sheet on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="site-header" data-open={open || undefined}>
      <div className="site-header-inner shell-wide">
        <Link href="/" className="site-header-brand" aria-label="Seek Protocol">
          <SeekLogo markSize={42} />
        </Link>

        <nav className="site-nav" aria-label="Main">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="site-nav-link"
              data-active={isActive(link.href) || undefined}
              aria-current={isActive(link.href) ? "page" : undefined}
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>

        <div className="site-header-actions">
          <ThemeToggle />
          <div className="site-header-lang">
            <LanguageSwitcher />
          </div>
          <Link href="/contact" className="btn btn-brand btn-sm site-header-cta">
            {t("getApp")}
          </Link>
          <button
            type="button"
            className="site-burger"
            onClick={() => setOpen((v) => !v)}
            aria-label={t("toggleMenu")}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className="mobile-nav"
        hidden={!open}
        aria-hidden={!open}
      >
        <nav className="mobile-nav-list" aria-label="Mobile">
          {LINKS.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={close}
              className="mobile-nav-link"
              data-active={isActive(link.href) || undefined}
              style={{ ["--i" as string]: i }}
            >
              <span className="t-mono-sm mobile-nav-index">
                {String(i + 1).padStart(2, "0")}
              </span>
              {t(link.key)}
            </Link>
          ))}
        </nav>
        <div className="mobile-nav-foot">
          <Link href="/contact" onClick={close} className="btn btn-brand btn-lg">
            {t("getApp")}
          </Link>
          <div className="mobile-nav-lang">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
