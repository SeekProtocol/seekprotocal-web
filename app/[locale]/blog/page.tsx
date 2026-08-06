import type { Metadata } from "next";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getMultilingualAlternates, OG_IMAGE, getOpenGraph } from "@/lib/seo";
import { blogPosts } from "@/lib/blog-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  const description = t("metaDescription");

  return {
    title: t("metaTitle"),
    description,
    openGraph: getOpenGraph({
      title: t("ogTitle"),
      description,
      path: `/${locale}/blog`,
      locale,
    }),
    twitter: {
      title: t("ogTitle"),
      description,
      images: [OG_IMAGE],
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
                  {/* fill, because .post-card-media already fixes the box at
                      16/10 and crops to it. The hand-written srcSet offered two
                      widths, 500 and 1024; next/image derives the ladder from
                      sizes instead, so a phone stops fetching a 1024px file for
                      a card a third that wide. Only the first card is priority:
                      it is the LCP candidate, and preloading the rest would
                      compete with it. */}
                  <Image
                    src={post.image}
                    alt={post.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    priority={index === 0}
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
