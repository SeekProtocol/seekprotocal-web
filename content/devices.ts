/**
 * The tablet and watch mockups, and what is drawn inside them.
 *
 * Frames are built by `scripts/build-devices.mjs`. Every aperture below was
 * measured off the source PNG's own alpha channel (a flood fill from the
 * centre of the punched-out screen), as percentages of the whole image, so
 * they hold at any rendered size. The screens are drawn behind the artwork
 * and a pixel larger on every side, so the bezel covers the seam.
 *
 * Only ids, numbers and artwork live here. Every word is in
 * `messages/<locale>.json` under `arenaSection`, `stepsSection` and
 * `tabletSection`.
 */

export type Aperture = { left: number; top: number; width: number; height: number };

export type FrameSpec = {
  src: string;
  /** Intrinsic size of the built frame, for the ratio. */
  width: number;
  height: number;
  aperture: Aperture;
  /** Logical size the screen is authored at, in CSS px. */
  screen: { width: number; height: number };
};

/**
 * iPad Pro 11, landscape. The aperture is 2388 x 1668 of the 2610 x 1890
 * source, which is the iPad Pro 11 panel exactly, so the screen is authored at
 * the iPad's own 1194 x 834 points.
 */
export const IPAD_LANDSCAPE: FrameSpec = {
  src: "/app/devices/ipad-landscape.webp",
  width: 1600,
  height: 1159,
  aperture: { left: 4.253, top: 5.873, width: 91.494, height: 88.254 },
  screen: { width: 1194, height: 834 },
};

/**
 * iPad Pro 11, portrait, turned away to the right.
 *
 * The screen is not a rectangle in this one, so it is placed with a
 * projective transform rather than an aperture. The four corners are where
 * lines fitted to each straight edge of the punched-out screen meet (the
 * screen's own corners are rounded, so the extreme pixels sit a little inside
 * them), in px of the 2209 x 2253 source:
 *
 *   top left 173.9, 216.9    top right 1459.9, 259.2
 *   bottom left 666.9, 2044.2    bottom right 2009.5, 1979.2
 *
 * `matrix` maps an 834 x 1194 box (the iPad's portrait points) onto those
 * corners, as a CSS matrix3d in the source's px. The component draws the whole
 * stage at the source's size and scales it down as one piece.
 */
export const IPAD_TILT = {
  src: "/app/devices/ipad-tilt.webp",
  width: 2209,
  height: 2253,
  screen: { width: 834, height: 1194 },
  matrix:
    "matrix3d(1.646758, 0.06932479, 0, 0.00007177996, 0.3756638, 1.416271, 0, -0.00005583152, 0, 0, 1, 0, 173.9, 216.9, 0, 1)",
} as const;

export type WatchSpec = FrameSpec & { round?: boolean };

export const WATCHES = {
  /** Apple Watch Ultra, 410 x 502 of 600 x 940. Face drawn at the 49 mm's
      points, its height a little over the aperture's, so the bleed under the bezel
      never shows the top of the next page. */
  ultra: {
    src: "/app/devices/watch-ultra.webp",
    width: 600,
    height: 940,
    aperture: { left: 15.833, top: 23.298, width: 68.333, height: 53.404 },
    screen: { width: 211, height: 263 },
  },
  /** Apple Watch Series, 559 x 681 of 905 x 1579. Face drawn at the 46 mm's points. */
  series: {
    src: "/app/devices/watch-series.webp",
    width: 480,
    height: 837,
    aperture: { left: 19.116, top: 28.436, width: 61.768, height: 43.129 },
    screen: { width: 208, height: 258 },
  },
  /** Galaxy Watch 4, a 678 px circle of 1478 x 1478. Face drawn at 227 dp. */
  galaxyBlack: {
    src: "/app/devices/galaxy-black.webp",
    width: 640,
    height: 640,
    aperture: { left: 27.267, top: 27.537, width: 45.873, height: 45.873 },
    screen: { width: 227, height: 227 },
    round: true,
  },
  galaxyGold: {
    src: "/app/devices/galaxy-gold.webp",
    width: 640,
    height: 640,
    aperture: { left: 27.267, top: 27.537, width: 45.873, height: 45.873 },
    screen: { width: 227, height: 227 },
    round: true,
  },
} satisfies Record<string, WatchSpec>;

/* --------------------------------------------------------------------------
   iPad screens
   -------------------------------------------------------------------------- */

export type Capture = { id: string; src: string; width: number; height: number };

/**
 * Real iPad Pro 13" captures of the app, from the store kit behind the App
 * Store tablet screenshots, built by `scripts/build-devices.mjs`. The Arena
 * set is landscape, the AR set portrait. `id` keys the slide's caption in
 * the message files.
 */
export const ARENA_SLIDES: Capture[] = [
  { id: "match", src: "/app/ipad/arena-attack.webp", width: 1400, height: 1050 },
  { id: "hand", src: "/app/ipad/arena-hand.webp", width: 1400, height: 1050 },
  { id: "pack", src: "/app/ipad/arena-pack.webp", width: 1400, height: 1050 },
  { id: "season", src: "/app/ipad/arena-season.webp", width: 1400, height: 1050 },
];

export const AR_SLIDES: Capture[] = [
  { id: "pengu", src: "/app/ipad/ar-pengu.webp", width: 900, height: 1200 },
  { id: "zcat", src: "/app/ipad/ar-zcat.webp", width: 900, height: 1200 },
  { id: "sol", src: "/app/ipad/ar-sol.webp", width: 900, height: 1200 },
];

/* --------------------------------------------------------------------------
   Seek Arena
   -------------------------------------------------------------------------- */

/** The marks that head the Arena feature tiles, from the app's own art. */
export const ARENA_FEATURES = [
  { id: "live", mark: "/app/arena/marks/pvp-icon.webp" },
  { id: "clanWar", mark: "/app/arena/marks/clan-war.webp" },
  { id: "ranks", mark: "/app/arena/marks/grand-master.webp" },
  { id: "packs", mark: "/app/arena/marks/shop.webp" },
] as const;

/** The match in four numbers, from `lib/arena/rules.ts` and `cards.ts`. */
export const ARENA_FACTS = [
  { id: "cards", value: "260+" },
  { id: "deck", value: "20" },
  { id: "knockouts", value: "5" },
  { id: "clock", value: "45" },
] as const;

/* --------------------------------------------------------------------------
   Steps
   -------------------------------------------------------------------------- */

/**
 * The daily ladder, from `lib/steps/ladder.ts` in the app. Each tier also
 * needs one coin caught that day. Icons are the shop's powerup art.
 */
export const STEP_LADDER = [
  { id: "fitness", steps: 10000, icon: "/app/shop/powerups/icons/fitness.webp" },
  { id: "xpBoost", steps: 16000, icon: "/app/shop/powerups/icons/to_the_moon.webp" },
  { id: "spawnLure", steps: 24000, icon: "/app/shop/powerups/icons/whale.webp" },
] as const;
