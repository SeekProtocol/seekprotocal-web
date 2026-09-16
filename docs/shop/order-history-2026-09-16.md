# Order history, API pagination and checkout recovery

Implemented on 16 September 2026. The website changes are local; the backend addition is published to Supabase project `ukoqxyoogjouhdqhtiei`.

## Result

- Compact order cards show immutable product snapshots, app artwork, the amount, recipient, payment and delivery state. Expanded details contain one itemized receipt. Mixed-currency receipts explain the fixed checkout total.
- All new strings are translated in the nine website languages. Delivery wording covers packs, boosters and passes.
- History fetches ten rows plus one lookahead through the authenticated Supabase API. The cursor uses descending `created_at,id`; buyer/channel filters and RLS remain enforced. Previous/next controls remain visible even on the first or last page. No full-history download or client-side pagination.
- Open Radom checkouts resume the saved hosted session. The backend checks owner, web channel, provider, current payment state, expiry, account restrictions, paused sales and the hosted URL. It records `checkout_resumed` and never creates a second order/session. Failed audit writes prevent a redirect.
- Closed checkouts can refill the cart after a fresh payment check. Restoring uses current catalog revisions/prices, retains the original recipient when available, and requires the normal checkout confirmation again. Missing products or an unresolved recipient stop restoration rather than silently changing the order. Potentially broadcast Solana payments expose a status check, not a second transfer.

## Publication and checks

- `radom-checkout` version 11: ACTIVE, existing gateway JWT setting retained; user authentication remains mandatory inside the handler. An unauthenticated live resume request returns 401.
- Migration `20260916130000_web_order_history_pagination.sql` is applied. Its partial `(user_id,created_at DESC,id DESC)` index serves web-order cursor reads.
- Compared downloaded live handler dependencies before publishing; the changes are the resume handler and treating refunded provider sessions as closed. No unrelated backend migration or function was published.
- TypeScript and scoped ESLint passed. Targeted frontend and backend tests cover resume decisions, wrong-account/channel reads, late payment races, audit failure, redirect validation, immutable receipt prices and cart restoration.
- Disposable PostgreSQL test: 25 orders sharing one timestamp page 10/10/5 without duplicates; another buyer's orders remain hidden by RLS; the new index is used. Test server stopped afterward.
- Browser preview verified desktop details, a 390px mobile layout, page navigation and action feedback. The preview uses fictional data and is disabled outside development. No real customer payment was made as a test.

Preview: `http://localhost:3005/nl/orders-check`. Evidence: `/private/tmp/seek-order-history-release/`.

The public website has not been deployed: the earlier automatic approval rejection for the Vercel destination remains unresolved. Preserve the concurrent sign-in work when preparing that deployment.

Provider reference: [Radom hosted checkout](https://docs.radom.com/guides/hosted-checkout/) documents the saved session URL and server-side reconciliation.
