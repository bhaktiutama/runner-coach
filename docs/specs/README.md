# Spec-Driven Development: Runner Coach

Status: Draft v0.1 (2026-10-27)

Folder ini adalah **acuan build**. `docs/PLANNING.md` tetap jadi latar belakang (riset, alasan, monetisasi). Jika ada konflik, dokumen di folder ini yang dipakai.

## Urutan baca (total ~20 menit)

| # | Dokumen | Pertanyaan yang dijawab | Waktu baca |
|---|---------|-------------------------|------------|
| 1 | [01-PRD.md](01-PRD.md) | Untuk siapa, kenapa, fitur apa | 4 menit |
| 2 | [02-TRD.md](02-TRD.md) | Pakai teknologi apa, batasannya apa | 3 menit |
| 3 | [03-APP-FLOW.md](03-APP-FLOW.md) | Langkah pengguna dan perpindahan state | 4 menit |
| 4 | [04-UI-UX.md](04-UI-UX.md) | Tampilan, warna, komponen | 3 menit |
| 5 | [05-BACKEND-SCHEMA.md](05-BACKEND-SCHEMA.md) | Tabel, kolom, RLS, API | 4 menit |
| 6 | [06-IMPLEMENTATION-PLAN.md](06-IMPLEMENTATION-PLAN.md) | Urutan build, test, cek selesai | 3 menit |

Waktu baca adalah perkiraan kasar, bukan hasil ukur.

## Aturan pakai untuk AI agent

1. Sebelum mengerjakan fitur, baca baris fitur di PRD (ID `F-xx`), flow terkait di App Flow, dan tabel terkait di Schema.
2. Jangan menambah library, tabel, atau layar yang tidak ada di spec. Jika perlu, usulkan perubahan spec dulu.
3. Setiap perubahan perilaku = update spec di PR yang sama.

## Revisi terhadap PLANNING.md

Perubahan yang dibuat saat menyusun spec ini. Mohon direview, karena ini keputusan baru.

| # | Revisi | Alasan |
|---|--------|--------|
| R1 | Tombol "Jeda plan (cedera/sakit)" naik jadi fitur Must (F-09) | Sudah disebut di PLANNING 4.6 tapi tidak ada di tabel scope; ini fitur keselamatan |
| R2 | Hapus akun dari dalam app jadi Must (F-10) | Apple mewajibkan hapus akun di app yang punya pembuatan akun; juga hak pengguna di UU PDP. Cek ulang aturan terbaru sebelum rilis |
| R3 | Semua tabel milik pengguna punya kolom `user_id` langsung | RLS cukup `user_id = auth.uid()` tanpa join; lebih sederhana dan cepat |
| R4 | `profiles.birth_date` diganti `birth_year` | Data pribadi seminimal mungkin; tahun cukup untuk estimasi |
| R5 | Jawaban screening kesehatan tidak disimpan, hanya flag + waktu persetujuan disclaimer | Jawaban PAR-Q adalah data kesehatan sensitif |
| R6 | `activities.planned_workout_id` ditambahkan | Pencocokan aktivitas ke latihan cukup 1 kolom, feedback tidak perlu menyimpan dua relasi |
| R7 | Token Strava di tabel `integrations` tidak bisa dibaca client sama sekali | Hanya Edge Function (service role) yang boleh membaca |
| R8 | Library gerakan (animasi drill/strength/core di `docs/prototypes/`, `docs/ANIMATION_PIPELINE.md`) masuk backlog, bukan MVP | PLANNING 2.2 menaruh plan kekuatan/mobility di luar MVP; prototipe tetap disimpan |
| R9 | Sinkron offline: ID dibuat di client (UUID) + `updated_at`, aturan last-write-wins | PLANNING menyebut offline-first tapi belum ada aturan konflik |
