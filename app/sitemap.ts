import { MetadataRoute } from "next";
import { blogPosts } from "@/lib/blog-data";
import { baseUrl, getSitemapAlternates, OG_IMAGE } from "@/lib/seo";
import { routing } from "@/i18n/routing";

const defaultLocale = routing.defaultLocale;

/**
 * Only canonical URLs belong here, and one entry per canonical.
 *
 * The rule was right and the arithmetic under it was wrong. It used to emit the
 * /en URL alone for each translated page, on the reading that a page has one
 * canonical. These pages have eight: every locale self-canonicalises, so
 * /nl/business declares itself canonical and is not a duplicate of anything.
 * "One entry per canonical" therefore means eighty entries for ten pages, not
 * ten. Measured before the change: the site declared 86 canonical URLs and the
 * sitemap offered 16.
 *
 * The seventy that were missing were still reachable — the hreflang cluster
 * beside each entry names them, and so does every page's own head — but reach
 * is not submission. They carried no lastmod of their own and never appeared in
 * Search Console's coverage as URLs we had asked for, which is the thing worth
 * having while the site is new and ranking for almost nothing.
 *
 * The articles remain the exception and list /en alone, matching the canonical
 * they declare. Advertising /nl/blog/<slug> with a cluster while the page
 * canonicalises to /en would contradict the page and spend crawl budget on URLs
 * we are asking Google not to index.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const ogImage = OG_IMAGE.url;

  /**
   * `lastModified` is per page, and it is maintained by hand.
   *
   * It was one shared constant, which was accurate on the day the rebuild
   * landed and becomes a lie the moment any single page changes. Per page it
   * can at least be told the truth.
   *
   * Deliberately not the build time. Every deploy would then claim every page
   * had just changed, including the eight deploys in an hour this codebase saw
   * on 6 August; a lastmod that always says "just now" carries no information
   * and Google is entitled to stop believing it. Deliberately not the git mtime
   * either: Vercel builds from a shallow clone, and half of what a page renders
   * lives in messages/ and content/ rather than in the page file.
   *
   * So: change a page, change its date here.
   */
  const REBUILT = new Date("2026-08-05");

  /* SEO diagnose van 15 aug 2026 raakte vier pagina's inhoudelijk: de homepage
     kreeg drie nieuwe interne links, /seekar en /business kregen herschreven
     metadata en /contact een nieuwe inquiry-types-sectie. Aparte constant zodat
     een latere kleine copy-wijziging op één van die vier niet stilletjes REBUILT
     laat "kloppen" voor pagina's die niet zijn aangeraakt. */
  const SEO_PASS = new Date("2026-08-15");

  const translated: { path: string; priority: number; changeFrequency: "weekly" | "monthly" | "yearly"; lastModified: Date }[] = [
    { path: "/", priority: 1, changeFrequency: "weekly", lastModified: SEO_PASS },

    /* Priority 0.9, level with /ecosystem and /whitepaper and below only the
       homepage. It is the page for the product the whole site is about, and the
       one carrying the app's name. */
    { path: "/seekar", priority: 0.9, changeFrequency: "monthly", lastModified: SEO_PASS },
    { path: "/about", priority: 0.8, changeFrequency: "monthly", lastModified: REBUILT },
    { path: "/blog", priority: 0.8, changeFrequency: "weekly", lastModified: REBUILT },
    { path: "/contact", priority: 0.7, changeFrequency: "monthly", lastModified: SEO_PASS },
    { path: "/privacy-policy", priority: 0.3, changeFrequency: "yearly", lastModified: REBUILT },
    { path: "/terms-conditions", priority: 0.3, changeFrequency: "yearly", lastModified: REBUILT },

    /* These four were English-only and listed without an hreflang cluster. They
       are translated as of ad9703b, and their pages moved back to
       getMultilingualAlternates, so leaving them out here left the sitemap
       claiming one URL for a page that declares eight. Contradicting the page is
       worse than saying nothing: the twenty-eight translated URLs would simply
       not be offered for crawling. */
    { path: "/ecosystem", priority: 0.9, changeFrequency: "monthly", lastModified: REBUILT },
    { path: "/whitepaper", priority: 0.9, changeFrequency: "monthly", lastModified: REBUILT },
    { path: "/roadmap", priority: 0.8, changeFrequency: "monthly", lastModified: REBUILT },
    { path: "/business", priority: 0.8, changeFrequency: "monthly", lastModified: SEO_PASS },
  ];

  /* One entry per locale, each pointing at itself and each carrying the same
     cluster. The cluster does not vary by locale — it names all eight versions
     plus x-default whichever one you are looking at — which is exactly what
     makes them a set rather than eight pages that happen to be similar.

     `priority` is not lowered for the non-default locales. It says how the
     pages rank against each other within this file, not how they rank against
     the world, and a Dutch reader's homepage is no less the homepage. Google
     has ignored the field for years in any case; keeping it consistent costs
     nothing and misstating it would be the only way to get it wrong. */
  const translatedEntries: MetadataRoute.Sitemap = translated.flatMap((page) =>
    routing.locales.map((locale) => ({
      url: `${baseUrl}/${locale}${page.path === "/" ? "" : page.path}`,
      lastModified: page.lastModified,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: getSitemapAlternates(page.path),
      images: [ogImage],
    })),
  );

  /* The articles are the only single-language content left: their bodies live in
     lib/blog-data.ts in English and are not in the message files, which is why
     the article page still declares getSingleLanguageAlternates. One entry each,
     no cluster, matching what the page says. */
  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/${defaultLocale}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.7,
    images: [`${baseUrl}/og/blog/${post.slug}`],
  }));

  return [...translatedEntries, ...blogEntries];
}
