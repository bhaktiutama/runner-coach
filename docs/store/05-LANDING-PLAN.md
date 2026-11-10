# 05. Rencana landing page RunCo

Status: v0.2 (2026-11-10). K1-K8 disetujui pemilik ("setuju jalankan semua"); draft halaman EN selesai di `marketing/landing/`, menunggu review (bagian 11) | Copy dan klaim: `02-LISTING-EN.md` | Grafis: `graphics/` | Video: `04-VIDEO-PLAN.md` | Skill: `design-taste-frontend` (tasteskill 2.5.1, `skills-lock.json`)

## Ringkasan

- Satu halaman statis di `marketing/landing/` (di luar build app, seperti `marketing/video/`), untuk di-host di `https://bhaktiutama.com/runco` (alamat Website di `03-PLAY-CONSOLE.md`). Aksi utama: "Get the app" ke tombol Google Play dan App Store (link sementara, satu konfigurasi).
- Konsep "Satu putaran": halaman dibaca sebagai satu putaran lintasan. Oval lintasan dari logo menjadi adegan 3D di hero, garis lajur oranye menyambung antar bagian, ritme 180 langkah/menit dari video dipakai untuk semua gerak.
- Draft EN selesai (L1-L5): `marketing/landing/index.html`, gate skill `GATE: PASS`. Belum tayang publik (lisensi ilustrasi B10, link App Store, video).

## 1. Tujuan dan batas

| Hal | Isi |
|---|---|
| Tujuan | Pengunjung paham dalam satu layar apa RunCo itu, lalu menekan tombol toko |
| Pengunjung | Pelari pemula sampai menengah yang menyiapkan 5K sampai maraton; datang dari listing toko (Marketing URL), media sosial dan video |
| Jenis halaman (skill) | page type `software`, site-kind `software` (app) |
| Aksi utama | `Get the app` (sama persis di nav, hero, penutup, bar HP) menuju bagian `#get` |
| Di luar cakupan | Blog, halaman harga, formulir, akun, analitik, perubahan apa pun di `apps/app` |
| Privasi | Tanpa cookie, tanpa analitik, font dan skrip di-host sendiri (tidak ada permintaan ke pihak ketiga). Sejalan dengan pesan "data tetap di HP" |

## 2. Aset yang dipakai

Semua dari repo. Ukuran dari file (dicek 2026-11-09).

| Aset | Sumber | Ukuran | Dipakai di | Catatan |
|---|---|---|---|---|
| Layar app (8 frame) | `docs/store/graphics/play/play-01..08.png`, `ios/ios-01..08.png` | 1080 x 1920, 1320 x 2868 | Sumber urutan cerita dan headline | Frame toko sudah berisi headline; landing butuh layar mentah, jadi di-capture ulang (L1) dengan `graphics/_build/cap3.cjs` + `cap4.cjs`, terang dan gelap |
| Feature graphic | `docs/store/graphics/feature-graphic.png` | 1024 x 500 | Dasar gambar bagikan (`share.jpg`, og:image) | Dibuat ulang 1200 x 630 dengan `_build/fg.cjs` |
| Foto hero (13 ilustrasi) | `docs/design-system/assets/imagery/*.webp` | 482 x 506 sampai 867 x 887 | Bingkai kecil, layar di dalam HP, momen paralaks | Resolusi rendah: aman sampai lebar sekitar 433 px CSS di layar 2x (866 / 2). Lisensi belum diverifikasi (B10) |
| Logo, wordmark, ikon app | `docs/design-system/assets/logo/`, `app-icon/` | SVG | Nav, footer, favicon, bentuk lintasan 3D | Oval logo = jalur lintasan di hero |
| Ikon spot (55) | `docs/design-system/assets/spot-icons/` | SVG/PNG | Kartu fitur (ikon asli app, berwarna) | Bukan ikon gambar baru |
| Frame gerakan strength | `apps/app/assets/exercises/*.webp` (237 file) | per gerakan | Loop squat di bagian strength | Lisensi gambar AI belum dikonfirmasi (STATUS no. 7) |
| Gaya video | `marketing/video/src/kit.tsx`, `scenes.tsx` | kode | Ritme 180 langkah/menit (1 beat = 333 ms), garis lajur bergerak, kata kunci oranye, `TrackRing` | Gaya dipakai ulang; komponen Remotion tidak disalin ke landing |
| Video promo V1 (16:9, 30 dtk) | hasil `marketing/video` (`out/`, tidak ada di git) | 1920 x 1080 | Slot video | Butuh render ulang atau URL YouTube dari pemilik (K5) |
| Token | `docs/design-system/tokens.json` | - | Warna, font, radius | Bricolage Grotesque 800 + Plus Jakarta Sans 600/800 (OFL), stone `#F5F4F2`, oranye `#F26B38`, charcoal `#242C32` |

