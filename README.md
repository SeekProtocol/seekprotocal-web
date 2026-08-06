# Seek Protocol — website

Marketing site for Seek Protocol and the SeekAR app: an AR and AI platform on
Solana. Next.js 16, React 19, Tailwind v4, eight languages, five three.js
scenes.

Production: <https://www.seekprotocol.ai>

---

## Getting started

```bash
npm install
npm run dev        # http://localhost:3005
```

| Script | Does |
|---|---|
| `npm run dev` | Dev server on port 3005 (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve a finished build |
| `npm run lint` | ESLint |

Developed on Node 22. There is no `engines` constraint, so older versions may
work; nothing has been checked against them.

### Environment

Local secrets live in `.env.local`, which is not committed. Four keys are read
anywhere in the codebase:

| Key | Used by | Needed for |
|---|---|---|
| `RESEND_API_KEY` | `lib/resend.ts` | Sending the beta and contact form mail |
| `TURNSTILE_SECRET_KEY` | `lib/turnstile.ts` | Server-side captcha verification |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Both forms | The captcha widget |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `components/shared/GoogleAnalytics.tsx` | Analytics, only after consent |

Without them the site still builds and every page renders; the two forms are
what stop working.

---

## Layout of the repo

```
app/
  [locale]/          Every page, one route each, under a locale prefix
  api/               beta + contact form handlers
  globals.css        Tokens, type scale, base, motion, layout primitives
  components.css     Header, footer, cards, forms, whitepaper, blog, globe panel
  app-ui.css         Device frames, the recreated app screens, the 3D sections
components/
  three/             The five WebGL scenes
  sections/          Homepage sections, each gating its own scene
  app/               The phone frame and the recreated app screens
  shared/ ui/ layout/ theme/ brand/ business/ whitepaper/
content/             Structured page copy in TypeScript, keyed for translation
messages/            Eight locale JSON files
i18n/                next-intl routing, navigation, request config
lib/                 Data, SEO helpers, render budget, rate limiting, sanitising
public/app/geo/      Pre-built land dots and coastlines for the globe
scripts/build-geo.mjs  Regenerates those two files from Natural Earth
```

`HANDOVER.md` is the long-form record of the rebuild — why each decision went
the way it did, in the order it happened. Read it before changing anything
whose reasoning is not obvious from the code. This README is the orientation;
that file is the argument.

---

## Things that will bite you

**Every route is locale-prefixed.** `localePrefix` defaults to `always`, so
`/about` has no route and would 404. `next.config.ts` maps the unprefixed and
Webflow-era URLs to `/en/...` with permanent redirects, because both shapes are
still in Google's index. Add a page and you should usually add it to that list,
to `app/sitemap.ts`, and to `messages/*.json`.

**Copy lives in two places on purpose.** Prose that needs translating goes in
`messages/<locale>.json`. Structure — the shape of a list, its ids, its
ordering — goes in `content/*.ts`, and `lib/content-i18n.ts` marries the two.
Do not put sentences in `content/`.

**Dark is the default theme.** `#000000`, matching the app's store artwork. A
stored choice always wins. Both the pre-paint script and the provider in
`components/theme/ThemeProvider.tsx` have to change together, or the first
paint disagrees with React and you get a flash.

**No component carries a hard-coded colour.** Everything themes through custom
properties on `:root` and `[data-theme="dark"]`.

**Rarity colours are duplicated by design** across `content/collectibles.ts`
and `lib/globe-drops.ts`, and must be kept in step.

**The SEEK mark is geometry, not an asset.** `lib/seek-mark.ts` holds the
outline, shared by the extruded 3D coin and the flat SVG logo so they cannot
drift.

---

## The 3D scenes and the memory budget

Five three.js scenes: the hero coin, the globe, the orbital descent, the AR
story and the Mobi orb. On a desktop, holding all five is unremarkable. On a
phone it is the single thing most likely to break the site, and it has broken
it before — Safari does not degrade under GPU pressure, it kills the tab, and
the page silently reloads.

Three pieces keep that in check, and they are worth understanding together
before touching any of them:

- **`lib/render-budget.ts`** makes each context cheaper. Pixel ratio capped at
  1.5 on a handheld against 2 on a desktop, antialiasing dropped on handhelds.
- **`lib/use-near-viewport.ts`** makes them fewer. A scene builds one viewport
  before it is reached and, on a handheld, is released once it is well past.
  A scene that latches also evicts any other that is off screen, so a phone
  holds one context rather than however many the layout happens to allow.
  The reach is a number in viewports; build and release margins are both
  derived from it, and must stay that way.
- **`.scene-scrubbed`** in `app/components.css` is `display: none` under
  `(pointer: coarse) and (max-width: 1024px)`. The two scroll-scrubbed sections
  never build on a phone at all. Hidden rather than removed, because they carry
  about 380 words that Google indexes on the mobile rendering. That test must
  stay in step with `isHandheld()`.

Anything new that opens a WebGL context should go through `useNearViewport` and
`rendererOptions()`, and must dispose its geometries, materials, textures and
renderer on cleanup — plus `forceContextLoss()`, since `dispose()` does not
release the context itself.

### When the page reloads itself

`/[locale]/diag` reads a crash log kept in local storage on the device: uncaught
errors, rejections, error-boundary hits, and a breadcrumb of the last known
scroll position, canvas count and drawing-buffer size. It survives a reload,
which the console does not, so a phone can be diagnosed without a cable.

A `reload` entry on its own, at a deep scroll position, means the tab was killed
for memory. A `reload` sitting above an `error` or `boundary` means something
threw, and that entry names it. The page is `noindex` and linked from nowhere.

Nothing is sent anywhere: a local ring buffer of twelve entries, no network
call and no identifier.

---

## The globe's geography

`public/app/geo/land-dots.json` and `coastlines.json` are generated, not
authored. `node scripts/build-geo.mjs` rebuilds them from the `world-atlas`
package. Committed so a build never depends on that step.

---

## Deployment

Vercel, `iad1`. `vercel.json` carries the security headers, the Content Security
Policy and the cache policy — assets under `/images` and `/videos` are served
immutable for a year, so **a changed image needs a new filename**. The CSP has
an explicit allow-list; a new third-party script or frame has to be added there
or it is blocked in production and not in dev.
