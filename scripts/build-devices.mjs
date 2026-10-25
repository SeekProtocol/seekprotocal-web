#!/usr/bin/env node
/**
 * Device frames, iPad captures and Arena feature marks, as web assets.
 *
 *   node scripts/build-devices.mjs ~/Downloads ~/Downloads/watches \
 *     ~/Downloads/seek-protocol-store-2026-10-23/_source/src/ipad ../seekar-app
 *
 * Three jobs:
 *
 *  1. The tablet and watch mockups (the iPad Pro 11 PNGs from Downloads, the
 *     four watches from Downloads/watches). Their screens are already punched
 *     out to transparency, so all that happens is a resize to twice the
 *     largest size they are drawn at, and WebP with full alpha. The apertures
 *     the components position the screens into were measured off these same
 *     files' alpha channels; see `content/devices.ts`.
 *  2. The iPad screens are real iPad Pro 13" captures of the app, the ones
 *     behind the App Store tablet screenshots (`_source/src/ipad/` in the store
 *     kit). Landscape for the Arena, portrait for AR. They are 4:3 and the
 *     iPad Pro 11 frame is not quite, so the components crop a sliver with
 *     object-fit rather than letterbox them.
 *  3. The four marks on the Arena feature tiles, from the app's own arena
 *     art (`assets/arena/` in the app repo).
 *
 * The watch faces are not images: they are drawn live by WatchShow.
 *
 * Needs sharp, which Next already installs.
 */
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const expand = (p) => p.replace(/^~/, homedir());
const [frames, watches, ipad, app] = process.argv.slice(2).map(expand);
if (!frames || !watches || !ipad || !app) {
  console.error('usage: build-devices.mjs <frames dir> <watches dir> <ipad captures dir> <app repo>');
  process.exit(2);
}

const out = (...p) => {
  const file = join(root, 'public', 'app', ...p);
  mkdirSync(dirname(file), { recursive: true });
  return file;
};

/* [source, output name, output width]. Width is about twice the largest
   rendered size, so a 2x screen gets a sharp edge and nothing more. */
const FRAMES = [
  [join(frames, 'apple-ipadpro11-spacegrey-landscape.png'), 'ipad-landscape', 1600],
  [join(frames, 'apple-ipadpro11-spacegrey-right.png'), 'ipad-tilt', 1200],
  [join(watches, 'apple-applewatchultra-alpineband-portrait.png'), 'watch-ultra', 600],
  [join(watches, 'apple-watch-series-5-40-mm-space-grey-aluminum-black-closed-portrait.png'), 'watch-series', 480],
  [join(watches, 'samsung-galaxy-watch-4-black-portrait.png'), 'galaxy-black', 640],
  [join(watches, 'samsung-galaxy-watch-4-pink-gold-portrait.png'), 'galaxy-gold', 640],
];

for (const [src, name, width] of FRAMES) {
  await sharp(src)
    .resize({ width })
    .webp({ quality: 84, alphaQuality: 100, effort: 6 })
    .toFile(out('devices', `${name}.webp`));
  console.log('frame', name);
}

/* [capture, output name, output width]. */
const CAPTURES = [
  ['l-attack', 'arena-attack', 1400],
  ['l-hand', 'arena-hand', 1400],
  ['l-pack-thunder', 'arena-pack', 1400],
  ['l-season', 'arena-season', 1400],
  ['p-ar-pengu', 'ar-pengu', 900],
  ['p-ar-zcat', 'ar-zcat', 900],
  ['p-sol-burst1', 'ar-sol', 900],
];

for (const [src, name, width] of CAPTURES) {
  await sharp(join(ipad, `${src}.png`))
    .resize({ width })
    .webp({ quality: 80, effort: 6 })
    .toFile(out('ipad', `${name}.webp`));
  console.log('capture', name);
}

for (const name of ['pvp-icon', 'clan-war', 'ranks/grand-master', 'shop']) {
  await sharp(join(app, 'assets', 'arena', `${name}.webp`))
    .resize({ width: 256, withoutEnlargement: true })
    .webp({ quality: 84, alphaQuality: 100, effort: 6 })
    .toFile(out('arena', 'marks', `${name.split('/').pop()}.webp`));
  console.log('mark', name);
}
