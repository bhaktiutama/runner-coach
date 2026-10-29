# Status Development

Diperbarui otomatis oleh agent setiap langkah selesai. Branch kerja: `claude/relaxed-galileo-lknyhx`, di-merge langsung ke `development`.

Terakhir diperbarui: 2026-10-29

## Ringkasan

| Milestone | Status | Catatan |
|---|---|---|
| M0 Spike | Selesai (perlu device) | `docs/specs/spikes.md`: SQLite web OK, grafik pakai react-native-svg. Timer background + backup OS perlu HP |
| M1 Fondasi | Berjalan | Monorepo, 4 tab, token, format, migrasi SQLite, CI selesai. Layar login dibuat bersama 1.8/1.9 di M3 |
| M2 Engine | Belum mulai | |
| M3 Onboarding, Hari ini, Plan | Belum mulai | |
| M4 Timer | Belum mulai | Uji layar terkunci butuh HP fisik |
| M5 Feedback, Progres | Belum mulai | |
| M6 Privasi, Akun | Belum mulai | |
| M7 Rilis beta | Di luar jangkauan agent | Butuh akun Apple/Google + keputusan pemilik |

Legenda: Belum mulai / Berjalan / Selesai / Selesai (perlu device) / Terblokir

## Loop kerja

1. Baca `F-xx`, flow + nomor layar, tabel Schema.
2. Tulis test dari kriteria diterima.
3. Implementasi sampai `pnpm lint && pnpm typecheck && pnpm test` lulus.
4. Cek kriteria "Verifikasi" milestone (06-IMPLEMENTATION-PLAN). Yang tidak bisa dicek di container ditandai "perlu device".
5. Commit, merge ke `development`, push, update file ini.

## Log langkah

| Tanggal | Milestone | Langkah | Hasil test |
|---|---|---|---|
| 2026-10-29 | M1 | Monorepo pnpm, Expo SDK 58 + Router, 4 tab, tokens.ts dari tokens.json, format.ts id-ID, migrasi SQLite v1-v4, klien Supabase (Auth saja), ESLint larangan teks literal JSX, CI GitHub Actions | lint OK, typecheck OK, unit 11/11, E2E smoke 1/1, privacy (schema public kosong) 1/1 |

## Blocker dan butuh dari pemilik

| # | Item | Untuk | Status |
|---|---|---|---|
| B1 | `EXPO_TOKEN` di environment session (expo.dev > Account settings > Access tokens), lalu mulai session baru | EAS Update (buka di Expo Go), EAS Build APK, EAS Hosting web | Menunggu |
| B2 | Provider Apple dan Google di Supabase Auth | Login Apple/Google (F-01). Email sudah bisa | Menunggu |
| B3 | Uji di HP fisik: cue timer saat layar terkunci, lanjut posisi setelah app ditutup | Verifikasi M0, M4 | Menunggu build |
| B4 | Review aturan engine oleh pelatih (D6) | Sebelum beta publik | Menunggu |

## Cara test

Akan diisi setelah M1 (perintah `pnpm dev`, link Expo, dsb).
