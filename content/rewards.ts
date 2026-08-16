/**
 * What can be waiting at a coordinate.
 *
 * The collectibles section next to this one is coins, which is the part
 * everybody already pictures. This is the range: a token on any chain, a
 * memecoin nobody has a distribution channel for, an NFT, a voucher that is
 * worth something at a counter, a physical thing in a box, and the live event
 * that hands them all out at once.
 *
 * Artwork is under `public/app/rewards/`, built by `scripts/build-rewards.py`
 * from the 3000px source renders. All of it is one render style on
 * transparency, which is what lets the field below composite as a single scene
 * rather than a wall of stickers.
 *
 * Only ids, artwork and layout live here. Every word is in
 * `messages/<locale>.json` under `rewards`.
 */

export type RewardCategory =
  | "tokens"
  | "memes"
  | "nfts"
  | "vouchers"
  | "goods"
  | "events";

export type RewardItem = {
  id: string;
  category: RewardCategory;
  /** File under `public/app/rewards/`, or an absolute path for site artwork. */
  src: string;
  /** Intrinsic size, so next/image never has to guess a ratio. */
  w: number;
  h: number;
};

/**
 * Category order, which is also the order of the rail.
 *
 * Tokens first because it is the claim people arrive doubting, and events last
 * because it is the one that gathers the rest: an event is not a fifth kind of
 * reward, it is every kind handed out at a time and a place.
 */
export const REWARD_CATEGORIES: RewardCategory[] = [
  "tokens",
  "memes",
  "nfts",
  "vouchers",
  "goods",
  "events",
];

export const REWARD_ITEMS: RewardItem[] = [
  // Tokens. The SEEK coin is the site's own render and sits with them because
  // it is a token like the others, not a mascot.
  { id: "seek", category: "tokens", src: "/app/seek-coin-3d.png", w: 420, h: 420 },
  { id: "ethereum", category: "tokens", src: "/app/rewards/ethereum.avif", w: 640, h: 640 },
  { id: "solana", category: "tokens", src: "/app/rewards/solana.avif", w: 640, h: 640 },
  { id: "bnb", category: "tokens", src: "/app/rewards/bnb.avif", w: 640, h: 640 },
  { id: "hyperliquid", category: "tokens", src: "/app/rewards/hyperliquid-token.avif", w: 640, h: 628 },
  { id: "berachain", category: "tokens", src: "/app/rewards/berachain-cryptocurrency.avif", w: 609, h: 640 },

  { id: "dogecoin", category: "memes", src: "/app/rewards/dogecoin.avif", w: 640, h: 640 },
  { id: "pepe", category: "memes", src: "/app/rewards/pepe-cryptocurrency.avif", w: 609, h: 640 },
  { id: "babydoge", category: "memes", src: "/app/rewards/baby-doge-cryptocurrency.avif", w: 609, h: 640 },
  { id: "spx6900", category: "memes", src: "/app/rewards/spx6900-cryptocurrency.avif", w: 640, h: 640 },
  { id: "toshi", category: "memes", src: "/app/rewards/toshi-cryptocurrency.avif", w: 609, h: 640 },
  { id: "turbo", category: "memes", src: "/app/rewards/turbo-cryptocurrency.avif", w: 609, h: 640 },

  { id: "nft", category: "nfts", src: "/app/rewards/nft-auction.avif", w: 640, h: 506 },

  { id: "voucher", category: "vouchers", src: "/app/rewards/voucher.avif", w: 640, h: 348 },
  { id: "food", category: "vouchers", src: "/app/rewards/food-voucher.avif", w: 640, h: 436 },
  { id: "barcode", category: "vouchers", src: "/app/rewards/barcode-voucher.avif", w: 640, h: 372 },

  { id: "console", category: "goods", src: "/app/rewards/playstation.avif", w: 524, h: 640 },
  { id: "handheld", category: "goods", src: "/app/rewards/gaming-controller.avif", w: 640, h: 423 },
  { id: "shoes", category: "goods", src: "/app/rewards/shoes-for-sale.avif", w: 640, h: 608 },
];

/**
 * One of these is drawn at random when somebody taps participate, and its name
 * is announced on the win screen. Names live in `messages` under
 * `rewards.items`, because seven of the nineteen are common nouns that have to
 * translate. The other twelve are proper nouns and are the same string in every
 * locale, which is why they are copied rather than translated.
 */
export function randomReward(): RewardItem {
  return REWARD_ITEMS[Math.floor(Math.random() * REWARD_ITEMS.length)];
}

