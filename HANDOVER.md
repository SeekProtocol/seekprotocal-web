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
| Languages | 9 locales via next-intl (`en nl de es fr zh ja ko tr`) |

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

---

## Eighth pass, 16 August 2026: every chain, and the distribution argument

The site said "the first AR and AI platform on Solana" in thirty places. The
protocol has never required one chain, and the app had already stopped being
single-chain, so the copy was describing a decision nobody had made.

### What the app actually says

Read before writing any of it, per the rule at the top of this file:

| In `seekar-app` | What it means |
|---|---|
| `networks` is a **table**: `chain`, `chain_id`, `rpc_url`, `explorer_url`, `is_active`, `sort_order` | Every network the protocol settles on is a row. Adding one is configuration, not a release |
| `token_networks` maps an asset to networks, with contract address and decimals per network | One asset, many chains |
| `SUPPORTED_CHAINS = ['solana', 'ethereum']`, and `networks_chain_check` allows the same two | **Address families, not networks.** A wallet is a Solana keypair or an EVM one, and every EVM network shares the second |

So Ethereum, BNB Smart Chain and Arbitrum are three rows against one wallet,
not three integrations. That is the honest version of "every chain", and it is
what the whitepaper's architecture chapter now argues.

### The roster is the single source of truth

**`content/chains.ts`** holds the four networks with a `status` of `live` or
`soon`. `ChainRoster` (homepage and business page), `llms.txt` and every
"settles on ..." sentence read it, so a chain going live is one edit.

Ethereum and Solana are `live`, from the app's own constants. BNB Smart Chain
and Arbitrum are `soon`, because the production `networks` rows could not be
read from this repo and a chain listed as live on a public site is a claim.
**Flip `status` when those rows are confirmed.**

One place is prose rather than data and needs the same edit:
`roadmapPhases.scale.items.multichain`, in all nine message files, names which
networks the 2026 rollout covers. The comment in `chains.ts` says so.

### What changed in the copy

Thirty strings per locale, times nine. The pattern throughout is that
settlement is described by its **requirement** rather than by a chain name:
"settles on the chain the asset already lives on, against one requirement,
that picking up a small reward must not cost more than the reward is worth."

- `/` hero eyebrow was the hard-coded string `AR · AI · Solana`. It is
  `home.heroEyebrow` now, because the third term became a claim rather than a
  proper noun and a claim has to be translatable.
- Meta titles, OG card, `manifest.ts`, `lib/seo.ts` alt text, the JSON-LD on
  `/about` and `/seekar`, and the keyword list in `layout.tsx`.
- `lib/blog-data.ts` titles and bodies. **The slug
  `what-is-seek-protocol-first-ar-ai-platform-solana` stays**: it is the
  published URL of a December 2025 article, and renaming it to match the copy
  would break every inbound link to buy a tidier path.
- `WalletScreen`'s mock holdings were SEEK, SOL and BONK, three Solana tokens
  under a sentence claiming assets come from anywhere. BONK became ETH, so the
  recreation shows one holding per address family, which is what the app is.
- Two Solana mentions survive on purpose: the Foundation roadmap item, because
  Solana genuinely was the first settlement layer and that is history, and
  `tokenFacts.chain`, because $SEEK is an SPL token.

### New: the distribution section

`components/sections/DistributionSection.tsx` and `content/distribution.ts`, on
the homepage between the offer formats and how-it-works. That ordering is
deliberate: the section above answers *what* a publisher can place, this one
answers why placing it beats buying reach for the same money.

Three parts:

1. **Three failure/answer pairs**, drawn as pairs rather than written as a
   paragraph, because the argument is a correspondence. The bought column is
   hatched, the same way the funnel figure marks its estimated row.
2. **The brief.** Pick what you want people to do and the drop card and the
   receipt line both change while the verification underneath does not. This is
   the "the call to action is yours" claim, made by letting someone do it
   rather than by asserting it. Five asks: walk in, follow, sign up, scan, mint.
3. **The chain roster**, from `content/chains.ts`.

The button on the drop card is a `<span>`, not a `<button>`. It is a picture of
the control a seeker sees; the thing it stands for happens in the app, and a
control that looks pressable and does nothing is worse than one that never
invited the tap.

`components/brand/ChainMarks.tsx` draws the four network marks on the same
24-grid as `TechIcons`. They are **filled rather than stroked**, unlike the
rest of the icon set, because that is how each network draws its own mark and
one reproduced in outline reads as a different logo. An id with no mark falls
back to a ring with the network's initial, so adding a chain never renders an
empty tile.

### Business page

A new section between the funnel and the use cases, on the unit rather than the
money: no bot traffic, organic by construction, your call to action. It ends
with the chain roster, because "which chain is your asset on" is the last
question before a campaign gets scoped. `INTERACTION_CLAIMS` in
`content/business.ts`.

