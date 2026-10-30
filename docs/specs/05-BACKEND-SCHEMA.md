# 05. Data Schema (lokal) + Backend

Status: Draft v0.3 (2026-10-29) | Data pribadi: SQLite di perangkat | Server: Supabase cloud, hanya Auth + Edge Function

## Ringkasan

- **Semua data pribadi disimpan di perangkat pengguna** (SQLite). 9 tabel lokal untuk MVP. Tidak ada sinkron ke server.
- **Supabase hanya untuk login/sesi.** Tidak ada tabel di schema `public`. Satu Edge Function di MVP (`delete-account`), satu di fase 2 (`strava-token`, tanpa menyimpan data).
- Satuan: meter (`_m`), detik (`_s`), detik per km untuk pace. Pindah HP = file backup milik pengguna (bagian 4).

## 1. Aturan umum tabel lokal

Satu database = satu pengguna di satu perangkat, jadi tabel **tidak punya `user_id`** dan tidak butuh RLS. Pemilik data dicatat sekali di `app_meta.owner_id`.

Kolom standar semua tabel (kecuali `app_meta` dan `profile`):

| Kolom | Tipe | Catatan |
|-------|------|---------|
| id | uuid | Dibuat di perangkat |
| created_at | timestamptz | |
| updated_at | timestamptz | Diisi app setiap update |

Pemetaan tipe ke SQLite:

| Tipe di dokumen ini | SQLite |
|---------------------|--------|
| uuid, text | TEXT |
| int, smallint | INTEGER |
| numeric | REAL |
| boolean | INTEGER 0/1 |
| date | TEXT `YYYY-MM-DD` (tanggal lokal pengguna) |
| timestamptz | TEXT ISO 8601 UTC |
| json, text[] | TEXT berisi JSON |

Check dan enum di bawah ditulis sebagai `CHECK` SQLite dan divalidasi zod di app. Foreign key aktif (`PRAGMA foreign_keys = ON`). Hapus = hard delete.

## 2. Tabel lokal MVP

### app_meta (1 baris)

| Kolom | Tipe | Catatan |
|-------|------|---------|
| schema_version | int | Sama dengan `PRAGMA user_version`; ikut di file backup |
| owner_id | uuid null | `auth.uid()` setelah login (TRD 3.4); null sebelum login |
| last_backup_at | timestamptz null | Untuk pengingat backup |
| analytics_opt_in | boolean default true | Sakelar di 4.5 |
| backup_reminder_dismissed | boolean default false | Pengingat backup 30 hari dimatikan (4.5) |
| onboarding_draft | json null | Jawaban onboarding 1.2-1.6 yang belum selesai (FL-1: lanjut dari langkah terakhir). Tanpa jawaban screening. Null setelah login di 1.8 |
| active_timer | json null | State timer yang sedang berjalan/selesai belum disimpan (2.3 -> 2.4), untuk melanjutkan setelah app ditutup sistem (FL-2). Null setelah Simpan/batal. Tidak ikut file backup |

### profile (1 baris)

| Kolom | Tipe | Catatan |
|-------|------|---------|
| display_name | text null | Diisi pengguna, tidak diambil dari provider login |
| unit | text default 'km' | check in ('km','mi') |
| timezone | text default 'Asia/Jakarta' | IANA |
| locale | text default 'id-ID' | Locale format angka/tanggal (TRD 8). MVP selalu `id-ID`; dipakai pemilih bahasa saat multibahasa (D9) |
| reminder_time | text null | `HH:MM`, layar 1.6; null = mati |
| intensity_guide | text default 'pace' | check in ('pace','hr','rpe'); 'hr' aktif di fase 2 |
| health_flag | boolean default false | Ada jawaban "Ya" di 1.7; jawaban tidak disimpan |
| disclaimer_accepted_at | timestamptz | Dari centang di 1.7 |

### goals

| Kolom | Tipe | Catatan |
|-------|------|---------|
| distance | text | check in ('5k','10k','hm','fm','fitness') |
| race_date | date null | null = tanpa race |
| race_name | text null | Opsional, layar 1.3 |
| target_time_s | int null | |
| baseline_distance | text null | Layar 1.4, "Saya tahu waktunya" |
| baseline_time_s | int null | |
| level | text null | check in ('beginner','recreational'); dipakai jika "Saya tidak tahu" |
| weekly_volume_m | int | Layar 1.5 |
| longest_run_m | int | Layar 1.5 |
| status | text default 'active' | check in ('active','completed','abandoned') |

