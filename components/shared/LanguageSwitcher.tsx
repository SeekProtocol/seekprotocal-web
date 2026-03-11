"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import "flag-icons/css/flag-icons.min.css";

const LOCALE_TO_COUNTRY: Record<string, string> = {
  en: "gb",
  nl: "nl",
  de: "de",
  es: "es",
  fr: "fr",
  zh: "cn",
  ja: "jp",
  ko: "kr",
};

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("languageSwitcher");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const switchLocale = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale });
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="language-switcher">
      <button
        type="button"
        className="language-switcher-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t(locale as Locale)}
      >
        <span className={`fi fi-${LOCALE_TO_COUNTRY[locale]} language-flag`} />
      </button>

      {isOpen && (
        <ul className="language-dropdown" role="listbox">
          {routing.locales.map((loc) => (
            <li key={loc} role="option" aria-selected={loc === locale}>
              <button
                type="button"
                className={`language-option ${loc === locale ? "language-option-active" : ""}`}
                onClick={() => switchLocale(loc)}
              >
                <span className={`fi fi-${LOCALE_TO_COUNTRY[loc]} language-flag`} />
                <span>{t(loc)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