### Whitepaper: sixteen chapters became seventeen

**Chapter 03, "Why paid reach cannot deliver a real person."** Every metric on
the market is a proxy; filters raise the cost of a fake claim and a real one by
different amounts and only the ratio matters; presence is different in kind
because its cost is not computational. It ends on what this does *not* solve,
which is that somebody paid to walk past a door is a real arrival and a poor
customer.

**Chapter 06's settlement section was rewritten.** "Why Solana" is now "Why the
settlement layer is not fixed", and it gained a block: the requirement, then
how it is configured, then the trade. The old single paragraph argued the trade
about one chain. Spreading across several does not remove the outage risk, it
only stops one network's outage being the protocol's, and the chapter says so
in those words.

Chapter indices renumber from `CHAPTER_IDS`, and `readingMinutes` went to 31.
Nothing hard-codes "sixteen"; the reader chrome counts the array.

### The trap this pass hit

`i18n/client-messages.ts` carries an allowlist of namespaces that reach the
browser, and its own comment warns that a client component asking for a
namespace not on it throws `MISSING_MESSAGE`. `DistributionSection` carries
"use client". The build still exited 0 and printed 648 of them, one per page
per locale, which is the failure mode worth remembering: **`next build`
succeeding is not evidence that next-intl found its messages.** Grep the build
log for `MISSING_MESSAGE` after adding any client component that reads copy.

### Verified

Clean build, no missing messages, no lint or type errors. The new section was
checked at 1440px in both themes and at 390px with a touch pointer: no
horizontal overflow, the pairs stack with the arrow turning to point down them,
the five asks become a wrapping row above the card they change, and the choice
buttons measure 51px against the 38px floor.

One thing the screenshots teach: the cookie-consent overlay is a
`rgba(0,2,6,0.55)` fixed layer over the whole document, so any headless capture
of a light-theme page comes back looking grey. Remove
`.CookieConsent-module__*__overlay` before shooting, or spend an hour deciding
the tokens are broken when they are not.

---

## Ninth pass, 16 August 2026: the chain coins

A row of real 3D coins above the chain strip, so "we settle on any chain" is
something you can see rather than a list of names.

### Getting a stock coin into the site

The models come from iconscout as `.blend`. **`scripts/export-coin.sh`** is the
whole pipeline:

```
scripts/export-coin.sh ~/Downloads/whatever.blend bnb
```

It opens the file in a background Blender, never writes to it, and produces
`public/app/3d/coins/<name>.glb`. Then add `coin: "<name>.glb"` to that chain in
`content/chains.ts` and the row picks it up. A chain with no model is simply not
drawn, and the flat strip carries it either way, so coins can land one at a time.

What the script does and why, since the numbers drove every choice:

| Step | Why |
|---|---|
| Drops cameras and lights | They are the stock render's. The site lights its own stage |
| Applies modifiers first | These files lean on Mirror and Bevel, so the bounds are wrong until that geometry is real |
| Joins to one object | Separate materials survive as separate primitives. One node to animate rather than a hierarchy to keep in step |
| Normalises to a 1-unit diameter | Every coin arrives the same size, so the component needs no per-file magic number |
| Decimates to 18% | See below |
| Draco | See below |

**Decimation was measured, not guessed.** The BNB coin arrives at 54,644
triangles with the bevels applied, which is far past what a coin drawn about
120px across can show. Renders at 100%, 30% and 18% were put side by side and
18% is indistinguishable, down to the edges of the logo. That is 9,834 triangles
and it takes the GLB from 1.9 MB to 65 KB. `RATIO` in the script if a coin with
finer detail ever looks chewed.

**Draco earns its decoder.** Gzipped, one coin is 65 KB compressed against
204 KB plain, and the decoder is 89 KB shared across all of them. Four coins:
349 KB with Draco, 816 KB without. It stays. The decoder lives at
`public/app/3d/draco/` and is copied from `three/examples/jsm/libs/draco/`;
**re-copy it when three is upgraded**, since a decoder older than the loader is
a runtime failure with no build-time warning.

### The scene

`components/three/ChainCoins.tsx`, one slot on the shared stage, so it costs no
WebGL context.

**They rock rather than spin**, for the reason the hero coin already documents:
a full rotation passes edge-on, and a coin edge-on is a sliver with no logo on
it. A row of them would be unreadable a third of every cycle, and being read is
the row's whole job. Each swings through a three-quarter view, phase-offset
across the cycle rather than by a fixed step, so a fifth coin cannot land in
lockstep with the first.

**The layout folds.** One row is the intent. `frame()` reads the slot's aspect
and drops to two columns when a single row would put the coins under about 60px,
which is what four coins across a phone would do. The CSS gives it a box shaped
to fold into; the scene decides.

