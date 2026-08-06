"use client";

import Image from "next/image";
import { useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { withCopy } from "@/lib/content-i18n";
import { useNearViewport } from "@/lib/use-near-viewport";
import { StatusBar } from "@/components/app/PhoneFrame";
import { TabIcon } from "@/components/app/screens/MapScreen";
import { useScrubbedSection } from "@/lib/use-scrubbed-section";
import { COLLECTIBLES } from "@/content/collectibles";

const WorldToPhone = dynamic(() => import("@/components/three/WorldToPhone"), {
  ssr: false,
});

/** Phone geometry, in the same numbers PhoneFrame measures from the artwork. */
const PHONE_W = 330;
const PHONE_H = Math.round(PHONE_W * (3036 / 1530));
const AP_W = Math.round(PHONE_W * 0.84314);
const AP_H = Math.round(PHONE_H * 0.91897);

/** The scroll stops. The copy for each lives under `worldDescent`. */
const STAGES = [
  { id: "orbit", at: 0 },
  { id: "descent", at: 0.3 },
  { id: "street", at: 0.58 },
  { id: "hand", at: 0.82 },
];

const STOPS = STAGES.map((s) => s.at);

/** The coin the banner is pointing at, so the artwork matches the name. */
const WIF = COLLECTIBLES.find((c) => c.key === "wif") ?? COLLECTIBLES[0];


/**
 * The descent, framed. The 3D never stops or cuts — the viewport around it
 * closes down to the size of a phone screen and the device is drawn around
 * it, so the world you flew through becomes the thing in your hand.
 */
export default function WorldDescent() {
  const t = useTranslations("worldDescent");
  const tabs = useTranslations("appChrome");
  const stages = withCopy(t, STAGES, ["label", "title", "body"]);
  const sectionRef = useRef<HTMLElement>(null);
  /* Gated at the section rather than inside the scene. The scene's own
     useNearViewport stops it building, but a rendered dynamic() still fetches
     its chunk, and all five scenes share one 603 KB bundle with three.js in
     it. Holding the render back holds the download back with it. */
  const nearScene = useNearViewport(sectionRef, "150% 0px");
  const stageRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);

  const apply = useCallback((p: number) => {
    const node = stageRef.current;
    if (!node) return;
    // The frame only starts closing once the city has arrived.
    const f = Math.min(1, Math.max(0, (p - 0.72) / 0.22));
    const eased = f * f * (3 - 2 * f);
    node.style.setProperty("--f", eased.toFixed(4));
  }, []);

  const stage = useScrubbedSection({
    sectionRef,
    progressRef,
    stops: STOPS,
    onProgress: apply,
    restingProgress: 0.6,
    restingStage: 2,
  });

  const current = stages[stage];

  return (
    <section className="wtp scene-scrubbed" ref={sectionRef} data-stage={stage}>
      <div
        className="wtp-stage"
        ref={stageRef}
        style={{
          ["--ph-w" as string]: `${PHONE_W}px`,
          ["--ph-h" as string]: `${PHONE_H}px`,
          ["--ap-w-px" as string]: `${AP_W}px`,
          ["--ap-h-px" as string]: `${AP_H}px`,
        }}
      >
        {/* The window onto the scene, closing down to a phone screen. */}
        <div className="wtp-frame">
          {nearScene && <WorldToPhone progressRef={progressRef} />}

          {/* The app's own chrome, arriving once the frame is a screen. */}
          <div className="wtp-chrome">
            <StatusBar />

            <div className="map-banner wtp-banner">
              <Image src={WIF.image} alt="" width={30} height={30} className="map-banner-coin" />
              <span className="map-banner-text">
                <b>dogwifhat</b>
                <i>{t("bannerDistance")}</i>
              </span>
              <span className="map-banner-x">✕</span>
            </div>

            <div className="map-hud map-hud-left">
              <span className="hud-btn hud-mobi">
                <span className="hud-mobi-orb" />
              </span>
            </div>

            <div className="map-hud map-hud-right">
              <div className="hud-btn hud-stack">
                <span className="hud-zoom">+</span>
                <span className="hud-divider" />
                <span className="hud-zoom">−</span>
              </div>
              <div className="hud-btn hud-mode">3D</div>
            </div>

            <nav className="tabbar">
              {["home", "map", "quests", "wallet"].map((tab) => (
                <span
                  key={tab}
                  className="tabbar-item"
                  data-active={tab === "map" || undefined}
                >
                  <TabIcon name={tab === "quests" ? "quest" : tab} />
                  <em>{tabs(tab)}</em>
                </span>
              ))}
            </nav>
          </div>
        </div>

        {/* The device, drawn around the closed frame. */}
        <Image
          width={1530}
          height={3036}
          sizes="(max-width: 1024px) 60vw, 420px"
          src="/app/devices/iphone.png"
          alt=""
          loading="lazy"
          decoding="async"
          className="wtp-device"
          aria-hidden="true"
          draggable={false}
        />

        <div className="wtp-copy shell">
          <p className="eyebrow">
            <span className="dot-live" />
            {current.label}
          </p>
          <div key={stage} className="wtp-stage-copy">
            <h2 className="t-h2">{current.title}</h2>
            <p className="t-lead">{current.body}</p>
          </div>

          <ol className="ar-track" aria-hidden="true">
            {STAGES.map((s, i) => (
              <li key={s.id} data-active={i === stage || undefined} data-done={i < stage || undefined}>
                <span />
              </li>
            ))}
          </ol>
        </div>

        <p className="t-mono-sm wtp-hint">{t("hint")}</p>
      </div>
    </section>
  );
}
