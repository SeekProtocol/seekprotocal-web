import { ImageResponse } from "next/og";
import { CARD_COLORS, CARD_SIZE, loadCardFonts, loadCoinDataUri } from "@/lib/og-assets";

/**
 * The site-wide share card, at the 1200x630 that Facebook, X, LinkedIn, Slack
 * and iMessage all expect.
 *
 * Prerendered to a static PNG at build time, so no request for it ever wakes a
 * function.
 */
export const dynamic = "force-static";

export async function GET() {
  const [fonts, coin] = await Promise.all([loadCardFonts(), loadCoinDataUri()]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: CARD_COLORS.bg,
          position: "relative",
          fontFamily: "DM Sans",
        }}
      >
        {/* Brand wash, bottom-left to top-right, mirroring the site's hero. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(900px 520px at 12% 108%, ${CARD_COLORS.brand}38, transparent 70%), radial-gradient(760px 460px at 86% -8%, ${CARD_COLORS.brand2}30, transparent 70%)`,
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            width: "100%",
            height: "100%",
            padding: "72px 76px",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 660 }}>
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
                  fontSize: 24,
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
                marginTop: 34,
                fontSize: 74,
                fontWeight: 700,
                lineHeight: 1.04,
                letterSpacing: -2.5,
                color: CARD_COLORS.text,
              }}
            >
              Digital assets that
            </div>
            <div
              style={{
                fontSize: 74,
                fontWeight: 700,
                lineHeight: 1.04,
                letterSpacing: -2.5,
                background: `linear-gradient(90deg, ${CARD_COLORS.brand}, ${CARD_COLORS.brand2})`,
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              live in a place
            </div>

            <div
              style={{
                marginTop: 30,
                fontSize: 29,
                fontWeight: 500,
                lineHeight: 1.4,
                color: CARD_COLORS.muted,
              }}
            >
              Rewards anchored to real coordinates, verified on arrival, settled
              on any chain.
            </div>
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={coin} alt="" width={352} height={352} />
        </div>
      </div>
    ),
    { ...CARD_SIZE, fonts },
  );
}