### Two things that cost time

**The coin came out bronze.** The first attempt pushed metalness to 0.92, on the
theory that gold is a metal. At that value almost none of the base colour
reaches the diffuse term, so the coin stops being gold-coloured and becomes a
mirror of the room. The stock 0.5 is what makes it gold; leave the exported
material alone and change the room instead. What it did need was a brighter
environment than `SeekCoin`'s, which is built to light a near-black body, plus
ACES tone mapping, because the stage defaults to none and a polished metal
clips its rim to a flat white band.

**`ssr: false` is not allowed in a Server Component.** The lazy import started
inside `ChainRoster`, which renders on the client through the homepage and on
the server on `/business`. Dev served the homepage happily and the production
build failed on the business page alone. It lives in
`components/brand/ChainCoinsMount.tsx` now, which exists only to be that
boundary. **`next dev` passing says nothing about which side of the boundary a
shared component is on.**

---

## Tenth pass, 16 August 2026: the rewards stage

The chain coins went in as GLB and came back out again. The section that
replaced them is the point of this pass: one wide scene that says the drop can
be anything, using real artwork instead of drawn stand-ins.

### The assets

`scripts/build-rewards.py` turns a folder of stock renders into web assets:

```
python3 scripts/build-rewards.py ~/Downloads/rewards
```

Eighteen 3000x3000 PNGs, **250 MB, become 420 KB**. Three steps, each worth
more than the last: trim to the alpha bounding box, which is up to 40% of the
pixels and is also what makes "fit the box" mean "fit the subject"; resize the
long edge to 640, which covers 2x at the size these are drawn; encode AVIF with
`avifenc` at `-q 58 --qalpha 100`, lossless alpha over a lossy colour plane,
because these are cut-outs and a soft alpha edge is what stops them looking
pasted on.

`CATEGORY` in that script is the only enumeration of the set. A file in the
folder that it does not know is **not built**, and the run says so. Add the
category there and the id to `content/rewards.ts`.

The two live event screens are the app's own, 402x874, which is exactly the
aperture ratio `PhoneFrame` measures off the device artwork, so they drop in
with no cropping. They are upscaled 2x on conversion because 402 is all that
exists; it holds at the drawn size and sharper exports would replace them
without any other change.

### The stage

`components/sections/RewardsSection.tsx`, on the homepage where `OffersSection`
used to be.

**Every reward is mounted once and never unmounted.** Choosing a category does
not swap what is on the stage, it re-ranks it: the chosen category takes the
four front slots and everything else redistributes behind, smaller, dimmer and
softer. That is what makes an uneven set survive. NFTs has one artwork and
tokens has six, and a layout that emptied the stage for one and filled it for
the other would flash between a crowd and a void on every switch. Here only the
ordering changes, so a switch reads as depth rather than as a repaint.

**Two elements per reward, and they cannot be merged.** The outer one carries
the slot transform, which React sets and CSS transitions. The inner one carries
the idle drift, which is a keyframe animation. A keyframe animation on
`transform` beats an inline `transform` outright, so a single element would
drift correctly and then refuse to move between slots.

**Live events is not a sixth kind of reward.** It is every kind, handed out at a
time and a place, so selecting it sends the whole field back and lifts the phone
rather than reshuffling anything. `data-events` on the stage.

The one line under the panel that answers "what stops someone claiming who was
never there" is outside the panel on purpose: the answer does not change with
the category, and the section it replaced asked the question five times over.

### The bug this pass found

**`PhoneFrame` had made its own responsive rules dead.** It took `width = 340`
and always wrote `--device-w-n` inline, and an inline custom property outranks
any rule in a stylesheet, so the `@media (max-width: 1200px)` and
`(max-width: 520px)` steps in `app-ui.css` had never once applied: the device
was 340px wide on a 390px phone. `width` is optional now and the variable is
only written when it is passed. Nothing else renders the default export today,
so this was free to fix.

### What happened to the 3D coins

The GLB pipeline from the ninth pass still works and is still documented above.
It is just not on the page: the rewards stage shows the chain coins as artwork,
and a second spinning coin two sections further down was the same picture told
twice for a 340 KB Draco decoder. The row is off because
`DistributionSection` stopped passing `coinsLabel` to `ChainRoster`. Pass it
again and the row comes back.

`public/app/3d/coins/` and `public/app/3d/draco/` are still in the repo and
nothing requests them. **Delete both, and `scripts/export-coin.*`, if the 3D
route is not coming back.**

### The tap, added the same day

The stage got a second gear: the participate button does something.

