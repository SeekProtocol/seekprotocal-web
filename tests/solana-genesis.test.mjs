import test from 'node:test';
import assert from 'node:assert/strict';
import {SOLANA_MAINNET_GENESIS} from '../lib/shop/payment-assets.ts';

// What Solana mainnet answers to getGenesisHash. A truncated copy (7 to 11
// October 2026) made Pay refuse every Solana payment as "shop paused".
test('the mainnet genesis hash is the whole hash', () => {
  assert.equal(SOLANA_MAINNET_GENESIS, '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d');
});
