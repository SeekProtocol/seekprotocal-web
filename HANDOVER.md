# Handover: website rebuild, 4 to 5 August 2026

> **Second pass, 5 August.** Copy rule, whitepaper expansion, business page
> interactives, custom icons, the video reveal, and a mobile pass. See
> "Second pass" at the bottom for what changed and what it corrected.


Where the site stands, what it is built on, and what is still open.

---

## Working setup

| | |
|---|---|
| Repo | `seekprotocal-web-main` |
| Framework | Next.js 16 (Turbopack), React 19, Tailwind v4 |
| Dev | `npm run dev` → http://localhost:3005 |
| Build | `npm run build` — clean as of this writing |
| Languages | 8 locales via next-intl (`en nl de es fr zh ja ko`) |

The app repo at `/Users/donreijke/Downloads/seekar-app` is the source of truth
for anything the site claims about the product. Its `docs/HANDOVER.md`,
`components/chat/ChatView.tsx`, `components/ar/catch-mechanics.ts` and the
Supabase migrations were all read directly rather than guessed at. Keep doing
that — most of the corrections in this round came from the site inventing
something the app had already decided.

---

## What changed

The Webflow export is gone. `public/css/*.css` (12k lines) is no longer
loaded, and every page was rebuilt on a new design system.

### The design system

Three files, imported in order from `app/globals.css`:

| File | Holds |
|---|---|
| `app/globals.css` | Tokens, type scale, base, motion, glass, layout primitives |
| `app/components.css` | Header, footer, cards, forms, whitepaper, blog, globe panel |
| `app/app-ui.css` | Device frames, the recreated app screens, the 3D sections |

Everything themes through CSS custom properties on `:root` and
`[data-theme="dark"]`. No component carries a hard-coded colour.

**Dark is true black.** `#000000`, matching the app's own store artwork. The
app's handover warns why this matters: a 2–3% white overlay over pure black
lands on `#0A0A0A` and disappears, so every raised surface here is an explicit
value (`--bg-raised: #101014`) rather than a translucent overlay.

**Light is the default**, regardless of the OS setting — the brand is built on
the white surface. Only the toggle changes it. To follow the OS instead, see
the comment in `components/theme/ThemeProvider.tsx`; both the pre-paint script
and the provider have to change together.

### Brand

The gradient is the app's own, from `components/map/webview/orb.ts` and the
logo animation: **magenta `#D04CFB` → blue `#049EFD` → mint `#02EAA9`**.

Rarity colours are the app's two-stop gradients from
`shared/constants/index.ts` — grey, green, cyan, purple, **gold for
legendary**. They live in `content/collectibles.ts` and `lib/globe-drops.ts`
and must stay in step with each other.

Gradient fills were removed from headline text. Emphasis is a solid accent.

### The SEEK mark

`lib/seek-mark.ts` holds the mark as vector geometry — a 12-point outline and
two counters, traced out of `webclip.png` and then symmetrised, because the
mark is 180°-rotationally symmetric and each traced half came back within a
pixel of the other. Shared by the 3D coin (`ExtrudeGeometry`) and the flat SVG
logo, so the two can never drift.

---

## Pages

| Route | State |
|---|---|
| `/` | Rebuilt. Hero, film, walkthrough, collectibles, AR, Mobi, descent, globe, progression, clans, social, CTA |
| `/whitepaper` | New. Sixteen chapters, sticky contents, nine interactive figures |
| `/ecosystem` | New |
| `/roadmap` | New |
| `/business` | New |
| `/about` `/blog` `/contact` `/privacy-policy` `/terms-conditions` `/404` | Ported to the new system, translations kept |
| `/services` | **Deleted.** It carried generic agency boilerplate ("Business Strategy", "Website Creation") that never described the product. 301s to `/business` via `next.config.ts` |

---

## The 3D work

Five separate three.js scenes. All of them lazy-load, pause when off-screen,
cap DPR at 2, and respect `prefers-reduced-motion`.

**`components/three/SeekCoin.tsx`** — the hero coin. Lathe body, extruded
mark, gradient injected via `onBeforeCompile` so the side walls carry it too.
It rocks around a three-quarter view rather than spinning: a full spin passes
through edge-on, where the mark is unreadable.

