/**
 * What a publisher can actually place at a coordinate.
 *
 * The collectibles section next to this one is about coins, which is the part
 * people already understand. This is the rest of it: the drop does not have to
 * be a token, and for a high street the interesting version usually is not.
 *
 * Kept deliberately free of real merchant names. A card reading like a named
 * brand's live offer would be a claim about a partnership rather than an
 * illustration of a format.
 */

export type OfferKind = "voucher" | "asset" | "access" | "token" | "collectible";

export type Offer = {
  id: OfferKind;
  /** The mono label on the card and the chooser. */
  label: string;
  /** What the seeker is holding. */
  headline: string;
  /** The large figure or name printed on the artefact. */
  face: string;
  /** The small print under it. */
  fine: string;
  /** How it turns into the thing it promises. */
  redeem: string;
  /** What stops it being redeemed by someone who was never there. */
  proof: string;
  /** Who tends to place this one. */
  placedBy: string;
  accent: string;
};

export const OFFERS: Offer[] = [
  {
    id: "voucher",
    label: "Discount voucher",
    headline: "Money off, at the door that gave it to you",
    face: "25% off",
    fine: "One per person · Valid 14 days · In store only",
    redeem:
      "The code is shown at the counter and marked used. It cannot be forwarded, because it was issued to the device that stood inside the radius.",
    proof:
      "The claim is on-chain with the coordinate it was taken at, so a redemption can be checked against a real arrival rather than a screenshot.",
    placedBy: "Retail and hospitality",
    accent: "#049efd",
  },
  {
    id: "asset",
    label: "Real world asset",
    headline: "A physical thing, waiting at a place",
    face: "Pair of trainers",
    fine: "1 of 250 · Collect in store · Expires when stock does",
    redeem:
      "The holder collects the item itself. The token is the claim on it, and it burns at handover so the same pair cannot be collected twice.",
    proof:
      "Stock is finite and the claim is a lock, not a lookup, so two people reaching for the last one cannot both be told they got it.",
    placedBy: "Brands with something to give away",
    accent: "#d04cfb",
  },
  {
    id: "access",
    label: "Access pass",
    headline: "The ticket is being at the venue",
    face: "Gate B · 19:00",
    fine: "Non-transferable · Expires at the end of the event",
    redeem:
      "Scanned at the gate like any other pass. The difference is that it could only be obtained on site, which is what makes it worth issuing.",
    proof:
      "High-value drops set a strict confidence threshold, so the radio environment has to agree with the position before it is released.",
    placedBy: "Events, venues and festivals",
    accent: "#02eaa9",
  },
  {
    id: "token",
    label: "Token drop",
    headline: "Distribution that costs something to farm",
    face: "40 $SEEK",
    fine: "One claim per device · Settles on Solana",
    redeem:
      "It arrives in the wallet the app made for you, and it is yours to hold, move or sell. Nothing to redeem and nobody to ask.",
    proof:
      "A wallet is free to create and a walk is not. Geography is the filter that an airdrop cannot cheaply be farmed through.",
    placedBy: "Token projects and communities",
    accent: "#a855f7",
  },
  {
    id: "collectible",
    label: "Collectible",
    headline: "Something that only exists where it was placed",
    face: "Rare",
    fine: "Series of 500 · Tradeable · Rarity fixed at issue",
    redeem:
      "Nothing to redeem. It is a record of having been somewhere, which is the oldest reason anybody has ever kept anything.",
    proof:
      "Each one carries the coordinate it was taken at, so the set someone holds is a map of where they have actually been.",
    placedBy: "Cities, tourism boards, artists",
    accent: "#ffd740",
  },
];
