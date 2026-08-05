import { CITIES, type City } from "@/lib/seek-cities";
import { COLLECTIBLES, RARITY_LADDER, type Rarity } from "@/content/collectibles";

export type { Rarity };

/**
 * The coin a pin is carrying. Each city holds one for the length of the
 * session, so the sprite on the globe and the card you get when you tap it
 * are always the same coin — they used to disagree, because the card drew the
 * SEEK render no matter what the sprite showed.
 */
export type DropCoin = {
  key: string;
  name: string;
  symbol: string;
  image: string;
  rarity: Rarity;
  xp: number;
};

/** SEEK itself, which is not one of the collectibles but does spawn. */
export const SEEK_COIN: DropCoin = {
  key: "seek",
  name: "SEEK",
  symbol: "SEEK",
  image: "/app/seek-coin-3d.png",
  rarity: "rare",
  xp: 220,
};

export const DROP_COINS: DropCoin[] = [
  SEEK_COIN,
  ...COLLECTIBLES.map((c) => ({
    key: c.key,
    name: c.name,
    symbol: c.symbol,
    image: c.image,
    rarity: c.rarity,
    xp: c.xp,
  })),
];

export type Drop = {
  id: number;
  city: City;
  seeker: string;
  coin: DropCoin;
  rarity: Rarity;
  /** How it was distributed, which is separate from what it is. An id. */
  kind: string;
  amount: number;
  xp: number;
  /** Seconds ago, at the moment the drop was made. */
  ago: number;
};

const HANDLES = [
  "nova", "kite", "atlas", "wren", "orbit", "flint", "juno", "vex", "sable", "koi",
  "echo", "pike", "lumen", "arc", "onyx", "mira", "dune", "rook", "zephyr", "cinder",
  "quill", "haze", "bolt", "ferro", "ripple", "tundra", "vault", "moss", "delta", "prism",
];

const SUFFIX = ["", "", "_", ".", "42", "77", "01", "xyz", "hq", "irl"];

/**
 * How a drop reached someone. The coin decides rarity; this decides route.
 * These are ids into `dropKinds` in the message files.
 */
const KINDS = ["airdrop", "quest", "partner", "event", "cache"];

export const RARITY_COLOUR: Record<Rarity, string> = Object.fromEntries(
  Object.entries(RARITY_LADDER).map(([k, v]) => [k, v.colour])
) as Record<Rarity, string>;

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

let nextId = 0;

export function makeDrop(city: City, coin: DropCoin): Drop {
  // Rarity and XP follow the coin; only the amount and the route vary.
  const spread = 0.7 + Math.random() * 0.6;
  return {
    id: nextId++,
    city,
    seeker: `${pick(HANDLES)}${pick(SUFFIX)}`,
    coin,
    rarity: coin.rarity,
    kind: pick(KINDS),
    amount: Math.max(1, Math.round(2 + Math.random() * 6)),
    xp: Math.round(coin.xp * spread),
    ago: Math.floor(Math.random() * 50) + 2,
  };
}

/** A city weighted by its activity, for choosing who fires next. */
export function weightedCities(): City[] {
  const pool: City[] = [];
  for (const city of CITIES) {
    const n = Math.max(1, Math.round(city.weight * 5));
    for (let i = 0; i < n; i++) pool.push(city);
  }
  return pool;
}