**The button is painted into the screen artwork**, so the control is a
transparent overlay sized to the pill. Its box is measured off the source file
rather than eyeballed: on the 402x874 panel the pill runs x 20..381, y 774..829,
which is `left: 4.98%; top: 88.56%; width: 89.8%; height: 6.41%`. **Re-measure
if the screens are ever re-exported.** There is a one-line numpy check in the
scratchpad approach: threshold the bottom quarter above 238 on all channels and
take the contiguous run of rows wider than 40% of the frame, which separates the
pill from the home indicator.

Tapping it runs a four-step sequence, all timeouts tracked so a reader who
scrolls away mid-flight does not come back to a stale alert opening over them:

| ms | what |
|---|---|
| 20 | `data-pull` on the stage. Every reward collapses onto the phone |
| 620 | the alert rises out of the screen, as the field lands |
| 4200 | alert closes |
| 4600 | field returns to its slots |

The pull **overrides the slot coordinates** rather than animating each item's
own transform. That is the payoff of the two-element structure the section
already needed: the drift keeps running underneath and the collapse composes
over it.

The alert lives *inside* the device viewport so the aperture clips it, which is
what sells it as coming out of the phone rather than floating over it.

Two things that were invisible on the first attempt, both for the same reason:
**the pill is white**. The tap glyph was a bare white hand on it, and the ring
leaving it was white. The hand sits on a dark circular badge now, straddling the
pill's right edge, and the ring is brand blue, which reads against the pill and
against the screen's gradient at once.

The live chip carries the SEEK mark and the brand ramp painted into its border
box, the store-button trick: a hairline in one colour disappears against a
screen that is already every colour.

**The rail advances on its own**, and now says so: a 2px bar under the active
tab fills over one dwell. It is keyed on the category so it restarts, and it is
not rendered at all once the reader has taken over, because then it would be
counting down to nothing.

`auto` is state rather than a ref, and that is deliberate. It began as
`takenOver.current`, which lint caught: a ref read during render does not
re-render when it changes, so the progress bar would have kept counting after
the reader had taken the wheel.

### More WOW, and two lessons in what animates what

The catch was too polite: a 4.5% recoil and a glow. It is now four things at
once, deliberately on four different properties so none of them fight:

| | property | why there |
|---|---|---|
| Recoil | `scale` | Its own property in modern CSS, so it composes with the centring |
| Shake | `transform` | Free to own it outright, since `translate` and `scale` are separate properties. Amplitude decays across the run: that is the difference between a phone that was hit and a phone that is vibrating |
| Halo flare | a child element | Blooms to 1.75 with `brightness(2.6)` and holds a beat, so the glow is still up when the alert arrives |
| Shockwaves | three siblings | Outside the frame, since their job is to reach past its edges. Staggered 120ms and coloured across the brand ramp |

Plus a screen flash, which is a child of the *viewport* so the aperture clips
it. Over the device instead it reads as a sheet laid on the phone rather than
the screen firing.

**Lesson one: a rotating rectangle sweeps its own diagonal.** The live chip's
halo is a blurred conic gradient, and the first version animated `rotate` on it.
The element is about 200x48, so rotating it swings a circle of radius 105px, and
its corners threw a bar of blurred light up over the paragraph above the stage.
It looked like a spotlight and took three probes to pin down, because it only
appeared while the chip was mid-rotation. It animates `hue-rotate` now: the
colours travel through the same ramp and the silhouette never moves.

**Lesson two: a blend mode inside a promoted layer blends against the wrong
backdrop.** The screen flash was `mix-blend-mode: screen`, which was fine at
rest. The shake animates `transform` on an ancestor, that promotes it to its own
compositing layer, and the blend then composited against a backdrop that is not
the one on screen. Plain alpha at a higher opacity is indistinguishable here and
cannot do that. **If an effect only misbehaves during an animation, suspect
layer promotion before suspecting the effect.**

**The chip was given all of that too, and it was taken straight back off.** It
briefly carried the hue-cycling halo, two staggered rings, a hover and a glow on
the mark. Every part worked on its own and together they were noise: a label the
size of a thumbnail cannot run four simultaneous animations and still read as a
label. It is back to the SEEK mark, the ramp in the border box and one slow
ring, and it moved from `-1.1rem` to `-2.6rem` so there is real air between it
and the device. The lesson about the rotating rectangle is worth keeping even
though the halo it belonged to is gone.

### The failure mode that cost the most here

Reverting the chip was done with a Python string splice from `.rewards-live {`
to the comment that starts the tap block, and **everything between those two
points went with it**: the rail, the tabs, the panel, the proof line, the
`[data-events]` rules and every media query the section had. The page still
built, still had balanced braces, still passed lint and typecheck, and looked
completely correct on a desktop, because most of what was deleted only shows up
under 900px or on the rail.

CSS has no compiler to catch this. **After any scripted edit to a stylesheet,
grep for the selectors that were supposed to survive**, not just the ones that
were supposed to change:

