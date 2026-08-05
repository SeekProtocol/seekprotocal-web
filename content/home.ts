/** Press logos shown in the homepage marquee, rendered as silhouettes. */
export const PRESS_LOGOS = [
  { src: "binance.svg", alt: "Binance" },
  { src: "cointelegraph.svg", alt: "CoinTelegraph" },
  { src: "Business-insider-logo.avif", alt: "Business Insider" },
  { src: "Coinmarketcap_svg_logo.svg", alt: "CoinMarketCap" },
  { src: "benzinga-logo.avif", alt: "Benzinga" },
  // Omitted because the artwork carries an opaque background, so a silhouette
  // renders as a filled block: bitcoin-mgzn.avif (no alpha channel at all)
  // and AP_logo_PNG_1.avif (white plate baked in). Re-add either once a
  // cut-out version exists.
  { src: "99bitcoins-logo.svg", alt: "99Bitcoins" },
  { src: "Morningstar_Logo.svg.avif", alt: "Morningstar" },
  { src: "cryptonews-seeklogo.avif", alt: "CryptoNews" },
  { src: "digital-journal-logo.avif", alt: "Digital Journal" },
  { src: "Newsbtc.avif", alt: "NewsBTC" },
  { src: "67c89abf51d51e6df6b2dab6_cryptodaily.avif", alt: "Crypto Daily" },
  { src: "accessnewswire-logo-Photoroom.avif", alt: "AccessNewswire" },
  { src: "company_logo_street_insider.avif", alt: "Street Insider" },
];

/**
 * The homepage process. These are genuinely sequential, you cannot collect
 * before you arrive, which is what earns the numbering.
 *
 * The copy lives in `messages/<locale>.json` under `homeSteps`, keyed by id.
 */
export const HOME_STEPS = [
  { id: "placed" },
  { id: "arrive" },
  { id: "collect" },
] as const;

/** Headline figures for the hero. Labels come from `homeStats`. */
export const HOME_STATS = [
  { id: "accuracy", value: 30, suffix: " m", decimals: 0 },
  { id: "languages", value: 8, suffix: "", decimals: 0 },
  { id: "stores", value: 2, suffix: "", decimals: 0 },
];
