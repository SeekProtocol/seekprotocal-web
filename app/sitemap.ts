import { MetadataRoute } from "next";
import { blogPosts } from "@/lib/blog-data";
import { baseUrl, getSitemapAlternates, OG_IMAGE } from "@/lib/seo";
import { routing } from "@/i18n/routing";

const defaultLocale = routing.defaultLocale;

/**
 * Only canonical URLs belong here, and only one entry per canonical.
 *
 * Every page except the articles is translated now, so each entry lists its /en
 * URL once and carries the hreflang cluster beside it. The articles are the
 * exception and list /en alone, matching the canonical they declare. Advertising
 * /nl/blog/<slug> with a cluster while the page canonicalises to /en would
 * contradict the page and spend crawl budget on URLs we are asking Google not
 * to index.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastUpdated = new Date("2026-08-05");
  const ogImage = OG_IMAGE.url;

  const translated: { path: string; priority: number; changeFrequency: "weekly" | "monthly" | "yearly" }[] = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/about", priority: 0.8, changeFrequency: "monthly" },
    { path: "/blog", priority: 0.8, changeFrequency: "weekly" },
    { path: "/contact", priority: 0.7, changeFrequency: "monthly" },
    { path: "/privacy-policy", priority: 0.3, changeFrequency: "yearly" },
    { path: "/terms-conditions", priority: 0.3, changeFrequency: "yearly" },

    /* These four were English-only and listed without an hreflang cluster. They
       are translated as of ad9703b, and their pages moved back to
       getMultilingualAlternates, so leaving them out here left the sitemap
       claiming one URL for a page that declares eight. Contradicting the page is
       worse than saying nothing: the twenty-eight translated URLs would simply
       not be offered for crawling. */
    { path: "/ecosystem", priority: 0.9, changeFrequency: "monthly" },
    { path: "/whitepaper", priority: 0.9, changeFrequency: "monthly" },
    { path: "/roadmap", priority: 0.8, changeFrequency: "monthly" },
    { path: "/business", priority: 0.8, changeFrequency: "monthly" },
  ];

  const translatedEntries: MetadataRoute.Sitemap = translated.map((page) => ({
    url: `${baseUrl}/${defaultLocale}${page.path === "/" ? "" : page.path}`,
    lastModified: lastUpdated,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
    alternates: getSitemapAlternates(page.path),
    images: [ogImage],
  }));

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
