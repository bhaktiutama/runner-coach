# Seed data contoh (file backup Run Coach)

Data contoh supaya Progres, Today, dan ringkasan minggu langsung terisi tanpa onboarding. Bukan data pengguna.

| File | Isi |
|---|---|
| `seed-minggu-4.json` | Plan 10K minggu ke-4 dari 16. Latihan sebelum hari ini selesai (15 aktivitas, 2 dilewati, kepatuhan 15 dari 17). Latihan hari ini masih terjadwal, jadi bisa dicoba timer sampai selesai |
| `seed-minggu-4-tuntas.json` | Sama, tetapi semua latihan minggu ini selesai (16 aktivitas): Today berstatus Selesai, ringkasan minggu 100% |
| `raw-plan.json` | Backup asli dari app (onboarding 10K, Senin-Jumat + Minggu) yang dipakai sebagai dasar. Plan dibuat engine, bukan diketik manual |
| `make-seed.py` | Pembuat seed. `python3 make-seed.py OUT.json --today YYYY-MM-DD [--week-done]` |

## Cara pakai di app

Profil, Data & privasi, Pulihkan dari file, pilih salah satu `seed-*.json`, konfirmasi "Ganti data di HP ini". Ini menggantikan data lokal.
Di HP baru: Selamat datang, "Sudah punya akun? Masuk", lalu "Pulihkan dari file backup".

## Catatan

- Tanggal di seed sudah digeser untuk `--today 2026-11-01`. Jika hari ini berbeda, jalankan ulang `make-seed.py` dengan tanggal hari ini (tanggal digeser kelipatan 7 hari agar pola hari latihan tetap).
- Jarak dan durasi aktivitas = target latihan x faktor tetap 0,96 sampai 1,05 (tanpa acak). RPE ditetapkan per tipe latihan. Semua ini data karangan untuk demo.
- `docs/prototypes/animasi-ui-sekarang.html` dibuat dari app asli yang memuat `seed-minggu-4.json` dan `seed-minggu-4-tuntas.json`.
