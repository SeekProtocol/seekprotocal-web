# Shop login with existing app accounts

Updated 2026-09-22. The shop uses the same Supabase project and user IDs as the app: `ukoqxyoogjouhdqhtiei`. It has no registration flow and does not link identities based only on a matching email address.

## Implemented

- Email login uses only a one-time code with `shouldCreateUser: false`. There is no password field or password login in the shop.
- On desktop, the social buttons sit in a two-column grid on the left, with the email-code form on the right. On smaller screens, the sections stack while provider buttons stay two per row.
- Solana wallet login uses the app's existing `login_challenge` and `login` actions. The shop never invokes wallet signup or account linking.
- Social login supports Google, Apple, Discord, LINE and TikTok through the `shop-auth` Edge Function. Kakao is disabled in the app and is not offered. TikTok has no configured project credentials and is not shown until enabled.
- The browser verifies app eligibility through `shop_account_access` before rendering private shop/order content. Missing service/data fails closed.
- Supabase also enforces eligibility for checkout context and inserts of new web orders, including the receiving account. Existing order updates/payment reconciliation are preserved.
- Eligibility follows the app's onboarding rule: an active user with a profile and completed birthdate setup, or a legacy profile created before 2026-08-12. Anonymous, deleted, banned, suspended, `is_test_account` and `arena_testers` accounts are refused. No onboarding/registration forms are exposed by the shop.
- Completed login lands on the localized `/shop`, preserving only a valid order reference. `/shop/orders` remains a separate page.

## Publication status

Published and read-back verified on 2026-09-15:

- `20260916000000_shop_existing_app_accounts.sql`
- `shop-auth` Edge Function, gateway JWT verification disabled because login starts before a session exists. The function verifies OAuth state, provider identity, browser proof, origin, expiration and one-time use.
- Google/Apple/Discord client IDs were copied to `SHOP_AUTH_<PROVIDER>_CLIENT_ID`. **Correction, 2026-09-22:** the earlier secret copy was invalid: the Management API returned masked SHA-256 values, which were mistakenly stored as `_CLIENT_SECRET`. Live comparison confirmed that each stored shop secret's digest equals the hash of the masked Auth config value. The original provider client secrets must be supplied directly; never copy the returned Auth config secret values or Edge Function secret digests as credentials. No secret values are exposed in browser code or this document.
- Local origins `http://localhost:3005` and `http://127.0.0.1:3005` allowed for this function. This does not bypass identity or account checks.

On 2026-09-22 the user confirmed that the additional callback registrations were saved. After the secrets-list digest view was mistaken for stored credentials, **Google, Apple, Discord and LINE** were enabled from the already-stored shop secrets (`SHOP_AUTH_READY_PROVIDERS=line,discord,google,apple`). Apple uses Services ID `app.seekprotocol.ai`. This did not publish website code or alter the native app's Auth configuration.

| Provider | Latest verification / remaining work |
| --- | --- |
| LINE | The registered callback reaches LINE Login. Live shop start, cancellation callback to `/nl/shop`, denied cancellation exchange and replay rejection passed. Full existing-account login remains untested. |
| Google | Enabled on 2026-09-22. Live login reached provider exchange and was denied (`sign_in_failed`) before identity match. shop-auth now matches Auth and does not require a Google nonce claim. Retry will record a precise deny cause. |
| Discord | Enabled on 2026-09-22 (`SHOP_AUTH_READY_PROVIDERS=line,discord`). `/start` returns Discord with a numeric application client id and the shop-auth callback. The secrets list digest view is not a credential. Full existing-account login remains untested. |
| Apple | Enabled with Services ID `app.seekprotocol.ai`. Live login also denied at provider exchange. Native Auth still uses bundle id `com.seekprotocol.seek`. The shop client-secret JWT must be minted for the Services ID. |
| TikTok | No configured credentials; remains disabled. |

The user was asked to enter the original Google and Discord secrets directly in Supabase Edge Function Secrets. Do not paste credentials into chat. On 2026-09-22 the user supplied the Sign in with Apple Services ID `app.seekprotocol.ai` (name: Seekprotocol OAuth). That value is now in `SHOP_AUTH_APPLE_CLIENT_ID`. The matching client-secret JWT still has to be placed in `SHOP_AUTH_APPLE_CLIENT_SECRET`; do not copy Auth-config or digest values.

## Required provider settings

Add these addresses alongside the existing native/Supabase callbacks. Do not replace existing callbacks.

