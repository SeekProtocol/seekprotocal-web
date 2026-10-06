import {ChainMark} from "@/components/brand/ChainMarks";
import type {PaymentAsset} from "@/lib/shop/payment-assets";

/** Decorative coin marks; the adjacent label supplies the accessible name. */
export default function PaymentAssetMark({asset}: {asset: PaymentAsset}) {
  if (asset === "BNB") return <ChainMark id="bnb" name="BNB" size={32} />;
  if (asset === "ETH") return <ChainMark id="ethereum" name="Ethereum" size={32} />;
  if (asset === "SOL") return <ChainMark id="solana" name="Solana" size={32} />;

  return <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
    <circle cx="16" cy="16" r="16" fill={asset === "USDC" ? "#2775ca" : "#26a17b"} />
    {asset === "USDC" ? <g fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round">
      <path d="M19 12.5c-.4-1.1-1.5-1.7-3-1.7-1.8 0-3.1.9-3.1 2.4 0 3.6 6.3 1.6 6.3 5.3 0 1.5-1.4 2.6-3.3 2.6-1.6 0-2.9-.8-3.3-2M16 8.8v2m0 10.4v2M11 7.9a9.5 9.5 0 0 0 0 16.2M21 7.9a9.5 9.5 0 0 1 0 16.2" />
    </g> : <g fill="#fff">
      <path d="M7.5 8.5h17v4H18v12h-4v-12H7.5z" />
      <path fillRule="evenodd" d="M16 12.8c6 0 10.5 1.1 10.5 2.5S22 17.8 16 17.8 5.5 16.7 5.5 15.3s4.5-2.5 10.5-2.5zm0 .8c-5.2 0-9.4.7-9.4 1.5s4.2 1.5 9.4 1.5 9.4-.7 9.4-1.5-4.2-1.5-9.4-1.5z" />
    </g>}
  </svg>;
}