## 3. Konsep: "Satu putaran"

| Elemen | Asal | Wujud di halaman |
|---|---|---|
| Oval lintasan | Logo mark (`logo-mark.svg`) | Lintasan 3D di hero; titik pelari mengitari oval |
| Garis lajur oranye | Motif penghubung screenshot toko (`02-LISTING-EN.md` bagian 4) | Satu garis yang menyambung dari bagian ke bagian, seperti panorama screenshot |
| Ritme pelari | Video (`BEAT = 10 frame`, 180 langkah/menit) | Tempo denyut, loop kartu dan jeda antar kata mengikuti kelipatan 333 ms |
| Kata kunci oranye | Headline toko dan video | Satu kata oranye per judul, sama dengan screenshot |
| Layar app sebagai bintang | Arah visual listing | Setiap bagian menampilkan layar app asli, bukan ilustrasi fitur |

Yang membuatnya tidak generik: tidak ada grid tiga kartu ikon, tidak ada gradien ungu, tidak ada foto stok; semua gambar adalah layar, ilustrasi dan bentuk milik RunCo sendiri.

## 4. Struktur halaman (satu bagian per layar, 1440 x 900)

Urutan mengikuti plan Software di skill (nav, hero, produk besar, 2-3 bagian fitur dengan tata letak berbeda, bagian tenang, penutup). Judul di bawah adalah copy kerja dari `02-LISTING-EN.md`; copy final ditulis dan di-lint di L2.

| # | id | Satu ide | Gambar | Jenis visual | Layar | Gerak |
|---|---|---|---|---|---|---|
| 1 | `hero` | Pelatih lari di HP, 5K sampai maraton. Fakta keras: plan lari penuh gratis | Lintasan 3D + HP berisi layar Today | efek | 1 | Efek tunggal halaman (bagian 5) + masuk sekali saat load |
| 2 | `today` | Know exactly what to **run today** | Layar 2.1 Today besar + 2.2 "Why this workout?" di sebelahnya | objek (layar utuh) | 1 | Hover saja |
| 3 | `tour` | Plan di sekitar **race day**, timer yang melatih, progres | Satu HP yang layarnya berganti: 1.8 preview plan, 2.3 timer (gelap), 3.3 progres | objek (layar utuh) | 2 | Momen 1: `pinned-chapters` (kandidat) |
| 4 | `strength` | Strength built for **runners** | Loop frame squat dari app + layar 2.3s | potongan UI | 1 | Loop kartu 2,5-4 dtk, ada tombol jeda |
| 5 | `evidence` | Every workout **explains itself** | Kartu diagram: aturan engine, tingkat bukti, sumber (isi dari 2.2 dan Panduan 4.7) | diagram | 1 | Diam atau denyut halus |
| 6 | `privacy` | Your data stays **on your phone** | Pernyataan besar di latar gelap + layar 4.5 | tipe | 1 | Momen 2: `word-highlight` (kandidat) |
| 7 | `film` | RunCo dalam 30 detik | Slot `<video>` V1 16:9 dengan poster | slot aset klien | 1 | Putar saat diklik |
| 8 | `faq` | Pertanyaan umum (gratis atau tidak, perlu jam tangan atau tidak, bahasa, data, bukan alat medis) | - (bagian tenang, satu-satunya tanpa gambar) | - | 1 | - |
| 9 | `get` + footer | Get the app | Nama RunCo besar + dua badge toko + ilustrasi kecil | tipe | 1 | Hover saja |

Catatan aturan skill yang dipenuhi tabel ini: layar utuh memimpin hero + 2 bagian saja (hero, today, tour); sisanya memakai jenis visual lain; dua bagian bermomen tidak bersebelahan; sepertiga akhir halaman tenang.

