import type { ReactNode } from "react";

/**
 * Seamless horizontal scroller. Children are rendered twice and the track
 * translates by exactly -50%, so the loop has no visible seam.
 */
export default function Marquee({
  children,
  speed = 42,
  gap = "3.5rem",
  className = "",
}: {
  children: ReactNode;
  speed?: number;
  gap?: string;
  className?: string;
}) {
  return (
    <div
      className={`marquee ${className}`}
      style={{
        ["--marquee-speed" as string]: `${speed}s`,
        ["--marquee-gap" as string]: gap,
      }}
    >
      <div className="marquee-track" aria-hidden="false">
        {children}
      </div>
      <div className="marquee-track" aria-hidden="true">
        {children}
      </div>
    </div>
  );
}
