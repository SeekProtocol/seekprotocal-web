import { routing } from "@/i18n/routing";

const baseUrl = "https://www.seekprotocol.ai";

/**
 * Generates locale-aware canonical + hreflang alternates for Next.js metadata.
 * Includes x-default pointing to the default locale.
 */
export function getMultilingualAlternates(path: string, locale: string) {
  const normalizedPath = path === "/" ? "" : path;

  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = `/${loc}${normalizedPath}`;
  }
  languages["x-default"] = `/${routing.defaultLocale}${normalizedPath}`;

  return {
    canonical: `/${locale}${normalizedPath}`,
    languages,
  };
}

/**
 * Generates absolute-URL alternates for sitemap entries.
 * Includes x-default hreflang for the default locale.
 */
export function getSitemapAlternates(path: string) {
  const normalizedPath = path === "/" ? "" : path;

  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = `${baseUrl}/${loc}${normalizedPath}`;
  }
  languages["x-default"] = `${baseUrl}/${routing.defaultLocale}${normalizedPath}`;

  return { languages };
}