## 5. Gerak, 3D dan paralaks

Skill membatasi halaman tech pada: 1 efek, paling banyak 2 momen, paling banyak 4 konteks WebGL. Momen tidak dipilih menurut selera tetapi "dibagi" oleh skrip skill (`moments.mjs pick`); kolom Gerak di atas adalah kandidat yang cocok dengan aset.

| Beat | Bagian | Isi | Sumber | Cadangan |
|---|---|---|---|---|
| Efek (3D) | `hero` | "Lintas 3D": oval logo dijadikan lintasan 6 lajur di WebGL2, dilihat dari sudut rendah; titik pelari mengitari lintasan dengan denyut 180 langkah/menit dan jejak cahaya; HP berisi layar Today berdiri di tengah lapangan; kamera bergeser sedikit mengikuti pointer (kedalaman berlapis = paralaks) | Kode khusus (diminta brief), bukan dari kit | Gambar diam hasil render adegan yang sama untuk: reduced motion, tanpa WebGL, dan HP bila uji performa gagal |
| Momen 1 (scroll) | `tour` | Bagian menahan 2 layar scroll; tiga langkah terbuka satu per satu dan layar HP berganti | Kit: `pinned-chapters` | Di HP: tidak ditahan, tiga langkah bertumpuk |
| Momen 2 (scroll) | `privacy` | Pernyataan menyala kata demi kata saat melewati tengah layar | Kit: `word-highlight` | Reduced motion: teks penuh |
| Alternatif paralaks | `get` atau `privacy` | `window-parallax`: ilustrasi di dalam bingkai bergerak sedikit lebih lambat dari halaman | Kit | Butuh ilustrasi lebar resolusi tinggi (K4) |

Permintaan vs aturan skill (yang berbeda dan cara menyelesaikannya):

| Permintaan | Aturan skill | Keputusan di plan |
|---|---|---|
| Efek 3D | Efek dan objek dipasang dari kit; objek 3D kit (bola dunia, kartu, roda, lampu, cangkir) tidak ada yang cocok untuk lari | Satu adegan 3D khusus di hero karena brief memintanya; dihitung sebagai "1 efek". Jika cek skill menandainya, dicatat sebagai waiver dengan alasan, bukan disembunyikan |
| Paralaks | Dilarang pada teks; gerak karena scroll hanya di dalam momen | Paralaks hanya pada gambar (kedalaman kamera hero, `window-parallax`), tidak pada teks |
| "Teknologi terbaru" | Scroll asli browser, tanpa scroll-jacking; tanpa fade-in di tiap bagian; tanpa kartu miring saat hover | WebGL2, CSS scroll-driven animation bila didukung (dengan fallback), gambar AVIF/WebP, font WOFF2 subset, `prefers-reduced-motion` |

## 6. Teknologi

| Hal | Pilihan | Alasan |
|---|---|---|
| Stack | HTML + CSS + modul JS statis, tanpa framework dan tanpa build step | Bisa diunggah apa adanya ke `bhaktiutama.com/runco/` seperti halaman privasi; skill memeriksa file statis langsung |
| Sistem | `system.css`, `layout`, `motion`, `moments` dari kit skill, disalin ke `marketing/landing/assets/` | Aturan skill langkah 0 |
| Warna dan font | Token Lintas lewat `start.mjs brand` (warna klien sendiri), bukan palet acak | Konsisten dengan app, screenshot dan video |
| 3D | WebGL2. Library diputuskan di L3 setelah diukur `perf.mjs` (kandidat: Three.js di-vendor lokal, atau WebGL langsung tanpa library) | Belum ada angka ukuran yang terukur; tidak ditebak di sini |
| Gambar | AVIF + WebP, `srcset`, ukuran eksplisit | Cek `photo-weight`, layout shift |
| Dependensi app | Tidak ada. Tidak menyentuh `package.json` root maupun `apps/app` | Aturan CLAUDE.md: tanpa library baru di luar spec |
| Link toko | Satu objek `STORE_LINKS` di awal skrip. Play: `https://play.google.com/store/apps/details?id=com.bhaktiutama.runco` (id paket dari `03-PLAY-CONSOLE.md`, listing belum tayang). App Store: belum ada ID | Tombol menuju `#get`; badge memakai artwork resmi Google dan Apple |

