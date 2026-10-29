# Run Coach

App latihan lari harian (5K, 10K, HM, FM, Bugar) untuk Web, iOS dan Android dari satu codebase Expo. Repo: `runner-coach`.

## Sumber kebenaran

| Butuh | Baca |
|---|---|
| Apa yang dibangun, urutannya | `docs/specs/README.md`, lalu `06-IMPLEMENTATION-PLAN.md` |
| Fitur `F-xx`, scope | `docs/specs/01-PRD.md` |
| Stack, aturan engine, sinkron | `docs/specs/02-TRD.md` |
| Langkah per layar, state machine | `docs/specs/03-APP-FLOW.md` |
| Tata letak layar | `docs/wireframes/png/` (nomor layar 1.1 sampai 4.4) |
| Warna, tipe, bentuk, komponen | `docs/design-system/tokens.json` + `README.md`; ringkasan di `docs/specs/04-UI-UX.md` |
| Logo, ikon app, ikon UI | `docs/design-system/assets/` |
| Tabel, RLS, Edge Functions | `docs/specs/05-BACKEND-SCHEMA.md` |
| Latar belakang, riset | `docs/PLANNING.md` (kalah jika konflik dengan `docs/specs/`) |

## Aturan

- Fitur baru: baca baris `F-xx`, flow + nomor layar, dan tabel terkait dulu. Test ditulis dari kriteria diterima.
- Jangan menambah library, tabel atau layar di luar spec. Perlu? Usulkan perubahan spec dulu. Perubahan perilaku = update spec di PR yang sama.
- Tidak ada hex atau ukuran lepas di komponen; semua dari token. Perubahan warna harus lolos `python3 docs/design-system/check_contrast.py`.
- Angka (pace, jarak, waktu) memakai font display + `tnum`. Teks UI bahasa Indonesia, sapaan "kamu".
- Branch `feat/<milestone>-<nama>` dari `development`, PR kecil ke `development`.
- Wireframe masih berwarna lama (biru/abu-abu); ambil tata letaknya saja.
