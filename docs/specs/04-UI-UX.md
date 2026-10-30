# 04. UI/UX Design Brief

Status: Draft v0.4 (2026-10-29) | Tata letak: [`docs/wireframes/`](../wireframes/README.md) | Tampilan: [`docs/design-system/`](../design-system/README.md)

## Ringkasan

- **Tata letak** mengikuti wireframe per nomor layar; wireframe v0.3 sudah memakai Lintas, jadi warnanya juga bisa dijadikan acuan. Nilai pasti tetap dari `docs/design-system/tokens.json`.
- Ciri khas: intensitas = skala panas, bentuk lintasan (stadium/oval), label bib, latar kertas hangat + tombol oranye bertulisan gelap.
- Mobile-first (390 x 844). Semua pasangan warna teks lolos WCAG, dicek otomatis.

## 1. Prinsip

1. Satu keputusan per layar; satu tombol primary (oranye) di bawah.
2. Angka besar, teks sedikit. Timer terbaca dari jarak lengan.
3. Warna = makna (zona, status), selalu disertai label teks.
4. Feedback 1 tap (RPE).
5. Sapaan "kamu", kalimat pendek. Semua teks dari katalog `id.ts`, bukan ditulis langsung di komponen (TRD 8).

## 2. Token

- Sumber tunggal: `docs/design-system/tokens.json` (format W3C Design Tokens). Di M1 file ini diubah otomatis jadi `packages/ui/tokens.ts`.
- **Tidak boleh ada hex atau ukuran lepas di komponen.** Butuh nilai baru = tambah token dulu.
- Perubahan warna wajib lolos `python3 docs/design-system/check_contrast.py` (saat ini 39/39 pasangan lolos).

Ringkasan isi (nilai lengkap di `tokens.json`):

| Grup | Isi |
|------|-----|
| Warna dasar | bg abu-abu hangat #F5F4F2, surface putih, text charcoal #242C32, primary oranye #F26B38 (teks di atasnya charcoal), accent peach #E9B79D, success hijau #467861 |
| Status plan | On track #70D6B3, Perhatian #F2C66D, Tertinggal #FF806E, Recovery #A6B8FF; masing-masing punya varian `-ink` untuk teks |
| Zona (skala panas) | recovery lavender, easy peach, long #D9946F, tempo oranye, interval #B4361A, strength charcoal |
| Fase | base peach, build peach tua, peak oranye, taper lavender |
| RPE | 1-3 easy, 4-6 long, 7-8 tempo, 9-10 interval |
| Timer (gelap) | bg #161B1F, teks krem, interval memakai #E0522E |
| Tipe | Bricolage Grotesque (judul, angka, `tnum`), Plus Jakarta Sans (UI) |
| Bentuk | Radius kartu 24, stadium untuk tombol/chip, bib 6; bayangan keras 2 px |
| Ukuran | Tombol primary 60, sekunder 48, input 52, area sentuh min 44 |
| Gerak | 120 / 200 / 320 ms; easing `stride` hanya untuk progres |

## 3. Komponen inti (`packages/ui`)

Anatomi, varian dan state lengkap: `docs/design-system/README.md` bagian 4.

| Komponen | Layar |
|----------|-------|
| OnboardingHeader (progress 6 lajur) | 1.2-1.7 |
| AuthButtons (Apple, Google, Email) + PrivacyNote | 1.1, 1.8, 1.9, 4.5 |
| ChoiceCard | 1.2 |
| Stepper | 1.5 |
| DayPicker | 1.6, 3.2 |
| InfoBox | 1.3, 1.6, 1.7 |
| BibTag + WorkoutCard | 2.1, 2.2, 3.1 |
| SegmentBar | 2.2 |
| TimerDisplay + TrackRing | 2.3 |
| DrillStep (nama gerakan, set, cue, tombol Lanjut) | 2.3b |
| RpePicker, TagChips | 2.4, 2.6, 4.3 |
| SettingsRow, Switch, DangerButton | 4.1, 4.5, 4.6 |
| LaneWeek | 2.1, 3.1 |
| StatusChip | 2.1, 2.5, 3.1 |
| PhaseBar | 1.8, 3.1 |
| BarChart, LineTrend, TrackRing | 1.8, 3.3 |
| PrimaryButton, SecondaryButton, SegmentedControl, TabBar | Semua |
| Icon (`name`, `size`, `color`) dari `assets/icons/icons.json` | Semua |
| Logo (mark / horizontal) | 1.1, web |