## 7. Aturan isi

- Semua klaim mengikuti daftar cek `02-LISTING-EN.md` bagian 7. Tidak menyebut layar terkunci, GPS, Strava, jam tangan, jumlah pengguna, rating atau harga.
- Data di layar = data contoh; tidak ditampilkan sebagai hasil pengguna nyata. Tidak ada testimoni atau angka karangan.
- Klaim strength harus sesuai `08-MONETIZATION.md`: paywall aktif sejak 2026-11-07 (strength minggu 3+ = Premium), sementara pembelian Premium baru ada di Fase 3. FAQ menuliskannya apa adanya.
- Kalimat medis: "RunCo is not a medical device" di footer.
- Kontak: `privacy@bhaktiutama.com` hanya jika alamat sudah aktif (`03-PLAY-CONSOLE.md`, wajib sebelum submit no. 1).

## 8. Tahap kerja

| Tahap | Isi | Hasil | Verifikasi |
|---|---|---|---|
| L0 Persetujuan | Pemilik menjawab bagian 9 | Plan v0.2 | - |
| L1 Aset | Capture ulang layar mentah EN (terang + gelap) dari build web ber-flag E2E (hanya lokal), konversi AVIF/WebP, subset font, gambar bagikan 1200 x 630 | `marketing/landing/assets/img/`, `fonts/` | Tiap layar dibuka dan dicek mata; tidak ada build E2E yang di-deploy |
| L2 Copy | Tulis semua copy EN dulu (fact sheet, voice card), lint | Draft copy `.md` | `copy-lint.mjs` tanpa FAIL |
| L3 Spike 3D | Adegan Lintas 3D berdiri sendiri + gambar diam cadangan | `hero` saja | FPS dan berat diukur (`perf.mjs`), cek reduced motion dan tanpa WebGL |
| L4 Bangun | Deal hero, momen, nav, footer dengan skrip skill; bangun 9 bagian | `marketing/landing/index.html` | `consistency.mjs`, `layout/check.mjs` di 1440, 1024, 820, 768, 390 |
| L5 Gerbang | Screenshot semua lebar, perbaiki, `gate.mjs` (maks. 3 putaran) | Laporan gate | `GATE: PASS` atau daftar FAIL terbuka + waiver beralasan |
| L6 Preview | Preview untuk review pemilik (alias EAS Hosting terpisah dari `preview`, atau Artifact privat; diputuskan saat L6) | URL review | HTTP 200, cek di HP |
| L7 Rilis | Setelah review: update `02-LISTING-EN.md` bagian 6 (Marketing URL), `STATUS.md`; pemilik mengunggah ke `bhaktiutama.com/runco/` | Halaman publik | Link toko diganti saat listing tayang |

Versi Bahasa Indonesia (`/runco/id/`) dikerjakan setelah EN disetujui (K2).

## 9. Keputusan pemilik

| # | Pertanyaan | Usulan |
|---|---|---|
| K1 | Lokasi `marketing/landing/` (statis) dan host `bhaktiutama.com/runco/` | Ya |
| K2 | Bahasa | EN dulu (sama dengan listing dan screenshot), ID menyusul |
| K3 | Tingkat 3D: (A) hanya momen kit, tanpa WebGL khusus; (B) adegan Lintas 3D khusus di hero + 2 momen kit | B |
| K4 | Ilustrasi: (A) pakai yang ada dalam bingkai kecil; (B) buat ulang versi resolusi tinggi bergaya sama lewat EvoLink (berbayar, estimasi biaya ditunjukkan dulu) | A untuk draft; putuskan B sebelum publik |
| K5 | Video: URL YouTube V1, atau MP4 dirender ulang dan di-host bersama halaman; dengan atau tanpa musik | MP4 tanpa suara di slot, karena hak komersial musik AI belum dicek (`marketing/video/README.md`) |
| K6 | Skill di git: (A) commit folder skill (1.631 file, 40 MB); (B) hanya `skills-lock.json`, folder dipulihkan tiap sesi dengan `npx skills experimental_install` | B |
| K7 | Analitik di landing | Tidak ada |
| K8 | Badge toko sebelum app tayang: tampil dengan link sementara, atau diberi keterangan "coming soon" | Tampil, link Play diisi, App Store menunggu ID |

