"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { SeekMark } from "@/components/brand/SeekLogo";

const SCHEME_URL = "seekar://";
const IOS_STORE = "https://apps.apple.com/app/seekar/id6752813761";
const ANDROID_PACKAGE = "com.seekar.seekar";
/** How long iOS gets to switch to the app before the App Store is opened. */
const IOS_FALLBACK_MS = 1600;

type Platform = "ios" | "android" | "other";

function platformOf(ua: string): Platform {
  if (/android/i.test(ua)) return "android";
  // iPadOS reports a Mac, but a Mac has no touch screen.
  if (/iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) return "ios";
  return "other";
}

/** The store links, tagged with the campaign the visitor came from. */
export function storeLinks(campaign: string | null) {
  const apple = new URL(IOS_STORE);
  if (campaign) apple.searchParams.set("ct", campaign);
  apple.searchParams.set("mt", "8");
  const play = new URL("https://play.google.com/store/apps/details");
  play.searchParams.set("id", ANDROID_PACKAGE);
  if (campaign) {
    play.searchParams.set("referrer", `utm_source=seek_email&utm_medium=email&utm_campaign=${campaign}`);
  }
  return { appStore: apple.toString(), googlePlay: play.toString() };
}

/** Screens a mail may open directly (`?to=`); anything else opens the app's start. */
const SCREENS = new Set(["referral"]);

/** Android opens the app, or Google Play without an error page when it is missing. */
export function androidIntent(playUrl: string, screen: string | null = null) {
  return `intent://${screen ?? "open"}#Intent;scheme=seekar;package=${ANDROID_PACKAGE};S.browser_fallback_url=${encodeURIComponent(playUrl)};end`;
}

function screenOf(search: string): string | null {
  const value = new URLSearchParams(search).get("to");
  return value && SCREENS.has(value) ? value : null;
}

const noSubscribe = () => () => {};

function campaignOf(search: string): string | null {
  const q = new URLSearchParams(search);
  const value = q.get("utm_campaign") ?? q.get("ct");
  return value && /^[\w-]{1,60}$/.test(value) ? value : null;
}

export function OpenApp() {
  const t = useTranslations("openApp");
  // Read on the device only: the server renders the neutral page, the phone decides.
  const platform = useSyncExternalStore<Platform | null>(noSubscribe, () => platformOf(navigator.userAgent), () => null);
  const campaign = useSyncExternalStore(noSubscribe, () => campaignOf(window.location.search), () => null);
  const screen = useSyncExternalStore(noSubscribe, () => screenOf(window.location.search), () => null);
  const links = useMemo(() => storeLinks(campaign), [campaign]);
  const schemeUrl = screen ? `${SCHEME_URL}${screen}` : SCHEME_URL;

  useEffect(() => {
    const p = platform;
    if (p === "android") {
      window.location.href = androidIntent(links.googlePlay, screen);
      return;
    }
    if (p === "ios") {
      // If the app opens, the page goes to the background and the store is not needed.
      let left = false;
      const away = () => { if (document.hidden) left = true; };
      document.addEventListener("visibilitychange", away);
      window.addEventListener("pagehide", away);
      const timer = window.setTimeout(() => {
        if (!left && !document.hidden) window.location.href = links.appStore;
      }, IOS_FALLBACK_MS);
      window.location.href = schemeUrl;
      return () => {
        window.clearTimeout(timer);
        document.removeEventListener("visibilitychange", away);
        window.removeEventListener("pagehide", away);
      };
    }
  }, [platform, links, screen, schemeUrl]);

  const openHref = platform === "android" ? androidIntent(links.googlePlay, screen) : schemeUrl;

  return (
    <section className="notfound">
      <div className="grid-field grid-field-full" aria-hidden="true" />
      <div className="noise-layer" aria-hidden="true" />
      <div className="shell notfound-inner">
        <div className="notfound-mark" aria-hidden="true">
          <span className="radar-static notfound-ring" style={{ width: "100%" }} />
          <span className="radar-static notfound-ring" style={{ width: "66%" }} />
          <SeekMark size={56} gradientId="open-mark" />
        </div>

        <h1 className="t-h1 notfound-title">{platform === "other" ? t("titleDesktop") : t("opening")}</h1>
        <p className="t-lead notfound-desc">{platform === "other" ? t("desktop") : t("notOpening")}</p>

        <div className="btn-row notfound-actions">
          {platform !== "other" && (
            <a href={openHref} className="btn btn-brand btn-lg">{t("openButton")}</a>
          )}
        </div>
        <div className="store-buttons" style={{ justifyContent: "center", marginTop: 16 }}>
          <a href={links.appStore} className="store-button" aria-label={t("appStore")}>
            {/* eslint-disable-next-line @next/next/no-img-element -- the site's own badge, as on the home page */}
            <img src="/images/app-store.svg" alt="" />
          </a>
          <a href={links.googlePlay} className="store-button" aria-label={t("googlePlay")}>
            {/* eslint-disable-next-line @next/next/no-img-element -- the site's own badge, as on the home page */}
            <img src="/images/google-play.svg" alt="" />
          </a>
        </div>
      </div>
    </section>
  );
}
