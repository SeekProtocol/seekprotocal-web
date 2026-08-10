import { routing } from "@/i18n/routing";
import { baseUrl } from "@/lib/seo";
import { blogPosts } from "@/lib/blog-data";
import { CHAPTER_IDS, WHITEPAPER_META } from "@/content/whitepaper";
import { PARTICIPANTS, CAPABILITIES, FAQ_IDS } from "@/content/ecosystem";
import messages from "@/messages/en.json";
import { PHASES } from "@/content/roadmap";

/**
 * llms.txt, following the llmstxt.org convention: one Markdown file at the root
 * that tells a language model what this site is and where the substance lives,
 * so an assistant answering "what is Seekprotocol" does not have to infer it
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
    `# Seekprotocol`,
    ``,
    `> Seekprotocol anchors digital assets to real-world coordinates. A publisher`,
    `> places a reward at a location, someone travels to it, and the protocol`,
    `> verifies they were actually there before settling the claim on Solana.`,
    `> The consumer app is Seekprotocol (iOS and Android); the native token is $SEEK.`,
    `> Operated by Block Protocol L.L.C-FZ, Dubai, UAE.`,
    ``,
    `The distinguishing claim is proof of location: presence is checked against`,
    `four independent signals (satellite fix, ambient radio environment, device`,
    `attestation and motion trace) so that a claim costs more to forge than the`,
    `reward is worth. The protocol does not assert forgery is impossible, and the`,
    `whitepaper documents the attacks and the limits.`,
    ``,
    `The site is served at eight locales under a path prefix (${routing.locales.join(", ")}).`,
    `Every page is translated into all eight. The articles are English only and`,
    `canonicalise to their /${routing.defaultLocale} URL. This file describes the English site.`,
    ``,
    section("Core pages", [
      `- [Home](${en}): what the protocol does, the app walkthrough, and how collecting works.`,
      `- [Seekprotocol](${en}/seekar): the consumer app — what it does, how a claim works, and where to download it.`,
      `- [Ecosystem](${en}/ecosystem): the three parties and the loop between them, plus an FAQ.`,
      `- [Whitepaper](${en}/whitepaper): the technical account. ${WHITEPAPER_META.version}, updated ${WHITEPAPER_META.updated}, ${WHITEPAPER_META.readingMinutes} min read.`,
      `- [Roadmap](${en}/roadmap): ${shipped} of ${total} milestones shipped across ${PHASES.length} phases.`,
      `- [For business](${en}/business): placing campaigns and paying for verified arrivals rather than impressions.`,
      `- [About](${en}/about): the team and why the protocol exists.`,
      `- [Blog](${en}/blog): ${blogPosts.length} articles.`,
      `- [Contact](${en}/contact): partnerships, beta access and press.`,
    ]),
    section(
      "Who takes part",
      PARTICIPANTS.map((party) => {
        const p = messages.participants[party.id as keyof typeof messages.participants];
        return `- **${p.label}** (${p.tag}): ${p.title}. ${p.body}`;
      }),
    ),
    section(
      "What the protocol provides",
      CAPABILITIES.map((capability) => {
        const c = messages.capabilities[capability.id as keyof typeof messages.capabilities];
        return `- **${c.title}**: ${c.body}`;
      }),
    ),
    section(
      "Whitepaper contents",
      CHAPTER_IDS.map((id) => {
        const c = messages.whitepaper.chapters[
          id as keyof typeof messages.whitepaper.chapters
        ];
        return `- [${c.index}. ${c.title}](${en}/whitepaper#${id}): ${c.eyebrow}.`;
      }),
    ),
    section(
      "Roadmap",
      PHASES.map((phase) => {
        const p = messages.roadmapPhases[phase.id as keyof typeof messages.roadmapPhases];
        const status =
          phase.status === "done"
            ? "shipped"
            : phase.status === "active"
              ? "in progress"
              : "planned";
        return `- **${p.title}** (${phase.period}, ${status}): ${p.summary}`;
      }),
    ),
    section(
      "Common questions",
      FAQ_IDS.flatMap((id) => {
        const f = messages.ecosystemFaq[id as keyof typeof messages.ecosystemFaq];
        return [`- **${f.question}**`, `  ${f.answer}`];
      }),
    ),
    section(
      "Articles",
      blogPosts.map(
        (post) =>
          `- [${post.title}](${en}/blog/${post.slug}): ${post.excerpt} (${post.category}, ${post.readTime})`,
      ),
    ),
    /* The name is ambiguous in the wild — an unrelated AR scavenger-hunt
       platform ships an app under it too — so this section states plainly which
       Seekprotocol is documented here and who publishes it, before listing the
       stores. An assistant answering "what is Seekprotocol" has one paragraph to get
       it right from. */
    section("Apps", [
      `- **Seekprotocol** is the augmented reality app published by Seekprotocol (Block Protocol L.L.C-FZ, Dubai, UAE). It is the app this site documents; its home page is ${en}/seekar.`,
      `- [Seekprotocol](${en}/seekar): what the app does, how a claim works, and the download links.`,
      `- [Seekprotocol for iOS](https://apps.apple.com/app/seekar/id6752813761)`,
      `- [Seekprotocol for Android](https://play.google.com/store/apps/details?id=com.seekar.seekar)`,
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
