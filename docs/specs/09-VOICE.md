# 09 Desain Suara: latihan tanpa melihat layar

Status: **Usulan v0.1 (2026-11-04), belum disetujui pemilik produk.** Kecuali bagian 6 (hitung mundur strength hanya saat istirahat) yang sudah diterapkan, isi dokumen ini belum boleh dibangun sebelum keputusan di bagian 12 diambil. Setelah disetujui, perubahan di bagian 11 dipindah ke PRD, TRD, App Flow, UI/UX dan Schema.

## Ringkasan

- Dua lapisan: **Pelatih suara** (app bicara, F-25) dan **Perintah suara** (app mendengar perintah pendek, F-26). Keduanya opsional, berjalan di perangkat, tanpa audio atau teks ucapan ke server.
- Pelatih suara bisa dibangun dulu tanpa dev build (`expo-speech` ada di Expo Go dan web). Perintah suara butuh modul native (`expo-speech-recognition`), jadi butuh dev build iOS/Android dan keputusan pemilik (bagian 12).
- Di strength, angka hitung mundur di layar hanya muncul saat istirahat. Set berwaktu (plank) dipandu bunyi sekarang dan suara nanti; set repetisi tidak pernah dihitung oleh app.

## 1. Tujuan dan ukuran berhasil

| # | Tujuan | Ukuran (usulan, belum diukur) |
|---|--------|-------------------------------|
| T1 | Satu sesi lari atau strength bisa diselesaikan tanpa melihat layar setelah menekan Mulai | Uji 5 sesi per mode di device: 0 kali perlu melihat layar untuk tahu apa yang harus dilakukan |
| T2 | Pengguna selalu tahu "sekarang apa, berapa lama lagi, berikutnya apa" | Setiap pergantian segmen/set punya ucapan; perintah "berapa lagi" menjawab < 1 detik |
| T3 | Perintah suara terasa andal | Akurasi 10 perintah >= 90% di ruangan tenang, >= 80% saat lari di luar (diukur di spike S-V3) |
| T4 | Tidak mengganggu | Aktivasi palsu <= 1 per 30 menit dengan musik di headset (diukur di S-V3); suara app tidak pernah tumpang tindih dengan dirinya sendiri |
| T5 | Privasi tetap "data di HP" | Test privasi: tidak ada request jaringan selama sesi dengan perintah suara aktif |

## 2. Prinsip desain suara

| # | Prinsip | Artinya di app |
|---|---------|----------------|
| P1 | Bertingkat | Getar < bunyi pendek (earcon) < kalimat. Kalimat hanya saat ada informasi baru |
| P2 | Ringkas, urutan tetap | Pola kalimat: **apa** -> **berapa** -> **target**. Contoh: "Tempo. 14 menit. Pace 6:45 per kilometer." Maks 12 kata per ucapan di mode Ringkas |
| P3 | Memberi tahu sebelum terjadi | Peringatan sebelum pergantian (1 menit / 10 detik), lalu 3-2-1 berupa bunyi, lalu kata "Mulai" atau "Istirahat" |
| P4 | Satu suara pada satu waktu | Antrian prioritas; ucapan lama dibuang jika sudah basi (lihat 3.3) |
| P5 | Mendengar hanya saat perlu | Mikrofon dibuka di jendela yang masuk akal (set repetisi, istirahat, jeda) atau setelah tombol headset; tidak ada wake word yang selalu aktif |
| P6 | Konfirmasi singkat | Setiap perintah yang dikenali dijawab bunyi "ack" < 300 ms; aksi yang merusak (Akhiri) perlu "ya" |
| P7 | Layar tetap sumber kebenaran | Semua yang diucapkan juga terlihat di layar; suara tidak membawa informasi yang tidak ada di layar |
| P8 | Netral dan profesional | Tidak ada pujian berlebihan. Satu kalimat penyemangat hanya di akhir sesi dan di 2 menit terakhir segmen berat (mode Lengkap) |

## 3. Arsitektur

### 3.1 Komponen

