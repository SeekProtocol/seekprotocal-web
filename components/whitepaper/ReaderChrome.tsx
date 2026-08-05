"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

type Entry = { id: string; index: string; title: string };

/**
 * Sticky contents list plus the reading-progress bar. Tracks which chapter is
 * currently under the reader rather than which one merely intersects, so the
 * highlight matches what you are actually looking at.
 *
 * On a phone there is no room for a sticky column, so the contents used to be
 * a static block above the article: to reach another chapter you had to scroll
 * all the way back to the top of a twenty-eight minute document, which is the
 * one thing a contents list exists to prevent. The desktop column is replaced
 * there by a bar pinned to the bottom of the screen showing where you are, and
 * a sheet of every chapter when you tap it.
 */
export default function ReaderChrome({ entries }: { entries: Entry[] }) {
  const t = useTranslations("whitepaperFigures");
  const [active, setActive] = useState(entries[0]?.id ?? "");
  /** True while the article body is what is on screen. */
  const [inBody, setInBody] = useState(false);
  const [open, setOpen] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const sections = entries
      .map((entry) => document.getElementById(entry.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!sections.length) return;

    const root = document.documentElement;
    let ticking = false;

    const update = () => {
      ticking = false;

      // Progress across the article body, not the whole document.
      const body = document.getElementById("wp-body");
      if (body) {
        const start = body.offsetTop;
        const span = body.offsetHeight - window.innerHeight * 0.5;
        const progress = span > 0 ? (window.scrollY - start + window.innerHeight * 0.4) / span : 0;
        root.style.setProperty("--wp-progress", String(Math.min(1, Math.max(0, progress))));

        // The jump bar belongs to the article. It has no business sitting over
        // the hero above it or the call to action below it.
        const rect = body.getBoundingClientRect();
        const within = rect.top < window.innerHeight * 0.4 && rect.bottom > window.innerHeight * 0.5;
        setInBody((prev) => (prev === within ? prev : within));
      }

      // The active chapter is the last one whose top has passed the marker.
      const marker = window.innerHeight * 0.35;
      let current = sections[0].id;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= marker) current = section.id;
      }
      setActive((prev) => (prev === current ? prev : current));
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      root.style.removeProperty("--wp-progress");
    };
  }, [entries]);

  const close = useCallback(() => setOpen(false), []);

  // Escape closes it, and the page underneath does not scroll while it is up.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Open on the chapter you are reading, not at the top of the list.
    listRef.current
      ?.querySelector<HTMLElement>("[data-active]")
      ?.scrollIntoView({ block: "center" });
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, close]);

  const current = entries.find((entry) => entry.id === active) ?? entries[0];

  return (
    <>
      <div className="wp-progress" aria-hidden="true">
        <div className="wp-progress-bar" />
      </div>

      <nav className="wp-toc" aria-label={t("chaptersLabel")}>
        <h2 className="t-mono wp-toc-title">Contents</h2>
        <ul className="wp-toc-list">
          {entries.map((entry) => (
            <li key={entry.id}>
              <a
                href={`#${entry.id}`}
                className="wp-toc-link"
                data-active={active === entry.id || undefined}
                aria-current={active === entry.id ? "true" : undefined}
              >
                <span className="wp-toc-index">{entry.index}</span>
                <span>{entry.title}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* ---------------------------------------------------------- phones */}
      <div className="wp-jump" data-in={inBody || undefined} aria-hidden={!inBody}>
        <button
          type="button"
          className="wp-jump-bar"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-haspopup="dialog"
          tabIndex={inBody ? 0 : -1}
        >
          <span className="t-mono-sm wp-jump-index">{current?.index}</span>
          <span className="wp-jump-title">{current?.title}</span>
          <span className="wp-jump-count t-mono-sm">
            {entries.findIndex((e) => e.id === active) + 1}/{entries.length}
          </span>
          <ChaptersIcon />
        </button>
        <span className="wp-jump-progress" aria-hidden="true" />
      </div>

      <div className="wp-sheet" data-open={open || undefined} hidden={!open}>
        <button type="button" className="wp-sheet-scrim" onClick={close} aria-label={t("close")} />
        <div className="wp-sheet-panel" role="dialog" aria-modal="true" aria-label={t("chaptersLabel")}>
          <div className="wp-sheet-head">
            <span className="t-mono">{t("contents", { count: entries.length })}</span>
            <button type="button" className="wp-sheet-close" onClick={close} aria-label={t("close")}>
              ✕
            </button>
          </div>
          <ul className="wp-sheet-list" ref={listRef}>
            {entries.map((entry) => (
              <li key={entry.id}>
                <a
                  href={`#${entry.id}`}
                  data-active={active === entry.id || undefined}
                  onClick={close}
                >
                  <span className="t-mono-sm">{entry.index}</span>
                  <span>{entry.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

function ChaptersIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M4 7h16M4 12h16M4 17h10" />
    </svg>
  );
}
