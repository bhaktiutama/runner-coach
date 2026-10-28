# 04. UI/UX Design Brief

Status: Draft v0.2 (2026-10-28) | Acuan visual: wireframe "Runner Coach Wireframes" (https://claude.ai/artifact/69xQ9s7SxafNVUKL2vWxka)

## Ringkasan

- Ikuti wireframe per nomor layar. Token di bawah diambil dari wireframe supaya kode tidak menyalin hex satu per satu.
- Tema terang, netral abu-abu (zinc); layar Timer gelap. Warna = zona intensitas, selalu disertai label teks.
- Mobile-first (390 x 844). Di web, konten tetap satu kolom dengan lebar maksimum.

## 1. Prinsip

1. Satu keputusan per layar; satu tombol utama hitam di bawah.
2. Angka besar, teks sedikit. Timer terbaca dari jarak lengan.
3. Warna = zona intensitas, selalu disertai label teks.
4. Feedback 1 tap (RPE).
5. Sapaan "kamu", kalimat pendek (sesuai wireframe).

## 2. Design token (`packages/ui/tokens.ts`)

Tidak boleh ada hex langsung di komponen.

### 2.1 Netral & status

| Token | Hex | Dipakai untuk |
|-------|-----|---------------|
| bg | #FFFFFF | Latar layar |
| surface | #F4F4F5 | Kartu statistik, segmented control |
| ink | #18181B | Teks utama, tombol utama |
| muted | #52525B | Teks kedua |
| subtle | #71717A | Keterangan kecil, ikon |
| line | #E4E4E7 | Border, garis, hari istirahat |
| line-strong | #D4D4D8 | Border tombol sekunder |
| link | #1D4ED8 | Tautan |
| success | #15803D | "Selesai", perubahan positif |
| danger | #B91C1C | Aksi berisiko (Jeda plan, nyeri) |
| info-bg / info-fg | #EFF6FF / #1E3A8A | Kotak informasi |
| ok-bg / ok-fg | #ECFDF5 / #065F46 | Kotak validasi positif |
| warn-bg / warn-fg | #FFF7ED / #7C2D12 | Kotak peringatan |

Timer (gelap): bg #0A0A0A, teks #FAFAFA, teks kedua #A1A1AA.

### 2.2 Zona intensitas

| Tipe latihan | Hex | Catatan |
|--------------|-----|---------|
| Easy, Run-walk, Easy + strides | #2563EB | Biru |
| Long run | #1E3A8A | Biru tua |
| Tempo / Threshold | #F59E0B | Amber |
| Interval | #DC2626 | Merah |
| Istirahat / Recovery | #E4E4E7 | Abu-abu |

Teks di atas amber memakai ink gelap, bukan putih (kontras).

### 2.3 Fase plan

| Fase | Hex |
|------|-----|
| Base | #93C5FD |
| Build | #2563EB |
| Peak | #F59E0B |
| Taper | #A1A1AA |

### 2.4 Skala RPE (layar 2.4)

| RPE | Latar | Contoh deskripsi |
|-----|-------|------------------|
| 1-3 | #DBEAFE | "Ringan, bisa ngobrol lancar" |
| 4-7 | #FEF3C7 | "Berat tapi terkontrol" |
| 8-10 | #FEE2E2 | "Berat, sulit bicara" / "Maksimal" |

### 2.5 Tipografi (Inter, fallback font sistem)

| Peran | Ukuran / berat |
|-------|----------------|
| Angka timer | 84 / 800, angka tabular |
| Angka input besar (volume) | 72 / 800 |
| Judul sambutan (1.1) | 34 / 800 |
| Judul layar | 28 / 800 |
| Angka statistik | 18-26 / 800 |
| Teks tombol utama | 17 / 700 |
| Teks | 15-16 / 400-600 |
| Label | 13 / 600 |
| Keterangan | 11-12 / 600 |

### 2.6 Ukuran & bentuk

| Token | Nilai |
|-------|-------|
| Padding layar | 24 kiri-kanan |
| Spasi | 4, 8, 12, 16, 20, 24, 28, 32 |
| Tombol utama | Tinggi 56, radius 16 |
| Tombol sekunder | Tinggi 44-52, radius 12-14 |
| Kartu pilihan | Radius 18, border 1.5 (terpilih: 2.5 ink + latar surface) |
| Chip | Tinggi 40, radius 20 (area sentuh tetap 44) |
| Input | Tinggi 48, radius 12 |
| Area sentuh minimum | 44 x 44 |

## 3. Komponen inti (`packages/ui`)

| Komponen | Layar | Perilaku |
|----------|-------|----------|
| OnboardingHeader | 1.2-1.7 | Kembali + progress bar 6 bagian + "x/6" |
| ChoiceCard | 1.2 | Kartu 2 kolom, centang saat dipilih |
| Stepper | 1.5 | Tombol - / + 60 px, angka besar |
| DayPicker | 1.6, 3.2 | 7 tombol hari, status pressed |
| InfoBox | 1.3, 1.6, 1.7 | Varian info / ok / warn dengan ikon |
| WorkoutCard | 2.1, 3.1 | Chip tipe (warna zona), jarak/durasi, segmen |
| SegmentBar | 2.2 | Grafik intensitas per segmen |
| TimerDisplay | 2.3 | Angka besar, "sisa dari", target pace, rasa, segmen berikut |
| RpePicker | 2.4 | 10 tombol + deskripsi dinamis |
| TagChips | 2.4, 4.3 | Pilihan ganda opsional |
| WeekStrip | 2.1 | 7 hari, titik warna zona, hari ini disorot |
| PhaseBar | 1.8, 3.1 | 4 fase berwarna |
| BarChart / LineTrend / StatRing | 1.8, 3.3 | Volume, tren pace, kepatuhan |
| PrimaryButton | Semua | Lebar penuh, hitam |
| TabBar | 2.1, 3.1, 3.3, 4.1 | 4 tab, ikon + label |

Setiap komponen punya state: default, ditekan, nonaktif, loading, error.

## 4. Layout & breakpoint

| Lebar | Layout |
|-------|--------|
| < 600 | HP: sesuai wireframe, tab bar bawah |
| 600-1023 | Tablet: tab bar bawah, konten maks 560 di tengah |
| >= 1024 | Web desktop: navigasi samping kiri, konten maks 640 di tengah |

## 5. Format angka

- Pace `6:45 /km`, jarak `5,2 km` (koma desimal), durasi `38:45`, total `2j 21m`.
- Tanggal `Selasa, 27 Okt`; rentang prediksi `1:05 - 1:08`.
- Placeholder yang belum ada datanya ditulis `[NAMA]`, `[HARGA]`, tidak diisi angka karangan.

## 6. Ditunda

- Mode gelap untuk seluruh app (token gelap dari `docs/prototypes/exercise-animations.html` sudah tersedia).
- Animasi karakter gerakan, kartu share, konfeti.
