import type { Metadata } from "next";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { baseUrl, getSingleLanguageAlternates, getBreadcrumbJsonLd, getOpenGraph } from "@/lib/seo";
import { getAllSlugs } from "@/lib/blog-data";
import { blogPostLocales, getLocalizedPost, getLocalizedPosts, hasBlogTranslation } from "@/lib/blog-i18n";

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
  const post = getLocalizedPost(slug, locale);
  if (!post) return {};
  /* A locale with its own translation self-canonicalises and joins the hreflang
     cluster of every language this post exists in. One without falls back to
     the English body and points at the English URL, as before. */
  const translated = hasBlogTranslation(slug, locale);
  const shareLocale = translated ? locale : "en";

  /* The article's own artwork is AVIF, which no major scraper decodes, so
     sharing a post produced a blank card. This is a generated PNG of the
     headline at the 1200x630 they all expect. */
  const card = {
    url: `${baseUrl}/og/blog/${post.slug}`,
    width: 1200,
    height: 630,
    alt: post.title,
  };

  return {
    /* Absolute, so the layout's "%s | Seekprotocol" template is not appended.
       The headlines are 55 to 60 characters on their own; the 16-character
       suffix pushed all six past 70 and Google cut them off mid-sentence. The
       brand is already the first thing in the URL and the breadcrumb. */
    title: { absolute: post.title },
    description: post.excerpt,
    openGraph: getOpenGraph({
      title: post.title,
      description: post.excerpt,
      // The canonical URL of the language actually shown.
      path: `/${shareLocale}/blog/${post.slug}`,
      locale: shareLocale,
      type: "article",
      publishedTime: post.date,
      section: post.category,
      images: [card],
    }),
    twitter: {
      title: post.title,
      description: post.excerpt,
      images: [card],
    },
    alternates: translated
      ? {
          canonical: `/${locale}/blog/${post.slug}`,
          languages: {
            ...Object.fromEntries(blogPostLocales(slug).map((l) => [l, `/${l}/blog/${post.slug}`])),
            "x-default": `/en/blog/${post.slug}`,
          },
        }
      : getSingleLanguageAlternates(`/blog/${post.slug}`),
  };
}

