# 09 Desain Suara: latihan tanpa melihat layar

Status: **Usulan v0.2 (2026-11-04), belum disetujui pemilik produk.** Keputusan pemilik 2026-11-04: perintah suara (mikrofon) tidak dibangun; cukup pelatih suara, dengan alternatif "Bunyi saja"; angka hitung mundur tetap tampil di set berwaktu dan istirahat. Isi dokumen ini belum boleh dibangun sebelum keputusan di bagian 10 diambil. Setelah disetujui, perubahan di bagian 9 dipindah ke PRD, TRD, App Flow, UI/UX dan Schema.

## Ringkasan

- **Pelatih suara (F-25)**, satu fitur dengan dua mode panduan audio: **Suara** (kalimat TTS + bunyi penanda) atau **Bunyi saja** (pola bip sintesis, tanpa kalimat). Tidak ada mikrofon, tidak ada perintah suara.
- Mode Suara memakai `expo-speech` (ada di Expo Go dan web, tanpa dev build). Mode Bunyi saja tanpa library baru: file WAV pendek yang dibuat oleh skrip dari nada sintesis.
- Layar tidak berubah: angka hitung mundur tetap ada di set berwaktu (plank), istirahat dan segmen lari. Suara dan bunyi melengkapi layar, tidak menggantikannya.

## 1. Tujuan dan ukuran berhasil

| # | Tujuan | Ukuran (usulan, belum diukur) |
|---|--------|-------------------------------|
| T1 | Sesi lari atau strength bisa diikuti tanpa melihat layar setelah Mulai | Uji 5 sesi per mode di device: 0 kali perlu melihat layar untuk tahu kapan mulai, ganti, istirahat dan selesai |
| T2 | Pengguna tahu "sekarang apa, berapa lama lagi, berikutnya apa" | Mode Suara: setiap pergantian segmen/set punya ucapan. Mode Bunyi saja: setiap jenis momen punya pola bunyi berbeda |
| T3 | Pola bunyi mudah dibedakan | Uji 5 orang: setelah mendengar contoh sekali, >= 80% momen ditebak benar (usulan, diukur di S-V2) |
| T4 | Tidak mengganggu | Tidak ada ucapan/bunyi yang tumpang tindih; musik pengguna di-duck saat bicara, bukan dihentikan |
| T5 | Privasi tetap "data di HP" | Tidak ada izin mikrofon; tidak ada request jaringan karena fitur ini (TTS sistem di perangkat) |

## 2. Prinsip

| # | Prinsip | Artinya di app |
|---|---------|----------------|
| P1 | Bertingkat | Getar < bunyi < kalimat. Kalimat hanya saat ada informasi baru |
| P2 | Ringkas, urutan tetap | Pola kalimat: **apa** -> **berapa** -> **target**. "Tempo. 14 menit. Pace 6 menit 45 detik per kilometer." |
| P3 | Memberi tahu sebelum terjadi | Peringatan (1 menit / 10 detik), lalu 3-2-1 berupa bunyi, lalu tanda mulai |
| P4 | Satu suara pada satu waktu | Antrian prioritas; ucapan basi dibuang (3.3) |
| P5 | Bunyi punya makna tetap | Arah nada = arah intensitas: naik = kerja dimulai / lebih berat, turun = istirahat / lebih ringan. Pola sama di lari dan strength |
| P6 | Layar tetap sumber kebenaran | Semua yang diucapkan atau ditandai bunyi juga terlihat di layar, termasuk angka hitung mundur |
| P7 | Netral dan profesional | Penyemangat hanya 1 kalimat di akhir sesi (dan di 2 menit terakhir segmen berat pada detail Lengkap) |

## 3. Arsitektur

### 3.1 Modul

