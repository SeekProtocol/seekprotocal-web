import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getMultilingualAlternates, OG_IMAGE } from "@/lib/seo";
import { blogPosts } from "@/lib/blog-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: "Blog - Insights on AR, AI & Blockchain",
    description:
      "Stay up to date with the latest insights on augmented reality, AI, blockchain gaming, and the Seek Protocol ecosystem. Explore articles on location-based airdrops, move-to-earn, and more.",
    openGraph: {
      title: "Seek Protocol Blog - AR, AI & Blockchain Insights",
      description:
        "The latest articles on augmented reality, AI companions, blockchain rewards, and the future of location-based experiences on Solana.",
      url: `/${locale}/blog`,
      images: [OG_IMAGE],
    },
    twitter: {
      title: "Seek Protocol Blog - AR, AI & Blockchain Insights",
      description:
        "Articles on AR, AI, blockchain gaming, and the Seek Protocol ecosystem on Solana.",
    },
    alternates: getMultilingualAlternates("/blog", locale),
  };
}

function formatDate(dateString: string, locale?: string): string {
  return new Date(dateString).toLocaleDateString(locale || "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <BlogPageContent locale={locale} />;
}

function BlogPageContent({ locale }: { locale: string }) {
  const t = useTranslations("blog");

  return (
    <>
      <section className="page-head">
        <div className="grid-field" aria-hidden="true" />
        <div className="noise-layer" aria-hidden="true" />
        <div className="shell">
          <div className="page-head-inner">
            <p className="eyebrow">Blog</p>
            <h1 className="t-h1 page-head-title">{t("title")}</h1>
            <p className="t-lead">{t("desc")}</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="post-grid">
            {blogPosts.map((post, index) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className={`card card-flush card-hover post-card reveal ${
                  index === 0 ? "post-card-featured" : ""
                }`}
              >
                <div className="post-card-media">
                  <img
                    src={post.image}
                    srcSet={post.imageSrcSet}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    loading={index < 3 ? "eager" : "lazy"}
                    alt={post.imageAlt}
                  />
                </div>
                <div className="post-card-body">
                  <div className="post-card-meta">
                    <span className="chip chip-brand">{post.category}</span>
                    <span className="t-mono-sm">{formatDate(post.date, locale)}</span>
                  </div>
                  <h2 className="t-h4 post-card-title">{post.title}</h2>
                  <p className="t-small post-card-excerpt">{post.excerpt}</p>
                  <div className="post-card-foot">
                    <span className="t-mono-sm">
                      {post.readTime} {t("read")}
                    </span>
                    <span className="arrow-link" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 16 16">
                        <path
                          d="M3 8h10m0 0l-4-4m4 4l-4 4"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
