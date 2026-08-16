/**
 * The chains the protocol settles on.
 *
 * This is the only place on the site that decides which networks are named and
 * which of them are live. Every chain strip, every "settles on ..." sentence
 * and the whitepaper's settlement chapter read from here, so moving a chain
 * from `soon` to `live` is one edit rather than a sweep through nine message
 * files.
 *
 * ── Where the truth lives ────────────────────────────────────────────────
 *
 * The app is the authority, not this file. In `seekar-app`:
 *
 *   - `networks` is a **table**, not a constant: `chain`, `chain_id`,
 *     `rpc_url`, `explorer_url`, `is_active`, `sort_order`. Every network the
 *     protocol settles on is a row in it, which is why adding one is
 *     configuration rather than a release.
 *   - `token_networks` maps each asset to the networks it exists on, with its
 *     contract address and decimals per network. One asset, many chains.
 *   - `shared/constants/index.ts` carries
 *     `SUPPORTED_CHAINS = ['solana', 'ethereum']`, and the baseline migration
 *     constrains `networks.chain` to the same two values.
 *
 * That last constraint is about **address families, not networks**. A wallet is
 * either a Solana keypair or an EVM one, and every EVM network shares the one
 * address format. So Ethereum, BNB Smart Chain and Arbitrum are three rows
 * against a single `ethereum` wallet, not three separate integrations.
 *
 * ── Status, and how to change it ─────────────────────────────────────────
 *
 * `live` means there is an active row in `networks` and a wallet that can hold
 * the asset. `soon` means the family is supported and the row is not seeded
 * yet.
 *
 * Ethereum and Solana are `live` because the app's own constants say so.
 * BNB Smart Chain and Arbitrum are `soon` because the production `networks`
 * rows could not be read from this repo, and a chain listed as live on a public
 * site is a claim, not a hope. If those rows exist, flip `status` here and the
 * whole site follows.
 *
 * The chain strips, `llms.txt` and every "settles on ..." sentence read this
 * file, so flipping a status is genuinely one edit. **One place does not**, and
 * it is prose rather than data: `roadmapPhases.scale.items.multichain` in all
 * nine message files says which networks the 2026 rollout covers. Move a chain
 * to `live` and that roadmap line should lose it, in nine languages.
 */

export type ChainStatus = "live" | "soon";

export type Chain = {
  id: string;
  /** Proper noun. Deliberately not translated, in any locale. */
  name: string;
  /** Wallet address family. Every `evm` chain shares one address. */
  family: "evm" | "solana";
  status: ChainStatus;
  /**
   * A 3D coin under `public/app/3d/coins/`, if one has been authored.
   *
   * Optional on purpose: `ChainCoins` draws the chains that have one and the
   * flat strip carries all of them regardless, so a coin can be added one file
   * at a time without the roster ever being half rendered.
   *
   * Produced by `scripts/export-coin.py`, which normalises every coin to a
   * 1-unit diameter centred on its own bounds. Do not hand-place a GLB here
   * without running it through that, or this one coin will be the wrong size
   * and the row will need a magic number to compensate.
   */
  coin?: string;
};

export const CHAINS: readonly Chain[] = [
  { id: "ethereum", name: "Ethereum", family: "evm", status: "live" },
  { id: "solana", name: "Solana", family: "solana", status: "live" },
  { id: "bnb", name: "BNB Smart Chain", family: "evm", status: "soon", coin: "bnb.glb" },
  { id: "arbitrum", name: "Arbitrum", family: "evm", status: "soon" },
];

/** The chains with a 3D coin, in roster order. */
export const COIN_CHAINS = CHAINS.filter((chain) => chain.coin);

export const LIVE_CHAINS = CHAINS.filter((chain) => chain.status === "live");

/**
 * The chains named in a running sentence, as in "settles on Ethereum, Solana
 * and BNB Smart Chain".
 *
 * The conjunction is passed in by the caller because it is a translated word
 * and this file holds no copy. Two names take the conjunction alone; three or
 * more take commas and then the conjunction, with no serial comma, which is the
 * house style in every locale here.
 */
export function nameList(chains: readonly Chain[], and: string): string {
  const names = chains.map((chain) => chain.name);
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} ${and} ${names[names.length - 1]}`;
}
