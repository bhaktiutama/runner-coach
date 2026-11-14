# Code review RunCo app + landing, and the next phase (2026-11-14)

Scope: `development` at `a9d57eb` (app `apps/app`, `packages/training-engine`, `packages/ui`, `supabase/functions`, `e2e`, `marketing/landing`). Method: every repo quality gate run in the container, CI history read from GitHub Actions, targeted reading of the privacy, auth, entitlement, DB and timer code, links checked with curl.

## Summary

- The code is in good shape: 3,806 unit tests pass, engine coverage is 94.3% of statements, no loose hex colours, TODOs or console calls, and privacy holds (analytics allowlist, anonymous id, `$ip: null`, no personal data in any request).
- The process was not: CI on `development` has been red since 2026-11-08 (4 runs). A typecheck error stopped every later step, so unit tests, E2E and the server privacy check have not run in CI for six days. Three E2E tests had gone stale after the RunCo rebrand, and the landing merge added 951 lint errors. All of this is fixed on `claude/lucid-mendel-h6tuvt` (`ae9a47a`), not yet on `development`.
- Next phase: **M7 beta** (TestFlight, Play closed test, web). The long pole is Google Play's 12 testers x 14 days closed test, and most blockers are owner items: privacy policy URL (404 today), email login template and SMTP, Sentry and PostHog keys, Apple account, and the paywall decision.

## 1. Quality gates (run 2026-11-14)

| Gate | Result on `development` | After `ae9a47a` |
|---|---|---|
| `pnpm lint` | FAIL, 951 errors: landing vendor files (580), landing `app.js` (31), local skill folder (340) | PASS (lint + Prettier) |
| `pnpm typecheck` | FAIL, TS2345 `packages/training-engine/src/strength.ts:247` (from `d07ee16`, 2026-11-08) | PASS |
| `pnpm test` | PASS, 32 files, 3,806 tests | PASS |
| `pnpm test:coverage` (engine) | 94.29% statements, 89.21% branches, 96.56% functions | Same |
| `pnpm validate:engine` | PASS, 3 tests | Same |
| `pnpm test:e2e` (web, E2E flag) | 32 passed, 3 failed, 8 skipped | The 3 failing specs pass (9 tests) |
| `pnpm test:privacy` | 17 passed; server schema check fails here with 401 (session token rejected, environment issue) | Not re-run; it passed in CI run 49 (2026-11-08) |
| `pnpm audit --prod` | 8 advisories (1 high `zod`, 5 moderate, 2 low), all inside `expo > @expo/cli` or `@expo/config` (build tooling). The app's own `zod` is 4.6.7, already patched | Same |
| CI (GitHub Actions, `development`) | Runs 50 to 53 failed; last green run 49 on 2026-11-08 | CI runs only on `development`, `main` and PRs, so the fix shows green after merge |

The 3 E2E failures were stale tests, not app bugs: two expected the old name "Run Coach", one locator matched two injury icons after the icon was added to the Profile row.

## 2. Findings, app (ranked by impact)

| # | Area | Finding | Severity | Recommendation |
|---|---|---|---|---|
| A1 | Process | CI was red for 6 days and nobody noticed; merges continued on top. Unit tests, E2E and the privacy job were all skipped | High | Merge `ae9a47a`. Protect `development` so a merge needs a green CI run; send CI failure mail to the owner |
| A2 | Monetisation | Paywall is on by default since 2026-11-07, `entitlement` is not deployed (B12) and purchases come in phase 3. Today every user has strength from week 3 locked, with no way to buy | High (release) | For the beta build set `EXPO_PUBLIC_PAYWALL=0`. Locked content without a working purchase is a likely App Store rejection (guideline 3.1.1) and a poor first impression |
| A3 | Release | Privacy policy URL `https://bhaktiutama.com/runco/privacy` returns 404; it is required by Play Console and named in `docs/store/03-PLAY-CONSOLE.md` | High (release) | Owner uploads `docs/store/privacy/index.html` (item 2 in that doc) |
| A4 | Login | Email login needs `{{ .Token }}` in the Supabase templates (B5); the built-in SMTP sends 2 emails per hour | High (beta) | Owner edits templates; connect an SMTP provider before inviting testers |
| A5 | Observability | Sentry is in the TRD (M6, "Sentry without PII") but not in the dependencies; PostHog key not set (B7). A beta without crash reports is blind | Medium | Add Sentry with `beforeSend` that strips breadcrumbs and user fields, plus a test like the analytics allowlist test |
| A6 | Privacy, legal | Analytics is opt-out (`enabled = true` until switched off in 4.5). It is anonymous, but EU ePrivacy rules can still require consent for non-essential tracking | Medium | Decide opt-in for EU or a first-run choice; record the decision in TRD 6 |
| A7 | Tests | `e2e/motion.spec.ts` skips itself when "today" is a rest day (no `page.clock`), so its coverage depends on the calendar | Low | Pin the clock as `workout.spec.ts` already does |
| A8 | Maintainability | `apps/app/src/app/timer/[id].tsx` is 1,250 lines with 15 hooks and 10 sub-components; voice (TTS) and Live Activity are next on this screen | Medium | Split into `timer/` components and a `useTimerScreen` hook before adding features; the state machine itself (`src/timer/machine.ts`) is already separate and tested |
| A9 | Security, low | On web the Premium cache sits in `localStorage` and is trusted when the server cannot be reached; a user can forge it | Low | Acceptable for whitelist testing; with RevenueCat, trust only a signed or server-checked value |
| A10 | Dependencies | Audit advisories are all in Expo build tooling, none in shipped runtime code | Low | Pick them up with the next Expo patch; no action now |