```
for sel in .rewards-rail ".rewards-tab {" .rewards-panel; do
  printf "%-24s " "$sel"; grep -c "$sel" app/components.css; done
```

The symptom to recognise: unstyled controls plus a layout that is right on
desktop and wrong on a phone means a chunk of stylesheet is missing, not that
the responsive rules are wrong.

### The payoff: found on the map

Tapping participate now tells a whole story rather than a flourish, and the
last beat is the one that was missing. The full sequence, all timeouts tracked
so scrolling away mid-flight cannot leave a stale screen opening:

| ms | what |
|---|---|
| 20 | the field collapses into the phone, which recoils, shakes, flares and throws three shockwaves |
| 620 | the alert rises out of the screen: a mystery reward is near, other seekers are moving |
| 2700 | the alert closes |
| 3050 | the win screen fades up: the map, the route walked, the reward found at the end of it |
| 7400 | it fades out |
| 7900 | the rewards fly back to their slots |

**The reward is drawn at random** from all nineteen, by `randomReward()` in
`content/rewards.ts`, so two taps rarely land on the same thing. Names are in
`messages` under `rewards.items`: twelve are proper nouns and are byte-identical
in every locale, seven are common nouns and are translated. That split is why
adding the win screen cost seven strings a locale rather than nineteen.

`FoundScreen` is a **layer over** the static event screen, not a replacement, so
nothing loads or lays out when it arrives. The map is drawn, in the same idiom
`MapScreen` uses, and deliberately quiet: it is a backdrop for the reward, not a
map to read. The trail draws itself on with `stroke-dashoffset`, which leads the
eye to the spot rather than letting it find it.

Three things that needed a second pass:

- **The map was invisible.** Blocks at `#111118` on `#08080c` are a texture, not
  a plan. They are `#181822` on `#0a0a10` now, with the roads lifted to `#26262f`
  and the park given some green.
- **The pin rings pulsed where nobody could see them.** They were 34% wide and
  `.found-prize` is 52%, so they were entirely behind the artwork. 86% now.
- **The reward name has to survive nine locales**, from `$SEEK` to
  `Zapatillas edición limitada`. `.found` is a `container-type: inline-size` and
  the name is `clamp(1.05rem, 9cqw, 1.5rem)`, so it sizes against the phone
  screen. A viewport unit would have gone tiny on desktop, where the screen is
  small and the viewport is not.

### The map became a real map

The win screen's drawn SVG street plan is gone, replaced by a Mapbox render of
the Eiffel Tower, cropped to the aperture's ratio and centred on the tower.
`FOUND_MAP` in `content/rewards.ts`.

The drawing was perfectly legible. It was also obviously a diagram, and the
moment this screen is selling is *this happened in a real place*, which a
diagram cannot say however well it is drawn.

Processing: crop 521x1132 out of the 1825x1132 source at x=640, which is where
the tower stands, then up to 640x1391 and AVIF at q62. 78 KB. It is darkened
and cooled in CSS rather than in the file (`brightness(0.72) saturate(0.92)`),
so the asset stays reusable at full strength, and two scrims sit over it: dark
at the top for the status bar, dark at the bottom for the copy, clear through
the middle where the reward lands and the map still has to be a map.

**Two things this change dragged with it.**

`rewards.foundWhere` said "New Avenue 13", which came from the event screenshot.
Against a picture of the Eiffel Tower that reads as a mistake, so it is
"Champ de Mars" now, which is on the crop and is about the distance the line
claims. The live event screen above it still says New Avenue 13; those are two
different moments and nobody has ever read both in one glance, but if the map is
ever re-cropped somewhere else, this line moves with it.

**Attribution is not optional.** This is Mapbox imagery and their terms require
the logo and copyright line to stay visible. The crop removes the logo baked
into the source's bottom left, so the screen carries `rewards.mapCredit`
("© Mapbox © OpenStreetMap") instead, small and dim at the bottom edge. The
comment on `FOUND_MAP` says the same thing. **Do not delete that line without
first establishing what licence this render came under.**

### Paying for it, as its own beat

The sequence now opens with the SEEK coin leaving the field, landing on the
participate button, and a mint tick confirming it. Only then does everything
else get pulled in.

That order matters more than it sounds. Running the payment and the payoff
together lost the payment entirely: 500 SEEK disappeared into a general
commotion and the button may as well have been decorative. Paying for a thing
and getting the thing are two events, and an interface that respects the first
one is the difference between a flourish and a transaction.

| ms | what |
|---|---|
| 20 | the SEEK coin leaves its slot for the button |
| 760 | it lands and is spent; the tick pops and draws its check |
| 1400 | the field collapses into the phone |
| 2000 | the alert |
| 4400 | the win screen |
| 9250 | reset |

