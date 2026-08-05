import { MetadataRoute } from "next";
import { baseUrl } from "@/lib/seo";

/**
 * Note on /_next/: it must stay crawlable. It holds the CSS and JS bundles, and
 * a crawler that cannot fetch them renders an unstyled page and reads a layout
 * that does not exist. Googlebot had its own rule here and was fine, but the
 * wildcard rule blocked it, which meant Bing and every AI crawler saw the site
 * without its stylesheet.
 *
 * The AI crawlers are listed explicitly rather than left to the wildcard, so
 * that changing the wildcard later cannot silently change their access. All are
 * allowed on purpose: being quotable in an assistant's answer is worth more here
 * than withholding the content would be.
 */
export default function robots(): MetadataRoute.Robots {
  const allowAll = ["/"];
  const privatePaths = ["/api/", "/private/"];

  const aiCrawlers = [
    // Answer engines and assistant retrieval
    "OAI-SearchBot",
    "ChatGPT-User",
    "PerplexityBot",
    "Perplexity-User",
    "Claude-User",
    "Claude-SearchBot",
    "Google-Extended",
    "Applebot-Extended",
    // Model training crawlers
    "GPTBot",
    "ClaudeBot",
    "anthropic-ai",
    "Bytespider",
    "CCBot",
    "meta-externalagent",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: allowAll,
        disallow: privatePaths,
      },
      {
        userAgent: ["Googlebot", "Bingbot"],
        allow: allowAll,
        disallow: privatePaths,
      },
      {
        userAgent: "Googlebot-Image",
        allow: ["/images/", "/og.png", "/og/"],
      },
      {
        userAgent: aiCrawlers,
        allow: allowAll,
        disallow: privatePaths,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
