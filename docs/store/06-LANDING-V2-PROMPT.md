# RunCo "Run the Page": build prompt (landing v2)

Status: v0.2 (2026-11-12). D1 to D8 approved by the owner ("setuju jalankan semua", 2026-11-11); built in `marketing/landing/`, preview at https://run-coach--landing.expo.app, waiting for review (section 12). Replaces the v1 draft in `marketing/landing/` (kept in git history). Claims: `02-LISTING-EN.md` section 7. Engine facts: `docs/specs/07-ENGINE-EVIDENCE.md`.

Build a single-page landing site for **RunCo**, a running coach app (5K to marathon, iOS and Android). The page is not about a run. **The page is a run.** Scrolling is running: the page is a 5K course with a start line, five kilometre sections and a finish tape. A fixed run HUD, modelled on the app's own timer, shows your distance, your time on the page and your **scroll pace** as a live `min/km` readout with the app's Easy / Tempo / Interval zone chip. Each kilometre is a different surface and a different colour: a dawn road, a 3D fly-through of a real 19-week plan, a terracotta track, infield grass, night, and an orange finish. At the finish the page hands you a result card with your real time, your real splits and the real distance your thumb travelled, then asks you to run the real one. Every animation and interaction below must be built exactly, with the same libraries, timings, easings and numbers.

It is a static folder (`index.html`, one stylesheet, one script module, self-hosted fonts, images, sounds and vendor files). No build step, no cookies, no analytics, no request to any third party.

---

## 0. Why this and not v1

| v1 problem (owner review 2026-11-10) | v2 answer |
|---|---|
| Flat, all white | Seven grounds: dawn art, a sky that warms as you scroll, terracotta track, forest green, night, orange flood, paper. No section sits on plain stone |
| Looks like every Claude-made page (thin 400 grotesk, grey panels, cards in a grid) | Poster type: Bricolage Grotesque 800 at width 75, uppercase, up to 9 rem, with the store screenshots' orange marker under the keyword. A coach's marker handwriting annotates the page |
| Ordinary structure | One organising idea carried through every section: scroll = run, sections = kilometres, the nav is a run HUD |
| 3D was a dot circling a track | 3D is the product's own data: you run down a road through the 19 weeks of a real half marathon plan, weekly volume standing as feather flags along a race course (pillars, then buildings, until the 2026-11-13 audit), phase gates overhead, race day as the finish arch |

The four things only RunCo can do, each made interactive: the plan built back from race day (KM 1), the coaching timer with its real sound cues (KM 2), the 15 strength animations (KM 3), and rules that show their evidence grade, weak ones included (KM 4). Privacy (KM 5) is something you try to break with your own hands.

## 1. Libraries (self-hosted in `assets/vendor/`, loaded in this order at the end of `<body>`)

| Library | npm package and file |
|---|---|
| GSAP 3.13.0 | `gsap@3.13.0/dist/gsap.min.js` |
| ScrollTrigger | `gsap@3.13.0/dist/ScrollTrigger.min.js` |
| SplitText | `gsap@3.13.0/dist/SplitText.min.js` |
| DrawSVGPlugin | `gsap@3.13.0/dist/DrawSVGPlugin.min.js` |
| InertiaPlugin | `gsap@3.13.0/dist/InertiaPlugin.min.js` |
| Draggable | `gsap@3.13.0/dist/Draggable.min.js` |
| Lenis 1.3.17 | `lenis@1.3.17/dist/lenis.min.js` |

