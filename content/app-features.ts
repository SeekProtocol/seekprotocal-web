/**
 * Everything the app actually ships, described from the player's side.
 *
 * Only the shape lives here: ids, artwork and numbers. The words are in
 * `messages/<locale>.json` under `ranks`, `badges`, `achievements`, `clans`
 * and `featureGroups`, keyed by the ids below.
 */

export const RANKS = [
  { id: "seeker", tier: 1, img: "1-seeker-badge.png" },
  { id: "scout", tier: 2, img: "2-scout-badge.png" },
  { id: "tracker", tier: 3, img: "3-tracker-badge.png" },
  { id: "hunter", tier: 4, img: "4-hunter-badge.png" },
  { id: "pathfinder", tier: 5, img: "5-pathfinder-badge.png" },
  { id: "ranger", tier: 6, img: "6-ranger-badge.png" },
  { id: "sentinel", tier: 7, img: "7-sentinel-badge.png" },
  { id: "apex", tier: 8, img: "8-apex-badge.png" },
  { id: "mythic", tier: 9, img: "9-mythic-badge.png" },
  { id: "legend", tier: 10, img: "10-legend-badge.png" },
];

export const COLLECTIBLE_BADGES = [
  { id: "seeker", img: "51-Seeker-Badge.png" },
  { id: "diamondHands", img: "30-Diamond-Hands-Badge.png" },
  { id: "web3Wizard", img: "43-Web3-Wizard-Badge.png" },
  { id: "whale", img: "50-Whale-Badge.png" },
  { id: "bull", img: "46-Bull-Badge.png" },
  { id: "detective", img: "26-On-Chain-Detective-Badge.png" },
  { id: "samurai", img: "22-Degen-Samurai-Badge.png" },
  { id: "liquidityKing", img: "27-Liquidity-king-Badge.png" },
];

export const ACHIEVEMENTS = [
  { id: "firstCatch", img: "first_catch.png" },
  { id: "explorer", img: "explorer.png" },
  { id: "legendary", img: "legendary.png" },
  { id: "rareHunter", img: "rare_hunter.png" },
  { id: "streak", img: "streak_30.png" },
  { id: "clanFounder", img: "clan_founder.png" },
];

export const CLANS = [
  { id: "diamondHands", img: "diamond-hands.png", members: 4820, rank: 1 },
  { id: "laserEyes", img: "laser-eyes.png", members: 4108, rank: 2 },
  { id: "megaWhales", img: "mega-whales.png", members: 3944, rank: 3 },
  { id: "moonSquad", img: "moon-squad.png", members: 3612, rank: 4 },
  { id: "alphaWolves", img: "alpha-wolves.png", members: 3401, rank: 5 },
  { id: "yieldFarmers", img: "yield-farmers.png", members: 3188, rank: 6 },
  { id: "anonCabal", img: "anon-cabal.png", members: 2977, rank: 7 },
  { id: "bullRunners", img: "bull-runners.png", members: 2740, rank: 8 },
];

/**
 * The feature set, grouped the way a player would meet it. The four items in
 * each group are copy alone, so they live entirely in the message files.
 */
export const FEATURE_GROUPS = [
  { key: "hunt" },
  { key: "progress" },
  { key: "together" },
  { key: "own" },
] as const;
