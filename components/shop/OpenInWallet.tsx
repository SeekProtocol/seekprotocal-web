"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { WalletReadyState } from "@solana/wallet-adapter-base";

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

const OpenContext = createContext<(open: boolean) => void>(() => {});

/** Holds the "open in a wallet app" dialog for the whole shop; mounted in ShopProviders. */
export function OpenInWalletProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <OpenContext.Provider value={setOpen}>
      {children}
      {open ? <OpenInWallet onClose={() => setOpen(false)} /> : null}
    </OpenContext.Provider>
  );
}

/** `ask()` replaces `setVisible(true)`: the adapter's modal where a wallet can be reached, the wallet apps where not. */
export function useAskForWallet() {
  const { wallets } = useWallet();
  const { setVisible } = useWalletModal();
  const setOpen = useContext(OpenContext);
  return useCallback(() => {
    const reachable = wallets.some((w) => w.readyState === WalletReadyState.Installed || w.readyState === WalletReadyState.Loadable);
    if (!reachable && isPhone()) setOpen(true);
    else setVisible(true);
  }, [wallets, setVisible, setOpen]);
}

export function OpenInWallet({ onClose }: { onClose: () => void }) {
  const t = useTranslations("shop.openInWallet");
  const links = walletBrowseLinks(window.location.href);
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
            <li><a className="wallet-adapter-button" href={links.phantom} rel="noopener">{t("phantom")}</a></li>
            <li><a className="wallet-adapter-button" href={links.solflare} rel="noopener">{t("solflare")}</a></li>
          </ul>
        </div>
      </div>
      <div className="wallet-adapter-modal-overlay" onMouseDown={onClose} />
    </div>
  );
}
