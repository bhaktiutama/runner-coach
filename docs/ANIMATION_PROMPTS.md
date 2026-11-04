# Prompt ilustrasi gerakan strength (lembar 4x4, pria dan wanita)

Status: Draft v0.2 (2026-11-04). Melengkapi `docs/ANIMATION_PIPELINE.md` dan `apps/app/assets/exercises/README.md`. Dibuat oleh `python3 -I scripts/gen-animation-prompts.py docs/ANIMATION_PROMPTS.md` (ubah data gerakan di skrip itu, jangan edit file ini langsung). Prompt video Seedance dan prompt foto 3x3 versi sebelumnya dihapus (masih ada di riwayat git, commit `a8c35f6`).

## Ringkasan

- Tiap gerakan: **satu lembar ilustrasi 4x4 (16 keyframe)** per model, dipotong dengan `scripts/slice-keyframes.py` menjadi 16 WebP transparan, lalu diputar bertahap di app.
- Dua model: **pria** dan **wanita**, pakaian sama, supaya pengguna nanti bisa memilih. 15 gerakan x 2 = 30 lembar.
- Panel 1 = posisi awal, panel 16 = posisi akhir (puncak gerakan). Gerakan balik **tidak digambar**: app memutar 1 ke 16 lalu kembali 16 ke 1 (bolak-balik), jadi satu repetisi = 30 langkah dari 16 gambar.
- Sudut tiap panel ditulis sebagai angka yang naik rata dari panel 1 ke 16, karena kata seperti "bottom" terbukti membuat model jongkok terlalu dalam.

## Alur per gerakan

| # | Langkah | Yang dilakukan |
|---|---|---|
| 0 | Card karakter (sekali per model) | Generate card pria dan wanita (bagian "Card karakter"), simpan yang terbaik. Lampirkan sebagai gambar referensi di setiap prompt gerakan agar wajah dan baju konsisten |
| 1 | Generate lembar | Tempel prompt pria (atau wanita) + prompt negatif gerakan itu. Resolusi setinggi mungkin (minimal 2048 x 2048, supaya tiap panel sekitar 512 px) |
| 2 | Periksa lembar | 16 panel berurutan, orang sama, ukuran sama, kaki atau titik tumpu tidak bergeser, panel 16 sesuai "Periksa" |
| 3 | Jadikan transparan | Latar harus transparan sebelum dipotong. Jika hasil berlatar hijau, hapus latar dulu (garis pemisah putih boleh tetap ada) |
| 4 | Potong | `python3 -I scripts/slice-keyframes.py lembar.png apps/app/assets/exercises <exercise_id>-m` (atau `-f`). Hasil: 16 file `<exercise_id>-m-1.webp` ... `-16.webp` |
| 5 | Kirim ke Claude | Untuk pemasangan di app (daftar frame, lama tiap frame, putar bolak-balik) |

## Aturan bersama

