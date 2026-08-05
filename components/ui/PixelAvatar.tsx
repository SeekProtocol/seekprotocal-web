/**
 * A pixel-art profile picture, the kind people actually use as a PFP.
 *
 * Generated from a seed rather than shipped as files: an 8-wide grid mirrored
 * down the middle, which is what gives pixel avatars their face-like symmetry,
 * over a flat background in one of a few NFT-ish palettes.
 */

const PALETTES: { bg: string; ink: string; accent: string }[] = [
  { bg: "#1b2f6b", ink: "#7fe0ff", accent: "#02eaa9" },
  { bg: "#3b1550", ink: "#ff9de2", accent: "#ffd166" },
  { bg: "#0f3d2e", ink: "#7cffb2", accent: "#ffe066" },
  { bg: "#4a1f10", ink: "#ffb27f", accent: "#ff5b5b" },
  { bg: "#123047", ink: "#9fd8ff", accent: "#d04cfb" },
  { bg: "#2b2b38", ink: "#c9c9dd", accent: "#02eaa9" },
];

/** Small deterministic hash so the same handle always gets the same face. */
function hash(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export default function PixelAvatar({
  seed,
  size = 36,
  className = "",
}: {
  seed: string;
  size?: number;
  className?: string;
}) {
  const h = hash(seed);
  const palette = PALETTES[h % PALETTES.length];

  const GRID = 8;
  const HALF = GRID / 2;
  const cells: { x: number; y: number; fill: string }[] = [];

  let bits = h;
  const next = () => {
    // xorshift, so consecutive cells do not correlate
    bits ^= bits << 13;
    bits ^= bits >>> 17;
    bits ^= bits << 5;
    return (bits >>> 0) / 4294967296;
  };

  for (let y = 1; y < GRID - 1; y++) {
    for (let x = 0; x < HALF; x++) {
      const roll = next();
      if (roll < 0.42) continue;
      const fill = roll > 0.86 ? palette.accent : palette.ink;
      cells.push({ x, y, fill });
      cells.push({ x: GRID - 1 - x, y, fill });
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${GRID} ${GRID}`}
      className={className}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      <rect width={GRID} height={GRID} fill={palette.bg} />
      {cells.map((cell, i) => (
        <rect key={i} x={cell.x} y={cell.y} width={1} height={1} fill={cell.fill} />
      ))}
    </svg>
  );
}
