import { BLOG_TRANSLATIONS } from "@/content/blog";
import { blogPosts, getBlogPost, type BlogPost } from "@/lib/blog-data";

/**
 * Blog posts in the reader's language.
 *
 * English stays the source in lib/blog-data.ts; translations only replace the
 * words (title, excerpt, paragraphs, alt text, read time, category) and live in
 * content/blog/<locale>.json. A locale without a translation of a post gets the
 * English one, and says so to search engines (see hasBlogTranslation).
 */
export function hasBlogTranslation(slug: string, locale: string): boolean {
  return locale === "en" || Boolean(BLOG_TRANSLATIONS[locale]?.[slug]);
}

export function getLocalizedPost(slug: string, locale: string): BlogPost | undefined {
  const post = getBlogPost(slug);
  if (!post) return undefined;
  const copy = BLOG_TRANSLATIONS[locale]?.[slug];
  return copy ? { ...post, ...copy } : post;
}

export function getLocalizedPosts(locale: string): BlogPost[] {
  return blogPosts.map((post) => getLocalizedPost(post.slug, locale)!);
}

/** Locales that have this post in their own language, English included. */
export function blogPostLocales(slug: string): string[] {
  return ["en", ...Object.keys(BLOG_TRANSLATIONS).filter((l) => BLOG_TRANSLATIONS[l]?.[slug])];
}
