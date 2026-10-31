# 03. App Flow Document

Status: Draft v0.4 (2026-10-30, fase 2: FL-12, FL-13, FL-14) | Nomor layar = wireframe di `docs/wireframes/`

## Ringkasan

- 4 tab: **Hari ini | Plan | Progres | Profil**. Pengguna baru: Selamat datang -> 6 pertanyaan -> preview plan -> login -> Hari ini.
- Loop inti: Hari ini -> Mulai -> Timer -> Selesai + RPE -> Simpan. Setelah latihan terakhir minggu itu: Ringkasan minggu.
- Status latihan dan timer punya state yang jelas (bagian 3); agent wajib mengikuti transisi di sini.
- Semua teks dari katalog bahasa aktif, Indonesia atau English (TRD 8, F-22). Notifikasi hanya lokal (TRD 9).
- Semua flow membaca/menulis SQLite di perangkat. Hanya login (1.8, 1.9) dan hapus akun (4.6) yang butuh internet.

## 1. Peta layar

| No | Layar | Ke |
|----|-------|----|
| 1.1 | Selamat datang | "Buat plan saya" -> 1.2; "Sudah punya akun? Masuk" -> 1.9 |
| 1.2-1.7 | Onboarding 1/6 sampai 6/6 | Lanjut / Kembali |
| 1.8 | Preview plan + masuk | Apple / Google / Email -> 2.1; tombol kembali "Ubah jawaban" -> 1.7 (jawaban tetap tersimpan, plan dibuat ulang) |
| 1.9 | Masuk (akun lama / HP baru) | Masuk -> data lokal ada: 2.1; kosong: "Pulihkan dari file" -> 4.5 atau "Buat plan baru" -> 1.2 |
| 2.1 | Hari ini (tab) | Mulai -> 2.3; "Lihat detail" -> 2.2; "Catat lari manual" -> 2.6. Kartu kedua strength (F-21): "Mulai strength" -> 2.3s, "Lihat detail" -> 2.2s, terkunci -> 4.4 |
| 2.2 | Detail latihan | Mulai -> 2.3; Pindah hari -> 3.2; Ganti jadi easy |
| 2.2s | Detail strength (F-21) | Daftar gerakan (tempat animasi kosong, dosis, cue, istirahat), "Kenapa latihan ini?". Mulai -> 2.3s; Pindah hari -> 3.2. Terkunci (paywall aktif): "Buka dengan Premium" -> 4.4 |
| 2.3s | Timer: mode gerakan (F-21) | Gerakan repetisi: "Selesai set"; gerakan berwaktu: hitung mundur; istirahat: hitung mundur + "Lewati istirahat". Akhiri / selesai -> 2.4 |
| 2.3 | Timer (gelap) | Selesai / Akhiri -> 2.4 |
| 2.3b | Timer: segmen drill | "Lanjut" per set; set terakhir -> segmen berikut |
| 2.4 | Selesai + RPE | Simpan -> 2.5 (jika latihan terakhir minggu itu) atau 2.1 |
| 2.5 | Ringkasan minggu + adaptasi | 2.1 atau 3.1 |
| 2.6 | Catat lari (manual) | Simpan -> 2.1 (atau 2.5 jika latihan terakhir minggu itu) |
| 3.1 | Kalender plan (tab) | Tap latihan -> 2.2 atau 3.2 |
| 3.2 | Pindahkan latihan | Simpan / Lewati -> 3.1 |
| 3.3 | Progres (tab) | Tap aktivitas -> 3.4 |
| 3.4 | Detail aktivitas | Kembali -> 3.3 |
| 4.1 | Profil (tab) | Target -> 1.2; Zona pace -> ringkasan zona; Hari & pengingat -> 1.6; sakelar Strength + core (FL-12); Jeda plan -> 4.3; Premium -> 4.4 (hanya jika paywall aktif); Data & privasi -> 4.5; Panduan & istilah -> 4.7; Bahasa -> 4.8 |
| 4.2 | Integrasi | Fase 2 (ditunda: butuh kredensial Strava + HP fisik) |
| 4.3 | Jeda plan | Jeda -> 2.1 (status dijeda) |
| 4.4 | Premium (F-23) | Fase 2: layar tanpa pembelian (tombol nonaktif). Kembali -> layar asal. Pembelian Fase 3 (`08-MONETIZATION.md`) |
| 4.8 | Bahasa (F-22) | Ikuti perangkat / Bahasa Indonesia / English; pilihan langsung berlaku (FL-13). Kembali -> 4.1 |
| 4.7 | Panduan & istilah (F-20) | Dari 4.1 "Panduan & istilah" atau tombol (i) di layar terkait -> 4.7 terbuka di topik itu. Kembali -> layar asal |
| 4.5 | Data & privasi | Backup ke file; Pulihkan dari file; sakelar data anonim; Keluar; Hapus akun -> 4.6 |
| 4.6 | Hapus akun | Backup dulu (opsional) -> ketik "HAPUS" -> 1.1 |

