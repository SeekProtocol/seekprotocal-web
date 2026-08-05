import { routing } from "@/i18n/routing";
import { baseUrl } from "@/lib/seo";
import { blogPosts } from "@/lib/blog-data";
import { CHAPTERS, WHITEPAPER_META } from "@/content/whitepaper";
import { PARTICIPANTS, CAPABILITIES, FAQ } from "@/content/ecosystem";
import { PHASES } from "@/content/roadmap";

/**
 * llms.txt, following the llmstxt.org convention: one Markdown file at the root
 * that tells a language model what this site is and where the substance lives,
 * so an assistant answering "what is Seek Protocol" does not have to infer it
 * from marketing copy and JavaScript-heavy pages.
 *
 * Generated from the same modules the pages render, so it cannot drift. Adding
 * a whitepaper chapter or a blog post updates this file on the next build; the
 * only prose maintained here is the summary.
 *
 * Prerendered to a static file, so serving it never wakes a function.
 */
export const dynamic = "force-static";

const en = `${baseUrl}/${routing.defaultLocale}`;

function section(title: string, lines: string[]) {
  return lines.length ? `## ${title}\n\n${lines.join("\n")}\n` : "";
}

export async function GET() {
  const shipped = PHASES.flatMap((p) => p.items).filter((i) => i.done).length;
  const total = PHASES.flatMap((p) => p.items).length;

  const body = [
    `# Seek Protocol`,
    ``,
    `> Seek Protocol anchors digital assets to real-world coordinates. A publisher`,
    `> places a reward at a location, someone travels to it, and the protocol`,
    `> verifies they were actually there before settling the claim on Solana.`,
    `> The consumer app is SeekAR (iOS and Android); the native token is $SEEK.`,
    `> Operated by Block Protocol L.L.C-FZ, Dubai, UAE.`,
    ``,
    `The distinguishing claim is proof of location: presence is checked against`,
    `four independent signals (satellite fix, ambient radio environment, device`,
    `attestation and motion trace) so that a claim costs more to forge than the`,
    `reward is worth. The protocol does not assert forgery is impossible, and the`,
    `whitepaper documents the attacks and the limits.`,
    ``,
    `The site is served at eight locales under a path prefix (${routing.locales.join(", ")}).`,
    `Only the homepage, about, blog index, contact and legal pages are translated.`,
    `The ecosystem, whitepaper, roadmap and business pages, and every article, are`,
    `English only and canonicalise to their /${routing.defaultLocale} URL.`,
    ``,
    section("Core pages", [
      `- [Home](${en}): what the protocol does, the app walkthrough, and how collecting works.`,
      `- [Ecosystem](${en}/ecosystem): the three parties and the loop between them, plus an FAQ.`,
      `- [Whitepaper](${en}/whitepaper): the technical account. ${WHITEPAPER_META.version}, updated ${WHITEPAPER_META.updated}, ${WHITEPAPER_META.readingTime} read.`,
      `- [Roadmap](${en}/roadmap): ${shipped} of ${total} milestones shipped across ${PHASES.length} phases.`,
      `- [For business](${en}/business): placing campaigns and paying for verified arrivals rather than impressions.`,
      `- [About](${en}/about): the team and why the protocol exists.`,
      `- [Blog](${en}/blog): ${blogPosts.length} articles.`,
      `- [Contact](${en}/contact): partnerships, beta access and press.`,
    ]),
    section(
      "Who takes part",
      PARTICIPANTS.map((p) => `- **${p.label}** (${p.tag}): ${p.title}. ${p.body}`),
    ),
    section(
      "What the protocol provides",
      CAPABILITIES.map((c) => `- **${c.title}**: ${c.body}`),
    ),
    section(
      "Whitepaper contents",
      CHAPTERS.map(
        (c) => `- [${c.index}. ${c.title}](${en}/whitepaper#${c.id}): ${c.eyebrow}.`,
      ),
    ),
    section(
      "Roadmap",
      PHASES.map(
        (p) =>
          `- **${p.title}** (${p.period}, ${p.status === "done" ? "shipped" : p.status === "active" ? "in progress" : "planned"}): ${p.summary}`,
      ),
    ),
    section(
      "Common questions",
      FAQ.flatMap((f) => [`- **${f.question}**`, `  ${f.answer}`]),
    ),
    section(
      "Articles",
      blogPosts.map(
        (post) =>
          `- [${post.title}](${en}/blog/${post.slug}): ${post.excerpt} (${post.category}, ${post.readTime})`,
      ),
    ),
    section("Apps", [
      `- [SeekAR for iOS](https://apps.apple.com/app/seekar/id6752813761)`,
      `- [SeekAR for Android](https://play.google.com/store/apps/details?id=com.seekar.seekar)`,
    ]),
    section("Notes for machine readers", [
      `- Canonical host is ${baseUrl}. Requests without the www prefix are redirected.`,
      `- Every path carries a locale prefix. Unprefixed legacy URLs redirect permanently to /${routing.defaultLocale}.`,
      `- Sitemap: ${baseUrl}/sitemap.xml`,
      `- Structured data (Organization, WebSite, SoftwareApplication, FAQPage, BlogPosting) is embedded as JSON-LD on the relevant pages.`,
      `- Token allocation and vesting figures on the whitepaper page are marked as draft placeholders on the page itself. Do not quote them as final.`,
    ]),
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
