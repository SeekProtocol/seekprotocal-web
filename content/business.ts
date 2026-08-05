export const USE_CASES = [
  {
    id: "retail",
    label: "Retail & hospitality",
    title: "Turn a location into a reason to visit",
    body: "Place an offer at your door with a tight claim radius. It can only be taken by someone standing there, so the redemption you see is a person who came in, not an ad someone scrolled past.",
    metric: "Cost per verified arrival",
    points: [
      "Radius tuned to the doorway rather than the postcode",
      "Redemption recorded at the moment of arrival",
      "Works across a chain without per-store integration",
    ],
  },
  {
    id: "events",
    label: "Events & venues",
    title: "A claimable map for the length of the event",
    body: "Festivals, matches and conferences become a temporary layer of assets that expire when the event does. Attendance is what unlocks them, so the reward reaches the people who actually turned up.",
    metric: "On-site engagement",
    points: [
      "Time-boxed assets that expire on schedule",
      "Wide radii for grounds, tight ones for stages and stands",
      "Higher verification thresholds for high-value drops",
    ],
  },
  {
    id: "token",
    label: "Token & NFT projects",
    title: "Distribute to people, not to wallets",
    body: "A wallet is free to create, which is why airdrops get farmed. Requiring physical presence puts a real cost on each additional claim, because nobody is in forty cities at once.",
    metric: "Sybil resistance",
    points: [
      "Geographic distribution across chosen markets",
      "Per-device claim limits inside a radius and window",
      "Public claim record on Solana",
    ],
  },
  {
    id: "tourism",
    label: "Cities & tourism",
    title: "Route people through the places you want used",
    body: "Chain assets into a trail so visitors move along it in order. Quiet streets, secondary sites and off-peak hours can carry the rewards that busy landmarks do not need.",
    metric: "Footfall distribution",
    points: [
      "Sequenced quests across multiple sites",
      "Off-peak weighting to spread demand",
      "Aggregate arrival counts, never individual traces",
    ],
  },
];

/* The four setup steps used to live here as prose. They are now the four steps
   of the interactive console in `components/business/DeployConsole.tsx`, which
   says the same thing by letting someone do it. */

export const MEASUREMENT = [
  { label: "What is counted", value: "A verified arrival inside your radius" },
  { label: "When it is counted", value: "At the moment of claim, not inferred later" },
  { label: "What you receive", value: "Aggregate counts by location, time and campaign" },
  { label: "What you never receive", value: "Individual movement traces or identities" },
];