**The landing point is measured, not written down.** The button lives inside
the phone and the coin lives in the field, and no fixed percentage relates the
two across breakpoints. On tap, the component reads both bounding boxes and
writes `--pay-x` / `--pay-y` onto the field. Measured **against the field and
not the stage**, because the field is inset on a phone (`inset: 2% 7%`) and the
slots are percentages of it; against the stage the coin missed by about its own
width on mobile. Verified at 390px: the coin's centre lands on the button's to
the pixel in both axes.

Two things the flight needed that were not obvious:

- **Full strength for the duration.** On any category but tokens the SEEK coin
  sits in a back row at a third opacity behind two pixels of blur, and a coin
  nobody can see cannot be seen to be spent. `opacity: 1; filter: none` for the
  flight, whatever slot it started from.
- **It has to land before it goes.** The first version faded it from 0.5s over
  a 0.58s flight, so it was half gone on arrival and the payment read as the
  coin evaporating. The fade is delayed to 0.64s of a 0.7s flight now: it
  arrives, then it is spent.

### Making "you found it" readable

It was mint type at 0.6rem over a photograph of Paris, and it lost. Two changes,
and the second is the one that mattered:

- The bottom scrim now reaches past the top of the copy before it starts fading
  (0.97 at the edge, still 0.94 at 26%, gone by 58%). It used to be clear by
  44%, which put the label on the Eiffel Tower's own map pin.
- **The label went through two versions.** First a mint pill with a check in it,
  which was legible and read as every success toast ever shipped. It is the
  site's own eyebrow device now: mono, uppercase, letterspaced, in mint, between
  two rules that draw outward as it lands. `.eyebrow` puts one rule on the left;
  centred over a phone screen it wants both. A glow carries it instead of a
  plate, which works because the real problem was never the missing box, it was
  the scrim underneath.

The trail also moved *under* the scrim. It was above it, so the route stayed at
full brightness straight through the copy block and competed with it. Under it,
it fades out towards the bottom of the screen, which is also what a route
arriving from somewhere else ought to do. Layer order in `.found` is map,
trail, scrim, pin, prize, copy, credit.

### The chain strip was arguing against itself

Four tiles reading Ethereum LIVE, Solana LIVE, BNB Smart Chain NEXT, Arbitrum
NEXT sat under a heading claiming the protocol is chain-agnostic. What it
actually communicated was "we support exactly these four, and two of them do not
work yet", which is a compatibility matrix, not an open set.

Three changes:

- The legend is **"Any source, any blockchain"**. `source` matters as much as
  `blockchain` here: the reward can come from a project, a brand, a venue or the
  shop on the corner, and the section above it has just spent six categories
  proving that.
- **The strip ends open.** A fifth tile, dashed, with a plus instead of a logo:
  "Any other chain". Dashed rather than solid, because a solid border would make
  it the fifth supported chain instead of the statement that there is no fifth
  position to be in.
- **The per-tile status is gone.** Which chains settle today is still a fact and
  is still stated, one sentence into the note underneath, where it informs
  rather than caps the claim above it.

`content/chains.ts` keeps `status` regardless: `llms.txt` reads it, and the
roadmap item still needs to know. The strip simply stopped being the place that
displays it. `chainLive` and `chainSoon` are gone from all nine message files,
replaced by `chainAny`.

### Real chain marks

The four hand-drawn marks in `ChainMarks.tsx` are gone, replaced by the
networks' own official SVGs, inlined. Each is under 2 KB, so inlining means the
strip paints with the page instead of five requests landing after it.

**They are badges, not glyphs.** Every one is a filled circle with the mark
knocked out of it, in the network's own colours. Nothing here takes
`currentColor` and nothing here may ever be given a filter, which is the lesson
`twitter.svg` already taught this codebase in the seventh pass: it is a purple
disc rather than a glyph, and inverting it for the dark theme turned it green.
The tile also stopped drawing a rounded-square plate behind them, because a
square under a circle is two backgrounds arguing.

Two things the swap needed:

- **The gradient ids had to be namespaced.** The supplied `binance.svg` and the
  Arbitrum file both declare `id="linear-gradient"`. SVG ids are global to the
  document, so inlining them unchanged makes the second one's fill resolve to
  the first one's definition and BNB comes out Arbitrum navy. Every id now
  carries its chain's name.
- **A hairline around the badge.** Ethereum's disc is `#f2f2f2` and the light
  theme's tile is `#ffffff`, so without a ring the disc vanishes and the black
  diamond floats on nothing. It is on all four rather than only Ethereum,
  because a ring on one badge out of five is a ring you notice. On dark it is
  invisible, which is the point.

`AnyChainMark` is the exception and stays `currentColor`: it is a plus, and a
plus is a glyph.

### The live badges carry the mark now