| Modul (usulan) | Isi | Murni / native |
|----------------|-----|----------------|
| `timer/audioScript.ts` | Dari `TimerSegment[]` + posisi + event state machine menghasilkan daftar momen berjadwal `{ at, moment, key, values, priority }`. Satu daftar untuk kedua mode; mode menentukan apakah momen diputar sebagai kalimat + bunyi atau bunyi saja | Murni, unit test |
| `timer/audioDirector.ts` | Antrian prioritas, aturan basi, pemilihan suara per locale, fallback ke Bunyi saja | Murni (adaptor diinjeksi) |
| `timer/speech.ts` | Adaptor TTS `expo-speech` (iOS AVSpeechSynthesizer, Android TextToSpeech, web speechSynthesis) | Native |
| `timer/cues.ts` (ada) | Diperluas: putar pola bunyi (bagian 5) + getar yang sepadan | Native |
| `packages/ui/format.ts` `speak*` | Angka untuk diucapkan: "6 menit 45 detik per kilometer", "400 meter", "30 detik" | Murni, snapshot test |
| `scripts/make-earcons.py` | Membuat WAV dari nada sintesis (Python stdlib `wave` + `math`, tanpa dependensi) | Skrip build, hasil di `assets/sounds/` |

State machine `machine.ts` tidak berubah. `upcomingBoundaries` yang sudah ada dipakai sebagai dasar jadwal momen.

### 3.2 Sesi audio

| | iOS | Android | Web |
|-|-----|---------|-----|
| Saat bicara | Kategori playback, `duckOthers` | Audio focus transient may-duck | speechSynthesis (suara `localService`) |
| Di luar ucapan / bunyi | `mixWithOthers` (seperti sekarang) | Sama | Sama |

### 3.3 Antrian

| Prioritas | Contoh | Aturan |
|-----------|--------|--------|
| 1 Kritis | 3-2-1, tanda mulai, tanda istirahat, selesai | Tidak pernah ditunda; memotong prioritas 3 |
| 2 Transisi | Perkenalan segmen/gerakan, "Berikutnya ..." | Dijadwalkan agar selesai >= 1 detik sebelum tick pertama |
| 3 Info | Setengah jalan, update berkala, cue teknik | Dibuang jika terlambat > 2 detik atau bertabrakan dengan prioritas 1 |

Panjang ucapan diperkirakan dari jumlah suku kata x kecepatan suara (dikalibrasi di S-V1). Tombol bisu di bar timer (`muted`) mematikan ucapan dan bunyi; getar tetap.

## 4. Mode Suara: skrip per mode

Kunci katalog baru `voice.*` di `i18n/id.ts` + `en.ts`. Contoh versi ID detail Normal. Setiap ucapan didahului atau diikuti pola bunyi di bagian 5, jadi mode Suara = mode Bunyi saja + kalimat.

### 4.1 Lari (2.3)

| Momen | Syarat | Ucapan (Normal) | Ringkas |
|-------|--------|-----------------|---------|
| Mulai segmen | Selalu | "Tempo. 14 menit. Pace 6 menit 45 detik per kilometer." | "Tempo, 14 menit." |
| Setengah jalan | Segmen >= 6 menit | "Setengah jalan. 7 menit lagi." | (tidak) |
| 1 menit lagi | Segmen >= 3 menit | "1 menit lagi. Berikutnya: jog pemulihan, 2 menit." | "1 menit lagi." |
| 10 detik lagi | Segmen < 3 menit | "10 detik. Berikutnya: lari, 400 meter." | (tidak) |
| Repetisi interval | Interval | "Repetisi 3 dari 6. 2 menit. Pace 5 menit 10 detik." | "Repetisi 3 dari 6." |
| Berkala | Easy/long >= 20 menit, tiap 10 menit (Lengkap) | "20 menit berjalan. 25 menit lagi." | (tidak) |
| Dijeda / lanjut | Tombol | "Dijeda." / "Lanjut. 6 menit lagi di segmen ini." | "Dijeda." / "Lanjut." |
| Selesai | finished | "Latihan selesai. 42 menit. Kerja bagus." | "Selesai." |

Pace yang diucapkan adalah **target** plan. Tanpa GPS (TRD) tidak ada umpan balik "terlalu cepat/lambat"; disebut di Panduan.

### 4.2 Drill (2.3b)

| Momen | Ucapan |
|-------|--------|
| Gerakan baru | "Drill 2 dari 4: A-skip. 2 kali 20 meter. Lutut tinggi, lengan aktif." (cue pertama saja) |
| Set berikutnya | "Set 2 dari 2." |
| Menunggu "Lanjut" | Diam (pengguna menekan tombol) |

