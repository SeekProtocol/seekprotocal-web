import { MetadataRoute } from "next";
import { blogPosts } from "@/lib/blog-data";
import { baseUrl, getSitemapAlternates, OG_IMAGE } from "@/lib/seo";
import { routing } from "@/i18n/routing";

const defaultLocale = routing.defaultLocale;

/**
 * Only canonical URLs belong here, and only one entry per canonical.
 *
 * Translated pages carry the hreflang cluster. The English-only pages do not:
 * they list the /en URL alone, matching the canonical their metadata declares.
 * Listing /nl/whitepaper with an hreflang cluster while the page canonicalises
 * to /en/whitepaper would contradict the page and waste crawl budget on URLs
 * we are asking Google not to index.
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
  ];

  const englishOnly: { path: string; priority: number }[] = [
    { path: "/ecosystem", priority: 0.9 },
    { path: "/whitepaper", priority: 0.9 },
    { path: "/roadmap", priority: 0.8 },
    { path: "/business", priority: 0.8 },
  ];

  const translatedEntries: MetadataRoute.Sitemap = translated.map((page) => ({
    url: `${baseUrl}/${defaultLocale}${page.path === "/" ? "" : page.path}`,
    lastModified: lastUpdated,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
    alternates: getSitemapAlternates(page.path),
    images: [ogImage],
  }));

  const englishOnlyEntries: MetadataRoute.Sitemap = englishOnly.map((page) => ({
    url: `${baseUrl}/${defaultLocale}${page.path}`,
    lastModified: lastUpdated,
    changeFrequency: "monthly",
    priority: page.priority,
    images: [ogImage],
  }));

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/${defaultLocale}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.7,
    images: [`${baseUrl}/og/blog/${post.slug}`],
  }));

  return [...translatedEntries, ...englishOnlyEntries, ...blogEntries];
}