**`components/three/SeekGlobe.tsx`** — the interactive globe. Real land, real
city coordinates, coin sprites, arcs, projected HTML labels. Coins are
clickable (raycast against the sprites; a drag that moved under 6px counts as
a tap). `focusRef` swings the globe to a named city — it solves the two
rotations that put that point at the camera, and takes the short way round.

**`components/three/WorldToPhone.tsx`** — the descent, orbit to street level
to the phone. One camera, no cut.

**`components/three/ARStory.tsx`** — the AR pipeline, scroll-scrubbed. 2,600
points resolve from noise into a street corner, a plane is found, the anchor
sets.

**`components/three/MobiOrb.tsx`** — the app's actual `orb.glb`. Materials are
rebuilt from the Chinese mesh names because Spline's own materials do not
survive the GLB export. Selective bloom on two layers: the colour cluster is
bloomed, then the glass and eyes are drawn sharp over the top.

### Geography

`scripts/build-geo.mjs` turns Natural Earth data into
`public/app/geo/land-dots.json` (5,466 points) and `coastlines.json`
(42 rings). Re-run it to change the density; `STEP` controls it.

---

## The app screens

`components/app/` recreates SeekAR in the browser: map, spawn, catch, result,
wallet. They are **reconstructions from the app's code, not screenshots.** If
simulator exports appear, they will beat these.

The catch is the app's real one, not a dramatisation:

- Tap to charge a ring inside five seconds
- A round draws freeze, leak, surge, or nothing at all
- Then a roll against the real odds — common 0.58 down to legendary 0.10
- Two attempts, the retry worth 0.65 of the first

Values are in `content/collectibles.ts`, sourced from
`two_attempts_per_spawn` and `game_value_per_coin`.

> ⚠️ This paragraph said *three attempts, each worth half the last* until
> 5 August. It was reading a superseded migration. See "A correction worth
> knowing about" in the second pass below.

---

## Gotchas worth keeping

These cost real time. All are fixed; the reasons are written into the code at
each site.

| Symptom | Cause |
|---|---|
| Whole page shifted left, white strip on the right | `.grid-field` was `inset: -10%`, so 120% wide. In any section without its own clip it pushed the document sideways |
| Sticky sections would break if you "fixed" that with `overflow: hidden` | `hidden` makes the document a scroll container. `overflow-x: clip` does not, and is what is used |
| Press logos rendering as huge grey domes | `max-height: 100%` never resolved: `place-items: center` sizes the grid item to its content, so there was no definite height for the percentage. Some marks rendered at 2,703px wide. The height is absolute now |
| Two press logos still solid blocks | `AP_logo_PNG_1.avif` has a white plate baked in and `bitcoin-mgzn.avif` has no alpha at all. Both are omitted; re-add once cut-out versions exist |
| Pale sliver around the phone screen in light mode | Percentage `border-radius` resolves against different axes, drawing a stretched ellipse far rounder than the real aperture. It is a fixed fraction of the device width now |
| Anchor beam slicing through the coin | Fixed-length cylinder. It is unit-length and stretched per frame to stop at the coin's underside |
| Ground rings and the position dot cut in half | They sat inside building footprints. Drops now stand at road junctions, which is also where a drop belongs |
| Black bands inside the phone screen | The canvas was being scaled down inside a shrinking window. The canvas *is* the frame now, so the camera aspect narrows to portrait and the scene reframes rather than being cropped |
| Mobi as one white smear | Blooming the eyes along with the colour cluster. They render on a separate layer, sharp, after the bloom pass |
| Mobi's eyes stretched across the orb | Blink was setting `scale.y` absolutely instead of multiplying the export's own scale |

---

## Still open

- **Tokenomics figures are placeholders.** `content/whitepaper.ts` carries a
  `DRAFT_FIGURES` flag and the page renders a visible notice. Replace the
  allocation, vesting and supply with the real ones, then set it to `false`.
