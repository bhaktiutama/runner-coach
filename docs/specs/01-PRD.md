# 01. Product Requirements Document (PRD)

Status: Draft v0.2 (2026-10-28) | Latar belakang: `docs/PLANNING.md` bagian 1, 2, 8, 9 | Layar: wireframe (lihat `README.md`)

## Ringkasan

- Run Coach memberi tahu pelari **apa yang harus dilari hari ini**, memandu lewat **timer interval**, dan menunjukkan **progres**.
- Target MVP: pelari Pemula dan Rekreasional dengan target 5K, 10K, HM, FM, atau sekadar bugar. Web, iOS, Android.
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
| Pemula | 0-10 km/minggu, belum rutin | Finish 5K tanpa berhenti, atau bugar | Ya |
| Rekreasional | 2-3x/minggu, 10-25 km/minggu | Sub-60 10K, HM pertama | Ya |
| Ambisius | 25-60 km/minggu, pernah race | PB HM/FM | Tidak (fase 2+) |

## 3. Fitur MVP

Prioritas: Must = wajib untuk beta, Should = boleh menyusul di fase 2 jika waktu habis.

| ID | Fitur | Layar | Prioritas | Kriteria diterima |
|----|-------|-------|-----------|-------------------|
| F-01 | Akun & login | 1.1, 1.8 | Must | Apple, Google, Email. Diminta **setelah** preview plan. "Sudah punya akun? Masuk" di 1.1. Data muncul di device lain |
| F-02 | Onboarding | 1.2-1.7 | Must | 6 langkah dengan progress bar. Data tersimpan lokal sebelum login |
| F-03 | Plan generator | 1.8 | Must | Plan 5K/10K/HM/FM/Bugar sesuai tanggal race, hari tersedia, kemampuan. Preview: target waktu, hari per minggu, grafik volume per fase, zona pace. Lolos aturan TRD 4 |
| F-04 | Hari ini + detail latihan | 2.1, 2.2 | Must | Kartu latihan + Mulai dalam 1 layar. Detail: segmen, grafik intensitas, "Kenapa latihan ini?", Pindah hari, Ganti jadi easy |
| F-05 | Workout timer | 2.3 | Must | Countdown per segmen, sisa total, target pace, segmen berikut, Jeda/Akhiri. Suara + getar per segmen, juga saat layar terkunci |
| F-06 | Selesai + RPE | 2.4 | Must | Durasi, jarak (bisa diedit), pace rata-rata, RPE 1-10 dengan deskripsi, tag catatan opsional, Simpan |
| F-07 | Progres | 3.3 | Must | Rentang 8 mgg / Plan / Semua; volume mingguan, tren pace easy run, kepatuhan, prediksi race (rentang), aktivitas terakhir |
| F-08 | Kalender + pindah latihan | 3.1, 3.2 | Must | Bar fase Base/Build/Peak/Taper, daftar minggu. Pindah ke hari lain dengan pesan cek aturan; bisa gabung 2 latihan; Lewati |
| F-09 | Jeda plan | 4.3 | Must | Alasan (Cedera/Sakit/Sibuk-libur), perkiraan durasi, bagian nyeri (opsional). Saat lanjut: 1 minggu "Return to run" |
| F-10 | Hapus akun | 4.1 (menu); konfirmasi belum ada (O1) | Must | Hapus akun + semua data dari dalam app |
| F-11 | Ringkasan minggu + adaptasi | 2.5 | Should | Muncul setelah latihan terakhir minggu itu. Usulan perubahan plan dengan alasan; "Oke, terapkan" / "Tetap plan awal" |
| F-12 | Pengingat | 1.6, 4.1 | Should | Jam pengingat dipilih di onboarding, bisa diubah/dimatikan di Profil |
| F-13 | Export data | 4.1 | Should | "Privasi & export data": unduh semua data dalam JSON |
| F-14 | Detail aktivitas | 3.4 | Should | Ringkasan, segmen vs target, split per km, RPE |
| F-15 | Log manual | Belum ada (O1) | Must | Catat lari tanpa timer: jarak, durasi, RPE |
| F-16 | Profil | 4.1 | Must | Target aktif, zona pace, hari & pengingat, jeda plan, satuan, akun |
| F-17 | ABC drill sebagai pemanasan | 2.2, 2.3 (belum ada di wireframe, O4) | Should | Tempo dan Interval diawali segmen drill 8-12 mnt. Timer menampilkan nama gerakan, dosis (mis. 2 x 20 m) dan cue teknik |

## 4. Di luar MVP

| Item | Kapan | Catatan wireframe |
|------|-------|-------------------|
| Sinkron Strava, Apple Health, Health Connect | Fase 2 | Layar 4.2; tautan "Isi otomatis dari Strava" di 1.4 dan status sinkron di 2.1 disembunyikan di MVP |
| Panduan intensitas detak jantung | Fase 2 | Pilihan "Detak jantung" di 2.2 nonaktif sampai ada data HR |
| Paywall Premium | Fase 3 | Layar 4.4; kartu "Coba Premium" di 4.1 disembunyikan di MVP |
| Bagikan kartu ringkasan | Fase 4 | Tombol di 2.5 disembunyikan di MVP |
| Strength kaki + core bodyweight 2x/minggu | Fase 2 (gratis, uji minat) | PLANNING 4.7; butuh wireframe kartu strength + mode gerakan di timer |
| Strength lanjutan (beban, plyometrik), mobility, library gerakan + animasi Rive | Fase 3 (Premium) | PLANNING 4.7, 8.2; format animasi = D8 |
| GPS sendiri, sosial, AI coach, app jam native | Fase 4 / backlog | |

## 5. Metrik sukses

Definisi dari PLANNING bagian 9. Target angka **belum ditetapkan**; ditentukan dari baseline beta.

| Metrik | Definisi |
|--------|----------|
| Aktivasi | % pengguna yang selesai onboarding DAN 1 latihan dalam 7 hari |
| Retensi W1 / W4 | % pengguna yang mencatat >= 1 latihan di minggu ke-1 / ke-4 |
| Kepatuhan plan | Latihan selesai / latihan terjadwal per minggu |

Target UX dari wireframe (belum diukur): plan jadi dalam < 2 menit; dari buka app sampai timer jalan = 1 tap.

Exit criteria beta: 50-100 beta tester aktif (PLANNING bagian 7).

## 6. Keputusan terbuka

| ID | Pertanyaan | Default sementara |
|----|-----------|-------------------|
| D1 | Persona utama: pemula atau rekreasional? | Keduanya |
| D2 | GPS sendiri atau cukup integrasi? | Tanpa GPS |
| D3 | Pace atau HR sebagai default? | Pace (pengguna bisa pilih RPE di 2.2) |
| D5 | Nama dan brand | "Run Coach" (nama kerja, dipakai di 1.1). Cek merek dagang dan ketersediaan nama di App Store, Play Store dan domain belum dilakukan |
| D6 | Pelatih bersertifikat untuk review aturan plan | Wajib sebelum beta publik |
| O1-O3 | Lihat `README.md` | |