`components/brand/LiveMark.tsx`. The SEEK mark replaced `.dot-live` in the four
places that badge a live state: the drop card, the clan board, the film's HUD
tag and the deploy console's plate. A blue dot said "something is happening"
without saying whose, and these are the four spots where a reader is looking at
the product doing something.

`.dot-live` stays, and is still right in the two places it is left: the hero's
signal-lock readout, where it is a GPS indicator rather than a badge, and the
descent's eyebrow, where it is a typographic bullet and a mark would fight the
heading beside it.

The mark cannot pulse the way the dot did without wobbling a shape that has to
stay readable at 13px, so `.mark-live` breathes a glow instead.

**Gradient ids, again.** `SeekMark` fills from a `linearGradient` it defines
itself and SVG ids are global to the document, so every one of the four passes
its own. Auditing that turned up a collision that was already there:
`SeekLogo` defaults to `seek-logo-grad` and both the header and the footer
rendered it, on every page. Both pass a distinct id now. Two identical
gradients render the same, so nothing looked wrong; the day one of them takes
different stops the other repaints with it and nothing says why.

Worth keeping as a check, since this pass hit id collisions twice:

```
[...document.querySelectorAll('linearGradient[id]')].map(g => g.id)
  .filter((v, i, a) => a.indexOf(v) !== i)
```

### The walkthrough's map screen is a real map too

Same move as the win screen, and for the same reason: the drawn SVG street plan
was accurate to the app's own layout and still read as a diagram, which is the
one thing a map screen cannot afford to look like.

`scripts/build-app-map.py` takes a Mapbox render and writes two plates, both
cropped to the aperture ratio:

| | |
|---|---|
| `map-day.avif` | the render as supplied, 80 KB |
| `map-night.avif` | darkened and tinted, 28 KB |

**Night is what ships.** Every other screen in the walkthrough is dark, and the
coin glows, the cyan route and the vignette drawn over this were all built for a
night map; the day plate makes the heads-up chrome compete with the map's own
labels. `APP_MAP` in `content/rewards.ts` is one line to switch, and both plates
are in the repo.

**The night version is composited at build time, not filtered in CSS**, and
that distinction is the whole reason the script exists. A CSS filter either
washes the map out or, if it reaches for `invert`, turns the parks magenta and
the water orange. Inverting a hue is not the same as turning the lights off.
Darkening the luminance, easing the saturation back and multiplying a deep
blue-black over the top keeps green green.

What stayed on top of the photograph: the route, the vignette, the spawns, the
me-dot and all the chrome. The only structural change is that `.map-canvas` now
holds the route alone and had to move above the new scrim.

Attribution again, and it took two goes to place: at `bottom: 68px` the credit
line sat behind the tab bar. The bar is 62px tall and sits 18px up from the
screen edge for the home indicator, so anything under 80px is hidden. It is at
84px, in the gap between the bar and the hint pill.

### Map sharpness: two mistakes in the pipeline

Both map plates looked soft, and two things in `scripts/build-app-map.py` were
doing it:

- **It upscaled.** `EDGE` was a target rather than a cap, so a 567px crop was
  resized *up* to 640. That adds no detail, costs bytes, and softens every
  street label, which is the one thing on a map that has to survive. It is a cap
  now: 880, which covers the phone screen at 3x, and anything smaller is left at
  its native size.
- **It encoded at q62.** These plates are dense fine type at exactly the size a
  street name is drawn, and AVIF spends its error budget there first. At 62 the
  labels smear into the roads. q72 now. The Tokyo night plate went from 28 KB to
  33 KB for it, which is nothing.

`FOUND_MAP` had both problems and was rebuilt the same way, 640 down to its
native 521.

**What actually decides sharpness is the source.** The number to look at is the
portrait crop's width against the 287 CSS px the phone screen is drawn at:

| source | portrait crop | ratio |
|---|---|---|
| the Tokyo render in use | 567 x 1232 | 1.98x |
| a wider Milwaukee render offered as an alternative | 845 x 1838 | 2.94x |

The Milwaukee one is visibly sharper at 1:1 and was still not adopted: it is a
city-scale render, so at phone size the street grid is texture and the banner's
"84 m away" is claiming a distance smaller than a pixel. Sharpness is not worth
a map that contradicts the copy on top of it.

**What was exported in the end** was better than either: an aerial photograph
of a town centre, already portrait, 920 x 2000 in its crop, **3.21x** the
rendered width. It also sidesteps the compression trap entirely, because a
photograph of roofs has no fine type for AVIF to smear.

The cost is bytes. A vector map plate is 33 KB and this is 124 KB, which is the
price of a photograph and is paid on a screen well below the fold. `q64` rather
than the map's `q72`, because the night treatment has already pulled the
contrast back and hides compression better than the day version would, and
re-encoded from the source rather than from the AVIF so it is not a second
generation.

