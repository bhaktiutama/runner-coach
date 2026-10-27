# 04. UI/UX Design Brief

Status: Draft v0.1 (2026-10-27) | Wireframe kasar: `docs/PLANNING.md` 3.4

## Ringkasan

- Prinsip: **satu keputusan per layar, angka besar, warna = zona intensitas**.
- Warna netral mengikuti prototipe (`docs/prototypes/exercise-animations.html`, skala abu-abu "zinc"); warna zona dipakai konsisten di timer, kalender, grafik.
- Mobile-first. Di web, konten tetap satu kolom dengan lebar maksimum.

## 1. Prinsip

1. Satu keputusan per layar.
2. Angka besar, teks sedikit. Timer terbaca dari jarak lengan.
3. Warna = zona intensitas, **selalu disertai label teks** (jangan hanya warna).
4. Feedback 1 tap (RPE).
5. Bisa dipakai satu tangan; tombol utama di bawah layar.

## 2. Design token

Semua warna dari token di `packages/ui/tokens.ts`. Tidak boleh ada hex langsung di komponen.

### 2.1 Netral (dari prototipe)

| Token | Light | Dark |
|-------|-------|------|
| bg | #FAFAFA | #0A0A0A |
| card | #FFFFFF | #18181B |
| ink (teks utama) | #18181B | #FAFAFA |
| muted (teks kedua) | #52525B | #A1A1AA |
| line (garis) | #E4E4E7 | #27272A |

Tema mengikuti sistem. Layar Timer **selalu dark** (kontras tinggi di luar ruangan).

### 2.2 Zona intensitas (usulan, cek kontras saat implementasi)

| Zona / tipe | Warna | Hex |
|-------------|-------|-----|
| Easy, Run-walk | Hijau | #16A34A |
| Long run | Biru | #2563EB |
| Strides | Kuning | #CA8A04 |
| Tempo / Threshold | Oranye | #EA580C |
| Interval | Merah | #DC2626 |
| Recovery / Rest | Abu-abu | #71717A |

### 2.3 Tipografi

| Peran | Ukuran | Berat |
|-------|--------|-------|
| Angka timer | 96 | Bold, angka tabular |
| Judul layar | 24 | Semibold |
| Judul kartu | 18 | Semibold |
| Teks | 16 | Regular |
| Keterangan | 13 | Regular |

Font: Inter, fallback font sistem. Ukuran dalam dp/px dan mengikuti setting ukuran teks sistem.

### 2.4 Lainnya

| Token | Nilai |
|-------|-------|
| Spasi | Kelipatan 4: 4, 8, 12, 16, 24, 32 |
| Radius | Kartu 16, tombol 12, chip 999 (pil) |
| Target sentuh | Min 48 x 48 |
| Animasi | Maks 250 ms; hormati setting "kurangi gerakan" |

## 3. Komponen inti (`packages/ui`)

| Komponen | Perilaku |
|----------|----------|
| WorkoutCard | Tipe (chip warna zona), jarak/durasi, ringkasan step, tombol Mulai |
| PrimaryButton | Lebar penuh, tinggi 56, satu per layar |
| TimerDisplay | Angka besar, nama segmen, target pace, progress ring warna zona |
| SegmentList | Segmen sekarang disorot, berikutnya ditampilkan di bawah |
| RpePicker | 10 tombol 1-10 dengan label "mudah / sedang / berat" |
| WeekProgressBar | km selesai / km target minggu ini |
| WeekCalendar | 7 hari, titik warna zona, bisa tap untuk pindah |
| Chart | Bar (volume), garis (pace), angka + ring (kepatuhan) |
| EmptyState | Ilustrasi sederhana + 1 kalimat + 1 aksi |

Setiap komponen punya state: default, ditekan, nonaktif, loading, error.

## 4. Layout & breakpoint

| Lebar | Layout |
|-------|--------|
| < 600 | HP: tab bar bawah, konten penuh dengan padding 16 |
| 600-1023 | Tablet: tab bar bawah, konten maks 560 di tengah |
| >= 1024 | Web desktop: navigasi samping kiri, konten maks 640 di tengah |

## 5. Bahasa & copy

- Bahasa Indonesia, kalimat pendek, sapaan "kamu" (usulan; ubah jika brand memilih "Anda").
- Pace ditulis `5:45 /km`, jarak `6,1 km` (koma desimal Indonesia), durasi `38:20`.
- Hindari istilah teknis tanpa penjelasan: "Tempo" selalu disertai penjelasan singkat di detail latihan.

## 6. Tidak dipakai di MVP

- Animasi karakter gerakan (prototipe tetap jadi referensi gaya untuk fase lanjut).
- Konfeti hanya saat menyelesaikan 1 minggu penuh.
