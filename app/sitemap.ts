import { MetadataRoute } from "next";
import { blogPosts } from "@/lib/blog-data";
import { routing } from "@/i18n/routing";

const baseUrl = "https://www.seekprotocol.ai";

function alternates(path: string) {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale] = `${baseUrl}/${locale}${path}`;
  }
  return { languages };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastUpdated = new Date("2026-03-11");

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: lastUpdated, changeFrequency: "weekly", priority: 1, alternates: alternates(""), images: ["https://cdn.prod.website-files.com/689dda35eca0c273668f15aa/68b7ea7afbe50cfcdef0c342_SeekAR%20(30).png"] },
    { url: `${baseUrl}/about`, lastModified: lastUpdated, changeFrequency: "monthly", priority: 0.8, alternates: alternates("/about"), images: ["https://cdn.prod.website-files.com/689dda35eca0c273668f15aa/68b7ea7afbe50cfcdef0c342_SeekAR%20(30).png"] },
    { url: `${baseUrl}/services`, lastModified: lastUpdated, changeFrequency: "monthly", priority: 0.8, alternates: alternates("/services"), images: ["https://cdn.prod.website-files.com/689dda35eca0c273668f15aa/68b7ea7afbe50cfcdef0c342_SeekAR%20(30).png"] },
    { url: `${baseUrl}/blog`, lastModified: lastUpdated, changeFrequency: "weekly", priority: 0.8, alternates: alternates("/blog") },
    { url: `${baseUrl}/contact`, lastModified: lastUpdated, changeFrequency: "monthly", priority: 0.7, alternates: alternates("/contact") },
    { url: `${baseUrl}/privacy-policy`, lastModified: lastUpdated, changeFrequency: "yearly", priority: 0.3, alternates: alternates("/privacy-policy") },
    { url: `${baseUrl}/terms-conditions`, lastModified: lastUpdated, changeFrequency: "yearly", priority: 0.3, alternates: alternates("/terms-conditions") },
  ];

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.7,
    alternates: alternates(`/blog/${post.slug}`),
  }));

  return [...staticPages, ...blogEntries];
}
