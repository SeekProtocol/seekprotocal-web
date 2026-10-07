BEGIN;
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
GRANT USAGE ON SCHEMA public,auth TO authenticated;
INSERT INTO auth.users(id) VALUES ('aa000000-0000-4000-8000-000000000001'),('bb000000-0000-4000-8000-000000000001');
INSERT INTO profiles(id,nickname,share_code) VALUES ('aa000000-0000-4000-8000-000000000001','Audit A','AUDITA12'),('bb000000-0000-4000-8000-000000000001','Audit B','AUDITB12');
INSERT INTO solana_orders(user_id,product_id,mint,amount_base_units,recipient,reference,created_at,expires_at,fulfillment,price_usd_cents,channel,payment_protocol,payment_quote,checked_at)
SELECT 'aa000000-0000-4000-8000-000000000001','seekar_pack_five','eip155:1/native',100000000000000001,'0x'||repeat('a',40),'0x'||lpad(to_hex(n),64,'0'),now()-interval '10 minutes',now()-interval '5 minutes','{"kind":"pack","packs":5}',1299,'web','evm-native-v1','{"chain_id":1,"router":"0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"}',now()-interval '20 minutes' FROM generate_series(1,80) n;
INSERT INTO solana_orders(id,user_id,product_id,mint,amount_base_units,recipient,reference,created_at,expires_at,fulfillment,price_usd_cents,channel,payment_protocol,payment_quote,checked_at,status,paid_at)
VALUES('bb000000-0000-4000-8000-000000000002','bb000000-0000-4000-8000-000000000001','seekar_pack_five','eip155:1/native',100000000000000001,'0x'||repeat('a',40),'0x'||repeat('f',64),now()-interval '10 minutes',now()-interval '5 minutes','{"kind":"pack","packs":5}',1299,'web','evm-native-v1','{"chain_id":1,"router":"0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"}',now()-interval '2 minutes','paid',now()-interval '2 minutes');
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','bb000000-0000-4000-8000-000000000001',true);
DO $$ BEGIN
 IF (SELECT count(*) FROM solana_orders)<>1 THEN RAISE EXCEPTION 'RLS leaked another account'; END IF;
 IF has_table_privilege(current_user,'solana_orders','UPDATE') OR has_table_privilege(current_user,'solana_orders','INSERT') THEN RAISE EXCEPTION 'Customer can modify orders'; END IF;
 IF has_function_privilege(current_user,'shop_record_evm_payment(uuid,integer,text,integer,text,text,text,numeric,timestamptz,text,bigint,text)','EXECUTE') THEN RAISE EXCEPTION 'Customer can certify payments'; END IF;
 RAISE NOTICE 'PASS: account B sees only its own order; writes and payment certification refused';
END $$;
RESET ROLE;
DO $$ DECLARE batch integer; claimed uuid[]; BEGIN
 FOR batch IN 1..11 LOOP
  SELECT array_agg(id) INTO claimed FROM shop_claim_reconciliation_batch(8);
  IF 'bb000000-0000-4000-8000-000000000002'::uuid=ANY(claimed) THEN
    IF batch<>11 THEN RAISE EXCEPTION 'Unexpected batch %',batch; END IF;
    RAISE NOTICE 'CONFIRMED: paid order first selected in batch %, behind 80 unpaid expired orders',batch; EXIT;
  END IF;
  UPDATE solana_orders SET checked_at=now(),reconciliation_claimed_until=null WHERE id=ANY(claimed);
 END LOOP;
END $$;
ROLLBACK;
