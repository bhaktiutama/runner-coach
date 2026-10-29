# 04. UI/UX Design Brief

Status: Draft v0.3 (2026-10-29) | Tata letak: [`docs/wireframes/`](../wireframes/README.md) | Tampilan: [`docs/design-system/`](../design-system/README.md)

## Ringkasan

- **Tata letak** mengikuti wireframe per nomor layar. **Warna, tipe, bentuk** mengikuti design system "Lintas" (`docs/design-system/tokens.json`). Wireframe yang masih biru/abu-abu bukan acuan warna.
- Ciri khas: intensitas = skala panas, bentuk lintasan (stadium/oval), label bib, latar kertas hangat + tombol oranye bertulisan gelap.
- Mobile-first (390 x 844). Semua pasangan warna teks lolos WCAG, dicek otomatis.

## 1. Prinsip

1. Satu keputusan per layar; satu tombol primary (oranye) di bawah.
2. Angka besar, teks sedikit. Timer terbaca dari jarak lengan.
3. Warna = makna (zona, status), selalu disertai label teks.
4. Feedback 1 tap (RPE).
5. Sapaan "kamu", kalimat pendek.

## 2. Token

- Sumber tunggal: `docs/design-system/tokens.json` (format W3C Design Tokens). Di M1 file ini diubah otomatis jadi `packages/ui/tokens.ts`.
- **Tidak boleh ada hex atau ukuran lepas di komponen.** Butuh nilai baru = tambah token dulu.
- Perubahan warna wajib lolos `python3 docs/design-system/check_contrast.py` (saat ini 32/32 pasangan lolos).

Ringkasan isi (nilai lengkap di `tokens.json`):

| Grup | Isi |
|------|-----|
| Warna dasar | bg krem #FFF9F2, surface putih, text charcoal #242C32, primary oranye #F26B38 (teks di atasnya charcoal), accent peach #E9B79D, success hijau #477B63 |
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
| ChoiceCard | 1.2 |
| Stepper | 1.5 |
| DayPicker | 1.6, 3.2 |
| InfoBox | 1.3, 1.6, 1.7 |
| BibTag + WorkoutCard | 2.1, 2.2, 3.1 |
| SegmentBar | 2.2 |
| TimerDisplay + TrackRing | 2.3 |
| RpePicker, TagChips | 2.4, 4.3 |
| LaneWeek | 2.1, 3.1 |
| StatusChip | 2.1, 2.5, 3.1 |
| PhaseBar | 1.8, 3.1 |
| BarChart, LineTrend, TrackRing | 1.8, 3.3 |
| PrimaryButton, SecondaryButton, SegmentedControl, TabBar | Semua |

## 4. Layout & breakpoint

| Lebar | Layout |
|-------|--------|
| < 600 | HP: sesuai wireframe, tab bar bawah, padding 20 |
| 600-1023 | Tablet: tab bar bawah, konten maks 560 di tengah |
| >= 1024 | Web desktop: navigasi samping kiri, konten maks 640 di tengah |

## 5. Format angka

- Pace `6:45 /km`, jarak `5,2 km` (koma desimal), durasi `38:45`, total `2j 21m`.
- Tanggal `Selasa, 27 Okt`; rentang prediksi `1:05 - 1:08`.
- Placeholder yang belum ada datanya ditulis `[NAMA]`, `[HARGA]`, tidak diisi angka karangan.

## 6. Ditunda

- Mode gelap untuk seluruh app (token `color.dark` sudah ada, dipakai Timer).
- Animasi karakter Rive untuk gerakan (D8). MVP drill memakai teks + animasi SVG sederhana dari prototipe jika siap.
- Kartu share, konfeti.
