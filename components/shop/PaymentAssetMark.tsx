import Image from "next/image";
import type {PaymentAsset} from "@/lib/shop/payment-assets";

const TOKEN_LOGOS: Record<PaymentAsset, string> = {
  USDC: "/images/payment-tokens/usdc.svg",
  USDT: "/images/payment-tokens/usdt.svg",
  SOL: "/images/payment-tokens/sol.svg",
  BNB: "/images/payment-tokens/bnb.svg",
  ETH: "/images/payment-tokens/eth.svg",
};

/** Original brand assets; provenance is in public/images/payment-tokens/sources.json. */
export default function PaymentAssetMark({asset}: {asset: PaymentAsset}) {
  return <Image
    src={TOKEN_LOGOS[asset]}
    width={32}
    height={32}
    alt=""
    aria-hidden="true"
    unoptimized
    loading="eager"
    className="checkout-token-logo"
  />;
}
