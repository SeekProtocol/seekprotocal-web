/**
 * What the site needs to know about each language besides its messages.
 *
 * The same 31 languages as the app. Names are endonyms (each language in its
 * own words), so the switcher reads the same in every locale and adding a
 * language never means adding its name to every message file.
 */
export type LocaleMeta = {
  /** The language's own name for itself. */
  name: string;
  /** flag-icons country code shown next to it. */
  flag: string;
  /** Open Graph locale. */
  og: string;
  /** Text direction. */
  dir: "ltr" | "rtl";
};

export const LOCALE_META: Record<string, LocaleMeta> = {
  en: { name: "English", flag: "gb", og: "en_US", dir: "ltr" },
  nl: { name: "Nederlands", flag: "nl", og: "nl_NL", dir: "ltr" },
  de: { name: "Deutsch", flag: "de", og: "de_DE", dir: "ltr" },
  es: { name: "Español", flag: "es", og: "es_ES", dir: "ltr" },
  fr: { name: "Français", flag: "fr", og: "fr_FR", dir: "ltr" },
  it: { name: "Italiano", flag: "it", og: "it_IT", dir: "ltr" },
  pt: { name: "Português (Brasil)", flag: "br", og: "pt_BR", dir: "ltr" },
  pl: { name: "Polski", flag: "pl", og: "pl_PL", dir: "ltr" },
  sv: { name: "Svenska", flag: "se", og: "sv_SE", dir: "ltr" },
  fi: { name: "Suomi", flag: "fi", og: "fi_FI", dir: "ltr" },
  et: { name: "Eesti", flag: "ee", og: "et_EE", dir: "ltr" },
  hu: { name: "Magyar", flag: "hu", og: "hu_HU", dir: "ltr" },
  el: { name: "Ελληνικά", flag: "gr", og: "el_GR", dir: "ltr" },
  hr: { name: "Hrvatski", flag: "hr", og: "hr_HR", dir: "ltr" },
  sl: { name: "Slovenščina", flag: "si", og: "sl_SI", dir: "ltr" },
  sq: { name: "Shqip", flag: "al", og: "sq_AL", dir: "ltr" },
  "sr-Latn": { name: "Srpski", flag: "rs", og: "sr_RS", dir: "ltr" },
  "sr-Cyrl": { name: "Српски", flag: "rs", og: "sr_RS", dir: "ltr" },
  uk: { name: "Українська", flag: "ua", og: "uk_UA", dir: "ltr" },
  ru: { name: "Русский", flag: "ru", og: "ru_RU", dir: "ltr" },
  tr: { name: "Türkçe", flag: "tr", og: "tr_TR", dir: "ltr" },
  ar: { name: "العربية", flag: "sa", og: "ar_AR", dir: "rtl" },
  fa: { name: "فارسی", flag: "ir", og: "fa_IR", dir: "rtl" },
  id: { name: "Bahasa Indonesia", flag: "id", og: "id_ID", dir: "ltr" },
  ms: { name: "Bahasa Melayu", flag: "my", og: "ms_MY", dir: "ltr" },
  vi: { name: "Tiếng Việt", flag: "vn", og: "vi_VN", dir: "ltr" },
  th: { name: "ไทย", flag: "th", og: "th_TH", dir: "ltr" },
  zh: { name: "简体中文", flag: "cn", og: "zh_CN", dir: "ltr" },
  "zh-TW": { name: "繁體中文", flag: "tw", og: "zh_TW", dir: "ltr" },
  ja: { name: "日本語", flag: "jp", og: "ja_JP", dir: "ltr" },
  ko: { name: "한국어", flag: "kr", og: "ko_KR", dir: "ltr" },
};

export function localeMeta(locale: string): LocaleMeta {
  return LOCALE_META[locale] ?? LOCALE_META.en;
}
