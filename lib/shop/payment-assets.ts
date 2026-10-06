export const PAYMENT_ASSETS = {
  SOL: {mint: 'SOL', decimals: 9, network:'solana-mainnet', networkName:'Solana', feeAsset:'SOL'},
  USDC: {mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6, network:'solana-mainnet', networkName:'Solana', feeAsset:'SOL'},
  USDT: {mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', decimals: 6, network:'solana-mainnet', networkName:'Solana', feeAsset:'SOL'},
  BNB: {mint:'eip155:56/native',decimals:18,network:'bsc-mainnet',networkName:'BNB Smart Chain',feeAsset:'BNB'},
  ETH: {mint:'eip155:1/native',decimals:18,network:'ethereum-mainnet',networkName:'Ethereum',feeAsset:'ETH'},
} as const;
export type PaymentAsset = keyof typeof PAYMENT_ASSETS;
export const SOLANA_MAINNET_GENESIS = '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp';

export function isPaymentAsset(value: unknown): value is PaymentAsset {
  return value === 'SOL' || value === 'USDC' || value === 'USDT' || value === 'BNB' || value === 'ETH';
}

/** Display every base unit without floating point rounding or scientific notation. */
export function formatPaymentAmount(amount: bigint, asset: PaymentAsset): string {
  const decimals = PAYMENT_ASSETS[asset].decimals;
  const scale = BigInt(10) ** BigInt(decimals);
  const fraction = (amount % scale).toString().padStart(decimals, '0').replace(/0+$/, '');
  return `${amount / scale}${fraction ? `.${fraction}` : ''}`;
}

export function paymentAssetForMint(mint: string): PaymentAsset | null {
  return (Object.keys(PAYMENT_ASSETS) as PaymentAsset[]).find(asset => PAYMENT_ASSETS[asset].mint === mint) ?? null;
}

export function parsePaymentQuote(data: Record<string, unknown>, expected: PaymentAsset) {
  const asset = data.asset ?? (data.mint === 'SOL' || data.mint === undefined ? 'SOL' : undefined);
  if (asset !== expected || (data.mint !== undefined && data.mint !== PAYMENT_ASSETS[expected].mint)
      || (data.decimals !== undefined && data.decimals !== PAYMENT_ASSETS[expected].decimals)
      || (data.network !== undefined && data.network !== PAYMENT_ASSETS[expected].network)
      || ((expected === 'BNB' || expected === 'ETH') && (data.network !== PAYMENT_ASSETS[expected].network || data.mint !== PAYMENT_ASSETS[expected].mint || data.decimals !== 18))
      || typeof data.amount !== 'string' || !/^[1-9][0-9]*$/.test(data.amount)
      || BigInt(data.amount) > BigInt('9223372036854775807')) throw new Error('invalid_payment_quote');
  return {asset: expected, amount: BigInt(data.amount)};
}
