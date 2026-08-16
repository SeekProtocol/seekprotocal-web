"use client";

import dynamic from "next/dynamic";
import { COIN_CHAINS } from "@/content/chains";

/**
 * The client boundary the coin row needs, and nothing else.
 *
 * `ChainRoster` renders on both sides: the homepage reaches it through
 * `DistributionSection`, which is a client component, and the business page
 * renders it on the server. `next/dynamic` with `ssr: false` is only legal on
 * the client, so putting the lazy import in the roster itself built fine in dev
 * and failed the production build on the business page alone.
 *
 * `ssr: false` rather than a plain import, for the reason `CoinStage` records:
 * three.js and every scene share one 603 KB chunk, and nothing here is worth
 * putting that on the critical path. A row of coins is decoration over a strip
 * that already carries the names and the live status.
 */
const ChainCoins = dynamic(() => import("@/components/three/ChainCoins"), {
  ssr: false,
});

export default function ChainCoinsMount({ label }: { label: string }) {
  if (COIN_CHAINS.length === 0) return null;
  return <ChainCoins label={label} />;
}
