# Animation Pipeline: MediaPipe + Rive

Status: Draft v0.1 (2026-10-27)

## Ringkasan

Konteks: gerakan yang dianimasikan adalah drill, strength, core dan mobility dari `docs/PLANNING.md` bagian 4.7.

- **Gerakan** diambil dari video pelatih sungguhan dengan MediaPipe Pose Landmarker, lalu dikonversi otomatis menjadi data sudut sendi (format yang sudah dipakai `docs/prototypes/exercise-animations.html`).
- **Tampilan karakter** dipindah ke Rive (rig tulang + mesh), sehingga rambut, baju dan badan bisa jauh lebih detail dan tetap ringan di app.
- Semua langkah bisa dijalankan dari Claude Code. Yang dibutuhkan dari Anda: **video gerakan**, **install 1 MCP Rive**, dan (opsional) **aset ilustrasi karakter**.

---

## 1. Arsitektur

```
 Video pelatih (mp4)
        |
        v
 [A1] MediaPipe Pose Landmarker (Python, headless)
        |  33 landmark/frame (2D + 3D world)
        v
 [A2] Konversi ke sudut sendi bidang samping
        |  hip, knee, ankle, shoulder, elbow, torso, head
        v
 [A3] Pembersihan: smoothing, deteksi 1 repetisi, loop mulus, reduksi keyframe
        |
        v
 exercises/<id>.json  ----->  [A4] Preview SVG (renderer yang sudah ada)
        |
        v
 [B2] Rive MCP: bangun animasi per gerakan di atas rig karakter
        |
        v
 run-coach.riv  ----->  App (rive-react-native / @rive-app/react-canvas)
```

## 2. Status lingkungan (dicek 2026-10-27 di container cloud ini)

| Komponen | Status | Catatan |
|----------|--------|---------|
| Python | 3.13 tersedia | |
| Node.js | 22 tersedia | Untuk menjalankan MCP Rive via `npx` |
| `mediapipe` (PyPI) | Bisa diunduh (v1.1.1) | Belum diinstall |
| Model `pose_landmarker_heavy.task` | URL Google Storage bisa diakses | |
| `rive-mcp-server` (npm) | v0.7.0 tersedia | Pihak ketiga, belum direview |
| `rivemcp` (npm, "Polymation") | v1.19.0 tersedia | Pihak ketiga, belum direview |
| Rive MCP resmi | Tidak bisa di container ini | Butuh aplikasi desktop Rive (Early Access) yang berjalan di komputer Anda |

---

## 3. Bagian A: MediaPipe (gerakan dari video)

### A0. Input video (dari Anda / pelatih)

| Syarat | Alasan |
|--------|--------|
| Kamera tampak samping, sejajar pinggul, tidak bergerak | Renderer kita 2D tampak samping; sudut kamera miring merusak sudut sendi |
| Seluruh badan masuk frame, termasuk kaki | Landmark kaki/tumit wajib untuk penapakan lantai |
| 1080p, 30-60 fps, cahaya cukup, latar polos | Akurasi deteksi |
| Baju pas badan, kontras dengan latar | Baju longgar menggeser titik sendi |
| 3-5 repetisi per gerakan, tempo sesuai instruksi | Dipilih 1 repetisi terbaik |
| Nama file = id gerakan (`squat.mp4`, `askip.mp4`, ...) | Otomasi |

Opsional: rekam juga tampak depan untuk gerakan yang butuh (squat, side plank).

### A1. Ekstraksi landmark

- Script: `tools/pose/extract.py`
- MediaPipe Pose Landmarker, model `heavy`, running mode `VIDEO`.
- Output per frame: 33 landmark (x, y, z, visibility) + world landmark (meter).
- Output: `tools/pose/out/<id>.landmarks.json` + video overlay skeleton untuk QA (`<id>.overlay.mp4`).

### A2. Konversi ke sudut sendi

- Proyeksi ke bidang samping (x-y), arah hadap ditentukan otomatis dari posisi hidung vs telinga.
- Sisi dekat/jauh kamera ditentukan dari nilai `visibility` dan `z`.
- Sudut dihitung sesuai konvensi renderer: 0 = lurus ke bawah, 90 = ke depan, sudut absolut per segmen (`t, h, nt, ns, nf, ft, fs, ff, nu, nl, fu, fl`).
- Panjang tulang dinormalisasi ke proporsi figur (posisi sendi tidak dipakai mentah, hanya sudutnya), sehingga figur pria/wanita bisa memakai data yang sama.

### A3. Pembersihan otomatis

| Langkah | Metode |
|---------|--------|
| Buang jitter | One Euro filter per kanal sudut |
| Isi frame hilang (visibility rendah) | Interpolasi |
| Pilih 1 repetisi | Autokorelasi sudut lutut/pinggul, ambil siklus paling stabil |
| Loop mulus | Samakan pose awal dan akhir (blend 4-6 frame) |
| Reduksi keyframe | Ramer-Douglas-Peucker per kanal, target 10-30 keyframe |
| Titik tumpu | Deteksi kaki yang menapak (kecepatan tumit ~0) untuk mencegah kaki "meluncur" |

Output: `exercises/<id>.json` (format sama dengan array `k` di prototipe).

### A4. QA

- Render otomatis berdampingan: video asli vs figur SVG (Playwright, screenshot per 0.25 detik).
- Laporan per gerakan: jumlah frame terdeteksi, rata-rata visibility, deviasi sudut sebelum/sesudah smoothing.
- Review akhir oleh pelatih tetap wajib (ini memeriksa teknik, bukan hanya data).

---

## 4. Bagian B: Rive (tampilan karakter)

### B0. Pilihan MCP

