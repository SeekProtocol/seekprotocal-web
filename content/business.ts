/**
 * The business page, in structure only. The copy lives in
 * `messages/<locale>.json` under `useCases` and `measurement`.
 */

export const USE_CASES = [
  { id: "retail" },
  { id: "events" },
  { id: "token" },
  { id: "tourism" },
];

/* The four setup steps used to live here as prose. They are now the four steps
   of the interactive console in `components/business/DeployConsole.tsx`, which
   says the same thing by letting someone do it. */

/**
 * What an arrival is, stated against the three things it is not.
 *
 * The funnel figure above these cards argues the money. This argues the unit:
 * every campaign metric on the market is a proxy that a script can produce,
 * and presence is the one that cannot be produced without a person. The third
 * card is the one publishers ask about first, which is why it is on the page
 * at all: verifying presence does not mean inheriting our idea of what the
 * reward should be for.
 */
export const INTERACTION_CLAIMS = [
  { id: "nobots" },
  { id: "organic" },
  { id: "cta" },
];

export const MEASUREMENT = [
  { id: "counted" },
  { id: "when" },
  { id: "receive" },
  { id: "never" },
];
