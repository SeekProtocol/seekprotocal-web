import assert from 'node:assert/strict';
import test from 'node:test';
import {accountCheckError} from '../lib/shop/account-check-error.ts';
test('a rejected login is explained as sign-in required, not an unknown account',()=>{
 assert.deepEqual(accountCheckError('unauthorized'),{scope:'shop',key:'errUnauthorized'});
});
test('connection, limits and changed products retain actionable messages',()=>{
 for (const [code,key] of [['network','errNetwork'],['rate_limited','errRateLimited'],['checkout_unavailable','errCheckoutUnavailable'],['catalog_changed','errCatalogChanged'],['invalid_cart','errCart']]) assert.deepEqual(accountCheckError(code),{scope:'shop',key});
});
test('recipient mistakes keep their own correction instructions',()=>{
 assert.deepEqual(accountCheckError('friends_id_invalid'),{scope:'checkout',key:'invalidFriend'});
 assert.deepEqual(accountCheckError('arena_unavailable'),{scope:'checkout',key:'recipientUnavailable'});
 assert.deepEqual(accountCheckError('unknown'),{scope:'checkout',key:'detailsFailed'});
});
