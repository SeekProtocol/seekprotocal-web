/**
 * The coins you can actually catch, with the app's own ladder.
 *
 * Odds and values come from the SeekAR migrations:
 *  - `two_attempts_per_spawn` (29 July) sets base_collection_chance per rarity
 *    and caps a spawn at two attempts with a 0.65 decay. It supersedes
 *    `rebalance_catch_ladder`, which had three attempts at 0.50, and the two
 *    levers move against each other so the overall odds land on the same curve.
 *  - `game_value_per_coin` sets what one caught unit is worth in the game.
 *
 * The `overall` figures are the migration's own published table. They sit a
 * couple of points above what the bare base chance and decay give, because the
 * table is quoted for a level 5 player who fills the charge bar and carries the
 * cold-streak bonus. `GAME_CONFIG` below holds the terms that account for it.
 *
 * A caught unit is a game unit, not a token. What it pays out in real tokens
 * is the market's business, not the game's.
 */

export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

/**
 * Colours are the app's own two-stop rarity gradients, from
 * `shared/constants/index.ts` — grey, green, cyan, purple, gold. The wallet
 * deliberately uses a different palette because there the colour follows the
 * coin brand rather than the rarity.
 */
export const RARITY_LADDER: Record<
  Rarity,
  {
    base: number;
    overall: number;
    value: number;
    colour: string;
    colourEnd: string;
  }
> = {
  common: { base: 0.58, overall: 0.76, value: 0.02, colour: "#a0a0b8", colourEnd: "#70708a" },
  uncommon: { base: 0.44, overall: 0.62, value: 0.05, colour: "#00e676", colourEnd: "#00c853" },
  rare: { base: 0.27, overall: 0.43, value: 0.12, colour: "#00d2ff", colourEnd: "#0091ea" },
  epic: { base: 0.17, overall: 0.29, value: 0.3, colour: "#6c5ce7", colourEnd: "#a29bfe" },
  legendary: { base: 0.1, overall: 0.19, value: 0.75, colour: "#ffd740", colourEnd: "#ffa000" },
};

/** Two attempts per spawn, the retry worth 0.65 of the first. */
export const MAX_ATTEMPTS = 2;
export const RETRY_DECAY = 0.65;

/**
 * The rest of the terms in the catch roll, from `game_config`. The formula
 * they feed is `collect-coin/chance.ts`, reproduced verbatim by the whitepaper
 * figure so the site is never quoting a model the app does not run:
 *
 *   before tap = clamp(base × powerups + level + clan + coldStreak − streak)
 *   final      = clamp(before tap × (0.85 + 0.15 × tapQuality) × decay^(n-1))
 */
export const GAME_CONFIG = {
  levelBonusPerLevel: 0.003,
  clanBonusCap: 0.05,
  coldStreakPerFail: 0.02,
  coldStreakCap: 0.12,
  streakPenaltyPerSuccess: 0.04,
  streakPenaltyCap: 0.2,
  minChance: 0.05,
  maxChance: 0.95,
  /** The catch ring moves the roll by ±7.5%: a miss shaves 15% off. */
  tapFloor: 0.85,
  tapSpan: 0.15,
} as const;

export type Collectible = {
  key: string;
  name: string;
  symbol: string;
  rarity: Rarity;
  image: string;
  xp: number;
};

export const COLLECTIBLES: Collectible[] = [
  { key: "trump", name: "Official Trump", symbol: "TRUMP", rarity: "legendary", image: "/images/official-trump-cryptocurrency-14325720-11625811.webp", xp: 900 },
  { key: "btc", name: "Bitcoin", symbol: "BTC", rarity: "legendary", image: "/images/bitcoin-2.avif", xp: 900 },
  { key: "pudgy", name: "Pudgy Penguins", symbol: "PENGU", rarity: "epic", image: "/images/pudgy-penguins-crypto-13701312-11009751.webp", xp: 420 },
  { key: "virtuals", name: "Virtuals Protocol", symbol: "VIRTUAL", rarity: "epic", image: "/images/virtuals-protocol-crypto-13701310-11009749.webp", xp: 420 },
  { key: "wif", name: "dogwifhat", symbol: "WIF", rarity: "rare", image: "/images/dogwifhat-cryptocurrency-11686723-9554873.webp", xp: 240 },
  { key: "popcat", name: "Popcat", symbol: "POPCAT", rarity: "rare", image: "/images/popcat-cryptocurrency-12315804-10033435.webp", xp: 240 },
  { key: "bonk", name: "Bonk", symbol: "BONK", rarity: "uncommon", image: "/images/bonk-cryptocurrency.avif", xp: 140 },
  { key: "fartcoin", name: "Fartcoin", symbol: "FARTCOIN", rarity: "common", image: "/images/fartcoin-cryptocurrency-14325725-11625815.webp", xp: 80 },
];

/** Power-ups, from the app's own manifest. Names and effects live in `powerups`. */
export const POWERUPS = [
  { key: "coin_magnet" },
  { key: "diamond_hands" },
  { key: "pump_it" },
  { key: "to_the_moon" },
  { key: "whale" },
  { key: "this_is_fine" },
];
