"use client";
import SupportDossierView from './SupportDossierView';
import type {SupportDossier} from '@/lib/shop/support-dossier';
const id='81000000-0000-4000-8000-000000000003',hash='0x'+'c'.repeat(64);
const dossier:SupportDossier={version:1,generated_at:'2026-10-07T00:00:00Z',through_id:'5',order_exists:true,
  order:{id,created_at:'2026-10-06T23:55:00Z',mint:'eip155:56/native',amount_base_units:'100000000000000001',payment_received_base_units:'100000000000000001',
    status:'paid',paid_at:'2026-10-06T23:56:00Z',fulfilled_at:'2026-10-06T23:56:02Z',checked_at:'2026-10-06T23:56:02Z',checkout_request_id:'81000000-0000-4000-8000-000000000004',
    beneficiary_user_id:'81000000-0000-4000-8000-000000000002',checkout_snapshot:{email:'voorbeeld@example.test',beneficiary_name:'Voorbeeldspeler',beneficiary_code:'TEST1234',client_context:{locale:'nl',fee_disclosure:'buyer-network-v1',source:'client_report'}},
    product_snapshot:{items:[{name:'Premiumpakket',quantity:2}]},fulfillment:{kind:'pack',packs:2},payment_quote:{asset:'BNB',fee_policy:{paid_by:'sender',included_in_product_total:false}}},
  solana_payments:[],evm_payments:[{transaction_hash:hash,amount_base_units:'100000000000000001',block_time:'2026-10-06T23:56:00Z'}],
  pack_credits:[{id:'voorbeeld-pack-1',tier:'premium',consumed_at:null},{id:'voorbeeld-pack-2',tier:'premium',consumed_at:'2026-10-06T23:58:00Z'}],
  events:[{id:'5',event:'product_delivered',source:'database',created_at:'2026-10-06T23:56:02Z',evidence:{packs:2,beneficiary_name:'Voorbeeldspeler'}},
    {id:'4',event:'payment_chain_evidence',source:'chain_verifier',created_at:'2026-10-06T23:56:00Z',evidence:{transaction_id:hash,fee_base_units:'123456789000000',fee_asset:'BNB',fee_scope:'whole_transaction'}},
    {id:'3',event:'transaction_submitted',source:'web_client',created_at:'2026-10-06T23:55:30Z',evidence:{signature:hash,verification:'client_report_only'}},
    {id:'2',event:'wallet_opened',source:'web_client',created_at:'2026-10-06T23:55:25Z',evidence:{verification:'client_report_only'}},
    {id:'1',event:'order_insert',source:'database',created_at:'2026-10-06T23:55:00Z',evidence:{product:'Premiumpakket',quantity:2}}],
  next_before_id:null,coverage:{historical_events_reconstructed:false}};
export default function SupportPreview(){return <main className="shell" style={{paddingTop:140,paddingBottom:60}}><p role="status" style={{marginBottom:24}}>Voorbeeld supportdossier — fictieve gegevens, geen echte betaling.</p><SupportDossierView dossier={dossier}/></main>;}
