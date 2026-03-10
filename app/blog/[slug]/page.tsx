import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import SplineScene from "@/components/shared/SplineScene";
import { getBlogPost, blogPosts, getAllSlugs } from "@/lib/blog-data";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
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
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const currentIndex = blogPosts.findIndex((p) => p.slug === slug);
  const relatedPosts = blogPosts
    .filter((_, i) => i !== currentIndex)
    .slice(0, 3);

  return (
    <>
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
              <Link href="/blog" className="blog-back-link">
                ← Back to Blog
              </Link>
              <div className="blog-article-meta">
                <span className="blog-card-category">{post.category}</span>
                <span className="blog-article-date">
                  {formatDate(post.date)}
                </span>
                <span className="blog-article-read-time">
                  {post.readTime} read
                </span>
              </div>
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

            <div className="blog-article-cta">
              <div className="blog-cta-inner">
                <h3 className="h3">Ready to start seeking?</h3>
                <p className="paragraph-03 text-gray-color">
                  Download SeekAR and transform your world into a
                  blockchain-powered playground.
                </p>
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
          </div>
        </article>

        {relatedPosts.length > 0 && (
          <section className="blog-related-section">
            <div className="container">
              <h2 className="h2 blog-related-title">More Articles</h2>
              <div className="blog-related-grid">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/blog/${related.slug}`}
                    className="blog-card"
                  >
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
                        <span className="blog-card-category">
                          {related.category}
                        </span>
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
        )}

        <Footer />
      </div>
    </>
  );
}
