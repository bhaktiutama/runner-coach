# 01. Product Requirements Document (PRD)

Status: Draft v0.1 (2026-10-27) | Detail latar belakang: `docs/PLANNING.md` bagian 1, 2, 8, 9

## Ringkasan

- Runner Coach memberi tahu pelari **apa yang harus dilari hari ini**, memandu lewat **timer interval**, dan menunjukkan **progres**.
- Target MVP: pelari Pemula dan Rekreasional dengan target 5K, 10K, HM, FM. Web, iOS, Android.
- MVP 100% gratis. Sukses diukur dari aktivasi dan retensi, bukan pendapatan.

## 1. Problem

Semua masih hipotesis; divalidasi lewat `docs/SURVEY.md`.

| ID | Problem |
|----|---------|
| P1 | Tidak tahu harus lari apa hari ini (jarak, pace, jenis latihan) |
| P2 | Program gratis (PDF, YouTube) tidak menyesuaikan kondisi dan jadwal |
| P3 | Aplikasi yang ada terlalu rumit atau mahal untuk pelari rekreasional |
| P4 | Sulit melihat apakah benar-benar membaik |

## 2. Persona

| Persona | Profil | Target | Di MVP? |
|---------|--------|--------|---------|
| Pemula | 0-10 km/minggu, belum rutin | Finish 5K tanpa berhenti | Ya |
| Rekreasional | 2-3x/minggu, 10-25 km/minggu | Sub-60 10K, HM pertama | Ya |
| Ambisius | 25-60 km/minggu, pernah race | PB HM/FM | Tidak (fase 2+) |

## 3. Fitur MVP

Prioritas: Must = wajib untuk beta, Should = boleh menyusul di fase 2 jika waktu habis.

| ID | Fitur | Prioritas | Kriteria diterima (acceptance criteria) |
|----|-------|-----------|------------------------------------------|
| F-01 | Akun & login | Must | Login email, Google, Apple. Data tersimpan di cloud dan muncul di device lain |
| F-02 | Onboarding | Must | Maks 6 layar. Selesai dengan preview plan + tombol "Mulai Plan" |
| F-03 | Plan generator | Must | Menghasilkan plan 5K/10K/HM/FM sesuai tanggal race, hari tersedia, level. Lolos semua aturan keamanan di TRD 4 |
| F-04 | Layar "Hari ini" | Must | Menampilkan latihan hari ini (atau "Istirahat") + tombol Mulai dalam 1 layar tanpa scroll di HP |
| F-05 | Workout timer | Must | Countdown per segmen, warna zona, suara + getar saat ganti segmen, tetap memberi cue saat layar terkunci |
| F-06 | Log + RPE | Must | Simpan jarak, durasi, RPE 1-10 dalam 1 layar. Bisa tanpa timer (log manual) |
| F-07 | Progres | Must | 3 grafik: volume mingguan, tren pace easy run, kepatuhan plan |
| F-08 | Kalender plan | Must | Lihat per minggu, pindahkan latihan ke hari lain di minggu yang sama |
| F-09 | Jeda plan (cedera/sakit) | Must | 1 tombol menjeda plan; saat lanjut, app menawarkan minggu "kembali lari" |
| F-10 | Hapus akun | Must | Hapus akun + semua data dari dalam app |
| F-11 | Penyesuaian plan dasar | Should | Aturan rule-based dari RPE dan latihan terlewat (TRD 4.2) |
| F-12 | Notifikasi pengingat | Should | Pengingat di jam yang dipilih pengguna, bisa dimatikan |
| F-13 | Export data | Should | Unduh semua data pengguna dalam JSON |

## 4. Di luar MVP

| Item | Kapan |
|------|-------|
| Sinkron Strava, Apple Health, Health Connect | Fase 2 |
| Paywall Premium (RevenueCat + Stripe) | Fase 3 |
| GPS tracking sendiri | Diputuskan setelah survey (D2) |
| Library gerakan + animasi (drill, strength, core) | Backlog, lihat `docs/ANIMATION_PIPELINE.md` |
| Sosial, leaderboard, AI coach, app jam native | Fase 4 |

## 5. Metrik sukses

Definisi dari PLANNING bagian 9. Target angka **belum ditetapkan**; ditentukan dari baseline beta.

| Metrik | Definisi |
|--------|----------|
| Aktivasi | % pengguna yang selesai onboarding DAN 1 latihan dalam 7 hari |
| Retensi W1 / W4 | % pengguna yang mencatat >= 1 latihan di minggu ke-1 / ke-4 |
| Kepatuhan plan | Latihan selesai / latihan terjadwal per minggu |

Exit criteria beta: 50-100 beta tester aktif (PLANNING bagian 7).

## 6. Keputusan terbuka

| ID | Pertanyaan | Default sementara |
|----|-----------|-------------------|
| D1 | Persona utama: pemula atau rekreasional? | Keduanya |
| D2 | GPS sendiri atau cukup integrasi? | Tanpa GPS |
| D3 | Pace atau HR sebagai default? | Pace |
| D5 | Nama dan brand | "Runner Coach" (nama kerja) |
| D6 | Pelatih bersertifikat untuk review aturan plan | Wajib sebelum beta publik |