| Modul (usulan) | Isi | Murni / native |
|----------------|-----|----------------|
| `timer/voiceScript.ts` | Dari `TimerSegment[]` + `Position` + event state machine menghasilkan daftar ucapan berjadwal: `{ at, key, values, priority, kind }`. Teks diambil dari katalog i18n | Murni, unit test |
| `timer/voiceDirector.ts` | Antrian prioritas, aturan basi, jeda mikrofon saat bicara, pemilihan suara per locale | Murni (adaptor diinjeksi) |
| `timer/speech.ts` | Adaptor TTS: `expo-speech` (iOS AVSpeechSynthesizer, Android TextToSpeech, web speechSynthesis) | Native |
| `timer/commands.ts` | Tata bahasa perintah per locale, normalisasi, pencocokan per state timer | Murni, unit test |
| `timer/listener.ts` | Adaptor pengenal ucapan: `expo-speech-recognition` dengan `requiresOnDeviceRecognition: true`, `contextualStrings` dari tata bahasa | Native, dev build |
| `packages/ui/format.ts` `speak*` | Format angka untuk diucapkan: "6 menit 45 detik per kilometer", "400 meter", "30 detik" (bukan "6:45 /km" yang dibaca aneh oleh TTS) | Murni, snapshot test |

State machine `machine.ts` tidak berubah strukturnya: perintah suara memanggil aksi yang sama dengan tombol (`next`, `pause`, `resume`, `skipGroup`, `end`). Satu-satunya tambahan yang mungkin adalah "tambah istirahat" (bagian 5.2, opsional, perlu keputusan K5).

### 3.2 Sesi audio

| Kondisi | iOS | Android | Web |
|---------|-----|---------|-----|
| Hanya Pelatih suara | Kategori playback, `duckOthers` saat bicara, `mixWithOthers` di luar ucapan | Audio focus `GAIN_TRANSIENT_MAY_DUCK` saat bicara | speechSynthesis; musik tab lain tidak di-duck |
| + Perintah suara | `playAndRecord` + `allowBluetoothA2DP` (output tetap A2DP ke headset, mikrofon dari HP) | Mikrofon dibuka per jendela | Nonaktif sampai S-V4 (bagian 9) |

Catatan penting: membuka mikrofon headset Bluetooth membuat banyak headset pindah ke profil HFP, kualitas musik turun drastis. Default usulan: mikrofon HP, bukan mikrofon headset. Dampaknya: HP di saku/armband lebih sulit mendengar. Diuji di S-V3.

### 3.3 Antrian ucapan

| Prioritas | Contoh | Aturan |
|-----------|--------|--------|
| 1 Kritis | "Mulai", "Istirahat", "Selesai", jawaban perintah | Memotong ucapan prioritas 3 |
| 2 Transisi | Perkenalan segmen/gerakan, "Berikutnya ..." | Menunggu ucapan yang sedang berjalan |
| 3 Info | Setengah jalan, sisa waktu berkala, cue teknik | Dibuang jika terlambat > 2 detik dari jadwal atau bertabrakan dengan prioritas 1 |

- Earcon 3-2-1 tidak pernah ditunda; ucapan dijadwalkan agar selesai minimal 1 detik sebelum tick pertama. Panjang ucapan diperkirakan dari jumlah suku kata x kecepatan suara (dikalibrasi di S-V1).
- Mikrofon ditutup selama TTS bicara + 300 ms sesudahnya agar app tidak mendengar dirinya sendiri.
- Bisu (tombol suara di bar atas, `muted`) mematikan ucapan **dan** earcon; getar tetap.

### 3.4 Earcon (bunyi pendek)

| Bunyi | Kapan | File |
|-------|-------|------|
| `cue` (ada) | Pergantian segmen/set | `assets/sounds/cue.wav` |
| `done` (ada) | Sesi selesai | `assets/sounds/done.wav` |
| `tick` (baru) | 3-2-1 sebelum mulai kerja dan sebelum istirahat habis | `assets/sounds/tick.wav` |
| `ack` (baru) | Perintah dikenali | `assets/sounds/ack.wav` |

Bunyi baru dibuat sendiri (bukan unduhan berlisensi tidak jelas), < 300 ms, dinormalisasi -16 LUFS sama dengan yang ada.

## 4. Skrip suara per mode

Kunci katalog baru di `i18n/id.ts` + `en.ts` dengan awalan `voice.`; contoh di bawah versi ID mode Normal. Angka lewat `speak*` (bagian 3.1).

### 4.1 Lari (2.3)

