export type AuditEvent = {id:string;created_at:string;event:string;source:string;order_id?:string|null;request_id?:string|null;evidence:Record<string,unknown>};
export type SupportDossier = {version:number;generated_at:string;through_id:string;order_exists:boolean;order:Record<string,unknown>;
  solana_payments:Record<string,unknown>[];evm_payments:Record<string,unknown>[];pack_credits:Record<string,unknown>[];
  events:AuditEvent[];next_before_id:string|null;coverage:Record<string,unknown>};

export function object(value:unknown):Record<string,unknown> {
  return value&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,unknown>:{};
}
export function text(value:unknown):string {return typeof value==='string'?value:typeof value==='number'&&Number.isFinite(value)?String(value):'—';}
export function preciseAmount(value:unknown,decimals:number):string {
  if(typeof value!=='string'||!/^\d+$/.test(value))return 'Onbekend';
  const digits=value.padStart(decimals+1,'0');
  return decimals?digits.slice(0,-decimals)+(digits.slice(-decimals).replace(/0+$/,'')?'.'+digits.slice(-decimals).replace(/0+$/,''):''):digits;
}
export function paymentLabel(order:Record<string,unknown>):{asset:string;decimals:number} {
  const mint=order.mint;
  if(mint==='eip155:1/native')return {asset:'ETH',decimals:18};
  if(mint==='eip155:56/native')return {asset:'BNB',decimals:18};
  if(mint==='SOL')return {asset:'SOL',decimals:9};
  if(mint==='EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')return {asset:'USDC',decimals:6};
  if(mint==='Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB')return {asset:'USDT',decimals:6};
  return {asset:mint==='RADOM'?'Radom':'Onbekend',decimals:0};
}
export function eventTrust(event:AuditEvent):string {
  if(event.source==='web_client')return 'Klantmelding · niet geverifieerd';
  if(event.source==='chain_verifier')return 'Gecontroleerd op de blockchain';
  if(event.source==='database')return 'Vastgelegd in de database';
  if(event.source==='support')return 'Handeling van support';
  return 'Waarneming van de server';
}
const titles:Record<string,string>={order_insert:'Bestelling aangemaakt',order_update:'Bestelling bijgewerkt',order_delete:'Bestelling verwijderd',
  migration_snapshot:'Momentopname van een oudere bestelling',recipient_checked:'Ontvangend account gecontroleerd',recipient_rejected:'Ontvanger niet geaccepteerd',
  payment_verified:'Betaling gecontroleerd',payment_chain_evidence:'Transactie en netwerkkosten vastgelegd',product_delivered:'Aankoop geleverd',
  pack_insert:'Pack toegekend',pack_update:'Pack bijgewerkt of geopend',pack_delete:'Packregistratie verwijderd',fulfillment_failed:'Levering niet gelukt',
  settlement_started:'Betaalcontrole gestart',settlement_result:'Betaalcontrole afgerond',settlement_failed:'Betaalcontrole niet gelukt',
  wallet_opened:'Klant meldde: wallet geopend',wallet_rejected:'Klant meldde: betaling geweigerd',wallet_uncertain:'Klant meldde: betaalstatus onzeker',
  transaction_submitted:'Klant meldde: transactie verstuurd',redirect_started:'Klant meldde: doorgestuurd naar betaling',
  provider_status:'Status bij betaaldienst opgevraagd',webhook_received:'Melding van betaaldienst ontvangen',webhook_failed:'Melding niet verwerkt',
  checkout_reused:'Bestaande bestelling hergebruikt',checkout_resumed:'Betaling hervat',support_case_opened:'Supportdossier geopend',
  request_received:'Verzoek ontvangen',request_rejected:'Verzoek afgewezen'};
export function eventTitle(event:AuditEvent):string {return titles[event.event]??event.event;}
export function supportConclusion(dossier:SupportDossier):string {
  const order=dossier.order;
  if(order.fulfilled_at&&order.payment_review_reason==='overpaid')return 'De aankoop is geleverd, maar er is meer betaald dan afgesproken. Beoordeel het extra bedrag afzonderlijk.';
  if(order.fulfilled_at)return 'De aankoop is geleverd. Controleer hieronder het ontvangende account en de toegekende items.';
  if(order.status==='paid'||order.paid_at)return 'De betaling is geregistreerd, maar de levering is nog niet afgerond. Onderzoek de leverfout; vraag de klant niet opnieuw te betalen.';
  if(order.payment_review_reason==='underpaid')return 'Er is een deelbetaling geregistreerd. Het ontvangen bedrag is lager dan het afgesproken bedrag.';
  if(order.payment_review_reason==='late_payment')return 'Er is een betaling buiten de geldige betaalperiode geregistreerd. Deze vraagt handmatige beoordeling.';
  if(order.payment_review_reason)return 'Er is betaalbewijs dat handmatige beoordeling vraagt. Vraag de klant niet opnieuw te betalen.';
  return 'Er is nog geen bevestigde betaling in dit dossier. Dat bewijst niet dat er niets is afgeschreven; controleer de transactiecode en de laatste betaalcontrole.';
}
/** Deduplicate pages without ever rounding PostgreSQL bigint event IDs. */
export function mergeEvents(previous:AuditEvent[],next:AuditEvent[]):AuditEvent[] {
  const entries=new Map([...previous,...next].map(event=>[event.id,event]));
  return [...entries.values()].sort((a,b)=>BigInt(a.id)>BigInt(b.id)?-1:BigInt(a.id)<BigInt(b.id)?1:0);
}
