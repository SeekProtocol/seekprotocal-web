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
 *
 * Only the accent colour and the ordering live here. Every word on a card is
 * in `messages/<locale>.json` under `offers`, keyed by id.
 */

export type OfferKind = "voucher" | "asset" | "access" | "token" | "collectible";

export type Offer = {
  id: OfferKind;
  accent: string;
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
};

/** The copy fields `offers` supplies for each id. */
export const OFFER_COPY = [
  "label",
  "headline",
  "face",
  "fine",
  "redeem",
  "proof",
  "placedBy",
] as const;

export const OFFER_SHAPES = [
  { id: "voucher", accent: "#049efd" },
  { id: "asset", accent: "#d04cfb" },
  { id: "access", accent: "#02eaa9" },
  { id: "token", accent: "#a855f7" },
  { id: "collectible", accent: "#ffd740" },
] as const;