| Momen | Syarat | Ucapan (Normal) | Ringkas |
|-------|--------|-----------------|---------|
| Setelah hitung mundur awal | Selalu | "Segmen 1 dari 4. Pemanasan jalan cepat, 5 menit." | "Pemanasan, 5 menit." |
| Mulai segmen | Selalu | "Tempo. 14 menit. Pace 6 menit 45 detik per kilometer." | "Tempo, 14 menit." |
| Setengah jalan | Segmen >= 6 menit | "Setengah jalan. 7 menit lagi." | (tidak) |
| 1 menit lagi | Segmen >= 3 menit | "1 menit lagi. Berikutnya: jog pemulihan, 2 menit." | "1 menit lagi." |
| 10 detik lagi | Segmen < 3 menit | "10 detik. Berikutnya: lari, 400 meter." | (tidak) |
| 3-2-1 | Setiap batas segmen | `tick` x3 | `tick` x3 |
| Repetisi interval | Interval | "Repetisi 3 dari 6. 2 menit. Pace 5 menit 10 detik." | "Repetisi 3 dari 6." |
| Berkala | Segmen easy/long >= 20 menit, tiap 10 menit (Lengkap saja) | "20 menit berjalan. 25 menit lagi." | (tidak) |
| Dijeda | Jeda | "Dijeda." | "Dijeda." |
| Lanjut | Lanjutkan | "Lanjut. 6 menit lagi di segmen ini." | "Lanjut." |
| Selesai | finished | "Latihan selesai. 42 menit. Kerja bagus." lalu `done` | "Selesai." |

Pace yang diucapkan adalah **target** dari plan. App tidak memakai GPS (TRD), jadi tidak ada umpan balik "terlalu cepat/lambat"; ini disebut di Panduan agar tidak diharapkan.

### 4.2 Drill (2.3b)

| Momen | Ucapan |
|-------|--------|
| Gerakan baru | "Drill 2 dari 4: A-skip. 2 kali 20 meter. Lutut tinggi, lengan aktif." (cue teknik pertama saja) |
| Set berikutnya | "Set 2 dari 2." |
| Menunggu "Lanjut" | Diam. Jika Perintah suara aktif: mikrofon terbuka untuk "lanjut" / "selesai" |
| Pengingat | Sekali, 60 detik setelah estimasi set lewat tanpa aksi: "Bilang 'lanjut' setelah selesai." (hanya jika Perintah suara aktif) |

### 4.3 Strength (2.3s)

Contoh: Squat 3 x 10, istirahat 60 detik; Plank 2 x 30 detik; Side plank 2 x 20 detik per sisi.

| Momen | Ucapan (Normal) | Layar |
|-------|-----------------|-------|
| Gerakan baru, set 1 | "Gerakan 1 dari 5: Squat. 3 set, 10 repetisi. Dada tegak, lutut searah jari kaki." | Animasi, nama, set, cue. **Tanpa angka hitung** |
| Set repetisi berjalan | Diam. App tidak menghitung repetisi (tidak ada sensor yang andal tanpa kamera). Mikrofon terbuka untuk "selesai" | Tombol "Selesai set" |
| Pengingat set repetisi | Sekali per set, saat 2 x estimasi set lewat: "Bilang 'selesai' kalau set sudah selesai." (hanya jika Perintah suara aktif) | Sama |
| "Selesai" / tombol | `ack` + "Istirahat 60 detik." | Layar istirahat dengan **angka hitung mundur** |
| Istirahat, separuh | Istirahat >= 60 detik: "30 detik." | Angka berjalan |
| Istirahat, 10 detik lagi | "Berikutnya: Squat, set 2 dari 3. Siap-siap." | "Berikutnya: ..." |
| Istirahat habis | `tick` x3 lalu "Mulai." | Kembali ke layar gerakan |
| Set berwaktu mulai (plank) | "Plank. Set 1 dari 2. 30 detik." `tick` x3 "Mulai." | Tanpa angka hitung |
| Set berwaktu, separuh | Set >= 20 detik: "15 detik lagi." | Sama |
| Set berwaktu, akhir | "10 detik." lalu `tick` x3, "Selesai. Istirahat 45 detik." | Ke layar istirahat |
| Per sisi berwaktu (side plank) | Di tengah: `cue` + "Ganti sisi." (hari ini tidak ada penanda ganti sisi sama sekali: `timedS` = 2 x durasi) | Sama |
| Per sisi repetisi | Di awal: "10 repetisi per sisi." Tidak ada penanda tengah (app tidak tahu kapan ganti) | Sama |
| Gerakan terakhir selesai | "Latihan selesai. Kerja bagus." `done` | Ke 2.4 |

