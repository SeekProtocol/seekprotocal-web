import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Assets for the generated share cards.
 *
 * Read from disk rather than fetched: the OG routes are prerendered at build
 * time, so there is no server to fetch from, and inlining keeps the card
 * independent of whether the site itself is reachable.
 */

const root = process.cwd();

export async function loadCoinDataUri() {
  const png = await readFile(join(root, "public/app/seek-coin-3d.png"));
  return `data:image/png;base64,${png.toString("base64")}`;
}

export async function loadCardFonts() {
  const [bold, medium] = await Promise.all([
    readFile(join(root, "fonts/DMSans-Bold.ttf")),
    readFile(join(root, "fonts/DMSans-Medium.ttf")),
  ]);

  return [
    { name: "DM Sans", data: bold, weight: 700 as const, style: "normal" as const },
    { name: "DM Sans", data: medium, weight: 500 as const, style: "normal" as const },
  ];
}

export const CARD_SIZE = { width: 1200, height: 630 };

/**
 * The card layout, shared by the site card and the per-article cards so a blog
 * post and the homepage read as the same brand in a timeline.
 *
 * Colours are the dark-theme tokens from globals.css. They cannot be read from
 * CSS custom properties here, because Satori resolves no cascade.
 */
export const CARD_COLORS = {
  bg: "#000000",
  surface: "#101014",
  text: "#ffffff",
  muted: "#9096a6",
  brand: "#2dabff",
  brand2: "#d95cff",
  brand3: "#12f0b8",
};