| Hal | Nilai |
|---|---|
| Gaya | Ilustrasi warna datar (cel-shading, outline gelap rapi, 2 sampai 3 tone per warna), sama dengan lembar squat yang sudah dipakai app |
| Pria | Asia, akhir 20-an, atletis ramping, rambut hitam pendek rapi |
| Wanita | Asia, akhir 20-an, atletis ramping, rambut hitam panjang dikuncir tinggi |
| Pakaian (keduanya) | Kaos atletik teal lengan pendek (tidak crop), celana atletik hitam 10 cm di atas lutut, smartwatch hitam, sepatu lari putih aksen oranye. Tanpa hijau |
| Latar | Transparan; jika tidak bisa, hijau chroma rata (#00B140). Tanpa garis lantai dan bayangan |
| Kamera | Ortografis, identik di 16 panel. Tampak samping menghadap kanan, kecuali side plank dan Copenhagen plank (tampak depan) |
| Properti | Hanya bila perlu (bangku, kotak, panel dinding): abu tua datar (#3A3A3C), tanpa logo |
| Sisi kerja | Anggota badan terdekat kamera (kanan). Sisi lain tidak dibuat terpisah (app menyebut "per sisi") |
| Nama file | `<exercise_id>-m-N.webp` (pria), `<exercise_id>-f-N.webp` (wanita), N = 1 sampai 16 |

## Daftar gerakan

| # | `exercise_id` | Nama di app | Tampak | Properti | Tahan di panel 16 (usulan) |
|---|---|---|---|---|---|
| 1 | `squat` | Squat | samping | - | 0,4 dtk |
| 2 | `split_squat` | Split squat | samping | - | 0,4 dtk |
| 3 | `bulgarian_split_squat` | Bulgarian split squat | samping | bangku 45 cm | 0,4 dtk |
| 4 | `glute_bridge` | Glute bridge | samping, lantai | - | 1,0 dtk |
| 5 | `single_leg_glute_bridge` | Glute bridge satu kaki | samping, lantai | - | 1,0 dtk |
| 6 | `single_leg_deadlift` | Single-leg deadlift | samping | - | 0,4 dtk |
| 7 | `reverse_lunge` | Reverse lunge | samping | - | 0,4 dtk |
| 8 | `step_up` | Step-up | samping | kotak 40 cm | 0,6 dtk |
| 9 | `calf_raise` | Calf raise | samping | - | 1,0 dtk |
| 10 | `single_leg_calf_raise` | Single-leg calf raise | samping | panel dinding (pegangan) | 1,0 dtk |
| 11 | `plank` | Plank | samping, lantai | - | 2,0 dtk |
| 12 | `side_plank` | Side plank | depan, lantai | - | 2,0 dtk |
| 13 | `dead_bug` | Dead bug | samping, lantai | - | 0,4 dtk |
| 14 | `bird_dog` | Bird dog | samping, lantai | - | 2,0 dtk |
| 15 | `copenhagen_plank` | Copenhagen plank | depan, lantai | bangku 45 cm x 100 cm | 2,0 dtk |

Urutan pengerjaan yang disarankan: squat dulu (pria, lalu wanita) untuk mengunci tampilan kedua karakter, lalu gerakan berdiri, lantai, dan terakhir yang memakai properti.

## Card karakter (langkah 0)

Satu kali per model. Hasilnya dilampirkan sebagai gambar referensi di prompt gerakan (kalimat "If a character reference image is attached..." sudah ada di setiap prompt). Lembar squat pria yang sudah ada di app juga bisa dipakai sebagai referensi pria.

### Card Pria

```text
Clean flat-color vector-style illustration (anime cel-shading, solid color fills, crisp uniform dark outlines, at most 2 to 3 tones per color, no gradients, no textures, no blur, no photorealism) character reference sheet of ONE man: an Asian man in his late 20s, lean athletic build, short neat black hair, clean-shaven, calm neutral face, wearing a fitted teal short-sleeve athletic t-shirt, black athletic shorts ending 10 cm above the knee, a black smartwatch on the wrist, and white running shoes with orange accents. No green anywhere on the character.

Layout: ONE square image (1:1) split into two equal tall panels side by side, separated by a thin straight white line. No text, no numbers, no labels, no arrows.
Left panel: full body from the front, standing relaxed, feet hip-width apart, arms hanging at the sides, looking straight ahead.
Right panel: the same man, full body, exact side profile facing the RIGHT edge of the panel (the camera sees his right side), standing relaxed and tall, arms hanging at the sides.

In both panels the whole body from head to shoes is visible, at the same scale, about 85 percent of the panel height, with clear margin. Face, hair, proportions, clothes and colors are identical in both panels. Orthographic camera at chest height. Background in every panel: transparent. If transparency is not possible, one perfectly flat solid chroma key green (#00B140). No floor line, no horizon, no scenery, no shadow on the ground.
```

Prompt negatif:

```text
photograph, photorealistic, 3D render, gradient, texture, blur, text, numbers, labels, arrows, watermark, logo, extra people, different face between panels, different clothes between panels, cropped head, cropped feet, green clothing, extra limbs, distorted hands, distorted feet, hat, glasses, jewelry
```

### Card Wanita

```text
Clean flat-color vector-style illustration (anime cel-shading, solid color fills, crisp uniform dark outlines, at most 2 to 3 tones per color, no gradients, no textures, no blur, no photorealism) character reference sheet of ONE woman: an Asian woman in her late 20s, lean athletic build, long black hair tied in a high ponytail, calm neutral face, wearing a fitted teal short-sleeve athletic t-shirt (not cropped), black athletic shorts ending 10 cm above the knee, a black smartwatch on the wrist, and white running shoes with orange accents. No green anywhere on the character.

Layout: ONE square image (1:1) split into two equal tall panels side by side, separated by a thin straight white line. No text, no numbers, no labels, no arrows.
Left panel: full body from the front, standing relaxed, feet hip-width apart, arms hanging at the sides, looking straight ahead.
Right panel: the same woman, full body, exact side profile facing the RIGHT edge of the panel (the camera sees her right side), standing relaxed and tall, arms hanging at the sides.

In both panels the whole body from head to shoes is visible, at the same scale, about 85 percent of the panel height, with clear margin. Face, hair, proportions, clothes and colors are identical in both panels. Orthographic camera at chest height. Background in every panel: transparent. If transparency is not possible, one perfectly flat solid chroma key green (#00B140). No floor line, no horizon, no scenery, no shadow on the ground.
```

Prompt negatif:

```text
photograph, photorealistic, 3D render, gradient, texture, blur, text, numbers, labels, arrows, watermark, logo, extra people, different face between panels, different clothes between panels, cropped head, cropped feet, green clothing, extra limbs, distorted hands, distorted feet, hat, glasses, jewelry
```

**Periksa card:** orang yang sama di dua panel, tampak samping benar-benar profil menghadap kanan, seluruh badan masuk, tanpa hijau di pakaian.

---

## 1. Squat (`squat`)

**Cue di app:** Kaki selebar bahu, dorong pinggul ke belakang, turun sampai paha sejajar lantai. Lutut searah jari kaki.

### Prompt pria (`squat-m`)

```text
Clean flat-color vector-style illustration (anime cel-shading, solid color fills, crisp uniform dark outlines, at most 2 to 3 tones per color, no gradients, no textures, no blur, no photorealism) of ONE man performing ONE bodyweight parallel squat, drawn as a sheet of sixteen sequential keyframes of the movement in one direction.

The man: an Asian man in his late 20s, lean athletic build, short neat black hair, clean-shaven, calm neutral face, wearing a fitted teal short-sleeve athletic t-shirt, black athletic shorts ending 10 cm above the knee, a black smartwatch on the wrist, and white running shoes with orange accents. No green anywhere on the character. He is drawn identically in every panel: same face, same hair, same clothes, same proportions, same size. If a character reference image is attached, draw exactly that man.

Layout: ONE square image (1:1) containing a 4x4 grid of sixteen equal square panels, read left to right and top to bottom (panel 1 top-left, panel 16 bottom-right), separated by thin straight white lines. Nothing crosses the white lines. No text, no numbers, no labels, no arrows, no frames.

Camera (identical in all sixteen panels): exact side profile, he faces the RIGHT edge of the panel and the camera sees his right side (the right arm and right leg are the near limbs), the camera is at hip height, orthographic, no perspective, no tilt, no zoom. His feet stay at exactly the same spot in every panel. He is the same size in every panel, about 80 percent of the panel height, centered, with clear margin on every side. Background in every panel: transparent. If transparency is not possible, one perfectly flat solid chroma key green (#00B140). No floor line, no horizon, no scenery, no shadow on the ground.

Setup (all panels): Feet shoulder-width apart, toes turned out slightly, heels flat on the floor, knees always in line with the toes, back always flat and neutral, head looking straight ahead.

Keyframes: panel 1 is the start position and panel 16 is the end position. Panels 2 to 15 are equal, evenly spaced in-between steps, so each panel changes only a little from the one before. Do not draw the return movement. Measurements (angles in degrees): thigh angle is measured above horizontal (90 = vertical when standing, 0 = parallel to the floor); torso and shin lean are measured forward from vertical; arm angle is measured forward from hanging straight down (90 = straight forward at shoulder height).
Panel 1: start, standing tall, legs straight, arms hanging at his sides: thighs 90, torso lean 0, shin lean 0, arms 0.
Panel 2: thighs 84, torso lean 3, shin lean 1, arms 6.
Panel 3: thighs 78, torso lean 5, shin lean 3, arms 12.
Panel 4: thighs 72, torso lean 8, shin lean 4, arms 18.
Panel 5: thighs 66, torso lean 11, shin lean 6, arms 24.
Panel 6: thighs 60, torso lean 13, shin lean 7, arms 30.
Panel 7: thighs 54, torso lean 16, shin lean 9, arms 36.
Panel 8: thighs 48, torso lean 19, shin lean 10, arms 42.
Panel 9: thighs 42, torso lean 21, shin lean 12, arms 48.
Panel 10: thighs 36, torso lean 24, shin lean 13, arms 54.
Panel 11: thighs 30, torso lean 27, shin lean 15, arms 60.
Panel 12: thighs 24, torso lean 29, shin lean 16, arms 66.
Panel 13: thighs 18, torso lean 32, shin lean 18, arms 72.
Panel 14: thighs 12, torso lean 35, shin lean 19, arms 78.
Panel 15: thighs 6, torso lean 37, shin lean 21, arms 84.
Panel 16: end, thighs 0, torso lean 40, shin lean 22, arms 90. Lowest point: thighs exactly parallel to the floor, hips level with the knees and clearly above the floor (about 45 cm, like sitting on a chair), arms straight forward at shoulder height. A parallel squat, NOT a deep squat, NOT a crouch.
```

### Prompt wanita (`squat-f`)

```text
Clean flat-color vector-style illustration (anime cel-shading, solid color fills, crisp uniform dark outlines, at most 2 to 3 tones per color, no gradients, no textures, no blur, no photorealism) of ONE woman performing ONE bodyweight parallel squat, drawn as a sheet of sixteen sequential keyframes of the movement in one direction.

The woman: an Asian woman in her late 20s, lean athletic build, long black hair tied in a high ponytail, calm neutral face, wearing a fitted teal short-sleeve athletic t-shirt (not cropped), black athletic shorts ending 10 cm above the knee, a black smartwatch on the wrist, and white running shoes with orange accents. No green anywhere on the character. She is drawn identically in every panel: same face, same hair, same clothes, same proportions, same size. If a character reference image is attached, draw exactly that woman.

Layout: ONE square image (1:1) containing a 4x4 grid of sixteen equal square panels, read left to right and top to bottom (panel 1 top-left, panel 16 bottom-right), separated by thin straight white lines. Nothing crosses the white lines. No text, no numbers, no labels, no arrows, no frames.

Camera (identical in all sixteen panels): exact side profile, she faces the RIGHT edge of the panel and the camera sees her right side (the right arm and right leg are the near limbs), the camera is at hip height, orthographic, no perspective, no tilt, no zoom. Her feet stay at exactly the same spot in every panel. She is the same size in every panel, about 80 percent of the panel height, centered, with clear margin on every side. Background in every panel: transparent. If transparency is not possible, one perfectly flat solid chroma key green (#00B140). No floor line, no horizon, no scenery, no shadow on the ground.

Setup (all panels): Feet shoulder-width apart, toes turned out slightly, heels flat on the floor, knees always in line with the toes, back always flat and neutral, head looking straight ahead.

Keyframes: panel 1 is the start position and panel 16 is the end position. Panels 2 to 15 are equal, evenly spaced in-between steps, so each panel changes only a little from the one before. Do not draw the return movement. Measurements (angles in degrees): thigh angle is measured above horizontal (90 = vertical when standing, 0 = parallel to the floor); torso and shin lean are measured forward from vertical; arm angle is measured forward from hanging straight down (90 = straight forward at shoulder height).
Panel 1: start, standing tall, legs straight, arms hanging at her sides: thighs 90, torso lean 0, shin lean 0, arms 0.
Panel 2: thighs 84, torso lean 3, shin lean 1, arms 6.
Panel 3: thighs 78, torso lean 5, shin lean 3, arms 12.
Panel 4: thighs 72, torso lean 8, shin lean 4, arms 18.
Panel 5: thighs 66, torso lean 11, shin lean 6, arms 24.
Panel 6: thighs 60, torso lean 13, shin lean 7, arms 30.
Panel 7: thighs 54, torso lean 16, shin lean 9, arms 36.
Panel 8: thighs 48, torso lean 19, shin lean 10, arms 42.
Panel 9: thighs 42, torso lean 21, shin lean 12, arms 48.
Panel 10: thighs 36, torso lean 24, shin lean 13, arms 54.
Panel 11: thighs 30, torso lean 27, shin lean 15, arms 60.
Panel 12: thighs 24, torso lean 29, shin lean 16, arms 66.
Panel 13: thighs 18, torso lean 32, shin lean 18, arms 72.
Panel 14: thighs 12, torso lean 35, shin lean 19, arms 78.
Panel 15: thighs 6, torso lean 37, shin lean 21, arms 84.
Panel 16: end, thighs 0, torso lean 40, shin lean 22, arms 90. Lowest point: thighs exactly parallel to the floor, hips level with the knees and clearly above the floor (about 45 cm, like sitting on a chair), arms straight forward at shoulder height. A parallel squat, NOT a deep squat, NOT a crouch.
```

### Prompt negatif (pria dan wanita)

```text
photograph, photorealistic, 3D render, gradient, texture, blur, text, numbers, labels, arrows, watermark, logo, extra people, different person between panels, different face between panels, different hair between panels, different clothes between panels, different size between panels, different camera angle between panels, panels out of order, perspective, scenery, floor line, shadow on the floor, green clothing, extra limbs, distorted hands, distorted feet, three-quarter view, front view, back view, deep squat, crouching, hips below the knees, heels lifting, knees caving inward, rounded back, hands touching the floor
```

**Periksa:** Paha sejajar lantai di panel 16 (tidak lebih dalam), tumit menempel, punggung rata, kaki tidak bergeser. Panel 1 sampai 16 berubah sedikit demi sedikit, tidak ada panel yang melompat atau terbalik urutannya.

---

## 2. Split squat (`split_squat`)

**Cue di app:** Satu kaki di depan, satu di belakang. Turunkan lutut belakang lurus ke bawah, badan tetap tegak.

### Prompt pria (`split_squat-m`)

```text
Clean flat-color vector-style illustration (anime cel-shading, solid color fills, crisp uniform dark outlines, at most 2 to 3 tones per color, no gradients, no textures, no blur, no photorealism) of ONE man performing ONE split squat (static lunge), drawn as a sheet of sixteen sequential keyframes of the movement in one direction.

The man: an Asian man in his late 20s, lean athletic build, short neat black hair, clean-shaven, calm neutral face, wearing a fitted teal short-sleeve athletic t-shirt, black athletic shorts ending 10 cm above the knee, a black smartwatch on the wrist, and white running shoes with orange accents. No green anywhere on the character. He is drawn identically in every panel: same face, same hair, same clothes, same proportions, same size. If a character reference image is attached, draw exactly that man.

Layout: ONE square image (1:1) containing a 4x4 grid of sixteen equal square panels, read left to right and top to bottom (panel 1 top-left, panel 16 bottom-right), separated by thin straight white lines. Nothing crosses the white lines. No text, no numbers, no labels, no arrows, no frames.

Camera (identical in all sixteen panels): exact side profile, he faces the RIGHT edge of the panel and the camera sees his right side (the right arm and right leg are the near limbs), the camera is at hip height, orthographic, no perspective, no tilt, no zoom. His feet stay at exactly the same spots in every panel. He is the same size in every panel, about 80 percent of the panel height, centered, with clear margin on every side. Background in every panel: transparent. If transparency is not possible, one perfectly flat solid chroma key green (#00B140). No floor line, no horizon, no scenery, no shadow on the ground.

Setup (all panels): Split stance: the near (right) leg is the FRONT leg and the far (left) leg is the BACK leg, about 90 cm between the feet front to back. Front foot flat, back heel raised with the toes on the floor. Both hands on his hips. Torso always vertical, pelvis level. He moves straight down; the feet never move.

Keyframes: panel 1 is the start position and panel 16 is the end position. Panels 2 to 15 are equal, evenly spaced in-between steps, so each panel changes only a little from the one before. Do not draw the return movement. Measurements (angles in degrees): knee angle is the inside angle of the knee joint (180 = straight leg, 90 = right angle); back knee height is measured from the floor.
Panel 1: start, standing tall in the split stance, both legs almost straight: front knee 170, back knee 170, back knee height 45 cm.
Panel 2: front knee 165, back knee 165, back knee height 42 cm.
Panel 3: front knee 159, back knee 159, back knee height 40 cm.
Panel 4: front knee 154, back knee 154, back knee height 37 cm.
Panel 5: front knee 149, back knee 149, back knee height 34 cm.
Panel 6: front knee 143, back knee 143, back knee height 32 cm.
Panel 7: front knee 138, back knee 138, back knee height 29 cm.
Panel 8: front knee 133, back knee 133, back knee height 26 cm.
Panel 9: front knee 127, back knee 127, back knee height 24 cm.
Panel 10: front knee 122, back knee 122, back knee height 21 cm.
Panel 11: front knee 117, back knee 117, back knee height 18 cm.
Panel 12: front knee 111, back knee 111, back knee height 16 cm.
Panel 13: front knee 106, back knee 106, back knee height 13 cm.
Panel 14: front knee 101, back knee 101, back knee height 10 cm.
Panel 15: front knee 95, back knee 95, back knee height 8 cm.
Panel 16: end, front knee 90, back knee 90, back knee height 5 cm. Lowest point: front thigh parallel to the floor, front shin vertical with the knee directly above the ankle (not past the toes), back thigh vertical, back knee hovering just above the floor without touching it, torso upright.
```

### Prompt wanita (`split_squat-f`)

```text
Clean flat-color vector-style illustration (anime cel-shading, solid color fills, crisp uniform dark outlines, at most 2 to 3 tones per color, no gradients, no textures, no blur, no photorealism) of ONE woman performing ONE split squat (static lunge), drawn as a sheet of sixteen sequential keyframes of the movement in one direction.

The woman: an Asian woman in her late 20s, lean athletic build, long black hair tied in a high ponytail, calm neutral face, wearing a fitted teal short-sleeve athletic t-shirt (not cropped), black athletic shorts ending 10 cm above the knee, a black smartwatch on the wrist, and white running shoes with orange accents. No green anywhere on the character. She is drawn identically in every panel: same face, same hair, same clothes, same proportions, same size. If a character reference image is attached, draw exactly that woman.

Layout: ONE square image (1:1) containing a 4x4 grid of sixteen equal square panels, read left to right and top to bottom (panel 1 top-left, panel 16 bottom-right), separated by thin straight white lines. Nothing crosses the white lines. No text, no numbers, no labels, no arrows, no frames.

Camera (identical in all sixteen panels): exact side profile, she faces the RIGHT edge of the panel and the camera sees her right side (the right arm and right leg are the near limbs), the camera is at hip height, orthographic, no perspective, no tilt, no zoom. Her feet stay at exactly the same spots in every panel. She is the same size in every panel, about 80 percent of the panel height, centered, with clear margin on every side. Background in every panel: transparent. If transparency is not possible, one perfectly flat solid chroma key green (#00B140). No floor line, no horizon, no scenery, no shadow on the ground.

Setup (all panels): Split stance: the near (right) leg is the FRONT leg and the far (left) leg is the BACK leg, about 90 cm between the feet front to back. Front foot flat, back heel raised with the toes on the floor. Both hands on her hips. Torso always vertical, pelvis level. She moves straight down; the feet never move.

Keyframes: panel 1 is the start position and panel 16 is the end position. Panels 2 to 15 are equal, evenly spaced in-between steps, so each panel changes only a little from the one before. Do not draw the return movement. Measurements (angles in degrees): knee angle is the inside angle of the knee joint (180 = straight leg, 90 = right angle); back knee height is measured from the floor.
Panel 1: start, standing tall in the split stance, both legs almost straight: front knee 170, back knee 170, back knee height 45 cm.
Panel 2: front knee 165, back knee 165, back knee height 42 cm.
Panel 3: front knee 159, back knee 159, back knee height 40 cm.
Panel 4: front knee 154, back knee 154, back knee height 37 cm.
Panel 5: front knee 149, back knee 149, back knee height 34 cm.
Panel 6: front knee 143, back knee 143, back knee height 32 cm.
Panel 7: front knee 138, back knee 138, back knee height 29 cm.
Panel 8: front knee 133, back knee 133, back knee height 26 cm.
Panel 9: front knee 127, back knee 127, back knee height 24 cm.
Panel 10: front knee 122, back knee 122, back knee height 21 cm.
Panel 11: front knee 117, back knee 117, back knee height 18 cm.
Panel 12: front knee 111, back knee 111, back knee height 16 cm.
Panel 13: front knee 106, back knee 106, back knee height 13 cm.
Panel 14: front knee 101, back knee 101, back knee height 10 cm.
Panel 15: front knee 95, back knee 95, back knee height 8 cm.
Panel 16: end, front knee 90, back knee 90, back knee height 5 cm. Lowest point: front thigh parallel to the floor, front shin vertical with the knee directly above the ankle (not past the toes), back thigh vertical, back knee hovering just above the floor without touching it, torso upright.
```

### Prompt negatif (pria dan wanita)

```text
photograph, photorealistic, 3D render, gradient, texture, blur, text, numbers, labels, arrows, watermark, logo, extra people, different person between panels, different face between panels, different hair between panels, different clothes between panels, different size between panels, different camera angle between panels, panels out of order, perspective, scenery, floor line, shadow on the floor, green clothing, extra limbs, distorted hands, distorted feet, three-quarter view, front view, back view, feet stepping, torso leaning forward, front knee past the toes, front heel lifting, back knee touching the floor, hips tilting
```

**Periksa:** Lutut belakang turun lurus ke bawah, badan tegak, lutut depan di atas pergelangan kaki, kaki tidak pindah. Panel 1 sampai 16 berubah sedikit demi sedikit, tidak ada panel yang melompat atau terbalik urutannya.

---

## 3. Bulgarian split squat (`bulgarian_split_squat`)

**Cue di app:** Punggung kaki belakang di kursi atau bangku. Turun pelan sampai paha depan sejajar lantai, dorong lewat tumit depan.

### Prompt pria (`bulgarian_split_squat-m`)

```text
Clean flat-color vector-style illustration (anime cel-shading, solid color fills, crisp uniform dark outlines, at most 2 to 3 tones per color, no gradients, no textures, no blur, no photorealism) of ONE man performing ONE Bulgarian split squat, drawn as a sheet of sixteen sequential keyframes of the movement in one direction.

The man: an Asian man in his late 20s, lean athletic build, short neat black hair, clean-shaven, calm neutral face, wearing a fitted teal short-sleeve athletic t-shirt, black athletic shorts ending 10 cm above the knee, a black smartwatch on the wrist, and white running shoes with orange accents. No green anywhere on the character. He is drawn identically in every panel: same face, same hair, same clothes, same proportions, same size. If a character reference image is attached, draw exactly that man.

Layout: ONE square image (1:1) containing a 4x4 grid of sixteen equal square panels, read left to right and top to bottom (panel 1 top-left, panel 16 bottom-right), separated by thin straight white lines. Nothing crosses the white lines. No text, no numbers, no labels, no arrows, no frames.

Camera (identical in all sixteen panels): exact side profile, he faces the RIGHT edge of the panel and the camera sees his right side (the right arm and right leg are the near limbs), the camera is at hip height, orthographic, no perspective, no tilt, no zoom. His front foot and the bench stay at exactly the same spots in every panel. He is the same size in every panel, about 80 percent of the panel height, centered, with clear margin on every side. Background in every panel: transparent. If transparency is not possible, one perfectly flat solid chroma key green (#00B140). No floor line, no horizon, no scenery, no shadow on the ground. A plain flat dark grey bench about 45 cm high and 40 cm long stands on the LEFT side of the panel behind him; it is the only prop. Any prop is a plain flat dark grey (#3A3A3C) shape with no logo, no texture and no green.

Setup (all panels): The far (left) foot is the REAR foot: the top of the foot (laces down) rests on the bench behind him. The near (right) leg is the FRONT leg, foot flat on the floor about 75 cm in front of the bench. Both hands on his hips, pelvis level, back flat. The front foot and the rear foot never move.

Keyframes: panel 1 is the start position and panel 16 is the end position. Panels 2 to 15 are equal, evenly spaced in-between steps, so each panel changes only a little from the one before. Do not draw the return movement. Measurements (angles in degrees): knee angle is the inside angle of the knee joint (180 = straight leg); rear knee height is measured from the floor; torso lean is measured forward from vertical.
Panel 1: start, standing tall, front leg almost straight: front knee 170, rear knee 135, rear knee height 50 cm, torso lean 0.
Panel 2: front knee 165, rear knee 133, rear knee height 48 cm, torso lean 1.
Panel 3: front knee 159, rear knee 130, rear knee height 45 cm, torso lean 1.
Panel 4: front knee 154, rear knee 128, rear knee height 43 cm, torso lean 2.
Panel 5: front knee 149, rear knee 126, rear knee height 41 cm, torso lean 3.
Panel 6: front knee 143, rear knee 123, rear knee height 38 cm, torso lean 3.
Panel 7: front knee 138, rear knee 121, rear knee height 36 cm, torso lean 4.
Panel 8: front knee 133, rear knee 119, rear knee height 34 cm, torso lean 5.
Panel 9: front knee 127, rear knee 116, rear knee height 31 cm, torso lean 5.
Panel 10: front knee 122, rear knee 114, rear knee height 29 cm, torso lean 6.
Panel 11: front knee 117, rear knee 112, rear knee height 27 cm, torso lean 7.
Panel 12: front knee 111, rear knee 109, rear knee height 24 cm, torso lean 7.
Panel 13: front knee 106, rear knee 107, rear knee height 22 cm, torso lean 8.
Panel 14: front knee 101, rear knee 105, rear knee height 20 cm, torso lean 9.
Panel 15: front knee 95, rear knee 102, rear knee height 17 cm, torso lean 9.
Panel 16: end, front knee 90, rear knee 100, rear knee height 15 cm, torso lean 10. Lowest point: front thigh parallel to the floor, front shin nearly vertical with the knee over the ankle, rear knee pointing down and hovering above the floor, rear foot still on the bench, weight on the front heel.
```

### Prompt wanita (`bulgarian_split_squat-f`)

```text
Clean flat-color vector-style illustration (anime cel-shading, solid color fills, crisp uniform dark outlines, at most 2 to 3 tones per color, no gradients, no textures, no blur, no photorealism) of ONE woman performing ONE Bulgarian split squat, drawn as a sheet of sixteen sequential keyframes of the movement in one direction.

The woman: an Asian woman in her late 20s, lean athletic build, long black hair tied in a high ponytail, calm neutral face, wearing a fitted teal short-sleeve athletic t-shirt (not cropped), black athletic shorts ending 10 cm above the knee, a black smartwatch on the wrist, and white running shoes with orange accents. No green anywhere on the character. She is drawn identically in every panel: same face, same hair, same clothes, same proportions, same size. If a character reference image is attached, draw exactly that woman.

Layout: ONE square image (1:1) containing a 4x4 grid of sixteen equal square panels, read left to right and top to bottom (panel 1 top-left, panel 16 bottom-right), separated by thin straight white lines. Nothing crosses the white lines. No text, no numbers, no labels, no arrows, no frames.

Camera (identical in all sixteen panels): exact side profile, she faces the RIGHT edge of the panel and the camera sees her right side (the right arm and right leg are the near limbs), the camera is at hip height, orthographic, no perspective, no tilt, no zoom. Her front foot and the bench stay at exactly the same spots in every panel. She is the same size in every panel, about 80 percent of the panel height, centered, with clear margin on every side. Background in every panel: transparent. If transparency is not possible, one perfectly flat solid chroma key green (#00B140). No floor line, no horizon, no scenery, no shadow on the ground. A plain flat dark grey bench about 45 cm high and 40 cm long stands on the LEFT side of the panel behind her; it is the only prop. Any prop is a plain flat dark grey (#3A3A3C) shape with no logo, no texture and no green.

Setup (all panels): The far (left) foot is the REAR foot: the top of the foot (laces down) rests on the bench behind her. The near (right) leg is the FRONT leg, foot flat on the floor about 75 cm in front of the bench. Both hands on her hips, pelvis level, back flat. The front foot and the rear foot never move.

Keyframes: panel 1 is the start position and panel 16 is the end position. Panels 2 to 15 are equal, evenly spaced in-between steps, so each panel changes only a little from the one before. Do not draw the return movement. Measurements (angles in degrees): knee angle is the inside angle of the knee joint (180 = straight leg); rear knee height is measured from the floor; torso lean is measured forward from vertical.
Panel 1: start, standing tall, front leg almost straight: front knee 170, rear knee 135, rear knee height 50 cm, torso lean 0.
Panel 2: front knee 165, rear knee 133, rear knee height 48 cm, torso lean 1.
Panel 3: front knee 159, rear knee 130, rear knee height 45 cm, torso lean 1.
Panel 4: front knee 154, rear knee 128, rear knee height 43 cm, torso lean 2.
Panel 5: front knee 149, rear knee 126, rear knee height 41 cm, torso lean 3.
Panel 6: front knee 143, rear knee 123, rear knee height 38 cm, torso lean 3.
Panel 7: front knee 138, rear knee 121, rear knee height 36 cm, torso lean 4.
Panel 8: front knee 133, rear knee 119, rear knee height 34 cm, torso lean 5.
Panel 9: front knee 127, rear knee 116, rear knee height 31 cm, torso lean 5.
Panel 10: front knee 122, rear knee 114, rear knee height 29 cm, torso lean 6.
Panel 11: front knee 117, rear knee 112, rear knee height 27 cm, torso lean 7.
Panel 12: front knee 111, rear knee 109, rear knee height 24 cm, torso lean 7.
Panel 13: front knee 106, rear knee 107, rear knee height 22 cm, torso lean 8.
Panel 14: front knee 101, rear knee 105, rear knee height 20 cm, torso lean 9.
Panel 15: front knee 95, rear knee 102, rear knee height 17 cm, torso lean 9.
Panel 16: end, front knee 90, rear knee 100, rear knee height 15 cm, torso lean 10. Lowest point: front thigh parallel to the floor, front shin nearly vertical with the knee over the ankle, rear knee pointing down and hovering above the floor, rear foot still on the bench, weight on the front heel.
```

### Prompt negatif (pria dan wanita)

```text
photograph, photorealistic, 3D render, gradient, texture, blur, text, numbers, labels, arrows, watermark, logo, extra people, different person between panels, different face between panels, different hair between panels, different clothes between panels, different size between panels, different camera angle between panels, panels out of order, perspective, scenery, floor line, shadow on the floor, green clothing, extra limbs, distorted hands, distorted feet, three-quarter view, front view, back view, rear foot off the bench, front knee past the toes, front heel lifting, rear knee touching the floor, rounded back, torso leaning far forward
```

**Periksa:** Kaki belakang tetap di bangku, paha depan sejajar lantai di panel 16, lutut depan di atas pergelangan kaki. Panel 1 sampai 16 berubah sedikit demi sedikit, tidak ada panel yang melompat atau terbalik urutannya.

---

## 4. Glute bridge (`glute_bridge`)

**Cue di app:** Berbaring, lutut ditekuk. Angkat pinggul sampai badan lurus dari bahu ke lutut, tahan 1 detik.

### Prompt pria (`glute_bridge-m`)

```text
Clean flat-color vector-style illustration (anime cel-shading, solid color fills, crisp uniform dark outlines, at most 2 to 3 tones per color, no gradients, no textures, no blur, no photorealism) of ONE man performing ONE glute bridge, drawn as a sheet of sixteen sequential keyframes of the movement in one direction.

The man: an Asian man in his late 20s, lean athletic build, short neat black hair, clean-shaven, calm neutral face, wearing a fitted teal short-sleeve athletic t-shirt, black athletic shorts ending 10 cm above the knee, a black smartwatch on the wrist, and white running shoes with orange accents. No green anywhere on the character. He is drawn identically in every panel: same face, same hair, same clothes, same proportions, same size. If a character reference image is attached, draw exactly that man.

Layout: ONE square image (1:1) containing a 4x4 grid of sixteen equal square panels, read left to right and top to bottom (panel 1 top-left, panel 16 bottom-right), separated by thin straight white lines. Nothing crosses the white lines. No text, no numbers, no labels, no arrows, no frames.

Camera (identical in all sixteen panels): exact side profile at floor level, he lies with the head toward the LEFT edge of the panel and the feet toward the RIGHT edge, the camera sees his right side (the right arm and right leg are the near limbs), orthographic, no perspective, no tilt, no zoom. His head, shoulders and feet stay at exactly the same spots in every panel. He is the same size in every panel, the body about 85 percent of the panel width, centered vertically, with clear margin on every side. Background in every panel: transparent. If transparency is not possible, one perfectly flat solid chroma key green (#00B140). No floor line, no horizon, no scenery, no shadow on the ground.

Setup (all panels): He lies on his back with both knees bent, feet flat on the floor hip-width apart, heels about 30 cm from the glutes, arms resting on the floor along his sides with the palms down. Head and shoulders stay on the floor; the feet never move.

Keyframes: panel 1 is the start position and panel 16 is the end position. Panels 2 to 15 are equal, evenly spaced in-between steps, so each panel changes only a little from the one before. Do not draw the return movement. Measurements (angles in degrees): hip height is the gap between the hips and the floor; thigh angle is measured above horizontal.
Panel 1: start, lying flat on the back, knees bent, hips resting on the floor: hip height 0 cm, thighs 45.
Panel 2: hip height 2 cm, thighs 44.
Panel 3: hip height 4 cm, thighs 42.
Panel 4: hip height 6 cm, thighs 41.
Panel 5: hip height 8 cm, thighs 40.
Panel 6: hip height 10 cm, thighs 38.
Panel 7: hip height 12 cm, thighs 37.
Panel 8: hip height 14 cm, thighs 36.
Panel 9: hip height 16 cm, thighs 34.
Panel 10: hip height 18 cm, thighs 33.
Panel 11: hip height 20 cm, thighs 32.
Panel 12: hip height 22 cm, thighs 30.
Panel 13: hip height 24 cm, thighs 29.
Panel 14: hip height 26 cm, thighs 28.
Panel 15: hip height 28 cm, thighs 26.
Panel 16: end, hip height 30 cm, thighs 25. Top: shoulders, hips and knees form one straight diagonal line, shins vertical with the feet directly below the knees, glutes squeezed, ribs down, no arch in the lower back.
```

### Prompt wanita (`glute_bridge-f`)

```text
Clean flat-color vector-style illustration (anime cel-shading, solid color fills, crisp uniform dark outlines, at most 2 to 3 tones per color, no gradients, no textures, no blur, no photorealism) of ONE woman performing ONE glute bridge, drawn as a sheet of sixteen sequential keyframes of the movement in one direction.

The woman: an Asian woman in her late 20s, lean athletic build, long black hair tied in a high ponytail, calm neutral face, wearing a fitted teal short-sleeve athletic t-shirt (not cropped), black athletic shorts ending 10 cm above the knee, a black smartwatch on the wrist, and white running shoes with orange accents. No green anywhere on the character. She is drawn identically in every panel: same face, same hair, same clothes, same proportions, same size. If a character reference image is attached, draw exactly that woman.

Layout: ONE square image (1:1) containing a 4x4 grid of sixteen equal square panels, read left to right and top to bottom (panel 1 top-left, panel 16 bottom-right), separated by thin straight white lines. Nothing crosses the white lines. No text, no numbers, no labels, no arrows, no frames.

Camera (identical in all sixteen panels): exact side profile at floor level, she lies with the head toward the LEFT edge of the panel and the feet toward the RIGHT edge, the camera sees her right side (the right arm and right leg are the near limbs), orthographic, no perspective, no tilt, no zoom. Her head, shoulders and feet stay at exactly the same spots in every panel. She is the same size in every panel, the body about 85 percent of the panel width, centered vertically, with clear margin on every side. Background in every panel: transparent. If transparency is not possible, one perfectly flat solid chroma key green (#00B140). No floor line, no horizon, no scenery, no shadow on the ground.

Setup (all panels): She lies on her back with both knees bent, feet flat on the floor hip-width apart, heels about 30 cm from the glutes, arms resting on the floor along her sides with the palms down. Head and shoulders stay on the floor; the feet never move.

Keyframes: panel 1 is the start position and panel 16 is the end position. Panels 2 to 15 are equal, evenly spaced in-between steps, so each panel changes only a little from the one before. Do not draw the return movement. Measurements (angles in degrees): hip height is the gap between the hips and the floor; thigh angle is measured above horizontal.
Panel 1: start, lying flat on the back, knees bent, hips resting on the floor: hip height 0 cm, thighs 45.
Panel 2: hip height 2 cm, thighs 44.
Panel 3: hip height 4 cm, thighs 42.
Panel 4: hip height 6 cm, thighs 41.
Panel 5: hip height 8 cm, thighs 40.
Panel 6: hip height 10 cm, thighs 38.
Panel 7: hip height 12 cm, thighs 37.
Panel 8: hip height 14 cm, thighs 36.
Panel 9: hip height 16 cm, thighs 34.
Panel 10: hip height 18 cm, thighs 33.
Panel 11: hip height 20 cm, thighs 32.
Panel 12: hip height 22 cm, thighs 30.
Panel 13: hip height 24 cm, thighs 29.
Panel 14: hip height 26 cm, thighs 28.
Panel 15: hip height 28 cm, thighs 26.
Panel 16: end, hip height 30 cm, thighs 25. Top: shoulders, hips and knees form one straight diagonal line, shins vertical with the feet directly below the knees, glutes squeezed, ribs down, no arch in the lower back.
```

### Prompt negatif (pria dan wanita)

```text
photograph, photorealistic, 3D render, gradient, texture, blur, text, numbers, labels, arrows, watermark, logo, extra people, different person between panels, different face between panels, different hair between panels, different clothes between panels, different size between panels, different camera angle between panels, panels out of order, perspective, scenery, floor line, shadow on the floor, green clothing, extra limbs, distorted hands, distorted feet, three-quarter view, view from above, lower back arching, hips above the shoulder-to-knee line, shoulders lifting off the floor, head lifting, feet sliding, knees falling outward
```

**Periksa:** Bahu, pinggul, lutut satu garis di panel 16 (tidak melengkung), bahu dan kepala tetap di lantai. Panel 1 sampai 16 berubah sedikit demi sedikit, tidak ada panel yang melompat atau terbalik urutannya.

---

## 5. Glute bridge satu kaki (`single_leg_glute_bridge`)

**Cue di app:** Seperti glute bridge, satu kaki lurus ke atas. Pinggul tetap rata, tidak miring.

### Prompt pria (`single_leg_glute_bridge-m`)

```text
Clean flat-color vector-style illustration (anime cel-shading, solid color fills, crisp uniform dark outlines, at most 2 to 3 tones per color, no gradients, no textures, no blur, no photorealism) of ONE man performing ONE single-leg glute bridge, drawn as a sheet of sixteen sequential keyframes of the movement in one direction.

The man: an Asian man in his late 20s, lean athletic build, short neat black hair, clean-shaven, calm neutral face, wearing a fitted teal short-sleeve athletic t-shirt, black athletic shorts ending 10 cm above the knee, a black smartwatch on the wrist, and white running shoes with orange accents. No green anywhere on the character. He is drawn identically in every panel: same face, same hair, same clothes, same proportions, same size. If a character reference image is attached, draw exactly that man.

Layout: ONE square image (1:1) containing a 4x4 grid of sixteen equal square panels, read left to right and top to bottom (panel 1 top-left, panel 16 bottom-right), separated by thin straight white lines. Nothing crosses the white lines. No text, no numbers, no labels, no arrows, no frames.

Camera (identical in all sixteen panels): exact side profile at floor level, he lies with the head toward the LEFT edge of the panel and the feet toward the RIGHT edge, the camera sees his right side (the right arm and right leg are the near limbs), orthographic, no perspective, no tilt, no zoom. His head, shoulders and near foot stay at exactly the same spots in every panel. He is the same size in every panel, the body about 85 percent of the panel width, centered vertically, with clear margin on every side. Background in every panel: transparent. If transparency is not possible, one perfectly flat solid chroma key green (#00B140). No floor line, no horizon, no scenery, no shadow on the ground.

Setup (all panels): He lies on his back. The near (right) foot is flat on the floor with the knee bent: this is the working leg. The far (left) leg is held straight, its thigh parallel to the near thigh, the foot flexed, never touching the floor. Arms rest on the floor along his sides, palms down. Head and shoulders stay on the floor, the near foot never moves, the pelvis stays level without twisting.

Keyframes: panel 1 is the start position and panel 16 is the end position. Panels 2 to 15 are equal, evenly spaced in-between steps, so each panel changes only a little from the one before. Do not draw the return movement. Measurements (angles in degrees): hip height is the gap between the hips and the floor; thigh angle is measured above horizontal.
Panel 1: start, lying flat on the back, near knee bent, far leg straight in the air, hips resting on the floor: hip height 0 cm, thighs 45.
Panel 2: hip height 2 cm, thighs 44.
Panel 3: hip height 4 cm, thighs 42.
Panel 4: hip height 6 cm, thighs 41.
Panel 5: hip height 8 cm, thighs 40.
Panel 6: hip height 10 cm, thighs 38.
Panel 7: hip height 12 cm, thighs 37.
Panel 8: hip height 14 cm, thighs 36.
Panel 9: hip height 16 cm, thighs 34.
Panel 10: hip height 18 cm, thighs 33.
Panel 11: hip height 20 cm, thighs 32.
Panel 12: hip height 22 cm, thighs 30.
Panel 13: hip height 24 cm, thighs 29.
Panel 14: hip height 26 cm, thighs 28.
Panel 15: hip height 28 cm, thighs 26.
Panel 16: end, hip height 30 cm, thighs 25. Top: shoulders, hips and the near knee form one straight diagonal line, near shin vertical, the straight far leg continues the line of the near thigh, pelvis level and square.
```

### Prompt wanita (`single_leg_glute_bridge-f`)

```text
Clean flat-color vector-style illustration (anime cel-shading, solid color fills, crisp uniform dark outlines, at most 2 to 3 tones per color, no gradients, no textures, no blur, no photorealism) of ONE woman performing ONE single-leg glute bridge, drawn as a sheet of sixteen sequential keyframes of the movement in one direction.

The woman: an Asian woman in her late 20s, lean athletic build, long black hair tied in a high ponytail, calm neutral face, wearing a fitted teal short-sleeve athletic t-shirt (not cropped), black athletic shorts ending 10 cm above the knee, a black smartwatch on the wrist, and white running shoes with orange accents. No green anywhere on the character. She is drawn identically in every panel: same face, same hair, same clothes, same proportions, same size. If a character reference image is attached, draw exactly that woman.

Layout: ONE square image (1:1) containing a 4x4 grid of sixteen equal square panels, read left to right and top to bottom (panel 1 top-left, panel 16 bottom-right), separated by thin straight white lines. Nothing crosses the white lines. No text, no numbers, no labels, no arrows, no frames.

Camera (identical in all sixteen panels): exact side profile at floor level, she lies with the head toward the LEFT edge of the panel and the feet toward the RIGHT edge, the camera sees her right side (the right arm and right leg are the near limbs), orthographic, no perspective, no tilt, no zoom. Her head, shoulders and near foot stay at exactly the same spots in every panel. She is the same size in every panel, the body about 85 percent of the panel width, centered vertically, with clear margin on every side. Background in every panel: transparent. If transparency is not possible, one perfectly flat solid chroma key green (#00B140). No floor line, no horizon, no scenery, no shadow on the ground.

Setup (all panels): She lies on her back. The near (right) foot is flat on the floor with the knee bent: this is the working leg. The far (left) leg is held straight, its thigh parallel to the near thigh, the foot flexed, never touching the floor. Arms rest on the floor along her sides, palms down. Head and shoulders stay on the floor, the near foot never moves, the pelvis stays level without twisting.

Keyframes: panel 1 is the start position and panel 16 is the end position. Panels 2 to 15 are equal, evenly spaced in-between steps, so each panel changes only a little from the one before. Do not draw the return movement. Measurements (angles in degrees): hip height is the gap between the hips and the floor; thigh angle is measured above horizontal.
Panel 1: start, lying flat on the back, near knee bent, far leg straight in the air, hips resting on the floor: hip height 0 cm, thighs 45.
Panel 2: hip height 2 cm, thighs 44.
Panel 3: hip height 4 cm, thighs 42.
Panel 4: hip height 6 cm, thighs 41.
Panel 5: hip height 8 cm, thighs 40.
Panel 6: hip height 10 cm, thighs 38.
Panel 7: hip height 12 cm, thighs 37.
Panel 8: hip height 14 cm, thighs 36.
Panel 9: hip height 16 cm, thighs 34.
Panel 10: hip height 18 cm, thighs 33.
Panel 11: hip height 20 cm, thighs 32.
Panel 12: hip height 22 cm, thighs 30.
Panel 13: hip height 24 cm, thighs 29.
Panel 14: hip height 26 cm, thighs 28.
Panel 15: hip height 28 cm, thighs 26.
Panel 16: end, hip height 30 cm, thighs 25. Top: shoulders, hips and the near knee form one straight diagonal line, near shin vertical, the straight far leg continues the line of the near thigh, pelvis level and square.
```

### Prompt negatif (pria dan wanita)

```text
photograph, photorealistic, 3D render, gradient, texture, blur, text, numbers, labels, arrows, watermark, logo, extra people, different person between panels, different face between panels, different hair between panels, different clothes between panels, different size between panels, different camera angle between panels, panels out of order, perspective, scenery, floor line, shadow on the floor, green clothing, extra limbs, distorted hands, distorted feet, three-quarter view, view from above, far foot touching the floor, far leg bent, hips dropping on one side, pelvis twisting, lower back arching, shoulders lifting
```

**Periksa:** Kaki atas tetap lurus dan sejajar paha, pinggul rata, bahu di lantai. Panel 1 sampai 16 berubah sedikit demi sedikit, tidak ada panel yang melompat atau terbalik urutannya.

---

## 6. Single-leg deadlift (`single_leg_deadlift`)

**Cue di app:** Berdiri satu kaki, badan condong ke depan sambil kaki lain lurus ke belakang. Punggung rata, kembali pelan.

### Prompt pria (`single_leg_deadlift-m`)

```text
Clean flat-color vector-style illustration (anime cel-shading, solid color fills, crisp uniform dark outlines, at most 2 to 3 tones per color, no gradients, no textures, no blur, no photorealism) of ONE man performing ONE bodyweight single-leg deadlift, drawn as a sheet of sixteen sequential keyframes of the movement in one direction.

The man: an Asian man in his late 20s, lean athletic build, short neat black hair, clean-shaven, calm neutral face, wearing a fitted teal short-sleeve athletic t-shirt, black athletic shorts ending 10 cm above the knee, a black smartwatch on the wrist, and white running shoes with orange accents. No green anywhere on the character. He is drawn identically in every panel: same face, same hair, same clothes, same proportions, same size. If a character reference image is attached, draw exactly that man.

Layout: ONE square image (1:1) containing a 4x4 grid of sixteen equal square panels, read left to right and top to bottom (panel 1 top-left, panel 16 bottom-right), separated by thin straight white lines. Nothing crosses the white lines. No text, no numbers, no labels, no arrows, no frames.

Camera (identical in all sixteen panels): exact side profile, he faces the RIGHT edge of the panel and the camera sees his right side (the right arm and right leg are the near limbs), the camera is at hip height, orthographic, no perspective, no tilt, no zoom. His standing foot stays at exactly the same spot in every panel. He is the same size in every panel, about 80 percent of the panel height, centered, with clear margin on every side. Background in every panel: transparent. If transparency is not possible, one perfectly flat solid chroma key green (#00B140). No floor line, no horizon, no scenery, no shadow on the ground.

Setup (all panels): He stands on the near (right) leg; the standing foot never moves. The far (left) leg is the free leg: it stays straight and swings back as the torso tips forward, so the torso and the free leg move like a seesaw. Arms hang straight down toward the floor. Back flat, hips square, no weights.

Keyframes: panel 1 is the start position and panel 16 is the end position. Panels 2 to 15 are equal, evenly spaced in-between steps, so each panel changes only a little from the one before. Do not draw the return movement. Measurements (angles in degrees): torso lean is measured forward from vertical; free leg angle is measured backward from hanging straight down; standing knee is the inside angle of the knee joint.
Panel 1: start, standing tall on the near leg, free leg hanging beside it with the toes just above the floor: torso lean 0, free leg 0, standing knee 170.
Panel 2: torso lean 5, free leg 5, standing knee 169.
Panel 3: torso lean 11, free leg 11, standing knee 168.
Panel 4: torso lean 16, free leg 16, standing knee 167.
Panel 5: torso lean 21, free leg 21, standing knee 166.
Panel 6: torso lean 27, free leg 27, standing knee 165.
Panel 7: torso lean 32, free leg 32, standing knee 164.
Panel 8: torso lean 37, free leg 37, standing knee 163.
Panel 9: torso lean 43, free leg 43, standing knee 162.
Panel 10: torso lean 48, free leg 48, standing knee 161.
Panel 11: torso lean 53, free leg 53, standing knee 160.
Panel 12: torso lean 59, free leg 59, standing knee 159.
Panel 13: torso lean 64, free leg 64, standing knee 158.
Panel 14: torso lean 69, free leg 69, standing knee 157.
Panel 15: torso lean 75, free leg 75, standing knee 156.
Panel 16: end, torso lean 80, free leg 80, standing knee 155. Lowest point: torso and free leg form one long straight line almost parallel to the floor, free foot flexed with the toes pointing down, arms hanging straight down from the shoulders, head neutral.
```

### Prompt wanita (`single_leg_deadlift-f`)

```text
Clean flat-color vector-style illustration (anime cel-shading, solid color fills, crisp uniform dark outlines, at most 2 to 3 tones per color, no gradients, no textures, no blur, no photorealism) of ONE woman performing ONE bodyweight single-leg deadlift, drawn as a sheet of sixteen sequential keyframes of the movement in one direction.

The woman: an Asian woman in her late 20s, lean athletic build, long black hair tied in a high ponytail, calm neutral face, wearing a fitted teal short-sleeve athletic t-shirt (not cropped), black athletic shorts ending 10 cm above the knee, a black smartwatch on the wrist, and white running shoes with orange accents. No green anywhere on the character. She is drawn identically in every panel: same face, same hair, same clothes, same proportions, same size. If a character reference image is attached, draw exactly that woman.

Layout: ONE square image (1:1) containing a 4x4 grid of sixteen equal square panels, read left to right and top to bottom (panel 1 top-left, panel 16 bottom-right), separated by thin straight white lines. Nothing crosses the white lines. No text, no numbers, no labels, no arrows, no frames.

Camera (identical in all sixteen panels): exact side profile, she faces the RIGHT edge of the panel and the camera sees her right side (the right arm and right leg are the near limbs), the camera is at hip height, orthographic, no perspective, no tilt, no zoom. Her standing foot stays at exactly the same spot in every panel. She is the same size in every panel, about 80 percent of the panel height, centered, with clear margin on every side. Background in every panel: transparent. If transparency is not possible, one perfectly flat solid chroma key green (#00B140). No floor line, no horizon, no scenery, no shadow on the ground.

Setup (all panels): She stands on the near (right) leg; the standing foot never moves. The far (left) leg is the free leg: it stays straight and swings back as the torso tips forward, so the torso and the free leg move like a seesaw. Arms hang straight down toward the floor. Back flat, hips square, no weights.

Keyframes: panel 1 is the start position and panel 16 is the end position. Panels 2 to 15 are equal, evenly spaced in-between steps, so each panel changes only a little from the one before. Do not draw the return movement. Measurements (angles in degrees): torso lean is measured forward from vertical; free leg angle is measured backward from hanging straight down; standing knee is the inside angle of the knee joint.
Panel 1: start, standing tall on the near leg, free leg hanging beside it with the toes just above the floor: torso lean 0, free leg 0, standing knee 170.
Panel 2: torso lean 5, free leg 5, standing knee 169.
Panel 3: torso lean 11, free leg 11, standing knee 168.
Panel 4: torso lean 16, free leg 16, standing knee 167.
Panel 5: torso lean 21, free leg 21, standing knee 166.
Panel 6: torso lean 27, free leg 27, standing knee 165.
Panel 7: torso lean 32, free leg 32, standing knee 164.
Panel 8: torso lean 37, free leg 37, standing knee 163.
Panel 9: torso lean 43, free leg 43, standing knee 162.
Panel 10: torso lean 48, free leg 48, standing knee 161.
Panel 11: torso lean 53, free leg 53, standing knee 160.
Panel 12: torso lean 59, free leg 59, standing knee 159.
Panel 13: torso lean 64, free leg 64, standing knee 158.
Panel 14: torso lean 69, free leg 69, standing knee 157.
Panel 15: torso lean 75, free leg 75, standing knee 156.
Panel 16: end, torso lean 80, free leg 80, standing knee 155. Lowest point: torso and free leg form one long straight line almost parallel to the floor, free foot flexed with the toes pointing down, arms hanging straight down from the shoulders, head neutral.
```

### Prompt negatif (pria dan wanita)

```text
photograph, photorealistic, 3D render, gradient, texture, blur, text, numbers, labels, arrows, watermark, logo, extra people, different person between panels, different face between panels, different hair between panels, different clothes between panels, different size between panels, different camera angle between panels, panels out of order, perspective, scenery, floor line, shadow on the floor, green clothing, extra limbs, distorted hands, distorted feet, three-quarter view, front view, back view, rounded back, bent free leg, hips opening to the side, free foot touching the floor, standing foot moving, arms reaching forward, head looking up
```

**Periksa:** Badan dan kaki bebas satu garis lurus di panel 16, punggung rata, lengan menggantung lurus. Panel 1 sampai 16 berubah sedikit demi sedikit, tidak ada panel yang melompat atau terbalik urutannya.

---

## 7. Reverse lunge (`reverse_lunge`)

**Cue di app:** Langkah mundur, turunkan lutut belakang hampir ke lantai. Dorong lewat kaki depan untuk berdiri.

### Prompt pria (`reverse_lunge-m`)

```text
Clean flat-color vector-style illustration (anime cel-shading, solid color fills, crisp uniform dark outlines, at most 2 to 3 tones per color, no gradients, no textures, no blur, no photorealism) of ONE man performing ONE reverse lunge, drawn as a sheet of sixteen sequential keyframes of the movement in one direction.

The man: an Asian man in his late 20s, lean athletic build, short neat black hair, clean-shaven, calm neutral face, wearing a fitted teal short-sleeve athletic t-shirt, black athletic shorts ending 10 cm above the knee, a black smartwatch on the wrist, and white running shoes with orange accents. No green anywhere on the character. He is drawn identically in every panel: same face, same hair, same clothes, same proportions, same size. If a character reference image is attached, draw exactly that man.

Layout: ONE square image (1:1) containing a 4x4 grid of sixteen equal square panels, read left to right and top to bottom (panel 1 top-left, panel 16 bottom-right), separated by thin straight white lines. Nothing crosses the white lines. No text, no numbers, no labels, no arrows, no frames.

Camera (identical in all sixteen panels): exact side profile, he faces the RIGHT edge of the panel and the camera sees his right side (the right arm and right leg are the near limbs), the camera is at hip height, orthographic, no perspective, no tilt, no zoom. His front foot stays at exactly the same spot in every panel. He is the same size in every panel, about 80 percent of the panel height, centered, with clear margin on every side. Background in every panel: transparent. If transparency is not possible, one perfectly flat solid chroma key green (#00B140). No floor line, no horizon, no scenery, no shadow on the ground.

Setup (all panels): Hands on his hips. The far (left) foot is the FRONT foot and never moves. The near (right) foot steps straight BACK; once it lands only the toes touch the floor and the heel stays raised. Torso always vertical, pelvis level.

Keyframes: panel 1 is the start position and panel 16 is the end position. Panels 2 to 15 are equal, evenly spaced in-between steps, so each panel changes only a little from the one before. Do not draw the return movement. Measurements (angles in degrees): step length is measured from the front heel to the back toes; knee angle is the inside angle of the knee joint; back knee height is measured from the floor.
Panel 1: start, standing tall, feet hip-width apart side by side, legs straight: step length 0 cm, front knee 175, back knee 175, back knee height 50 cm.
Panel 2: step length 6 cm, front knee 169, back knee 169, back knee height 47 cm.
Panel 3: step length 11 cm, front knee 164, back knee 164, back knee height 44 cm.
Panel 4: step length 17 cm, front knee 158, back knee 158, back knee height 41 cm.
Panel 5: step length 23 cm, front knee 152, back knee 152, back knee height 37 cm.
Panel 6: step length 28 cm, front knee 147, back knee 147, back knee height 34 cm.
Panel 7: step length 34 cm, front knee 141, back knee 141, back knee height 31 cm.
Panel 8: step length 40 cm, front knee 135, back knee 135, back knee height 28 cm.
Panel 9: step length 45 cm, front knee 130, back knee 130, back knee height 25 cm.
Panel 10: step length 51 cm, front knee 124, back knee 124, back knee height 22 cm.
Panel 11: step length 57 cm, front knee 118, back knee 118, back knee height 19 cm.
Panel 12: step length 62 cm, front knee 113, back knee 113, back knee height 16 cm.
Panel 13: step length 68 cm, front knee 107, back knee 107, back knee height 12 cm.
Panel 14: step length 74 cm, front knee 101, back knee 101, back knee height 9 cm.
Panel 15: step length 79 cm, front knee 96, back knee 96, back knee height 6 cm.
Panel 16: end, step length 85 cm, front knee 90, back knee 90, back knee height 3 cm. Lowest point: front thigh parallel to the floor with the shin vertical and the knee above the ankle, back thigh vertical, back knee hovering just above the floor, back heel raised, torso upright.
```

### Prompt wanita (`reverse_lunge-f`)

```text
Clean flat-color vector-style illustration (anime cel-shading, solid color fills, crisp uniform dark outlines, at most 2 to 3 tones per color, no gradients, no textures, no blur, no photorealism) of ONE woman performing ONE reverse lunge, drawn as a sheet of sixteen sequential keyframes of the movement in one direction.

The woman: an Asian woman in her late 20s, lean athletic build, long black hair tied in a high ponytail, calm neutral face, wearing a fitted teal short-sleeve athletic t-shirt (not cropped), black athletic shorts ending 10 cm above the knee, a black smartwatch on the wrist, and white running shoes with orange accents. No green anywhere on the character. She is drawn identically in every panel: same face, same hair, same clothes, same proportions, same size. If a character reference image is attached, draw exactly that woman.

Layout: ONE square image (1:1) containing a 4x4 grid of sixteen equal square panels, read left to right and top to bottom (panel 1 top-left, panel 16 bottom-right), separated by thin straight white lines. Nothing crosses the white lines. No text, no numbers, no labels, no arrows, no frames.

Camera (identical in all sixteen panels): exact side profile, she faces the RIGHT edge of the panel and the camera sees her right side (the right arm and right leg are the near limbs), the camera is at hip height, orthographic, no perspective, no tilt, no zoom. Her front foot stays at exactly the same spot in every panel. She is the same size in every panel, about 80 percent of the panel height, centered, with clear margin on every side. Background in every panel: transparent. If transparency is not possible, one perfectly flat solid chroma key green (#00B140). No floor line, no horizon, no scenery, no shadow on the ground.

Setup (all panels): Hands on her hips. The far (left) foot is the FRONT foot and never moves. The near (right) foot steps straight BACK; once it lands only the toes touch the floor and the heel stays raised. Torso always vertical, pelvis level.

Keyframes: panel 1 is the start position and panel 16 is the end position. Panels 2 to 15 are equal, evenly spaced in-between steps, so each panel changes only a little from the one before. Do not draw the return movement. Measurements (angles in degrees): step length is measured from the front heel to the back toes; knee angle is the inside angle of the knee joint; back knee height is measured from the floor.
Panel 1: start, standing tall, feet hip-width apart side by side, legs straight: step length 0 cm, front knee 175, back knee 175, back knee height 50 cm.
Panel 2: step length 6 cm, front knee 169, back knee 169, back knee height 47 cm.
Panel 3: step length 11 cm, front knee 164, back knee 164, back knee height 44 cm.
Panel 4: step length 17 cm, front knee 158, back knee 158, back knee height 41 cm.
Panel 5: step length 23 cm, front knee 152, back knee 152, back knee height 37 cm.
Panel 6: step length 28 cm, front knee 147, back knee 147, back knee height 34 cm.
Panel 7: step length 34 cm, front knee 141, back knee 141, back knee height 31 cm.
Panel 8: step length 40 cm, front knee 135, back knee 135, back knee height 28 cm.
Panel 9: step length 45 cm, front knee 130, back knee 130, back knee height 25 cm.
Panel 10: step length 51 cm, front knee 124, back knee 124, back knee height 22 cm.
Panel 11: step length 57 cm, front knee 118, back knee 118, back knee height 19 cm.
Panel 12: step length 62 cm, front knee 113, back knee 113, back knee height 16 cm.
Panel 13: step length 68 cm, front knee 107, back knee 107, back knee height 12 cm.
Panel 14: step length 74 cm, front knee 101, back knee 101, back knee height 9 cm.
Panel 15: step length 79 cm, front knee 96, back knee 96, back knee height 6 cm.
Panel 16: end, step length 85 cm, front knee 90, back knee 90, back knee height 3 cm. Lowest point: front thigh parallel to the floor with the shin vertical and the knee above the ankle, back thigh vertical, back knee hovering just above the floor, back heel raised, torso upright.
```

### Prompt negatif (pria dan wanita)

```text
photograph, photorealistic, 3D render, gradient, texture, blur, text, numbers, labels, arrows, watermark, logo, extra people, different person between panels, different face between panels, different hair between panels, different clothes between panels, different size between panels, different camera angle between panels, panels out of order, perspective, scenery, floor line, shadow on the floor, green clothing, extra limbs, distorted hands, distorted feet, three-quarter view, front view, back view, front foot moving, torso leaning forward, front knee past the toes, back knee touching the floor, stepping sideways
```

**Periksa:** Kaki depan tidak pindah, badan tegak, lutut belakang hampir menyentuh lantai di panel 16. Panel 1 sampai 16 berubah sedikit demi sedikit, tidak ada panel yang melompat atau terbalik urutannya.

---

## 8. Step-up (`step_up`)

**Cue di app:** Naik ke anak tangga atau bangku dengan satu kaki, dorong sampai lurus. Turun pelan dengan kaki yang sama.

### Prompt pria (`step_up-m`)

```text
Clean flat-color vector-style illustration (anime cel-shading, solid color fills, crisp uniform dark outlines, at most 2 to 3 tones per color, no gradients, no textures, no blur, no photorealism) of ONE man performing ONE step-up onto a box, drawn as a sheet of sixteen sequential keyframes of the movement in one direction.

The man: an Asian man in his late 20s, lean athletic build, short neat black hair, clean-shaven, calm neutral face, wearing a fitted teal short-sleeve athletic t-shirt, black athletic shorts ending 10 cm above the knee, a black smartwatch on the wrist, and white running shoes with orange accents. No green anywhere on the character. He is drawn identically in every panel: same face, same hair, same clothes, same proportions, same size. If a character reference image is attached, draw exactly that man.

Layout: ONE square image (1:1) containing a 4x4 grid of sixteen equal square panels, read left to right and top to bottom (panel 1 top-left, panel 16 bottom-right), separated by thin straight white lines. Nothing crosses the white lines. No text, no numbers, no labels, no arrows, no frames.

Camera (identical in all sixteen panels): exact side profile, he faces the RIGHT edge of the panel and the camera sees his right side (the right arm and right leg are the near limbs), the camera is at hip height, orthographic, no perspective, no tilt, no zoom. The box and his near foot on the box stay at exactly the same spot in every panel. He is the same size in every panel, about 80 percent of the panel height, centered, with clear margin on every side. Background in every panel: transparent. If transparency is not possible, one perfectly flat solid chroma key green (#00B140). No floor line, no horizon, no scenery, no shadow on the ground. A plain flat dark grey box about 40 cm high and 50 cm long stands on the RIGHT side of the panel in front of him; it is the only prop. Any prop is a plain flat dark grey (#3A3A3C) shape with no logo, no texture and no green.

Setup (all panels): The near (right) foot is the working foot and stays flat on top of the box. The far (left) foot starts flat on the floor behind the box and is lifted as he rises. Hands on his hips, torso upright, pelvis level.

Keyframes: panel 1 is the start position and panel 16 is the end position. Panels 2 to 15 are equal, evenly spaced in-between steps, so each panel changes only a little from the one before. Do not draw the return movement. Measurements (angles in degrees): near knee is the inside angle of the knee joint; far foot height is measured from the floor; far thigh angle is measured forward from hanging straight down.
Panel 1: start, the near foot on the box with the knee bent, the far foot flat on the floor behind the box: near knee 100, far foot height 0 cm, far thigh 0.
Panel 2: near knee 105, far foot height 5 cm, far thigh 6.
Panel 3: near knee 111, far foot height 9 cm, far thigh 12.
Panel 4: near knee 116, far foot height 14 cm, far thigh 18.
Panel 5: near knee 121, far foot height 19 cm, far thigh 24.
Panel 6: near knee 127, far foot height 23 cm, far thigh 30.
Panel 7: near knee 132, far foot height 28 cm, far thigh 36.
Panel 8: near knee 137, far foot height 33 cm, far thigh 42.
Panel 9: near knee 143, far foot height 37 cm, far thigh 48.
Panel 10: near knee 148, far foot height 42 cm, far thigh 54.
Panel 11: near knee 153, far foot height 47 cm, far thigh 60.
Panel 12: near knee 159, far foot height 51 cm, far thigh 66.
Panel 13: near knee 164, far foot height 56 cm, far thigh 72.
Panel 14: near knee 169, far foot height 61 cm, far thigh 78.
Panel 15: near knee 175, far foot height 65 cm, far thigh 84.
Panel 16: end, near knee 180, far foot height 70 cm, far thigh 90. Top: standing tall on the box on the straight near leg, far knee raised to hip height with the shin hanging down, the far foot touching nothing.
```

### Prompt wanita (`step_up-f`)

```text
Clean flat-color vector-style illustration (anime cel-shading, solid color fills, crisp uniform dark outlines, at most 2 to 3 tones per color, no gradients, no textures, no blur, no photorealism) of ONE woman performing ONE step-up onto a box, drawn as a sheet of sixteen sequential keyframes of the movement in one direction.

The woman: an Asian woman in her late 20s, lean athletic build, long black hair tied in a high ponytail, calm neutral face, wearing a fitted teal short-sleeve athletic t-shirt (not cropped), black athletic shorts ending 10 cm above the knee, a black smartwatch on the wrist, and white running shoes with orange accents. No green anywhere on the character. She is drawn identically in every panel: same face, same hair, same clothes, same proportions, same size. If a character reference image is attached, draw exactly that woman.

Layout: ONE square image (1:1) containing a 4x4 grid of sixteen equal square panels, read left to right and top to bottom (panel 1 top-left, panel 16 bottom-right), separated by thin straight white lines. Nothing crosses the white lines. No text, no numbers, no labels, no arrows, no frames.

Camera (identical in all sixteen panels): exact side profile, she faces the RIGHT edge of the panel and the camera sees her right side (the right arm and right leg are the near limbs), the camera is at hip height, orthographic, no perspective, no tilt, no zoom. The box and her near foot on the box stay at exactly the same spot in every panel. She is the same size in every panel, about 80 percent of the panel height, centered, with clear margin on every side. Background in every panel: transparent. If transparency is not possible, one perfectly flat solid chroma key green (#00B140). No floor line, no horizon, no scenery, no shadow on the ground. A plain flat dark grey box about 40 cm high and 50 cm long stands on the RIGHT side of the panel in front of her; it is the only prop. Any prop is a plain flat dark grey (#3A3A3C) shape with no logo, no texture and no green.

Setup (all panels): The near (right) foot is the working foot and stays flat on top of the box. The far (left) foot starts flat on the floor behind the box and is lifted as she rises. Hands on her hips, torso upright, pelvis level.

Keyframes: panel 1 is the start position and panel 16 is the end position. Panels 2 to 15 are equal, evenly spaced in-between steps, so each panel changes only a little from the one before. Do not draw the return movement. Measurements (angles in degrees): near knee is the inside angle of the knee joint; far foot height is measured from the floor; far thigh angle is measured forward from hanging straight down.
Panel 1: start, the near foot on the box with the knee bent, the far foot flat on the floor behind the box: near knee 100, far foot height 0 cm, far thigh 0.
Panel 2: near knee 105, far foot height 5 cm, far thigh 6.
Panel 3: near knee 111, far foot height 9 cm, far thigh 12.
Panel 4: near knee 116, far foot height 14 cm, far thigh 18.
Panel 5: near knee 121, far foot height 19 cm, far thigh 24.
Panel 6: near knee 127, far foot height 23 cm, far thigh 30.
Panel 7: near knee 132, far foot height 28 cm, far thigh 36.
Panel 8: near knee 137, far foot height 33 cm, far thigh 42.
Panel 9: near knee 143, far foot height 37 cm, far thigh 48.
Panel 10: near knee 148, far foot height 42 cm, far thigh 54.
Panel 11: near knee 153, far foot height 47 cm, far thigh 60.
Panel 12: near knee 159, far foot height 51 cm, far thigh 66.
Panel 13: near knee 164, far foot height 56 cm, far thigh 72.
Panel 14: near knee 169, far foot height 61 cm, far thigh 78.
Panel 15: near knee 175, far foot height 65 cm, far thigh 84.
Panel 16: end, near knee 180, far foot height 70 cm, far thigh 90. Top: standing tall on the box on the straight near leg, far knee raised to hip height with the shin hanging down, the far foot touching nothing.
```

### Prompt negatif (pria dan wanita)

```text
photograph, photorealistic, 3D render, gradient, texture, blur, text, numbers, labels, arrows, watermark, logo, extra people, different person between panels, different face between panels, different hair between panels, different clothes between panels, different size between panels, different camera angle between panels, panels out of order, perspective, scenery, floor line, shadow on the floor, green clothing, extra limbs, distorted hands, distorted feet, three-quarter view, front view, back view, pushing off the back foot, knee caving inward, leaning far forward, near foot moving on the box, jumping
```

**Periksa:** Kaki kerja tetap di kotak, lurus penuh di panel 16, badan tegak. Panel 1 sampai 16 berubah sedikit demi sedikit, tidak ada panel yang melompat atau terbalik urutannya.

---

## 9. Calf raise (`calf_raise`)

**Cue di app:** Berdiri di ujung kaki, naik setinggi mungkin, tahan 1 detik, turun pelan.

### Prompt pria (`calf_raise-m`)

```text
Clean flat-color vector-style illustration (anime cel-shading, solid color fills, crisp uniform dark outlines, at most 2 to 3 tones per color, no gradients, no textures, no blur, no photorealism) of ONE man performing ONE standing calf raise, drawn as a sheet of sixteen sequential keyframes of the movement in one direction.

The man: an Asian man in his late 20s, lean athletic build, short neat black hair, clean-shaven, calm neutral face, wearing a fitted teal short-sleeve athletic t-shirt, black athletic shorts ending 10 cm above the knee, a black smartwatch on the wrist, and white running shoes with orange accents. No green anywhere on the character. He is drawn identically in every panel: same face, same hair, same clothes, same proportions, same size. If a character reference image is attached, draw exactly that man.

Layout: ONE square image (1:1) containing a 4x4 grid of sixteen equal square panels, read left to right and top to bottom (panel 1 top-left, panel 16 bottom-right), separated by thin straight white lines. Nothing crosses the white lines. No text, no numbers, no labels, no arrows, no frames.

Camera (identical in all sixteen panels): exact side profile, he faces the RIGHT edge of the panel and the camera sees his right side (the right arm and right leg are the near limbs), the camera is at hip height, orthographic, no perspective, no tilt, no zoom. His toes stay at exactly the same spot in every panel. He is the same size in every panel, about 80 percent of the panel height, centered, with clear margin on every side. Background in every panel: transparent. If transparency is not possible, one perfectly flat solid chroma key green (#00B140). No floor line, no horizon, no scenery, no shadow on the ground.

Setup (all panels): Feet hip-width apart and parallel, hands on his hips, legs straight, torso tall and vertical. Only the heels and ankles move.

Keyframes: panel 1 is the start position and panel 16 is the end position. Panels 2 to 15 are equal, evenly spaced in-between steps, so each panel changes only a little from the one before. Do not draw the return movement. Measurements (angles in degrees): heel height is measured from the floor.
Panel 1: start, standing tall, both feet flat: heel height 0 cm.
Panel 2: heel height 1 cm.
Panel 3: heel height 2 cm.
Panel 4: heel height 3 cm.
Panel 5: heel height 4 cm.
Panel 6: heel height 5 cm.
Panel 7: heel height 6 cm.
Panel 8: heel height 7 cm.
Panel 9: heel height 8 cm.
Panel 10: heel height 9 cm.
Panel 11: heel height 10 cm.
Panel 12: heel height 11 cm.
Panel 13: heel height 12 cm.
Panel 14: heel height 13 cm.
Panel 15: heel height 14 cm.
Panel 16: end, heel height 15 cm. Top: on the balls of both feet as high as possible, ankles fully extended, knees straight, body tall, hips over the balls of the feet.
```

### Prompt wanita (`calf_raise-f`)

```text
Clean flat-color vector-style illustration (anime cel-shading, solid color fills, crisp uniform dark outlines, at most 2 to 3 tones per color, no gradients, no textures, no blur, no photorealism) of ONE woman performing ONE standing calf raise, drawn as a sheet of sixteen sequential keyframes of the movement in one direction.

The woman: an Asian woman in her late 20s, lean athletic build, long black hair tied in a high ponytail, calm neutral face, wearing a fitted teal short-sleeve athletic t-shirt (not cropped), black athletic shorts ending 10 cm above the knee, a black smartwatch on the wrist, and white running shoes with orange accents. No green anywhere on the character. She is drawn identically in every panel: same face, same hair, same clothes, same proportions, same size. If a character reference image is attached, draw exactly that woman.

Layout: ONE square image (1:1) containing a 4x4 grid of sixteen equal square panels, read left to right and top to bottom (panel 1 top-left, panel 16 bottom-right), separated by thin straight white lines. Nothing crosses the white lines. No text, no numbers, no labels, no arrows, no frames.

Camera (identical in all sixteen panels): exact side profile, she faces the RIGHT edge of the panel and the camera sees her right side (the right arm and right leg are the near limbs), the camera is at hip height, orthographic, no perspective, no tilt, no zoom. Her toes stay at exactly the same spot in every panel. She is the same size in every panel, about 80 percent of the panel height, centered, with clear margin on every side. Background in every panel: transparent. If transparency is not possible, one perfectly flat solid chroma key green (#00B140). No floor line, no horizon, no scenery, no shadow on the ground.

Setup (all panels): Feet hip-width apart and parallel, hands on her hips, legs straight, torso tall and vertical. Only the heels and ankles move.

Keyframes: panel 1 is the start position and panel 16 is the end position. Panels 2 to 15 are equal, evenly spaced in-between steps, so each panel changes only a little from the one before. Do not draw the return movement. Measurements (angles in degrees): heel height is measured from the floor.
Panel 1: start, standing tall, both feet flat: heel height 0 cm.
Panel 2: heel height 1 cm.
Panel 3: heel height 2 cm.
Panel 4: heel height 3 cm.
Panel 5: heel height 4 cm.
Panel 6: heel height 5 cm.
Panel 7: heel height 6 cm.
Panel 8: heel height 7 cm.
Panel 9: heel height 8 cm.
Panel 10: heel height 9 cm.
Panel 11: heel height 10 cm.
Panel 12: heel height 11 cm.
Panel 13: heel height 12 cm.
Panel 14: heel height 13 cm.
Panel 15: heel height 14 cm.
Panel 16: end, heel height 15 cm. Top: on the balls of both feet as high as possible, ankles fully extended, knees straight, body tall, hips over the balls of the feet.
```

### Prompt negatif (pria dan wanita)

```text
photograph, photorealistic, 3D render, gradient, texture, blur, text, numbers, labels, arrows, watermark, logo, extra people, different person between panels, different face between panels, different hair between panels, different clothes between panels, different size between panels, different camera angle between panels, panels out of order, perspective, scenery, floor line, shadow on the floor, green clothing, extra limbs, distorted hands, distorted feet, three-quarter view, front view, back view, bent knees, leaning forward, leaning back, rolling onto the outside of the feet, jumping
```

**Periksa:** Tumit naik bertahap tiap panel, lutut lurus, badan tidak condong. Panel 1 sampai 16 berubah sedikit demi sedikit, tidak ada panel yang melompat atau terbalik urutannya.

---

## 10. Single-leg calf raise (`single_leg_calf_raise`)

**Cue di app:** Seperti calf raise dengan satu kaki. Pegang dinding untuk keseimbangan.

### Prompt pria (`single_leg_calf_raise-m`)

```text
Clean flat-color vector-style illustration (anime cel-shading, solid color fills, crisp uniform dark outlines, at most 2 to 3 tones per color, no gradients, no textures, no blur, no photorealism) of ONE man performing ONE single-leg calf raise, drawn as a sheet of sixteen sequential keyframes of the movement in one direction.

The man: an Asian man in his late 20s, lean athletic build, short neat black hair, clean-shaven, calm neutral face, wearing a fitted teal short-sleeve athletic t-shirt, black athletic shorts ending 10 cm above the knee, a black smartwatch on the wrist, and white running shoes with orange accents. No green anywhere on the character. He is drawn identically in every panel: same face, same hair, same clothes, same proportions, same size. If a character reference image is attached, draw exactly that man.

Layout: ONE square image (1:1) containing a 4x4 grid of sixteen equal square panels, read left to right and top to bottom (panel 1 top-left, panel 16 bottom-right), separated by thin straight white lines. Nothing crosses the white lines. No text, no numbers, no labels, no arrows, no frames.

Camera (identical in all sixteen panels): exact side profile, he faces the RIGHT edge of the panel and the camera sees his right side (the right arm and right leg are the near limbs), the camera is at hip height, orthographic, no perspective, no tilt, no zoom. His near toes and the wall panel stay at exactly the same spots in every panel. He is the same size in every panel, about 80 percent of the panel height, centered, with clear margin on every side. Background in every panel: transparent. If transparency is not possible, one perfectly flat solid chroma key green (#00B140). No floor line, no horizon, no scenery, no shadow on the ground. A plain flat dark grey vertical wall panel about 1.4 m tall stands at the RIGHT edge of the panel in front of him, used only for balance; it is the only prop. Any prop is a plain flat dark grey (#3A3A3C) shape with no logo, no texture and no green.

Setup (all panels): He stands on the near (right) leg only. The far (left) knee is bent about 90 degrees with the foot raised behind, touching nothing. The near fingertips rest lightly on the wall panel at shoulder height, for balance only. Standing leg straight, torso tall and vertical.

Keyframes: panel 1 is the start position and panel 16 is the end position. Panels 2 to 15 are equal, evenly spaced in-between steps, so each panel changes only a little from the one before. Do not draw the return movement. Measurements (angles in degrees): heel height is measured from the floor.
Panel 1: start, standing tall on the near foot flat: near heel height 0 cm.
Panel 2: near heel height 1 cm.
Panel 3: near heel height 2 cm.
Panel 4: near heel height 3 cm.
Panel 5: near heel height 4 cm.
Panel 6: near heel height 5 cm.
Panel 7: near heel height 6 cm.
Panel 8: near heel height 7 cm.
Panel 9: near heel height 8 cm.
Panel 10: near heel height 9 cm.
Panel 11: near heel height 10 cm.
Panel 12: near heel height 11 cm.
Panel 13: near heel height 12 cm.
Panel 14: near heel height 13 cm.
Panel 15: near heel height 14 cm.
Panel 16: end, near heel height 15 cm. Top: on the ball of the near foot as high as possible, ankle fully extended, knee straight, body tall.
```

### Prompt wanita (`single_leg_calf_raise-f`)

```text
Clean flat-color vector-style illustration (anime cel-shading, solid color fills, crisp uniform dark outlines, at most 2 to 3 tones per color, no gradients, no textures, no blur, no photorealism) of ONE woman performing ONE single-leg calf raise, drawn as a sheet of sixteen sequential keyframes of the movement in one direction.

The woman: an Asian woman in her late 20s, lean athletic build, long black hair tied in a high ponytail, calm neutral face, wearing a fitted teal short-sleeve athletic t-shirt (not cropped), black athletic shorts ending 10 cm above the knee, a black smartwatch on the wrist, and white running shoes with orange accents. No green anywhere on the character. She is drawn identically in every panel: same face, same hair, same clothes, same proportions, same size. If a character reference image is attached, draw exactly that woman.

Layout: ONE square image (1:1) containing a 4x4 grid of sixteen equal square panels, read left to right and top to bottom (panel 1 top-left, panel 16 bottom-right), separated by thin straight white lines. Nothing crosses the white lines. No text, no numbers, no labels, no arrows, no frames.

Camera (identical in all sixteen panels): exact side profile, she faces the RIGHT edge of the panel and the camera sees her right side (the right arm and right leg are the near limbs), the camera is at hip height, orthographic, no perspective, no tilt, no zoom. Her near toes and the wall panel stay at exactly the same spots in every panel. She is the same size in every panel, about 80 percent of the panel height, centered, with clear margin on every side. Background in every panel: transparent. If transparency is not possible, one perfectly flat solid chroma key green (#00B140). No floor line, no horizon, no scenery, no shadow on the ground. A plain flat dark grey vertical wall panel about 1.4 m tall stands at the RIGHT edge of the panel in front of her, used only for balance; it is the only prop. Any prop is a plain flat dark grey (#3A3A3C) shape with no logo, no texture and no green.

Setup (all panels): She stands on the near (right) leg only. The far (left) knee is bent about 90 degrees with the foot raised behind, touching nothing. The near fingertips rest lightly on the wall panel at shoulder height, for balance only. Standing leg straight, torso tall and vertical.

Keyframes: panel 1 is the start position and panel 16 is the end position. Panels 2 to 15 are equal, evenly spaced in-between steps, so each panel changes only a little from the one before. Do not draw the return movement. Measurements (angles in degrees): heel height is measured from the floor.
Panel 1: start, standing tall on the near foot flat: near heel height 0 cm.
Panel 2: near heel height 1 cm.
Panel 3: near heel height 2 cm.
Panel 4: near heel height 3 cm.
Panel 5: near heel height 4 cm.
Panel 6: near heel height 5 cm.
Panel 7: near heel height 6 cm.
Panel 8: near heel height 7 cm.
Panel 9: near heel height 8 cm.
Panel 10: near heel height 9 cm.
Panel 11: near heel height 10 cm.
Panel 12: near heel height 11 cm.
Panel 13: near heel height 12 cm.
Panel 14: near heel height 13 cm.
Panel 15: near heel height 14 cm.
Panel 16: end, near heel height 15 cm. Top: on the ball of the near foot as high as possible, ankle fully extended, knee straight, body tall.
```

### Prompt negatif (pria dan wanita)

```text
photograph, photorealistic, 3D render, gradient, texture, blur, text, numbers, labels, arrows, watermark, logo, extra people, different person between panels, different face between panels, different hair between panels, different clothes between panels, different size between panels, different camera angle between panels, panels out of order, perspective, scenery, floor line, shadow on the floor, green clothing, extra limbs, distorted hands, distorted feet, three-quarter view, front view, back view, bent standing knee, far foot touching the floor, leaning on the wall, pushing with the hand, leaning forward
```

**Periksa:** Hanya satu kaki di lantai, jari menyentuh dinding ringan, tumit naik bertahap. Panel 1 sampai 16 berubah sedikit demi sedikit, tidak ada panel yang melompat atau terbalik urutannya.

---

## 11. Plank (`plank`)

**Cue di app:** Bertumpu lengan bawah dan ujung kaki. Badan lurus dari kepala ke tumit, perut dikencangkan.

### Prompt pria (`plank-m`)

```text
Clean flat-color vector-style illustration (anime cel-shading, solid color fills, crisp uniform dark outlines, at most 2 to 3 tones per color, no gradients, no textures, no blur, no photorealism) of ONE man performing ONE forearm plank, drawn as a sheet of sixteen sequential keyframes of the movement in one direction.

The man: an Asian man in his late 20s, lean athletic build, short neat black hair, clean-shaven, calm neutral face, wearing a fitted teal short-sleeve athletic t-shirt, black athletic shorts ending 10 cm above the knee, a black smartwatch on the wrist, and white running shoes with orange accents. No green anywhere on the character. He is drawn identically in every panel: same face, same hair, same clothes, same proportions, same size. If a character reference image is attached, draw exactly that man.

Layout: ONE square image (1:1) containing a 4x4 grid of sixteen equal square panels, read left to right and top to bottom (panel 1 top-left, panel 16 bottom-right), separated by thin straight white lines. Nothing crosses the white lines. No text, no numbers, no labels, no arrows, no frames.

Camera (identical in all sixteen panels): exact side profile at low height, he faces the RIGHT edge of the panel and the camera sees his right side (the right arm and right leg are the near limbs), orthographic, no perspective, no tilt, no zoom. His forearms and toes stay at exactly the same spots in every panel. He is the same size in every panel, the body about 85 percent of the panel width, with clear margin on every side. Background in every panel: transparent. If transparency is not possible, one perfectly flat solid chroma key green (#00B140). No floor line, no horizon, no scenery, no shadow on the ground.

Setup (all panels): Forearms flat on the floor, parallel and pointing forward, elbows directly below the shoulders. Toes on the floor. Head neutral, eyes on the floor just ahead of the hands. He lifts from a knee plank into a full plank.

Keyframes: panel 1 is the start position and panel 16 is the end position. Panels 2 to 15 are equal, evenly spaced in-between steps, so each panel changes only a little from the one before. Do not draw the return movement. Measurements (angles in degrees): knee angle is the inside angle of the knee joint; knee height is measured from the floor.
Panel 1: start, knee plank: forearms, knees and toes on the floor, body straight from the head to the knees: knees 140, knee height 0 cm.
Panel 2: knees 143, knee height 1 cm.
Panel 3: knees 145, knee height 2 cm.
Panel 4: knees 148, knee height 4 cm.
Panel 5: knees 151, knee height 5 cm.
Panel 6: knees 153, knee height 6 cm.
Panel 7: knees 156, knee height 7 cm.
Panel 8: knees 159, knee height 8 cm.
Panel 9: knees 161, knee height 10 cm.
Panel 10: knees 164, knee height 11 cm.
Panel 11: knees 167, knee height 12 cm.
Panel 12: knees 169, knee height 13 cm.
Panel 13: knees 172, knee height 14 cm.
Panel 14: knees 175, knee height 16 cm.
Panel 15: knees 177, knee height 17 cm.
Panel 16: end, knees 180, knee height 18 cm. Full forearm plank: knees off the floor, body one straight line from the back of the head to the heels, hips neither sagging nor piking, abs and glutes braced.
```

### Prompt wanita (`plank-f`)

```text
Clean flat-color vector-style illustration (anime cel-shading, solid color fills, crisp uniform dark outlines, at most 2 to 3 tones per color, no gradients, no textures, no blur, no photorealism) of ONE woman performing ONE forearm plank, drawn as a sheet of sixteen sequential keyframes of the movement in one direction.

The woman: an Asian woman in her late 20s, lean athletic build, long black hair tied in a high ponytail, calm neutral face, wearing a fitted teal short-sleeve athletic t-shirt (not cropped), black athletic shorts ending 10 cm above the knee, a black smartwatch on the wrist, and white running shoes with orange accents. No green anywhere on the character. She is drawn identically in every panel: same face, same hair, same clothes, same proportions, same size. If a character reference image is attached, draw exactly that woman.

Layout: ONE square image (1:1) containing a 4x4 grid of sixteen equal square panels, read left to right and top to bottom (panel 1 top-left, panel 16 bottom-right), separated by thin straight white lines. Nothing crosses the white lines. No text, no numbers, no labels, no arrows, no frames.

Camera (identical in all sixteen panels): exact side profile at low height, she faces the RIGHT edge of the panel and the camera sees her right side (the right arm and right leg are the near limbs), orthographic, no perspective, no tilt, no zoom. Her forearms and toes stay at exactly the same spots in every panel. She is the same size in every panel, the body about 85 percent of the panel width, with clear margin on every side. Background in every panel: transparent. If transparency is not possible, one perfectly flat solid chroma key green (#00B140). No floor line, no horizon, no scenery, no shadow on the ground.

Setup (all panels): Forearms flat on the floor, parallel and pointing forward, elbows directly below the shoulders. Toes on the floor. Head neutral, eyes on the floor just ahead of the hands. She lifts from a knee plank into a full plank.

Keyframes: panel 1 is the start position and panel 16 is the end position. Panels 2 to 15 are equal, evenly spaced in-between steps, so each panel changes only a little from the one before. Do not draw the return movement. Measurements (angles in degrees): knee angle is the inside angle of the knee joint; knee height is measured from the floor.
Panel 1: start, knee plank: forearms, knees and toes on the floor, body straight from the head to the knees: knees 140, knee height 0 cm.
Panel 2: knees 143, knee height 1 cm.
Panel 3: knees 145, knee height 2 cm.
Panel 4: knees 148, knee height 4 cm.
Panel 5: knees 151, knee height 5 cm.
Panel 6: knees 153, knee height 6 cm.
Panel 7: knees 156, knee height 7 cm.
Panel 8: knees 159, knee height 8 cm.
Panel 9: knees 161, knee height 10 cm.
Panel 10: knees 164, knee height 11 cm.
Panel 11: knees 167, knee height 12 cm.
Panel 12: knees 169, knee height 13 cm.
Panel 13: knees 172, knee height 14 cm.
Panel 14: knees 175, knee height 16 cm.
Panel 15: knees 177, knee height 17 cm.
Panel 16: end, knees 180, knee height 18 cm. Full forearm plank: knees off the floor, body one straight line from the back of the head to the heels, hips neither sagging nor piking, abs and glutes braced.
```

### Prompt negatif (pria dan wanita)

```text
photograph, photorealistic, 3D render, gradient, texture, blur, text, numbers, labels, arrows, watermark, logo, extra people, different person between panels, different face between panels, different hair between panels, different clothes between panels, different size between panels, different camera angle between panels, panels out of order, perspective, scenery, floor line, shadow on the floor, green clothing, extra limbs, distorted hands, distorted feet, three-quarter view, view from above, hips sagging, hips piking up, rounded back, head dropping, elbows in front of the shoulders, hands clasped
```

**Periksa:** Panel 16 lurus dari kepala ke tumit, siku di bawah bahu, pinggul tidak turun atau naik. Panel 1 sampai 16 berubah sedikit demi sedikit, tidak ada panel yang melompat atau terbalik urutannya.

---

## 12. Side plank (`side_plank`)

**Cue di app:** Bertumpu satu lengan bawah, badan miring dan lurus. Pinggul jangan turun.

### Prompt pria (`side_plank-m`)

```text
Clean flat-color vector-style illustration (anime cel-shading, solid color fills, crisp uniform dark outlines, at most 2 to 3 tones per color, no gradients, no textures, no blur, no photorealism) of ONE man performing ONE side plank on the forearm, drawn as a sheet of sixteen sequential keyframes of the movement in one direction.

The man: an Asian man in his late 20s, lean athletic build, short neat black hair, clean-shaven, calm neutral face, wearing a fitted teal short-sleeve athletic t-shirt, black athletic shorts ending 10 cm above the knee, a black smartwatch on the wrist, and white running shoes with orange accents. No green anywhere on the character. He is drawn identically in every panel: same face, same hair, same clothes, same proportions, same size. If a character reference image is attached, draw exactly that man.

Layout: ONE square image (1:1) containing a 4x4 grid of sixteen equal square panels, read left to right and top to bottom (panel 1 top-left, panel 16 bottom-right), separated by thin straight white lines. Nothing crosses the white lines. No text, no numbers, no labels, no arrows, no frames.

Camera (identical in all sixteen panels): front view, the camera faces his chest squarely; his body lies horizontally across the panel with the head toward the LEFT edge and the feet toward the RIGHT edge, resting on his right side, orthographic, no perspective, no tilt, no zoom. His right forearm and feet stay at exactly the same spots in every panel. He is the same size in every panel, the body about 85 percent of the panel width, with clear margin on every side. Background in every panel: transparent. If transparency is not possible, one perfectly flat solid chroma key green (#00B140). No floor line, no horizon, no scenery, no shadow on the ground.

Setup (all panels): He lies on his right side with the legs straight and stacked. The right forearm lies flat on the floor with the elbow directly below the right shoulder. The left hand rests on the left hip. The chest faces the camera, no rotation.

Keyframes: panel 1 is the start position and panel 16 is the end position. Panels 2 to 15 are equal, evenly spaced in-between steps, so each panel changes only a little from the one before. Do not draw the return movement. Measurements (angles in degrees): hip height is the gap between the hips and the floor.
Panel 1: start, lying on his right side, hips resting on the floor: hip height 0 cm.
Panel 2: hip height 1 cm.
Panel 3: hip height 3 cm.
Panel 4: hip height 4 cm.
Panel 5: hip height 6 cm.
Panel 6: hip height 7 cm.
Panel 7: hip height 9 cm.
Panel 8: hip height 10 cm.
Panel 9: hip height 12 cm.
Panel 10: hip height 13 cm.
Panel 11: hip height 15 cm.
Panel 12: hip height 16 cm.
Panel 13: hip height 18 cm.
Panel 14: hip height 19 cm.
Panel 15: hip height 21 cm.
Panel 16: end, hip height 22 cm. Top: body one straight line from the head through the hips to the stacked feet, hips lifted and not dropping, neck neutral.
```

### Prompt wanita (`side_plank-f`)

```text
Clean flat-color vector-style illustration (anime cel-shading, solid color fills, crisp uniform dark outlines, at most 2 to 3 tones per color, no gradients, no textures, no blur, no photorealism) of ONE woman performing ONE side plank on the forearm, drawn as a sheet of sixteen sequential keyframes of the movement in one direction.

The woman: an Asian woman in her late 20s, lean athletic build, long black hair tied in a high ponytail, calm neutral face, wearing a fitted teal short-sleeve athletic t-shirt (not cropped), black athletic shorts ending 10 cm above the knee, a black smartwatch on the wrist, and white running shoes with orange accents. No green anywhere on the character. She is drawn identically in every panel: same face, same hair, same clothes, same proportions, same size. If a character reference image is attached, draw exactly that woman.

Layout: ONE square image (1:1) containing a 4x4 grid of sixteen equal square panels, read left to right and top to bottom (panel 1 top-left, panel 16 bottom-right), separated by thin straight white lines. Nothing crosses the white lines. No text, no numbers, no labels, no arrows, no frames.

Camera (identical in all sixteen panels): front view, the camera faces her chest squarely; her body lies horizontally across the panel with the head toward the LEFT edge and the feet toward the RIGHT edge, resting on her right side, orthographic, no perspective, no tilt, no zoom. Her right forearm and feet stay at exactly the same spots in every panel. She is the same size in every panel, the body about 85 percent of the panel width, with clear margin on every side. Background in every panel: transparent. If transparency is not possible, one perfectly flat solid chroma key green (#00B140). No floor line, no horizon, no scenery, no shadow on the ground.

Setup (all panels): She lies on her right side with the legs straight and stacked. The right forearm lies flat on the floor with the elbow directly below the right shoulder. The left hand rests on the left hip. The chest faces the camera, no rotation.

Keyframes: panel 1 is the start position and panel 16 is the end position. Panels 2 to 15 are equal, evenly spaced in-between steps, so each panel changes only a little from the one before. Do not draw the return movement. Measurements (angles in degrees): hip height is the gap between the hips and the floor.
Panel 1: start, lying on her right side, hips resting on the floor: hip height 0 cm.
Panel 2: hip height 1 cm.
Panel 3: hip height 3 cm.
Panel 4: hip height 4 cm.
Panel 5: hip height 6 cm.
Panel 6: hip height 7 cm.
Panel 7: hip height 9 cm.
Panel 8: hip height 10 cm.
Panel 9: hip height 12 cm.
Panel 10: hip height 13 cm.
Panel 11: hip height 15 cm.
Panel 12: hip height 16 cm.
Panel 13: hip height 18 cm.
Panel 14: hip height 19 cm.
Panel 15: hip height 21 cm.
Panel 16: end, hip height 22 cm. Top: body one straight line from the head through the hips to the stacked feet, hips lifted and not dropping, neck neutral.
```

### Prompt negatif (pria dan wanita)

```text
photograph, photorealistic, 3D render, gradient, texture, blur, text, numbers, labels, arrows, watermark, logo, extra people, different person between panels, different face between panels, different hair between panels, different clothes between panels, different size between panels, different camera angle between panels, panels out of order, perspective, scenery, floor line, shadow on the floor, green clothing, extra limbs, distorted hands, distorted feet, three-quarter view, side view from the feet, back view, hips dropping, hips piking, body rotating forward or backward, elbow away from below the shoulder, head dropping
```

**Periksa:** Panel 16 lurus dari kepala ke kaki, siku di bawah bahu, dada menghadap kamera. Panel 1 sampai 16 berubah sedikit demi sedikit, tidak ada panel yang melompat atau terbalik urutannya.

---

## 13. Dead bug (`dead_bug`)

**Cue di app:** Berbaring, lengan dan lutut ke atas. Turunkan lengan dan kaki yang berlawanan pelan, punggung bawah tetap menempel lantai.

### Prompt pria (`dead_bug-m`)

```text
Clean flat-color vector-style illustration (anime cel-shading, solid color fills, crisp uniform dark outlines, at most 2 to 3 tones per color, no gradients, no textures, no blur, no photorealism) of ONE man performing ONE dead bug, drawn as a sheet of sixteen sequential keyframes of the movement in one direction.

The man: an Asian man in his late 20s, lean athletic build, short neat black hair, clean-shaven, calm neutral face, wearing a fitted teal short-sleeve athletic t-shirt, black athletic shorts ending 10 cm above the knee, a black smartwatch on the wrist, and white running shoes with orange accents. No green anywhere on the character. He is drawn identically in every panel: same face, same hair, same clothes, same proportions, same size. If a character reference image is attached, draw exactly that man.

Layout: ONE square image (1:1) containing a 4x4 grid of sixteen equal square panels, read left to right and top to bottom (panel 1 top-left, panel 16 bottom-right), separated by thin straight white lines. Nothing crosses the white lines. No text, no numbers, no labels, no arrows, no frames.

Camera (identical in all sixteen panels): exact side profile at floor level, he lies with the head toward the LEFT edge of the panel and the feet toward the RIGHT edge, the camera sees his right side (the right arm and right leg are the near limbs), orthographic, no perspective, no tilt, no zoom. His head, shoulders and hips stay at exactly the same spots in every panel. He is the same size in every panel, the body about 85 percent of the panel width, centered vertically, with clear margin on every side. Background in every panel: transparent. If transparency is not possible, one perfectly flat solid chroma key green (#00B140). No floor line, no horizon, no scenery, no shadow on the ground.

Setup (all panels): He lies on his back with the lower back pressed to the floor. The far (left) arm stays pointing straight up to the ceiling and the near (right) leg stays in tabletop (hip and knee bent 90 degrees, shin parallel to the floor). The near (right) arm and the far (left) leg move together. Head and shoulders stay on the floor.

Keyframes: panel 1 is the start position and panel 16 is the end position. Panels 2 to 15 are equal, evenly spaced in-between steps, so each panel changes only a little from the one before. Do not draw the return movement. Measurements (angles in degrees): near arm angle is measured from vertical toward the head (180 = flat overhead); far knee is the inside angle of the knee joint; far thigh angle is measured from vertical toward the feet (90 = parallel to the floor).
Panel 1: start, tabletop: both arms straight up, both hips and knees bent 90 degrees: near arm 0, far knee 90, far thigh 0.
Panel 2: near arm 11, far knee 96, far thigh 5.
Panel 3: near arm 23, far knee 102, far thigh 11.
Panel 4: near arm 34, far knee 108, far thigh 16.
Panel 5: near arm 45, far knee 114, far thigh 21.
Panel 6: near arm 57, far knee 120, far thigh 27.
Panel 7: near arm 68, far knee 126, far thigh 32.
Panel 8: near arm 79, far knee 132, far thigh 37.
Panel 9: near arm 91, far knee 138, far thigh 43.
Panel 10: near arm 102, far knee 144, far thigh 48.
Panel 11: near arm 113, far knee 150, far thigh 53.
Panel 12: near arm 125, far knee 156, far thigh 59.
Panel 13: near arm 136, far knee 162, far thigh 64.
Panel 14: near arm 147, far knee 168, far thigh 69.
Panel 15: near arm 159, far knee 174, far thigh 75.
Panel 16: end, near arm 170, far knee 180, far thigh 80. Extended: near arm straight overhead hovering about 10 cm above the floor, far leg straight hovering about 10 cm above the floor, lower back still flat.
```

### Prompt wanita (`dead_bug-f`)

```text
Clean flat-color vector-style illustration (anime cel-shading, solid color fills, crisp uniform dark outlines, at most 2 to 3 tones per color, no gradients, no textures, no blur, no photorealism) of ONE woman performing ONE dead bug, drawn as a sheet of sixteen sequential keyframes of the movement in one direction.

The woman: an Asian woman in her late 20s, lean athletic build, long black hair tied in a high ponytail, calm neutral face, wearing a fitted teal short-sleeve athletic t-shirt (not cropped), black athletic shorts ending 10 cm above the knee, a black smartwatch on the wrist, and white running shoes with orange accents. No green anywhere on the character. She is drawn identically in every panel: same face, same hair, same clothes, same proportions, same size. If a character reference image is attached, draw exactly that woman.

Layout: ONE square image (1:1) containing a 4x4 grid of sixteen equal square panels, read left to right and top to bottom (panel 1 top-left, panel 16 bottom-right), separated by thin straight white lines. Nothing crosses the white lines. No text, no numbers, no labels, no arrows, no frames.

Camera (identical in all sixteen panels): exact side profile at floor level, she lies with the head toward the LEFT edge of the panel and the feet toward the RIGHT edge, the camera sees her right side (the right arm and right leg are the near limbs), orthographic, no perspective, no tilt, no zoom. Her head, shoulders and hips stay at exactly the same spots in every panel. She is the same size in every panel, the body about 85 percent of the panel width, centered vertically, with clear margin on every side. Background in every panel: transparent. If transparency is not possible, one perfectly flat solid chroma key green (#00B140). No floor line, no horizon, no scenery, no shadow on the ground.

Setup (all panels): She lies on her back with the lower back pressed to the floor. The far (left) arm stays pointing straight up to the ceiling and the near (right) leg stays in tabletop (hip and knee bent 90 degrees, shin parallel to the floor). The near (right) arm and the far (left) leg move together. Head and shoulders stay on the floor.

Keyframes: panel 1 is the start position and panel 16 is the end position. Panels 2 to 15 are equal, evenly spaced in-between steps, so each panel changes only a little from the one before. Do not draw the return movement. Measurements (angles in degrees): near arm angle is measured from vertical toward the head (180 = flat overhead); far knee is the inside angle of the knee joint; far thigh angle is measured from vertical toward the feet (90 = parallel to the floor).
Panel 1: start, tabletop: both arms straight up, both hips and knees bent 90 degrees: near arm 0, far knee 90, far thigh 0.
Panel 2: near arm 11, far knee 96, far thigh 5.
Panel 3: near arm 23, far knee 102, far thigh 11.
Panel 4: near arm 34, far knee 108, far thigh 16.
Panel 5: near arm 45, far knee 114, far thigh 21.
Panel 6: near arm 57, far knee 120, far thigh 27.
Panel 7: near arm 68, far knee 126, far thigh 32.
Panel 8: near arm 79, far knee 132, far thigh 37.
Panel 9: near arm 91, far knee 138, far thigh 43.
Panel 10: near arm 102, far knee 144, far thigh 48.
Panel 11: near arm 113, far knee 150, far thigh 53.
Panel 12: near arm 125, far knee 156, far thigh 59.
Panel 13: near arm 136, far knee 162, far thigh 64.
Panel 14: near arm 147, far knee 168, far thigh 69.
Panel 15: near arm 159, far knee 174, far thigh 75.
Panel 16: end, near arm 170, far knee 180, far thigh 80. Extended: near arm straight overhead hovering about 10 cm above the floor, far leg straight hovering about 10 cm above the floor, lower back still flat.
```

### Prompt negatif (pria dan wanita)

```text
photograph, photorealistic, 3D render, gradient, texture, blur, text, numbers, labels, arrows, watermark, logo, extra people, different person between panels, different face between panels, different hair between panels, different clothes between panels, different size between panels, different camera angle between panels, panels out of order, perspective, scenery, floor line, shadow on the floor, green clothing, extra limbs, distorted hands, distorted feet, three-quarter view, view from above, lower back arching, head lifting, arm or leg touching the floor, both legs moving, bent arm
```

**Periksa:** Lengan dekat dan kaki jauh yang bergerak, punggung bawah tetap menempel, tidak menyentuh lantai. Panel 1 sampai 16 berubah sedikit demi sedikit, tidak ada panel yang melompat atau terbalik urutannya.

---

## 14. Bird dog (`bird_dog`)

**Cue di app:** Posisi merangkak. Luruskan lengan dan kaki yang berlawanan, tahan 2 detik, pinggul tetap rata.

### Prompt pria (`bird_dog-m`)

```text
Clean flat-color vector-style illustration (anime cel-shading, solid color fills, crisp uniform dark outlines, at most 2 to 3 tones per color, no gradients, no textures, no blur, no photorealism) of ONE man performing ONE bird dog, drawn as a sheet of sixteen sequential keyframes of the movement in one direction.

The man: an Asian man in his late 20s, lean athletic build, short neat black hair, clean-shaven, calm neutral face, wearing a fitted teal short-sleeve athletic t-shirt, black athletic shorts ending 10 cm above the knee, a black smartwatch on the wrist, and white running shoes with orange accents. No green anywhere on the character. He is drawn identically in every panel: same face, same hair, same clothes, same proportions, same size. If a character reference image is attached, draw exactly that man.

Layout: ONE square image (1:1) containing a 4x4 grid of sixteen equal square panels, read left to right and top to bottom (panel 1 top-left, panel 16 bottom-right), separated by thin straight white lines. Nothing crosses the white lines. No text, no numbers, no labels, no arrows, no frames.

Camera (identical in all sixteen panels): exact side profile at low height, he faces the RIGHT edge of the panel and the camera sees his right side (the right arm and right leg are the near limbs), orthographic, no perspective, no tilt, no zoom. His supporting hand and supporting knee stay at exactly the same spots in every panel. He is the same size in every panel, the body about 85 percent of the panel width, with clear margin on every side. Background in every panel: transparent. If transparency is not possible, one perfectly flat solid chroma key green (#00B140). No floor line, no horizon, no scenery, no shadow on the ground.

Setup (all panels): On hands and knees: hands directly below the shoulders, knees directly below the hips. The far (left) hand and the near (right) knee stay on the floor. The near (right) arm and the far (left) leg extend together. Back flat and level, hips square, neck neutral.

Keyframes: panel 1 is the start position and panel 16 is the end position. Panels 2 to 15 are equal, evenly spaced in-between steps, so each panel changes only a little from the one before. Do not draw the return movement. Measurements (angles in degrees): near arm angle is measured forward from pointing straight down (90 = horizontal at shoulder height); far thigh angle is measured backward from vertical (90 = horizontal at hip height); far knee is the inside angle of the knee joint.
Panel 1: start, on hands and knees, back flat: near arm 0, far thigh 0, far knee 90.
Panel 2: near arm 6, far thigh 6, far knee 96.
Panel 3: near arm 12, far thigh 12, far knee 102.
Panel 4: near arm 18, far thigh 18, far knee 108.
Panel 5: near arm 24, far thigh 24, far knee 114.
Panel 6: near arm 30, far thigh 30, far knee 120.
Panel 7: near arm 36, far thigh 36, far knee 126.
Panel 8: near arm 42, far thigh 42, far knee 132.
Panel 9: near arm 48, far thigh 48, far knee 138.
Panel 10: near arm 54, far thigh 54, far knee 144.
Panel 11: near arm 60, far thigh 60, far knee 150.
Panel 12: near arm 66, far thigh 66, far knee 156.
Panel 13: near arm 72, far thigh 72, far knee 162.
Panel 14: near arm 78, far thigh 78, far knee 168.
Panel 15: near arm 84, far thigh 84, far knee 174.
Panel 16: end, near arm 90, far thigh 90, far knee 180. Fully extended: near arm straight forward at shoulder height, far leg straight back at hip height, fingertips to heel one straight horizontal line, far foot flexed.
```

### Prompt wanita (`bird_dog-f`)

```text
Clean flat-color vector-style illustration (anime cel-shading, solid color fills, crisp uniform dark outlines, at most 2 to 3 tones per color, no gradients, no textures, no blur, no photorealism) of ONE woman performing ONE bird dog, drawn as a sheet of sixteen sequential keyframes of the movement in one direction.

The woman: an Asian woman in her late 20s, lean athletic build, long black hair tied in a high ponytail, calm neutral face, wearing a fitted teal short-sleeve athletic t-shirt (not cropped), black athletic shorts ending 10 cm above the knee, a black smartwatch on the wrist, and white running shoes with orange accents. No green anywhere on the character. She is drawn identically in every panel: same face, same hair, same clothes, same proportions, same size. If a character reference image is attached, draw exactly that woman.

Layout: ONE square image (1:1) containing a 4x4 grid of sixteen equal square panels, read left to right and top to bottom (panel 1 top-left, panel 16 bottom-right), separated by thin straight white lines. Nothing crosses the white lines. No text, no numbers, no labels, no arrows, no frames.

Camera (identical in all sixteen panels): exact side profile at low height, she faces the RIGHT edge of the panel and the camera sees her right side (the right arm and right leg are the near limbs), orthographic, no perspective, no tilt, no zoom. Her supporting hand and supporting knee stay at exactly the same spots in every panel. She is the same size in every panel, the body about 85 percent of the panel width, with clear margin on every side. Background in every panel: transparent. If transparency is not possible, one perfectly flat solid chroma key green (#00B140). No floor line, no horizon, no scenery, no shadow on the ground.

Setup (all panels): On hands and knees: hands directly below the shoulders, knees directly below the hips. The far (left) hand and the near (right) knee stay on the floor. The near (right) arm and the far (left) leg extend together. Back flat and level, hips square, neck neutral.

Keyframes: panel 1 is the start position and panel 16 is the end position. Panels 2 to 15 are equal, evenly spaced in-between steps, so each panel changes only a little from the one before. Do not draw the return movement. Measurements (angles in degrees): near arm angle is measured forward from pointing straight down (90 = horizontal at shoulder height); far thigh angle is measured backward from vertical (90 = horizontal at hip height); far knee is the inside angle of the knee joint.
Panel 1: start, on hands and knees, back flat: near arm 0, far thigh 0, far knee 90.
Panel 2: near arm 6, far thigh 6, far knee 96.
Panel 3: near arm 12, far thigh 12, far knee 102.
Panel 4: near arm 18, far thigh 18, far knee 108.
Panel 5: near arm 24, far thigh 24, far knee 114.
Panel 6: near arm 30, far thigh 30, far knee 120.
Panel 7: near arm 36, far thigh 36, far knee 126.
Panel 8: near arm 42, far thigh 42, far knee 132.
Panel 9: near arm 48, far thigh 48, far knee 138.
Panel 10: near arm 54, far thigh 54, far knee 144.
Panel 11: near arm 60, far thigh 60, far knee 150.
Panel 12: near arm 66, far thigh 66, far knee 156.
Panel 13: near arm 72, far thigh 72, far knee 162.
Panel 14: near arm 78, far thigh 78, far knee 168.
Panel 15: near arm 84, far thigh 84, far knee 174.
Panel 16: end, near arm 90, far thigh 90, far knee 180. Fully extended: near arm straight forward at shoulder height, far leg straight back at hip height, fingertips to heel one straight horizontal line, far foot flexed.
```

### Prompt negatif (pria dan wanita)

```text
photograph, photorealistic, 3D render, gradient, texture, blur, text, numbers, labels, arrows, watermark, logo, extra people, different person between panels, different face between panels, different hair between panels, different clothes between panels, different size between panels, different camera angle between panels, panels out of order, perspective, scenery, floor line, shadow on the floor, green clothing, extra limbs, distorted hands, distorted feet, three-quarter view, view from above, back arching, hips rotating, leg raised above hip height, head lifting, rounded back
```

**Periksa:** Panel 16 lengan dan kaki satu garis horizontal, pinggul rata, punggung tidak melengkung. Panel 1 sampai 16 berubah sedikit demi sedikit, tidak ada panel yang melompat atau terbalik urutannya.

---

## 15. Copenhagen plank (`copenhagen_plank`)

**Cue di app:** Side plank dengan kaki atas di bangku, kaki bawah menggantung. Mulai dari lutut di bangku jika masih berat.

### Prompt pria (`copenhagen_plank-m`)

```text
Clean flat-color vector-style illustration (anime cel-shading, solid color fills, crisp uniform dark outlines, at most 2 to 3 tones per color, no gradients, no textures, no blur, no photorealism) of ONE man performing ONE Copenhagen plank, drawn as a sheet of sixteen sequential keyframes of the movement in one direction.

The man: an Asian man in his late 20s, lean athletic build, short neat black hair, clean-shaven, calm neutral face, wearing a fitted teal short-sleeve athletic t-shirt, black athletic shorts ending 10 cm above the knee, a black smartwatch on the wrist, and white running shoes with orange accents. No green anywhere on the character. He is drawn identically in every panel: same face, same hair, same clothes, same proportions, same size. If a character reference image is attached, draw exactly that man.

Layout: ONE square image (1:1) containing a 4x4 grid of sixteen equal square panels, read left to right and top to bottom (panel 1 top-left, panel 16 bottom-right), separated by thin straight white lines. Nothing crosses the white lines. No text, no numbers, no labels, no arrows, no frames.

Camera (identical in all sixteen panels): front view, the camera faces his chest squarely; his body lies horizontally across the panel with the head toward the LEFT edge and the feet toward the RIGHT edge, resting on his right side, orthographic, no perspective, no tilt, no zoom. His right forearm, the top foot and the bench stay at exactly the same spots in every panel. He is the same size in every panel, the body about 85 percent of the panel width, with clear margin on every side. Background in every panel: transparent. If transparency is not possible, one perfectly flat solid chroma key green (#00B140). No floor line, no horizon, no scenery, no shadow on the ground. A plain flat dark grey bench about 45 cm high and 100 cm long lies along the RIGHT side of the panel and supports the top leg; it is the only prop. Any prop is a plain flat dark grey (#3A3A3C) shape with no logo, no texture and no green.

Setup (all panels): He lies on his right side. The right forearm is on the floor with the elbow directly below the right shoulder. The TOP (left) leg rests with the inside of the foot and ankle on the bench. The BOTTOM (right) leg hangs below the top leg. The left hand rests on the left hip. The chest faces the camera.

Keyframes: panel 1 is the start position and panel 16 is the end position. Panels 2 to 15 are equal, evenly spaced in-between steps, so each panel changes only a little from the one before. Do not draw the return movement. Measurements (angles in degrees): hip height and bottom foot height are measured from the floor.
Panel 1: start, lying on his right side next to the bench, hips and bottom leg on the floor, top foot on the bench: hip height 0 cm, bottom foot height 0 cm.
Panel 2: hip height 2 cm, bottom foot height 3 cm.
Panel 3: hip height 4 cm, bottom foot height 5 cm.
Panel 4: hip height 6 cm, bottom foot height 8 cm.
Panel 5: hip height 8 cm, bottom foot height 11 cm.
Panel 6: hip height 10 cm, bottom foot height 13 cm.
Panel 7: hip height 12 cm, bottom foot height 16 cm.
Panel 8: hip height 14 cm, bottom foot height 19 cm.
Panel 9: hip height 16 cm, bottom foot height 21 cm.
Panel 10: hip height 18 cm, bottom foot height 24 cm.
Panel 11: hip height 20 cm, bottom foot height 27 cm.
Panel 12: hip height 22 cm, bottom foot height 29 cm.
Panel 13: hip height 24 cm, bottom foot height 32 cm.
Panel 14: hip height 26 cm, bottom foot height 35 cm.
Panel 15: hip height 28 cm, bottom foot height 37 cm.
Panel 16: end, hip height 30 cm, bottom foot height 40 cm. Top: body one straight line from the head through the hips to the top foot on the bench, bottom leg lifted and held straight just under the top leg, hips not dropping.
```

### Prompt wanita (`copenhagen_plank-f`)

```text
Clean flat-color vector-style illustration (anime cel-shading, solid color fills, crisp uniform dark outlines, at most 2 to 3 tones per color, no gradients, no textures, no blur, no photorealism) of ONE woman performing ONE Copenhagen plank, drawn as a sheet of sixteen sequential keyframes of the movement in one direction.

The woman: an Asian woman in her late 20s, lean athletic build, long black hair tied in a high ponytail, calm neutral face, wearing a fitted teal short-sleeve athletic t-shirt (not cropped), black athletic shorts ending 10 cm above the knee, a black smartwatch on the wrist, and white running shoes with orange accents. No green anywhere on the character. She is drawn identically in every panel: same face, same hair, same clothes, same proportions, same size. If a character reference image is attached, draw exactly that woman.

Layout: ONE square image (1:1) containing a 4x4 grid of sixteen equal square panels, read left to right and top to bottom (panel 1 top-left, panel 16 bottom-right), separated by thin straight white lines. Nothing crosses the white lines. No text, no numbers, no labels, no arrows, no frames.

Camera (identical in all sixteen panels): front view, the camera faces her chest squarely; her body lies horizontally across the panel with the head toward the LEFT edge and the feet toward the RIGHT edge, resting on her right side, orthographic, no perspective, no tilt, no zoom. Her right forearm, the top foot and the bench stay at exactly the same spots in every panel. She is the same size in every panel, the body about 85 percent of the panel width, with clear margin on every side. Background in every panel: transparent. If transparency is not possible, one perfectly flat solid chroma key green (#00B140). No floor line, no horizon, no scenery, no shadow on the ground. A plain flat dark grey bench about 45 cm high and 100 cm long lies along the RIGHT side of the panel and supports the top leg; it is the only prop. Any prop is a plain flat dark grey (#3A3A3C) shape with no logo, no texture and no green.

Setup (all panels): She lies on her right side. The right forearm is on the floor with the elbow directly below the right shoulder. The TOP (left) leg rests with the inside of the foot and ankle on the bench. The BOTTOM (right) leg hangs below the top leg. The left hand rests on the left hip. The chest faces the camera.

Keyframes: panel 1 is the start position and panel 16 is the end position. Panels 2 to 15 are equal, evenly spaced in-between steps, so each panel changes only a little from the one before. Do not draw the return movement. Measurements (angles in degrees): hip height and bottom foot height are measured from the floor.
Panel 1: start, lying on her right side next to the bench, hips and bottom leg on the floor, top foot on the bench: hip height 0 cm, bottom foot height 0 cm.
Panel 2: hip height 2 cm, bottom foot height 3 cm.
Panel 3: hip height 4 cm, bottom foot height 5 cm.
Panel 4: hip height 6 cm, bottom foot height 8 cm.
Panel 5: hip height 8 cm, bottom foot height 11 cm.
Panel 6: hip height 10 cm, bottom foot height 13 cm.
Panel 7: hip height 12 cm, bottom foot height 16 cm.
Panel 8: hip height 14 cm, bottom foot height 19 cm.
Panel 9: hip height 16 cm, bottom foot height 21 cm.
Panel 10: hip height 18 cm, bottom foot height 24 cm.
Panel 11: hip height 20 cm, bottom foot height 27 cm.
Panel 12: hip height 22 cm, bottom foot height 29 cm.
Panel 13: hip height 24 cm, bottom foot height 32 cm.
Panel 14: hip height 26 cm, bottom foot height 35 cm.
Panel 15: hip height 28 cm, bottom foot height 37 cm.
Panel 16: end, hip height 30 cm, bottom foot height 40 cm. Top: body one straight line from the head through the hips to the top foot on the bench, bottom leg lifted and held straight just under the top leg, hips not dropping.
```

### Prompt negatif (pria dan wanita)

```text
photograph, photorealistic, 3D render, gradient, texture, blur, text, numbers, labels, arrows, watermark, logo, extra people, different person between panels, different face between panels, different hair between panels, different clothes between panels, different size between panels, different camera angle between panels, panels out of order, perspective, scenery, floor line, shadow on the floor, green clothing, extra limbs, distorted hands, distorted feet, three-quarter view, side view from the feet, back view, hips dropping, top foot sliding off the bench, body rotating, bottom leg bent, elbow away from below the shoulder
```

**Periksa:** Panel 16 lurus dari kepala ke kaki di bangku, kaki bawah terangkat, dada menghadap kamera. Panel 1 sampai 16 berubah sedikit demi sedikit, tidak ada panel yang melompat atau terbalik urutannya.

---

## Catatan dan batasan

- **Pilihan model pria/wanita di app belum ada di spec.** Dokumen ini hanya menyiapkan gambarnya. Fitur pilihan (pengaturan, penyimpanan lokal, teks ID/EN) perlu usulan perubahan `docs/specs/` dulu sesuai CLAUDE.md.
- App saat ini masih memakai 9 frame squat pria dari lembar 3x3 (`squat-1.webp` ... `squat-9.webp`, diputar 1 ke 9 lalu kembali ke 1). Pemutaran bolak-balik 16 frame perlu perubahan kecil di `ExerciseAnimation`/`frameTiming.ts` saat lembar 4x4 pertama masuk.
- Angka sudut adalah panduan untuk generator gambar, bukan ukuran biomekanik yang presisi. Generator biasanya tidak menggambar beda 5 sampai 6 derajat dengan tepat; yang penting urutannya naik rata dan panel 16 benar.
- 16 panel di satu gambar membuat tiap panel lebih kecil daripada 3x3. Jika generator hanya memberi 1024 x 1024, tiap panel sekitar 256 px dan figur akan sedikit buram setelah diperbesar.
- Skrip potong meluruskan titik tumpu dari tengah dan dasar sepatu. Untuk gerakan yang kakinya berpindah (reverse lunge) atau berbaring, periksa hasil potongan apakah figur bergoyang.
- Jika gerakan antarpanel masih kasar, frame perantara bisa ditambah dengan FILM (notebook Colab dari sesi sebelumnya), lalu dipasang sebagai frame tambahan.
- Lisensi atau izin pemakaian gambar hasil AI belum dikonfirmasi pemilik produk.
