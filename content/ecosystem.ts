export const PARTICIPANTS = [
  {
    id: "seekers",
    label: "Seekers",
    tag: "Demand",
    title: "People who go and get it",
    body: "Anyone with the app. They walk, they find things, and they keep what they collect. No prior crypto knowledge is assumed: the wallet is created from a social login and can be exported later by anyone who wants custody.",
    gets: ["Tokens, NFTs and partner rewards", "Quests that adapt to where they are", "A wallet they did not have to understand first"],
  },
  {
    id: "publishers",
    label: "Publishers",
    tag: "Supply",
    title: "Whoever put it there",
    body: "Brands, venues, token projects and event organisers. They place assets at coordinates they care about and pay per placement, weighted by radius, duration and how contested the area is.",
    gets: ["Verified arrivals, not impressions", "Geographic distribution that resists farming", "A campaign builder with no integration work"],
  },
  {
    id: "protocol",
    label: "Protocol",
    tag: "Settlement",
    title: "The part that keeps them honest",
    body: "Verification scoring, asset custody and settlement. It takes a fee on placement, routes the majority of it back to seekers, and holds the record of what was claimed where.",
    gets: ["Fees that track real activity", "A public claim record", "Parameters that move to governance over time"],
  },
];

export const CAPABILITIES = [
  {
    title: "Geofenced placement",
    meta: "5 m to 500 m",
    body: "Assets are pinned to coordinates with a configurable claim radius. A shop doorway uses a tight radius; a festival ground uses a wide one.",
  },
  {
    title: "Multi-signal verification",
    meta: "4 independent signals",
    body: "Satellite fix, ambient radio, device attestation and motion continuity all have to agree before a claim is accepted.",
  },
  {
    title: "AR anchoring",
    meta: "Persistent",
    body: "Assets stay put between sessions and between users. Two people standing in the same place see the same thing in the same spot.",
  },
  {
    title: "AI companion",
    meta: "On-device first",
    body: "Reads the camera to explain what you are looking at and suggest where to go next, without shipping your movement history anywhere.",
  },
  {
    title: "Social wallet",
    meta: "No seed phrase",
    body: "Created from a social login so a first-time user can collect something within a minute, with self-custody export available whenever they want it.",
  },
  {
    title: "Solana settlement",
    meta: "Sub-second",
    body: "Cheap enough that picking up a small reward does not cost more than the reward is worth, which is the whole reason the chain choice matters.",
  },
];

export const FAQ = [
  {
    question: "Can I fake my location to collect without going there?",
    answer:
      "Not cheaply. A raw GPS fix is easy to spoof, which is why it is only one of four signals. The ambient radio environment, device attestation and your motion trace all have to corroborate it, and a device that fails repeatedly faces a higher threshold. The aim is to make forgery cost more than the reward is worth, not to claim it is impossible.",
  },
  {
    question: "Do I need to know anything about crypto to use SeekAR?",
    answer:
      "No. The wallet is created from a social login and you never see a seed phrase unless you go looking for one. If you later want self-custody, you can export the key at any point.",
  },
  {
    question: "Is Seek Protocol tracking where I go?",
    answer:
      "No. The app asks for a position when you attempt a claim, not continuously in the background. Raw sensor data is used to score that one claim and then discarded, and your movement history stays on your device.",
  },
  {
    question: "What stops one person farming a location with many wallets?",
    answer:
      "Per-device claim limits within a radius and time window, plus device attestation that emulator farms fail. Wallets are free but travel is not, which is the point of anchoring distribution to geography in the first place.",
  },
  {
    question: "Why Solana rather than another chain?",
    answer:
      "Transaction cost. Collecting a reward worth a few cents has to cost a small fraction of a cent to settle, or the economics do not work at all. Sub-second confirmation also matters when someone is standing on a street corner waiting.",
  },
  {
    question: "Can my business place assets today?",
    answer:
      "Through a managed partnership, yes. The self-serve portal that removes the conversation with us is in progress, and the roadmap says where it sits.",
  },
];