## 2. Flow

### FL-1 Onboarding (F-01, F-02, F-03)

| Layar | Isi | Kondisi / edge case |
|-------|-----|---------------------|
| 1.2 | Target: 5K / 10K / HM / FM / "Tidak ada target jarak, ingin lebih bugar" | Wajib pilih |
| 1.3 | Tanggal race (kalender) + nama race (opsional), atau "Belum ada race" | Tampilkan "X minggu lagi" + cocok/tidak. Kurang dari durasi minimum: tawarkan target lebih pendek atau plan dipadatkan dengan peringatan. Dilewati untuk target Bugar |
| 1.4 | "Saya tahu waktunya" (jarak + waktu) atau "Saya tidak tahu" (pilih level) | Tampilkan estimasi waktu target sebagai rentang (Riegel) |
| 1.5 | Volume km/minggu (stepper + chip cepat) + lari terjauh 4 minggu | Di bawah syarat minimum target: sarankan target lebih pendek atau base building |
| 1.6 | Hari tersedia (3-6) + hari long run (Sabtu/Minggu) + jam pengingat | < 3 hari: tombol Lanjut nonaktif. Tampilkan "X hari/minggu: pas untuk plan ...". Saat jam pengingat dipilih: penjelasan 1 kalimat lalu dialog izin notifikasi (FL-11). Web: jam pengingat nonaktif |
| 1.7 | 5 pertanyaan Ya/Tidak + centang disclaimer | Ada "Ya": tampilkan saran ke dokter, plan mode ringan (O3). Disclaimer wajib dicentang |
| 1.8 | Preview: target waktu, hari/minggu, tanggal race, grafik volume per fase, zona pace, kartu lipat "Kenapa plan ini?" (rationale level plan + label bukti + sumber, 07 bagian 3.3), catatan "Data latihanmu tersimpan di HP ini" | Login Apple/Google/Email. Setelah login: `app_meta.owner_id` diisi, data tetap lokal (tidak di-upload). Event `onboarding_completed`, `plan_created` (tanpa isi plan) |

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
| Offline | Semua langkah jalan normal (data memang lokal) |
| Sudah selesai hari ini | Tombol Mulai jadi "Latihan tambahan" (tidak mengubah plan) |
| "Ganti jadi easy" di 2.2 | Sesi kualitas hari itu diganti easy dengan durasi sama; tidak dihitung terlewat |

### FL-3 Log manual (F-15)

2.1 -> "Catat lari manual" -> 2.6: tanggal (default hari ini), jarak, durasi, RPE, tag -> Simpan. Dicocokkan ke latihan terjadwal hari itu jika ada; jika tidak, disimpan sebagai lari tambahan.

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

4.1 -> Data & privasi (4.5) -> Hapus akun (4.6): tawaran "Backup dulu" -> ketik "HAPUS" -> `delete-account` (akun di server) -> hapus semua data lokal + sesi -> 1.1.

| Kasus | Perilaku |
|-------|----------|
| Offline | Hapus akun nonaktif dengan pesan butuh internet. "Hapus data di HP ini saja" tetap bisa |
| `delete-account` gagal | Data lokal **tidak** dihapus; tampilkan error + coba lagi |

### FL-8 Backup dan pulihkan (F-13, F-18)

| Langkah | Perilaku |
|---------|----------|
| 4.5 -> Backup ke file | Buat file JSON (Schema 4) -> share sheet. Berhasil -> `last_backup_at` diisi, tampil "Backup terakhir: hari ini" |
| 4.5 -> Pulihkan dari file | Pilih file -> validasi -> ringkasan (target, jumlah latihan dan aktivitas, tanggal backup) -> "Ganti data di HP ini" -> 2.1 |
| File rusak / bukan backup | Pesan "File ini bukan backup Run Coach"; data lama utuh |
| File dari versi app lebih baru | Pesan "Perbarui app dulu"; data lama utuh |
| 30 hari tanpa backup | Kartu pengingat 1x di 2.1, bisa ditutup atau dimatikan di 4.5 |

### FL-9 Masuk di HP baru (F-01, F-18)

1.1 -> "Sudah punya akun? Masuk" -> 1.9 -> login. Data lokal kosong -> pilihan "Pulihkan dari file backup" (FL-8) atau "Buat plan baru" (1.2). Teks menjelaskan: data tidak disimpan di server, jadi perlu file backup dari HP lama.

### FL-10 Keluar (4.5)

"Keluar" -> pilihan: "Keluar, data tetap di HP ini" atau "Keluar dan hapus data di HP ini" (tawarkan backup dulu). Login akun lain saat ada data akun sebelumnya: wajib pilih backup + hapus, atau batal (TRD 3.4).