- **Every page is now translated into all eight locales.** The copy lives in
  `messages/<locale>.json`; `content/*.ts` holds only the structure (ids,
  artwork, numbers, colours) and the components pull the words in by id
  through `lib/content-i18n.ts`. Ecosystem, roadmap, business and whitepaper
  moved from `getSingleLanguageAlternates` to `getMultilingualAlternates`, so
  they self-canonicalise per locale. The blog articles are still English and
  still canonicalise to their `/en` URL.
- **The app screens are reconstructions.** See above.
- **Two press logos need cut-outs.** See above.
- **The copy-protection script is still in `app/[locale]/layout.tsx`.** It
  blocks right-click, selection and Ctrl+C/A/S/U. It sits awkwardly with a
  whitepaper people may want to quote from. Left in deliberately — your call.
- **`public/app` is 17 MB**, mostly video (7.4 MB) and achievement art
  (3.3 MB). Worth trimming before launch if the payload matters.
- **The homepage holds five WebGL contexts** — coin, globe, world-to-phone, AR
  story, Mobi. Each pauses its render loop off-screen, but the contexts stay
  alive and browsers cap the total at around sixteen. It has not misbehaved in
  testing, but if a scene is ever added, consider tearing a context down on
  exit rather than only pausing it.

---

## Fine-tuning notes

Where to reach first for the usual asks:

| Want to change | Look at |
|---|---|
| Any colour, spacing, radius | Tokens at the top of `app/globals.css` |
| Rarity colours or catch odds | `content/collectibles.ts` |
| Cities on the globe | `lib/seek-cities.ts` |
| Land density | `scripts/build-geo.mjs`, then re-run it |
| Descent pacing | `HANDOVER`, `FRAME_FROM`, `FRAME_TO` in `WorldToPhone.tsx`; section height in `.wtp` |
| AR stage copy and timings | `STAGES` in `components/sections/ARSection.tsx` |
| Whitepaper text and figures | `content/whitepaper.ts` |
| Homepage section order | `app/[locale]/page.tsx` — it reads top to bottom |

Section heights drive every scroll-scrubbed scene: `.wtp` is 520vh and
`.ar-section` is 460vh. Shortening them speeds the animation up — there is no
separate duration to tune, the scroll *is* the timeline.

---

## Second pass, 5 August 2026

### The copy rule

**No dashes in user-facing copy.** Not em dashes, not en dashes used as
punctuation. This is the app team's own convention (`seekar-app`'s handover
records two commits on 27 July that stripped them from every locale), and the
site was not following it.

Every occurrence is gone: 268 across the eight message files, plus the content
modules, the blog data and the JSX. Sentences were rewritten rather than having
the dash swapped for a comma, because a comma in place of a dash is often a
splice. Each language took its own mark: `，` for Chinese, `、` for Japanese,
a comma elsewhere, a colon for part titles, `·` for separators.

Ranges read as words now: "5 m to 500 m", not "5 m – 500 m".

Code comments still use them. They are not user-facing.

### A correction worth knowing about

`content/collectibles.ts` was **wrong**, and the homepage and app walkthrough
were repeating it. It claimed three attempts per spawn at a 0.50 decay, from
`rebalance_catch_ladder`. That migration was superseded on 29 July by
`two_attempts_per_spawn`: **two attempts, 0.65 decay**, and the base chances
moved with it. The two levers were changed against each other deliberately, so
the overall odds land on the same curve.

|  | base | 1st | 2nd | overall |
|---|---|---|---|---|
| Common | 0.58 | 60% | 40% | 76% |
| Uncommon | 0.44 | 46% | 31% | 62% |
| Rare | 0.27 | 29% | 20% | 43% |
| Epic | 0.17 | 18% | 13% | 29% |
| Legendary | 0.10 | 12% | 9% | 19% |

The published percentages sit a couple of points above the bare base because
the migration quotes them for a level 5 player with the charge bar filled and
the cold-streak bonus running. `GAME_CONFIG` in `content/collectibles.ts` now
carries those terms.

**The lesson is the one the first handover already gave**: read the app's
migrations, do not trust an earlier copy of them. Check the highest-numbered
migration touching a subject, not the one whose name you recognise.

### Whitepaper

Ten chapters became sixteen, five interactive figures became nine.

