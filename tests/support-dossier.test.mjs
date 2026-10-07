import assert from 'node:assert/strict';
import test from 'node:test';
import {preciseAmount,supportConclusion,eventTrust,mergeEvents,paymentLabel} from '../lib/shop/support-dossier.ts';
test('support displays exact wei and unknown fees without inventing a zero',()=>{
  assert.equal(preciseAmount('100000000000000001',18),'0.100000000000000001');
  assert.equal(preciseAmount('5000',9),'0.000005');
  assert.equal(preciseAmount(null,18),'Onbekend');
  assert.equal(preciseAmount(100000000000000001,18),'Onbekend');
  assert.deepEqual(paymentLabel({mint:'eip155:56/native'}),{asset:'BNB',decimals:18});
});
test('a client claiming a sent transaction is not proof of payment',()=>{
  const event={id:'1',event:'transaction_submitted',source:'web_client',evidence:{paid:true}};
  assert.match(eventTrust(event),/niet geverifieerd/);
  assert.match(supportConclusion({order:{status:'pending'},events:[event]}),/nog geen bevestigde betaling/);
  assert.match(supportConclusion({order:{status:'paid',fulfilled_at:null}}),/levering is nog niet afgerond/);
  assert.match(supportConclusion({order:{payment_review_reason:'underpaid'}}),/deelbetaling/);
  assert.match(supportConclusion({order:{fulfilled_at:'2026-10-07T00:00:00Z',payment_review_reason:'overpaid'}}),/meer betaald/);
});
test('timeline pagination preserves very large IDs and deduplicates boundaries',()=>{
  const a={id:'9007199254740993'},b={id:'9007199254740992'},c={id:'9007199254740994'};
  assert.deepEqual(mergeEvents([a,b],[b,c]).map(e=>e.id),[c.id,a.id,b.id]);
});
