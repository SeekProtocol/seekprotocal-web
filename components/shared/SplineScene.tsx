"use client";

import { useEffect, useRef } from "react";

interface SplineSceneProps {
  url: string;
  className?: string;
}

export default function SplineScene({ url, className }: SplineSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "module";
    script.src =
      "https://unpkg.com/@splinetool/viewer@1.9.82/build/spline-viewer.js";
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {/* @ts-expect-error - spline-viewer is a web component loaded via script */}
      <spline-viewer url={url} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