New chapters: the claim lifecycle (04), the play loop (07), the business model
(10), governance (11), compliance (14) and a glossary (16). The token chapter
gained a supply schedule. Governance and compliance say plainly what is not
decided yet rather than implying it is.

New figures, all in `components/whitepaper/`:

| Figure | What it is |
|---|---|
| `ClaimTimeline` | Seven stages drawn to the latency budget, coloured by which machine runs them. Plays at real speed |
| `CatchLadder` | `collect-coin/chance.ts` reproduced term for term. Set level 5 and a full ring and it lands exactly on the migration's published table |
| `VestingSchedule` | Stacked circulating supply over 48 months with a month scrubber. **Placeholder figures**, same `DRAFT_FIGURES` flag |
| `Glossary` | Fourteen terms, filterable on the definition as well as the term |

`CatchLadder` is the one to be careful with. It is not an illustration of the
mechanic, it *is* the mechanic, and its constants come from `game_config`. If
the app retunes the ladder, this figure goes wrong silently.

### For business

Two interactives, in `components/business/`:

**`DeployConsole`** replaces the static four-step list, which now lives inside
it. Four decisions, a radius ring drawn to scale against a street plate, a
publish sequence in the real order of operations, then a live campaign with
arrivals coming in on a decaying curve. The arrival figures are a projection
and the caption says so.

**`AttentionFunnel`** is the marketing argument drawn: the same budget spent
two ways, with the display column's last row hatched and labelled *estimated*
because it genuinely does not follow from the clicks above it. Rates are
industry rules of thumb and are printed on the figure.

`HOW_IT_WORKS` was removed from `content/business.ts`; the console owns that
copy now.

### Icons, the live badge, the film

- `components/brand/TechIcons.tsx` replaces four pieces of generic clip-art on
  the about page with icons drawn for what each card claims: a pin over its
  claim radius, camera brackets closing on an anchored asset, a token settling
  to two blocks, a network agreeing at once. One 24-grid, one 1.5 stroke, all
  `currentColor`. The tile carries the brand ramp in its rim.
- **Live states are blue.** `.dot-live` and `.chip-live` were mint, which is
  one stop out of the gradient and on its own read as a second, unrelated
  accent. The globe's marker is now the SEEK mark itself, glowing and throwing
  a ring, with "Live seekers" beside it (`globe.liveLabel`, all eight locales).
- **The film is acquired, not shown.** `VideoReveal` opens an aperture from a
  bright seam at the centre of a black plate: two travelling edges each with
  their own glow, corner brackets that fade, scan lines that clear, colour
  resolving as it opens. A sound toggle and the video's own clock arrive once
  it is open. One custom property, `--open`, drives all of it.

### Mobile

| Symptom | Cause |
|---|---|
| Burger clipped off the right edge of every phone | `.site-header-cta { display: none }` lost the cascade to `.btn`'s own `display`, because globals.css is imported after components.css. Two classes deep now |
| Hero readout orphaned its third figure | A wrapping flex. Three equal columns under 600px |
| AR section nearly empty on a phone | Fixed 38° *vertical* FOV, so a portrait viewport narrowed the horizontal field until the street corner fell outside the frame. The horizontal field is held below 16:9 and the vertical one opens instead. The aim also drops on portrait so the subject rides above the copy rather than behind it |
| Globe labels clipped mid-word | They hang to the right of their pin. Past 130px from the right edge they now flip to the other side (`data-flip`, set by the render loop) |
| iOS zoomed in on the contact form and never zoomed back | Fields were 15px. Anything under 16px triggers it. 16px on any coarse pointer |
| Mono chips were 25px tall | Under half a thumb. 38px on a coarse pointer. They grow rather than getting an invisible overlay, because overlapping hit areas between wrapped rows steal each other's taps |
| Roadmap rail ate a fifth of the screen | 2.5rem plus a 1.5rem gutter for a dot and a line. Tightened, not dropped: the line is what makes the phases read as a sequence |

The hero subtitle was also cut from three sentences to two in all eight
locales. The third restated the first.

### Still open, on top of the first list

- **`VestingSchedule` is placeholder data**, like the donut. Both clear
  together when `DRAFT_FIGURES` goes false.
- **The new whitepaper chapters are English only**, like the rest of
  `content/*.ts`.
