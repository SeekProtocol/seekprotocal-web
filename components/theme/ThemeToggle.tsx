"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "./ThemeProvider";

/**
 * Sun/moon toggle. The icon is a single circle with a mask that slides across
 * it — the sun becomes a crescent rather than swapping glyphs, so the change
 * reads as one continuous object.
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const t = useTranslations("nav");
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle ${className}`}
      aria-label={isDark ? t("switchToLight") : t("switchToDark")}
      title={isDark ? t("switchToLight") : t("switchToDark")}
    >
      <span className="theme-toggle-icon" data-dark={isDark || undefined}>
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <mask id="theme-crescent">
            <rect x="0" y="0" width="24" height="24" fill="#fff" />
            <circle cx="24" cy="10" r="6" fill="#000" />
          </mask>
          <circle
            cx="12"
            cy="12"
            r="5"
            fill="currentColor"
            mask="url(#theme-crescent)"
            className="theme-toggle-orb"
          />
          <g className="theme-toggle-rays" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <line x1="12" y1="1.5" x2="12" y2="3.6" />
            <line x1="12" y1="20.4" x2="12" y2="22.5" />
            <line x1="1.5" y1="12" x2="3.6" y2="12" />
            <line x1="20.4" y1="12" x2="22.5" y2="12" />
            <line x1="4.4" y1="4.4" x2="5.9" y2="5.9" />
            <line x1="18.1" y1="18.1" x2="19.6" y2="19.6" />
            <line x1="4.4" y1="19.6" x2="5.9" y2="18.1" />
            <line x1="18.1" y1="5.9" x2="19.6" y2="4.4" />
          </g>
        </svg>
      </span>
    </button>
  );
}
