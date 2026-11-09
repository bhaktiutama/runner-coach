# RunCo marketing video (Remotion)

Tidak ikut build app. Rencana dan aturan isi: `docs/store/04-VIDEO-PLAN.md`.

| Komposisi | Ukuran | Durasi | Untuk |
|---|---|---|---|
| `V1-Promo` | 1920 x 1080, 30 fps | 30 dtk | Google Play promo video (unggah ke YouTube) |
| `V1-Portrait` | 1080 x 1920, 30 fps | 30 dtk | V1 versi vertikal (Reels, Story, iklan) |
| `V2-Social` | 1080 x 1920, 30 fps | 15 dtk | Reels, TikTok, Shorts |

Gaya: ritme pelari; ritme pelari 180 langkah/menit (1 beat = 10 frame). Semua durasi adegan kelipatan 10 frame, kata judul muncul tiap setengah beat, HP "memantul" tiap beat, garis lajur bergerak.

## Membuat ulang

1. `npm install` di folder ini (lisensi Remotion: gratis untuk individu / tim sampai 3 orang).
2. Aset (di-gitignore): `public/photos/` = salinan `apps/app/assets/imagery/*.webp`; `public/fonts/` = Bricolage Grotesque 800, Plus Jakarta Sans 600/800 (`/root/.fonts`); `public/screens/` = hasil `scripts/capture.cjs` (build web EN dengan `EXPO_PUBLIC_E2E=1`, server `node scripts/serve-web.mjs apps/app/dist`, seed dari `docs/store/graphics/README.md`; jalankan salinan skrip di luar repo agar memakai Playwright global) ditambah `progress.png`, `week.png`, `preview.png` dari skrip screenshot store.
3. `npm run render:v1` dan `npm run render:v2` (hasil di `out/`, di-gitignore).

## Musik

- `public/music/stride.mp3` (di-gitignore): "Stride - RunCo Promo", Suno `suno-v6-wild` lewat EvoLink, task `task-unified-1794231154-v2tabrnq` (2026-11-09, 8 kredit). Versi B dari 2 hasil: tempo terukur sekitar 180 BPM (setengah tempo 90), drop di 10,75 dtk, jeda di 21,25 dtk, berhenti bersih di 29,5 dtk.
- V1 dan V1-Portrait memakai track dari awal; V2 memakai 14,5 sampai 29,5 dtk. Fade 0,1 dtk di awal dan 0,27 dtk di akhir.
- Prompt: style "bright pop drum and bass with a jersey club bounce, TikTok-ready, Gen Z and millennial vibe, 180 bpm, ..." (lengkap di `docs/store/04-VIDEO-PLAN.md`).
- Hak pakai komersial musik AI mengikuti syarat EvoLink/Suno; cek sebelum video dipakai publik.
