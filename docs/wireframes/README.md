# Wireframes: Run Coach

Status: salinan dari artifact "Runner Coach Wireframes" (https://claude.ai/artifact/69xQ9s7SxafNVUKL2vWxka), diekspor 2026-10-28.

- 21 layar HP (lebar 390) dalam 4 journey. Nomor layar dipakai di semua dokumen `docs/specs/`.
- `overview.png` = semua layar dalam satu gambar. `png/` = satu file per layar (resolusi 2x).
- Jika artifact diubah, ekspor ulang (bagian "Ekspor ulang") supaya repo tetap sama dengan artifact.

![Semua layar](overview.png)

## Daftar layar

| No | Layar | File | Fitur (PRD) |
|----|-------|------|-------------|
| 1.1 | Selamat datang | [png](png/1-1-selamat-datang.png) | F-01 |
| 1.2 | Pilih target | [png](png/1-2-pilih-target.png) | F-02 |
| 1.3 | Tanggal race | [png](png/1-3-tanggal-race.png) | F-02 |
| 1.4 | Kemampuan saat ini | [png](png/1-4-kemampuan.png) | F-02 |
| 1.5 | Volume mingguan | [png](png/1-5-volume-mingguan.png) | F-02 |
| 1.6 | Hari latihan + pengingat | [png](png/1-6-hari-latihan.png) | F-02, F-12 |
| 1.7 | Screening kesehatan | [png](png/1-7-screening-kesehatan.png) | F-02 |
| 1.8 | Preview plan + simpan akun | [png](png/1-8-preview-plan.png) | F-01, F-03 |
| 2.1 | Hari ini | [png](png/2-1-hari-ini.png) | F-04 |
| 2.2 | Detail latihan | [png](png/2-2-detail-latihan.png) | F-04 |
| 2.3 | Timer berjalan | [png](png/2-3-timer.png) | F-05 |
| 2.4 | Selesai + RPE | [png](png/2-4-selesai-rpe.png) | F-06 |
| 2.5 | Ringkasan minggu + adaptasi | [png](png/2-5-ringkasan-minggu.png) | F-11 |
| 3.1 | Kalender plan | [png](png/3-1-kalender-plan.png) | F-08 |
| 3.2 | Pindahkan latihan | [png](png/3-2-pindah-latihan.png) | F-08 |
| 3.3 | Progres | [png](png/3-3-progres.png) | F-07 |
| 3.4 | Detail aktivitas | [png](png/3-4-detail-aktivitas.png) | F-14 |
| 4.1 | Profil | [png](png/4-1-profil.png) | F-16, F-10, F-13 |
| 4.2 | Integrasi data | [png](png/4-2-integrasi.png) | Fase 2 |
| 4.3 | Jeda plan | [png](png/4-3-jeda-plan.png) | F-09 |
| 4.4 | Premium | [png](png/4-4-premium.png) | Fase 3 |

Belum ada wireframe (keputusan O1 di `docs/specs/README.md`): log manual, konfirmasi hapus akun, form login email.

## Catatan membaca gambar

- Setiap layar digambar di **state awalnya** (contoh: timer berjalan, RPE 6 terpilih, alasan jeda "Cedera").
- Di artifact, setiap layar dipotong di tinggi 844 px. Di sini layar dibiarkan setinggi isinya, supaya tombol bawah tidak hilang. Layar yang lebih tinggi dari 844 px (1.3, 1.4, 1.7, 2.2, 2.3, 4.2, 4.3) berarti bisa di-scroll di app.
- Angka di layar (pace, jarak, tanggal) adalah contoh tampilan, bukan data atau hasil engine.
- Wireframe ini dibuat sebelum design system. Pakai untuk **tata letak** saja; warna, tipe dan bentuk dari `docs/design-system/`.

## Isi folder

| Path | Isi |
|------|-----|
| `overview.png` | Semua layar per journey |
| `png/` | 1 PNG per layar, lebar 780 px (2x) |
| `source/` | Sumber asli tiap layar (`.dc.html`) + `canvas.json` (susunan canvas + catatan journey). Butuh runtime artifact untuk tampil interaktif |
| `render.js` | Script ekspor `source/` ke PNG |

## Ekspor ulang

Butuh Node.js, Playwright + Chromium, dan font Inter terpasang. Script tidak memuat apa pun dari internet.

```bash
node docs/wireframes/render.js docs/wireframes/source docs/wireframes/png \
  Main.dc.html=1-1-selamat-datang.png OB2-Target.dc.html=1-2-pilih-target.png
# tambahkan pasangan <file sumber>=<nama png> untuk layar lain, sesuai tabel di atas
```

`render.js` meniru sebagian kecil runtime artifact: `{{nilai}}`, `<sc-for>`, `<sc-if>`, dan state awal. Jika wireframe mulai memakai fitur lain (misalnya `<dc-import>`), script perlu ditambah.
