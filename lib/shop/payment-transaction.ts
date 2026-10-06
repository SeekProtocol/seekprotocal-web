import {PublicKey, SystemProgram, Transaction, TransactionInstruction} from '@solana/web3.js';
import {Buffer} from 'buffer';
import {PAYMENT_ASSETS, type PaymentAsset} from './payment-assets.ts';

const TOKEN_PROGRAM = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
const ASSOCIATED_TOKEN_PROGRAM = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
const account = (pubkey:PublicKey,isWritable=false,isSigner=false) => ({pubkey,isWritable,isSigner});
const associatedAccount = (owner:PublicKey,mint:PublicKey) => PublicKey.findProgramAddressSync(
  [owner.toBuffer(),TOKEN_PROGRAM.toBuffer(),mint.toBuffer()],ASSOCIATED_TOKEN_PROGRAM,
)[0];

/** The buyer signs a direct transfer. No approval, swap or merchant signing key. */
export function buildPaymentTransaction(input: {
  order: {asset: PaymentAsset; amount: bigint; recipient: string; reference: string};
  payer: PublicKey; blockhash: string; lastValidBlockHeight: number;
}): Transaction {
  const {order,payer} = input;
  if(order.asset==='BNB'||order.asset==='ETH')throw new Error('wrong_payment_network');
  if (order.amount <= BigInt(0) || order.amount>BigInt('9223372036854775807')) throw new Error('invalid_payment_amount');
  const recipient = new PublicKey(order.recipient);
  const tx = new Transaction({feePayer:payer,blockhash:input.blockhash,lastValidBlockHeight:input.lastValidBlockHeight});
  let transfer;
  if (order.asset === 'SOL') {
    transfer = SystemProgram.transfer({fromPubkey:payer,toPubkey:recipient,lamports:order.amount});
  } else {
    const info = PAYMENT_ASSETS[order.asset], mint = new PublicKey(info.mint);
    const source = associatedAccount(payer,mint);
    const destination = associatedAccount(recipient,mint);
    // Idempotent: safe if the merchant's token account already exists.
    // Standard ATA CreateIdempotent (1) and SPL TransferChecked (12). Their wire
    // messages are regression-checked against fixtures from the official SDK.
    tx.add(new TransactionInstruction({programId:ASSOCIATED_TOKEN_PROGRAM,data:Buffer.from([1]),keys:[
      account(payer,true,true),account(destination,true),account(recipient),account(mint),account(SystemProgram.programId),account(TOKEN_PROGRAM),
    ]}));
    const data=Buffer.alloc(10);data[0]=12;data.writeBigUInt64LE(order.amount,1);data[9]=info.decimals;
    transfer = new TransactionInstruction({programId:TOKEN_PROGRAM,data,keys:[account(source,true),account(mint),account(destination,true),account(payer,false,true)]});
  }
  transfer.keys.push({pubkey:new PublicKey(order.reference),isSigner:false,isWritable:false});
  tx.add(transfer);
  return tx;
}
