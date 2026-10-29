# Design System "Lintas"

Status: v0.1 (2026-10-29) | Token: [`tokens.json`](tokens.json) | Cek kontras: `python3 docs/design-system/check_contrast.py`

Tampilan visual (warna, tipe, 11 komponen dalam tema terang dan gelap): artifact "Lintas" https://claude.ai/artifact/3W87Kuo9E1X7eZFNDjc5j2 (dibuat dari file ini; jika token berubah, artifact diperbarui).

## Ringkasan

- **Unik dari 4 ciri khas**, masing-masing punya fungsi: skala panas intensitas, bentuk lintasan (stadium dan oval), label bib race, latar kertas hangat dengan tombol oranye bertulisan gelap.
- **Mudah dipakai tetap nomor satu**: semua pasangan teks/latar lolos WCAG (39 pasangan, termasuk tema gelap, dicek otomatis), area sentuh min 44 px, warna tidak pernah jadi satu-satunya penanda.
- `tokens.json` adalah satu-satunya sumber nilai. Kode (`packages/ui`) dan artifact visual diturunkan dari file ini.

## 1. Ciri khas (yang membuat app tidak pasaran)

| # | Ciri | Wujud | Fungsi UX |
|---|------|-------|-----------|
| 1 | **Intensitas = panas** | Zona latihan memakai satu skala hangat: recovery lavender (sejuk), easy peach, long peach tua, tempo oranye, interval bara | Sekali lihat tahu seberapa berat. Kecerahan menurun berurutan, jadi tetap terbaca oleh buta warna. Cocok dengan konteks lari pagi di iklim panas |
| 2 | **Bentuk lintasan** | Tombol dan chip berbentuk stadium; progres memakai cincin **oval lintasan** (2 lurus + 2 tikungan), bukan lingkaran; minggu digambar sebagai 7 lajur | Bentuk ikonik lari, tetap kontrol standar (tombol tetap tombol) |
| 3 | **Label bib** | Tipe latihan ditulis seperti nomor dada race: kotak, huruf kapital rapat, 4 titik peniti di sudut | Membedakan tipe latihan dari tombol dan status. Dipakai hanya di kartu latihan, maksimal 1 per kartu |
| 4 | **Kertas hangat + oranye** | Latar krem `#FFF9F2`, kartu putih dengan bayangan keras 2 px, tombol oranye dengan teks charcoal | Hangat dan beda dari app olahraga hitam/neon. Teks gelap di oranye lebih terbaca (4.68:1) daripada putih (3.03:1) |

Tipografi juga jadi pembeda: **Bricolage Grotesque** (judul, angka) dan **Plus Jakarta Sans** (UI, buatan foundry Jakarta). Keduanya punya digit tabular (`tnum`, sudah diuji: lebar "1111" = "8888"), sehingga timer tidak bergoyang.

## 2. Aturan kemudahan (tidak boleh dilanggar demi gaya)

1. Satu tombol primary per layar, selalu di bawah, tinggi 60 px.
2. Warna selalu disertai teks: bib menulis "TEMPO", status menulis "Tertinggal".
3. Warna pastel (status, zona terang) hanya untuk isian dengan teks charcoal. Untuk teks/ikon berwarna pakai varian `-ink`.
4. Angka (pace, jarak, waktu) selalu `font.family.display` + `tnum`.
5. Animasi maksimal 320 ms dan dimatikan saat setting "kurangi gerakan" aktif. Easing `stride` hanya untuk progres bertambah.
6. Setiap perubahan token warna wajib lolos `check_contrast.py`.

## 3. Arti warna