/**
 * Where a reward can sit, most prominent first.
 *
 * Positions are percentages of the stage, and every one of them clears the
 * 34-66% band down the middle because that is where the phone stands. The
 * front four are the slots the selected category takes; everything else fills
 * in behind at decreasing size and opacity, so the field is always full and a
 * category with one item looks no emptier than one with six.
 *
 * `blur` is in pixels and is the only thing here that is purely decorative: it
 * is what stops the back rows competing with the front for attention, and it is
 * cheap because these never animate their filter, only their transform.
 */
export type Slot = { x: number; y: number; scale: number; opacity: number; blur: number };

export const SLOTS: Slot[] = [
  { x: 15, y: 26, scale: 1, opacity: 1, blur: 0 },
  { x: 85, y: 30, scale: 0.94, opacity: 1, blur: 0 },
  { x: 9, y: 66, scale: 0.86, opacity: 1, blur: 0 },
  { x: 91, y: 70, scale: 0.82, opacity: 1, blur: 0 },

  { x: 29, y: 9, scale: 0.56, opacity: 0.72, blur: 0.6 },
  { x: 71, y: 7, scale: 0.52, opacity: 0.72, blur: 0.6 },
  { x: 25, y: 91, scale: 0.56, opacity: 0.7, blur: 0.6 },
  { x: 75, y: 93, scale: 0.5, opacity: 0.68, blur: 0.8 },

  { x: 3, y: 42, scale: 0.4, opacity: 0.46, blur: 1.6 },
  { x: 97, y: 47, scale: 0.38, opacity: 0.44, blur: 1.6 },
  { x: 22, y: 48, scale: 0.32, opacity: 0.36, blur: 2.2 },
  { x: 79, y: 52, scale: 0.3, opacity: 0.34, blur: 2.2 },
];

/**
 * The two live event screens, which the phone cycles between.
 *
 * They are the app's own screens at 402x874, the exact aspect of the frame's
 * aperture, upscaled 2x when they were converted. That is an upscale rather
 * than a true retina asset: the source is all that exists. It holds up at the
 * size the phone is drawn, and if sharper exports ever appear they drop
 * straight in.
 */
/**
 * The map behind the win screen.
 *
 * A Mapbox render, cropped to the aperture's ratio and centred on the tower.
 * It replaced a drawn SVG street plan: the drawing was legible but it was
 * obviously a diagram, and the moment the section is selling is "this happened
 * in a real place", which a diagram cannot say.
 *
 * ⚠️ **Attribution.** This is Mapbox imagery and their terms require the logo
 * and the copyright line to stay visible wherever it is shown. The crop removes
 * the baked-in logo at the source's bottom left, so the win screen carries the
 * line in `rewards.mapCredit` instead. Do not delete it without checking what
 * licence this render was obtained under.
 */
export const FOUND_MAP = { src: "/app/screens/found-map.avif", w: 521, h: 1132 };

/**
 * The plate behind the app walkthrough's map screen.
 *
 * An aerial photograph of a town centre, not a rendered map. Three sources were
 * tried and this is the one that won on the only number that decides sharpness
 * here, which is the portrait crop's width against the 287 CSS px the phone
 * screen is drawn at:
 *
 *   a Tokyo vector render     567 x 1232   1.98x
 *   a Milwaukee vector render 845 x 1838   2.94x, but city-scale zoom
 *   this aerial               920 x 2000   3.21x, and already portrait
 *
 * It also compresses honestly. The vector renders are dense fine type at
 * exactly the size a street label is drawn, and AVIF spends its error budget
 * there first; a photograph of roofs has no such trap. The cost is bytes: this
 * is 154 KB against the map plate's 33 KB, which is the price of a photograph
 * and is paid on a screen that lazy-loads well below the fold.
 *
 * ⚠️ **Licence.** This is a stock aerial and it carries no attribution of its
 * own, unlike the Mapbox plate on the win screen. Establish what licence it was
 * obtained under before this ships.
 *
 * `aerial-day.avif` is the untreated crop, kept beside it. Night is what ships:
 * every other screen in the walkthrough is dark, and the coin glows, the cyan
 * route and the vignette drawn over this were all built for a night map.
 */
export const APP_MAP = { src: "/app/screens/aerial-night.avif", w: 880, h: 1913 };

export const EVENT_SCREENS = [
  { id: "bnb", src: "/app/screens/live-event-bnb.avif" },
  { id: "solana", src: "/app/screens/live-event-solana.avif" },
];
