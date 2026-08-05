import Image from "next/image";
import type { ReactNode } from "react";

/* The stylesheet for the whole phone mockup and the homepage sections around it,
   scoped to this route by being imported here rather than from globals.css. See
   the note there. PhoneFrame is only ever reached from the homepage, so this is
   the narrowest place that still covers everything that needs it. */
import "@/app/app-ui.css";

/**
 * The device mockup. The screen aperture is punched out of the artwork, so the
 * app screen sits behind it and shows through the hole — bezel, Dynamic Island
 * and camera all come from the photograph rather than from CSS.
 *
 * Aperture measured off the file's alpha channel: 1290 × 2790, which matches
 * the iPhone 15 Pro Max panel almost exactly.
 */
const APERTURE = {
  left: 7.843,
  top: 4.051,
  width: 84.314,
  height: 91.897,
};

export default function PhoneFrame({
  children,
  className = "",
  glow = true,
  width = 340,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  /** Rendered device width in px on desktop. */
  width?: number;
}) {
  return (
    <div
      className={`device ${className}`}
      style={{
        ["--device-w-n" as string]: width,
        ["--ap-left" as string]: APERTURE.left,
        ["--ap-top" as string]: APERTURE.top,
        ["--ap-w" as string]: APERTURE.width,
        ["--ap-h" as string]: APERTURE.height,
      }}
    >
      {glow && <span className="device-glow" aria-hidden="true" />}

      <div className="device-screen">
        <div className="device-viewport">{children}</div>
        <span className="device-home" aria-hidden="true" />
      </div>

      {/* 1530x3036 and 350KB, the heaviest single asset on the homepage, and it
          was being shipped at full size to every phone. .device-art already
          sets width:100% and height:auto, so the intrinsic size is only here to
          give the browser the ratio. */}
      <Image
        src="/app/devices/iphone.png"
        alt=""
        loading="lazy"
        decoding="async"
        className="device-art"
        width={1530}
        height={3036}
        sizes="(max-width: 768px) 90vw, 380px"
        aria-hidden="true"
        draggable={false}
      />
    </div>
  );
}

/** iOS status bar — its absence is what makes a mock read as a mock. */
export function StatusBar({ time = "9:41" }: { time?: string }) {
  return (
    <div className="ios-status" aria-hidden="true">
      <span className="ios-status-time">{time}</span>
      <span className="ios-status-right">
        <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor">
          <rect x="0" y="7.5" width="3" height="3.5" rx="0.7" />
          <rect x="4.4" y="5.4" width="3" height="5.6" rx="0.7" />
          <rect x="8.8" y="2.9" width="3" height="8.1" rx="0.7" />
          <rect x="13.2" y="0" width="3" height="11" rx="0.7" opacity="0.4" />
        </svg>
        <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor">
          <path d="M8 9.6 5.9 7.4a3 3 0 0 1 4.2 0L8 9.6Z" />
          <path d="M8 5.1a6 6 0 0 0-4.3 1.8L2.3 5.5a8 8 0 0 1 11.4 0l-1.4 1.4A6 6 0 0 0 8 5.1Z" opacity="0.9" />
          <path d="M8 1.2c-2.8 0-5.4 1.1-7.3 3L0 3.4A11.9 11.9 0 0 1 8 0c3 0 5.9 1.2 8 3.4l-.7.8A10.3 10.3 0 0 0 8 1.2Z" opacity="0.55" />
        </svg>
        <span className="ios-battery">
          <span className="ios-battery-fill" />
        </span>
      </span>
    </div>
  );
}
