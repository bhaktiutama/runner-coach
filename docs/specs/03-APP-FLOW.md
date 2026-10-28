# 03. App Flow Document

Status: Draft v0.2 (2026-10-28) | Nomor layar = wireframe "Runner Coach Wireframes"

## Ringkasan

- 4 tab: **Hari ini | Plan | Progres | Profil**. Pengguna baru: Selamat datang -> 6 pertanyaan -> preview plan -> login -> Hari ini.
- Loop inti: Hari ini -> Mulai -> Timer -> Selesai + RPE -> Simpan. Setelah latihan terakhir minggu itu: Ringkasan minggu.
- Status latihan dan timer punya state yang jelas (bagian 3); agent wajib mengikuti transisi di sini.

## 1. Peta layar

| No | Layar | Ke |
|----|-------|----|
| 1.1 | Selamat datang | "Buat plan saya" -> 1.2; "Sudah punya akun? Masuk" -> login -> 2.1 |
| 1.2-1.7 | Onboarding 1/6 sampai 6/6 | Lanjut / Kembali |
| 1.8 | Preview plan + simpan akun | Apple / Google / Email -> 2.1 |
| 2.1 | Hari ini (tab) | Mulai -> 2.3; "Lihat detail" -> 2.2 |
| 2.2 | Detail latihan | Mulai -> 2.3; Pindah hari -> 3.2; Ganti jadi easy |
| 2.3 | Timer (gelap) | Selesai / Akhiri -> 2.4 |
| 2.4 | Selesai + RPE | Simpan -> 2.5 (jika latihan terakhir minggu itu) atau 2.1 |
| 2.5 | Ringkasan minggu + adaptasi | 2.1 atau 3.1 |
| 3.1 | Kalender plan (tab) | Tap latihan -> 2.2 atau 3.2 |
| 3.2 | Pindahkan latihan | Simpan / Lewati -> 3.1 |
| 3.3 | Progres (tab) | Tap aktivitas -> 3.4 |
| 3.4 | Detail aktivitas | Kembali -> 3.3 |
| 4.1 | Profil (tab) | Target -> 1.2; Zona pace -> ringkasan zona; Hari & pengingat -> 1.6; Jeda plan -> 4.3; Privasi & export data; Hapus akun |
| 4.2 | Integrasi | Fase 2 |
| 4.3 | Jeda plan | Jeda -> 2.1 (status dijeda) |
| 4.4 | Premium | Fase 3 |
| - | Log manual, konfirmasi Hapus akun, Login email | Belum ada di wireframe (O1) |

## 2. Flow

### FL-1 Onboarding (F-01, F-02, F-03)

| Layar | Isi | Kondisi / edge case |
|-------|-----|---------------------|
| 1.2 | Target: 5K / 10K / HM / FM / "Tidak ada target jarak, ingin lebih bugar" | Wajib pilih |
| 1.3 | Tanggal race (kalender) + nama race (opsional), atau "Belum ada race" | Tampilkan "X minggu lagi" + cocok/tidak. Kurang dari durasi minimum: tawarkan target lebih pendek atau plan dipadatkan dengan peringatan. Dilewati untuk target Bugar |
| 1.4 | "Saya tahu waktunya" (jarak + waktu) atau "Saya tidak tahu" (pilih level) | Tampilkan estimasi waktu target sebagai rentang (Riegel) |
| 1.5 | Volume km/minggu (stepper + chip cepat) + lari terjauh 4 minggu | Di bawah syarat minimum target: sarankan target lebih pendek atau base building |
| 1.6 | Hari tersedia (3-6) + hari long run (Sabtu/Minggu) + jam pengingat | < 3 hari: tombol Lanjut nonaktif. Tampilkan "X hari/minggu: pas untuk plan ..." |
| 1.7 | 5 pertanyaan Ya/Tidak + centang disclaimer | Ada "Ya": tampilkan saran ke dokter, plan mode ringan (O3). Disclaimer wajib dicentang |
| 1.8 | Preview: target waktu, hari/minggu, tanggal race, grafik volume per fase, zona pace | Login Apple/Google/Email. Setelah login, data lokal diberi `user_id` lalu disinkron. Event `onboarding_completed`, `plan_created` |

Keluar di tengah onboarding: jawaban tetap tersimpan lokal, lanjut dari langkah terakhir. Login gagal: tetap di 1.8, plan tidak hilang.

### FL-2 Latihan harian (F-04, F-05, F-06)

