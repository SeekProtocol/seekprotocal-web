import { DROP_COINS } from "@/lib/globe-drops";
/**
 * The referral mechanic, read out of the app rather than invented.
 *
 * Every number here comes from `seekar-app`, and from the *latest* migration
 * touching the subject, which is the lesson the second handover pass paid for
 * with the catch ladder. Four migrations land on this in one afternoon and the
 * last two change the rules:
 *
 *   20260721161739_add_referral_bonus            the model, +5% per active
 *   20260721162818_add_referral_team_rpc         the team list
 *   20260721165230_referral_only_new_users       new accounts only
 *   20260721173023_referral_active_requires_gameplay  what "active" means
 *
 * **"Active" is not "opened the app".** The first migration defined it as a
 * `user_presence.last_seen_at` inside seven days. The fourth replaced that with
 * five non-simulator collection attempts in the same window, because presence
 * is trivial to fake and a couple of real sessions is a meaningful bar. The
 * comment above `REFERRAL_BONUS_PER_ACTIVE` in `collect-coin/index.ts` still
 * describes the old rule and is stale; the RPC is what runs. If this section
 * ever says "seen in the last seven days", it has been written from that
 * comment and it is wrong.
 *
 * Where each figure lives, so it can be checked rather than trusted:
 *
 *   +5% per active friend   REFERRAL_BONUS_PER_ACTIVE, collect-coin/index.ts:82
 *   no cap                  `0.05 * count(*)`, no LEAST() anywhere
 *   5 catches / 7 days      get_active_referral_count, migration ...173023
 *   8-character code        generate_share_code(), baseline migration
 *   set once, immutable     enforce_referral_rules() trigger
 *   new accounts only       set_referrer() rejects xp > 0 or collected > 0
 *   one level deep          referred_by is a single column, never walked up
 *
 * Only structure lives here. Every word is in `messages/<locale>.json` under
 * `referrals`, keyed by id.
 */

/** What the inviter earns for each friend who is actually playing. */
export const BONUS_PER_ACTIVE = 0.05;

/** Catches inside the window that make a referred friend count as active. */
export const ACTIVE_CATCHES = 5;
export const ACTIVE_WINDOW_DAYS = 7;

/** Length of a seeker's own invite code. */
export const CODE_LENGTH = 8;

/**
 * The alphabet a share code is drawn from, straight out of
 * `generate_share_code()`. I and O are absent, which is not an oversight: they
 * are the two letters a reader reliably mistakes for 1 and 0 when copying a
 * code off someone else's screen.
 */
export const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";

/**
 * The team the figure assembles, as it would look for a seeker a few weeks in.
 * Six friends, four of them playing. `caught` is that friend's real catches
 * inside the window, so the two dormant ones sit visibly short of the bar
 * rather than being marked inactive by assertion.
 */
export type TeamMember = {
  id: string;
  /** A handle, in the app's own style. Not a real account. */
  handle: string;
  /** Catches in the last seven days. At or above ACTIVE_CATCHES is active. */
  caught: number;
  level: number;
};

export const TEAM: TeamMember[] = [
  { id: "nova", handle: "nova", caught: 14, level: 7 },
  { id: "kite", handle: "kite_", caught: 9, level: 5 },
  { id: "atlas", handle: "atlas42", caught: 2, level: 3 },
  { id: "wren", handle: "wren.", caught: 6, level: 6 },
  { id: "orbit", handle: "orbit77", caught: 0, level: 2 },
  { id: "flint", handle: "flinthq", caught: 11, level: 8 },
];

/** The worked example under the figure: one catch, before and after. */
export const EXAMPLE_BASE_XP = 220;

/**
 * What a friend is seen catching, in the order the figure cycles through them.
 *
 * The coins are the app's own, and so are their XP values: a legendary pays 900
 * and a common 80, from `content/collectibles.ts`, which in turn comes from the
 * app's `game_value_per_coin`. So the pill that rises off a friend is not a
 * decoration with a number on it — it is a real coin worth a real amount, and
 * the variety in the loop is the variety that is actually out there.
 *
 * SEEK is included because SEEK spawns too; it is the one drop that is not a
 * collectible. DROP_COINS is the same list the globe fires, so the two sections
 * cannot end up showing different worlds.
 *
 * Ordered rather than random. The loop has to look the same on every machine
 * and on the server, and a figure that reshuffles itself between a reader's two
 * visits is a figure that cannot be pointed at.
 */
export const CATCH_CYCLE = DROP_COINS;

/**
 * The four rules that decide who may join a team and what it is worth. Each is
 * enforced in the database rather than in the app, which is the point worth
 * making: none of them is a policy the client could be talked out of.
 */
export const RULES = [
  { id: "once" },
  { id: "newOnly" },
  { id: "oneLevel" },
  { id: "friendKeeps" },
] as const;

/**
 * The rungs the modal's ladder walks, in active friends.
 *
 * It runs past any number a reader is likely to reach on purpose, because the
 * point being made is that nothing stops it: `get_active_referral_count` is a
 * plain `0.05 * count(*)` with no LEAST() anywhere, so twenty active friends is
 * a straight doubling. Showing five and stopping would have illustrated the
 * arithmetic and hidden the claim.
 */
export const LADDER = [0, 1, 3, 5, 10, 20];

/**
 * The lifecycle a referral goes through, as the modal steps it.
 *
 * Each id is a stage the database can actually be in, not a marketing beat:
 *
 *   share    the inviter has a share_code, generated at signup
 *   redeem   set_referrer() writes referred_by, once, on a new account only
 *   play     the friend makes non-simulator collection attempts
 *   count    five of them inside seven days, and the friend starts paying
 *
 * The fourth is the one worth drawing, because it is the one people assume
 * happens at the second.
 */
export const LIFECYCLE = [
  { id: "share" },
  { id: "redeem" },
  { id: "play" },
  { id: "count" },
] as const;
