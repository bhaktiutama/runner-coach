# RunCo marketing video (Remotion)

Tidak ikut build app. Rencana dan aturan isi: `docs/store/04-VIDEO-PLAN.md`.

| Komposisi | Ukuran | Durasi | Untuk |
|---|---|---|---|
| `V1-Promo` | 1920 x 1080, 30 fps | 30 dtk | Google Play promo video (unggah ke YouTube) |
| `V2-Social` | 1080 x 1920, 30 fps | 15 dtk | Reels, TikTok, Shorts |

Gaya: tanpa musik; ritme pelari 180 langkah/menit (1 beat = 10 frame). Semua durasi adegan kelipatan 10 frame, kata judul muncul tiap setengah beat, HP "memantul" tiap beat, garis lajur bergerak.

## Membuat ulang

1. `npm install` di folder ini (lisensi Remotion: gratis untuk individu / tim sampai 3 orang).
2. Aset (di-gitignore): `public/photos/` = salinan `apps/app/assets/imagery/*.webp`; `public/fonts/` = Bricolage Grotesque 800, Plus Jakarta Sans 600/800 (`/root/.fonts`); `public/screens/` = hasil `scripts/capture.cjs` (build web EN dengan `EXPO_PUBLIC_E2E=1`, server `node scripts/serve-web.mjs apps/app/dist`, seed dari `docs/store/graphics/README.md`; jalankan salinan skrip di luar repo agar memakai Playwright global) ditambah `progress.png`, `week.png`, `preview.png` dari skrip screenshot store.
3. `npm run render:v1` dan `npm run render:v2` (hasil di `out/`, di-gitignore).