### FL-12 Strength + core (F-21)

| Langkah / kasus | Perilaku |
|---|---|
| 1.6 "Mau latihan kekuatan?" | Ya / Nanti saja (default Nanti). Ya: plan memuat sesi strength (E-23..E-26), `profile.strength_opt_in = 1` |
| 4.1 sakelar nyala | Sesi strength/core ditambahkan mulai hari ini ke lari yang sudah ada (lari tidak berubah) |
| 4.1 sakelar mati | Sesi strength terjadwal mulai hari ini dihapus; riwayat tetap |
| 2.1 hari dengan strength | Kartu kedua di bawah kartu lari (atau di bawah kartu Istirahat). Lajur minggu: tanda "S" |
| 3.1 | Hari dengan lari + strength: baris "+ Strength N mnt" di bawah lari, tap -> 2.2s. Hari strength saja: baris Strength |
| 3.2 pindah strength | Boleh ke hari yang ada lari. Ditolak: hari long run, sehari sebelum long run / interval (E-24), hari yang sudah ada strength. Strength tidak bisa digabung |
| 2.3s -> 2.4 | Tanpa jarak dan pace. RPE wajib + "Bebannya terasa: terlalu berat / pas / terlalu ringan" (opsional). Terlalu berat: sesi strength terjadwal berikutnya turun 1 level (E-25) |
| Log manual (2.6) | Hanya dicocokkan ke latihan lari, bukan strength |
| Progres (3.3) | Kepatuhan menghitung lari saja; baris tambahan "Strength: x dari y sesi" |
| Adaptasi (2.5) | Strength terlewat tidak dihitung E-19; aktivitas strength bukan "lari terakhir" (E-13) |

### FL-13 Bahasa (F-22)

4.1 "Bahasa" -> 4.8 -> pilih -> `profile.locale` disimpan -> seluruh layar di-mount ulang dalam bahasa baru (tetap di 4.8). Install baru mengikuti bahasa perangkat. Hapus data di HP (FL-7/FL-10) mengembalikan profil ke default.

### FL-14 Gerbang Premium (F-23)

Paywall mati (default fase 2): tidak ada yang terkunci, baris Premium di 4.1 tersembunyi, 4.4 hanya bisa dibuka langsung. Paywall aktif (`EXPO_PUBLIC_PAYWALL=1`): sesi strength/core minggu ke-3 dst. menampilkan "Buka dengan Premium" di 2.1 dan 2.2s -> 4.4; event `paywall_viewed`. Lari tidak pernah terkunci.

### FL-11 Pengingat dan izin notifikasi (F-12, F-05)

| Kasus | Perilaku |
|-------|----------|
| Pilih jam di 1.6 atau 4.1 | Penjelasan "Kami ingatkan di hari latihan saja" -> dialog izin sistem. Diizinkan: jadwalkan pengingat 7 hari ke depan (TRD 9) |
| Izin ditolak | Lanjut tanpa pengingat; `reminder_time` tetap tersimpan. 4.1: "Pengingat mati: izin notifikasi ditolak" + "Buka pengaturan" |
| Izin diberikan belakangan lewat pengaturan HP | Saat app dibuka: deteksi izin, jadwalkan pengingat |
| Mulai timer pertama kali tanpa izin | Penjelasan cue saat layar terkunci -> dialog izin. Ditolak: timer tetap jalan dengan suara + getar selama app aktif |
| Plan dijeda / dilanjutkan | Jeda: semua pengingat dibatalkan. Lanjut: dijadwalkan ulang |
| Latihan dipindah, digabung, atau adaptasi diterapkan | Pengingat 7 hari ke depan dijadwalkan ulang |
| Latihan hari itu sudah selesai sebelum jam pengingat | Pengingat hari itu dibatalkan |

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

Mode gerakan strength (F-21, 2.3s): 1 gerakan = 1 segmen di "Segmen x dari y". Set berbasis repetisi tidak memakai countdown ("Selesai set"); set berbasis waktu (plank) dan istirahat antar set memakai countdown dan maju otomatis. Istirahat sesudah set terakhir gerakan terakhir tidak ada. "Lewati gerakan" melewati semua set gerakan itu.

Segmen drill (F-17): dosis berbasis jarak (mis. 2 x 20 m) tidak bisa diukur tanpa GPS, jadi segmen ini tidak memakai countdown. Layar menampilkan nama gerakan, set ke-berapa, dan cue; pengguna menekan "Lanjut" setiap set selesai. Dosis berbasis waktu tetap memakai countdown.

### 3.3 Status plan

`active` -> `paused` (FL-6, pengingat dibatalkan) -> `active` (dengan minggu Return to run, pengingat dijadwalkan ulang). `active` -> `archived` saat target diganti dari 4.1.
