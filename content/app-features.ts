/** Everything the app actually ships, described from the player's side. */

export const RANKS = [
  { tier: 1, name: "Seeker", img: "1-seeker-badge.png" },
  { tier: 2, name: "Scout", img: "2-scout-badge.png" },
  { tier: 3, name: "Tracker", img: "3-tracker-badge.png" },
  { tier: 4, name: "Hunter", img: "4-hunter-badge.png" },
  { tier: 5, name: "Pathfinder", img: "5-pathfinder-badge.png" },
  { tier: 6, name: "Ranger", img: "6-ranger-badge.png" },
  { tier: 7, name: "Sentinel", img: "7-sentinel-badge.png" },
  { tier: 8, name: "Apex", img: "8-apex-badge.png" },
  { tier: 9, name: "Mythic", img: "9-mythic-badge.png" },
  { tier: 10, name: "Legend", img: "10-legend-badge.png" },
];

export const COLLECTIBLE_BADGES = [
  { name: "Seeker", img: "51-Seeker-Badge.png" },
  { name: "Diamond Hands", img: "30-Diamond-Hands-Badge.png" },
  { name: "Web3 Wizard", img: "43-Web3-Wizard-Badge.png" },
  { name: "Whale", img: "50-Whale-Badge.png" },
  { name: "Bull", img: "46-Bull-Badge.png" },
  { name: "On-Chain Detective", img: "26-On-Chain-Detective-Badge.png" },
  { name: "Degen Samurai", img: "22-Degen-Samurai-Badge.png" },
  { name: "Liquidity King", img: "27-Liquidity-king-Badge.png" },
];

export const ACHIEVEMENTS = [
  { name: "First catch", img: "first_catch.png", detail: "Collect your first drop" },
  { name: "Explorer", img: "explorer.png", detail: "Collect in 50 distinct places" },
  { name: "Legendary", img: "legendary.png", detail: "Catch a legendary spawn" },
  { name: "Rare hunter", img: "rare_hunter.png", detail: "250 rare catches" },
  { name: "Thirty-day streak", img: "streak_30.png", detail: "Play 30 days running" },
  { name: "Clan founder", img: "clan_founder.png", detail: "Start a clan of your own" },
];

export const CLANS = [
  { name: "Diamond Hands", img: "diamond-hands.png", members: 4820, rank: 1 },
  { name: "Laser Eyes", img: "laser-eyes.png", members: 4108, rank: 2 },
  { name: "Mega Whales", img: "mega-whales.png", members: 3944, rank: 3 },
  { name: "Moon Squad", img: "moon-squad.png", members: 3612, rank: 4 },
  { name: "Alpha Wolves", img: "alpha-wolves.png", members: 3401, rank: 5 },
  { name: "Yield Farmers", img: "yield-farmers.png", members: 3188, rank: 6 },
  { name: "Anon Cabal", img: "anon-cabal.png", members: 2977, rank: 7 },
  { name: "Bull Runners", img: "bull-runners.png", members: 2740, rank: 8 },
];

/** The feature set, grouped the way a player would meet it. */
export const FEATURE_GROUPS = [
  {
    key: "hunt",
    label: "Hunt",
    items: [
      {
        title: "Spawns on real coordinates",
        body: "Drops appear at fixed points around you and stay there until someone claims them. Mark one and the app counts down the distance as you walk.",
      },
      {
        title: "Persistent AR catches",
        body: "The coin anchors to the ground in front of you and stays anchored between sessions, so it is in the same spot for everyone who comes to it.",
      },
      {
        title: "Power-ups and timing",
        body: "Magnet, double and freeze stack on a catch. A timing bar decides how much of the drop you keep, because a legendary caught badly is still a legendary caught badly.",
      },
      {
        title: "Rarity that means something",
        body: "Common through legendary, with rarity driving the ring colour on the map before you get anywhere near it.",
      },
    ],
  },
  {
    key: "progress",
    label: "Progress",
    items: [
      {
        title: "Ten ranks, earned by walking",
        body: "Seeker through Legend. Rank comes from distance covered and places visited, not from what you spent.",
      },
      {
        title: "Sixty-one badges",
        body: "A full collectible set, from Diamond Hands to On-Chain Detective, each with its own unlock condition.",
      },
      {
        title: "Game Center and Play Games",
        body: "Achievements sync to the platform you already use, so the streaks and milestones sit alongside the rest of your games.",
      },
      {
        title: "Streaks and daily quests",
        body: "Missions that adapt to where you are and how you play, with the reward scaling as the streak holds.",
      },
    ],
  },
  {
    key: "together",
    label: "Together",
    items: [
      {
        title: "Clans",
        body: "Join or found one, pool contributions, and climb the clan table. Emblems, ranks and shared reward pools included.",
      },
      {
        title: "Encrypted chat",
        body: "Direct and clan messages, end-to-end encrypted, with disappearing messages when a conversation should not outlive itself.",
      },
      {
        title: "Leaderboards",
        body: "Global, national and clan-level, with medals for the top three and a table that updates as people walk.",
      },
      {
        title: "Referrals",
        body: "Bring people in and earn a share of what they collect. Your code is the first thing on the screen, because it is what you came for.",
      },
    ],
  },
  {
    key: "own",
    label: "Own",
    items: [
      {
        title: "A wallet without a seed phrase",
        body: "Created from a social login so you can collect within a minute of installing. Export the key whenever you want custody.",
      },
      {
        title: "SeekAR Pass",
        body: "A season track of rewards that runs alongside normal play, with a free tier and a paid one.",
      },
      {
        title: "Shop",
        body: "Power-ups, cosmetics and avatar pieces, priced in what you have collected rather than only in what you can buy.",
      },
      {
        title: "3D avatars",
        body: "Full Decentraland-compatible avatars with animations and emotes, not a cropped profile photo.",
      },
    ],
  },
] as const;
