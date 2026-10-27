# 06. Implementation Plan

Status: Draft v0.1 (2026-10-27) | Durasi mengikuti estimasi kasar PLANNING bagian 7 (1-2 developer)

## Ringkasan

- MVP dibangun dalam **8 milestone (M0-M7), sekitar 8 minggu**. Satu milestone = satu atau beberapa branch kecil.
- Urutan: fondasi -> engine (paling banyak test) -> layar -> timer -> progres -> sinkron -> rilis beta.
- Setiap milestone selesai hanya jika semua cek di kolom "Verifikasi" lulus.

## 1. Loop kerja per fitur (untuk AI agent)

1. Baca spec: baris `F-xx` di PRD, flow di App Flow, tabel di Schema.
2. Buat branch `feat/<milestone>-<nama-singkat>` (contoh `feat/m4-timer`).
3. Tulis test dulu dari kriteria diterima.
4. Implementasi sampai test lulus.
5. Jalankan `pnpm lint && pnpm typecheck && pnpm test`.
6. Cek manual di web + 1 device (iOS atau Android).
7. Jika perilaku berubah dari spec: update spec di PR yang sama.
8. Buka PR kecil (idealnya < 400 baris berubah), tunggu CI hijau.

## 2. Milestone MVP

| # | Minggu | Branch | Lingkup | Test | Verifikasi (Definition of Done) |
|---|--------|--------|---------|------|--------------------------------|
| M0 | Sebelum mulai (2-3 hari) | `spike/*` | Spike: timer background iOS + Android, grafik di web + mobile | Tidak wajib | Catatan hasil spike di `docs/specs/spikes.md`; library grafik dipilih |
| M1 | 1 | `feat/m1-foundation` | Monorepo pnpm, Expo + 4 tab kosong, Supabase lokal, migration `profiles`, login (F-01), token desain, CI | Test RLS `profiles`, smoke test app | CI hijau; login berhasil di web + 1 device; profil terbuat otomatis |
| M2 | 2-3 | `feat/m2-engine` | `training-engine`: zona pace, Riegel, workout library, generator 4 jarak, tipe + validator `steps` | Unit test semua aturan TRD 4.2 untuk setiap kombinasi jarak x level x hari tersedia (3-6) | Coverage engine >= 90%; tidak ada import React/Supabase |
| M3 | 3-4 | `feat/m3-onboarding`, `feat/m3-today`, `feat/m3-plan` | Migration goals, plans, planned_workouts. Onboarding (FL-1), Hari ini (F-04), Kalender + pindah latihan (FL-4) | Test komponen tiap layar onboarding; test RLS 3 tabel baru | Pengguna baru bisa sampai Hari ini dengan plan valid dalam maks 6 layar pertanyaan |
| M4 | 5 | `feat/m4-timer` | Timer (F-05), state machine 3.2, audio + getar, notifikasi terjadwal | Unit test state machine; test perhitungan posisi dari timestamp | Uji di device nyata: cue muncul saat layar terkunci (iOS + Android); app ditutup lalu dibuka melanjutkan posisi benar |
| M5 | 6 | `feat/m5-log`, `feat/m5-progress` | Migration activities, workout_feedback, fitness_snapshots. Feedback + log manual (FL-2, FL-3), Progres 3 grafik (F-07) | Test pencocokan aktivitas; test perhitungan volume, pace, kepatuhan | Alur Mulai -> Timer -> Simpan -> grafik ter-update berjalan end-to-end (Playwright di web) |
| M6 | 7 | `feat/m6-sync`, `feat/m6-account` | Sinkron offline (TRD 3), jeda plan (F-09), hapus akun (F-10), export (F-13), notifikasi (F-12), event analitik, Sentry | Test konflik last-write-wins; test `delete-account` menghapus semua tabel | Mode pesawat: latihan + log tersimpan, tersinkron saat online. Semua event di PRD/PLANNING 9 terkirim ke PostHog |
| M7 | 8 | `release/beta` | Build TestFlight + Play internal testing + deploy web, perbaikan bug, privacy policy, formulir data safety | Regression E2E | Beta terpasang di 3 platform; tidak ada crash terbuka berprioritas tinggi di Sentry |

Prasyarat di luar kode (paralel dengan M1-M6): review aturan plan oleh pelatih bersertifikat (D6) sebelum M7.

## 3. Setelah MVP (ringkas)

| Fase | Durasi estimasi | Milestone utama |
|------|-----------------|-----------------|
| 2. Integrasi & adaptif | 4-6 minggu | Penyesuaian plan (F-11) + `plan-adjust`; Strava (`integrations`, OAuth, webhook); HealthKit; Health Connect |
| 3. Monetisasi | 3-4 minggu | `subscriptions`, RevenueCat + Stripe, paywall via feature flag |
| 4. Growth | Berkelanjutan | Library gerakan + animasi (`docs/ANIMATION_PIPELINE.md`), race lokal, share card |

Setiap fase lanjut dipecah jadi milestone dengan format tabel yang sama sebelum dikerjakan.

## 4. Perintah standar

| Perintah | Fungsi |
|----------|--------|
| `pnpm dev` | Jalankan app (Expo) |
| `pnpm lint` | ESLint + Prettier check |
| `pnpm typecheck` | `tsc --noEmit` semua paket |
| `pnpm test` | Vitest + test komponen |
| `pnpm test:e2e` | Playwright (web) |
| `supabase db reset` | Terapkan ulang semua migration + seed lokal |
| `supabase test db` | Test RLS (pgTAP) |

Perintah ini dibuat di M1; sebelum itu belum ada.
