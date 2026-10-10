import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveSolanaRpc,DEFAULT_SOLANA_RPC_URL} from '../lib/shop/solana-rpc.ts';
import {shopContentSecurity} from '../lib/shop/content-security.ts';

// Solana's own public endpoint refuses web pages (403 on the Origin), which
// broke paying in Phantom's in-app browser (11-10-2026).
test('the browser never asks the endpoint that refuses web pages', () => {
  assert.equal(resolveSolanaRpc(undefined), DEFAULT_SOLANA_RPC_URL);
  assert.equal(resolveSolanaRpc(''), DEFAULT_SOLANA_RPC_URL);
  assert.equal(resolveSolanaRpc('https://api.mainnet-beta.solana.com'), DEFAULT_SOLANA_RPC_URL);
  assert.equal(resolveSolanaRpc('https://rpc.example.test'), 'https://rpc.example.test');
});

test('the shop policy allows the endpoint the page actually uses', () => {
  const policy = shopContentSecurity('abcdef0123456789abcdefghij', true, false, {solanaRpc: 'https://api.mainnet-beta.solana.com'});
  assert.match(policy, /connect-src [^;]*https:\/\/solana-rpc\.publicnode\.com/);
  assert.doesNotMatch(policy, /api\.mainnet-beta\.solana\.com/);
});
