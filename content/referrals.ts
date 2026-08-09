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
 * The figure on the pill that rises off a friend when they catch something.
 *
 * A common coin, roughly, rather than the legendary the worked example uses:
 * the pill is meant to read as an ordinary catch happening over and over, and
 * a legendary going off six times a minute would say the wrong thing about how
 * often those turn up. It is illustrative and carries no arithmetic — the sum
 * the section actually makes a claim about is the one under it.
 */
export const PAYOUT_XP = 80;

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
