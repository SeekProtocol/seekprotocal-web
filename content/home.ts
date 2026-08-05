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
 * The homepage process. These are genuinely sequential — you cannot collect
 * before you arrive — which is what earns the numbering.
 */
export const HOME_STEPS = [
  {
    title: "Something is placed",
    meta: "Publisher · anywhere on earth",
    body: "A brand, a project or an event pins an asset to a set of coordinates and sets the radius it can be claimed from. It sits there, visible on the map, until someone comes to get it.",
  },
  {
    title: "You walk into range",
    meta: "30 m default radius",
    body: "Your phone confirms you are actually there: satellite fix, ambient radio, device attestation and your motion trace all have to agree. Spoofing one signal is easy; spoofing all of them at once is not.",
  },
  {
    title: "You collect it",
    meta: "Sub-second settlement on Solana",
    body: "Hold up the camera, see the asset anchored in the street in front of you, and take it. The transfer settles on-chain for a fraction of a cent, and it is yours.",
  },
];

/** Headline figures for the hero. */
export const HOME_STATS = [
  { value: 30, suffix: " m", decimals: 0, label: "Claim accuracy" },
  { value: 8, suffix: "", decimals: 0, label: "Languages" },
  { value: 2, suffix: "", decimals: 0, label: "App stores live" },
];