| Provider | Where | Additional callback |
| --- | --- | --- |
| Google | Google Cloud → APIs & Services → Credentials → the current Web OAuth client → Authorized redirect URIs | `https://ukoqxyoogjouhdqhtiei.supabase.co/functions/v1/shop-auth/callback/google` |
| Apple | Apple Developer → Identifiers → the Sign in with Apple Services ID → Configure → Return URLs | `https://ukoqxyoogjouhdqhtiei.supabase.co/functions/v1/shop-auth/callback/apple` |
| Discord | Discord Developer Portal → the existing application → OAuth2 → Redirects | `https://ukoqxyoogjouhdqhtiei.supabase.co/functions/v1/shop-auth/callback/discord` |
| LINE | LINE Developers → the existing JP LINE Login channel → Callback URL | `https://ukoqxyoogjouhdqhtiei.supabase.co/functions/v1/shop-auth/callback/line` |
| TikTok, only when enabled in the app | TikTok for Developers → Login Kit → Web redirect URI | `https://ukoqxyoogjouhdqhtiei.supabase.co/functions/v1/shop-auth/callback/tiktok` |

The initial 2026-09-15 probe returned Google's `redirect_uri_mismatch` and Apple's `invalid_request`; see the latest verification above for changes. Supabase's own redirect allowlist does not configure the Google/Apple/Discord developer registrations.

For Apple, the web client is Services ID `app.seekprotocol.ai` (Seekprotocol OAuth). It must stay associated/grouped with the native app `com.seekprotocol.seek`, and the client-secret JWT must use that Services ID as subject. This preserves the provider subject used by existing app accounts.

LINE uses the existing `LINE_CHANNEL_ID_JP` / `LINE_CHANNEL_SECRET_JP` unless explicit `SHOP_AUTH_LINE_CLIENT_ID` / `_CLIENT_SECRET` overrides are set. The app documents that its regional LINE channels share a provider and therefore the same user subject. Verify that relationship before enabling another channel. TikTok similarly falls back to the app's `TIKTOK_CLIENT_KEY` / `TIKTOK_CLIENT_SECRET`.

After registering and testing a provider, add only that provider name to `SHOP_AUTH_READY_PROVIDERS` (comma-separated). `/providers` exposes only configured, explicitly enabled providers. Keep a provider disabled when its settings are incomplete.

## Security and audit details

- Provider tokens are exchanged and validated on the server. Google/Apple verify signature, audience, issuer, expiration and nonce; LINE uses its verification endpoint; Discord/TikTok verify the server-issued access token with the provider's user endpoint.
- Identity lookup uses the existing `auth.identities` provider and subject. TikTok uses the same verified-open-id synthetic email mapping as the native function. Unknown identities return `app_account_required`; no signup fallback exists.
- A callback transports its code in the URL fragment only and does not persist an authenticated identity. The original browser tab must provide both that code and its private verifier. This prevents someone who initiated a different browser's authorization URL from redeeming the resulting identity.
- Requests expire in ten minutes, are consumed atomically, and are paced per salted IP hash. Expired temporary requests older than a day are pruned on the next login start; no provider tokens or Supabase sessions are stored in that table.
- Session minting uses `admin.generateLink({type: 'recovery'})` against the matched existing user, then the one-time token is verified in the browser. Unlike the `magiclink` variant, this Supabase API rejects a missing user instead of creating one. It sends no email and changes no password. It uses the same underlying recovery token as magic-link login and can supersede an older outstanding recovery link.
- Login starts, identity decisions, exchanges, failures and token issuance are recorded in the existing append-only `shop_audit_events`. Codes, tokens, emails, secrets and raw IP addresses are excluded from login audit evidence.

Backend source of truth: `../seekar-app/supabase/functions/shop-auth`, migration in `../seekar-app/supabase/migrations`, SQL tests in `../seekar-app/tests/shop-auth`.

## Validation

- TypeScript and targeted ESLint passed.
- Existing 30 web tests passed.
- Ten Deno provider/HTTP tests passed, including wrong browser proof, unknown identity, forged nonce/audience/signature, replay handling, external redirects, and no signup/mail/password mutation.
- Isolated PostgreSQL tests passed for active/legacy/missing/incomplete/anonymous/deleted/banned accounts, recipient checks, direct orders, permissions, provider separation, replay, expiration, rate limiting and audit recording.
- Live read-back verified the applied migration, enabled order guard and denied client access to privileged functions/flow data.
- Live HTTP probes: configured local origin accepted, foreign origin refused, unconfigured provider refused, malformed exchange refused.
- 2026-09-22: live `/providers` returned only `line` for the production origin and both port-3005 loopback origins; an untrusted origin returned 403. LINE `/start` returned 200 with the expected JP channel and callback, and reached LINE Login. A simulated cancellation returned to `/nl/shop`; exchange returned `sign_in_failed` and replay returned `login_expired`. This created one temporary login request and its audit events, with no identity exchange, account, message or purchase.
- Real Google/Apple/Discord/LINE logins and wallet signing still need end-to-end validation with an existing app account after callback setup. No customer accounts, messages or purchases were created as tests.
