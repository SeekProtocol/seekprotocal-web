"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { isHandheld } from "@/lib/render-budget";

/**
 * The product film, acquired rather than simply shown.
 *
 * At rest the block is a black plate with corner brackets and a single bright
 * line across its middle, the way an instrument looks before it has a signal.
 * Scrolling opens an aperture from that line outwards: the two edges travel to
 * the top and bottom of the frame, each carrying its own glow, and the picture
 * arrives between them. Scan lines and grain sit over the image while the
 * aperture is opening and clear once it is open.
 *
 * All of it is driven by one custom property, `--open`, so a scroll frame costs
 * a single style write and no layout. The readout underneath is the video's own
 * clock, not a decoration.
 */
export default function VideoReveal() {
  const t = useTranslations("videoReveal");
  const hostRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [sound, setSound] = useState(false);
  const [clock, setClock] = useState("00:00 / 00:00");
  /* The film is 16 MB. On a desktop it starts itself when it scrolls into
     view; on a phone that is 16 MB of somebody's data plan and a decoder held
     open next to five WebGL contexts, so there it waits to be asked. */
  const [handheld, setHandheld] = useState(false);
  const [started, setStarted] = useState(false);

  /* The scroll effect below runs once and reads both of these from inside an
     observer callback, so they are mirrored into refs rather than listed as
     dependencies: re-running that effect would tear down the scroll listener
     and the clock along with it. */
  const handheldRef = useRef(false);
  const startedRef = useRef(false);

  useEffect(() => {
    const phone = isHandheld();
    handheldRef.current = phone;
    /* One pass, on mount, to swap the poster for the start control. The rule
       warns about cascading renders; this is the one render that cascade is
       for, and it cannot be decided before hydration because it reads the
       pointer type. */
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHandheld(phone);
  }, []);

  const start = useCallback(() => {
    startedRef.current = true;
    setStarted(true);
    videoRef.current?.play().catch(() => {});
  }, []);

  const toggleSound = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const next = video.muted;
    video.muted = !next;
    setSound(next);
    if (next) video.play().catch(() => {});
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    const video = videoRef.current;
    if (!host) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let ticking = false;
    const update = () => {
      ticking = false;
      const rect = host.getBoundingClientRect();
      // 0 while the block is still low in the viewport, 1 once its top has
      // travelled to about a third of the way up.
      const span = window.innerHeight * 0.75;
      const travelled = window.innerHeight - rect.top;
      const open = Math.min(1, Math.max(0, travelled / span));
      host.style.setProperty("--open", open.toFixed(3));
      // Written straight to the DOM rather than held in state: this runs on
      // every scroll frame, and the only thing that reads it is a selector.
      host.toggleAttribute("data-armed", open > 0.65);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    if (reduced) {
      host.style.setProperty("--open", "1");
      host.toggleAttribute("data-armed", true);
    } else {
      update();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
    }

    /* Only play while it is actually on screen, and on a handheld only once
       somebody has pressed play: autoplaying there is what fetches the whole
       file. */
    const observer = video
      ? new IntersectionObserver(
          ([entry]) => {
            if (!entry.isIntersecting) video.pause();
            else if (!handheldRef.current || startedRef.current) {
              video.play().catch(() => {});
            }
          },
          { threshold: 0.15 }
        )
      : null;
    if (video && observer) observer.observe(video);

    const pad = (n: number) => String(Math.floor(n)).padStart(2, "0");
    const stamp = (s: number) => `${pad(s / 60)}:${pad(s % 60)}`;
    const onTime = () => {
      if (!video) return;
      const total = Number.isFinite(video.duration) ? video.duration : 0;
      setClock(`${stamp(video.currentTime)} / ${stamp(total)}`);
    };
    video?.addEventListener("timeupdate", onTime);
    video?.addEventListener("loadedmetadata", onTime);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      observer?.disconnect();
      video?.removeEventListener("timeupdate", onTime);
      video?.removeEventListener("loadedmetadata", onTime);
    };
  }, []);

  return (
    <div className="video-reveal" ref={hostRef}>
      <div className="video-reveal-frame">
        {/* The aperture. Everything inside it is clipped to the opening. */}
        <div className="video-reveal-aperture">
          <video
            ref={videoRef}
            src="/videos/Seekr.mp4"
            poster="/videos/Seekr-poster.jpg"
            loop
            muted
            playsInline
            preload={handheld ? "none" : "metadata"}
          />
          <span className="video-reveal-scanlines" aria-hidden="true" />
          <span className="video-reveal-vignette" aria-hidden="true" />
        </div>

        {/* The two travelling edges, and the seam they start as. */}
        <span className="video-reveal-edge video-reveal-edge-top" aria-hidden="true" />
        <span className="video-reveal-edge video-reveal-edge-bottom" aria-hidden="true" />

        <span className="video-reveal-corners" aria-hidden="true">
          <i /><i /><i /><i />
        </span>

        <div className="video-reveal-hud" aria-hidden="true">
          <span className="video-reveal-hud-tag">
            <span className="dot-live" />
            SeekAR
          </span>
          <span className="video-reveal-hud-clock">{clock}</span>
        </div>

        {handheld && !started && (
          <button type="button" className="video-reveal-play" onClick={start}>
            <PlayIcon />
            {t("play")}
          </button>
        )}

        <button
          type="button"
          className="video-reveal-sound"
          onClick={toggleSound}
          aria-pressed={sound}
        >
          <SoundIcon on={sound} />
          <span className="sr-only">{sound ? t("mute") : t("unmute")}</span>
        </button>
      </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.2v13.6L19 12z" />
    </svg>
  );
}

function SoundIcon({ on }: { on: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 9.5h3.4L12 5.4v13.2L7.4 14.5H4z" />
      {on ? (
        <>
          <path d="M15.6 9.4a3.6 3.6 0 0 1 0 5.2" />
          <path d="M18.2 6.8a7.3 7.3 0 0 1 0 10.4" />
        </>
      ) : (
        <path d="M16 9.8l4.4 4.4M20.4 9.8L16 14.2" />
      )}
    </svg>
  );
}
