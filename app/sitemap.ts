import { MetadataRoute } from "next";
import { blogPosts } from "@/lib/blog-data";
import { getSitemapAlternates } from "@/lib/seo";
import { routing } from "@/i18n/routing";

const baseUrl = "https://www.seekprotocol.ai";
const defaultLocale = routing.defaultLocale;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastUpdated = new Date("2026-03-11");
  const ogImage =
    "https://cdn.prod.website-files.com/689dda35eca0c273668f15aa/68b7ea7afbe50cfcdef0c342_SeekAR%20(30).png";

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/${defaultLocale}`,
      lastModified: lastUpdated,
      changeFrequency: "weekly",
      priority: 1,
      alternates: getSitemapAlternates("/"),
      images: [ogImage],
    },
    {
      url: `${baseUrl}/${defaultLocale}/about`,
      lastModified: lastUpdated,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: getSitemapAlternates("/about"),
      images: [ogImage],
    },
    {
      url: `${baseUrl}/${defaultLocale}/services`,
      lastModified: lastUpdated,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: getSitemapAlternates("/services"),
      images: [ogImage],
    },
    {
      url: `${baseUrl}/${defaultLocale}/blog`,
      lastModified: lastUpdated,
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: getSitemapAlternates("/blog"),
    },
    {
      url: `${baseUrl}/${defaultLocale}/contact`,
      lastModified: lastUpdated,
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: getSitemapAlternates("/contact"),
    },
    {
      url: `${baseUrl}/${defaultLocale}/privacy-policy`,
      lastModified: lastUpdated,
      changeFrequency: "yearly",
      priority: 0.3,
      alternates: getSitemapAlternates("/privacy-policy"),
    },
    {
      url: `${baseUrl}/${defaultLocale}/terms-conditions`,
      lastModified: lastUpdated,
      changeFrequency: "yearly",
      priority: 0.3,
      alternates: getSitemapAlternates("/terms-conditions"),
    },
  ];

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/${defaultLocale}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.7,
    alternates: getSitemapAlternates(`/blog/${post.slug}`),
  }));

  return [...staticPages, ...blogEntries];
}
