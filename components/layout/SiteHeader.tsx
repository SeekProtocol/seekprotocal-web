"use client";

import { useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import SeekLogo from "@/components/brand/SeekLogo";
import ThemeToggle from "@/components/theme/ThemeToggle";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";

/**
 * The open state lives in a checkbox, not in React.
 *
 * It used to be useState behind an onClick, which meant the button did nothing
 * at all until the page had hydrated. Time to interactive on a phone was
 * measured at 35 seconds, so for half a minute the menu was not slow, it was
 * inert: you tapped it, nothing happened, and you tapped it again.
 *
 * A checkbox and a label are wired together by the browser before a single line
 * of our JavaScript runs, so the panel opens on the first tap of the first
 * paint. CSS reads :checked to show the panel, turn the burger into a cross and
 * lock the body. React still handles the parts that genuinely need it, closing
 * on navigation and on Escape, and those simply start working once it arrives.
 *
 * Sibling combinators rather than :has() for the visibility itself. A browser
 * without :has() would otherwise never open the menu at all, and failing closed
 * is the one outcome worth designing against here.
 */
const TOGGLE_ID = "mobile-nav-toggle";

const LINKS = [
  { href: "/ecosystem", key: "ecosystem" },
  { href: "/whitepaper", key: "whitepaper" },
  { href: "/roadmap", key: "roadmap" },
  { href: "/business", key: "business" },
  { href: "/about", key: "about" },
  { href: "/blog", key: "blog" },
] as const;

export default function SiteHeader() {
  const toggleRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const t = useTranslations("nav");

  const close = useCallback(() => {
    const toggle = toggleRef.current;
    if (toggle) toggle.checked = false;
  }, []);

  // Close the sheet on navigation.
  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && toggleRef.current?.checked) close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {/* First, so the sibling combinators below can reach both the header and
          the panel. Visually hidden but still focusable, so the label picks up a
          focus ring from it. */}
      <input
        ref={toggleRef}
        id={TOGGLE_ID}
        type="checkbox"
        className="nav-toggle"
        aria-label={t("toggleMenu")}
        aria-controls="mobile-nav"
      />

      <header className="site-header">
        <div className="site-header-inner shell-wide">
          {/* The brand is on screen from the first frame on every route, so it
              prefetches the homepage everywhere — including on the homepage
              itself, where it was four segment requests for the page the reader
              is already looking at. */}
          <Link
            href="/"
            prefetch={false}
            className="site-header-brand"
            aria-label="Seek Protocol"
          >
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
            {/* A label rather than a button: the browser toggles the checkbox
                for us, with no listener to wait for. The checkbox above carries
                the accessible name and the state. */}
            <label htmlFor={TOGGLE_ID} className="site-burger">
              <span />
              <span />
            </label>
          </div>
        </div>
      </header>

      {/* A sibling of <header>, not a child, and it has to stay that way.
          The panel is position:fixed and sizes itself off the viewport. When the
          menu opens, .site-header[data-open] gains a backdrop-filter, and a
          backdrop-filter makes an element the containing block for its
          fixed-position descendants. Nested in the header, this panel's
          `inset: var(--nav-h) 0 0` resolved against the 72px bar rather than the
          viewport, so it collapsed to 72px and the page showed through below it.
          Desktop never caught it: the panel is display:none above 1080px. */}
      {/* No hidden attribute: visibility is CSS, driven by :checked, so it works
          before hydration. display:none keeps it out of the accessibility tree
          while closed, which is what the hidden attribute was doing. */}
      <div id="mobile-nav" className="mobile-nav">
        <nav className="mobile-nav-list" aria-label="Mobile">
          {/* prefetch={false} on the sheet only. It is display:none while closed,
              so nothing here prefetches until it opens — and then all seven go
              at once, on a phone, in the same gesture that is already animating
              the panel in. Note that `false` also gives up the touch-start
              prefetch, so the tap itself pays for the fetch; see the note in
              SiteFooter.tsx for why that is the cheaper side. The desktop nav
              above keeps the default. */}
          {LINKS.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch={false}
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
          <Link
            href="/contact"
            prefetch={false}
            onClick={close}
            className="btn btn-brand btn-lg"
          >
            {t("getApp")}
          </Link>
          <div className="mobile-nav-lang">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </>
  );
}