- **`CatchLadder` and `content/collectibles.ts` must track the app.** If a
  migration retunes the ladder, both go stale and nothing will complain.
- **Pre-existing lint errors remain** in the three.js components and
  `TokenomicsDonut` (`react-hooks/immutability`, `react-hooks/refs`). None are
  from this pass and the build is clean. Worth a sweep at some point.

---

## Third pass, 5 August 2026, evening

### The scroll stutter, measured rather than guessed

A profile of the descent section found **184 ms of forced synchronous layout in
90 scroll frames**, all of it from one place: `SiteEffects` read
`document.documentElement.scrollHeight` on every scroll frame. By that point in
the frame the scrubbed sections had already written their own custom
properties, so the read flushed a layout of a 25,000 px document carrying five
WebGL contexts. Every frame.

The document does not change height while you scroll. It is measured once now,
and re-measured from a `ResizeObserver` and the resize event. **The forced
reflow insight disappears from the trace entirely.**

Three more things came out of the same profile:

- `SiteEffects`' `MutationObserver` ran a whole-document `querySelectorAll` on
  every mutation anywhere. The scrubbed sections re-render their copy at each
  stage, so it was firing mid-scroll. Now coalesced to one rescan per frame,
  and only when nodes were added.
- **`rise` and `.reveal` animated `filter: blur()`.** Chrome refuses to
  composite that (`FILTER_RELATED_PROPERTY_MAY_MOVE_PIXELS`) and drops the
  animation onto the main thread. Both are opacity and transform only now, with
  a hair of scale standing in for the softness. If you are tempted to put the
  blur back, this is why it went.
- The stage copy in the AR and descent sections reserves a min-height. Each
  stage runs to a different length, and the progress track under it was moving
  every time the copy swapped.

`.wtp-frame` also gained `contain: layout paint`, since it resizes on every
frame while it closes.

### Mobi

**He faced away on arrival.** The pointer offset was unclamped and the listener
is on `window`, so a cursor parked a few stage-widths away produced a look
target of 6 and a rotation of 2.5 radians. `tanh` bounds it: the head turns and
never spins round, and with no pointer movement he is square on to the reader.

**Tapping now does something.** `MobiOrb` takes a `pulse` counter; every
increment fires one impulse that punches the body, spins the colour cluster,
flashes the bloom and throws three staggered shockwave rings (drawn sharp over
the bloom, clipped to nothing, sized to stay inside the frustum). Around it:
a targeting reticle that snaps closed, a scan line crossing the orb, and the
waveform answering the hit. All keyed off `data-struck`, re-stamped per tap so
a rapid second tap replays rather than being swallowed.

### The deploy plate

Was a flat grid of grey squares. Now a plausible city: varied blocks with
depth, a park, a canal, a diagonal avenue, roads that actually read, a radar
sweep rotating inside the claim ring, tick marks on the axes, claims landing
inside the ring once it is live, and a proper pin.

The scale bar is drawn **inside the SVG**, in the same units as the ring. Laid
out in HTML it resolved its percentage against a shrink-to-fit box and
collapsed to its minimum width.

One trap worth remembering: `.deploy-plate-roads path` out-specifies
`.plate-road-main`, so a shared rule on the group painted every road one
colour and made them invisible. The individual roads are addressed through the
group now.

### Colour

Live markers and index labels are brand blue. Mint is kept for *states that
mean something*: shipped on the roadmap, a perfect catch, an anchor locked. The
descent eyebrow, the descent progress track and the AR stage index were mint
and are now blue.

---

## Fourth pass, 5 August 2026, late

### The scrubbed sections are damped now

`lib/use-scrubbed-section.ts` is one shared hook, used by both the descent and
the AR story. The important line is that **the scroll position is the target,
not the value**. Read straight through, a trackpad flick or a wheel's discrete
notches land on the camera unfiltered and the scene moves in the same steps the
input arrives in. The hook eases toward the scroll instead, at
`1 - pow(1 - 0.16, dt * 60)` so a 120 Hz screen and a 60 Hz one get the same
animation rather than one converging twice as fast.

It also carries the stage hysteresis (resting exactly on a threshold used to
flip the copy back and forth) and pauses its loop off screen.