### 4.3 Strength (2.3s)

Contoh: Squat 3 x 10, istirahat 60 detik; Plank 2 x 30 detik; Side plank 2 x 20 detik per sisi.

| Momen | Ucapan (Normal) | Layar (tidak berubah) |
|-------|-----------------|-----------------------|
| Gerakan baru, set 1 | "Gerakan 1 dari 5: Squat. 3 set, 10 repetisi. Dada tegak, lutut searah jari kaki." | Animasi, nama, set, cue |
| Set repetisi berjalan | Diam. App tidak menghitung repetisi | Tombol "Selesai set" |
| "Selesai set" ditekan | "Istirahat 60 detik." | Hitung mundur istirahat |
| Istirahat, separuh | Istirahat >= 60 detik: "30 detik." | Hitung mundur |
| Istirahat, 10 detik lagi | "Berikutnya: Squat, set 2 dari 3. Siap-siap." | "Berikutnya: ..." |
| Istirahat habis | 3-2-1 lalu tanda mulai | Layar gerakan |
| Set berwaktu mulai | "Plank. Set 1 dari 2. 30 detik." 3-2-1, tanda mulai | Hitung mundur set |
| Set berwaktu, separuh | Set >= 20 detik: "15 detik lagi." | Hitung mundur |
| Set berwaktu, akhir | "10 detik." 3-2-1, tanda istirahat, "Istirahat 45 detik." | Ke istirahat |
| Per sisi berwaktu | Di tengah: tanda ganti sisi + "Ganti sisi." (hari ini belum ada penanda: `timedS` = 2 x durasi) | Hitung mundur berjalan terus |
| Per sisi repetisi | Di awal: "10 repetisi per sisi." | Sama |
| Selesai | "Latihan selesai. Kerja bagus." | Ke 2.4 |

### 4.4 Detail suara

| Detail | Isi |
|--------|-----|
| Ringkas | Transisi, 3-2-1, selesai |
| Normal (default) | + target pace, peringatan 1 menit / 10 detik, "Berikutnya", cue teknik pertama per gerakan |
| Lengkap | + update berkala lari panjang, cue teknik tiap set, 1 kalimat penyemangat di 2 menit terakhir tempo/interval |

### 4.5 Bahasa dan suara

- Bahasa ucapan = locale aktif (F-22). Suara dipilih dari `Speech.getAvailableVoicesAsync()` yang cocok `id-ID` / `en-US`, kualitas tertinggi yang terpasang.
- Suara locale tidak ada (sebagian browser desktop, HP lama): otomatis **Bunyi saja**, 4.1 menampilkan "Suara Bahasa Indonesia tidak terpasang di perangkat ini, memakai bunyi". Tidak pindah diam-diam ke suara bahasa lain.

## 5. Mode Bunyi saja: bahasa bunyi