1. 2.1 menampilkan tanggal, "Minggu X/Y", kartu latihan (tipe, jarak, durasi, segmen), Mulai, strip 7 hari, km minggu ini / target.
2. Hari istirahat: kartu "Istirahat" + latihan berikutnya.
3. Mulai -> 2.3. Event `workout_started`. Timer per bagian 3.2.
4. Selesai -> 2.4: durasi dan jarak terisi (jarak bisa diedit), pace rata-rata, RPE (wajib), tag catatan (opsional).
5. Simpan -> `activity` + `workout_feedback`, latihan jadi `completed`. Event `workout_completed`, `rpe_submitted`.
6. Jika itu latihan terjadwal terakhir minggu ini -> 2.5, selain itu -> 2.1.

| Kasus | Perilaku |
|-------|----------|
| Akhiri di tengah | Konfirmasi. Ya -> 2.4 dengan durasi sebenarnya, segmen tuntas "x dari y" |
| App ditutup sistem saat timer jalan | Saat dibuka lagi: hitung posisi dari timestamp mulai, tawarkan lanjut atau akhiri |
| Offline | Semua langkah jalan, data masuk antrian sinkron |
| Sudah selesai hari ini | Tombol Mulai jadi "Latihan tambahan" (tidak mengubah plan) |
| "Ganti jadi easy" di 2.2 | Sesi kualitas hari itu diganti easy dengan durasi sama; tidak dihitung terlewat |

### FL-3 Log manual (F-15)

Hari ini -> "Catat lari" -> jarak, durasi, RPE -> Simpan. Dicocokkan ke latihan terjadwal hari itu jika ada; jika tidak, disimpan sebagai lari tambahan.

### FL-4 Ringkasan minggu + adaptasi (F-11)

2.5 menampilkan latihan tuntas x/y, jarak vs minggu lalu, waktu lari vs target. Jika aturan adaptasi (TRD 4.3) terpicu: kartu "Plan minggu depan disesuaikan" + alasan + perubahan. "Oke, terapkan" -> plan versi baru. "Tetap plan awal" -> tidak berubah, usulan tidak ditampilkan lagi untuk minggu itu.

### FL-5 Pindah latihan (F-08)

3.2: pilih hari di minggu yang sama, tiap pilihan langsung diberi pesan:

| Kondisi hari tujuan | Pesan | Hasil |
|---------------------|-------|-------|
| Kosong, tidak berurutan dengan sesi berat | Aman | Dipindah |
| Sehari setelah sesi berat | Bisa, dengan saran pelan | Dipindah |
| Sudah ada latihan | Peringatan + tawaran gabung | Digabung jadi 1 latihan |
| Hari asal | "Ini jadwal awal" | Tidak berubah |

"Lewati latihan ini" -> status `skipped`.

### FL-6 Jeda plan (F-09)

4.3: alasan (Cedera / Sakit / Sibuk-libur), durasi (3 hari / 1 minggu / 2 minggu / Belum tahu), bagian nyeri (opsional, hanya untuk saran, tidak disimpan). Peringatan ke dokter/fisioterapis untuk nyeri tajam. "Jeda plan" -> plan `paused`, 2.1 menampilkan "Plan dijeda". Lanjut -> 1 minggu "Return to run" (volume rendah, tanpa sesi berat), tanggal digeser, target waktu race dicek ulang.

### FL-7 Hapus akun (F-10)

Profil -> Hapus akun -> ketik "HAPUS" -> `delete-account` -> logout -> 1.1. Offline: tombol nonaktif dengan pesan butuh internet.

## 3. State

### 3.1 Status latihan terjadwal

| Dari | Ke | Pemicu |
|------|----|--------|
| scheduled | completed | Simpan di 2.4 atau log manual cocok |
| scheduled | skipped | "Lewati" di 3.2 |
| scheduled | missed | Otomatis saat tanggal lewat tanpa aktivitas |
| missed / skipped | completed | Pengguna mencatat lari terlambat untuk latihan itu |
| scheduled | (dihapus) | Digabung ke latihan lain di 3.2 |

### 3.2 Timer (2.3)

| State | Aksi / sistem | State berikut |
|-------|---------------|---------------|
| idle | Mulai (hitung mundur 3 detik) | running |
| running | Jeda | paused (label "DIJEDA") |
| paused | Lanjutkan | running |
| running | Segmen habis | running (segmen berikut) atau finished |
| running / paused | Akhiri + konfirmasi | finished |
| finished | Otomatis | 2.4 |

Saat `paused`: notifikasi terjadwal dibatalkan, dijadwalkan ulang saat `running`.

### 3.3 Status plan

`active` -> `paused` (FL-6) -> `active` (dengan minggu Return to run). `active` -> `archived` saat target diganti dari 4.1.