**One trap it cost to find:** the measure must stay live even when the loop is
paused. Gating `measure()` on visibility meant the scroll that brought the
section into view was consumed before the observer had turned the loop back on,
and the target stayed where it was until the next scroll event. The section
simply never started.

Also on the descent: the device, frame and chrome share a slow idle float once
it has landed, because a still render of a phone reads as a screenshot. The
"keep scrolling" hint needed `animation: none` as well as `opacity: 0` to go
away, since `hint-drift` animates opacity and an animation beats a plain
declaration however specific it is.

### Store buttons

68px with the brand ramp painted into the border box, which is what the old
site did and why they held their own against black. A hairline on white
disappeared at this size. The hover glow is three coloured shadows offset
across the pill rather than a blurred pseudo: a `z-index: -1` pseudo sits
behind the button's own background, and the hover transform creates a stacking
context that traps it anyway.

### New section: what else can be placed

`components/sections/OffersSection.tsx` and `content/offers.ts`, on the
homepage between collectibles and how-it-works.

Five formats, each **drawn as the artefact it would be** rather than as a
bullet with an icon: the voucher tears off along a perforation and carries a
code, the access pass has a barcode edge, the collectible a rarity ribbon, the
asset a serial, the token a stamped coin. Picking one opens the two questions a
publisher actually asks, which are how it redeems and what stops it being
redeemed by someone who was never there.

No real merchant names anywhere in it, deliberately: a card reading like a
named brand's live offer would be a claim about a partnership rather than an
illustration of a format.

On a phone the row becomes a snapping horizontal rail. The cards stop being
legible below about 180px, so squashing five into a grid was not an option.

---

## Fifth pass, 5 August 2026, evening

### The descent is one continuous flight now

The old version's comment claimed there was no cut and there was one. The globe
lived in its own frame at radius 1 and the city in another at a span of 40, and
each drove the camera with its own formula. At `HANDOVER` the camera teleported
from a metre above a one-metre planet to thirty-four metres above a city, and a
crossfade was laid over the join to hide it.

They share one space now:

- The planet is a sphere of **620 city units** with its north pole 0.7 units
  under the ground plane, so the ground the buildings stand on *is* the
  planet's surface. Nothing is switched on or off along the way.
- **One exponential altitude curve**, 1850 units down to 12. Exponential
  because that is what a descent is: equal scroll should buy equal *proportion*
  of the height that is left. A linear ramp spends most of its length in space
  and then slams into the ground.
- The camera tips from straight down to a three-quarter view as it falls, and
  **banks** into the drift. Straight down at the top is what makes the join
  invisible: from directly above, a sphere and a plane look the same once you
  are close enough.
- `logarithmicDepthBuffer`, because the scene now spans a 10 cm kerb and a
  planet 2,500 units away.

**Lit windows** are the single change that stopped the city reading as a bar
chart. Injected into the Lambert material with `onBeforeCompile`: floors banded
off world height, columns off whichever horizontal axis faces the camera, a
hash of the two deciding which are on, two lamp temperatures. No texture, no
extra draw call, and it survives the buildings being scaled as they grow
because everything derives from world position.

**Fog is a depth cue, not a curtain.** Density is `0.28 / altitude`, which
holds the *amount* of haze steady across the whole flight. The first attempt
capped the density and the cap, tuned at street level, buried the city
completely from a hundred units up. Hiding the city from orbit is `cityIn`'s
job.

The **ground plane** carries a radial alpha fade. Any plane large enough to
read as ground from a few hundred units up shows its own straight edge
somewhere in frame; faded out before the rim it simply stops being there and
the planet's curve carries on behind it.

Two perf things: the 147 building instance matrices were being decomposed and
re-uploaded **every frame for the rest of the section**, long after they had
finished growing. They now only run while the value is moving. And a dead
`themeRef` that nothing read is gone.

### Smaller

- **The phone does not float.** It was given a slow drift on the theory that a
  still render reads as a screenshot. It reads as a phone that will not sit
  still, which is worse, and what is inside the screen is already moving.
