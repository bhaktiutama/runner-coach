# Spec-Driven Development: Runner Coach

Status: Draft v0.2 (2026-10-28), disinkronkan dengan wireframe

Folder ini adalah **acuan build**. `docs/PLANNING.md` tetap jadi latar belakang (riset, alasan, monetisasi). Jika ada konflik, dokumen di folder ini yang dipakai.

**Acuan visual:** [`docs/wireframes/`](../wireframes/README.md), 21 layar HP dalam 4 journey, diekspor dari artifact "Runner Coach Wireframes" (https://claude.ai/artifact/69xQ9s7SxafNVUKL2vWxka). Nomor layar (1.1 sampai 4.4) dipakai di semua spec.

## Urutan baca (total ~20 menit)

| # | Dokumen | Pertanyaan yang dijawab | Waktu baca |
|---|---------|-------------------------|------------|
| 1 | [01-PRD.md](01-PRD.md) | Untuk siapa, kenapa, fitur apa | 4 menit |
| 2 | [02-TRD.md](02-TRD.md) | Pakai teknologi apa, batasannya apa | 3 menit |
| 3 | [03-APP-FLOW.md](03-APP-FLOW.md) | Langkah pengguna per layar wireframe, state | 5 menit |
| 4 | [04-UI-UX.md](04-UI-UX.md) | Token desain dari wireframe, komponen | 3 menit |
| 5 | [05-BACKEND-SCHEMA.md](05-BACKEND-SCHEMA.md) | Tabel, kolom, RLS, API | 4 menit |
| 6 | [06-IMPLEMENTATION-PLAN.md](06-IMPLEMENTATION-PLAN.md) | Urutan build, test, cek selesai | 3 menit |

Waktu baca adalah perkiraan kasar, bukan hasil ukur.

## Aturan pakai untuk AI agent

1. Sebelum mengerjakan fitur, baca baris fitur di PRD (ID `F-xx`), flow + nomor layar di App Flow, dan tabel terkait di Schema.
2. Tampilan mengikuti layar wireframe dengan nomor yang sama. Token warna/ukuran dari `04-UI-UX.md`, bukan dari hex di wireframe langsung.
3. Jangan menambah library, tabel, atau layar yang tidak ada di spec. Jika perlu, usulkan perubahan spec dulu.
4. Setiap perubahan perilaku = update spec di PR yang sama.

## Revisi terhadap PLANNING.md

| # | Revisi | Alasan |
|---|--------|--------|
| R1 | "Jeda plan (cedera/sakit)" jadi Must (F-09), layar 4.3 | Fitur keselamatan; ada di PLANNING 4.6 dan wireframe |
| R2 | Hapus akun dari dalam app jadi Must (F-10) | Aturan Apple + hak pengguna UU PDP. Cek ulang aturan terbaru sebelum rilis |
| R3 | Semua tabel milik pengguna punya `user_id` langsung | RLS cukup `user_id = auth.uid()` |
| R4 | Tanggal lahir dan jenis kelamin tidak dikumpulkan di MVP | Wireframe tidak memintanya; data pribadi seminimal mungkin |
| R5 | Jawaban screening kesehatan tidak disimpan, hanya flag + waktu persetujuan disclaimer | Data kesehatan sensitif |
| R6 | `activities.planned_workout_id` ditambahkan | Pencocokan aktivitas ke latihan cukup 1 kolom |
| R7 | Token Strava tidak bisa dibaca client sama sekali | Hanya Edge Function |
| R8 | Library gerakan + animasi masuk backlog | PLANNING 2.2 menaruh plan kekuatan di luar MVP |
| R9 | Sinkron offline: UUID dari client + last-write-wins | Aturan konflik belum ada di PLANNING |

## Revisi dari wireframe (v0.2)

| # | Revisi | Layar |
|---|--------|-------|
| W1 | Login dipindah ke **akhir** onboarding, setelah preview plan. Data onboarding disimpan lokal dulu | 1.1, 1.8 |
| W2 | Target baru "Bugar" (tanpa target jarak) | 1.2 |
| W3 | Onboarding juga menanyakan nama race (opsional), lari terjauh 4 minggu, jam pengingat | 1.3, 1.5, 1.6 |
| W4 | Warna zona ikut wireframe: Easy biru, Long biru tua, Tempo kuning-oranye (amber), Interval merah | Semua |
| W5 | Tema app terang; layar Timer gelap. Mode gelap penuh ditunda | Semua |
| W6 | Layar baru: Detail latihan (2.2), Ringkasan minggu + usulan adaptasi (2.5), Detail aktivitas (3.4) | 2.2, 2.5, 3.4 |
| W7 | Progres menampilkan prediksi waktu race (rentang). Gratis di MVP; batas Free/Premium diputuskan di fase 3 | 3.3 |
| W8 | Feedback punya tag catatan cepat (Cuaca panas, Kurang tidur, Kaki pegal, Ada nyeri) | 2.4 |
| W9 | Jeda plan menyimpan alasan + perkiraan durasi; setelah jeda selalu mulai dengan 1 minggu "Return to run" | 4.3 |
| W10 | Pindah latihan dicek aturan dan bisa menggabungkan 2 latihan | 3.2 |

## Keputusan terbuka dari sinkronisasi

| # | Pertanyaan | Default sementara |
|---|-----------|-------------------|
| O1 | Layar Log manual, konfirmasi Hapus akun, dan form Login email belum ada di wireframe (menu Hapus akun dan Privasi & export data sudah ada di 4.1) | Dibangun dengan pola komponen yang sama; wireframe menyusul |
| O2 | Isi plan "Bugar" (W2) | Blok 8 minggu easy + 1 sesi kualitas, tanpa taper, bisa diulang. Perlu review pelatih |
| O3 | Screening "Ya" = "plan lebih ringan" (layar 1.7) | Tanpa sesi berat sampai pengguna mengubahnya. Perlu review pelatih |
