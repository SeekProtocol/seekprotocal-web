"use client";

import { useCallback, useRef } from "react";
import dynamic from "next/dynamic";
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

const STAGES = [
  {
    at: 0,
    label: "Orbit",
    title: "Every drop is a coordinate",
    body: "Assets are published to points on the planet, not to a feed. From up here that is all the network is: a few thousand places where something is waiting.",
  },
  {
    at: 0.3,
    label: "Descent",
    title: "Falling towards one of them",
    body: "Pick any of those points and go. The protocol does not care which, only that you are standing there when you claim it.",
  },
  {
    at: 0.58,
    label: "Street level",
    title: "This is the same map, four hundred kilometres closer",
    body: "The buildings you are flying over are the ones between you and the drop. Distance is the whole mechanic, so the map has to be the real one.",
  },
  {
    at: 0.82,
    label: "In your hand",
    title: "And it fits in a phone",
    body: "Nothing was swapped out. The view you just flew through is what the app renders, with its own controls over the top.",
  },
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
  const sectionRef = useRef<HTMLElement>(null);
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

  const current = STAGES[stage];

  return (
    <section className="wtp" ref={sectionRef} data-stage={stage}>
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
          <WorldToPhone progressRef={progressRef} />

          {/* The app's own chrome, arriving once the frame is a screen. */}
          <div className="wtp-chrome">
            <StatusBar />

            <div className="map-banner wtp-banner">
              <img src={WIF.image} alt="" className="map-banner-coin" />
              <span className="map-banner-text">
                <b>dogwifhat</b>
                <i>84 m away</i>
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
              {[
                { label: "Home", icon: "home", active: false },
                { label: "Map", icon: "map", active: true },
                { label: "Quests", icon: "quest", active: false },
                { label: "Wallet", icon: "wallet", active: false },
              ].map((tab) => (
                <span key={tab.label} className="tabbar-item" data-active={tab.active || undefined}>
                  <TabIcon name={tab.icon} />
                  <em>{tab.label}</em>
                </span>
              ))}
            </nav>
          </div>
        </div>

        {/* The device, drawn around the closed frame. */}
        <img
          src="/app/devices/iphone.png"
          alt=""
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
              <li key={s.label} data-active={i === stage || undefined} data-done={i < stage || undefined}>
                <span />
              </li>
            ))}
          </ol>
        </div>

        <p className="t-mono-sm wtp-hint">Keep scrolling</p>
      </div>
    </section>
  );
}
