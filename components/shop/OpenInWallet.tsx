"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { WalletReadyState } from "@solana/wallet-adapter-base";
import { handoffCode } from "@/lib/shop/auth";

/**
 * A phone browser with no wallet in it (Safari on an iPhone) cannot connect:
 * the wallet lives in its own app, and the adapter's modal only says "You'll
 * need a wallet on Solana to continue" (11-10-2026, a player with Phantom
 * installed). The way through is to open the shop inside the wallet app's own
 * browser, where the wallet is injected. Android keeps the adapter's modal:
 * the Mobile Wallet Adapter reaches the installed wallet from Chrome.
 */
const isPhone = () => typeof navigator !== "undefined" && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

export function walletBrowseLinks(href: string) {
  const url = encodeURIComponent(href);
  const ref = encodeURIComponent(new URL(href).origin);
  return {
    phantom: `https://phantom.app/ul/browse/${url}?ref=${ref}`,
    solflare: `https://solflare.com/ul/v1/browse/${url}?ref=${ref}`,
  };
}

type Asking = { setOpen: (open: boolean) => void; askedToConnect: () => void };
const OpenContext = createContext<Asking>({ setOpen: () => {}, askedToConnect: () => {} });

/**
 * Holds the "open in a wallet app" dialog for the whole shop; mounted in
 * ShopProviders, inside the WalletProvider.
 *
 * It also finishes the adapter modal's choice. Choosing a wallet there only
 * selects it: with autoConnect off (no wallet prompt before the price is read)
 * nothing connected it, so in Phantom's own browser "Phantom, Detected" was
 * tapped and the button stayed at Connect wallet (11-10-2026). A wallet chosen
 * after the player asked to connect is connected here.
 */
export function OpenInWalletProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const wantConnect = useRef(false);
  const { wallet, connected, connecting, connect } = useWallet();
  useEffect(() => {
    if (!wantConnect.current || !wallet || connected || connecting) return;
    wantConnect.current = false;
    connect().catch(() => {});
  }, [wallet, connected, connecting, connect]);
  const askedToConnect = useCallback(() => { wantConnect.current = true; }, []);
  return (
    <OpenContext.Provider value={{ setOpen, askedToConnect }}>
      {children}
      {open ? <OpenInWallet onClose={() => setOpen(false)} /> : null}
    </OpenContext.Provider>
  );
}

/**
 * `ask()` replaces `setVisible(true)`: a wallet already chosen is connected,
 * otherwise the adapter's modal opens where a wallet can be reached (and the
 * choice is connected), and the wallet apps are offered where not.
 */
export function useAskForWallet() {
  const { wallets, wallet, connected, connect } = useWallet();
  const { setVisible } = useWalletModal();
  const { setOpen, askedToConnect } = useContext(OpenContext);
  return useCallback(() => {
    if (wallet && !connected) { connect().catch(() => {}); return; }
    const reachable = wallets.some((w) => w.readyState === WalletReadyState.Installed || w.readyState === WalletReadyState.Loadable);
    if (!reachable && isPhone()) { setOpen(true); return; }
    askedToConnect();
    setVisible(true);
  }, [wallets, wallet, connected, connect, setVisible, setOpen, askedToConnect]);
}

export function OpenInWallet({ onClose }: { onClose: () => void }) {
  const t = useTranslations("shop.openInWallet");
  const [going, setGoing] = useState(false);
  /* The wallet app's browser shares nothing with this one: a signed-in player
     takes the login along as a one-time code in the address. */
  const go = async (app: "phantom" | "solflare") => {
    setGoing(true);
    const target = new URL(window.location.href);
    target.hash = "";
    const code = await handoffCode();
    /* In the query, not the fragment: Phantom drops the fragment (11-10-2026). */
    if (code) target.searchParams.set("shop_handoff", code);
    window.location.assign(walletBrowseLinks(target.toString())[app]);
  };
  return (
    <div aria-labelledby="open-in-wallet-title" aria-modal="true" className="wallet-adapter-modal wallet-adapter-modal-fade-in" role="dialog">
      <div className="wallet-adapter-modal-container">
        <div className="wallet-adapter-modal-wrapper">
          <button type="button" onClick={onClose} className="wallet-adapter-modal-button-close" aria-label={t("close")}>
            <svg width="14" height="14" aria-hidden="true"><path d="M14 12.461 8.3 6.772l5.234-5.233L12.006 0 6.772 5.234 1.54 0 0 1.539l5.234 5.233L0 12.006l1.539 1.528L6.772 8.3l5.69 5.7L14 12.461z" /></svg>
          </button>
          <h1 id="open-in-wallet-title" className="wallet-adapter-modal-title">{t("title")}</h1>
          <p style={{ padding: "0 24px 16px", textAlign: "center", opacity: 0.8, lineHeight: 1.5 }}>{t("lead")}</p>
          <ul className="wallet-adapter-modal-list">
            <li><button type="button" className="wallet-adapter-button" disabled={going} onClick={() => void go("phantom")}>{t("phantom")}</button></li>
            <li><button type="button" className="wallet-adapter-button" disabled={going} onClick={() => void go("solflare")}>{t("solflare")}</button></li>
          </ul>
        </div>
      </div>
      <div className="wallet-adapter-modal-overlay" onMouseDown={onClose} />
    </div>
  );
}