`.map-credit` was removed with it. This is not Mapbox imagery and a Mapbox
credit under someone else's photograph is worse than no credit at all. **The
aerial carries no attribution of its own: establish what licence it came under
before this ships.** The win screen's plate is still Mapbox and still credited.

Note that the phone now shows two visual languages: an aerial photograph in the
walkthrough and a Mapbox 3D vector render on the win screen. They are different
moments, so it is defensible, but if it ever reads as inconsistent the aerial
pipeline handles either.

### The wallet holds real coins now

`WalletScreen`'s SOL and ETH rows were drawing a letter in a grey circle,
because only SEEK had a `badge` set and the other two fell through to the
initial. On the one screen whose whole job is to show what you are holding, two
of three holdings were placeholders. They point at `solana.avif` and
`ethereum.avif` from the rewards set now.

`data-art` on `.wallet-row-icon` drops the grey plate whenever there is a render
to show, for the same reason the chain tiles lost theirs: these are circular
badges with their own rim, and a disc behind one reads as a ring around it. The
plate stays for the initial, which still needs something to sit on if a holding
ever arrives without artwork.

### The spawn screen had never shown its copy

It rendered `spawnScreen.distance`, `spawnScreen.inRange` and the rest as raw
keys. Every one of those keys exists in all nine message files. The namespace
was simply missing from `CLIENT_NAMESPACES`.

**The build did not catch it, and could not.** `SpawnScreen` only mounts when
somebody clicks a coin on the map, so it is never rendered during prerender and
never produced a `MISSING_MESSAGE` line. Grepping the build log, which is the
check the eighth pass added, is necessary and not sufficient.

**The audit in `client-messages.ts` did not catch it either, and that is the
part worth fixing.** It greps for files containing `use client` and reads the
`useTranslations` calls out of those. `SpawnScreen.tsx` does not carry the
directive: it is pulled into the client bundle by `AppWalkthrough`, which does.
The directive marks a boundary, not a bundle, and everything imported past one
is client code too.

The audit has to follow imports. This found `spawnScreen` and nothing else:

```js
// node, from the repo root
const fs=require('fs'),path=require('path');
const files={}; (function walk(d){for(const f of fs.readdirSync(d)){const p=path.join(d,f);
  fs.statSync(p).isDirectory()?walk(p):/\.tsx?$/.test(p)&&(files[p]=fs.readFileSync(p,'utf8'))}})('components');
(function walk(d){for(const f of fs.readdirSync(d)){const p=path.join(d,f);
  fs.statSync(p).isDirectory()?walk(p):/\.tsx?$/.test(p)&&(files[p]=fs.readFileSync(p,'utf8'))}})('app');
const res=(s,from)=>{let c=s.startsWith('@/')?s.slice(2):s.startsWith('.')?path.normalize(path.join(path.dirname(from),s)):null;
  if(!c)return null; for(const e of ['.tsx','.ts','/index.tsx','/index.ts']) if(files[c+e])return c+e; return files[c]?c:null};
const seen=new Set(), stack=Object.keys(files).filter(p=>/^\s*["']use client["']/.test(files[p]));
while(stack.length){const p=stack.pop(); if(seen.has(p))continue; seen.add(p);
  for(const m of files[p].matchAll(/from\s+["']([^"']+)["']/g)){const r=res(m[1],p); if(r)stack.push(r)}}
const need=new Set(); for(const p of seen)
  for(const m of files[p].matchAll(/useTranslations\(\s*["']([^"']+)["']/g)) need.add(m[1]);
console.log([...need].sort());
```

Both quote styles, in the entry test and in the `useTranslations` match. A
double-quote-only version of this reports `cookies` as unused, because
`CookieConsent` writes `'use client'` with single quotes, which is the same
trap the comment in `client-messages.ts` already records from the first time
that list was derived.

### The wallet's action row was four guesses under four blank tiles

`send / receive / swap / stake`, each with an empty `<b/>` that CSS filled with
a plain gradient disc. The app's actual row is **Deposit, Send, Exchange, QR**,
and its icons arrived as one 402-wide SVG strip, which is exactly the screen
width.

They are in `components/app/WalletActionIcons.tsx`, extracted rather than used
as a strip because the strip has its labels baked in as outlined text and this
site has nine locales. Each icon **keeps the coordinates it had in the strip**
and takes the box it occupied there as its viewBox: the gradients are
`userSpaceOnUse`, so moving the paths to a local origin would have meant moving
every gradient with them. Leaving both where they were is exact and free.

Gradient ids are prefixed per icon, for the third time this pass. The export
ships all eight as `paint0_linear_0_16409` upward, and four of these on one
screen sharing ids would each fill with the first one's ramp.