Check: `baseline_time_s is not null or level is not null`. Index unik parsial: 1 goal `active`.

### plans

| Kolom | Tipe | Catatan |
|-------|------|---------|
| goal_id | uuid FK -> goals | |
| start_date / end_date | date | |
| params | json | `{available_days, long_run_day, light_mode, engine_version, rationale}`. `rationale` = daftar `{rule, values}` level plan (07 bagian 3.1) |
| version | int default 1 | Naik setiap adaptasi diterapkan |
| status | text default 'active' | check in ('active','paused','archived') |
| pause_reason | text null | check in ('injury','sick','busy'); layar 4.3. Bagian nyeri tidak disimpan |
| paused_at | timestamptz null | |
| pause_expected_days | int null | 3, 7, 14, atau null = belum tahu |

### planned_workouts

| Kolom | Tipe | Catatan |
|-------|------|---------|
| plan_id | uuid FK -> plans on delete cascade | |
| date | date | |
| week_index | int | Mulai dari 1 |
| phase | text | check in ('base','build','peak','taper','return') |
| type | text | check in ('easy','run_walk','long','tempo','interval','strides','recovery','progression','rest'). `progression` sejak migrasi v5 (tabel dibangun ulang dengan foreign key dimatikan sementara agar relasi activities tidak hilang) |
| steps | json | Format bagian 3 |
| target_distance_m | int null | |
| target_duration_s | int null | |
| status | text default 'scheduled' | check in ('scheduled','completed','skipped','missed') |
| original_date | date null | Terisi jika dipindah (3.2) |
| rationale | json default '[]' | Daftar `{rule, values}` dari engine (07 bagian 3.1); teks dari registri statis, tidak disimpan |

Index: `(date)`. Gabung 2 latihan (3.2): latihan tujuan di-update, latihan yang dipindah dihapus.

### activities

| Kolom | Tipe | Catatan |
|-------|------|---------|
| planned_workout_id | uuid null FK -> planned_workouts on delete set null | Hasil pencocokan |
| source | text | check in ('manual','timer','strava','healthkit','health_connect') |
| external_id | text null | ID dari sumber luar |
| started_at | timestamptz | |
| distance_m | int null | |
| duration_s | int | check > 0 |
| avg_hr | int null | |
| segments | json null | Hasil per segmen dari timer (3.4 "Segmen vs target") |
| splits | json null | Split per km (3.4) |

Index: `(started_at desc)`. Unik: `(source, external_id) where external_id is not null`.

### workout_feedback

| Kolom | Tipe | Catatan |
|-------|------|---------|
| activity_id | uuid unique FK -> activities on delete cascade | 1 feedback per aktivitas |
| rpe | int | check 1-10 |
| tags | text[] default '[]' | Subset dari ('hot','poor_sleep','sore_legs','pain'); layar 2.4 |
| notes | text null | |

### plan_adjustments (F-11, layar 2.5)

| Kolom | Tipe | Catatan |
|-------|------|---------|
| plan_id | uuid FK -> plans on delete cascade | |
| week_index | int | Minggu yang diubah |
| rule | text | ID aturan TRD 4.3 (`E-xx`, 07 bagian 2.4) |
| changes | json | Daftar perubahan untuk ditampilkan |
| status | text | check in ('proposed','accepted','rejected') |

Unik: `(plan_id, week_index, rule)`, supaya usulan yang ditolak tidak muncul lagi.

### fitness_snapshots

| Kolom | Tipe | Catatan |
|-------|------|---------|
| date | date | unik |
| vdot_estimate | numeric null | |
| predicted_time_min_s / predicted_time_max_s | int null | Prediksi race di 3.3 |
| weekly_volume_m | int | |

## 3. Format `steps` (json)

Satu struktur untuk timer, kalender, dan export ke jam (fase lanjut).

```json
[
  { "kind": "warmup",   "duration_s": 720, "zone": "easy" },
  { "kind": "drill",    "exercise_id": "askip", "sets": 2, "distance_m": 20 },
  { "kind": "repeat",   "times": 6, "steps": [
      { "kind": "work",     "distance_m": 800, "zone": "interval",
        "pace_s_per_km": { "min": 370, "max": 380 } },
      { "kind": "recovery", "duration_s": 120, "zone": "recovery" }
  ]},
  { "kind": "cooldown", "duration_s": 720, "zone": "easy" }
]
```

Segmen drill (F-17): `exercise_id` merujuk daftar gerakan statis di `training-engine` (id sama dengan prototipe, mis. `askip`, `bskip`, `cskip`).

