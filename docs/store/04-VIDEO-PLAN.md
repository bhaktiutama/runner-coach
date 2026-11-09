# 04. Rencana video motion (marketing + store)

Status: v0.2 (2026-11-09). Keputusan: tanpa musik, ShotCraft diabaikan, foto hero app dipakai, gaya ritme pelari. V1 dan V2 draft pertama selesai (`marketing/video/`) | Copy dan klaim: `02-LISTING-EN.md` | Grafis: `graphics/`

## Ringkasan

- **Alat utama: Remotion** (video dari kode React, dirender di container). Gratis untuk individu dan perusahaan sampai 3 orang; cek ulang lisensi di remotion.dev/license sebelum dipakai.
- **ShotCraft** adalah app khusus Mac (bukan library); tidak bisa dijalankan di container. Opsional: pemilik memakainya di Mac dengan aset dari bagian 4.
- Usulan 3 video, bahasa English dulu: promo Google Play (16:9), video sosial vertikal (9:16), App Store preview (nanti, saat rilis iOS).

## 1. Video yang dibuat

| ID | Untuk | Format | Durasi | Aturan utama |
|---|---|---|---|---|
| V1 | Google Play promo video (tampil di atas screenshot) | 1920 x 1080, 30 fps, MP4 H.264 | 30 dtk | Diunggah ke YouTube (public atau unlisted, tanpa iklan, tanpa batas usia), URL ditempel di Store listing |
| V2 | Media sosial: Reels, TikTok, Shorts, iklan | 1080 x 1920, 30 fps | 15 dtk | Hook di 2 dtk pertama; teks besar karena sering diputar tanpa suara |
| V3 | App Store app preview (saat rilis iOS) | Resolusi per perangkat dari App Store Connect (cek ulang) | 15-30 dtk | Hanya rekaman layar app asli, tanpa bingkai HP atau tangan; diputar tanpa suara |

## 2. Storyboard V1 (30 dtk)

| Detik | Adegan | Isi layar | Teks |
|---|---|---|---|
| 0-3 | Logo | Oval lintasan oranye tergambar, titik pelari berputar, muncul wordmark "runco" | - |
| 3-7 | Hari ini | HP masuk dari bawah, layar Today (tempo), tombol Start berdenyut | Know exactly what to **run today** |
| 7-12 | Plan | Montase cepat onboarding: pilih HM, tanggal race, lalu preview plan; batang volume tumbuh | A real plan, built around **race day** |
| 12-17 | Timer | Rekaman timer tempo berjalan, bar segmen maju, gelombang visual tiap bunyi penanda | Every interval, **coached** |
| 17-21 | Strength | Animasi squat (frame app) + timer gerakan | Strength built for **runners** |
| 21-25 | Progres | Grafik volume dan tren pace beranimasi, prediksi 10K dihitung naik | See yourself getting **faster** |
| 25-28 | Privasi | Layar Data & privasi, ikon perisai menutup | Your data stays **on your phone** |
| 28-30 | Penutup | Logo + "Free running plans, 5K to marathon" | - |

V2 (15 dtk) = potongan V1: hook timer (0-2 dtk) lalu Hari ini, Plan, Progres, Penutup. V3 = adegan yang sama tanpa bingkai HP dan tanpa layar penutup bergaya iklan.

## 3. Cara produksi

| Tahap | Isi | Hasil |
|---|---|---|
| P0 Spike | Pasang Remotion di folder terpisah `marketing/video/` (bukan dependensi app), render tes 3 dtk dengan font dan token Lintas memakai Chromium `/opt/pw-browsers/chromium`; uji rekam layar resolusi HP lewat CDP screencast | MP4 tes, bukti render jalan di container |
| P1 Rekaman | Skrip Playwright (dasar: `graphics/_build/cap3.cjs`) merekam klip: onboarding, Today, timer berjalan, strength, scroll Progres. Build web EN + data contoh, catatan web disembunyikan | Klip PNG berurutan / WebM per adegan |
| P2 Komponen | `PhoneFrame`, `KineticHeadline` (kata kunci oranye), `LogoReveal` (oval lintasan), `CueWave`, `EndCard`; warna dan font dari `docs/design-system/tokens.json` | Komponen Remotion |
| P3 Komposisi | V1, lalu V2 dan V3 dari adegan yang sama | Draft MP4 resolusi rendah untuk review |
| P4 Review | Pemilik menonton draft, revisi teks / urutan / tempo | Daftar revisi |
| P5 Final | Render final, simpan di `docs/store/video/` (atau rilis GitHub jika file besar), unggah V1 ke YouTube (pemilik) | MP4 final + URL YouTube di Play Console |

## 4. Aset yang dipakai

| Aset | Sumber | Catatan |
|---|---|---|
| Layar app | Rekaman build web EN | Sama dengan screenshot store |
| Logo, warna, font | `docs/design-system/` | Bricolage Grotesque + Plus Jakarta Sans (OFL) |
| Bunyi penanda timer | `docs/audio/earcons`, `apps/app/assets/sounds` | Dibuat sendiri (nada sintesis), aman dipakai |
| Musik latar | "Stride - RunCo Promo" (Suno v6 wild via EvoLink, 2026-11-09) | Instrumental, sekitar 180 BPM, pop drum and bass + jersey club untuk Gen Z dan milenial. Style: `bright pop drum and bass with a jersey club bounce, TikTok-ready, Gen Z and millennial vibe, 180 bpm, punchy rolling breakbeat, crisp claps on every beat, glossy synth chords, chopped synth stabs, warm sub bass, sparkly arps, sunny feel-good summer energy, motivational running anthem, short riser into a big euphoric drop, clean hard stop ending, no vocals, modern advertising music`. Cek hak pakai komersial sebelum publik |
| Ilustrasi pelari di dalam layar | `assets/imagery` | Lisensi belum diverifikasi (A4); wajib jelas sebelum video publik |

## 5. Aturan isi

- Semua klaim mengikuti daftar cek `02-LISTING-EN.md` bagian 7. Tidak menyebut "layar terkunci", GPS, Strava, jam tangan, angka pengguna atau rating.
- Data di layar = data contoh realistis; tidak ditampilkan sebagai hasil pengguna nyata.
- Tidak ada nama kompetitor dan harga.

## 6. Keputusan pemilik

| # | Pertanyaan | Usulan |
|---|---|---|
| K1 | Setuju Remotion dipasang di `marketing/video/` (di luar app, tidak masuk build) | Ya |
| K2 | Video mana dulu | V1 lalu V2; V3 saat iOS |
| K3 | Musik | YouTube Audio Library atau tanpa musik + bunyi penanda app |
| K4 | ShotCraft | Opsional di Mac pemilik; tidak dibutuhkan untuk V1/V2 |
| K5 | Video di repo atau di luar | MP4 final di luar git (YouTube + Drive); repo hanya kode komposisi |