## 10. Batasan dan risiko

| # | Hal | Dampak | Status |
|---|---|---|---|
| R1 | Lisensi ilustrasi (13 gambar imagery, frame strength) belum diverifikasi (B10) | Tidak boleh tayang publik sebelum jelas | Menunggu pemilik |
| R2 | Ilustrasi resolusi rendah (maks. 887 px tinggi) | Tidak bisa jadi latar layar penuh; hero memakai 3D + layar app, bukan foto penuh | Diatasi di desain; K4 membuka opsi lain |
| R3 | Adegan 3D khusus berada di luar kit skill | Cek skill bisa menandai; perlu waiver dan uji performa di HP | Diputuskan di L3 |
| R4 | Video V1 dan layar mentah tidak ada di git | Harus dibuat ulang di L1 (butuh build web EN + seed) | Langkah sudah terdokumentasi di `graphics/README.md` |
| R5 | Aturan pemakaian badge App Store / Google Play sebelum app tayang belum dicek | Bisa perlu badge "pre-order/coming soon" | Dicek di L4 dari pedoman resmi |
| R6 | Preview lewat EAS Hosting untuk folder non-app belum pernah dicoba di repo ini | Jalur preview bisa berubah ke Artifact | Dicek di L6 |
| R7 | Copy ID untuk landing belum ada (listing ID juga belum) | Versi ID butuh review pemilik | Setelah EN |

## 11. Hasil draft (2026-11-10)

Yang berubah dari rencana bagian 4-6, dan alasannya:

| Rencana | Hasil | Alasan |
|---|---|---|
| 9 bagian: hero, today, tour, strength, evidence, privacy, film, faq, get | hero, plan, privacy, training (tab: timer, strength, progres, minggu), more (4 kartu), evidence, film, faq, penutup + footer | Pemeriksa skill: satu tata letak paling banyak 2x, split tidak bersebelahan, judul harus menyebut kategori/produk |
| 3D: Three.js atau WebGL langsung, diputuskan di L3 | WebGL2 langsung, tanpa library (`assets/hero/hero3d.js`, 19 KB) | Three.js 0.187.0 = 659 KB (`three.module.js`) untuk satu lintasan dan satu HP |
| Momen kandidat `pinned-chapters` + `word-highlight` | `word-highlight` (#privacy) + `line-carries-colour` (#evidence) | Dibagi oleh `moments.mjs pick`, bukan dipilih |
| Gambar bagikan 1200 x 630 | Belum dibuat (`og:image` menunjuk `share.jpg`) | Sisa pekerjaan |
| Video V1 di slot | Poster sementara = feature graphic, tanpa file video | MP4 tidak ada di git (K5) |

Deal skill: hero `product` (panggung = adegan 3D), nav `nav-cards`, tombol `tonal`, penutup `close-type`, footer `footer-columns`, ritme `surface-pairs`, warna dari token Lintas (`start.mjs brand`), font `bricolage` (Bricolage Grotesque + Figtree, di-host sendiri).

Pemeriksaan (2026-11-10):

| Cek | Hasil |
|---|---|
| `gate.mjs` (checker 1440 + 390, jalan 320, copy-lint) | PASS, 2 waiver: `hero-lines` (h1 asli 2 baris di 390; cek mengisi 40 karakter), `section-gaps` #more/#evidence (diukur ke panel momen kit) |
| `perf.mjs` | 0 FAIL, 3 WARN (gambar lazy/eager di hero) |
| `layout/check.mjs` 1440, 1024, 820, 768, 390 | 1 temuan `sparse` #film di 768 (konten 50% layar) |
| Browser | 3D hidup dan beranimasi, tombol jeda, tab, link toko, 0 error konsol |
| Tidak dicek | HP fisik, Safari/iOS, WebGL di GPU asli (cek memakai SwiftShader) |

Perubahan kecil di luar kit: cincin fokus memakai warna tinta, bukan oranye (oranye 2,75:1 di latar, butuh 3:1).

Sisa sebelum publik: lisensi ilustrasi (B10, ilustrasi tampil di layar app), ID App Store, `share.jpg`, file video, alamat `privacy@bhaktiutama.com` aktif, review copy EN (B8), versi ID.
