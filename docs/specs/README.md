# Spec-Driven Development: Run Coach

Status: Draft v0.3 (2026-10-29), model privasi "data di HP"

Folder ini adalah **acuan build**. `docs/PLANNING.md` tetap jadi latar belakang (riset, alasan, monetisasi). Jika ada konflik, dokumen di folder ini yang dipakai.

**Acuan visual:** [`docs/wireframes/`](../wireframes/README.md), 26 layar HP dalam 4 journey, sudah memakai design system Lintas, diekspor dari artifact wireframe (https://claude.ai/artifact/69xQ9s7SxafNVUKL2vWxka). Nomor layar (1.1 sampai 4.6) dipakai di semua spec.

## Urutan baca (total ~26 menit)

| # | Dokumen | Pertanyaan yang dijawab | Waktu baca |
|---|---------|-------------------------|------------|
| 1 | [01-PRD.md](01-PRD.md) | Untuk siapa, kenapa, fitur apa | 4 menit |
| 2 | [02-TRD.md](02-TRD.md) | Pakai teknologi apa, batasannya apa | 3 menit |
| 3 | [03-APP-FLOW.md](03-APP-FLOW.md) | Langkah pengguna per layar wireframe, state | 5 menit |
| 4 | [04-UI-UX.md](04-UI-UX.md) | Token desain dari wireframe, komponen | 3 menit |
| 5 | [05-BACKEND-SCHEMA.md](05-BACKEND-SCHEMA.md) | Tabel, kolom, RLS, API | 4 menit |
| 6 | [06-IMPLEMENTATION-PLAN.md](06-IMPLEMENTATION-PLAN.md) | Urutan build, test, cek selesai | 3 menit |
| 7 | [07-ENGINE-EVIDENCE.md](07-ENGINE-EVIDENCE.md) | Dasar ilmiah tiap aturan engine, reasoning yang dilihat pengguna | 6 menit |

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
| R3 | ~~Semua tabel milik pengguna punya `user_id` langsung~~ Diganti PV: tabel lokal tanpa `user_id` | |
| R4 | Tanggal lahir dan jenis kelamin tidak dikumpulkan di MVP | Wireframe tidak memintanya; data pribadi seminimal mungkin |
| R5 | Jawaban screening kesehatan tidak disimpan, hanya flag + waktu persetujuan disclaimer | Data kesehatan sensitif |
| R6 | `activities.planned_workout_id` ditambahkan | Pencocokan aktivitas ke latihan cukup 1 kolom |
| R7 | ~~Token Strava hanya di server~~ Diganti PV: token di secure-store perangkat; Edge Function hanya menukar token tanpa menyimpan | |
| R8 | MVP hanya memuat ABC drill sebagai segmen pemanasan (F-17, Should). Strength + core bodyweight di fase 2, strength lanjutan + mobility di fase 3 | Mengikuti PLANNING 2.1, 4.7 dan 7 (update 2026-10-29) |
| R9 | ~~Sinkron offline last-write-wins~~ Diganti PV: tidak ada sinkron; pindah HP lewat file backup | |
| R10 | Setiap aturan engine diberi ID `E-xx`, tingkat bukti dan referensi; engine menyimpan `rationale` per plan/latihan. Aturan baru E-06 (sesi maks 110% lari terjauh 30 hari), taper diberi besaran volume | Validasi ilmiah, `07-ENGINE-EVIDENCE.md` |

## Revisi dari wireframe (v0.2)

| # | Revisi | Layar |
|---|--------|-------|
| W1 | Login dipindah ke **akhir** onboarding, setelah preview plan. Data onboarding disimpan lokal dulu | 1.1, 1.8 |
| W2 | Target baru "Bugar" (tanpa target jarak) | 1.2 |
| W3 | Onboarding juga menanyakan nama race (opsional), lari terjauh 4 minggu, jam pengingat | 1.3, 1.5, 1.6 |
| W4 | (Diganti DS1) Warna zona dari wireframe tidak dipakai lagi | Semua |
| W5 | Tema app terang; layar Timer gelap. Mode gelap penuh ditunda | Semua |
| W6 | Layar baru: Detail latihan (2.2), Ringkasan minggu + usulan adaptasi (2.5), Detail aktivitas (3.4) | 2.2, 2.5, 3.4 |
| W7 | Progres menampilkan prediksi waktu race (rentang). Gratis di MVP; batas Free/Premium diputuskan di fase 3 | 3.3 |
| W8 | Feedback punya tag catatan cepat (Cuaca panas, Kurang tidur, Kaki pegal, Ada nyeri) | 2.4 |
| W9 | Jeda plan menyimpan alasan + perkiraan durasi; setelah jeda selalu mulai dengan 1 minggu "Return to run" | 4.3 |
| W10 | Pindah latihan dicek aturan dan bisa menggabungkan 2 latihan | 3.2 |

## Revisi dari design system (v0.3)

| # | Revisi |
|---|--------|
| DS1 | Warna, tipe dan bentuk pindah ke `docs/design-system/` ("Lintas"). Wireframe tetap acuan tata letak saja |
| DS2 | Zona memakai skala panas (lavender, peach, peach tua, oranye, bara); menggantikan biru/amber/merah |
| DS3 | Strength/core/mobility memakai charcoal, bukan ungu seperti PLANNING 4.4, agar tidak bentrok dengan lavender recovery |
| DS4 | Font Inter diganti Bricolage Grotesque + Plus Jakarta Sans |
| DS5 | Nama app jadi "Run Coach" (dari "Runner Coach"). Logo, ikon app dan 40 ikon UI ada di `docs/design-system/assets/` |

## Revisi privasi (v0.3)

| # | Revisi | Dokumen |
|---|--------|---------|
| PV | **Semua data pribadi hanya di perangkat.** Supabase cloud hanya untuk login/sesi; schema `public` kosong | PRD 3, TRD 2-3 dan 6, Schema |
| PV-a | Tidak ada sinkron antar perangkat. Backup ke file (F-13, jadi Must) dan Pulihkan dari file (F-18, baru) | PRD, App Flow FL-8, FL-9 |
| PV-b | Layar baru: 1.9 Masuk, 4.5 Data & privasi, 4.6 Hapus akun. Hapus akun = akun server + data lokal | App Flow, wireframe |
| PV-c | Edge Function tinggal `delete-account` (MVP) dan `strava-token` (fase 2, tanpa simpan). `export-data`, `plan-adjust`, webhook Strava dan tabel `subscriptions` dihapus | Schema 5 |
| PV-d | Analitik dan Sentry tanpa data pribadi, ada sakelar opt-out | TRD 6 |
| PV-e | Supabase cloud (bukan lokal/Docker); credential lewat environment secret | TRD 6.1, Plan prasyarat |

## Keputusan terbuka dari sinkronisasi

| # | Pertanyaan | Default sementara |
|---|-----------|-------------------|
| O1 | ~~Layar Log manual, konfirmasi Hapus akun, Login email belum ada~~ Selesai di wireframe v0.3: 2.6, 4.6, 1.9 | |
| O2 | Isi plan "Bugar" (W2) | Blok 8 minggu easy + 1 sesi kualitas, tanpa taper, bisa diulang. Perlu review pelatih |
| O3 | Screening "Ya" = "plan lebih ringan" (layar 1.7) | Tanpa sesi berat sampai pengguna mengubahnya. Perlu review pelatih |
| O4 | ~~Segmen drill belum ada di wireframe~~ Selesai: 2.2 (baris drill) dan 2.3b (timer drill). Animasi SVG dari prototipe jika siap, jika belum cukup teks cue | |
| D7, D8 | Strength jadi pembeda utama atau Premium; format animasi gerakan | Lihat PLANNING 11. Tidak memengaruhi MVP |