Register ScrollTrigger, SplitText, DrawSVGPlugin, InertiaPlugin and Draggable. No Three.js: the KM 1 scene is plain WebGL2 (v1's hero scene was 19 KB without a library; Three.js 0.187.0 is 659 KB for `three.module.js` alone). If GSAP fails to load, make everything visible immediately. A 4-second failsafe reveals the page if it has not marked itself ready. Check the GSAP licence page once at build (the plugins are listed as free for commercial use since 2025; confirm before public release).

## 2. Fonts (latin woff2, self-hosted, `font-display: swap`, all OFL on Google Fonts)

| Family | Use | Axes / settings |
|---|---|---|
| Bricolage Grotesque (variable) | Poster headlines, km numerals, HUD numbers, card titles. The brand's display face | opsz 12 to 96, wdth 75 to 100, wght 200 to 800. Headlines `"wght" 800, "wdth" 75, "opsz" 96`; numbers add `font-variant-numeric: tabular-nums` |
| Plus Jakarta Sans (variable) | Paragraphs, labels, buttons. The brand's UI face | wght 200 to 800. Paragraph 500, labels 700 |
| Covered By Your Grace | The coach's marker: seven short annotations, never body copy | regular |

Declare Bricolage with `font-weight: 200 800; font-stretch: 75% 100%` and Plus Jakarta Sans with `font-weight: 200 800`.

## 3. Head, tokens and the scaling system

- Title: **RunCo: running coach app for 5K to marathon**. Description: "RunCo builds a training plan back from your race date and coaches every run with a guided timer. The full running plan is free." `lang="en"`, UTF-8, `width=device-width, initial-scale=1, viewport-fit=cover`, `theme-color` `#161B1F`.
- Scaling: everything in `rem` with a fluid root. Desktop `html { font-size: calc(100vw / 90) }` (16 px at 1440). At 991 px and below `calc(100vw / 60)`. At 600 px and below `calc(100vw / 24.375)` (16 px at 390).
- Reset: border-box, zero margins, links inherit colour, images block. `body` uses `--page` as background with `transition: background-color .7s cubic-bezier(.65,.05,0,1)`, `overflow-x: clip`.
- Lenis helper rules as usual (`html.lenis, html.lenis body { height: auto }`, `.lenis.lenis-smooth { scroll-behavior: auto !important }`).
- Before ready, `main` is `visibility: hidden` until `html[data-page-ready]`.

### Colour tokens

From `docs/design-system/tokens.json` unless marked new. Every text and ground pair must pass `python3 docs/design-system/check_contrast.py` rules (4.5:1 body, 3:1 display).

| Token | Value | Use |
|---|---|---|
| ink | `#242C32` | text on light grounds, HUD body |
| night | `#161B1F` | KM 5, footer, result card |
| stone | `#F5F4F2` | text on dark grounds |
| paper | `#FFF9F2` | KM 4 ground, rule cards |
| orange | `#F26B38` | accent, marker highlight, finish flood |
| orange-ink | `#C63F0D` | Interval chip, grade C stamp |
| peach | `#E9B79D` | Easy chip, Base flags |
| build (new) | `#D98E63` | Build flags (sampled from the app's volume chart) |
| sand | `#F2C66D` | grade B stamp, sun |
| mint | `#70D6B3` | "Set done" chip |
| forest | `#477B63` | KM 3 ground (darkened to `#2F5D4A` if contrast needs it), grade A stamp |
| taper | `#A6B8FF` | Taper flags only (the app's own taper colour) |
| track (new) | `#B8472E` | KM 2 ground, load bands (from the track illustrations) |
| dawn (new) | `#123C46` | sky mid tone |

### Grounds, one per kilometre

| Section | Ground | Text |
|---|---|---|
| Start | dawn key art (video) | stone |
| KM 1 Plan | CSS sky that warms with scroll, behind a transparent WebGL canvas | stone, then ink after week 14 |
| KM 2 Timer | track `#B8472E` with cream lane lines | stone |
| KM 3 Strength | forest | stone |
| KM 4 Evidence | paper | ink |
| KM 5 Privacy | night | stone |
| Finish | orange flood, then night footer | ink on orange |

A ScrollTrigger on every `[data-ground]` section (start `top 55%`, end `bottom 45%`) sets `html[data-ground]`; `--page` and the nav colours follow through the `.7s` body transition.

### Shared type styles

| Style | Font | Size (desktop / 991 / 600) | Other |
|---|---|---|---|
| Hero headline | Bricolage 800, wdth 75 | 8.5 rem / 6.4 rem / 3.9 rem | uppercase, letter-spacing -0.02em, line-height 0.84 |
| Section headline | Bricolage 800, wdth 75 | 7 rem / 5.4 rem / 3.4 rem | same |
| Km numeral | Bricolage 800, wdth 75, outlined (`-webkit-text-stroke: .12rem currentColor`, transparent fill) | 15 rem / 11 rem / 7 rem | rotated -4 deg, tabular |
| Paragraph | Plus Jakarta Sans 500 | 1.3 rem / 1.3 rem / 1.1 rem | line-height 1.45, max-width 30 rem |
| Label | Plus Jakarta Sans 700 | 0.8 rem | uppercase, letter-spacing 0.12em |
| Coach note | Covered By Your Grace | 2 rem / 1.8 rem / 1.5 rem | rotated -6 to 5 deg, orange on dark grounds, ink on light |

**The marker.** One keyword per headline sits on the store screenshots' orange marker: a `::after` bar at 58% to 90% of the line height, `scaleX(0)` from the left, drawn to `scaleX(1)` in 0.5 s `power2.inOut` when its line lands. On dark grounds the keyword is orange text instead, as in the store frames.

## 4. Assets

### 4.1 From the repo (no new licence questions beyond B10)

| Asset | Source | Size | Used in |
|---|---|---|---|
| Raw app screens, EN, sample data | Recapture as in `docs/store/graphics/README.md` (390 x 844 at 3x): today, timer, strength timer, detail-why, privacy, preview | 1170 x 2532 | KM 2, KM 4, KM 5 phones |
| Workout art for the week card | `apps/app/assets/imagery/`: `riverside-city-m` (easy), `track-overhead` (strides), `track-back` (tempo), `road-sunrise-m` (long), `track-aerial` (rest) | 504 to 867 px | Start, week card (shown at 256 px wide, so sharp at 2x) |
| Strength frames | `apps/app/assets/exercises/<id>-m-<n>.webp`, 15 exercises, 15 or 16 frames each | 420 x 420 | KM 3 flipbook |
| Timer cues | `apps/app/assets/sounds/`: `tick` 0.43 s, `go` 1.22 s, `segment` 0.87 s, `halfway` 1.52 s, `finish` 2.15 s (synthesised in house, `scripts/make-earcons.py`) | wav, convert to mp3 + ogg | HUD sound, KM 2, finish |
| Logo, favicon | `docs/design-system/assets/logo/`, `app-icon/` | svg | nav, result card |
| Plan data | The half marathon plan in the app's preview screen: 19 weeks, 4 days a week, race Mar 15, weekly km `15 16 17 13 18 20 21 / 17 23 25 27 21 29 32 / 35 27 38 / 26 19`, phases Base 7, Build 7, Peak 3, Taper 2 | - | KM 1 |
| Week data | Week 5 of the app's sample 10K plan: Mon Easy + strides 20 min, Tue Easy 20 min, Wed Tempo 44 min (warm-up 10:00, ABC drills 10 min, tempo 14:00 at 6:46 /km, cool-down 10:00), Thu Easy 20 min, Fri Easy 20 min, Sat Rest, Sun Long run 43 min | - | Start, KM 2 |

### 4.2 To generate (EvoLink, paid, only after approval D2; downloaded and self-hosted, never hot-linked)

Style reference for all three stills: `road-sunrise-m.webp` and `riverside-city-m.webp` passed as `image_urls` (semi-realistic anime illustration, teal shadows, warm rim light, the same runner: dark hair, teal shirt, black shorts, white shoes).

| Id | What | Model and settings | Unit price (get_model, 2026-11-11) |
|---|---|---|---|
| G1 | **Start plate.** Runner seen from behind, standing on a chalk start line on an empty mountain road before sunrise; first orange light on the horizon at the right third; the left two thirds are calm dark teal sky for the headline; mist in the valley | `doubao-seedream-5.0-flash`, `size 21:9`, `quality 2K` (3136 x 1344) | USD 0.0162 per image |
| G2 | **Start loop.** First and last frame both G1 (cropped 16:9), so it loops: mist drifts, the light on the horizon breathes, the runner shifts weight and shakes out his arms | `seedance-2.0-fast-image-to-video`, 5 s, 720p, 16:9, `generate_audio false` | USD 0.1206 per second, so 5 s = USD 0.603 |
| G3 | **Finish art.** The same runner breaking a finish tape, front three-quarter view, arms up, golden light, portrait | Seedream 5.0 Flash, `size 4:5`, `quality 2K` (1792 x 2240) | USD 0.0162 |
| G4 | **Night art.** The same runner at night under a street lamp, looking at his phone, the phone lighting his face, portrait | Seedream 5.0 Flash, `size 4:5`, `quality 2K` | USD 0.0162 |

Arithmetic, not a quote: 3 images + 1 video = USD 0.65 (about 44 credits). With one retry of each = USD 1.30 (about 89 credits). Balance on 2026-11-11: 137.82 credits (USD 2.03). `estimate_cost` is run and shown before any generation. If D2 is declined: Start uses `road-sunrise-m.webp` inside a 34 rem framed window instead of full bleed, and the result card uses `shoe-sole.webp`.

## 5. Page structure, top to bottom

### 5.1 Load: three, two, one

A fixed overlay (`z-index: 1000`, no pointer events) of six horizontal lane bands, each `16.667vh` tall, track `#B8472E` with a 3 px cream line on its lower edge and its lane number (1 to 6, Bricolage 800, 3 rem, cream at 55%) at left 2 rem. Centred over them, one giant tabular numeral (Bricolage 800, wdth 75, 28 rem, cream). First visit in a tab: the numeral shows 3, 2, 1 for 0.28 s each (each one scales 1.15 to 1 and swaps hard, no fade), then the bands leave. Later visits in the same tab (`sessionStorage`): no count.

### 5.2 Nav (fixed top, `z-index: 50`)

Padding 1.25 rem 1.5 rem, flex space-between, the bar ignores pointer events and its children do not.
- Left: the RunCo logo (`logo-horizontal.svg`, 2.2 rem tall; the dark variant on dark grounds), links to top.
- Right: an orange pill 3 rem tall, padding 0 1.4 rem, Plus Jakarta Sans 700 at 1 rem, ink text: **Get the app** (to the finish section). The label slides up and is replaced by a copy from below on hover (`transform .45s cubic-bezier(.65,.05,0,1)`).
- No centre links: the HUD is the navigation.

### 5.3 The run HUD (fixed bottom, `z-index: 60`), the page's signature

A pill centred at bottom 1.25 rem, width `min(66rem, 100vw - 3rem)`, height 3.75 rem, ink at 94% opacity, radius 1.875 rem, stone text, a 1 px stone line at 12%. It is hidden (translated 150% down) on the Start screen and springs up (0.7 s `back.out(1.4)`) when the start line passes the top of the viewport. Left to right:

| Part | Content |
|---|---|
| Distance | label `DIST`, value `2.37 km` (Bricolage 800, 1.6 rem, tabular) |
| Course bar | flex 1; a 0.5 rem track (stone at 16%, radius 0.25 rem) with an orange fill to the current progress and an orange runner dot (0.9 rem, 2 px stone ring) at its head. Five buttons sit on it as ticks at each kilometre: `PLAN`, `TIMER`, `STRENGTH`, `EVIDENCE`, `PRIVACY`, then a checker flag at the end. Each scrolls to its section with `lenis.scrollTo(target, { duration: 1.6 })`; the current one is orange |
| Pace | label `SCROLL PACE`, value `6:52 /km`, then the zone chip |
| Time | label `TIME`, value `01:42` |
| Sound | a 2.5 rem round button, speaker icon, `aria-pressed="false"`, label "Timer sounds". Off by default |

**Distance.** Each kilometre section is exactly 1.00 km however tall it is: distance = (index of the current section) + (progress through it), from 0.00 at the start line to 5.00 at the finish tape.

**Scroll pace.** On every GSAP tick, `v` = an exponential moving average (alpha 0.12) of `|scroll delta| / dt` in px/s. Reference speed `vRef = 0.45 x innerHeight` px/s reads as 7:00 /km: `pace = 420 x vRef / v` seconds, clamped to 2:30 to 15:00. If `v < 40` for 600 ms the value shows `--:--` and the chip says `STANDING` (stone at 40%).

| Zone | Pace | Chip (the app's own chips) |
|---|---|---|
| EASY | 7:00 /km or slower | peach ground, ink text |
| TEMPO | 6:15 to 6:59 | orange ground, ink text |
| INTERVAL | faster than 6:15 | orange-ink ground, stone text |

**Time** starts at the first scroll past the start line and pauses while the tab is hidden. **Splits**: the time at the first crossing of each kilometre is stored for the result card. **Thumb distance**: the sum of every `|scroll delta|` in CSS px times 0.264583 mm (1 px = 1/96 inch).

**The coach reacts.** If the zone stays INTERVAL for 2.5 s, a coach note pops above the HUD (scale 0.6 to 1, rotate -4 deg, 0.4 s `back.out(2)`, gone after 3.2 s): "Easy. About 80% of your running should be." At most once per 25 s and three times a visit.

Phones (600 px and below): a full-width bar at the very bottom, 3 rem tall plus `env(safe-area-inset-bottom)`, square corners: distance, the course bar without labels, pace and chip. No time, no sound button (the KM 2 button turns sound on).

### 5.4 Start (100svh, `data-ground="dawn"`)

- **Background**: full-bleed `<video muted loop playsinline preload="auto" aria-hidden>` with G1 as poster and G2 as source, `object-fit: cover; object-position: 70% 50%` (phones `82% 50%`, keeping the runner). Reduced motion removes the source.
- **Content** (left 4 rem, top 20vh, `z-index: 2`, column, gap 1.75 rem):
  - Label: `RUNCO · RUNNING COACH APP · 5K TO MARATHON` (stone at 80%).
  - h1, two lines: "Know exactly what" / "to **run today**" (the marker under "run today"). Char reveal.
  - Paragraph (stone): "RunCo builds your plan back from race day, then coaches every run. The full running plan is free."
  - Two store buttons side by side, each 3.5 rem tall, radius 1.75 rem, stone ground, ink text, two lines of text and no store artwork: `Get it on` / **Google Play** and `Download on the` / **App Store**. Hover: the button fills orange from its left edge (`clip-path` inset, 0.4 s).
- **Week card** (fine hover pointer, 992 px and up; `z-index: 1`, behind the text): a 17 x 22 rem card, radius 1.5 rem, stone ground, hidden at start, centred on the pointer with CSS `translate: -50% -50%`. Top: the day's art (4:3). Below: the zone chip, the day name, a 4.5 rem tabular number of minutes and one line. The day is chosen by where the pointer is across the hero: `day = floor(clientX / innerWidth x 7)`.

| x band | Day | Chip | Number | Line | Art |
|---|---|---|---|---|---|
| 1 | Monday | EASY | 20 min | Easy + strides | track-overhead |
| 2 | Tuesday | EASY | 20 min | Easy run | riverside-city-m |
| 3 | Wednesday | TEMPO | 44 min | 14 min at 6:46 /km | track-back |
| 4 | Thursday | EASY | 20 min | Easy run | riverside-city-m (mirrored) |
| 5 | Friday | EASY | 20 min | Easy run | riverside-city-m |
| 6 | Saturday | REST | 0 | Rest day | track-aerial |
| 7 | Sunday | LONG | 43 min | Long run | road-sunrise-m |

  A row of seven day letters (`M T W T F S S`, Label style, gap 1 rem) sits at bottom 6 rem, left 4 rem; the active day is orange with a 0.4 rem dot under it.
- **Start line**: across the bottom edge, a 0.6 rem cream band with a rough edge (SVG `feTurbulence` displacement, scale 3), six lane boxes above it at the left (2.5 rem squares, cream stroke, numbers 1 to 6) and the word `START` (Bricolage 800, 2 rem) at the right. Centre, above the band: "Scroll to run" with a bouncing arrow (y 0 to 0.5 rem, 1.2 s, `sine.inOut`, yoyo).
- **Coach note 1**: "changes every day" with a hand-drawn arrow, at right 22%, top 30%, drawn 1.6 s after load.
- Phones: content top 6.5 rem, side padding 1.25 rem, buttons stacked full width. The week card is static under the buttons (13 x 9 rem, landscape: art left, text right, rotated -3 deg) and steps through the seven days every 2.2 s.

### 5.5 Kilometre boards

Each kilometre section opens with a board at its top left (left 4 rem, top 7 rem): the outlined km numeral ("1" to "5") with `KM` above it in Label style and the section word beside it. As the section enters (`top 70%`), the numeral's stroke draws (DrawSVG on an SVG text outline, 0.9 s `power2.out`) and it settles from rotate -10 deg to -4 deg.

### 5.6 KM 1, the plan: run your 19 weeks (pinned, `data-ground="sky"`)

A pin 100vh tall, scroll length `3.6 x innerHeight`, scrub 0.4.

- **Sky** (CSS, behind the canvas): a vertical gradient of three stops interpolated by progress `p`:

| p | top | middle | horizon |
|---|---|---|---|
| 0 | `#0F1B24` | `#123C46` | `#F2A65A` |
| 0.5 | `#3E7C8C` | `#F7C59F` | `#FFE2B8` |
| 1 | `#7FC4D6` | `#CFE9EE` | `#FFF9F2` |

  A sun (14 rem disc, `#F2C66D`, 3 rem blur glow) rises behind the horizon from `top: 62%` to `30%`, at left 64%.
- **World** (one transparent WebGL2 canvas, DPR capped at 2, 1.5 on phones; one program; fog to the horizon colour, `exp(-0.0045 x distance)`):
  - Road along -Z, 14 units wide: six lanes of 2 units and 1 unit shoulders, asphalt `#2B343A`, cream lane dashes 3 on, 3 off at 50%, antialiased with `fwidth`.
  - One week = 26 units of road; 19 weeks = 494 units, plus 40 of run-out.
  - **Flags** (revised 2026-11-13 by the audit, `07-LANDING-AUDIT.md`): for week `i`, a feather flag on each side of the road at x = -9.2 and +9.2: a pole and a billowing cloth 1.75 units wide, rounded over at the top, from 0.9 units up to `km x 0.27` (15 km = 4.05, 38 km = 10.26), in the phase colour (Base peach, Build `#D98E63`, Peak orange, Taper `#A6B8FF`) with one stone band near the foot. Flat shading from (-0.35, 0.86, 0.45), lit on both faces. Why: boxes, then buildings with windows, did not read as weekly volume (owner review, KM 1 screenshot, 2026-11-12 and 2026-11-13); a race course with one flag per week reads as the course you are training for.
  - **Course dressing**: barriers along both road edges (panels in the colour of the phase they stand in, stone top rail), low-poly pines in loose rows from x = 14 to 46, far hills as six-sided cones that the fog turns into silhouettes. No buildings, no lamps.
  - **Scrim**: the lower 58% of the pin carries a gradient from ink at 72% to transparent so the copy stays legible over the road.
  - **Gates**: an arch over the road (two posts, a beam 1.6 units tall, phase colour) at the first week of each phase, and an orange finish arch with a two-row checker band at week 19.
  - **Labels** are DOM, not textures: each is projected every frame (`translate3d`), fades in from 120 to 60 units away and is removed behind the camera. Flags: `WEEK 12` over `21 km` (Bricolage 800, tabular), hidden while they would sit under the readout. Gates: `BASE · 7 WEEKS`, `BUILD · 7 WEEKS`, `PEAK · 3 WEEKS`, `TAPER · 2 WEEKS`, `RACE DAY · MAR 15`.
- **Camera**: FOV 58 deg, at height 3.2, `z = 8 - p x 494`, looking 40 units ahead at height 2.6. Each 1.3 units of travel is one step: a bob of 0.12 units and a roll of 0.4 deg, tied to distance, so the camera only bobs while you scroll and stands still when you stop. The pointer adds up to 0.6 deg of yaw (quickTo, 0.6 s `power3`).
- **Copy** (left 4 rem, bottom 7 rem, max-width 34 rem): headline "A real plan, built around **race day**"; paragraph "Give RunCo your race date and training days. It builds every week back from that date. Each flag on this road is one week: the taller the flag, the more you run."
- **Readout** (top right, 2 rem in, three stat boxes in the app's style: ink at 80%, radius 1 rem, Label over a 1.8 rem tabular value), updated from `p`: `WEEK 12 of 19`, `PHASE Build`, `THIS WEEK 21 km`. A fourth line under them: "Race in 7 weeks".
- **Coach note 2**: "lighter week. on purpose." anchored to week 4 (13 km), shown while that week's flag is 40 to 90 units ahead; the same note returns at week 8, 12 and 16 as a small "again" under it.
- Past the finish arch (`p > 0.985`) the canvas flashes stone (opacity 0 to 0.9 to 0 in 0.35 s) and the section unpins.
- **Fallback** (no WebGL2, context lost, or reduced motion): the same 19 bars as an SVG chart across the screen in the phase colours with the four phase labels and the same copy. Not pinned.

### 5.7 KM 2, the timer (pinned, `data-ground="track"`)

Ground `#B8472E` with six lanes: `repeating-linear-gradient` horizontal lines every `16.667vh`, 3 px, cream at 55% (revised 2026-11-13 by the audit, `07-LANDING-AUDIT.md`): no lane numbers, they collided with the headline at 1440 px. A pin 100vh tall, scroll length `2.6 x innerHeight`, scrub 0.3.

- **The ring** (centre): rebuilt in SVG from the app's timer, not a screenshot. Diameter `min(62vh, 34rem)`, stroke 1.1 rem, track ring stone at 18%, progress arc stone, an orange dot with a stone ring at the arc's head. Inside: the zone chip, the countdown (Bricolage 800, wdth 75, 9 rem, tabular) and a line "left of 14:00".
- **The workout** is Wednesday's 44 minutes, scrubbed by scroll: `elapsed = p x 2640 s`.

| Segment | Length | Ends at | Chip | Line under the ring |
|---|---|---|---|---|
| Warm-up | 10:00 | 600 s | EASY | Easy pace |
| ABC drills | 10:00 | 1200 s | DRILLS | A-skip, B-skip, C-skip, high knees, carioca |
| Tempo | 14:00 | 2040 s | TEMPO | Target 6:46 /km · comfortably hard (6-7) |
| Cool-down | 10:00 | 2640 s | EASY | Easy pace |

  The countdown shows the time left in the current segment and the arc its fraction. Under the ring, the app's four-part bar (widths 10 : 10 : 14 : 10; peach, hatched peach, orange, peach; the current part at full opacity, the others at 45%).
- **Cue wave**: at every segment boundary crossed forwards, three rings leave the ring (scale 1 to 1.6, opacity 0.5 to 0, 0.9 s `power2.out`, 0.12 s apart), the chip swaps, and with sound on `segment.mp3` plays. Halfway through Tempo: the label `HALFWAY` flashes for 1.2 s and `halfway.mp3` plays. At the end: `finish.mp3`.
- **Left** (left 4 rem, vertically centred, max-width 26 rem): headline "Every interval, **coached**"; paragraph "Target pace on screen. Sound cues and haptics for work, recovery, halfway and the final 3-2-1."; a button **Try the 3-2-1** (stone ground, ink text, 3.5 rem tall).
- **Try the 3-2-1** is a click, not scroll: it turns sound on for the visit, the ring shows 3, 2, 1, GO one second apart, plays `tick` three times then `go`, and calls `navigator.vibrate([60, 940, 60, 940, 60, 940, 300])` where it exists. The scrubbed state returns 1.5 s later.
- **Right** (right 4 rem, bottom 7 rem): a phone (15 rem wide, 0.5 rem ink bezel, radius 2.2 rem, rotated 4 deg) with the real timer screenshot, and **coach note 3** beside it: "this is the real screen".
- Phones: not pinned as a split. Headline, paragraph and button first; then the ring (diameter 78vw) pinned for `1.6 x innerHeight`; the phone is hidden.

### 5.8 KM 3, strength: the demo plays on its own (not pinned, `data-ground="forest"`) (revised 2026-11-13 by the audit, `07-LANDING-AUDIT.md`)

Why: driving reps with the scroll felt odd (owner review, 2026-11-13). The section flows like KM 4: board, copy and the exercise picker on the left, the disc on the right; one column below 992 px.

- **Clock**: 2.2 s a rep (frames 1 to 16 and back), two sets of ten with a 1.8 s rest that shows the mint "Set done" chip, then it loops. It runs only while the section is at least 15% on screen and the tab is visible. A pause button sits on the disc (WCAG 2.2.2). Under reduced motion: one still frame, `10/10`, no pause button.
- **Picker**: the 15 exercises as real toggle buttons (`aria-pressed`), wrapping on desktop, one scrolling row on phones (2.75 rem tall). Picking one restarts the count at set 1.
- **Marquee**: one decorative row of the 15 names under the section, `aria-hidden`, not interactive; the picked name is outlined in stone.
- Coach note 4 is removed: the visible picker needs no instruction.

The text below describes the first build and is kept for history.

- **Flipbook** (centre): a 30 rem stone disc holding one 420 x 420 frame, drawn on a `<canvas>` from preloaded images. Ten reps over the scroll: each rep plays frames 1 to 16 and back to 1. Frame = from `p x 10`. Under the disc: the exercise name (Bricolage 800, 4 rem) and `Set 1 of 2 · 7/10` (tabular; the rep number pops scale 1.3 to 1 in 0.25 s at the bottom of each rep, with `tick` when sound is on). After rep 10 a mint chip "Set done" drops in.
- **The library** (two rows behind the disc, top 18% and bottom 14%, moving in opposite directions): the 15 real exercises as giant outlined words (Section headline style, cream stroke 0.1 rem, transparent fill, gap 3 rem): Squat, Split squat, Reverse lunge, Bulgarian split squat, Step-up, Single-leg deadlift, Glute bridge, Single-leg glute bridge, Calf raise, Single-leg calf raise, Plank, Side plank, Copenhagen plank, Dead bug, Bird dog. Marquee as in 6.6. With a fine pointer, hovering a word fills it cream and swaps the flipbook to that exercise (its frames load on first hover; the rep count keeps going).
- **Copy** (left 4 rem, bottom 7 rem, max-width 26 rem): headline "Strength built for **runners**"; paragraph "Optional bodyweight legs and core, 15 to 30 minutes, placed around your hard running days. Free for the first two weeks of every plan."
- **Coach note 4** (right of the disc): "scroll = reps. no skipping."
- Phones: disc 78vw; one marquee row; tapping a word swaps the exercise.

### 5.9 KM 4, evidence: the coach's index cards (`data-ground="paper"`, about 150vh, not pinned)

- Board, then the headline "Every workout **explains itself**" and the paragraph "Open any workout and RunCo says why it is there. Every rule carries a grade, from strong evidence down to plain coaching practice."
- **Six index cards** (revised 2026-11-13 by the audit, `07-LANDING-AUDIT.md`): a 3 x 2 grid on desktop (cards 4 to 6 were reachable only by mouse drag), a native scroll-snap row below 992 px that is a focusable region. The grade stamp sits at the card's foot, not its top right, where it covered the title. Cards enter rising 90 px with a fade.
- First build, kept for history: one horizontal row that overflows the screen to the right, dragged sideways (Draggable type `x` with inertia, bounds = the row's width, `edgeResistance: 0.85`). Each card is 20 x 26 rem, white, radius 0.5 rem, ruled with 1 px lines every 1.9 rem in ink at 8%, a 1 px orange margin line at left 2.4 rem, and its own rotation (-3, 2, -1.5, 3, -2.5, 1.5 deg). Each holds: the rule id (Label), a title (Bricolage 800, 2 rem), the app's own sentence (Paragraph at 1.05 rem), the source (0.8 rem, ink at 60%) and a grade stamp at top right (a 6 rem circle, 0.25 rem ring, the letter in Bricolage 800 at 3.2 rem, the grade name around it on a circle path, rotated -12 deg, slightly broken up with an SVG turbulence mask like rubber stamp ink).

| Id | Grade | Title | The app's sentence (`packages/training-engine/src/i18n/en.ts`) | Source |
|---|---|---|---|---|
| E-09 | A, Strong evidence | Most of your running is easy | "A large easy share builds endurance with a low recovery cost." | Silva Oliveira et al., Sports Med 2024, meta-analysis of 17 studies |
| E-11 | A, Strong evidence | Taper: less volume, same intensity | "A meta-analysis found this pattern helps race performance the most." | Bosquet et al., Med Sci Sports Exerc 2007, 27 studies |
| E-23 | A, Strong evidence | Strength, twice a week | "A meta-analysis of 25 randomised trials found strength training lowers sports injury risk." | Lauersen et al., Br J Sports Med 2014 |
| E-06 | B, Moderate evidence | No single run jumps too far | "A study of 5,205 runners found injury risk rises when one run goes past this limit." | Frandsen et al., Br J Sports Med 2025 |
| E-05 | B, Moderate evidence | Volume rises 10% at most | "Research has not shown that the 10% figure itself prevents injury." | Buist et al., Am J Sports Med 2008, randomised trial |
| E-07 | D, Coaching practice | Every few weeks is lighter | "Volume drops so your body absorbs the training of the previous weeks." | No study found that tests it |

  Stamp colours: A forest, B `#95680D`, C orange-ink, D ink at 60%.
- When the row enters (`top 75%`, once) the cards are dealt from the right: from `x: 60vw, rotation: +18`, 0.9 s `expo.out`, 0.08 s apart; each stamp lands 0.15 s after its card (scale 1.6 to 1, 0.25 s `back.out(3)`).
- **Coach note 5** under the last card: "we show the weak ones too." with an arrow to the D stamp.
- Right of the row's start, on desktop only: a phone (15 rem) with the real "Why this workout?" screenshot.
- Phones: the same row, cards 17 x 23 rem, native horizontal scroll with snap instead of Draggable.

### 5.10 KM 5, privacy: try to take it out (`data-ground="night"`, 110vh, not pinned)

- Board, then the headline "Your data stays **on your phone**" and the paragraph "Back up to a file, restore on a new phone, or delete everything."
- **The phone** (centre): an SVG outline 18 x 38 rem, radius 2.6 rem, 2 px stone stroke, G4 inside it at 35% opacity. Inside it sit five chips (stone ground, ink text, Plus Jakarta Sans 700 at 1 rem, radius 1.5 rem, padding 0.6 rem 1.1 rem, each rotated between -6 and 6 deg): **Your plan**, **Your runs**, **Effort ratings**, **Notes**, **Health answers**.
- Each chip is a Draggable with inertia, bounds the viewport. On release outside the phone's rectangle it flies home (`elastic.out(1, 0.5)`, 1.1 s) and the counter under the phone ticks: `Tried to leave: 3 · Left the phone: 0` (tabular; "0" never changes). Keyboard: chips are buttons; Enter or Space throws the chip 12 rem to the right and it springs home, counted the same way.
- **Our server** (right of the phone, a dashed stone box 14 x 9 rem, Label "OUR SERVER"): one chip that cannot be dragged, **Sign-in email**. Under the box, small text: "Anonymous usage stats are optional, and carry no name, email or training data."
- **Coach note 6**: "go on, try to drag it out." with an arrow to the chips.
- Phones: the phone outline is 62vw wide; the server box sits under it.

### 5.11 Finish (`data-ground="finish"`, about 200vh)

- **The tape**: a cream ribbon 4 rem tall across the top of the section, `FINISH` repeated along it (Bricolage 800, 2 rem, ink, 3 rem apart). When distance reaches 5.00 the tape snaps once: the left half rotates to -28 deg, the right to 24 deg (pivot at the outer ends), both fall 40vh and fade (0.9 s `power2.in`); with sound on `finish.mp3` plays; sixty strips of confetti in the five ground colours burst from the centre on a 2D canvas for 1.6 s (the app does the same when a week is complete). Then the ground floods orange from the tape's centre (`clip-path: circle(0% at 50% 0)` to `circle(150%)`, 0.8 s `power3.inOut`).
- **The result card** (left, rotated -3 deg): the app's share card, 22 x 39 rem, radius 1.75 rem, night ground, G3 in its top 45%, a 0.4 rem orange rule, then, all tabular:

| Row | Value | True? |
|---|---|---|
| `PAGE 5K · FINISHED` | title, Bricolage 800 2.2 rem | - |
| Time | `02:41` | measured (5.3) |
| Scroll pace, average | `6:58 /km` | from measured speed, on the page's own scale |
| Thumb distance | `4.3 m` | measured: px scrolled x 0.264583 mm |
| Splits | five rows, `KM 1  0:48` and so on | measured |
| Zone bar | one bar, the share of time in Easy, Tempo, Interval | measured |

  A line under the bar depends on the Easy share: 70% or more, "Mostly easy. That is how a base is built."; less, "Quick. Save some for race day." Last line, ink at 60% on stone: "Counted in this tab only. Nothing was sent anywhere." A link under the card: **Run it again** (scrolls to the top and resets the HUD).
- **Right**: headline "Now run the **real** one." (ink on orange; the marker here is ink with stone text); paragraph "Your thumb did five kilometres of page. RunCo plans the real ones, free, from day one to race day."; the two store buttons at 4.25 rem tall.
- **Questions** (under both, four `<details>` rows, each closed by a 1 px ink line at 20%): "Is RunCo free?" (running is free: the full plan, timer and progress; strength is free for two weeks of a plan, then part of Premium, which is not on sale yet), "Which races does RunCo plan for?" (5K, 10K, half marathon, marathon, or fitness with no race), "Does RunCo need an account?" (yes; it holds your sign-in email and nothing about your training), "Is RunCo medical advice?" (no; check with a doctor before a new program).
- **Coach note 7**, bottom right: "see you at 6 am."
- **Footer** (night): logo, "A running coach for your next race.", Privacy policy (`https://bhaktiutama.com/runco/privacy`), Email (`mailto:privacy@bhaktiutama.com`), "RunCo is a training guide, not a medical device.", © 2026 Bhakti Utama. Bottom padding leaves room for the HUD.

## 6. Motion and interactions (all exact)

### 6.1 Smooth scroll
Lenis `{ lerp: 0.14, wheelMultiplier: 1.1 }`, driven by the GSAP ticker (`lenis.raf(time * 1000)`), `lenis.on("scroll", ScrollTrigger.update)`, `gsap.ticker.lagSmoothing(0)`. Off under reduced motion.

### 6.2 Load sequence
Start at `document.fonts.ready` or after 1.5 s, whichever is first. Set `html[data-page-ready]`.

| Time | What happens |
|---|---|
| 0 s | bands cover the screen; first visit: 3, 2, 1 (0.28 s each) |
| 0.84 s (0 s on later visits) | bands leave to the right: `xPercent 0 to 101`, 0.9 s `expo.inOut`, 0.06 s apart from the top; main becomes visible; page init runs; the hero text reveal starts with a base delay of 0.35 s |
| +1.2 s | the marker draws under "run today" |
| +1.6 s | coach note 1 draws |

### 6.3 Text reveal
SplitText `type: "chars,words,lines"`, `mask: "lines"`. Chars from `yPercent: 120` to 0, 0.9 s `expo.out`, 0.016 s apart. Paragraphs split by lines, 0.07 s apart. Section headlines reveal once at `top 80%`. Line wrappers get `padding-bottom: .08em; margin-bottom: -.08em`.

### 6.4 Stride type (headlines lean with your pace)
Every section headline reads the HUD's smoothed `v`: `skewX = -clamp(v / 260, 0, 7) deg` and the `wdth` axis goes from 75 to `75 + clamp(v / 90, 0, 25)`, both through `gsap.quickTo` (0.5 s `power3.out`), so type leans forward and stretches while you run and stands up when you stop. Off on phones and under reduced motion.

### 6.5 Week card
quickTo x / y on the card (0.9 s `power4`); rotation = `clamp(dx / 5, -10, 10)` deg, easing to 0 66 ms after the last move. On a day change the card flips (`rotationY` 90 to 0, 0.25 s `power2.out`) and with sound on `tick` plays. Over a link or button the card fades out (0.25 s). On leaving the hero it fades out (0.3 s).

### 6.6 Exercise marquee
Two rows, direction left and right, loop duration = 40 s x (row width / viewport width). ScrollTrigger sets each row's `timeScale` to `1 + clamp(v / 600, 0, 4)` times its direction, flipping sign with the scroll direction, easing back to 1 in 0.6 s.

### 6.7 Coach notes
Seven notes, each an SVG path arrow or circle (stroke 0.2 rem, round caps) drawn with DrawSVG `0%` to `100%` in 0.6 s `power2.inOut`, then its words appear letter by letter (0.02 s apart). Each plays once when its anchor is at `top 70%`. Notes never cover copy and are `aria-hidden`.

### 6.8 Sound
Off until the visitor presses the HUD's sound button or "Try the 3-2-1". One `AudioContext`, decoded buffers, gain 0.6. Never on scroll alone before that click. The setting lasts for the tab.

### 6.9 Buttons and links
Store buttons fill orange from the left on hover (0.4 s `cubic-bezier(.65,.05,0,1)`) and scale to 0.97 on press. Text links carry a hand-drawn marker underline drawn in 0.5 s on hover and erased on leave.

## 7. Reduced motion, no script, phones

- `prefers-reduced-motion: reduce`: no load count or bands, no Lenis, no reveals, no stride type, no week card follow (it shows Wednesday), no marquee movement, no confetti, the Start video is its poster, KM 1 is its SVG chart. The HUD, the timer ring, the flipbook, the cards, the chips and the result card still work, because they answer the scroll or the hand, not the clock.
- No script: every section reads as a normal page; the HUD and result card are hidden; KM 1 shows its chart.
- Pause rule: the only thing that moves by itself for more than 5 s is the Start video; it carries a pause button (bottom right of the hero, 2.5 rem).
- One WebGL context (KM 1), created when the section is within one screen and released when it is two screens away.

## 8. What this prompt overrides in the `design-taste-frontend` skill

The owner's review of v1 and this prompt win where they differ. The skill stays in use as a lint.

| Skill rule | v2 |
|---|---|
| Headline weight 400 to 500, never 700 or 800 | 800, the brand's own weight in the store graphics and the video |
| One effect and one or two moments; nothing else moves with scroll | Five scroll-driven sections |
| No smooth-scroll library, no pinned section beyond the dealt moment | Lenis, three pins |
| Every section exactly one or two screens | Pins of 2.8 to 4.6 screens |
| Kit components and dealt hero, nav, close | Own markup and script; the kit is not copied in |
| Never Plus Jakarta Sans | The brand's UI face |
| No lavender | `#A6B8FF` on the Taper flags only: it is the app's taper colour |
| Kept | `copy-lint.mjs` (0 FAIL), no invented facts or proof, real product UI in every section, alt text, focus rings at 3:1, keyboard paths, reduced motion, `perf.mjs` with no FAIL row |

Expected result: the gate cannot pass (it allows five waivers). The build is closed with `gate.mjs --done "<the owner's words>"`, and every open FAIL is listed in the report.

## 9. Acceptance checklist

- At 1440 x 900: 3, 2, 1, the lane bands leave, "KNOW EXACTLY WHAT / TO RUN TODAY" rises letter by letter over the dawn loop, and the orange marker draws under "RUN TODAY".
- Moving the mouse across the hero from left to right walks the week card from Monday to Sunday; Wednesday shows TEMPO, 44 min.
- Crossing the start line, the HUD springs up. Its pace reads about 7:00 /km at a reading scroll and drops under 6:15 with an INTERVAL chip on a fast flick; holding it there brings the coach's "Easy." note.
- KM 1: the sky goes from night to day while the camera runs past 19 pairs of flags; the labels read W1 15 km to W19 19 km; weeks 4, 8, 12 and 16 are visibly lower; the readout says "Week 12 of 19 · Build · 21 km"; the orange arch reads RACE DAY · MAR 15. The camera stands still when the scroll stops.
- KM 2: the ring counts Warm-up, Drills, Tempo, Cool-down as you scroll; three waves leave the ring at each boundary; "Try the 3-2-1" plays three ticks and a go.
- KM 3: ten scroll-driven squats, the counter reads 10/10, "Set done" drops in; hovering "Bird dog" swaps the animation.
- KM 4: six cards are dealt from the right with stamps A, A, A, B, B, D and can be thrown sideways.
- KM 5: a chip dragged out of the phone springs back and "Tried to leave" goes up by one; "Left the phone" stays 0.
- Finish: the tape snaps at 5.00 km, the page floods orange, and the result card shows a time, five splits and a thumb distance that match a stopwatch and a ruler.
- Headlines lean while scrolling and stand upright at rest.
- Phone (390 px): bottom HUD bar, static week card stepping through the days, the 3D road runs or its chart shows, no horizontal page scroll, every tap target 44 px.
- No request leaves the page's own origin (network panel), and no sound plays before a click.

## 10. Owner decisions

| # | Question | Proposal |
|---|---|---|
| D1 | The concept: the page is a 5K you scroll, with the run HUD and scroll pace | Yes |
| D2 | Generate G1 to G4 with EvoLink (USD 0.65, up to about USD 1.30 with one retry each; balance USD 2.03) | Yes; `estimate_cost` shown before spending |
| D3 | Uppercase poster headlines in Bricolage 800 and a third font for the coach's notes | Yes |
| D4 | Real timer sounds on the page, off until clicked | Yes |
| D5 | GSAP and Lenis, self-hosted, for the marketing page only (not the app) | Yes |
| D6 | The skill as lint, not as gate (section 8) | Yes |
| D7 | Replace v1 in `marketing/landing/` and reuse the preview alias `landing` | Yes |
| D8 | English first; Indonesian after review | Yes |

## 11. Risks and limits

| # | Item | Effect |
|---|---|---|
| R1 | Illustration licence (B10) still open; G1 to G4 are new art in the same style, with EvoLink's terms | Old art still shows inside app screens and the week card |
| R2 | A generated loop may not loop cleanly or keep the runner on model | One retry budgeted; fallback is the still |
| R3 | Scroll-heavy pages cost frames on low-end phones | DPR caps, one WebGL context, the chart fallback, test on a real phone before public |
| R4 | Scroll pace is a toy scale, not a measurement | Labelled "scroll pace" everywhere; the result card marks what is measured |
| R5 | The strength frames' backgrounds (opaque or transparent) are not checked yet | Decides whether the disc needs a blend mode |
| R6 | Checks so far used a software renderer; no real GPU, Safari or iOS run | Owner review on a phone before public |

## 12. Build result (2026-11-12)

Preview: **https://run-coach--landing.expo.app** (EAS Hosting, alias `landing`; the app's `preview` alias and production are untouched).

Where the build differs from this prompt, and why:

| Prompt | Built | Why |
|---|---|---|
| Three sections pinned by ScrollTrigger | CSS `position: sticky` inside tall sections (460, 360, 280 svh; phones 380, 260, 280); ScrollTrigger only scrubs | JS pinning measured a layout shift of 3.0 to 4.6 in the perf check; sticky measures 0.002 |
| Stride type moves the `wdth` axis 75 to 100 | `skewX` up to 7 deg and `scaleX` up to 1.09 | Changing the axis re-laid the line on every frame (layout shift) |
| HUD fill and dot by width and left | `transform` | Same reason |
| Km numeral drawn with DrawSVG | Clip reveal, rotate -6 to 0 deg | DrawSVG does not draw text outlines |
| Coach note 1 near the week card | Beside the day strip: "move your mouse: it changes every day" | The card follows the pointer, so a fixed note pointed at nothing |
| Sounds as mp3 + ogg | mp3 only, 96 kb/s mono | Every current browser decodes mp3 |
| Raw screens recaptured (6) | Two reused from the v1 capture: timer, "Why this workout?" | The other sections draw the product as live UI or data, not as screenshots |
| KM 1 fallback chart in the HTML | Bars are built by script; without script the section shows its copy and an `aria-label` with all 19 values | Kept the HTML short |
| KM 1 copy turns ink after week 14 | Stays stone with a soft shadow | It sits over dark asphalt at every point of the run |
| Finish floods the page orange | The flood stays inside the finish section | The orange also coloured the end of KM 5 |
| `gate.mjs --done` | Not run: no gate was armed for v2 | The kit is not used; `copy-lint` and `perf` were run as lint |

Assets generated (EvoLink): 3 stills USD 0.051, one 5 s loop USD 0.604, total USD 0.655 (44.3 credits), within D2. The loop's first and last frame differ by 2.5 of 255 on average. Balance after: about 93.5 credits.

Checks (2026-11-12, headless Chromium, WebGL on a software renderer):

| Check | Result |
|---|---|
| Console and network, 1440 and 390, local and on the preview URL | 0 errors, 0 failed requests, 0 requests to another host |
| Interactions | week card Monday to Sunday across the hero; scroll pace reads Interval on a fast flick; "Try the 3-2-1" turns sound on and plays; card row drags; a chip dragged out returns and counts 1; tape snaps and the result card fills with time, five splits and thumb distance |
| `copy-lint.mjs --kind software` | 0 FAIL, 1 WARN (`copy-stat-strip`: the KM 1 readout, kept: it is the plan's own data) |
| `perf.mjs` | 0 FAIL, 10 WARN (1.68 MB total transfer at 1440: 884 KB images, 515 KB film; three font families; two logos not lazy) |
| Layout shift while scrolling the whole page | 0.002 at 1440, 0.001 at 390 |
| Reduced motion | no load count, no Lenis, KM 1 as its chart, pins and HUD still work |
| Not checked | a real phone, Safari and iOS, a real GPU, sound on a device, haptics |

Open before public release: illustration licence (B10), the App Store id (`STORE.ios` in `app.js`), GSAP licence confirmation, a native speaker's read of the copy (B8), the `privacy@bhaktiutama.com` mailbox, a real-device pass, the Indonesian version.
