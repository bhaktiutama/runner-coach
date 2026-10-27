# 03. App Flow Document

Status: Draft v0.1 (2026-10-27)

## Ringkasan

- 4 tab: **Hari ini | Plan | Progres | Profil**. Pengguna baru selalu lewat Login lalu Onboarding.
- Alur inti: Hari ini -> Mulai -> Timer -> Feedback RPE -> Simpan -> kembali ke Hari ini.
- Status latihan dan timer punya state yang jelas (bagian 3); agent wajib mengikuti transisi di sini.

## 1. Peta layar

```
Splash
  -> belum login        -> Login -> Onboarding (6 langkah) -> Preview Plan -> Hari ini
  -> login, tanpa plan  -> Onboarding
  -> login, ada plan    -> Hari ini

Tab: Hari ini | Plan | Progres | Profil
Hari ini -> Detail latihan -> Timer -> Feedback -> Hari ini
Hari ini -> Log manual -> Hari ini
Plan     -> Detail latihan / Pindah hari
Profil   -> Target | Pengaturan | Jeda plan | Hapus akun | Export data
```

## 2. Flow utama

### FL-1 Onboarding (F-01, F-02, F-03)

| Langkah | Layar | Kondisi / edge case |
|---------|-------|---------------------|
| 1 | Login (email / Google / Apple) | Gagal login: pesan error + coba lagi |
| 2 | Target: 5K / 10K / HM / FM | Wajib pilih |
| 3 | Tanggal race atau "Tidak ada" | Jika tanggal < durasi plan minimum: tawarkan target lebih pendek atau plan dipadatkan dengan peringatan |
| 4 | Kemampuan: waktu 5K/10K terakhir atau "Tidak tahu" (pilih level) | "Tidak tahu": pakai estimasi level |
| 5 | Volume mingguan saat ini | Di bawah syarat minimum target: sarankan target lebih pendek atau "base building" |
| 6 | Hari tersedia (3-6) + hari long run | Kurang dari 3 hari: tidak bisa lanjut |
| 7 | Screening kesehatan + disclaimer | Ada flag: tampilkan saran konsultasi dokter; pengguna tetap bisa lanjut setelah konfirmasi |
| 8 | Preview plan (grafik volume per minggu) | "Ubah" kembali ke langkah 2 |
| 9 | Tap "Mulai Plan" | Plan disimpan lokal dulu, lalu sinkron. Event `onboarding_completed`, `plan_created` |

Keluar di tengah onboarding: jawaban disimpan lokal, lanjut dari langkah terakhir saat dibuka lagi.

### FL-2 Latihan hari ini (F-04, F-05, F-06)

1. Hari ini menampilkan kartu latihan. Jika hari istirahat: kartu "Istirahat" + latihan berikutnya.
2. Tap **Mulai** -> Timer. Event `workout_started`.
3. Timer berjalan per segmen (bagian 3.2). Cue suara + getar di setiap pergantian.
4. Selesai -> layar Feedback: RPE (wajib), jarak, durasi (terisi otomatis dari timer, bisa diedit).
5. Tap **Simpan** -> buat `activity` + `workout_feedback`, latihan jadi `completed`. Event `workout_completed`, `rpe_submitted`.
6. Kembali ke Hari ini, ringkasan minggu ini ter-update.

Edge case:

| Kasus | Perilaku |
|-------|----------|
| Keluar dari timer di tengah | Konfirmasi "Akhiri latihan?". Ya -> ke Feedback dengan durasi sebenarnya |
| App ditutup sistem saat timer jalan | Saat dibuka lagi: hitung posisi dari timestamp mulai, tawarkan lanjut atau akhiri |
| Offline | Semua langkah jalan, data masuk antrian sinkron |
| Sudah ada latihan selesai hari ini | Tombol Mulai jadi "Latihan tambahan" (tidak mengubah plan) |

### FL-3 Log manual (F-06)

Hari ini -> "Catat lari" -> isi jarak, durasi, RPE -> Simpan. Dicocokkan ke latihan terjadwal hari itu jika ada; jika tidak, disimpan sebagai lari tambahan.

### FL-4 Pindah latihan (F-08)

Plan -> tap latihan -> "Pindah" -> pilih hari di minggu yang sama. Tidak boleh 2 sesi berat berurutan; jika terjadi, tampilkan peringatan (tetap boleh disimpan).

### FL-5 Jeda plan (F-09)

Profil -> "Saya cedera / sakit" -> konfirmasi -> plan `paused`, Hari ini menampilkan "Plan dijeda". Lanjut: jika jeda >= 10 hari, tawarkan 1 minggu "kembali lari" sebelum plan dilanjutkan, tanggal latihan digeser.

### FL-6 Hapus akun (F-10)

Profil -> Hapus akun -> ketik "HAPUS" -> panggil `delete-account` -> logout -> Splash. Offline: tombol nonaktif dengan pesan butuh internet.

## 3. State

### 3.1 Status latihan terjadwal (`planned_workouts.status`)

| Dari | Ke | Pemicu |
|------|----|--------|
| scheduled | completed | Feedback disimpan (FL-2) atau log manual cocok (FL-3) |
| scheduled | skipped | Pengguna tap "Lewati" |
| scheduled | missed | Otomatis saat tanggal lewat tanpa aktivitas |
| missed / skipped | completed | Pengguna mencatat lari terlambat untuk latihan itu |

Aturan adaptasi (F-11) membaca status ini (TRD 4.2).

### 3.2 Timer

| State | Aksi pengguna / sistem | State berikut |
|-------|------------------------|---------------|
| idle | Tap Mulai (hitung mundur 3 detik) | running |
| running | Tap Jeda | paused |
| paused | Tap Lanjut | running |
| running | Durasi segmen habis | running (segmen berikut) atau finished |
| running | Tap Lewati | running (segmen berikut) atau finished |
| running / paused | Tap Akhiri + konfirmasi | finished |
| finished | Otomatis | Feedback |

Saat `paused`: notifikasi terjadwal dibatalkan, lalu dijadwalkan ulang saat `running`.
