export const PACK_TIERS = ['basic', 'premium', 'elite'] as const;
export type PackTier = typeof PACK_TIERS[number];
export const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'] as const;
export type Rarity = typeof RARITIES[number];
export interface PackSlot {slot: number; card_rarity: Rarity; weight: number}
export interface TierPack {
  tier: PackTier;
  policy_version: string;
  points_per_pack: number;
  slots: PackSlot[];
}
/** No inferred tiers or odds: the immutable server offer supplies every reward. */
export function parseTierPack(value: unknown): TierPack | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const p = value as Record<string, unknown>;
  if (p.tier === undefined || p.tier === null) {
    if (p.policy_version !== undefined || p.slots !== undefined || p.points_per_pack !== undefined) throw new Error('catalog_unavailable');
    return undefined;
  }
  if (!PACK_TIERS.includes(p.tier as PackTier) || typeof p.policy_version !== 'string' || !p.policy_version ||
      !Number.isSafeInteger(p.points_per_pack) || Number(p.points_per_pack) < 0 || !Array.isArray(p.slots) || p.slots.length > 30) throw new Error('catalog_unavailable');
  const seen = new Set<string>();
  const totals = [0, 0, 0, 0, 0];
  const slots = p.slots.map((s: PackSlot) => {
    if (!s || !Number.isInteger(s.slot) || s.slot < 0 || s.slot > 4 || !RARITIES.includes(s.card_rarity) ||
        !Number.isSafeInteger(s.weight) || s.weight <= 0 || seen.has(`${s.slot}:${s.card_rarity}`)) throw new Error('catalog_unavailable');
    seen.add(`${s.slot}:${s.card_rarity}`);
    totals[s.slot] += s.weight;
    return {slot:s.slot,card_rarity:s.card_rarity,weight:s.weight};
  });
  if (totals.some(total => total !== 1000)) throw new Error('catalog_unavailable');
  return {tier:p.tier as PackTier,policy_version:p.policy_version,points_per_pack:Number(p.points_per_pack),slots};
}
/** Certain cards are grouped; every random slot retains its own percentages. */
export function packContents(pack: TierPack) {
  const guaranteed = new Map<Rarity, number>();
  const random: {slot:number;odds:{rarity:Rarity;percent:number}[]}[] = [];
  for (let slot = 0; slot < 5; slot++) {
    const rows = pack.slots.filter(row => row.slot === slot);
    if (rows.length === 1) guaranteed.set(rows[0].card_rarity, (guaranteed.get(rows[0].card_rarity) ?? 0) + 1);
    else random.push({slot,odds:RARITIES.flatMap(rarity => rows.filter(row => row.card_rarity === rarity).map(row => ({rarity,percent:row.weight / 10})))});
  }
  return {guaranteed:[...guaranteed].map(([rarity,count])=>({rarity,count})),random};
}
