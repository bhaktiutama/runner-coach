# RunCo landing page v2: "Run the Page"

Halaman statis (HTML + CSS + modul JS, tanpa build step) untuk `https://bhaktiutama.com/runco/`. Tidak ikut build app. Prompt build dan keputusan: `docs/store/06-LANDING-V2-PROMPT.md`.

Ide: halaman ini adalah lari 5K. Scroll = berlari, tiap bagian = satu kilometer, HUD di bawah menunjukkan jarak, waktu dan "scroll pace".

| File | Isi |
|---|---|
| `index.html` | Semua markup dan copy (EN) |
| `styles.css` | Token warna, tipe, tata letak, responsif |
| `app.js` | HUD + scroll pace, kartu minggu, timer, strength, kartu bukti, privasi, finish. Objek `STORE` (link toko) ada di baris awal |
| `plan3d.js` | KM 1: jalan 3D melewati 19 minggu plan (WebGL2 murni, tanpa library) |
| `assets/vendor/` | GSAP 3.13.0 (+ ScrollTrigger, SplitText, DrawSVG, Inertia, Draggable), Lenis 1.3.17, disalin dari npm |
| `assets/img/` | Gambar baru (start, finish, night) dari EvoLink; ilustrasi kartu minggu dan 2 layar app dari repo |
| `assets/video/start-loop.mp4` | Loop hero 5 dtk, 1280 x 720, tanpa suara (EvoLink, dikompres ulang) |
| `assets/exercises/` | 237 frame gerakan (15 gerakan), salinan `apps/app/assets/exercises` |
| `assets/sounds/` | 5 bunyi timer app (mp3), dari `apps/app/assets/sounds` |

## Melihat lokal

```bash
cd marketing/landing && python3 -m http.server 8090   # buka http://localhost:8090/
```

## Yang perlu diganti sebelum publik

| Apa | Di mana |
|---|---|
| ID App Store | `STORE.ios` di `app.js` (Play sudah memakai `com.bhaktiutama.runco`) |
| Domain kanonik | Sudah diset ke `https://bhaktiutama.com/runco/` (canonical, og:url, og:image, hreflang). Ganti di `index.html` jika domain berubah, lalu jalankan `build-id.py` |

## Aset buatan (EvoLink, 2026-11-11)

| Aset | Model | Biaya |
|---|---|---|
| `start-poster.webp`, `finish.webp`, `night.webp` | `doubao-seedream-5.0-flash`, acuan gaya `road-sunrise-m` + `riverside-city-m` | USD 0,051 (3 gambar) |
| `start-loop.mp4` | `seedance-2.0-fast-image-to-video`, frame awal = frame akhir | USD 0,604 |

Link hasil EvoLink kedaluwarsa 24 jam; file di folder ini adalah salinan tetapnya.

## Privasi

Tanpa cookie, analitik atau request ke pihak ketiga (dicek di browser: 0 request keluar). Waktu, split dan jarak jempol di kartu hasil dihitung di tab itu saja. Bunyi hanya menyala setelah diklik.

## Deploy preview

1. `python3 marketing/landing/build-id.py` (halaman `id/` dibangun dari `index.html`; gagal jika teks EN yang dicari tidak ada).
2. Salin `index.html`, `styles.css`, `app.js`, `plan3d.js`, `assets/`, `id/`, `privacy/` (symlink ke `docs/store/privacy/`, jadi pakai `cp -rL`) dan `apps/app/dist/metadata.json` ke folder sementara di `apps/app`.
3. `npx eas-cli@latest deploy --export-dir <folder> --non-interactive`, lalu `deploy:alias:delete landing` dan `deploy:alias --alias landing --id <id>`; hapus foldernya. URL: https://run-coach--landing.expo.app

## Bahasa

`index.html` (EN) adalah sumber. `id/index.html` dibangun oleh `build-id.py` dari peta terjemahan; teks di JavaScript ada di objek `TXT` di `app.js` (dipilih dari `<html lang>`). Aset dibaca relatif ke `app.js`, jadi kedua halaman memakai satu salinan.

## Test

`pnpm test:landing` (juga di CI): EN dan ID di 390 dan 1440 px, tanpa error konsol, tanpa request ke luar, tanpa scroll horizontal, kedua link toko benar, dan versi reduced motion.

## Lisensi

GSAP 3.13 dan plugin-nya (ScrollTrigger, SplitText, DrawSVG, Inertia, Draggable): GSAP Standard License dari Webflow, dicek 2026-11-14 di https://gsap.com/standard-license. Pemakaian komersial di situs gratis, tanpa kewajiban atribusi; header lisensi di `assets/vendor/` tidak boleh dihapus.
