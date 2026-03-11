import { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

export default function robots(): MetadataRoute.Robots {
  const localeAllow = routing.locales.map((loc) => `/${loc}/`);

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", ...localeAllow],
        disallow: ["/api/", "/_next/", "/private/"],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", ...localeAllow],
        disallow: ["/api/"],
      },
      {
        userAgent: "Googlebot-Image",
        allow: ["/images/"],
      },
    ],
    sitemap: "https://www.seekprotocol.ai/sitemap.xml",
    host: "https://www.seekprotocol.ai",
  };
}
