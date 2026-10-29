# Run Coach

App latihan lari harian (5K, 10K, HM, FM, Bugar) untuk Web, iOS dan Android dari satu codebase Expo. Repo: `runner-coach`.

**Privasi dulu: semua data pribadi hanya di SQLite perangkat.** Supabase cloud hanya untuk login/sesi (+ Edge Function `delete-account`). Jangan pernah membuat tabel data pengguna di server atau mengirim data pribadi (plan, latihan, RPE, kesehatan, nama) ke server, analitik atau Sentry. Detail: `docs/specs/02-TRD.md` bagian 3 dan 6.

## Sumber kebenaran

| Butuh | Baca |
|---|---|
| Apa yang dibangun, urutannya | `docs/specs/README.md`, lalu `06-IMPLEMENTATION-PLAN.md` |
| Fitur `F-xx`, scope | `docs/specs/01-PRD.md` |
| Stack, aturan engine, sinkron | `docs/specs/02-TRD.md` |
| Langkah per layar, state machine | `docs/specs/03-APP-FLOW.md` |
| Tata letak layar | `docs/wireframes/png/` (26 layar, nomor 1.1 sampai 4.6, sudah memakai Lintas) |
| Warna, tipe, bentuk, komponen | `docs/design-system/tokens.json` + `README.md`; ringkasan di `docs/specs/04-UI-UX.md` |
| Logo, ikon app, ikon UI | `docs/design-system/assets/` |
| Tabel lokal (SQLite), file backup, Auth, Edge Functions | `docs/specs/05-BACKEND-SCHEMA.md` |
| Latar belakang, riset | `docs/PLANNING.md` (kalah jika konflik dengan `docs/specs/`) |

## Aturan

- Fitur baru: baca baris `F-xx`, flow + nomor layar, dan tabel terkait dulu. Test ditulis dari kriteria diterima.
- Jangan menambah library, tabel atau layar di luar spec. Perlu? Usulkan perubahan spec dulu. Perubahan perilaku = update spec di PR yang sama.
- Tidak ada hex atau ukuran lepas di komponen; semua dari token. Perubahan warna harus lolos `python3 docs/design-system/check_contrast.py`.
- Angka (pace, jarak, waktu) memakai font display + `tnum`. Teks UI bahasa Indonesia, sapaan "kamu", selalu lewat katalog `i18n/id.ts` (tidak ditulis langsung di komponen); angka/tanggal lewat `format.ts` (TRD 8). Multibahasa menyusul (D9).
- Branch `feat/<milestone>-<nama>` dari `development`, PR kecil ke `development`.
- Credential Supabase dibaca dari environment (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`). Jangan menulis credential ke repo.
- Supabase MCP (`.mcp.json`, token dari env `SUPABASE_ACCESS_TOKEN`) dan skill `.claude/skills/supabase*` boleh dipakai untuk Auth, Edge Function, log dan dokumentasi. **Jangan** memakai tool database/migration untuk membuat tabel data pengguna; schema `public` harus tetap kosong (Schema bagian 5). Skill `supabase-postgres-best-practices` hanya relevan jika kelak ada tabel non-pribadi yang disetujui spec.
