import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getMultilingualAlternates } from "@/lib/seo";
import { getBlogPost, blogPosts, getAllSlugs } from "@/lib/blog-data";

interface BlogPostPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getAllSlugs().map((slug) => ({ locale, slug }))
  );
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `/${locale}/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
      images: [
        {
          url: `https://www.seekprotocol.ai${post.image}`,
          width: 1024,
          height: 576,
          alt: post.imageAlt,
        },
      ],
    },
    twitter: {
      title: post.title,
      description: post.excerpt,
      images: [
        {
          url: `https://www.seekprotocol.ai${post.image}`,
          alt: post.imageAlt,
        },
      ],
    },
    alternates: getMultilingualAlternates(`/blog/${post.slug}`, locale),
  };
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  setRequestLocale(locale);

  const currentIndex = blogPosts.findIndex((p) => p.slug === slug);
  const relatedPosts = blogPosts
    .filter((_, i) => i !== currentIndex)
    .slice(0, 3);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: `https://www.seekprotocol.ai${post.image}`,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Organization",
      name: "Seek Protocol",
      url: "https://www.seekprotocol.ai",
    },
    publisher: {
      "@type": "Organization",
      name: "Seek Protocol",
      logo: {
        "@type": "ImageObject",
        url: "https://www.seekprotocol.ai/images/favicon.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.seekprotocol.ai/blog/${post.slug}`,
    },
    articleSection: post.category,
    wordCount: post.content.join(" ").split(/\s+/).length,
    inLanguage: "en-US",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <article className="section article-page">
        <div className="shell">
          <div className="article">
            <header className="article-head">
              <BlogBackLink />
              <BlogArticleMeta post={post} />
              <h1 className="t-h1 article-title">{post.title}</h1>
              <p className="t-lead">{post.excerpt}</p>
            </header>

            <div className="article-media">
              <img
                src={post.image}
                srcSet={post.imageSrcSet}
                sizes="(max-width: 1024px) 100vw, 1024px"
                alt={post.imageAlt}
                loading="eager"
              />
            </div>

            <div className="article-body">
              {post.content.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            <nav className="article-links" aria-label="Related pages">
              <h2 className="t-mono article-links-title">Keep reading</h2>
              <ul>
                <li><Link href="/ecosystem" className="chip">Ecosystem</Link></li>
                <li><Link href="/whitepaper" className="chip">Whitepaper</Link></li>
                <li><Link href="/roadmap" className="chip">Roadmap</Link></li>
                <li><Link href="/blog" className="chip">All articles</Link></li>
                <li><Link href="/contact" className="chip">Contact</Link></li>
              </ul>
            </nav>

            <BlogArticleCta />
          </div>
        </div>
      </article>

      {relatedPosts.length > 0 && (
        <BlogRelatedSection relatedPosts={relatedPosts} />
      )}
    </>
  );
}

function BlogBackLink() {
  const t = useTranslations("blog");
  return (
    <Link href="/blog" className="arrow-link article-back">
      {t("backToBlog")}
    </Link>
  );
}

function BlogArticleMeta({ post }: { post: { category: string; date: string; readTime: string } }) {
  const t = useTranslations("blog");
  return (
    <div className="article-meta">
      <span className="chip chip-brand">{post.category}</span>
      <span className="t-mono-sm">{formatDate(post.date)}</span>
      <span className="t-mono-sm">
        {post.readTime} {t("read")}
      </span>
    </div>
  );
}

function BlogArticleCta() {
  const t = useTranslations("blog");
  return (
    <div className="cta-band article-cta">
      <div className="cta-band-inner">
        <h2 className="t-h3 cta-band-title">{t("readyToSeek")}</h2>
        <p className="t-body">{t("readyToSeekDesc")}</p>
        <div className="store-buttons article-cta-stores">
          <a
            href="https://apps.apple.com/app/seekar/id6752813761"
            target="_blank"
            rel="noopener noreferrer"
            className="store-button"
            aria-label="Download on the App Store"
          >
            <img src="/images/app-store.svg" alt="" loading="lazy" />
          </a>
          <a
            href="https://play.google.com/store/apps/details?id=com.seekar.seekar&pcampaignid=web_share"
            target="_blank"
            rel="noopener noreferrer"
            className="store-button"
            aria-label="Get it on Google Play"
          >
            <img src="/images/google-play.svg" alt="" loading="lazy" />
          </a>
        </div>
      </div>
    </div>
  );
}

function BlogRelatedSection({
  relatedPosts,
}: {
  relatedPosts: Array<{
    slug: string;
    image: string;
    imageSrcSet?: string;
    imageAlt: string;
    category: string;
    date: string;
    title: string;
    excerpt: string;
  }>;
}) {
  const t = useTranslations("blog");
  return (
    <section className="section section-sunken">
      <div className="shell">
        <h2 className="t-h2" style={{ marginBottom: "2.5rem" }}>{t("moreArticles")}</h2>
        <div className="post-grid">
          {relatedPosts.map((related) => (
            <Link key={related.slug} href={`/blog/${related.slug}`} className="card card-flush card-hover post-card reveal">
              <div className="post-card-media">
                <img
                  src={related.image}
                  srcSet={related.imageSrcSet}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  loading="lazy"
                  alt={related.imageAlt}
                />
              </div>
              <div className="post-card-body">
                <div className="post-card-meta">
                  <span className="chip chip-brand">{related.category}</span>
                  <span className="t-mono-sm">{formatDate(related.date)}</span>
                </div>
                <h3 className="t-h4 post-card-title">{related.title}</h3>
                <p className="t-small post-card-excerpt">{related.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