## 4. Aset

Semua di `docs/design-system/assets/` (detail: README di folder itu). Di M1 disalin ke app.

| Aset | Pakai |
|------|-------|
| Logo mark + wordmark "run coach" | 1.1, header web |
| `icon.png`, `adaptive-icon.png` (+ monochrome), `splash-icon.png`, `favicon.png` | `app.json`: icon, adaptiveIcon (latar #F26B38), splash (latar #F5F4F2), web.favicon |
| 40 ikon garis 24 px | Komponen Icon; tab bar: today, plan, progress, profile |
| Karakter animasi gerakan | Belum ada (D8). MVP pakai teks + SVG prototipe |

## 5. Layout & breakpoint

| Lebar | Layout |
|-------|--------|
| < 600 | HP: sesuai wireframe, tab bar bawah, padding 20 |
| 600-1023 | Tablet: tab bar bawah, konten maks 560 di tengah |
| >= 1024 | Web desktop: navigasi samping kiri, konten maks 640 di tengah |

## 6. Format angka

- Semua angka dan tanggal lewat modul `format.ts` dengan locale `id-ID` (TRD 8); jangan format manual di komponen.
- Pace `6:45 /km`, jarak `5,2 km` (koma desimal), durasi `38:45`, total `2j 21m`.
- Tanggal `Selasa, 27 Okt`; rentang prediksi `1:05 - 1:08`.
- Placeholder yang belum ada datanya ditulis `[NAMA]`, `[HARGA]`, tidak diisi angka karangan.

## 7. Ditunda

- Mode gelap untuk seluruh app (token `color.dark` sudah ada, dipakai Timer).
- Animasi karakter Rive untuk gerakan (D8). MVP drill memakai teks + animasi SVG sederhana dari prototipe jika siap.
- Kartu share, konfeti.

## 8. Kesetiaan ke wireframe (v0.5, 2026-10-29)

- Ukuran pasti layar diambil dari sumber HTML wireframe (`docs/wireframes/source/*.dc.html`), bukan dari PNG. Skala tipe wireframe sudah masuk `tokens.json` (subtitle 15, label 13/700, control 14/600, control-sm 13, row 15/700, title 28/800, title-lg 32, stat 22/800, dst.).
- Garis kontrol memakai garis dalam (`ring()` di `packages/ui/src/theme.ts`, setara `inset box-shadow` wireframe), supaya isi tidak bergeser saat terpilih.
- Kontainer layar: padding atas min 56, samping 20, jarak antarblok 20 (24 untuk 1.2 dan 1.5), footer 12/20/32.
- Cek visual: `SHOTS_DIR=<folder> pnpm test:e2e e2e/compare.spec.ts` lalu `python3 scripts/compare-wireframes.py <folder>` (kiri wireframe, kanan app, @2x).
- Perbedaan yang disengaja: tautan "Isi otomatis dari Strava / Apple Health" (1.4) disembunyikan sampai fase 2 (PRD 5); lari terjauh punya pilihan "< 3 km" agar kriteria run-walk E-14 bisa terpenuhi.

## 9. Panduan dan hint (F-20, v0.6)

Belum ada wireframe; layar 4.7 memakai komponen yang sudah ada agar konsisten dengan 4.1 dan 4.5.

| Elemen | Aturan |
|---|---|
| Layar 4.7 | Header kembali + judul "Panduan & istilah" (pola 4.3). Grup berjudul `section-caps` (CARA KERJA PLAN, JENIS LARI, ISTILAH PENELITIAN, DASAR ILMIAH PLAN) berisi kartu lipat: judul `row`, isi `body-sm`. Topik dari hint terbuka otomatis dan digulir ke atas |
| Kartu aturan | Isi bahasa awam + pil tingkat bukti (sama dengan "Kenapa plan ini?") + "Lihat sumber" (tautan PubMed/DOI, dibuka di browser luar) |
| Hint (i) | Ikon `info` 18 px warna `text-muted` di samping label, area sentuh min 44 px, label aksesibilitas "Apa itu {istilah}?". Membuka 4.7 di topiknya. Tidak memakai popover agar sama di iOS, Android, web |
| Teks | Sapaan "kamu", tanpa singkatan tanpa penjelasan; angka contoh konkret (mis. "20 km -> paling banyak 22 km") |