function formatDate(dateString: string, locale: string): string {
  return new Date(dateString).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;
  const post = getLocalizedPost(slug, locale);

  if (!post) {
    notFound();
  }

  setRequestLocale(locale);

  const posts = getLocalizedPosts(locale);
  const shownLocale = hasBlogTranslation(slug, locale) ? locale : "en";
  const currentIndex = posts.findIndex((p) => p.slug === slug);
  const relatedPosts = posts
    .filter((_, i) => i !== currentIndex)
    .slice(0, 3);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    /* The generated PNG card, not post.image: post.image is AVIF, which Google
       does not accept for article structured data. */
    image: `${baseUrl}/og/blog/${post.slug}`,
    url: `${baseUrl}/${shownLocale}/blog/${post.slug}`,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Organization",
      name: "Seekprotocol",
      url: baseUrl,
    },
    publisher: {
      "@id": `${baseUrl}/#organization`,
      "@type": "Organization",
      name: "Seekprotocol",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/images/webclip.png`,
        width: 256,
        height: 256,
      },
    },
    /* Was /blog/<slug>, which is not a page: it is a redirect to the prefixed
       URL, so the reference resolved to nothing. */
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}/${shownLocale}/blog/${post.slug}`,
    },
    articleSection: post.category,
    wordCount: post.content.join(" ").split(/\s+/).length,
    inLanguage: shownLocale === "en" ? "en-US" : shownLocale,
  };

  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: "Blog", path: "/blog" },
    { name: post.title, path: `/blog/${post.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <article className="section article-page">
        <div className="shell">
          <div className="article">
            <header className="article-head">
              <BlogBackLink />
              <BlogArticleMeta post={post} locale={locale} />
              <h1 className="t-h1 article-title">{post.title}</h1>
              <p className="t-lead">{post.excerpt}</p>
            </header>

            <div className="article-media">
              {/* The article's own image, and the LCP element on this page, so
                  it is priority rather than lazy: lazy-loading the LCP element
                  is the one thing Google names outright as a mistake.

                  Sized rather than filled, because .article-media has no
                  aspect-ratio to fill. The dimensions come from the data rather
                  than a constant: the newer posts are 16:10 and the older ones
                  are square or near-square, so stating one ratio for all of
                  them would reserve the wrong box and shift the page.

                  sizes matches .article, which is 44rem. Claiming 1024px made
                  the browser ask for w=2048 for a 702px slot. */}
              <Image
                src={post.image}
                alt={post.imageAlt}
                width={post.imageWidth}
                height={post.imageHeight}
                sizes="(max-width: 44rem) 100vw, 704px"
                priority
              />
            </div>

            <div className="article-body">
              {post.content.map((paragraph, index) => (
                <p key={index}>{renderCopy(paragraph)}</p>
              ))}
            </div>

            <ArticleLinks />

            <BlogArticleCta />
          </div>
        </div>
      </article>

      {relatedPosts.length > 0 && (
        <BlogRelatedSection relatedPosts={relatedPosts} locale={locale} />
      )}
    </>
  );
}

function ArticleLinks() {
  const t = useTranslations("blog");
  const nav = useTranslations("nav");

  return (
    <nav className="article-links" aria-label={t("relatedPages")}>
      <h2 className="t-mono article-links-title">{t("keepReading")}</h2>
      <ul>
        <li><Link href="/ecosystem" className="chip">{nav("ecosystem")}</Link></li>
        <li><Link href="/whitepaper" className="chip">{nav("whitepaper")}</Link></li>
        <li><Link href="/roadmap" className="chip">{nav("roadmap")}</Link></li>
        <li><Link href="/blog" className="chip">{t("allArticles")}</Link></li>
        <li><Link href="/contact" className="chip">{nav("contact")}</Link></li>
      </ul>
    </nav>
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

function BlogArticleMeta({ post, locale }: { post: { category: string; date: string; readTime: string }; locale: string }) {
  const t = useTranslations("blog");
  return (
    <div className="article-meta">
      <span className="chip chip-brand">{post.category}</span>
      <span className="t-mono-sm">{formatDate(post.date, locale)}</span>
      <span className="t-mono-sm">
        {post.readTime} {t("read")}
      </span>
    </div>
  );
}

function BlogArticleCta() {
  const t = useTranslations("blog");
  const footer = useTranslations("footer");
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
            aria-label={footer("appStoreAlt")}
          >
            <img src="/images/app-store.svg" alt="" loading="lazy" />
          </a>
          <a
            href="https://play.google.com/store/apps/details?id=com.seekar.seekar&pcampaignid=web_share"
            target="_blank"
            rel="noopener noreferrer"
            className="store-button"
            aria-label={footer("googlePlayAlt")}
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
  locale,
}: {
  locale: string;
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
                <Image
                  src={related.image}
                  alt={related.imageAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="post-card-body">
                <div className="post-card-meta">
                  <span className="chip chip-brand">{related.category}</span>
                  <span className="t-mono-sm">{formatDate(related.date, locale)}</span>
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

/**
 * A paragraph, with support for one thing markdown does that plain text cannot:
 * an internal link.
 *
 * Articles were plain strings rendered straight into a <p>, which is safe and
 * was enough until a post needed to send a reader somewhere on the site. The
 * options were to allow HTML through dangerouslySetInnerHTML, or to parse the
 * one construct actually needed. This is the second: `[text](/path)`, split by
 * regex and rebuilt as elements, so nothing in a post can ever become markup.
 *
 * Internal paths only, and deliberately. A post that wants to send someone off
 * the site can name the destination in prose; a link syntax that silently
 * accepts `javascript:` or an arbitrary host is a hole in a content file that
 * several people edit.
 */
const LINK = /\[([^\]]+)\]\((\/[^)\s]*)\)/g;

function renderCopy(text: string) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  LINK.lastIndex = 0;
  while ((match = LINK.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    parts.push(
      <Link key={`${match.index}-${match[2]}`} href={match[2]} prefetch={false}>
        {match[1]}
      </Link>,
    );
    last = match.index + match[0].length;
  }
  if (last === 0) return text;
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}
