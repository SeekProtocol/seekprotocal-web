/**
 * The Solana node the shop's browser code asks for a recent blockhash.
 *
 * Solana's own public endpoint answers every request from a web page with
 * 403 (it checks the Origin), so a purchase failed the moment the page asked
 * it anything, in Phantom's in-app browser too (11-10-2026). publicnode
 * serves browser requests (CORS *). A configured endpoint is used unless it
 * is that blocked one.
 */
const BROWSER_BLOCKED = /^https:\/\/api\.mainnet-beta\.solana\.com/i;
export const DEFAULT_SOLANA_RPC_URL = 'https://solana-rpc.publicnode.com';

export function resolveSolanaRpc(configured: string | undefined): string {
  const value = (configured ?? '').trim();
  return value && !BROWSER_BLOCKED.test(value) ? value : DEFAULT_SOLANA_RPC_URL;
}
