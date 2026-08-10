import { routing } from "@/i18n/routing";

export const baseUrl = "https://www.seekprotocol.ai";

/**
 * The share card. Generated at build time by app/og.png/route.tsx at the exact
 * 1200x630 every scraper expects, and served from our own domain so it does not
 * depend on the Webflow account the site was originally exported from.
 */
export const OG_IMAGE = {
  url: `${baseUrl}/og.png`,
  width: 1200,
  height: 630,
  alt: "Seekprotocol, digital assets anchored to real-world coordinates on Solana",
} as const;

/** OG locale codes, keyed by the routing locale. */
const OG_LOCALE: Record<string, string> = {
  en: "en_US",
  nl: "nl_NL",
  de: "de_DE",
  es: "es_ES",
  fr: "fr_FR",
  zh: "zh_CN",
  ja: "ja_JP",
  ko: "ko_KR",
};

/**
 * A complete Open Graph block for a page.
 *
 * This exists because Next merges metadata shallowly: a page that declares its
 * own `openGraph` replaces the parent's object outright rather than adding to
 * it. The layout was declaring type, siteName, locale and alternateLocale, and
 * every page then quietly dropped all four by declaring an openGraph of its own.
 * Measured on production: og:type, og:site_name and og:locale were absent from
 * every page except the one article, which sets type itself.
 *
 * The consequence is not cosmetic. Without og:site_name a share card has no
 * brand line under the title, and without og:locale a crawler has nothing but
 * the html lang attribute to tell it which of eight versions it is holding.
 *
 * Pass only what is specific to the page; the site-wide fields are filled in
 * here so they cannot be forgotten again.
 */
export function getOpenGraph({
  title,
  description,
  path,
  locale,
  type = "website",
  publishedTime,
  section,
  images,
}: {
  title: string;
  description: string;
  /** Locale-prefixed path, e.g. "/en/business". */
  path: string;
  locale: string;
  type?: "website" | "article";
  publishedTime?: string;
  section?: string;
  /** Overrides the site card. The articles each generate their own. */
  images?: { url: string; width: number; height: number; alt: string }[];
}) {
  return {
    title,
    description,
    type,
    url: path,
    siteName: "Seekprotocol",
    locale: OG_LOCALE[locale] ?? "en_US",
    alternateLocale: Object.entries(OG_LOCALE)
      .filter(([loc]) => loc !== locale)
      .map(([, og]) => og),
    images: images ?? [OG_IMAGE],
    ...(publishedTime ? { publishedTime } : {}),
    ...(section ? { section } : {}),
  };
}

/**
 * Canonical + hreflang for a page that genuinely exists in every locale.
 * Each locale self-canonicalises and the cluster points at all the others,
 * which is what tells Google these are translations rather than duplicates.
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
 * Canonical for a page that only exists in English, even though the locale
 * prefix makes it reachable at eight URLs.
 *
 * /nl/whitepaper serves the same English body as /en/whitepaper. Claiming a
 * Dutch translation in hreflang and self-canonicalising would ask Google to
 * index eight copies of one document; it picks a winner on its own and the
 * choice is not ours. Pointing every locale at the default consolidates the
 * signals on one URL, and the hreflang cluster is omitted deliberately, since
 * there is only one language version to declare.
 *
 * Move a page to getMultilingualAlternates as soon as its copy is translated.
 */
export function getSingleLanguageAlternates(path: string) {
  const normalizedPath = path === "/" ? "" : path;

  return {
    canonical: `/${routing.defaultLocale}${normalizedPath}`,
  };
}

/**
 * BreadcrumbList for a page below the root.
 *
 * Google replaces the URL line in a result with the breadcrumb trail when this
 * is present, which is worth more than it sounds on a site where every path
 * starts with a locale code: "seekprotocol.ai > Blog > Proof of Location" reads
 * as a place in a structure, where "seekprotocol.ai/en/blog/proof-of-location.."
 * reads as a string.
 *
 * Trails are built against the default locale, matching the canonical the
 * English-only pages declare.
 */
export function getBreadcrumbJsonLd(
  trail: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { name: "Seekprotocol", path: "/" },
      ...trail,
    ].map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${baseUrl}/${routing.defaultLocale}${crumb.path === "/" ? "" : crumb.path}`,
    })),
  };
}

/** Absolute-URL hreflang cluster for translated sitemap entries. */
export function getSitemapAlternates(path: string) {
  const normalizedPath = path === "/" ? "" : path;

  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = `${baseUrl}/${loc}${normalizedPath}`;
  }
  languages["x-default"] = `${baseUrl}/${routing.defaultLocale}${normalizedPath}`;

  return { languages };
}