### 4.4 Mode verbal

| Mode | Isi |
|------|-----|
| Ringkas | Transisi, 3-2-1, jawaban perintah |
| Normal (default) | + target pace, peringatan 1 menit / 10 detik, "Berikutnya", cue teknik pertama per gerakan |
| Lengkap | + update berkala lari panjang, cue teknik di setiap set, 1 kalimat penyemangat di 2 menit terakhir segmen tempo/interval |

### 4.5 Bahasa dan suara

- Bahasa ucapan = locale aktif (F-22). Suara dipilih dari `Speech.getAvailableVoicesAsync()` yang cocok `id-ID` / `en-US`, kualitas tertinggi yang terpasang.
- Jika suara `id-ID` tidak ada (terjadi di sebagian browser desktop dan HP lama): Pelatih suara jatuh ke earcon saja, 4.1 menampilkan "Suara Bahasa Indonesia tidak terpasang di perangkat ini" + tautan pengaturan TTS (Android). Tidak berpindah diam-diam ke suara bahasa lain.
- Kecepatan bicara 1.0, bisa diubah 0.8 sampai 1.2 di 4.1 (opsional, keputusan K4).

## 5. Perintah suara (F-26)

### 5.1 Model mendengar

| Jendela mikrofon terbuka | Alasan |
|--------------------------|--------|
| Set repetisi strength, set drill (menunggu "Selesai/Lanjut") | Ini satu-satunya saat tangan pengguna sibuk dan app butuh input |
| Istirahat strength | "lewati", "berapa lagi", "tambah" |
| Timer `paused` | "lanjutkan", "akhiri" |
| Selama segmen lari | **Tidak** terbuka terus. Dibuka 8 detik setelah tombol headset ditekan (S-V2) atau setelah pengguna mengetuk ikon mikrofon. Alasan: napas, angin dan musik saat lari menaikkan aktivasi palsu, dan baterai |

- Indikator: ikon mikrofon kecil di bar atas timer (di sebelah tombol suara) berwarna aktif saat mendengar. iOS juga menampilkan titik oranye sistem.
- Satu sesi pengenal per jendela; dimulai ulang otomatis jika platform memutus sesi (batas durasi per sesi diuji di S-V3).
- Hanya hasil `final` yang dieksekusi; maks 3 alternatif transkrip dicocokkan.

### 5.2 Tata bahasa

Cocok jika ucapan (setelah huruf kecil + tanpa tanda baca) **sama persis** dengan salah satu frasa, atau frasa berdiri sendiri dalam ucapan <= 4 kata. Ucapan lebih panjang diabaikan (kemungkinan bicara dengan orang atau ikut bernyanyi).

| Maksud | ID | EN | Berlaku di state | Aksi |
|--------|----|----|------------------|------|
| Set selesai / lanjut | "selesai", "lanjut", "oke", "sudah" | "done", "next", "finished" | Set repetisi, drill | `next` |
| Lewati istirahat | "lewati", "mulai", "siap" | "skip", "start", "ready" | Istirahat | `next` |
| Tambah istirahat 30 detik | "tambah", "tambah waktu" | "more time", "add time" | Istirahat | Baru, perlu K5 |
| Jeda | "jeda", "tunggu", "pause" | "pause", "wait" | running | `pause` |
| Lanjutkan | "lanjut", "lanjutkan", "mulai lagi" | "resume", "continue" | paused | `resume` |
| Berapa lagi | "berapa lagi", "sisa", "waktu" | "time left", "how long" | Semua | Ucapkan sisa segmen + total |
| Ulangi | "ulangi", "apa", "lagi" | "repeat", "say again" | Semua | Ulangi ucapan terakhir prioritas 1/2 |
| Lewati gerakan | "lewati gerakan" | "skip exercise" | Strength set | `skipGroup` |
| Lewati drill | "lewati drill" | "skip drill" | Drill | `skipGroup` |
| Suara mati / nyala | "diam", "suara mati" / "suara nyala" | "mute" / "unmute" | Semua | `toggleMute` (mikrofon tetap) |
| Akhiri | "akhiri latihan", lalu "ya" dalam 6 detik | "end workout", lalu "yes" | running, paused | Dialog Akhiri yang sama dengan tombol; "ya" = konfirmasi, diam/"batal" = batal |

