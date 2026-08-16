import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { routing } from "./i18n/routing";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const LOCALE_GROUP = routing.locales.join("|");
const DEFAULT = `/${routing.defaultLocale}`;

/**
 * The site has had three URL shapes. Everything still in Google's index from the
 * first two has to land on a live page, or those URLs bleed away as soft 404s.
 *
 *   1. Webflow export      /about, /services.html, /contact-us
 *   2. Next without i18n   /about, /blog/<slug>, /services
 *   3. Next with i18n      /en/about, /en/blog/<slug>, /en/business   <- canonical
 *
 * The locale prefix is always on (next-intl localePrefix defaults to "always"),
 * so an unprefixed path has no route to match and 404s. next-intl's proxy only
 * matches "/" and "/<locale>/...", so it never rescues those either. Hence the
 * explicit map below rather than relying on locale detection.
 *
 * Legacy URLs go straight to the default locale on purpose: a single permanent
 * hop consolidates link signals on the canonical, which locale sniffing (a 307
 * that varies by visitor) would not do.
 *
 * These compile into Vercel's edge routing table, so none of them wakes a
 * function.
 */

// Pages that lived at the root before the locale prefix landed, and now also
// catch anyone linking the newer pages without a prefix.
const UNPREFIXED_PAGES = [
  "about",
  "blog",
  "contact",
  "privacy-policy",
  "terms-conditions",
  "business",
  "ecosystem",
  "roadmap",
  "whitepaper",
];

// Webflow-era paths whose content has no direct successor.
const RETIRED_PATHS: Record<string, string> = {
  "/index": DEFAULT,
  "/index.html": DEFAULT,
  "/about.html": `${DEFAULT}/about`,
  "/blog.html": `${DEFAULT}/blog`,
  "/contact-us": `${DEFAULT}/contact`,
  "/contact-us.html": `${DEFAULT}/contact`,
  "/privacy-policy.html": `${DEFAULT}/privacy-policy`,
  "/terms-conditions.html": `${DEFAULT}/terms-conditions`,
  // The agency pages all described services the product never had. /business is
  // the closest live equivalent for anyone arriving on them.
  "/services.html": `${DEFAULT}/business`,
  "/consulting": `${DEFAULT}/business`,
  "/consulting.html": `${DEFAULT}/business`,
  "/pricing": `${DEFAULT}/business`,
  "/pricing.html": `${DEFAULT}/business`,
  "/project": `${DEFAULT}/ecosystem`,
  "/project.html": `${DEFAULT}/ecosystem`,
};

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],

    /* The default ladder ends at 3840. Nothing on this site asks for it: the
       widest slot any `sizes` implies is a full-bleed section, and those are
       still plain img tags that never reach the optimiser. Every image that does
       go through it today tops out at a 1888px source. Asking for 3840 there
       returns the source width again, so it produces a duplicate file under a
       fresh cache key.
       Restore 3840 when the full-bleed background images move to next/image:
       there are 2880px sources behind them, and a 4x display would want it. */
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],

    /* Four hours is the Next 16 default, and it is short for these files. Every
       expiry re-runs the optimiser: it costs a transform, and the first visitor
       after it waits for one. The sources are effectively immutable, and
       vercel.json already serves /images/ with a one-year immutable header, so
       the optimiser was the only layer still treating them as fresh-ish. Thirty
       days. Anything that genuinely changes needs a new filename either way,
       because of that same immutable header. */
    minimumCacheTTL: 2592000,
  },
  async redirects() {
    return [
      /* The root, permanently.
       *
       * next-intl's proxy answers "/" with a 307, because the destination it
       * picks depends on the visitor's Accept-Language. A 307 is by definition
       * the wrong signal for a URL that always ends up in the same place for a
       * crawler: it tells Google to keep the source URL and not to pass the
       * link equity on. That matters more here than anywhere else on the site,
       * because the root is what everybody links to: 163 of the domain's 190
       * referring domains point at "/" and nothing else, and those signals were
       * stopping at a temporary hop instead of reaching /en.
       *
       * Config redirects are evaluated before middleware, so this answers first
       * and the proxy never sees "/". Locale detection still runs for every
       * other path, and a visitor who lands on /en can switch language from the
       * header. x-default already points at /en, so this only makes the routing
       * agree with what the metadata has been claiming all along. */
      { source: "/", destination: DEFAULT, permanent: true },

      // /services carried generic agency boilerplate that never described the
      // product. The B2B story now lives on /business.
      { source: "/services", destination: `${DEFAULT}/business`, permanent: true },
      {
        source: `/:locale(${LOCALE_GROUP})/services`,
        destination: "/:locale/business",
        permanent: true,
      },

      // /publishers is a URL-alias for /business — the B2B page IS the publisher
      // page ("Buy arrivals, not impressions"), and third parties (press,
      // journalists, decks) reference this audience by name. Redirect rather
      // than a second page: two URLs about the same thing would fragment the
      // autoriteit that is currently thin on the B2B trechter.
      { source: "/publishers", destination: `${DEFAULT}/business`, permanent: true },
      {
        source: `/:locale(${LOCALE_GROUP})/publishers`,
        destination: "/:locale/business",
        permanent: true,
      },

      // Blog posts kept their slugs across the rebuild, only the prefix is new.
      { source: "/blog/:slug", destination: `${DEFAULT}/blog/:slug`, permanent: true },

      ...UNPREFIXED_PAGES.map((page) => ({
        source: `/${page}`,
        destination: `${DEFAULT}/${page}`,
        permanent: true,
      })),

      ...Object.entries(RETIRED_PATHS).map(([source, destination]) => ({
        source,
        destination,
        permanent: true,
      })),
    ];
  },
};

export default withNextIntl(nextConfig);
