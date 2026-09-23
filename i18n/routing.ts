import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: [
    "en", "nl", "de", "fr", "es", "it", "pt", "pl", "sv", "fi", "et", "hu", "el", "hr", "sl", "sq", "sr-Latn", "sr-Cyrl", "uk", "ru", "tr", "ar", "fa", "id", "ms", "vi", "th", "zh", "zh-TW", "ja", "ko",
  ],
  defaultLocale: "en",
});

export type Locale = (typeof routing.locales)[number];