- The map banner shows the **dogwifhat coin**, not the SEEK coin, since
  dogwifhat is what it names. Its title is explicitly white: it was inheriting
  the page colour, which on the light theme is near-black on dark glass.
- **Coloured side rules are gone** from the Mobi line and the offers panel.
  They read as stickers on the side of a panel rather than part of it. The
  colour is a lit top rim plus a breath of tint from the top edge, which is the
  same "lit from above" idiom the glass surfaces use.
- The token card carries the **real SEEK coin render** instead of a drawn disc.

---

## Sixth pass, 5 August 2026, night: the mobile sweep

Audited every page at 390 x 844 with a touch pointer: horizontal overflow,
tap-target height and field font size, scrolling the whole page first so the
reveal observers had fired.

**Result: no horizontal overflow on any of the eight pages.** The remaining
sub-34px targets are inline links inside prose (19 to 21px), which is what an
inline link is, and the coin markers inside the phone mock, left at the app's
own size on purpose.

Fixed in this pass:

| Symptom | Cause |
|---|---|
| The descent's copy printed across the phone's own map | Side by side is a desktop composition. On a phone the device now shrinks to 66% and rides up, and the copy takes the bottom third with a bottom-up scrim instead of the left-to-right one |
| Then: the app chrome floated in the middle of the phone | The lift was applied twice. `.wtp-chrome` is a **child** of `.wtp-frame`, so the frame's lift already carries it. It takes only the scale |
| Before that: the frame and the chrome lifted by different amounts | The lift was a percentage, and the three elements are three different heights. It is `--ph-lift`, an absolute pixel value derived from the device height once |
| Power-ups were a ragged masonry | A wrapping row of content-width chips. Two columns under 900px, one under 600px |
| Store badges stranded in a full-width pill | 38px artwork in a 66px button under 480px |
| Sliders were a 6px-tall hit area | The box is 34px on a coarse pointer with the visible track painted as a centred 6px background |
| Team LinkedIn links at 30px | 36px minimum on a coarse pointer |

The transform arithmetic is the thing to remember. `translate(-50%, …) scale(k)`
about an element's own centre does **not** scale the translation: `scale()`
here is origin-centred and the translation composes out in page pixels. Half an
hour went into dividing by `k` and wondering why the tab bar had moved.

---

## Seventh pass, 5 August 2026, night

### Dark is the default now

`themeInitScript` falls back to dark rather than light, and
`app/[locale]/layout.tsx` renders `data-theme="dark"` so the server and the
first client render agree. A stored choice still wins, so anyone who has
picked light keeps light.

The reasoning: the product is a night map, every 3D scene on the site is lit
for black, and the store artwork is black. Dark is the version the work was
designed in.

**To follow the operating system instead**, replace the fallback in
`themeInitScript` with
`matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"`.
Nothing else has to change.

**Making dark the default is what surfaced the footer bug below.** Anything
that only ever looked wrong in dark had never been the first thing a visitor
saw. Worth a sweep of the light-only assumptions if more turn up.

### The footer social icons were green

`twitter.svg` ships as a **#9407CB filled disc** with the mark knocked out of
it, not as a glyph. The dark theme inverted it, and inverting purple gives
green. Flattening it with `brightness(0) invert(1)` was worse: it filled the
whole disc white and the mark disappeared.

Both are drawn inline as paths in `currentColor` now. No filter, no theme fork,
one weight. The lesson generalises: **check whether an icon asset is a glyph or
a badge before applying any filter to it.**

### The rest

- **The blue band above the map inside the phone** was the atmosphere shell
  filling the top of the portrait strip. The sky now fades out with `framed`,
  because the app does not render sky. Note that `atmosphere.opacity = 1` was
  being assigned every frame and doing nothing: a `ShaderMaterial` ignores
  `material.opacity`. It has a `uFade` uniform now.
- **The AR section's coin** is a dark render on a black street and vanished on
  a phone. It has an additive halo behind it, so the thing the section is about
  is the brightest object in the frame.
- **The offers rail auto-advances on phones**, every 3.6s while it is on
  screen, and stops for good on the first tap, drag or focus. Two of the five
  cards are past the edge and a scroller with no affordance is one nobody
  scrolls. Desktop lays all five out, so it does not run there.