| Opsi | Kelebihan | Kekurangan | Rekomendasi |
|------|-----------|------------|-------------|
| `rive-mcp-server` | Tanpa editor; bangun `.riv` dari spesifikasi JSON, divalidasi dengan runtime resmi, ada render preview | Pihak ketiga, fitur rig/mesh perlu dicek | **Coba pertama** (cocok untuk otomatis di cloud) |
| `rivemcp` (Polymation) | Lebih banyak tool (rig karakter, konversi Lottie/Figma/SVG ke Rive) | Pihak ketiga, cakupan besar = perlu review lebih teliti | Alternatif jika opsi 1 kurang |
| Rive MCP resmi | Langsung di editor Rive, dukungan resmi | Butuh aplikasi desktop Rive di komputer Anda, tidak jalan di cloud | Untuk finishing manual di editor |

Ketiganya belum saya uji. Klaim fitur di atas berasal dari deskripsi paket/listing, bukan verifikasi langsung.

### B1. Karakter & rig

| Komponen | Isi |
|----------|-----|
| Tulang | pelvis, spine (2-3 ruas), neck, head, thigh/shin/foot x2, upper arm/forearm/hand x2, ponytail (3-4 ruas) |
| Mesh | Paha, betis, torso, lengan dengan vertex weight agar otot melentur saat sendi menekuk |
| Variasi | Data binding / view model: `gender` (pria/wanita), `skinTone`, `topColor`, `bottomColor` |
| Rambut | Pria: bentuk statis + sedikit gerak. Wanita: kuncir ber-tulang dengan gerak tertunda (follow-through) |

**Aset ilustrasi**: Claude bisa membuat bentuk vektor, tetapi untuk kualitas "seperti foto/ilustrasi profesional" (terutama rambut), rekomendasi saya adalah ilustrator membuat potongan karakter per bagian tubuh (SVG/Figma), lalu Claude merakit rig dan animasinya lewat MCP.

### B2. Animasi per gerakan

- Script mengubah `exercises/<id>.json` menjadi rotasi tulang per keyframe dan memanggil MCP untuk membuat 1 timeline per gerakan.
- State machine: input `exercise` (enum), `playing` (bool), `speed` (number).
- Export `run-coach.riv`, preview otomatis dirender ke gambar untuk dicek.

### B3. Integrasi app

- Expo/React Native: `rive-react-native`; Web: `@rive-app/react-canvas`.
- Timer mode gerakan memanggil state machine (`exercise = squat`, `playing = true`).

---

## 5. Urutan kerja & yang dibutuhkan dari Anda

| # | Langkah | Dikerjakan oleh | Butuh dari Anda |
|---|---------|-----------------|-----------------|
| 1 | Setup `tools/pose/` (install mediapipe, unduh model, script ekstraksi) | Claude | Tidak ada |
| 2 | Uji pipeline A dengan 1 video contoh | Claude | 1 video (misalnya squat), atau izin memakai video contoh berlisensi bebas |
| 3 | Konversi sudut + pembersihan + QA side-by-side | Claude | Review hasil |
| 4 | Rekam semua gerakan | Anda / pelatih | 11 video sesuai syarat A0 |
| 5 | Install MCP Rive | Anda | Lihat bagian 6 |
| 6 | Uji MCP: buat `.riv` sederhana (1 artboard, 1 tulang berputar) | Claude | Tidak ada |
| 7 | Rig karakter pria & wanita | Claude (+ ilustrator untuk aset) | Keputusan: aset dari ilustrator atau dibuat Claude |
| 8 | Generate animasi semua gerakan ke `.riv` | Claude | Review |
| 9 | Finishing di editor Rive (opsional) | Anda / desainer | Akun Rive |

## 6. Install MCP (bantuan dari Anda)

Untuk sesi cloud ini, MCP bisa didaftarkan per-proyek lewat file `.mcp.json` di root repo (saya bisa membuatkannya jika Anda setuju), atau lewat CLI di mesin lokal:

```bash
# Opsi 1 (rekomendasi untuk dicoba pertama)
claude mcp add rive -- npx -y rive-mcp-server@0.7.0

# Opsi 2
claude mcp add rivemcp -- npx -y rivemcp@1.19.0
```

Perintah di atas mengikuti pola standar `claude mcp add`; cek README masing-masing paket untuk argumen terbaru. Versi sengaja dikunci (pinned) agar update paket tidak berubah diam-diam. Setelah MCP ditambahkan, sesi Claude Code perlu dimulai ulang agar tool-nya muncul.

**Keamanan**: kedua paket adalah buatan pihak ketiga dan akan menjalankan kode di lingkungan Anda. Sebelum install, sebaiknya saya review source code-nya (npm tarball) untuk akses jaringan/file yang tidak wajar.

Skill tambahan tidak wajib. Setelah pipeline stabil, langkah A1-A4 bisa dibungkus menjadi skill proyek (`.claude/skills/pose-to-animation/`) supaya cukup menjalankan satu perintah per video baru.

## 7. Risiko

| Risiko | Mitigasi |
|--------|----------|
| Akurasi MediaPipe turun pada pose berbaring (bridge, dead bug, plank) atau anggota tubuh tertutup | Rekam dari sudut sedikit lebih tinggi; isi kanal yang hilang dari pose kunci manual |
| MCP Rive pihak ketiga belum mendukung mesh/weight yang dibutuhkan | Fallback: rig dibuat di editor Rive secara manual, animasi tetap digenerate |
| Hak cipta video/gambar referensi | Hanya pakai video milik sendiri/pelatih dengan izin, atau yang berlisensi bebas |
| Data pose orang di video adalah data pribadi | Simpan hanya sudut sendi hasil olahan; video mentah tidak di-commit ke repo |
