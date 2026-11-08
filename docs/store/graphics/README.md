# Grafis store listing (2026-11-08)

| File | Ukuran | Untuk |
|---|---|---|
| `play/play-01..08.png` | 1080 x 1920 | Google Play, phone screenshots (urutan = `02-LISTING-EN.md` bagian 3) |
| `ios/ios-01..08.png` | 1320 x 2868 | App Store, iPhone 6.9" |
| `feature-graphic.png` | 1024 x 500, RGB tanpa alpha | Google Play feature graphic |
| `icon-512.png` | 512 x 512 | Google Play app icon (dari `docs/design-system/assets/app-icon/icon.png`) |

## Membuat ulang

1. Ekspor web dengan `EXPO_PUBLIC_E2E=1` (hanya lokal, jangan deploy) dan jalankan `node scripts/serve-web.mjs apps/app/dist`.
2. Seed: `make-seed.py <dir>/seed.json --today 2026-11-04` (latihan 4 Nov diganti tempo dari 25 Nov, fase tetap base) dan `make-seed.py <dir>/seed-done.json --today 2026-11-08 --week-done`.
3. `node _build/cap3.cjs <dir> light` dan `node _build/cap4.cjs <dir> light` (screenshot ke `<dir>/shots/`).
4. `node _build/compose.cjs <dir> 1080 1920 play`, `node _build/compose.cjs <dir> 1320 2868 ios`, `node _build/fg.cjs <dir>`.

Skrip dijalankan dengan Playwright global (Chromium `/opt/pw-browsers`), bukan versi repo. Font dari `/root/.fonts` (Bricolage Grotesque, Plus Jakarta Sans; setup-session).
