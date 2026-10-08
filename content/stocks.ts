/**
 * The stock tokens on the map: Apple, Tesla and NVIDIA as Robinhood Stock
 * Tokens on Robinhood Chain (4663).
 *
 * Figures are the app's own, from `docs/robinhood-stock-drops.md` and
 * `docs/coins/stock-expansion/catalog.json` in the app repo:
 *  - `value` is the fixed game value of one catch in USD. At cash-out it is
 *    repriced into the token at the current ask, so the site quotes a dollar
 *    value and never a token amount.
 *  - `base` is the stock coin's own base catch chance. Apple's 30% is lower
 *    than the ordinary Uncommon rung on purpose, which is why these do not
 *    read from `RARITY_LADDER`.
 *
 * Artwork is the app's banner coin, trimmed and encoded by the same steps as
 * `scripts/build-rewards.py`. Only ids, numbers and artwork live here; every
 * word is in `messages/<locale>.json` under `stocksSection`.
 */

import type { Rarity } from "@/content/collectibles";

export type StockToken = {
  key: string;
  /** Brand name, the same in every locale. */
  name: string;
  ticker: string;
  rarity: Rarity;
  base: number;
  value: number;
  image: string;
};

export const STOCK_TOKENS: StockToken[] = [
  { key: "aapl", name: "Apple", ticker: "AAPL", rarity: "uncommon", base: 0.3, value: 0.05, image: "/app/rewards/rh-aapl.avif" },
  { key: "tsla", name: "Tesla", ticker: "TSLA", rarity: "rare", base: 0.156, value: 0.12, image: "/app/rewards/rh-tsla.avif" },
  { key: "nvda", name: "NVIDIA", ticker: "NVDA", rarity: "epic", base: 0.091, value: 0.3, image: "/app/rewards/rh-nvda.avif" },
];

/**
 * The issuer's own pages. The section links to them rather than restating
 * their lists, because the lists change and these pages are where they change.
 */
export const STOCK_LINKS = {
  restrictions: "https://docs.robinhood.com/rhj/restricted-jurisdictions/",
  terms: "https://robinhood.com/eu/en/legal/rhj/",
  faq: "https://docs.robinhood.com/rhj/faq/",
} as const;
