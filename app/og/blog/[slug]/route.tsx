import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getAllSlugs, getBlogPost } from "@/lib/blog-data";
import { CARD_COLORS, CARD_SIZE, loadCardFonts, loadCoinDataUri } from "@/lib/og-assets";

/**
 * Per-article share cards.
 *
 * The articles' own artwork is AVIF, which none of the major scrapers decode,
 * so every post previously shared as a broken image. These render the headline
 * into a real PNG instead, which also means a post is legible in a timeline
 * without the reader opening it.
 *
 * Not locale-scoped: the articles themselves exist only in English.
 */
export const dynamic = "force-static";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const [fonts, coin] = await Promise.all([loadCardFonts(), loadCoinDataUri()]);

  // Long headlines need to step down a size or they overrun the card.
  const titleSize = post.title.length > 64 ? 58 : post.title.length > 44 ? 66 : 76;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: CARD_COLORS.bg,
          padding: "68px 76px",
          position: "relative",
          fontFamily: "DM Sans",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(820px 480px at 100% 0%, ${CARD_COLORS.brand2}2e, transparent 68%), radial-gradient(760px 520px at 0% 100%, ${CARD_COLORS.brand}2e, transparent 68%)`,
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 999,
                background: CARD_COLORS.brand3,
              }}
            />
            <div
              style={{
                fontSize: 23,
                fontWeight: 500,
                letterSpacing: 4,
                color: CARD_COLORS.muted,
              }}
            >
              SEEK PROTOCOL
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              fontWeight: 500,
              letterSpacing: 2,
              color: CARD_COLORS.brand,
              border: `1px solid ${CARD_COLORS.brand}55`,
              borderRadius: 999,
              padding: "10px 24px",
            }}
          >
            {post.category.toUpperCase()}
          </div>
        </div>

        <div
          style={{
            position: "relative",
            display: "flex",
            fontSize: titleSize,
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: -2,
            color: CARD_COLORS.text,
            maxWidth: 1000,
          }}
        >
          {post.title}
        </div>

        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 25,
              fontWeight: 500,
              color: CARD_COLORS.muted,
            }}
          >
            {post.readTime} · seekprotocol.ai
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={coin} alt="" width={150} height={150} />
        </div>
      </div>
    ),
    { ...CARD_SIZE, fonts },
  );
}
