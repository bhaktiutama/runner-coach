# Landing "Run the Page": design audit (2026-11-13)

Scope: `marketing/landing/` as deployed before commit `e7ac496`. Walked in Chromium (Playwright, SwiftShader WebGL) at 1440 x 900, 834 x 1112, 390 x 844, 844 x 390 (landscape phone) and 720 x 450 at DPR 2 (1440 at 200% zoom). Owner instructions for this pass: leave the colours as they are; KM 3 must not follow the scroll; replace the KM 1 buildings if they cannot be made convincing.

Preview after the pass: https://run-coach--landing.expo.app (deployment `pa12xr8vrz`).

## Summary

- The two owner complaints are fixed: KM 1 is now a race course with one feather flag per week (height = km), and the KM 3 demo plays on its own clock with a visible exercise picker and a pause button.
- 19 correctness issues found and fixed, 5 of them high: two headline markers under 3:1 contrast, evidence cards reachable only by mouse drag, a hidden HUD that took keyboard focus, and short screens (landscape phones, 200% zoom) where the hero and held scenes overlapped or fell below the fold.
- 6 changes are left as proposals (L3) because they change navigation, remove a signature feature or change the design language.

## 1. Taste baseline

Product intent, derived from `docs/specs/01-PRD.md`, `docs/store/01-ASO-STRATEGY.md` and the page itself:

| Question | Answer |
|---|---|
| Who | Recreational runners, first race to marathon, on a phone, often new to structured training |
| For what | Decide to install a free coach that plans back from race day and coaches each run; trust it (evidence, privacy) |
| Character | A coach's tool with race-day poster energy: confident, warm, honest. Playful in moments, never at the cost of "what is it, is it free, where do I get it" |

Hypotheses from the docs, tested on the pages:

| Documented choice (06-LANDING-V2-PROMPT.md) | Verdict |
|---|---|
| The page is a 5K, scroll is running (HUD, splits, result card) | Keep. It is the page's identity and every number is real |
| Product data as the 3D scene (KM 1) | Keep the idea; the boxes and the buildings failed as a metaphor (owner review). Flags on a course pass |
| Scroll drives the demos (KM 2 timer, KM 3 reps) | Keep for the timer (time passing = scrolling reads naturally). Drop for reps: owner found it odd, and it blocked the section for 2.8 screens |
| Orange as the one accent, marker on every headline | Keep the colour (owner). The orange text marker only holds 3:1 on night and dawn grounds, not on the track or forest |
| Drag as the way into evidence (KM 4) | Drop. It hid half the evidence from keyboard and touch-scroll users |

What it should feel like at its best: one focal point per screen, numbers you could check in the app, motion that counts something (distance, reps, seconds) and stops when it has nothing to count. Decoration only where it is also information.

## 2. What changed and why (ranked by impact)

