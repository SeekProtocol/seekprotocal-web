"use client";

import { useEffect, useRef } from "react";

interface VideoBackgroundProps {
  poster: string;
  mp4: string;
  webm: string;
}

export default function VideoBackground({ poster, mp4, webm }: VideoBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const video = document.createElement("video");
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.autoplay = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("autoplay", "");
    video.setAttribute("data-wf-ignore", "true");
    video.setAttribute("data-object-fit", "cover");
    video.style.backgroundImage = `url("${poster}")`;

    const sourceMp4 = document.createElement("source");
    sourceMp4.src = mp4;
    sourceMp4.type = "video/mp4";
    video.appendChild(sourceMp4);

    const sourceWebm = document.createElement("source");
    sourceWebm.src = webm;
    sourceWebm.type = "video/webm";
    video.appendChild(sourceWebm);

    container.appendChild(video);

    const tryPlay = () => {
      video.muted = true;
      video.play().catch(() => {
        setTimeout(tryPlay, 300);
      });
    };

    if (video.readyState >= 2) {
      tryPlay();
    } else {
      video.addEventListener("canplay", tryPlay, { once: true });
    }

    return () => {
      video.removeEventListener("canplay", tryPlay);
      container.removeChild(video);
    };
  }, [poster, mp4, webm]);

  return (
    <div
      ref={containerRef}
      className="hero-section-phone-screenshot-image w-background-video w-background-video-atom"
      data-autoplay="true"
      data-loop="true"
      data-wf-ignore="true"
      data-poster-url={poster}
      data-video-urls={`${mp4},${webm}`}
    />
  );
}