- **App Store and Google Play badges are in the footer**, under the blurb,
  instead of being text links in a list between the token dashboard and the
  privacy policy.

---

## The AR coin: a note on chasing the wrong cause

It looked dark. Two attempts to fix the sprite got nowhere, and both were
wrong for instructive reasons.

**First attempt: a gamma curve on the texture.** `seek-coin-3d.png` was assumed
to be a dark render. It is not: open it and it is a black coin body carrying a
vivid pink-to-blue mark and a bright rim. Worse, gamma below 1 pulls every
channel toward white, so it *desaturated* the mark and made it grey. Grey is
worse than dark. That work was deleted.

**Second attempt: a bigger sprite and an additive second pass.** Better in
principle, and the additive pass is worth keeping, because adding a sprite to
itself scales each channel by what is already there: the black body gains
almost nothing, the mark and rim roughly double, and the hue is untouched
because the *ratios* between channels do not change. But it barely showed.

**The actual cause was CSS.** `.ar-sticky::before` on phones was a full-height
black ramp reaching **85% at the halfway mark**, which is exactly where the
drop hovers. The coin was under a near-opaque scrim and nothing done to the
sprite could win against it. The wash now clears the middle of the frame and
comes in under the copy, the way the descent's already did.

The lesson: **when something looks wrong in a 3D scene, check what is painted
over it before touching the scene.** Two rounds of shader and texture work went
into a problem that was one gradient stop.

The coin is also sized off the frame's aspect now (`coinK`, set in `resize`).
Portrait wants it large because the copy is stacked underneath; landscape wants
it smaller because the copy sits beside it, and a portrait-sized coin runs
straight through the paragraph.

---

## Globe labels and the chrome over them

The projected city labels declutter against **each other** and knew nothing
about the HTML sitting on top of the globe, so the live badge and the
leaderboard were being written straight through. It showed worst on a phone,
where the globe is barely wider than a single label and the badge takes the
whole top-left corner: "Amsterdam" landed directly on "Live seekers".

`measureChrome()` in `SeekGlobe` now reads the bounding box of every
`.globe-live` and `.globe-leaders` element once, seeds the declutter's `placed`
array with enough points to cover each box end to end, and the per-frame loop
starts from that instead of from empty.

**Measured on resize, never per frame.** These are layout reads, and a layout
read inside a render loop is exactly what made the descent stutter. None of
this chrome moves while you scroll.

Anything else added over the globe should get a class in that selector list, or
it will be written through the same way.

---

## Roadmap and whitepaper navigation

### One 2026 block, not two

Everything the team is working on landed in 2026: TGE, major partnerships, live
events, seasons, gamified object scanning, plus network effects moving forward
from 2027. Solana Mobile is out. The drag-and-drop campaign builder is shipped.

That first produced **two rows both labelled 2026**, which is wrong for a
timeline. A timeline's job is to answer *when*, and two rows with the same date
make a reader stop and work out why they are separate. The answer was grouping,
and a heading says that better than a duplicated date does.

Phases now take an optional `group` on an item, which opens a labelled run
inside the phase. 2026 is one row titled "Opening it up" with **Supply side**
and **Network effects** as groups. Governance is 2027 and beyond.

The whitepaper's chapter 15 was updated to match: it had the builder coming
*after* the portal, when the builder is done and the portal is not.

### The whitepaper reader on a phone

The sticky contents column has nowhere to go on a narrow screen, and the
fallback was a static list above the article. That means the only way to reach
another chapter is to scroll back to the top of a twenty-eight minute document,
which is the one thing a contents list exists to prevent.

`ReaderChrome` now renders, under 980px:

- a **bar pinned to the bottom** with the chapter you are in, its number out of
  sixteen, and the same reading progress the desktop rail shows. It slides away
  when the article body is not what is on screen, so it never sits over the
  hero or the end CTA
- a **sheet of all sixteen chapters** on tap, opening scrolled to where you are,
  closing on select, on scrim, and on Escape, with the page behind it locked

The static list is hidden there rather than kept as well: sixteen chapters
ahead of the first paragraph is a screen and a half of contents before the
document starts. Desktop is untouched.
