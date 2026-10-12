/**
 * The coins you can actually catch, with the app's own ladder.
 *
 * Odds and values come from the Seekprotocol migrations:
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
  /** The coin's own base catch chance, from `memecoins.base_collection_chance`. */
  base: number;
  /**
   * Game value of one caught unit in USD, from `memecoins.game_value_usd`.
   * Null for a coin that is redeemable at TGE: $SEEK carries a count and no
   * figure until the token is released, and the site does not name one either.
   */
  value: number | null;
};

/**
 * Every coin active on the map, read from the live `memecoins` table on
 * 12 October 2026, minus the stock tokens, which have their own section in
 * `content/stocks.ts`. Keys are the app's own.
 *
 * Odds and values are per coin rather than read from `RARITY_LADDER`: the
 * live rungs (47%, 30%, 15.6% and 9.1%, set by
 * `rarity_outranks_everything_and_tapping_pays`) have moved since that table
 * was written, and Solana is priced and weighted on its own, not on the
 * legendary rung. `xp` is the site's own demo figure per rarity, used by the
 * globe and the walkthrough, not the app's `xp_reward`.
 *
 * Artwork is the app's `assets/coins/<key>.png`, trimmed and encoded to AVIF.
 * Eight of those are drawn on the app's flat #07070D background rather than on
 * transparency, so they were cut out first; the coins the site already had a
 * transparent render of keep it.
 */
const XP: Record<Rarity, number> = { common: 80, uncommon: 140, rare: 240, epic: 420, legendary: 900 };

const coin = (
  key: string,
  name: string,
  symbol: string,
  rarity: Rarity,
  base: number,
  value: number | null,
  image = `/images/coins/${key}.avif`,
): Collectible => ({ key, name, symbol, rarity, image, xp: XP[rarity], base, value });

export const COLLECTIBLES: Collectible[] = [
  coin("solana", "Solana", "SOL", "legendary", 0.1, 0.5),
  coin("jupiter", "Jupiter", "JUP", "rare", 0.156, 0.12),
  coin("seeker", "Seeker", "SKR", "rare", 0.156, 0.12),
  coin("dogwifhat", "dogwifhat", "WIF", "rare", 0.156, 0.12, "/images/dogwifhat-cryptocurrency-11686723-9554873.webp"),
  coin("trump", "Official Trump", "TRUMP", "uncommon", 0.3, 0.05, "/images/official-trump-cryptocurrency-14325720-11625811.webp"),
  coin("pengu", "Pudgy Penguins", "PENGU", "uncommon", 0.3, 0.05, "/images/pudgy-penguins-crypto-13701312-11009751.webp"),
  coin("virtualsprotocol", "Virtuals Protocol", "VIRTUAL", "uncommon", 0.3, 0.05, "/images/virtuals-protocol-crypto-13701310-11009749.webp"),
  coin("spx6900", "SPX6900", "SPX", "uncommon", 0.3, 0.05),
  coin("zcat", "Anonymous Cat", "ZCAT", "uncommon", 0.3, 0.05),
  coin("seek", "Seek", "SEEK", "common", 0.47, null, "/app/seek-coin-3d.png"),
  coin("bonk", "Bonk", "BONK", "common", 0.47, 0.02, "/images/bonk-cryptocurrency.avif"),
  coin("popcat", "Popcat", "POPCAT", "common", 0.47, 0.02, "/images/popcat-cryptocurrency-12315804-10033435.webp"),
  coin("fartcoin", "Fartcoin", "FARTCOIN", "common", 0.47, 0.02, "/images/fartcoin-cryptocurrency-14325725-11625815.webp"),
  coin("hyperliquid", "Hyperliquid", "HYPE", "common", 0.47, 0.02),
  coin("cake", "PancakeSwap", "CAKE", "common", 0.47, 0.02),
  coin("moodeng", "Moo Deng", "MOODENG", "common", 0.47, 0.02),
  coin("mew", "cat in a dogs world", "MEW", "common", 0.47, 0.02),
  coin("ponke", "Ponke", "PONKE", "common", 0.47, 0.02),
  coin("pumpfun", "Pump", "PUMP", "common", 0.47, 0.02),
  coin("cupsey", "CUPSEY", "CUPSEY", "common", 0.47, 0.02),
  coin("the-black-bull", "The Black Bull", "ANSEM", "common", 0.47, 0.02),
  coin("ai16z", "ai16z", "AI16Z", "common", 0.47, 0.02),
];

/** A collectible by its app key, for the scenes that stage particular coins. */
export const collectible = (key: string): Collectible =>
  COLLECTIBLES.find((c) => c.key === key) ?? COLLECTIBLES[0];

/**
 * The chance of keeping a spawn over every attempt it allows, for a player
 * with no bonuses who fills the catch ring: each retry is worth RETRY_DECAY of
 * the one before it.
 */
export const overAllAttempts = (base: number): number => {
  let miss = 1;
  for (let i = 0; i < MAX_ATTEMPTS; i++) miss *= 1 - base * Math.pow(RETRY_DECAY, i);
  return 1 - miss;
};

/** Power-ups, from the app's own manifest. Names and effects live in `powerups`. */
export const POWERUPS = [
  { key: "coin_magnet" },
  { key: "diamond_hands" },
  { key: "pump_it" },
  { key: "to_the_moon" },
  { key: "whale" },
  { key: "this_is_fine" },
];
