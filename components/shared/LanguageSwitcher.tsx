"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { localeMeta } from "@/i18n/locale-meta";
import "flag-icons/css/flag-icons.min.css";


export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
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
        aria-label={localeMeta(locale).name}
      >
        <span className={`fi fi-${localeMeta(locale).flag} language-flag`} />
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
                <span className={`fi fi-${localeMeta(loc).flag} language-flag`} />
                <span lang={loc} dir={localeMeta(loc).dir}>{localeMeta(loc).name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
