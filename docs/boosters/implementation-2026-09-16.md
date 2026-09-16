# Boosters — local implementation, 16 September 2026

Status: implemented locally; not published. The shared working tree contains changes from several sessions. This change adds four working booster types to the existing six. The shared catalog now contains 15 products in the isolated integration fixture: 10 boosters, three pack products, the Pass and the existing bundle.

## Implemented rules and local prices

These four designs existed as Unity/GLB assets, without gameplay definitions or catalog prices. The following values are an explicit implementation proposal, not recovered original game rules.

| Product | Effect | Active duration | Local price |
| --- | --- | --- | --- |
| Cash | 2× XP on successful coin catches; failed-attempt XP stays unchanged | 15 minutes | €0.79 |
| Fitness | 60 m coin catch radius, with the existing 15 m GPS grace; powerup/card pickups retain their existing range | 15 minutes | €1.49 |
| Chill Guy | Removes the chance penalty from consecutive successful catches; tap quality, rarity and retry decay still matter | 15 minutes | €1.99 |
| This Is Fine | Converts the first failed coin roll into a success; consumes the shield only when it rescues a catch | Up to 15 minutes | €2.99 |

Price review: the four prices are €0.79 / €1.49 / €1.99 / €2.99. The pricing note documents fee assumptions and the outstanding profitability limits; these prices do not guarantee a margin.

One booster runs at a time. Unused stock remains available. Existing product prices, Pass and bundle grants are retained. Diamond Hands now consumes its active use on the next catch, as its existing description promised.

## Implementation

- `seekar-app/supabase` remains the source for the shared catalog and gameplay rules. Both shop channels use the same IDs, revisions, prices and fulfillment definitions.
- `20260916100000_complete_booster_catalog.sql` adds the four types/products and extends the strict fulfillment validator.
- `20260916101000_booster_activation_and_evidence.sql` adds an atomic activation RPC, shared by ordinary boosts and Spawn Lure. Lure placement and stock reservation commit together; the clan requirement and 200 m lure radius remain.
- Collection uses server-owned active stock for XP, chance, range and protection. One-use effects are consumed inside the transaction that writes the catch, inventory and XP. Concurrent catches cannot spend one shield twice.
- `powerup_usage_events` records activation and consumption, activation identity, stock before/after and collection references. `collection_attempts.powerup_evidence` records modifiers and whether protection was used. Payment/catalog/recipient evidence continues through the existing shop audit path.
- Players can read their own usage history; dashboard admins can investigate. Clients cannot invoke the privileged activation RPC directly. Existing account, attestation, location and banned-account gates remain.
- The app updates catch-range gates, the map circle, revealed coin identities, chance previews and result details. Expiry is reflected locally without waiting for the next inventory poll.
- The website shows the four new illustrations, descriptions and cart items. `/{locale}/cart-check` is a development preview; it does not create orders or payments. The real storefront receives the products only after the shared catalog migration is published.

## 3D and 2D presentation

All ten designs have an explicit verified source animation instead of relying on the first clip in a GLB that contains several unrelated rigs. Cash price labels, HODL words, the Shiba price board and the stray Whale sphere are hidden.

A shared Three.js presentation adds restrained rings and distinct coin, crystal, cash, motion and flame accents. Materials are cloned before retouching so sibling spawns do not change. Effects release their geometry/materials when despawned. Reduced motion keeps a still pose; crowded maps limit additional animation work. AR converts the map orientation before fitting, so both use the same pose.

This is a refinement of the original geometry, not a new mesh set. In particular, This Is Fine remains the source's dimensional comic diorama. The browser preview uses studio lighting to inspect the assets; it is not proof of final physical-device lighting or frame rate.

The existing 768 px illustrated WebP assets are used in the app shop, website, inventory/pickup UI and now the 2D map. Card pack artwork is unchanged.

## Verification

- 223 targeted Jest checks passed: booster effects, model resolution, presentation resource ownership, map runtime/messages, reveal logic, AR fit/pickup, strict clip selection, actual AR resource cleanup and catch results.
- 31 Deno checks passed for activation, reveal and cloaking, including Fitness distance behavior.
- Isolated PostgreSQL integration checks passed: existing 11-product contracts; all 15 app/web products match; duplicate settlement delivers each new product once; eight concurrent activations reserve exactly one unit; Lure and ordinary activation share the lock; private usage rows and privileged RPC access are enforced; radius, expiry, receipt replay and concurrent single-use shield consumption are checked.
- Web TypeScript and focused web/native lint passed. Changed edge handlers passed Deno type checks.
- The repository-wide native TypeScript command still reports Deno globals/remote import errors from server/test files included in the app's TypeScript graph. It is not an all-green native build claim.
- Browser inspection: new products and effect descriptions render in the local cart preview; the ten original GLBs render with the selected poses and presentation effects.

## Publication dependencies

Review the proposed four effects/prices before live publication. The native app, XR runtime, edge handlers and database changes need a coordinated release; publishing catalog products alone would expose benefits the deployed handlers do not yet apply.

Required backend changes: the two gameplay/catalog migrations plus `20260916102000_booster_prices.sql` and `20260916104000_booster_single_use_replay_guard.sql` and `activate-powerup`, `activate-lure`, `collect-coin`, `get-spawns`, `reveal-spawns`. Existing checkout handlers already consume the dynamic catalog and grants. The new activation RPC must exist before its callers are published. The collection migration tolerates existing requests without the new evidence field.

Keep the four new products disabled during a staged backend/app rollout, then enable both catalog channels once the released app and handlers are verified. App purchase availability continues to follow the existing distribution rules (SOL commerce in the dApp Store build); no new Apple/Google billing path was introduced.

A physical-device map/AR test, deployed XR runtime check and authenticated live purchase/fulfillment test remain release checks. No production database, storage, edge function, app update, or website deployment was changed in this task.
