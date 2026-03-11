import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import SplineScene from "@/components/shared/SplineScene";
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
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
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
    alternates: { canonical: `/blog/${post.slug}` },
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
      <div className="page-bg">
        <SplineScene
          url="https://prod.spline.design/XOzWv5kao0gKP7SK/scene.splinecode"
          className="hero-background-video"
        />
        <div className="hero-background-overlay"></div>
      </div>
      <div className="page-wrapper">
        <Navigation />

        <article className="blog-article">
          <div className="container">
            <div className="blog-article-header">
              <BlogBackLink />
              <BlogArticleMeta post={post} />
              <h1
                data-w-id="blog-post-title"
                style={{
                  opacity: 0,
                  transform: "translate3d(0, 20%, 0)",
                  filter: "blur(3px)",
                }}
                className="h1 blog-article-title"
              >
                {post.title}
              </h1>
              <p
                data-w-id="blog-post-excerpt"
                style={{
                  opacity: 0,
                  transform: "translate3d(0, 20%, 0)",
                  filter: "blur(3px)",
                }}
                className="paragraph-03 text-gray-color blog-article-excerpt"
              >
                {post.excerpt}
              </p>
            </div>

            <div className="blog-article-image-wrap">
              <img
                src={post.image}
                srcSet={post.imageSrcSet}
                sizes="(max-width: 1024px) 100vw, 1024px"
                alt={post.imageAlt}
                className="blog-article-image"
                loading="eager"
              />
            </div>

            <div className="blog-article-body">
              {post.content.map((paragraph, index) => (
                <p key={index} className="paragraph-03 blog-paragraph">
                  {paragraph}
                </p>
              ))}
            </div>

            <nav className="blog-internal-links" aria-label="Related pages">
              <h3 className="h4" style={{ marginBottom: "1rem" }}>
                Learn More About Seek Protocol
              </h3>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                <li>
                  <Link href="/about" className="button-04 w-inline-block" style={{ display: "inline-block", padding: "0.5rem 1rem" }}>
                    About Our Team
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="button-04 w-inline-block" style={{ display: "inline-block", padding: "0.5rem 1rem" }}>
                    Our Services
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="button-04 w-inline-block" style={{ display: "inline-block", padding: "0.5rem 1rem" }}>
                    All Articles
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="button-04 w-inline-block" style={{ display: "inline-block", padding: "0.5rem 1rem" }}>
                    Contact Us
                  </Link>
                </li>
              </ul>
            </nav>

            <BlogArticleCta />
          </div>
        </article>

        {relatedPosts.length > 0 && (
          <BlogRelatedSection relatedPosts={relatedPosts} />
        )}

        <Footer />
      </div>
    </>
  );
}

function BlogBackLink() {
  const t = useTranslations("blog");
  return (
    <Link href="/blog" className="blog-back-link">
      {t("backToBlog")}
    </Link>
  );
}

function BlogArticleMeta({ post }: { post: { category: string; date: string; readTime: string } }) {
  const t = useTranslations("blog");
  return (
    <div className="blog-article-meta">
      <span className="blog-card-category">{post.category}</span>
      <span className="blog-article-date">{formatDate(post.date)}</span>
      <span className="blog-article-read-time">
        {post.readTime} {t("read")}
      </span>
    </div>
  );
}

function BlogArticleCta() {
  const t = useTranslations("blog");
  return (
    <div className="blog-article-cta">
      <div className="blog-cta-inner">
        <h3 className="h3">{t("readyToSeek")}</h3>
        <p className="paragraph-03 text-gray-color">{t("readyToSeekDesc")}</p>
        <div className="app-buttons">
          <a
            href="https://apps.apple.com/app/seekar/id6752813761"
            target="_blank"
            rel="noopener noreferrer"
            className="app-link w-inline-block"
          >
            <div className="app-link_gradient"></div>
            <div className="app-link_wrap">
              <img
                src="/images/app-store.svg"
                loading="lazy"
                alt="Download on App Store"
                className="app-link_image"
              />
            </div>
          </a>
          <a
            href="https://play.google.com/store/apps/details?id=com.seekar.seekar&pcampaignid=web_share"
            target="_blank"
            rel="noopener noreferrer"
            className="app-link w-inline-block"
          >
            <div className="app-link_gradient is-blue"></div>
            <div className="app-link_wrap">
              <img
                src="/images/google-play.svg"
                loading="lazy"
                alt="Get it on Google Play"
                className="app-link_image"
              />
            </div>
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
    <section className="blog-related-section">
      <div className="container">
        <h2 className="h2 blog-related-title">{t("moreArticles")}</h2>
        <div className="blog-related-grid">
          {relatedPosts.map((related) => (
            <Link key={related.slug} href={`/blog/${related.slug}`} className="blog-card">
              <div className="blog-card-image-wrap">
                <img
                  src={related.image}
                  srcSet={related.imageSrcSet}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  loading="lazy"
                  alt={related.imageAlt}
                  className="blog-card-image"
                />
              </div>
              <div className="blog-card-content">
                <div className="blog-card-meta">
                  <span className="blog-card-category">{related.category}</span>
                  <span className="blog-card-date">
                    {formatDate(related.date)}
                  </span>
                </div>
                <h3 className="blog-card-title">{related.title}</h3>
                <p className="blog-card-excerpt">{related.excerpt}</p>
              </div>
              <div className="glow-main-block">
                <div style={{ opacity: 0 }} className="glow-block"></div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
