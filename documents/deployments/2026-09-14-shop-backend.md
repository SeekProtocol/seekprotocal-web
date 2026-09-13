# Webshop backend deployment — 14 September 2026

Project: `ukoqxyoogjouhdqhtiei` (SeekAR).
Backend source: `/Users/michaeldevries/Projects/seekar-app`, commit `64fe1b725ef05a1c94231c49d36b20df7ba8d510`.

## Applied and verified live

- `RADOM_API_KEY` and `TURNSTILE_SECRET_KEY` copied from the user-specified local env files. Remote SHA-256 digests match the source values. No values are recorded here.
- `RADOM_WEBHOOK_KEY` matches the exact Radom-generated key by SHA-256 digest. Direct signed connectivity and Radom delivery both succeeded with HTTP 200.
- Migration history repaired: `20260912185059` reverted; `20260912210000` applied. The historical payout SQL was not re-executed.
- Applied `20260913100000_arena_web_shop_channel.sql` and `20260913110000_radom_orders.sql`.
- Verified order channel and all three Radom columns, realtime publication for `arena_pack_credits` and `solana_orders`, and service-role-only permission for `radom_settle_order`.
- Deployed `radom-checkout` version 1, `solana-checkout` version 15, and `solana-order-reconcile` version 11; all report ACTIVE. Gateway JWT checks remain disabled as configured; each handler enforces its own caller authentication.
- All three function routes and the webhook return HTTP 401 for an unauthenticated empty POST.
- Authentication Magic Link content exactly matches `seekar-app/supabase/templates/magic-link.html`, with subject `Your SeekAR sign-in code`.
- Added `https://www.seekprotocol.ai/**` to the authentication redirect allowlist. Existing redirects, site URL, and other settings were preserved. The live OTP length is 8.
- Existing Radom, web-shop proof, and Solana commerce unit tests: 17 passed, 0 failed.

## Radom webhook — verified live

Organization: Seek Protocol. Active webhook ID: `59e5d7e1-78a5-4e31-ad4c-6e995f54d957`.
Endpoint: `https://ukoqxyoogjouhdqhtiei.supabase.co/functions/v1/radom-checkout/webhook`.
Registered through Radom's official API. Its documented creation form registers organization events, including `managedPayment`, without a separate event subscription filter.

- The exact Radom-generated verification key was stored directly in Supabase; the remote digest matches.
- A direct request carrying the correct verification key returned HTTP 200 and `{ "ok": true, "ignored": "no_session" }` for a harmless test payload.
- Radom's official delivery test returned `{ "success": true, "statusCode": 200, "error": null }`.
- The initial registration `a4349157-40cf-4cc1-951b-1b5faaba6079`, whose test returned 401, was replaced after explicit user confirmation and is paused. Only the replacement should receive active deliveries.
- The temporary local copy of the webhook key was removed after successful verification.

## Separate pending Arena migration

`20260913080000_arena_engine_revision_and_balance.sql` remains unapplied. It changes card balancing, adds engine revision checks, and requires coordinated Arena function deployment. It is unrelated to the requested three shop functions.

The normal full-repository push detected this older pending migration and refused without `--include-all`. The two shop migrations were instead pushed from an unchanged copy of the migration history with only the unrelated Arena file omitted. No false applied marker was added for the Arena migration.

## Limits

No real purchase, customer payment, or email was sent. No public website deployment was performed in this task. The later localhost support changes are described below.


## Localhost checkout support — published after explicit approval

- Published `solana-checkout` version 18 and `radom-checkout` version 4; both verified ACTIVE.
- `WEB_SHOP_DEV_SECRET` is stored only on the local Next.js server and in Supabase. The remote SHA-256 digest matches the local value. The temporary env export was removed and the secret was verified absent from browser assets.
- On localhost in development, the browser uses `/api/shop/dev-checkout`; Turnstile is skipped. The local server signs the exact target function, request body, user authorization, origin and timestamp. The proof expires after 30 seconds.
- The relay exists only in development, checks its local origin and Host, and the development server now listens only on `127.0.0.1:3005`. Production builds return 404 for this route.
- Production website requests still require Turnstile. Both checkout handlers still verify the user session before accepting the local proof. A localhost Origin alone is refused.
- Existing production-proof and new local-proof tests: 10 passed. Verification queue tests: 3 passed. Production-route, external-origin, missing-login and invalid-login HTTP checks returned the expected 404/401 responses.
- The frontend serializes verified quote/purchase requests, resets each single-use token, reports challenge failures, and displays the redirect state only after a checkout URL is available. Client and server calls have finite timeouts.
- Frontend production build, TypeScript and scoped ESLint checks passed. Frontend changes remain local and uncommitted; the two backend functions above are deployed.

The local relay uses the real Supabase project and Radom payment environment. Successful purchases are real purchases. No purchase was made during these checks.

Approval history: the automatic permission reviewer first rejected the shared secret and then the function publication as separate external changes. The user explicitly approved the secret and subsequently answered yes to publication of both named functions. Both operations then succeeded.