- Kata yang sama berarti beda menurut state ("lanjut" = `next` saat set, `resume` saat jeda). Tidak ada perintah yang aktif di state yang tidak relevan.
- Semua frasa dimasukkan ke `contextualStrings` (iOS) / bias bahasa (Android) agar pengenal condong ke kosakata ini.
- Jeda antar perintah 1,5 detik (debounce) supaya satu ucapan tidak dieksekusi dua kali.
- Frasa tidak dikenali: diam. Jika 2 kali gagal dalam 10 detik: sekali per sesi "Coba: selesai, jeda, atau ulangi."

### 5.3 Tombol headset (spike S-V2)

Tombol play/pause di headset (media remote) adalah jalur tanpa mikrofon yang paling andal: 1 tekan = aksi utama di layar (Selesai set / Lewati istirahat / Lanjut), 2 tekan = Jeda/Lanjutkan. Kelayakannya dengan `expo-audio` (kontrol layar kunci / remote command) belum diketahui; jika butuh library tambahan, diusulkan terpisah.

## 6. Hitung mundur strength hanya saat istirahat (sudah diterapkan)

| Layar 2.3s | Sebelum | Sesudah |
|------------|---------|---------|
| Set repetisi | Tanpa angka | Tanpa angka (tetap) |
| Set berwaktu (plank) | Angka `stat` hitung mundur | **Tanpa angka.** Teks "Set ini berjalan otomatis. Bunyi dan getar menandai akhir set." Saat dijeda: label "DIJEDA" |
| Istirahat | Angka `timer` hitung mundur + "Berikutnya" | Sama (satu-satunya angka hitung di strength) |

Alasan: angka di layar mendorong pengguna menatap HP selama set; dengan desain suara (4.3), waktu set disampaikan lewat "15 detik lagi", "10 detik", 3-2-1 dan "Ganti sisi". Istirahat tetap menampilkan angka karena itu saat pengguna wajar melihat layar. State machine tidak berubah: set berwaktu tetap maju otomatis, notifikasi layar kunci tetap.

Sampai Pelatih suara dibangun, set berwaktu hanya ditandai bunyi + getar di akhir (perilaku F-05 yang ada). Ini kompromi sementara yang perlu diterima pemilik (K1).

## 7. Layar terkunci dan latar belakang

Ini bagian tersulit dari "tanpa melihat layar", dan belum terbukti di device (sama dengan S3 di `spikes.md`).

| Platform | Masalah | Rencana |
|----------|---------|---------|
| iOS | JS berhenti saat app di latar belakang; TTS terjadwal tidak jalan. Mode latar `audio` hanya menjaga app hidup selama benar-benar memutar audio | S-V1: uji `UIBackgroundModes: audio` + sesi audio aktif selama timer `running`. Jika tidak andal: tetap notifikasi lokal bersuara (yang ada) dengan teks ucapan yang sama, plus anjuran "biarkan layar menyala" (keep-awake + Kunci layar yang sudah ada) |
| Android | Proses bisa dihentikan di latar belakang | S-V1: uji dengan audio aktif. Foreground service butuh library/plugin baru, diusulkan terpisah bila perlu |
| Web | Tab tidak aktif menunda timer | Seperti sekarang (TRD 5): hanya saat tab aktif + Wake Lock |

Mode "layar menyala di saku": keep-awake sudah aktif; Kunci layar (gembok) mencegah sentuhan saku. Perintah suara dan tombol headset tetap bekerja saat terkunci sentuh.

## 8. Pengaturan, izin, data

### 8.1 Layar 4.1 (bagian Latihan)

| Baris | Nilai | Default |
|-------|-------|---------|
| Pelatih suara | Sakelar | Nyala |
| Detail suara | Ringkas / Normal / Lengkap | Normal |
| Perintah suara | Sakelar + 1 kalimat: "Mikrofon hanya dipakai selama timer berjalan dan diproses di HP ini." | Mati |

