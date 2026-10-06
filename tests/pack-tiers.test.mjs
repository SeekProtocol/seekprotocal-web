import assert from 'node:assert/strict';
import test from 'node:test';
import {parseTierPack,packContents} from '../lib/shop/pack-tiers.ts';
test('fifth-card percentages stay distinct from guaranteed cards',()=>{
 const pack=parseTierPack({tier:'elite',policy_version:'policy',points_per_pack:500,slots:[
  {slot:0,card_rarity:'uncommon',weight:1000},{slot:1,card_rarity:'uncommon',weight:1000},
  {slot:2,card_rarity:'rare',weight:1000},{slot:3,card_rarity:'rare',weight:1000},
  {slot:4,card_rarity:'epic',weight:800},{slot:4,card_rarity:'legendary',weight:170},{slot:4,card_rarity:'mythic',weight:30}]});
 assert.deepEqual(packContents(pack),{guaranteed:[{rarity:'uncommon',count:2},{rarity:'rare',count:2}],random:[{slot:4,odds:[{rarity:'epic',percent:80},{rarity:'legendary',percent:17},{rarity:'mythic',percent:3}]}]});
});
