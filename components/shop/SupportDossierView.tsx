"use client";
import {eventTitle,eventTrust,object,paymentLabel,preciseAmount,supportConclusion,text,type SupportDossier} from '@/lib/shop/support-dossier';
import styles from './SupportDesk.module.css';
const date=(value:unknown)=>typeof value==='string'&&Number.isFinite(Date.parse(value))?new Intl.DateTimeFormat('nl-NL',{dateStyle:'medium',timeStyle:'medium'}).format(new Date(value)):'—';
export default function SupportDossierView({dossier}:{dossier:SupportDossier}) {
  const order=dossier.order,customer=object(order.checkout_snapshot),product=object(order.product_snapshot),asset=paymentLabel(order);
  const payments=[...dossier.solana_payments,...dossier.evm_payments];
  const fees=dossier.events.filter(e=>e.event==='payment_chain_evidence'&&e.source==='chain_verifier');
  return <article className={styles.dossier}>
    <div className={styles.heading}><div><p className="eyebrow">Besteldossier</p><h2>{text(order.id)}</h2></div><span>{date(order.created_at)}</span></div>
    <p className={styles.conclusion}>{supportConclusion(dossier)}</p>
    {!dossier.order_exists&&<p className={styles.notice}>De oorspronkelijke order is verwijderd. Dit dossier toont de bewaarde laatste momentopname.</p>}
    <div className={styles.facts}>
      <section><h3>Klant en ontvanger</h3><dl><div><dt>Klant</dt><dd>{text(customer.email)}</dd></div>
        <div><dt>Ontvanger</dt><dd>{text(customer.beneficiary_name)} {customer.beneficiary_code?`· #${text(customer.beneficiary_code)}`:''}</dd></div>
        <div><dt>Account ontvanger</dt><dd>{text(order.beneficiary_user_id??order.user_id)}</dd></div>
        <div><dt>Verzoekreferentie</dt><dd>{text(order.checkout_request_id)}</dd></div></dl></section>
      <section><h3>Betaling en levering</h3><dl>
        <div><dt>Afgesproken betaling</dt><dd>{asset.asset==='Radom'?'Via Radom':`${preciseAmount(order.amount_base_units,asset.decimals)} ${asset.asset}`}</dd></div>
        <div><dt>Geregistreerd ontvangen</dt><dd>{asset.asset==='Radom'?'Zie de betaalbewijzen':`${preciseAmount(order.payment_received_base_units,asset.decimals)} ${asset.asset}`}</dd></div>
        <div><dt>Betaald op</dt><dd>{date(order.paid_at)}</dd></div><div><dt>Geleverd op</dt><dd>{date(order.fulfilled_at)}</dd></div>
        <div><dt>Laatste controle</dt><dd>{date(order.checked_at)}</dd></div>
        <div><dt>Beoordeling / fout</dt><dd>{text(order.payment_review_reason??order.failure_reason)}</dd></div>
      </dl></section>
    </div>
    <section><h3>Bestelde en geleverde items</h3>
      <p>Productgegevens en levering worden bewaard zoals ze bij deze bestelling golden.</p>
      {Array.isArray(product.items)?<ul>{product.items.map((value,index)=>{const item=object(value);return <li key={index}>{text(item.quantity)} × {text(item.name??item.id)}{object(item.pack).tier?` · ${text(object(item.pack).tier)}`:''}</li>;})}</ul>:<p>{text(product.name??order.product_id)}</p>}
      <p>{dossier.pack_credits.length} packregistraties aanwezig · {dossier.pack_credits.filter(p=>!!p.consumed_at).length} geopend.</p>
      <details><summary>Oorspronkelijke productspecificatie en leveropdracht</summary><pre>{JSON.stringify({product:order.product_snapshot,fulfillment:order.fulfillment,pack_credits:dossier.pack_credits},null,2)}</pre></details>
    </section>
    <section><h3>Betaalbewijzen en netwerkkosten</h3>
      {!payments.length&&<p>Geen directe blockchainbetaling geregistreerd. Bij Radom staat het bewijs in de tijdlijn.</p>}
      {payments.map((payment,index)=><div className={styles.payment} key={index}><strong>{text(payment.signature??payment.transaction_hash)}</strong>
        <span>{preciseAmount(payment.amount_base_units,asset.decimals)} {asset.asset} · {date(payment.block_time)}</span></div>)}
      {fees.map(e=><div className={styles.payment} key={e.id}><strong>Netwerkkosten: {preciseAmount(e.evidence.fee_base_units,e.evidence.fee_asset==='SOL'?9:18)} {text(e.evidence.fee_asset)}</strong><span>{text(e.evidence.transaction_id)}</span></div>)}
      {!fees.length&&<p>Het bedrag aan netwerkkosten is niet vastgelegd in de geladen gebeurtenissen. Dat betekent niet dat de kosten nul waren.</p>}
      <p className={styles.muted}>Kostenbewijs geldt voor de hele transactie. Tel het bij meerdere orders in dezelfde transactie één keer mee. Het aanmaken van een Solana-tokenrekening kan apart saldo kosten; dat is geen netwerkvergoeding.</p>
      <details><summary>Afgesproken koers en kostenbeleid</summary><pre>{JSON.stringify({payment_quote:order.payment_quote,client_context:customer.client_context},null,2)}</pre></details>
    </section>
    <section><h3>Tijdlijn</h3><p className={styles.muted}>Nieuwste eerst. Een melding vanuit de browser is geen betaalbewijs. Ontbrekende oude gebeurtenissen worden niet achteraf verzonnen.</p>
      <ol className={styles.timeline}>{dossier.events.map(e=><li key={e.id}>
        <div><strong>{eventTitle(e)}</strong><time dateTime={e.created_at}>{date(e.created_at)}</time></div>
        <span className={styles.trust}>{eventTrust(e)}</span>
        <details><summary>Vastgelegde gegevens</summary><pre>{JSON.stringify(e.evidence,null,2)}</pre></details>
      </li>)}</ol>
    </section>
  </article>;
}
