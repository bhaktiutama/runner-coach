# 01. Product Requirements Document (PRD)

Status: Draft v0.3 (2026-10-29) | Latar belakang: `docs/PLANNING.md` bagian 1, 2, 8, 9 | Layar: wireframe (lihat `README.md`)

## Ringkasan

- Run Coach memberi tahu pelari **apa yang harus dilari hari ini**, memandu lewat **timer interval**, dan menunjukkan **progres**.
- Target MVP: pelari Pemula dan Rekreasional dengan target 5K, 10K, HM, FM, atau sekadar bugar. Web, iOS, Android.
- Bahasa Indonesia di MVP; multibahasa untuk pasar global menyusul (D9).
- MVP 100% gratis. Sukses diukur dari aktivasi dan retensi, bukan pendapatan.
- **Privasi dulu:** semua data pribadi (target, plan, latihan, RPE, kesehatan) hanya tersimpan di HP pengguna. Server hanya menyimpan akun login. Ini juga jadi pembeda produk.

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

## 3. Prinsip privasi

| # | Prinsip | Akibat untuk fitur |
|---|---------|--------------------|
| PV-1 | Data pribadi hanya di perangkat | Tidak ada sinkron antar perangkat. Pindah HP lewat file backup (F-13, F-18) |
| PV-2 | Server hanya tahu akun login | Supabase menyimpan email + provider saja. Nama di app diisi sendiri, tidak diambil dari akun |
| PV-3 | Jujur soal risikonya | 1.8 dan 4.5 menjelaskan: tanpa backup, HP hilang = data hilang |
| PV-4 | Pengguna pegang kendali | Backup, pulihkan, hapus data di HP, hapus akun, matikan data pemakaian anonim, semua dari 4.5 |
| PV-5 | Analitik tanpa data pribadi | Tidak ada nilai kesehatan atau identitas di event (TRD 6) |

Detail teknis: TRD bagian 3 dan 6, Schema bagian 4 dan 5.

## 4. Fitur MVP

Prioritas: Must = wajib untuk beta, Should = boleh menyusul di fase 2 jika waktu habis.

| ID | Fitur | Layar | Prioritas | Kriteria diterima |
|----|-------|-------|-----------|-------------------|
| F-01 | Akun & login | 1.1, 1.8, 1.9 | Must | Apple, Google, Email. Diminta **setelah** preview plan. "Sudah punya akun? Masuk" di 1.1 -> 1.9. Akun hanya untuk masuk; data tetap di perangkat. Login di HP tanpa data: tawarkan pulihkan dari file (F-18) |
| F-02 | Onboarding | 1.2-1.7 | Must | 6 langkah dengan progress bar. Data tersimpan lokal sebelum login |
| F-03 | Plan generator | 1.8 | Must | Plan 5K/10K/HM/FM/Bugar sesuai tanggal race, hari tersedia, kemampuan. Preview: target waktu, hari per minggu, grafik volume per fase, zona pace, bagian "Kenapa plan ini?" (alasan + tingkat bukti + sumber per aturan, 07 bagian 3). Lolos aturan TRD 4 |
| F-04 | Hari ini + detail latihan | 2.1, 2.2 | Must | Kartu latihan + Mulai dalam 1 layar. Detail: segmen, grafik intensitas, "Kenapa latihan ini?" dari rationale engine (07 bagian 3), Pindah hari, Ganti jadi easy |
| F-05 | Workout timer | 2.3 | Must | Countdown per segmen, sisa total, target pace, segmen berikut, Jeda/Akhiri. Suara + getar per segmen, juga saat layar terkunci |
| F-06 | Selesai + RPE | 2.4 | Must | Durasi, jarak (bisa diedit), pace rata-rata, RPE 1-10 dengan deskripsi, tag catatan opsional, Simpan |
| F-07 | Progres | 3.3 | Must | Rentang 8 mgg / Plan / Semua; volume mingguan, tren pace easy run, kepatuhan, prediksi race (rentang), aktivitas terakhir |
| F-08 | Kalender + pindah latihan | 3.1, 3.2 | Must | Bar fase Base/Build/Peak/Taper, daftar minggu. Pindah ke hari lain dengan pesan cek aturan; bisa gabung 2 latihan; Lewati |
| F-09 | Jeda plan | 4.3 | Must | Alasan (Cedera/Sakit/Sibuk-libur), perkiraan durasi, bagian nyeri (opsional). Saat lanjut: 1 minggu "Return to run" |
| F-10 | Hapus akun | 4.5 -> 4.6 | Must | Ketik "HAPUS". Akun Auth di server dihapus + semua data di perangkat dihapus. Tawarkan backup dulu |
| F-11 | Ringkasan minggu + adaptasi | 2.5 | Should | Muncul setelah latihan terakhir minggu itu. Usulan perubahan plan dengan alasan (template aturan `E-xx`, 07 bagian 3.2); "Oke, terapkan" / "Tetap plan awal" |
| F-12 | Pengingat | 1.6, 4.1 | Should | Jam pengingat dipilih di onboarding, bisa diubah/dimatikan di Profil. Notifikasi lokal hanya di hari latihan, tidak saat plan dijeda, isi tanpa data kesehatan. Izin diminta di 1.6; jika ditolak, Profil menampilkan status + tombol ke pengaturan. Web: tidak didukung di MVP. Detail TRD 9 |
| F-13 | Backup data | 4.5 | **Must** | "Backup ke file": semua data lokal ke 1 file JSON lewat share sheet. Tampilkan "Backup terakhir". Pengingat setelah 30 hari |
| F-14 | Detail aktivitas | 3.4 | Should | Ringkasan, segmen vs target, split per km, RPE |
| F-15 | Log manual | 2.6 | Must | Catat lari tanpa timer: tanggal, jarak, durasi, RPE, tag. Dicocokkan ke latihan hari itu |
| F-16 | Profil | 4.1 | Must | Target aktif, zona pace, hari & pengingat, jeda plan, satuan, menu Data & privasi |
| F-17 | ABC drill sebagai pemanasan | 2.2, 2.3b | Should | Tempo dan Interval diawali segmen drill 8-12 mnt. Timer menampilkan nama gerakan, dosis (mis. 2 x 20 m) dan cue teknik; "Lanjut" per set |
| F-18 | Pulihkan dari file | 4.5, 1.9 | Must | Pilih file backup, lihat ringkasan isi, konfirmasi, data lokal diganti. File dari versi app lebih baru ditolak dengan pesan jelas |
| F-20 | Panduan & istilah | 4.7, hint (i) di 1.8, 2.1, 2.2, 2.4, 2.6, 3.1, 3.3 | Should | Penjelasan bahasa awam: cara kerja plan, istilah (volume, volume puncak, pace, zona, RPE, fase, taper, cutback), jenis lari (easy, recovery, long, tempo, interval, progression, strides, run-walk, drill) dan dasar ilmiah tiap aturan engine (tingkat bukti + sumber dari registri 07). Offline, teks dari katalog i18n. Tombol (i) di samping istilah membuka 4.7 langsung ke topiknya |
| F-19 | Data & privasi | 4.5 | Must | Satu layar: data tersimpan di HP ini, backup, pulihkan, sakelar data pemakaian anonim, keluar (+ opsi hapus data di HP), hapus akun |

