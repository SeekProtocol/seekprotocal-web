/**
 * The distribution section: what web3 distribution buys today, and what a
 * claim standing at a coordinate buys instead.
 *
 * Structure only. Every word is in `messages/<locale>.json` under
 * `distribution`, keyed by the ids below.
 */

/**
 * What a publisher can ask for in return.
 *
 * The point of the list is that the protocol does not fix it. The claim is the
 * thing being verified; what the seeker has to do to earn it is the publisher's
 * to write, which is why these are five different verbs rather than five
 * variations on "collect".
 *
 * `recorded` in the copy is the second half of each one, and the more important
 * half: it says what the publisher actually receives, which in every case is a
 * count and never a person.
 */
export const CALL_TO_ACTIONS = [
  { id: "visit" },
  { id: "follow" },
  { id: "signup" },
  { id: "scan" },
  { id: "mint" },
];

/**
 * The three ways paid reach fails a token launch. Each one is answered by the
 * matching entry in `distribution.answers`, which is why the ids are shared:
 * the figure draws them as a pair and they must stay in step.
 */
export const REACH_FAILURES = [{ id: "bots" }, { id: "farms" }, { id: "unaudited" }];