Tidak ada layar baru. Pertama kali Perintah suara dinyalakan: 1 kalimat penjelasan lalu dialog izin mikrofon (iOS juga izin Speech Recognition), sesuai pola izin notifikasi (TRD 9 aturan 2). Ditolak: sakelar kembali mati + "Buka pengaturan". Perangkat tanpa pengenalan di perangkat untuk locale aktif (`supportsOnDeviceRecognition()` false atau locale tidak ada di `getSupportedLocales()`): sakelar nonaktif dengan keterangan.

Di timer 2.3/2.3s: ikon mikrofon kecil di bar atas (status mendengar, ketuk = buka jendela 8 detik).

### 8.2 Schema (migrasi v7, lokal)

| Kolom `profile` | Tipe | Isi |
|-----------------|------|-----|
| `voice_coach` | int default 1 | 0/1 |
| `voice_detail` | text default 'normal' | `brief` / `normal` / `full` |
| `voice_commands` | int default 0 | 0/1 |

Ikut file backup. Tidak ada tabel baru, tidak ada kolom di server.

## 9. Privasi

| Aturan | Implementasi | Test |
|--------|--------------|------|
| Audio tidak pernah keluar dari HP | `requiresOnDeviceRecognition: true`; jika tidak didukung, fitur mati (tidak ada fallback ke pengenal server) | Test privasi: intercept jaringan selama sesi dengan perintah aktif = 0 request |
| Tidak menyimpan audio atau transkrip | Transkrip hanya di memori sampai dicocokkan; tidak masuk SQLite, log, Sentry, PostHog | Lint/test: modul `listener.ts` tidak mengimpor logger/analytics |
| Analitik | Paling banyak hitungan anonim `voice_enabled` (ya/tidak) lewat sakelar data pemakaian yang ada; tanpa isi perintah | Ikut test PV-d |
| Web | Chrome `SpeechRecognition` secara default memproses di server Google, jadi Perintah suara **mati di web** sampai S-V4 membuktikan mode on-device browser bisa dipaksa. TTS web (`speechSynthesis`) boleh; suara lokal dipilih (`localService: true`) | S-V4 |
| Notifikasi | Teks cue layar kunci tetap tanpa data kesehatan (TRD 9 aturan 1) | Test yang ada |

## 10. Aksesibilitas

- Jika VoiceOver/TalkBack aktif: ucapan Pelatih suara dikirim lewat pengumuman aksesibilitas agar tidak bertabrakan dengan pembaca layar (diuji di S-V1).
- Semua informasi suara juga ada di layar (P7); pengguna tuli/HOH tidak kehilangan apa pun kecuali angka hitung set berwaktu (bagian 6). Untuk mereka, getar ringan di 10 detik terakhir dan getar kuat di akhir set (usulan).

## 11. Perubahan spec bila disetujui

| Dokumen | Perubahan |
|---------|-----------|
| 01-PRD | F-25 Pelatih suara (Should), F-26 Perintah suara (Could), layar 2.3, 2.3b, 2.3s, 4.1 |
| 02-TRD | Library `expo-speech` (versi SDK 58 di npm: 58.0.3) dan `expo-speech-recognition` (komunitas, 58.0.1, butuh dev build). Bagian 5 (latar belakang), bagian 7 target latensi perintah <= 1 detik, bagian 8 katalog `voice.*` |
| 03-APP-FLOW | 3.2: perintah suara memetakan ke aksi yang sama; dialog Akhiri bisa dikonfirmasi "ya"; aturan "hitung mundur strength hanya saat istirahat" (sudah ditulis) |
| 04-UI-UX | 2.3s tanpa angka saat set (sudah ditulis); ikon mikrofon di bar timer; baris 4.1 |
| 05-SCHEMA | Migrasi v7, 3 kolom `profile` (8.2) |
| 06-PLAN | Milestone V1 sampai V3 (bagian 13) |
| 08-MONETIZATION | Usulan: Pelatih suara gratis (bagian dari timer F-05 yang gratis); Perintah suara gratis atau Premium = keputusan K3 |
| Wireframe | 4.1 (3 baris baru), 2.3/2.3s (ikon mikrofon) versi ID/EN, terang/gelap |

