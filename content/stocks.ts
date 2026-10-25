/**
 * The stock tokens on the map: Apple, Amazon, Tesla, Google and NVIDIA, paid
 * out as xStocks on Solana (tracker certificates from Backed Assets (JE)
 * Limited). They moved there from Robinhood Chain on 17 October 2026, in the
 * app's `20261017120000_stock_payouts_as_xstocks.sql`: the Robinhood Chain
 * pools held too little of each token to pay out. Google's xStock follows
 * Alphabet Class A, hence GOOGLx.
 *
 * Figures are the app's own, from `docs/robinhood-stock-drops.md`,
 * `docs/coins/stock-expansion/catalog.json` and
 * `docs/coins/google-amazon/catalog.json` in the app repo:
 *  - `value` is the fixed game value of one catch in USD. At cash-out it is
 *    repriced into the token at the current ask, so the site quotes a dollar
 *    value and never a token amount.
 *  - `base` is the stock coin's own base catch chance. Apple's 30% is lower
 *    than the ordinary Uncommon rung on purpose, which is why these do not
 *    read from `RARITY_LADDER`. Amazon sits on the same rung as Apple and
 *    Google on the same rung as Tesla.
 *
 * Artwork is the app's banner coin, trimmed and encoded by the same steps as
 * `scripts/build-rewards.py`. Only ids, numbers and artwork live here; every
 * word is in `messages/<locale>.json` under `stocksSection`, and the legal
 * wording there follows the app's own `stockTokens` copy.
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
  { key: "aapl", name: "Apple", ticker: "AAPLx", rarity: "uncommon", base: 0.3, value: 0.05, image: "/app/rewards/rh-aapl.avif" },
  { key: "amzn", name: "Amazon", ticker: "AMZNx", rarity: "uncommon", base: 0.3, value: 0.05, image: "/app/rewards/rh-amzn.avif" },
  { key: "tsla", name: "Tesla", ticker: "TSLAx", rarity: "rare", base: 0.156, value: 0.12, image: "/app/rewards/rh-tsla.avif" },
  { key: "googl", name: "Google", ticker: "GOOGLx", rarity: "rare", base: 0.156, value: 0.12, image: "/app/rewards/rh-googl.avif" },
  { key: "nvda", name: "NVIDIA", ticker: "NVDAx", rarity: "epic", base: 0.091, value: 0.3, image: "/app/rewards/rh-nvda.avif" },
];

/**
 * The issuer's own pages, the same three the app's token declaration links
 * to. The section links to them rather than restating their lists, because
 * the lists change and these pages are where they change.
 */
export const STOCK_LINKS = {
  legal: "https://assets.backed.fi/legal-documentation",
  terms: "https://xstocks.fi/documents/xstocks-terms-of-service.pdf",
  regulationS: "https://www.ecfr.gov/current/title-17/section-230.902#p-230.902",
} as const;
