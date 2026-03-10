import type { Metadata } from "next";
import Link from "next/link";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import SplineScene from "@/components/shared/SplineScene";
import { blogPosts } from "@/lib/blog-data";

export const metadata: Metadata = {
  title: "Blog - Insights on AR, AI & Blockchain",
  description:
    "Stay up to date with the latest insights on augmented reality, AI, blockchain gaming, and the Seek Protocol ecosystem. Explore articles on location-based airdrops, move-to-earn, and more.",
  openGraph: {
    title: "Seek Protocol Blog - AR, AI & Blockchain Insights",
    description:
      "The latest articles on augmented reality, AI companions, blockchain rewards, and the future of location-based experiences on Solana.",
    url: "/blog",
    images: [
      {
        url: "https://cdn.prod.website-files.com/689dda35eca0c273668f15aa/68b7ea7afbe50cfcdef0c342_SeekAR%20(30).png",
        width: 1200,
        height: 630,
        alt: "Seek Protocol Blog",
      },
    ],
  },
  twitter: {
    title: "Seek Protocol Blog - AR, AI & Blockchain Insights",
    description:
      "Articles on AR, AI, blockchain gaming, and the Seek Protocol ecosystem on Solana.",
  },
  alternates: { canonical: "/blog" },
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPage() {
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

        <section className="about-hero">
          <div className="container">
            <div className="about-hero-wrap">
              <div className="hero-top-wrap">
                <div className="hero-01-text-wrap">
                  <h1
                    data-w-id="blog-hero-title"
                    style={{
                      opacity: 0,
                      transform: "translate3d(0, 20%, 0)",
                      filter: "blur(3px)",
                    }}
                    className="h1 front-size-22"
                  >
                    Seek Protocol Blog
                  </h1>
                  <p
                    data-w-id="blog-hero-desc"
                    style={{
                      opacity: 0,
                      transform: "translate3d(0, 20%, 0)",
                      filter: "blur(3px)",
                    }}
                    className="paragraph-03 text-gray-color"
                  >
                    Insights, updates, and deep dives into augmented reality, AI,
                    blockchain technology, and the future of location-based
                    experiences.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="blog-grid-section">
          <div className="container">
            <div className="blog-grid">
              {blogPosts.map((post, index) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className={`blog-card ${index === 0 ? "blog-card-featured" : ""}`}
                >
                  <div className="blog-card-image-wrap">
                    <img
                      src={post.image}
                      srcSet={post.imageSrcSet}
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      loading={index < 3 ? "eager" : "lazy"}
                      alt={post.imageAlt}
                      className="blog-card-image"
                    />
                  </div>
                  <div className="blog-card-content">
                    <div className="blog-card-meta">
                      <span className="blog-card-category">{post.category}</span>
                      <span className="blog-card-date">
                        {formatDate(post.date)}
                      </span>
                    </div>
                    <h2 className="blog-card-title">{post.title}</h2>
                    <p className="blog-card-excerpt">{post.excerpt}</p>
                    <div className="blog-card-footer">
                      <span className="blog-card-read-time">
                        {post.readTime} read
                      </span>
                      <span className="blog-card-arrow">→</span>
                    </div>
                  </div>
                  <div className="glow-main-block">
                    <div style={{ opacity: 0 }} className="glow-block"></div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