Aturan: `kind` in (warmup, work, recovery, cooldown, repeat, drill). Step drill wajib punya `exercise_id` dan `sets`, plus `distance_m`, `duration_s` atau `reps`. Step lain (non-repeat) wajib punya `duration_s` atau `distance_m`. Tipe TypeScript + validator zod di `training-engine` jadi satu-satunya sumber kebenaran. Contoh angka di atas hanya ilustrasi format.

## 4. File backup (F-13, F-18)

Dibuat dan dibaca di perangkat. Tidak pernah dikirim ke server kita.

```json
{
  "format": "run-coach-backup",
  "schema_version": 1,
  "exported_at": "2026-10-29T06:00:00Z",
  "app_version": "0.1.0",
  "tables": { "profile": [], "goals": [], "plans": [], "planned_workouts": [],
              "activities": [], "workout_feedback": [], "plan_adjustments": [], "fitness_snapshots": [] }
}
```

| Aturan | Detail |
|--------|--------|
| Isi | Semua tabel bagian 2 kecuali `app_meta.owner_id` dan `analytics_opt_in` |
| Import | Validasi zod per tabel. `schema_version` lebih lama: jalankan migrasi; lebih baru dari app: tolak dengan pesan "Perbarui app dulu" |
| Ganti data | Import mengganti seluruh data lokal dalam 1 transaksi; gagal = data lama utuh |
| Enkripsi file | Tidak di MVP (file disimpan di lokasi pilihan pengguna). Backup berpassword = keputusan terbuka P2 |

## 5. Server: Supabase cloud

### 5.1 Isi server

| Komponen | Isi | Data pribadi? |
|----------|-----|---------------|
| Auth (`auth.users`) | id, email, provider (Apple/Google/Email), waktu login | Ya, minimum untuk login. Satu-satunya |
| Schema `public` | **Kosong** di MVP | Tidak |
| Storage | Tidak dipakai | Tidak |

Test wajib (CI): query ke `information_schema.tables` untuk schema `public` mengembalikan 0 tabel (atau hanya tabel yang disetujui spec dan tanpa data pribadi).

### 5.2 Auth

| Aturan | Detail |
|--------|--------|
| Provider | Apple, Google, Email (magic link atau OTP; dipilih di M1) |
| Kapan | Layar 1.8 setelah preview plan, atau "Masuk" di 1.1 (layar 1.9) |
| Profil server | Tidak dibuat. Tidak ada trigger yang menyalin data ke `public` |
| Sesi | Disimpan di perangkat (`expo-secure-store`, web: penyimpanan browser) |

### 5.3 Edge Functions

| Fungsi | Method | Fase | Input | Output | Menyimpan data? |
|--------|--------|------|-------|--------|-----------------|
| delete-account | POST | MVP | JWT pengguna | 204; user Auth terhapus | Tidak (menghapus). Kode: `supabase/functions/delete-account/`. JWT divalidasi di fungsi (`auth.getUser`), jadi deploy dengan `--no-verify-jwt` agar preflight CORS dari web lolos |
| strava-token | POST | 2 | `{grant: 'authorization_code', code}` atau `{grant: 'refresh_token', refresh_token}` + JWT | Token dari Strava diteruskan ke perangkat | **Tidak.** Hanya memakai client secret; tidak ada log isi token |

Error: `{ "error": { "code": "string", "message": "string" } }` dengan HTTP status yang sesuai.

Dihapus dibanding v0.2: `export-data` (sekarang lokal), `strava-oauth` + `strava-webhook` (diganti `strava-token`, aktivitas ditarik perangkat), `plan-adjust` (engine di perangkat), tabel server `profiles`, `goals`, `plans`, `planned_workouts`, `activities`, `workout_feedback`, `plan_adjustments`, `fitness_snapshots`, `integrations`, `subscriptions`.

## 6. Fase lanjut

| Data | Fase | Di mana | Catatan |
|------|------|---------|---------|
| integrations | 2 | Tabel lokal: provider, athlete_id, connected_at, last_synced_at | Token di `expo-secure-store`, tidak di SQLite dan tidak di server |
| exercises | 2 | Data statis di app (`training-engine`) | Bukan data pribadi. Jika kelak dipindah ke server agar bisa diperbarui tanpa rilis app: tabel `public.exercises` read-only, RLS select untuk semua, tanpa data pribadi |
| Langganan Premium | 3 | RevenueCat (entitlement per `auth.uid()`) | Tidak ada tabel `subscriptions` di server kita. Dukungan web (Stripe lewat RevenueCat) dicek di fase 3 |
