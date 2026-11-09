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

Semua di `public/music/` (di-gitignore). Dibuat dengan Suno `suno-v6-wild` lewat EvoLink, instrumental.

| File | Task EvoLink | Karakter | Dipakai |
|---|---|---|---|
| `orbit.mp3` (Orbit A) | `task-unified-1794232001-a520cqkb` (2026-11-09, 8 kredit) | Sinematik minimalis ala soundtrack luar angkasa: detak jam 180 BPM, organ, felt piano, arpeggio Lydian, napas dan langkah sebagai perkusi. Naik di 5,5 / 10,5 / 16 dtk, klimaks 26,5-28 dtk | **Ya**: V1 dan V1-Portrait dari awal, V2 mulai 14,8 dtk; fade akhir 0,8 dtk |
| `orbit-b.mp3` (Orbit B) | sama | Lebih rata, memudar sendiri di akhir | Cadangan |
| `stride.mp3` (Stride B) | `task-unified-1794231154-v2tabrnq` (8 kredit) | Pop drum and bass + jersey club, berhenti bersih 29,5 dtk | Cadangan (`MUSIC` di `src/Root.tsx`; V2 mulai 14,5 dtk) |

Prompt lengkap ada di `docs/store/04-VIDEO-PLAN.md`. Hak pakai komersial musik AI mengikuti syarat EvoLink/Suno; cek sebelum video dipakai publik.

## Foto hero

`PHOTOS` di `src/kit.tsx` menyimpan titik fokus (posisi orang) tiap foto. Landscape: foto di belakang HP, orangnya diletakkan di tengah bagian yang tidak tertutup HP. Portrait: foto kecil di depan HP (kanan bawah).
