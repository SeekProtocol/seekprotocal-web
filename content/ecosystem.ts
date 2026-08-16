/**
 * The ecosystem page, in structure only. Every word lives in
 * `messages/<locale>.json` under `participants`, `capabilities` and
 * `ecosystemFaq`, keyed by the ids below.
 */

export const PARTICIPANTS = [
  { id: "seekers" },
  { id: "publishers" },
  { id: "protocol" },
];

export const CAPABILITIES = [
  { id: "placement" },
  { id: "verification" },
  { id: "anchoring" },
  { id: "companion" },
  { id: "wallet" },
  { id: "settlement" },
];

export const FAQ_IDS = [
  "spoofing",
  "crypto",
  "tracking",
  "farming",
  "chain",
  /* "Does a reward have to be crypto?" Sits next to the chain question because
     a reader who is asking one is about to ask the other, and a business
     landing on this page needs the answer to be no. */
  "rewardKind",
  "business",
];