## 12. Keputusan pemilik

| # | Pertanyaan | Usulan |
|---|-----------|--------|
| K1 | Terima sementara set berwaktu tanpa angka, hanya bunyi di akhir, sampai V1 selesai? | Ya (sudah diterapkan, mudah dibalik) |
| K2 | Izinkan dev build iOS/Android untuk Perintah suara (CLAUDE.md: tanpa build native sebelum perintah eksplisit) | Ya setelah V1 direview di web |
| K3 | Perintah suara gratis atau Premium | Gratis di beta, dinilai ulang dengan data pemakaian |
| K4 | Pengaturan kecepatan bicara | Tidak di V1 |
| K5 | Perintah "tambah istirahat 30 detik" (perilaku baru di state machine) | Ya, kecil dan sering diminta |
| K6 | Suara rekaman manusia (lebih natural) vs TTS sistem | TTS sistem: gratis, ikut 2 bahasa, isi dinamis (nama gerakan, pace). Rekaman bisa dipertimbangkan untuk kata tetap ("Mulai", "Istirahat") nanti |

## 13. Tahapan

| Fase | Isi | Branch usulan | Butuh | Selesai jika |
|------|-----|---------------|-------|--------------|
| V0 (selesai) | Hitung mundur strength hanya saat istirahat | `claude/zen-ptolemy-4m4k9v` | - | E2E 2.3s lolos; review di preview web |
| S-V1 | Spike TTS: kualitas suara `id-ID`/`en-US` di iOS, Android, Chrome, Safari; latensi; ducking musik; layar terkunci | `spike/voice-tts` | HP fisik (Expo Go cukup) | Tabel hasil di `spikes.md` |
| V1 | Pelatih suara: `voiceScript`, `voiceDirector`, `speak*`, earcon `tick`, baris 4.1 (Pelatih suara + Detail), migrasi v7 | `feat/v1-voice-coach` | Persetujuan spec | Unit test skrip per mode (lari, interval, drill, strength repetisi/berwaktu/per sisi), test antrian (tidak tumpang tindih, ucapan basi dibuang), E2E web: ucapan tercatat lewat adaptor palsu |
| S-V2 | Spike tombol headset | `spike/voice-remote` | HP + headset | Keputusan library |
| S-V3 | Spike pengenal di perangkat: akurasi 10 perintah ID/EN, lari di luar, musik, mikrofon HP vs headset, batas durasi sesi | `spike/voice-commands` | Dev build (K2) | Angka T3/T4 terukur |
| V2 | Perintah suara di jendela strength/drill/istirahat/jeda + ikon mikrofon + izin | `feat/v2-voice-commands` | S-V3 lolos | Unit test tata bahasa per state; test privasi jaringan = 0; uji device 5 sesi |
| V3 | Jendela mikrofon saat lari (tombol headset / ketuk), "tambah istirahat", konfirmasi Akhiri dengan "ya" | `feat/v3-voice-run` | S-V2, K5 | Uji device |
| S-V4 | Perintah suara di web dengan pemrosesan lokal browser | - | - | Bukti tidak ada audio ke server; jika tidak terbukti, tetap mati di web |

## 14. Risiko

| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| JS tidak berjalan saat layar terkunci (iOS) | Pelatih suara diam saat HP dikunci | S-V1; fallback notifikasi bersuara + layar menyala dengan Kunci layar |
| Suara `id-ID` tidak terpasang | Ucapan tidak ada | Earcon saja + petunjuk pasang suara (4.5) |
| Pengenalan bahasa Indonesia di perangkat tidak tersedia di sebagian Android | Perintah suara tidak bisa dinyalakan | Sakelar nonaktif dengan keterangan; tombol tetap |
| Aktivasi palsu dari musik/orang lain | Set terlewat | Jendela sempit, ucapan <= 4 kata, debounce, Akhiri perlu "ya". Belum ada "urungkan" untuk Selesai set yang terpicu salah (pertanyaan terbuka) |
| Headset Bluetooth turun ke HFP | Musik pengguna jelek | Mikrofon HP sebagai default (3.2) |
| Library komunitas `expo-speech-recognition` berhenti dirawat | Upgrade SDK tersendat | Adaptor tipis `listener.ts`; fitur bisa dimatikan tanpa mengubah timer |