Pola dibuat dari nada sintesis bergaya kaca/marimba (sinus + partial yang cepat meredup, attack 4 ms, decay eksponensial, gema ruang kecil; tanpa gelombang kotak), nada dari tangga A mayor pentatonik (A5 880 Hz, C#6, E6 1318 Hz, A6), dirender ke WAV 44,1 kHz oleh `scripts/make-earcons.py`. Contoh v0.1 untuk review: `docs/audio/earcons/` (`index.html` = halaman dengar). Frekuensi di tabel bawah mengikuti contoh ini. Semua dinormalisasi ke puncak -3 sampai -10 dBFS sesuai peran. Frekuensi dan durasi masih usulan, dikalibrasi di S-V2.

| Momen | Pola | Getar | Dipakai di |
|-------|------|-------|-----------|
| 3-2-1 | 3 x ketukan kaca pendek E6 (jarak 1 detik) | Ringan per bip (sudah ada `countdownTick`) | Sebelum setiap mulai kerja dan akhir istirahat |
| **Mulai kerja / naik intensitas** | Naik A5, E6, A6 setelah 3-2-1 | Kuat | Mulai set, mulai segmen tempo/interval/lari |
| **Istirahat / turun intensitas** | Turun E6, C#6, A5, timbre lebih hangat | Sedang | Set selesai, mulai istirahat, mulai jog/jalan pemulihan |
| Setengah jalan | 1 denting lembut C#6 | Tidak | Segmen >= 6 menit, istirahat >= 60 detik, set berwaktu >= 20 detik |
| 10 detik / 1 menit lagi | 2 ketukan cepat E6 | Ringan | Peringatan sebelum pergantian |
| Ganti sisi | 3 nada marimba A5, E6, A5 | Ringan x2 | Set berwaktu per sisi, di tengah |
| Segmen lari baru, intensitas sama | Dyad marimba A5 + C#6 (ganti `cue.wav`) | Sedang | Mis. easy -> easy, repetisi berikutnya setelah 3-2-1 |
| Sesi selesai | Arpeggio naik A5, C#6, E6, A6 (ganti `done.wav`) | Sukses | Akhir sesi |

Aturan:

- Satu momen = satu pola; tidak ada dua pola dalam 1 detik kecuali 3-2-1 + tanda mulai (memang satu rangkaian).
- Pola yang sama dipakai di mode Suara: bunyi lebih dulu, kalimat sesudahnya. Pengguna yang pindah mode tidak perlu belajar ulang.
- **Belajar bunyi:** topik baru di Panduan 4.7 "Arti bunyi timer" berisi tabel di atas dengan tombol putar per pola (bukan layar baru). Tautan dari 4.1 di bawah pilihan Bunyi saja.

## 6. Angka hitung mundur

Tetap seperti sekarang (App Flow 3.2, UI/UX 2.3s): angka hitung mundur tampil di segmen lari, set berwaktu strength (plank) dan istirahat. Set repetisi dan drill berbasis jarak tidak punya angka karena tidak berwaktu. Panduan audio mengikuti angka yang sama; tidak ada informasi yang hanya ada di audio atau hanya di layar.

## 7. Layar terkunci dan latar belakang

| Platform | Masalah | Rencana |
|----------|---------|---------|
| iOS | JS berhenti saat app di latar belakang; TTS terjadwal tidak jalan | S-V1: uji `UIBackgroundModes: audio` + sesi audio aktif selama `running`. Jika tidak andal: notifikasi lokal yang sudah ada dengan **bunyi pola** sebagai suara notifikasi (file WAV yang sama) + teks ucapan; anjuran layar tetap menyala dengan Kunci layar (sudah ada) |
| Android | Proses bisa dihentikan di latar belakang | S-V1 dengan audio aktif; foreground service butuh library baru, diusulkan terpisah bila perlu |
| Web | Tab tidak aktif menunda timer | Seperti sekarang (TRD 5): hanya saat tab aktif + Wake Lock |

Keuntungan mode Bunyi saja: pola bunyi bisa menjadi suara notifikasi terjadwal, jadi tetap bekerja saat layar terkunci meski JS berhenti. Kalimat TTS tidak bisa.

## 8. Pengaturan dan data

### 8.1 Layar 4.1 (bagian Latihan)

| Baris | Nilai | Default |
|-------|-------|---------|
| Panduan audio | Suara / Bunyi saja | Suara (Bunyi saja jika suara locale tidak terpasang) |
| Detail suara | Ringkas / Normal / Lengkap (hanya tampil jika Suara) | Normal |
| Arti bunyi timer | Tautan ke 4.7 | - |

Mematikan semua audio tetap lewat tombol bisu di timer (sudah ada). Tidak ada layar baru, tidak ada izin baru.

### 8.2 Schema (migrasi v7, lokal)

| Kolom `profile` | Tipe | Isi |
|-----------------|------|-----|
| `audio_guide` | text default 'voice' | `voice` / `beeps` |
| `voice_detail` | text default 'normal' | `brief` / `normal` / `full` |

Ikut file backup. Tidak ada tabel baru, tidak ada apa pun di server. Analitik paling banyak nilai `audio_guide` lewat sakelar data pemakaian yang ada (PV-d).

### 8.3 Aksesibilitas

- VoiceOver/TalkBack aktif: ucapan dikirim lewat pengumuman aksesibilitas agar tidak bertabrakan (diuji di S-V1).
- Pengguna tuli/HOH: angka tetap di layar (bagian 6) dan setiap pola bunyi punya getar sepadan (tabel bagian 5).

## 9. Perubahan spec bila disetujui

| Dokumen | Perubahan |
|---------|-----------|
| 01-PRD | F-25 Pelatih suara (Should): mode Suara / Bunyi saja, detail, layar 2.3, 2.3b, 2.3s, 4.1, 4.7 |
| 02-TRD | Library `expo-speech` (npm, versi SDK 58: 58.0.3). Bagian 5 (latar belakang, bunyi notifikasi), bagian 8 katalog `voice.*` |
| 03-APP-FLOW | 3.2: momen audio per state (tanpa perubahan state) |
| 04-UI-UX | Baris 4.1, topik 4.7, tabel bunyi + getar (perluasan G5) |
| 05-SCHEMA | Migrasi v7, 2 kolom `profile` |
| 06-PLAN | Milestone V1, V2 (bagian 11) |
| 08-MONETIZATION | Usulan: gratis, bagian dari timer F-05 yang gratis |
| Wireframe | 4.1 (baris baru), 4.7 topik bunyi, versi ID/EN, terang/gelap |

## 10. Keputusan pemilik

| # | Pertanyaan | Usulan |
|---|-----------|--------|
| K1 | Default Panduan audio: Suara atau Bunyi saja | Suara (lebih jelas untuk pengguna baru); Bunyi saja untuk yang sudah hafal atau mendengar musik |
| K2 | TTS sistem vs rekaman suara manusia | TTS sistem: gratis, 2 bahasa, isi dinamis (nama gerakan, pace). Rekaman bisa dipertimbangkan nanti untuk kata tetap |
| K3 | Pengaturan kecepatan bicara | Tidak di V1 |
| K4 | Nada dasar dan pola di bagian 5 | Setuju sebagai titik awal, final setelah S-V2 |

## 11. Tahapan

| Fase | Isi | Branch usulan | Butuh | Selesai jika |
|------|-----|---------------|-------|--------------|
| S-V1 | Spike TTS: kualitas `id-ID`/`en-US` di iOS, Android, Chrome, Safari; latensi; ducking musik; layar terkunci | `spike/voice-tts` | HP fisik (Expo Go cukup) | Tabel hasil di `spikes.md` |
| S-V2 | Spike bunyi: `make-earcons.py`, uji beda pola di atas musik, 5 orang (T3) | `spike/earcons` | HP + headset | Pola final |
| V1 | Bunyi saja: pola bagian 5 di `cues.ts`, `audioScript`/`audioDirector`, bunyi notifikasi layar kunci, ganti sisi, topik 4.7, baris 4.1, migrasi v7 | `feat/v1-audio-beeps` | Persetujuan spec | Unit test jadwal momen per mode (lari, interval, drill, strength repetisi/berwaktu/per sisi); test tidak ada 2 pola dalam 1 detik; E2E web: momen tercatat lewat adaptor palsu |
| V2 | Suara: `speech.ts`, skrip `voice.*` ID/EN, detail, fallback ke bunyi, `speak*` | `feat/v2-voice-coach` | V1, S-V1 | Unit test skrip + antrian (tidak tumpang tindih, basi dibuang); review di preview web; uji device 5 sesi |

V1 sengaja Bunyi saja dulu: tanpa library baru, bekerja di layar terkunci lewat notifikasi, dan menjadi dasar pola yang juga dipakai mode Suara.

## 12. Risiko

| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| JS tidak berjalan saat layar terkunci (iOS) | Kalimat TTS diam saat HP dikunci | Bunyi pola lewat notifikasi terjadwal; layar menyala + Kunci layar |
| Suara `id-ID` tidak terpasang | Tidak ada kalimat | Otomatis Bunyi saja (4.5) |
| Pola bunyi tertukar | Pengguna salah momen | Arah nada konsisten (P5), getar sepadan, topik 4.7, uji T3 |
| Bunyi tenggelam di musik | Momen terlewat | Nada 990 Hz di atas rentang vokal utama, ducking saat bicara, getar |
| Batas panjang suara notifikasi (iOS maks 30 detik, format tertentu) | Bunyi notifikasi tidak terputar | Semua pola < 1 detik, WAV PCM; diuji di S-V1 |