| Grup | Token | Arti |
|------|-------|------|
| Aksi | `primary` | Aksi utama, progres aktif |
| Hasil | `success` (hijau hutan) | Target tercapai, minggu tuntas, rekor |
| Status plan | `status.on-track` mint | Sesuai plan |
| | `status.attention` pasir | RPE tinggi atau 1 latihan terlewat |
| | `status.behind` koral | >= 2 terlewat, minggu diulang |
| | `status.recovery` lavender | Cutback week, Return to run, plan dijeda |
| Zona | `zone.recovery` sampai `zone.interval` | Skala panas intensitas (lihat ciri 1) |
| | `zone.strength` charcoal | Strength/core/mobility (fase 2) |
| Fase | base, build, peak, taper | Mengikuti skala panas: peach, peach tua, oranye, lavender |

`status.recovery` dan `zone.recovery` sengaja sama: artinya sama (pemulihan).

## 4. Komponen inti

| Komponen | Anatomi | Varian | State |
|----------|---------|--------|-------|
| PrimaryButton | Stadium, tinggi 60, teks `button`, ikon opsional di kiri | primary (oranye), dark (charcoal, teks krem) | default, ditekan (turun 2 px, bayangan hilang), nonaktif (opacity 40%), loading (teks diganti 3 titik berlari) |
| SecondaryButton | Stadium, tinggi 48, border `control` | outline, ghost | sama |
| BibTag | Kotak radius 6, isi warna zona, teks `bib` kapital, 4 titik peniti 3 px | per zona | statis |
| WorkoutCard | Kartu radius 24 + bayangan `card`; bib, angka besar (durasi/jarak), daftar segmen dengan garis lajur warna zona, tombol primary | hari ini, istirahat, selesai (bib + centang `success`) | default, ditekan |
| TrackRing | Oval lintasan, stroke 10, track `surface-sunken`, progres warna zona/primary, ujung bulat | kepatuhan, timer, minggu tuntas | animasi `stride` saat bertambah |
| LaneWeek | 7 lajur vertikal, isi warna zona, hari ini diberi garis start (charcoal) | | selesai (isi penuh), terjadwal (outline), terlewat (garis putus `status.behind-ink`) |
| StatusChip | Stadium tinggi 28, isi status, teks charcoal + ikon | 4 status | statis |
| RpePicker | 10 tombol 44 x 48 dalam 1 baris; terpilih memakai warna `rpe.*` | | default, terpilih |
| Stepper | Tombol - / + bulat 60, angka `number-xl` di tengah | | min/maks: tombol nonaktif |
| TimerDisplay (gelap) | TrackRing besar, angka `timer`, nama segmen di bib, target pace, segmen berikut | per zona | running, paused (angka berkedip pelan, label "DIJEDA") |
| SegmentedControl | Track `surface-sunken` stadium, item terpilih kartu putih | 2-3 item | |
| InfoBox | Radius 16, isi tint status, ikon + teks | info, ok, warn | |
| TabBar | 4 tab, ikon 24 + label `caption`; aktif: ikon terisi + garis lajur oranye di atas | | |

## 5. Pemakaian per layar wireframe

Wireframe di `docs/wireframes/` dibuat sebelum design system ini (masih biru/abu-abu). **Tata letak** tetap mengikuti wireframe; **warna, tipe dan bentuk** mengikuti dokumen ini. Contoh pemetaan: kotak hitam "Mulai latihan" (2.1) menjadi PrimaryButton oranye; progress ring kepatuhan (3.3) menjadi TrackRing; strip 7 hari (2.1) menjadi LaneWeek; chip "TEMPO" menjadi BibTag.

## 6. Font di app

Expo: paket `@expo-google-fonts/bricolage-grotesque` dan `@expo-google-fonts/plus-jakarta-sans` (dimuat saat start, tanpa koneksi setelah build). Lisensi keduanya SIL Open Font License (cek ulang saat setup).

## 7. Aset (logo, ikon app, ikon)

Ada di [`assets/`](assets/README.md): logo mark lintasan + wordmark, ikon app iOS/Android/web, splash, dan 40 ikon garis 24 px. Karakter animasi latihan belum ada (lihat bagian "Belum ada" di sana).
