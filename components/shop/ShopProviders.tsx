"use client";

import { useMemo, type ReactNode } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import { resolveSolanaRpc } from "@/lib/shop/solana-rpc";
import { OpenInWalletProvider } from "./OpenInWallet";

/**
 * Solana wallet plumbing for the shop, mounted around the signed-in shop only.
 *
 * Same shape as the partner portal's `wallet-providers.tsx`. The wallet list
 * is empty on purpose: every current wallet announces itself through the
 * Wallet Standard and the adapter picks up whatever the browser has. Naming
 * two adapters by hand would offer those two and hide the rest.
 *
 * The RPC is a public endpoint configured in NEXT_PUBLIC_SOLANA_RPC_URL. The
 * page asks it for one thing, a recent blockhash; the wallet broadcasts the
 * transaction itself. Its host has to be in the CSP's connect-src in
 * the request policy; it derives the allowed origin from the same public setting.
 */
export const SOLANA_RPC_URL = resolveSolanaRpc(process.env.NEXT_PUBLIC_SOLANA_RPC_URL);

export default function ShopProviders({ children }: { children: ReactNode }) {
  /* Memoised even though it is empty: adapters hold connection state, and a
     fresh array on every render would drop the wallet mid-signature. */
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={SOLANA_RPC_URL} config={{ commitment: "confirmed" }}>
      {/* autoConnect off: the reader has not asked to be connected to anything
          until they press the button, and a wallet prompt before they have
          read the price is how people close the tab. */}
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider><OpenInWalletProvider>{children}</OpenInWalletProvider></WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
