# 05. Backend Schema Document

Status: Draft v0.1 (2026-10-27) | Platform: Supabase (Postgres + Auth + Edge Functions)

## Ringkasan

- 7 tabel untuk MVP, 2 tabel menyusul (fase 2 dan 3). Semua tabel milik pengguna punya `user_id` dan RLS `user_id = auth.uid()`.
- Satuan: meter (`_m`), detik (`_s`), detik per km untuk pace. Waktu: `timestamptz` (UTC); tanggal latihan: `date` sesuai zona waktu pengguna.
- App membaca/menulis tabel langsung lewat Supabase client (PostgREST + RLS). Edge Function hanya untuk hal yang butuh service role atau pihak ketiga.

## 1. Kolom standar

Semua tabel (kecuali disebut lain) punya:

| Kolom | Tipe | Catatan |
|-------|------|---------|
| id | uuid PK | Dibuat di client (offline-first) |
| user_id | uuid not null FK -> auth.users on delete cascade | |
| created_at | timestamptz not null default now() | |
| updated_at | timestamptz not null default now() | Trigger update otomatis; dasar last-write-wins |
| deleted_at | timestamptz null | Soft delete untuk sinkron |

## 2. Tabel MVP

### profiles (id = auth.users.id, tanpa kolom `user_id`)

| Kolom | Tipe | Catatan |
|-------|------|---------|
| display_name | text null | |
| birth_year | smallint null | check 1900-tahun ini |
| sex | text null | check in ('female','male','other') |
| unit | text not null default 'km' | check in ('km','mi') |
| timezone | text not null default 'Asia/Jakarta' | IANA |
| reminder_time | time null | F-12 |
| health_flag | boolean not null default false | Hanya flag, jawaban screening tidak disimpan |
| disclaimer_accepted_at | timestamptz null | Wajib terisi sebelum plan dibuat |

### goals

| Kolom | Tipe | Catatan |
|-------|------|---------|
| distance | text not null | check in ('5k','10k','hm','fm') |
| race_date | date null | null = tanpa race |
| target_time_s | int null | |
| baseline_distance | text null | Jarak race terakhir |
| baseline_time_s | int null | |
| level | text not null | check in ('beginner','recreational') |
| weekly_volume_m | int not null | Saat onboarding |
| status | text not null default 'active' | check in ('active','completed','abandoned') |

Index unik: 1 goal `active` per pengguna (`unique (user_id) where status = 'active' and deleted_at is null`).

### plans

| Kolom | Tipe | Catatan |
|-------|------|---------|
| goal_id | uuid not null FK -> goals | |
| start_date / end_date | date not null | |
| params | jsonb not null | `{available_days, long_run_day, engine_version}` |
| version | int not null default 1 | Naik setiap adaptasi |
| status | text not null default 'active' | check in ('active','paused','archived') |
| paused_at | timestamptz null | F-09 |

### planned_workouts

| Kolom | Tipe | Catatan |
|-------|------|---------|
| plan_id | uuid not null FK -> plans | |
| date | date not null | |
| week_index | smallint not null | Mulai dari 1 |
| type | text not null | check in ('easy','run_walk','long','tempo','interval','strides','recovery','rest') |
| steps | jsonb not null | Format bagian 3 |
| target_distance_m | int null | |
| target_duration_s | int null | |
| status | text not null default 'scheduled' | check in ('scheduled','completed','skipped','missed') |
| original_date | date null | Terisi jika dipindah (F-08) |

Index: `(user_id, date)`.

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
| splits | jsonb null | |

Index: `(user_id, started_at desc)`. Unik: `(user_id, source, external_id) where external_id is not null` (mencegah duplikat sinkron).

### workout_feedback

| Kolom | Tipe | Catatan |
|-------|------|---------|
| activity_id | uuid not null unique FK -> activities on delete cascade | 1 feedback per aktivitas |
| rpe | smallint not null | check 1-10 |
| notes | text null | |

### fitness_snapshots

| Kolom | Tipe | Catatan |
|-------|------|---------|
| date | date not null | unik per `(user_id, date)` |
| vdot_estimate | numeric(4,1) null | |
| weekly_volume_m | int not null | |

## 3. Format `steps` (jsonb)

Satu struktur untuk timer, kalender, dan export ke jam (fase lanjut).

```json
[
  { "kind": "warmup",   "duration_s": 600, "zone": "easy" },
  { "kind": "repeat",   "times": 6, "steps": [
      { "kind": "work",     "distance_m": 800, "zone": "interval",
        "pace_s_per_km": { "min": 300, "max": 310 } },
      { "kind": "recovery", "duration_s": 120, "zone": "recovery" }
  ]},
  { "kind": "cooldown", "duration_s": 600, "zone": "easy" }
]
```

Aturan: `kind` in (warmup, work, recovery, cooldown, repeat). Setiap step non-repeat wajib punya `duration_s` atau `distance_m`. Tipe TypeScript + validator (zod) didefinisikan di `training-engine` dan jadi satu-satunya sumber kebenaran.

## 4. Tabel fase lanjut

| Tabel | Fase | Kolom utama | RLS |
|-------|------|-------------|-----|
| integrations | 2 | provider ('strava'), athlete_id, access_token_enc, refresh_token_enc, expires_at, scopes text[] | **Tidak ada policy untuk client**. Client membaca status lewat view `integration_status` (provider, connected_at saja) |
| subscriptions | 3 | provider ('revenuecat','stripe'), entitlement, expires_at | Client: select saja. Tulis hanya dari webhook (service role) |

## 5. Auth & otorisasi

| Aturan | Detail |
|--------|--------|
| Login | Supabase Auth: email, Google, Apple |
| Profil | Dibuat otomatis oleh trigger saat user baru terdaftar |
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
| plan-adjust | POST | 2 | `plan_id` | Plan versi baru dari aturan adaptasi |
| revenuecat-webhook, stripe-webhook | POST | 3 | Event langganan (signature diverifikasi) | 200; tabel `subscriptions` di-update |

Error: format `{ "error": { "code": "string", "message": "string" } }` dengan HTTP status yang sesuai.
