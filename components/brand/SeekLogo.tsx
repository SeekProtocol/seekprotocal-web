import { markToSvgPath } from "@/lib/seek-mark";

const MARK_PATH = markToSvgPath(2);

/** The SEEK mark on its own — same geometry as the 3D coin. */
export function SeekMark({
  size = 28,
  className = "",
  gradientId = "seek-mark-grad",
}: {
  size?: number;
  className?: string;
  gradientId?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={gradientId} x1="6%" y1="0%" x2="94%" y2="100%">
          <stop offset="0%" stopColor="#e341f9" />
          <stop offset="42%" stopColor="#7d63f8" />
          <stop offset="72%" stopColor="#5d74f9" />
          <stop offset="100%" stopColor="#4fd1e0" />
        </linearGradient>
      </defs>
      <path d={MARK_PATH} fill={`url(#${gradientId})`} fillRule="evenodd" />
    </svg>
  );
}

/** Mark plus wordmark, used in the header and footer. */
export default function SeekLogo({
  className = "",
  markSize = 30,
  showWord = true,
  gradientId = "seek-logo-grad",
}: {
  className?: string;
  markSize?: number;
  showWord?: boolean;
  gradientId?: string;
}) {
  return (
    <span className={`seek-logo ${className}`}>
      <SeekMark size={markSize} gradientId={gradientId} />
      {showWord && (
        <span className="seek-logo-word">
          Seek<span className="seek-logo-word-light">Protocol</span>
        </span>
      )}
    </span>
  );
}
