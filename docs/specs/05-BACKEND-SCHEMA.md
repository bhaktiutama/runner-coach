# 05. Backend Schema Document

Status: Draft v0.2 (2026-10-28) | Platform: Supabase (Postgres + Auth + Edge Functions)

## Ringkasan

- 8 tabel untuk MVP, 2 tabel menyusul (fase 2 dan 3). Semua tabel milik pengguna punya `user_id` dan RLS `user_id = auth.uid()`.
- Satuan: meter (`_m`), detik (`_s`), detik per km untuk pace. Waktu: `timestamptz` (UTC); tanggal latihan: `date` sesuai zona waktu pengguna.
- App membaca/menulis tabel langsung lewat Supabase client (PostgREST + RLS). Edge Function hanya untuk hal yang butuh service role atau pihak ketiga.

## 1. Kolom standar

Semua tabel (kecuali disebut lain) punya:

| Kolom | Tipe | Catatan |
|-------|------|---------|
| id | uuid PK | Dibuat di client (offline-first) |
| user_id | uuid not null FK -> auth.users on delete cascade | Di SQLite lokal boleh null sebelum login (TRD 3) |
| created_at | timestamptz not null default now() | |
| updated_at | timestamptz not null default now() | Trigger update otomatis; dasar last-write-wins |
| deleted_at | timestamptz null | Soft delete untuk sinkron |

## 2. Tabel MVP

### profiles (id = auth.users.id, tanpa kolom `user_id`)

| Kolom | Tipe | Catatan |
|-------|------|---------|
| display_name | text null | Dari provider login |
| unit | text not null default 'km' | check in ('km','mi') |
| timezone | text not null default 'Asia/Jakarta' | IANA |
| reminder_time | time null | Layar 1.6; null = mati |
| intensity_guide | text not null default 'pace' | check in ('pace','hr','rpe'); 'hr' baru aktif di fase 2 |
| health_flag | boolean not null default false | Ada jawaban "Ya" di 1.7; jawaban tidak disimpan |
| disclaimer_accepted_at | timestamptz not null | Dari centang di 1.7 |

### goals

| Kolom | Tipe | Catatan |
|-------|------|---------|
| distance | text not null | check in ('5k','10k','hm','fm','fitness') |
| race_date | date null | null = tanpa race |
| race_name | text null | Opsional, layar 1.3 |
| target_time_s | int null | |
| baseline_distance | text null | Layar 1.4, "Saya tahu waktunya" |
| baseline_time_s | int null | |
| level | text null | check in ('beginner','recreational'); dipakai jika "Saya tidak tahu" |
| weekly_volume_m | int not null | Layar 1.5 |
| longest_run_m | int not null | Layar 1.5 |
| status | text not null default 'active' | check in ('active','completed','abandoned') |

Check: `baseline_time_s is not null or level is not null`. Index unik: 1 goal `active` per pengguna.

### plans

| Kolom | Tipe | Catatan |
|-------|------|---------|
| goal_id | uuid not null FK -> goals | |
| start_date / end_date | date not null | |
| params | jsonb not null | `{available_days, long_run_day, light_mode, engine_version}` |
| version | int not null default 1 | Naik setiap adaptasi diterapkan |
| status | text not null default 'active' | check in ('active','paused','archived') |
| pause_reason | text null | check in ('injury','sick','busy'); layar 4.3. Bagian nyeri tidak disimpan |
| paused_at | timestamptz null | |
| pause_expected_days | smallint null | 3, 7, 14, atau null = belum tahu |

### planned_workouts

| Kolom | Tipe | Catatan |
|-------|------|---------|
| plan_id | uuid not null FK -> plans | |
| date | date not null | |
| week_index | smallint not null | Mulai dari 1 |
| phase | text not null | check in ('base','build','peak','taper','return') |
| type | text not null | check in ('easy','run_walk','long','tempo','interval','strides','recovery','rest') |
| steps | jsonb not null | Format bagian 3 |
| target_distance_m | int null | |
| target_duration_s | int null | |
| status | text not null default 'scheduled' | check in ('scheduled','completed','skipped','missed') |
| original_date | date null | Terisi jika dipindah (3.2) |

Index: `(user_id, date)`. Gabung 2 latihan (3.2): latihan tujuan di-update, latihan yang dipindah di-soft delete.

### activities

| Kolom | Tipe | Catatan |
|-------|------|---------|
| planned_workout_id | uuid null FK -> planned_workouts on delete set null | Hasil pencocokan |
| source | text not null | check in ('manual','timer','strava','healthkit','health_connect') |
| external_id | text null | ID dari sumber luar |
| started_at | timestamptz not null | |
| distance_m | int null | |
| duration_s | int not null | check > 0 |
| avg_hr | smallint null | |
| segments | jsonb null | Hasil per segmen dari timer (layar 3.4 "Segmen vs target") |
| splits | jsonb null | Split per km (layar 3.4) |