## 5. Di luar MVP

| Item | Kapan | Catatan wireframe |
|------|-------|-------------------|
| Ambil data dari Strava, Apple Health, Health Connect (hasilnya tetap disimpan di HP) | Fase 2 | Layar 4.2; tautan "Isi otomatis dari Strava" di 1.4 dan status sinkron di 2.1 disembunyikan di MVP |
| Panduan intensitas detak jantung | Fase 2 | Pilihan "Detak jantung" di 2.2 nonaktif sampai ada data HR |
| Paywall Premium | Fase 3 | Layar 4.4; kartu "Coba Premium" di 4.1 disembunyikan di MVP |
| Bagikan kartu ringkasan | Fase 4 | Tombol di 2.5 disembunyikan di MVP |
| Strength kaki + core bodyweight 2x/minggu | Fase 2 (gratis, uji minat) | PLANNING 4.7; butuh wireframe kartu strength + mode gerakan di timer |
| Strength lanjutan (beban, plyometrik), mobility, library gerakan + animasi Rive | Fase 3 (Premium) | PLANNING 4.7, 8.2; format animasi = D8 |
| Multibahasa (mulai bahasa Inggris) untuk pasar global | Fase lanjut (D9) | Pemilih bahasa di 4.1. Kode MVP sudah disiapkan (TRD 8) |
| GPS sendiri, sosial, AI coach, app jam native | Fase 4 / backlog | |

## 6. Metrik sukses

Definisi dari PLANNING bagian 9, dihitung dari event analitik anonim (tanpa data pribadi, TRD 6). Target angka **belum ditetapkan**; ditentukan dari baseline beta.

| Metrik | Definisi |
|--------|----------|
| Aktivasi | % pengguna yang selesai onboarding DAN 1 latihan dalam 7 hari |
| Retensi W1 / W4 | % pengguna yang mencatat >= 1 latihan di minggu ke-1 / ke-4 |
| Kepatuhan plan | Latihan selesai / latihan terjadwal per minggu |

Target UX dari wireframe (belum diukur): plan jadi dalam < 2 menit; dari buka app sampai timer jalan = 1 tap.

Exit criteria beta: 50-100 beta tester aktif (PLANNING bagian 7).

## 7. Keputusan terbuka

| ID | Pertanyaan | Default sementara |
|----|-----------|-------------------|
| D1 | Persona utama: pemula atau rekreasional? | Keduanya |
| D2 | GPS sendiri atau cukup integrasi? | Tanpa GPS |
| D3 | Pace atau HR sebagai default? | Pace (pengguna bisa pilih RPE di 2.2) |
| D5 | Nama dan brand | "Run Coach" (nama kerja, dipakai di 1.1). Cek merek dagang dan ketersediaan nama di App Store, Play Store dan domain belum dilakukan |
| D6 | Pelatih bersertifikat untuk review aturan plan | Wajib sebelum beta publik |
| D9 | Multibahasa untuk pasar global: bahasa kedua, library i18n, kapan rilis | MVP bahasa Indonesia saja; teks lewat katalog dan format lewat `Intl` sejak M1 (TRD 8) |
| P1 | Login wajib di 1.8 atau boleh "Nanti saja"? Tanpa sinkron, login di MVP belum memberi manfaat langsung ke pengguna (dipakai untuk Premium di fase 3) | Wajib, sesuai keputusan pemilik produk. Pantau drop-off di 1.8; jika tinggi, jadikan opsional |
| P2 | File backup berpassword (terenkripsi) | Tidak di MVP |
| P3 | Backup cloud terenkripsi end-to-end (server tidak bisa membaca) sebagai opt-in, untuk pindah HP tanpa file | Tidak di MVP; dievaluasi setelah beta |
| O1-O4 | Lihat `README.md` | |
