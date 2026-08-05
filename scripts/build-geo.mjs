// Build a land dot-matrix and simplified coastlines from Natural Earth data,
// so the globe shows the actual continents instead of a bare graticule.
import fs from "node:fs";
import { feature } from "topojson-client";

const topo = JSON.parse(fs.readFileSync("node_modules/world-atlas/land-110m.json", "utf8"));
const land = feature(topo, topo.objects.land);

/** All outer+inner rings, as [lon, lat] arrays. */
const rings = [];
for (const f of land.features ?? [land]) {
  const g = f.geometry ?? f;
  const polys = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
  for (const poly of polys) for (const ring of poly) rings.push(ring);
}
console.log("rings:", rings.length);

// --- point in polygon over every ring (even-odd) --------------------------
function inRing(lon, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

// Bounding boxes make the sweep tractable.
const boxes = rings.map((r) => {
  let x0 = 180, y0 = 90, x1 = -180, y1 = -90;
  for (const [x, y] of r) {
    if (x < x0) x0 = x; if (x > x1) x1 = x;
    if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  return [x0, y0, x1, y1];
});

function isLand(lon, lat) {
  let inside = false;
  for (let i = 0; i < rings.length; i++) {
    const [x0, y0, x1, y1] = boxes[i];
    if (lon < x0 || lon > x1 || lat < y0 || lat > y1) continue;
    if (inRing(lon, lat, rings[i])) inside = !inside;
  }
  return inside;
}

// --- even-area sampling ---------------------------------------------------
// Constant spacing on the sphere: fewer samples per row near the poles.
const STEP = 1.45; // degrees between rows
const dots = [];
for (let lat = -84; lat <= 84; lat += STEP) {
  const circumference = Math.cos((lat * Math.PI) / 180);
  const perRow = Math.max(6, Math.round((360 / STEP) * circumference));
  for (let i = 0; i < perRow; i++) {
    const lon = -180 + (360 * i) / perRow;
    if (isLand(lon, lat)) dots.push([+lat.toFixed(2), +lon.toFixed(2)]);
  }
}
console.log("land dots:", dots.length);

// --- coastlines, simplified ----------------------------------------------
function rdp(pts, eps) {
  if (pts.length < 3) return pts;
  let maxD = 0, idx = 0;
  const [ax, ay] = pts[0], [bx, by] = pts[pts.length - 1];
  const dx = bx - ax, dy = by - ay;
  const len = Math.hypot(dx, dy) || 1;
  for (let i = 1; i < pts.length - 1; i++) {
    const [x, y] = pts[i];
    const d = Math.abs(dy * x - dx * y + bx * ay - by * ax) / len;
    if (d > maxD) { maxD = d; idx = i; }
  }
  if (maxD > eps) return rdp(pts.slice(0, idx + 1), eps).slice(0, -1).concat(rdp(pts.slice(idx), eps));
  return [pts[0], pts[pts.length - 1]];
}

// A closed ring starts and ends at the same point, so RDP on the whole ring
// measures every vertex against a zero-length baseline and collapses it.
// Split at the midpoint and simplify each half instead.
function simplifyRing(ring, eps) {
  const mid = Math.floor(ring.length / 2);
  const a = rdp(ring.slice(0, mid + 1), eps);
  const b = rdp(ring.slice(mid), eps);
  return a.concat(b.slice(1));
}

const coasts = rings
  .filter((r) => r.length > 14)
  .map((r) => simplifyRing(r, 0.45).map(([lon, lat]) => [+lat.toFixed(2), +lon.toFixed(2)]))
  .filter((r) => r.length > 5);

console.log("coastline rings:", coasts.length, "points:", coasts.reduce((n, r) => n + r.length, 0));

fs.mkdirSync("public/app/geo", { recursive: true });
fs.writeFileSync("public/app/geo/land-dots.json", JSON.stringify(dots));
fs.writeFileSync("public/app/geo/coastlines.json", JSON.stringify(coasts));
console.log(
  "dots:", (fs.statSync("public/app/geo/land-dots.json").size / 1024).toFixed(0) + "kb",
  "coasts:", (fs.statSync("public/app/geo/coastlines.json").size / 1024).toFixed(0) + "kb"
);