Index: `(user_id, started_at desc)`. Unik: `(user_id, source, external_id) where external_id is not null`.

### workout_feedback

| Kolom | Tipe | Catatan |
|-------|------|---------|
| activity_id | uuid not null unique FK -> activities on delete cascade | 1 feedback per aktivitas |
| rpe | smallint not null | check 1-10 |
| tags | text[] not null default '{}' | Subset dari ('hot','poor_sleep','sore_legs','pain'); layar 2.4 |
| notes | text null | |

### plan_adjustments (F-11, layar 2.5)

| Kolom | Tipe | Catatan |
|-------|------|---------|
| plan_id | uuid not null FK -> plans | |
| week_index | smallint not null | Minggu yang diubah |
| rule | text not null | Kode aturan TRD 4.3 |
| changes | jsonb not null | Daftar perubahan untuk ditampilkan |
| status | text not null | check in ('proposed','accepted','rejected') |

Unik: `(plan_id, week_index, rule)`, supaya usulan yang ditolak tidak muncul lagi.

### fitness_snapshots

| Kolom | Tipe | Catatan |
|-------|------|---------|
| date | date not null | unik per `(user_id, date)` |
| vdot_estimate | numeric(4,1) null | |
| predicted_time_min_s / predicted_time_max_s | int null | Prediksi race di 3.3 |
| weekly_volume_m | int not null | |

## 3. Format `steps` (jsonb)

Satu struktur untuk timer, kalender, dan export ke jam (fase lanjut).

```json
[
  { "kind": "warmup",   "duration_s": 720, "zone": "easy" },
  { "kind": "repeat",   "times": 6, "steps": [
      { "kind": "work",     "distance_m": 800, "zone": "interval",
        "pace_s_per_km": { "min": 370, "max": 380 } },
      { "kind": "recovery", "duration_s": 120, "zone": "recovery" }
  ]},
  { "kind": "cooldown", "duration_s": 720, "zone": "easy" }
]
```

Aturan: `kind` in (warmup, work, recovery, cooldown, repeat). Setiap step non-repeat wajib punya `duration_s` atau `distance_m`. Tipe TypeScript + validator zod di `training-engine` jadi satu-satunya sumber kebenaran. Contoh angka di atas hanya ilustrasi format.

## 4. Tabel fase lanjut

| Tabel | Fase | Kolom utama | RLS |
|-------|------|-------------|-----|
| integrations | 2 | provider ('strava'), athlete_id, access_token_enc, refresh_token_enc, expires_at, scopes text[], last_synced_at | **Tidak ada policy untuk client**. Client membaca lewat view `integration_status` (provider, connected_at, last_synced_at) untuk layar 2.1 dan 4.2 |
| subscriptions | 3 | provider ('revenuecat','stripe'), entitlement, expires_at | Client: select saja. Tulis hanya dari webhook |

## 5. Auth & otorisasi

| Aturan | Detail |
|--------|--------|
| Login | Supabase Auth: Apple, Google, Email. Diminta di layar 1.8 atau "Masuk" di 1.1 |
| Profil | Dibuat saat login pertama, berisi data onboarding lokal |
| RLS default | Semua tabel MVP: select/insert/update/delete jika `user_id = auth.uid()` (`profiles`: `id = auth.uid()`) |
| Service role | Hanya di Edge Function |
| Test RLS | Setiap migration punya test: user A tidak bisa membaca/mengubah data user B |

## 6. API contract (Edge Functions)

CRUD biasa memakai Supabase client langsung. Edge Function hanya untuk daftar ini:

| Fungsi | Method | Fase | Input | Output |
|--------|--------|------|-------|--------|
| delete-account | POST | MVP | JWT pengguna | 204; semua data + user auth terhapus |
| export-data | GET | MVP (Should) | JWT pengguna | 200 JSON berisi semua tabel milik pengguna |
| strava-oauth | GET | 2 | `code`, `state` | Redirect ke app; token disimpan terenkripsi |
| strava-webhook | GET / POST | 2 | Verifikasi langganan / event aktivitas | 200; aktivitas di-upsert + dicocokkan |
| plan-adjust | POST | 2 | `plan_id` | Usulan `plan_adjustments` dari data tersinkron |
| revenuecat-webhook, stripe-webhook | POST | 3 | Event langganan (signature diverifikasi) | 200; `subscriptions` di-update |

Error: `{ "error": { "code": "string", "message": "string" } }` dengan HTTP status yang sesuai.