| # | Level | Change | Why | Commit |
|---|---|---|---|---|
| 1 | L2 | KM 1: buildings replaced by a race course. One feather flag per week on each side (cloth height = km x 0.27, phase colour), barriers in phase colours, low-poly pines, far hills, a text scrim | Owner: buildings unconvincing. Flags at a race are real objects with a natural height to compare; the course is what you train for | `e7ac496` |
| 2 | L2 | KM 3: no longer held 280svh; demo loops 2 x 10 reps at 2.2 s each, pauses off screen, pause button, still frame under reduced motion; the 15 exercises are visible toggle buttons | Owner: scroll-driven reps felt odd. The old picker worked only on hover over a moving marquee | `b5f211b` |
| 3 | L1 | Marker on KM 2 and KM 3 headlines: orange text becomes stone on an ink tape (the finish section's "REAL" treatment) | Orange on track 1.74:1, on forest 2.49:1; large text needs 3:1. Now 12.9:1 | `0d8ba26` |
| 4 | L2 | KM 4: six evidence cards as a 3 x 2 grid on desktop, native scroll row below 992 px; stamp moved to the card's foot | Cards 4 to 6 were reachable only by mouse drag; the stamp covered the titles | `003cc06` |
| 5 | L1 | Short screens (height 560 px or less, width over 600 px): hero flows, held scenes hide board, notes and phone, ring moves right | At 844 x 390 the store buttons sat under the start line; at 200% zoom the KM 1 and KM 2 headlines overlapped the board and the ring | `0d8ba26` |
| 6 | L1 | KM 2: ring moved to 56% and 30 rem, lane numbers removed, hold 360svh to 300svh | Ring touched the phone screenshot at 1440; lane numbers sat against the headline; less held scroll | `0d8ba26` |
| 7 | L1 | Type scale to two headline tiers: 7 rem (KM 1, KM 4, finish) and 5.6 rem (KM 2, KM 3, KM 5) | Four sizes were in use (7, 5.6, 5.4, 4.6 rem) | `0d8ba26` |
| 8 | L1 | Deleted: KM 2 lane numbers, coach note 4 ("scroll = reps"), hover-to-pick on the marquee | Each explained a mechanism instead of helping the visitor act | `b5f211b`, `0d8ba26` |

## 3. L2 evidence (before | after)

| Change | Screenshot |
|---|---|
| KM 1 course | `docs/store/landing-audit/l2-1-km1-course.jpg` |
| KM 3 strength, desktop | `docs/store/landing-audit/l2-2-km3-strength.jpg` |
| KM 3 strength, phone | `docs/store/landing-audit/l2-2-km3-strength-phone.jpg` |
| KM 4 cards | `docs/store/landing-audit/l2-3-km4-cards.jpg` |
| KM 2 marker contrast (L1) | `docs/store/landing-audit/l1-km2-contrast.jpg` |

Each L2 change is one commit and can be reverted alone with `git revert <commit>`.

## 4. L3 proposals (not done)

| # | Proposal | Reason | Cost or risk |
|---|---|---|---|
| 1 | Phones: shrink the HUD to distance plus a 3 px progress line; drop the scroll-pace chip there | The bar takes 3.2 rem of an 844 px screen (about 6%) on every section; "Standing" is noise on a thumb scroll | Changes the page's signature on its main device |
| 2 | Shorten KM 1 from 460svh to about 340svh, or add a "skip to the timer" link inside it | 4.6 screens of held scroll before the second idea; the longest commitment on the page | The 19 weeks pass faster; fewer frames per week |
| 3 | Drop the 3-2-1 load countdown, or show it only after the hero is painted | perf.mjs names the countdown numeral as the LCP element; it delays the first real content on a first visit | Removes an identity moment |
| 4 | Indonesian version (`/id/`) with a language link | The app ships ID and EN; the landing is EN only | Copy work plus a native read |
| 5 | Root font size from `vw` to `clamp()` in `rem` | `html { font-size: calc(100vw / 90) }` ignores the visitor's browser font-size setting (page zoom still works) | Every size on the page shifts; needs a full visual pass |
| 6 | Accent colour other than orange | Raised by the owner on 2026-11-12, parked on 2026-11-13 ("abaikan perubahan warna") | Brand change across app, icon and store |

## 5. Correctness table

| Page section | Viewport | Issue | Severity | Status |
|---|---|---|---|---|
| KM 2 timer | all | Headline marker "coached" orange on track, 1.74:1 | High | Fixed, 12.9:1 |
| KM 3 strength | all | Headline marker "runners" orange on forest, 2.49:1 | High | Fixed, 12.9:1 |
| KM 4 evidence | 1440, 834 | Cards 4 to 6 only reachable by mouse drag | High | Fixed (grid; focusable scroll region below 992 px) |
| HUD | all | Hidden HUD buttons took Tab focus off screen | High | Fixed (`inert` while hidden; verified true at top) |
| Hero, KM 1, KM 2 | 844 x 390, 720 x 450 (200% zoom) | Store buttons below the fold; headlines over board and ring; copy under the HUD; pin min-height 34 rem taller than the screen | High | Fixed |
| KM 4 evidence | 834, 720 | Headline and copy at x = 0, no gutter | Medium | Fixed |
| KM 2 timer | 1440 | Ring overlapped the phone screenshot | Medium | Fixed |
| KM 2 timer | all | "left of 10:00" at 85% opacity, 3.91:1 | Medium | Fixed, 4.8:1 |
| KM 3 strength | all | Auto-playing animation without pause (after the new clock) | Medium | Fixed (pause button; stops off screen) |
| KM 3 strength | all | Exercise picker hover-only or visually hidden | Medium | Fixed (visible toggle buttons) |
| KM 4 evidence | all | Grade stamp covered card titles; grade name 8 px | Medium | Fixed (stamp at foot; 10 px; D stamp 6.95:1) |
| Global | touch | Hover styles stuck after a tap (orange App Store button) | Medium | Fixed (`@media (hover: hover)`) |
| Finish, footer, HUD | 1440 | Targets under 24 px: Run it again 21 px, footer links 21 px, finish flag 16 px wide | Medium | Fixed (44 px and 26 px) |
| KM 5 privacy | keyboard | Enter on a data chip depended on Draggable's pointer click | Medium | Fixed (native click for keyboard; counter 0 to 1 verified). Before state not tested |
| KM 3 strength | all | Exercise button border 2.72:1 (UI boundary needs 3:1) | Low | Fixed, 3.74:1 |
| HUD | all | "Standing" chip text 4.27:1 | Low | Fixed, 5.97:1 |
| KM 1 plan | all | `<p>` inside `<dl>` (invalid) | Low | Fixed (dt/dd pair) |
| KM 1 plan | 1440, 844 x 390 | 3D labels slid under the readout | Low | Fixed |
| KM 2 timer | 1440 | Lane numbers against the headline | Low | Fixed (removed) |
| Global | 390, 720, 834, 844, 1440 | Horizontal scroll | Check | Pass: scrollWidth = viewport at all five |
| Global | 1440 | Layout shift over a full scroll | Check | Pass: 0.0001 |
| Global | 1440 | Focus visible on the first 60 Tab stops, all on screen | Check | Pass |
| Global | 390 reduced motion | KM 1 chart fallback, KM 3 still frame, no errors | Check | Pass |
| Global | 1440 | `perf.mjs`; `copy-lint.mjs --kind software` | Check | Pass: 0 FAIL (10 WARN, as before); 0 FAIL, 1 WARN (KM 1 readout as stat strip, kept) |
| Global | all | Browser font-size setting ignored (vw root size) | Low | Open, L3 #5 |
| Global | iOS Safari, real phones, screen readers, real GPU | Not tested in this container | Unknown | Open |

## 6. Documentation revised

| Document | Section | Triggered by |
|---|---|---|
| `06-LANDING-V2-PROMPT.md` | 5.6 KM 1 (pillars to flags, course dressing, scrim, labels, copy) | KM 1 screenshot, owner review 2026-11-13 |
| `06-LANDING-V2-PROMPT.md` | 5.7 KM 2 (no lane numbers) | KM 2 at 1440, lane numbers against the headline |
| `06-LANDING-V2-PROMPT.md` | 5.8 KM 3 (own clock, picker, one marquee, note removed) | KM 3, owner review 2026-11-13 |
| `06-LANDING-V2-PROMPT.md` | 5.9 KM 4 (grid, stamp at the foot) | KM 4 at 1440 and keyboard walk |
| `06-LANDING-V2-PROMPT.md` | Tokens table, acceptance checklist (pillars to flags) | Same as 5.6 |

The app's design system (`docs/design-system/`) was not the cause of any finding and is unchanged.

## 7. Caveats

- WebGL ran on SwiftShader (software). Frame rate and the look of flat shading on a real GPU and on iOS are not verified.
- Contrast numbers are computed with the WCAG formula from the CSS colours and opacities; text over the 3D scene and over photos is judged by eye with the scrim, not measured.
- The 200% zoom check uses a 720 x 450 viewport at DPR 2, which is how Chromium lays out 1440 x 900 at 200%; it is not the browser's text-only zoom.
