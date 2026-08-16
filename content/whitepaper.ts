/**
 * Whitepaper structure.
 *
 * ⚠️  PLACEHOLDER FIGURES: everything under `TOKENOMICS`, `TOKEN_FACTS`,
 * `VESTING` and the supply numbers is illustrative structure, not Seek
 * Protocol's actual tokenomics. Replace with the real allocation, vesting and
 * supply before publishing, then set `DRAFT_FIGURES` to false to hide the
 * notice rendered on the page.
 *
 * The prose itself lives in `messages/<locale>.json` under `whitepaper`,
 * keyed by chapter id, so all eight locales carry the same document. Where a
 * chapter quotes a number about the game, the app's own migrations and edge
 * functions are the authority, not this file.
 *
 * House rule, carried over from the app: no em dashes in user-facing copy.
 */
export const DRAFT_FIGURES = true;

export type Block =
  | { kind: "p"; text: string }
  | { kind: "h"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "callout"; text: string }
  | { kind: "specs"; rows: { label: string; value: string }[] }
  | { kind: "tokenomics" }
  | { kind: "stack" }
  | { kind: "confidence" }
  | { kind: "economy" }
  | { kind: "calculator" }
  | { kind: "timeline" }
  | { kind: "catch" }
  | { kind: "vesting" }
  | { kind: "glossary" };

export type Chapter = {
  id: string;
  index: string;
  eyebrow: string;
  title: string;
  blocks: Block[];
};

export const WHITEPAPER_META = {
  version: "v1.6",
  updated: "2026-08",
  /* About 5,700 words of prose, plus nine figures that are worth playing with.
     Recount if chapters are added: `words / 220` is the prose figure.

     v1.6 added chapter 03, on distribution, and rewrote the settlement section
     of chapter 06: the document argued for one chain where the protocol has
     never required one. */
  readingMinutes: 31,
};

/** Chapter order. The chapters themselves are in the message files. */
export const CHAPTER_IDS = [
  "summary",
  "problem",
  "distribution",
  "proof-of-location",
  "lifecycle",
  "architecture",
  "seekar",
  "play",
  "creators",
  "token",
  "revenue",
  "governance",
  "security",
  "privacy",
  "compliance",
  "roadmap",
  "glossary",
];

/** ⚠️ PLACEHOLDER: replace with the real distribution before publishing. */
export const TOKENOMICS = [
  { id: "community", value: 34, color: "#5d74f9" },
  { id: "ecosystem", value: 20, color: "#e341f9" },
  { id: "team", value: 16, color: "#8f5cf7" },
  { id: "treasury", value: 14, color: "#4fd1e0" },
  { id: "liquidity", value: 10, color: "#7fe7d4" },
  { id: "backers", value: 6, color: "#a8b0c8" },
];

/** ⚠️ PLACEHOLDER: replace with the real token facts. */
export const TOKEN_FACTS = [
  { id: "ticker" },
  { id: "chain" },
  { id: "supply" },
  { id: "emission" },
];

/**
 * ⚠️ PLACEHOLDER: replace with the real schedule before publishing.
 *
 * `unlockAtTge` is the share of that allocation liquid at launch, `cliff` the
 * months before anything further moves, and `vest` the months it takes to
 * release the rest linearly after the cliff.
 */
export const VESTING = [
  { id: "community", share: 34, color: "#5d74f9", unlockAtTge: 0.08, cliff: 0, vest: 48 },
  { id: "ecosystem", share: 20, color: "#e341f9", unlockAtTge: 0.1, cliff: 3, vest: 36 },
  { id: "team", share: 16, color: "#8f5cf7", unlockAtTge: 0, cliff: 12, vest: 48 },
  { id: "treasury", share: 14, color: "#4fd1e0", unlockAtTge: 0.05, cliff: 6, vest: 36 },
  { id: "liquidity", share: 10, color: "#7fe7d4", unlockAtTge: 1, cliff: 0, vest: 0 },
  { id: "backers", share: 6, color: "#a8b0c8", unlockAtTge: 0, cliff: 6, vest: 24 },
];

/** Glossary entry order. Terms and definitions are in `glossary`. */
export const GLOSSARY_IDS = [
  "proof-of-location",
  "confidence-score",
  "claim-radius",
  "drop",
  "spawn",
  "attestation",
  "radio-fingerprint",
  "motion-continuity",
  "verified-arrival",
  "placement-fee",
  "cold-streak",
  "streak-penalty",
  "seeker",
  "seek",
];
