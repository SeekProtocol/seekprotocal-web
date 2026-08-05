/**
 * The SEEK mark as vector geometry.
 *
 * Traced from the master logo raster and then symmetrised — the mark is
 * 180°-rotationally symmetric, so each half is the exact negation of the
 * other. Coordinates are y-up in a -1..1 box, ready for THREE.Shape.
 *
 * Shared by the 3D coin and the flat SVG logo so both stay identical.
 */

export type Point = readonly [number, number];

/** Outer silhouette — a hexagonal S, wound clockwise. */
export const MARK_OUTLINE: readonly Point[] = [
  [0.215, 0.992],
  [0.977, 0.301],
  [0.906, -0.031],
  [0.578, -0.137],
  [0.824, -0.367],
  [0.75, -0.695],
  [-0.215, -0.992],
  [-0.977, -0.301],
  [-0.906, 0.031],
  [-0.578, 0.137],
  [-0.824, 0.367],
  [-0.75, 0.695],
];

/** The two enclosed counters, one per half of the S. */
export const MARK_HOLES: readonly (readonly Point[])[] = [
  [
    [0.144, 0.66],
    [0.231, 0.606],
    [0.652, 0.195],
    [0.578, -0.129],
    [0.086, 0.332],
    [-0.004, 0.008],
    [-0.492, 0.465],
  ],
  [
    [-0.144, -0.66],
    [-0.231, -0.606],
    [-0.652, -0.195],
    [-0.578, 0.129],
    [-0.086, -0.332],
    [0.004, -0.008],
    [0.492, -0.465],
  ],
];

/** Brand ramp, sampled from the coin render: magenta rim → violet core → aqua. */
export const MARK_GRADIENT = ["#e341f9", "#8f5cf7", "#5d74f9", "#4fd1e0"] as const;

/**
 * Convert the y-up mark coordinates into an SVG path string in a 0..100
 * y-down viewBox.
 */
export function markToSvgPath(inset = 4): string {
  const scale = (100 - inset * 2) / 2;
  const toSvg = ([x, y]: Point) =>
    `${(50 + x * scale).toFixed(2)} ${(50 - y * scale).toFixed(2)}`;

  const ring = (pts: readonly Point[]) =>
    `M ${toSvg(pts[0])} ` + pts.slice(1).map((p) => `L ${toSvg(p)}`).join(" ") + " Z";

  return [MARK_OUTLINE, ...MARK_HOLES].map(ring).join(" ");
}