What is good and should stay:

| Area | Evidence |
|---|---|
| Privacy by design | `src/lib/analytics.ts` allowlist per event, anonymous install id, IP dropped; only `fetch` calls are analytics and local font inlining; Edge Functions take only the JWT |
| Data safety | Migrations run in a transaction with `PRAGMA foreign_key_check` (`src/db/migrate.ts`); backup round-trip and rejected-file E2E pass |
| Design system discipline | 0 loose hex colours in components; texts through `i18n` with an ESLint rule; ID and EN catalogues the same size (846 vs 847 lines) |
| Engine | Pure package, 94% coverage, validation suite, evidence registry with rationale |

## 3. Findings, landing (`marketing/landing`)

| # | Finding | Severity | Recommendation |
|---|---|---|---|
| L1 | Merge added 951 lint errors to the repo gate | High | Fixed in `ae9a47a` (vendor ignored, globals declared, Prettier) |
| L2 | `og:image` is relative (`assets/img/start-poster.webp`); most social scrapers need an absolute URL, so shared links show no image | Medium | Set absolute URLs once the domain is final; uncomment `canonical` |
| L3 | App Store link is a placeholder; Play link 404s until the listing is public; privacy policy link 404s | Medium | Fill `STORE.ios` when the app id exists; publish the policy (A3) |
| L4 | The exercise list shows "Dead bug", which the engine retired from sessions on 2026-11-08 (`RETIRED_EXERCISES`) | Low | Swap for an exercise users actually get, or keep the list as "library" and say so |
| L5 | GSAP plugin licence, illustration licence (B10), real-device and Safari pass, Indonesian version | Medium (before public) | Listed in `docs/store/07-LANDING-AUDIT.md` |
| L6 | The landing is not checked by CI beyond lint (no smoke test) | Low | Add one Playwright smoke test: loads, 0 console errors, no horizontal scroll at 390 px |

## 4. Next phase proposal

### Phase 0: stabilise (about 1 day)

| Step | Who |
|---|---|
| Merge `claude/lucid-mendel-h6tuvt` (`ae9a47a`) into `development` and confirm CI green | Agent after owner go-ahead |
| Branch protection on `development`: CI required | Owner (GitHub settings) |
| Pin the clock in `motion.spec.ts`; landing smoke test in CI | Agent |

### Phase M7: beta on three platforms (about 2 to 3 weeks, the plan's milestone 7)

Critical path: Google Play requires a closed test with at least 12 testers for 14 days before production for new personal developer accounts (`06-IMPLEMENTATION-PLAN.md`, M7). Start that clock as early as possible.

| # | Work | Branch | Needs from owner |
|---|---|---|---|
| 1 | Beta build config: `EXPO_PUBLIC_PAYWALL=0` for beta, production EAS profile check, version 0.9.0 | `release/beta` | Decision A2 |
| 2 | Sentry (no PII, with test) + PostHog key; analytics consent decision | `release/beta` | B7 keys, decision A6 |
| 3 | Login hardening: `exp://**` redirect, OTP template, SMTP; login test on a phone | `feat/m1-auth-device` | B2, B5, SMTP account |
| 4 | Device pass: timer cues with the screen locked, resume after kill, notifications, largest text size, iPhone SE | `feat/m4-device-fixes` | Physical phones (B3) |
| 5 | Store: privacy policy live, Data safety and App Privacy forms, screenshots from the EN build, listing ID | `release/beta` | Accounts (B11, Play), D5 name check |
| 6 | Builds: Play internal, then closed test (12 testers, 14 days); TestFlight internal | - | Explicit build command (CLAUDE.md), testers list |
| 7 | Coach and physio review of engine rules and strength library (B4, B9) before public beta | - | Certified coach |

Exit criteria (from the plan): beta installed on 3 platforms, no open high-priority crash in Sentry, airplane-mode check passes, network audit of one full flow shows no personal data.

### Parallel track: landing go-live

Domain and hosting at `bhaktiutama.com/runco`, absolute `og:image` and `canonical`, App Store id, licences (GSAP, illustrations), Indonesian version, real-device pass. It can launch with Play-only links once the closed test opens.

### After beta (phase 3 and on)

| Order | Work | Why this order |
|---|---|---|
| 1 | RevenueCat purchases, trial, restore; then turn the paywall back on | Paywall without purchase is the open gap (A2) |
| 2 | Split the timer screen (A8), then voice cues (TTS) and iOS Live Activity | Both add to the largest file |
| 3 | Strava, HealthKit, Health Connect | Needs dev builds and client secrets |
| 4 | Female model frames for strength, model choice in the app | Needs spec change and image licence |

## 5. Caveats

- Not run: native builds, physical devices, iOS Safari, screen readers. The review covers code and web only.
- The server privacy test could not run here (session token rejected with 401); its last CI pass was run 49 on 2026-11-08.
- The 2-to-3-week estimate for M7 assumes owner items arrive within the first week; the 14-day Play closed test alone sets the minimum.
- Reading was targeted (privacy, auth, entitlement, DB, timer, landing), not line by line for all 27,902 lines.
