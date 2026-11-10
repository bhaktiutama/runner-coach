# RunCo landing page

Halaman statis (HTML + CSS + modul JS, tanpa build step) untuk `https://bhaktiutama.com/runco/`. Tidak ikut build app. Rencana dan keputusan: `docs/store/05-LANDING-PLAN.md`.

| Bagian | Isi | Gambar |
|---|---|---|
| Hero | "Running coach app for 5K to marathon", tombol Get the app | Adegan 3D WebGL2: oval logo jadi lintasan, HP berisi layar Today, titik pelari 180 langkah/menit |
| `#plan` | 4 langkah membuat plan | Layar preview plan + kalender |
| `#privacy` | Pernyataan data di HP (momen `word-highlight`) | Tipe |
| `#training` | Tab: timer, strength, progres, ringkasan minggu | 4 layar app |
| `#more` | 4 kartu: kalender, drill, backup, pace | Potongan layar |
| `#evidence` | Alasan + tingkat bukti tiap latihan (momen `line-carries-colour`) | Layar "Why this workout?" |
| `#film` | Slot video promo 30 dtk | Poster sementara (feature graphic) |
| `#faq`, footer | Pertanyaan, Get the app | Layar welcome |

## Melihat lokal

Butuh server http (modul JS tidak jalan dari `file://`):

```bash
cd marketing/landing && python3 -m http.server 8090   # buka http://localhost:8090/
```

## Yang perlu diganti

| Apa | Di mana |
|---|---|
| Link toko | Objek `STORE` di skrip terakhir `index.html` (Play: id paket `com.bhaktiutama.runco`; App Store: ID belum ada). HP iOS langsung ke App Store, lainnya ke Play |
| Video promo | Slot `#film`: taruh `assets/film/runco-promo.mp4` (1920x1080, tanpa suara) + poster `runco-promo.jpg`, lalu tambahkan `<source>` dan `controls` ke `<video>` (komentar CLIENT FILE di HTML) |
| Domain kanonik | Baris `<link rel="canonical">` masih komentar |
| Gambar bagikan | `og:image` menunjuk `share.jpg` yang belum ada |

## Membuat ulang aset

| Aset | Cara |
|---|---|
| Layar app (`assets/img/screen-*`, `crop-*`) | Build web EN dengan `EXPO_PUBLIC_E2E=1` (lokal saja), seed dari `docs/prototypes/seed/make-seed.py`, capture seperti `docs/store/graphics/_build/cap3.cjs` (390 x 844, 3x), lalu WebP 780 / 520 / 300 px |
| Gambar diam hero (`assets/hero/hero-still*.webp`) | `node tools/make-stills.cjs` (render dari adegan 3D yang sama; Playwright global + Pillow) |
| Font | Bricolage Grotesque + Figtree, subset latin, di-host sendiri (`assets/fonts/`) |

## Kit dan pemeriksaan

`assets/system.css`, `layout/`, `motion/`, `moments/`, `ui/`, `backgrounds/`, `icons/` adalah salinan kit skill `design-taste-frontend` (tasteskill 2.5.1, `skills-lock.json`); jangan diedit, ubah di CSS halaman. Pemeriksa skill (`node <skill>/scripts/gate.mjs index.html`) hasil terakhir: `GATE: PASS` dengan 2 waiver di `.taste-skill/waivers.json`.

## Privasi

Tanpa cookie, analitik, atau request ke pihak ketiga: font dan skrip dari folder ini sendiri. Satu-satunya link keluar: toko aplikasi, kebijakan privasi, email.
