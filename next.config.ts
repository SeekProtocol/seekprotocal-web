import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      // /services carried generic agency boilerplate that never described the
      // product. The B2B story now lives on /business; keep the old URL alive
      // for anything already indexed or linked.
      { source: "/services", destination: "/business", permanent: true },
      { source: "/:locale(en|nl|de|es|fr|zh|ja|ko)/services", destination: "/:locale/business", permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);
