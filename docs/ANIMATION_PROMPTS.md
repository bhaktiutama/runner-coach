# Prompt animasi gerakan strength (Seedance)

Status: Draft v0.1 (2026-11-02). Melengkapi `docs/ANIMATION_PIPELINE.md` dan `apps/app/assets/exercises/README.md`.

## Ringkasan

- 15 gerakan strength dan core (library `EXERCISES` di `packages/training-engine/src/strength.ts`). Squat sudah punya video (model perempuan), 14 lainnya belum.
- Tiap gerakan punya **2 prompt** yang disalin apa adanya: (1) prompt gambar, satu lembar 3x3 berisi 9 keyframe, (2) prompt video dari lembar itu.
- Semua model **laki-laki**, 1:1, latar hijau chroma (#00B140), tanpa bayangan lantai. Latar nanti diganti warna token terang/gelap (lihat README aset).
- Semua video 5 detik, satu repetisi, awal sama dengan akhir (loop mulus).

## Alur per gerakan

| # | Langkah | Yang dilakukan |
|---|---|---|
| 0 | Buat card karakter (sekali) | Generate card laki-laki dan perempuan (bagian "Card karakter"), pilih hasil terbaik, simpan. Dipakai sebagai referensi identitas di semua prompt keyframe |
| 1 | Generate lembar keyframe | Tempel prompt gambar + prompt negatif. Hasil: satu gambar 1:1 berisi 9 panel |
| 2 | Periksa lembar | Pakai daftar periksa gerakan. Ulangi sampai 9 panel benar dan orangnya sama |
| 2b | Potong panel 1 | Potong sel kiri atas dari lembar menjadi gambar 1:1 tunggal, tanpa garis putih pemisah dan tanpa bagian panel lain. Lembar 3x3 hanya dipakai untuk memeriksa gerakan, **tidak diunggah ke video** |
| 3 | Pilih model video | `seedance-2.0-mini-image-to-video` (atau fast atau standard). Panel 1 menjadi frame pertama, jadi tampilan awal terjamin |
| 4 | Generate video | Unggah **hanya 1 gambar**: panel 1 terpotong. Rasio 1:1, resolusi 720p, durasi 5 dtk. Tempel Prompt 2 |
| 5 | Periksa video | Gerakan sama dengan keyframe, tampak samping tetap, loop mulus, latar hijau rata |
| 6 | Kirim ke Claude | Untuk chroma key, pasangan terang/gelap dan pemasangan di app |

Prompt gambar sekitar 500 sampai 700 kata. Jika alat gambar membatasi panjang prompt, ringkas dulu bagian karakter dan latar (tetap sama di semua gerakan), jangan daftar 9 panelnya.

Pengaturan yang disarankan untuk video (model image-to-video):

| Pengaturan | Nilai | Alasan |
|---|---|---|
| Model | `seedance-2.0-mini-image-to-video` dulu. Jika gerakan meleset, coba fast atau standard | Mini paling murah untuk uji coba |
| Gambar | 1 gambar: panel 1 terpotong (frame pertama) | Biaya satu gambar, tanpa risiko kisi |
| Rasio | 1:1 | Didukung |
| Resolusi | 720p | Default. 480p terlalu rendah untuk chroma key yang rapi. 1080p hanya di model standard |
| Durasi | 5 detik | Sama dengan timeline di prompt (rentang yang didukung 4 sampai 15 detik) |

Sumber: dokumentasi EvoLink Seedance 2.0 (model image-to-video: 1 gambar = frame pertama, rasio `1:1`, 480p dan 720p di semua model, 1080p hanya standard, durasi 4 sampai 15 detik). EvoLink tidak punya kolom negative prompt, jadi larangan ditulis di baris `Avoid:` di akhir prompt. Batas panjang prompt yang direkomendasikan 1.000 kata Inggris.

Riwayat masalah: (1) lembar 3x3 diunggah ke model image-to-video: video berisi kisi 3x3 (dianggap frame pertama). (2) Prompt reference-to-video dengan timeline per panel: video berubah bentuk mengikuti foto referensi. (3) Lembar 3x3 utuh sebagai satu-satunya gambar di reference-to-video, dengan teks "hanya panel 1 yang subjek": video tetap menampilkan kisi 3x3. Kesimpulan: model memakai seluruh gambar sebagai isi visual, dan pembagian peran lewat teks tidak cukup. Karena itu hanya panel 1 terpotong yang diunggah; gerakan dijelaskan lewat teks.

## Aturan bersama

| Hal | Nilai |
|---|---|
| Karakter | Laki-laki Indonesia akhir 20-an, 175 cm, atletis ramping, rambut hitam pendek, tanpa jenggot |
| Pakaian | Kaos atletik slate-blue ketat lengan pendek, celana atletik hitam di atas lutut, sepatu lari abu muda sol putih. Tanpa hijau |
| Latar | Hijau chroma rata (#00B140), tanpa gradasi, garis lantai, atau bayangan |
| Kamera | Tetap, tegak lurus bidang gerak. Tampak samping (menghadap kanan frame) untuk semua gerakan kecuali side plank dan Copenhagen plank (tampak depan) |
| Rasio | 1:1. Di layar app, video menempati kotak persegi di atas teks gerakan |
| Properti | Hanya bila perlu (bangku, kotak, panel dinding): abu tua matte (#3A3A3C), tanpa logo dan tanpa hijau |
| Sisi kerja | Gerakan satu sisi memakai anggota badan terdekat kamera (sisi kanan) sebagai sisi kerja. Sisi lain tidak dibuat terpisah (app menyebut "per sisi") |
| Durasi | 5 detik, satu repetisi. Gerakan tahan (plank, side plank, Copenhagen, bird dog) memuat naik, tahan, turun dalam 5 detik |

## Daftar gerakan

| # | `exercise_id` | Nama di app | Tampak | Properti | Tahan di puncak |
|---|---|---|---|---|---|
| 1 | `squat` | Squat | samping | - | 0.4 dtk |
| 2 | `split_squat` | Split squat | samping | - | 0.4 dtk |
| 3 | `bulgarian_split_squat` | Bulgarian split squat | samping | bangku abu tua 45 cm | 0.4 dtk |
| 4 | `glute_bridge` | Glute bridge | samping, lantai | - | 1.0 dtk |
| 5 | `single_leg_glute_bridge` | Glute bridge satu kaki | samping, lantai | - | 1.0 dtk |
| 6 | `single_leg_deadlift` | Single-leg deadlift | samping | - | 0.4 dtk |
| 7 | `reverse_lunge` | Reverse lunge | samping | - | 0.4 dtk |
| 8 | `step_up` | Step-up | samping | kotak abu tua 40 cm | 0.6 dtk |
| 9 | `calf_raise` | Calf raise | samping | - | 1.0 dtk |
| 10 | `single_leg_calf_raise` | Single-leg calf raise | samping | panel dinding abu tua (pegangan) | 1.0 dtk |
| 11 | `plank` | Plank | samping, lantai | - | 2.0 dtk |
| 12 | `side_plank` | Side plank | depan | - | 2.0 dtk |
| 13 | `dead_bug` | Dead bug | samping, lantai | - | 0.4 dtk |
| 14 | `bird_dog` | Bird dog | samping, lantai | - | 2.0 dtk |
| 15 | `copenhagen_plank` | Copenhagen plank | depan | bangku abu tua 45 cm | 2.0 dtk |

Urutan di tabel = urutan pengerjaan yang disarankan: mulai dari squat (ulang versi laki-laki) untuk mengunci tampilan karakter, lalu gerakan berdiri, lantai, dan terakhir yang memakai properti.

## Card karakter (langkah 0)

Buat satu kali per model, sebelum semua keyframe. Hasilnya menjadi referensi identitas: unggah card sebagai gambar referensi di setiap prompt keyframe (kalimat "If a character reference image is attached..." sudah ada di blok karakter). Jika alat hanya menerima satu gambar referensi, pakai gambar tampak samping (prompt B).

| Hal | Laki-laki | Perempuan |
|---|---|---|
| Dipakai untuk | Semua keyframe di dokumen ini | Versi perempuan (belum dibuat prompt keyframe-nya) |
| Tinggi | 175 cm | 163 cm |
| Rambut | Hitam pendek rapi | Hitam panjang, kuncir tinggi |
| Pakaian | Kaos slate-blue lengan pendek, celana hitam di atas lutut, sepatu abu muda | Sama |

Pakaian perempuan sengaja kaos lengan pendek (bukan sports bra seperti video squat sebelumnya) agar seragam dengan laki-laki dan badan tidak terbuka.

### Card Laki-laki

Prompt A: card 2x2 (depan, samping kanan, belakang, wajah)

```text
Photorealistic studio character reference sheet of ONE person, used as the identity reference for later exercise photos. The person: an Indonesian man in his late 20s, about 175 cm tall, lean athletic build, short neat black hair, clean-shaven, calm neutral expression with the mouth closed, wearing a fitted short-sleeve slate-blue athletic t-shirt, black athletic shorts that end about 10 cm above the knee, and light grey running shoes with white soles; no hat, no watch, no jewelry, no green clothing.

Layout: ONE square image (1:1) with a 2x2 grid of four equal square panels separated by thin solid white lines. No text, no numbers, no labels, no arrows, no frames around the figure.
Panel 1 (top-left): full body from the front, standing relaxed in a neutral pose, feet hip-width apart, arms hanging with a small gap from the body, looking straight at the camera.
Panel 2 (top-right): the same person, full body, exact side profile facing the RIGHT edge of the panel (the camera sees the right side of the body), standing relaxed with the arms hanging naturally.
Panel 3 (bottom-left): the same person, full body from behind, same pose as panel 1.
Panel 4 (bottom-right): head and shoulders close-up from the front, calm neutral expression, mouth closed, showing the face, the hair and the neckline of the shirt clearly.

In panels 1 to 3 the full body from head to shoes is visible with at least 8 percent margin on every side, at the same scale and with the feet at the same position in each panel. The face, hair, body proportions, clothes and colors are exactly identical in all four panels.

Background: a perfectly flat, uniform chroma key green screen (#00B140) in every panel, with no gradient, no vignette, no wrinkles, no floor line and no cast shadow on the ground. Soft, even, shadowless studio lighting, identical in all panels. Realistic photograph, sharp focus, natural skin texture, no lens distortion, camera at chest height.
```

Prompt negatif:

```text
text, numbers, labels, watermark, logo, arrows, extra people, extra limbs, distorted hands, distorted feet, motion blur, shadow on the floor, gradient background, green clothing, cropped head, cropped feet, different clothing between panels, different face between panels, 3D render, cartoon, illustration, smiling, glasses, hat, accessories
```

Prompt B: satu gambar tampak samping (referensi tunggal)

```text
Photorealistic full-body studio photo of ONE person: an Indonesian man in his late 20s, about 175 cm tall, lean athletic build, short neat black hair, clean-shaven, calm neutral expression with the mouth closed, wearing a fitted short-sleeve slate-blue athletic t-shirt, black athletic shorts that end about 10 cm above the knee, and light grey running shoes with white soles; no hat, no watch, no jewelry, no green clothing. One square image (1:1) with a single panel and no grid. Exact side profile facing the RIGHT edge of the image (the camera sees the right side of the body), standing relaxed and tall, feet hip-width apart, arms hanging naturally at the sides, eyes looking straight ahead. The whole body from head to shoes is visible, centered, about 85 percent of the image height, with clear margin around it.

Background: a perfectly flat, uniform chroma key green screen (#00B140), with no gradient, no vignette, no wrinkles, no floor line and no cast shadow on the ground. Soft, even, shadowless studio lighting. Realistic photograph, sharp focus, natural skin texture, no lens distortion, camera at chest height.
```

Prompt negatif:

```text
text, numbers, labels, watermark, logo, arrows, extra people, extra limbs, distorted hands, distorted feet, motion blur, shadow on the floor, gradient background, green clothing, cropped head, cropped feet, 3D render, cartoon, illustration, smiling, glasses, hat, accessories, front view, three-quarter view, back view
```

### Card Perempuan

Prompt A: card 2x2 (depan, samping kanan, belakang, wajah)

```text
Photorealistic studio character reference sheet of ONE person, used as the identity reference for later exercise photos. The person: an Indonesian woman in her late 20s, about 163 cm tall, lean athletic build, long black hair tied in a high ponytail, no visible makeup, calm neutral expression with the mouth closed, wearing a fitted short-sleeve slate-blue athletic t-shirt, black athletic shorts that end about 10 cm above the knee, and light grey running shoes with white soles; no hat, no watch, no jewelry, no green clothing.

Layout: ONE square image (1:1) with a 2x2 grid of four equal square panels separated by thin solid white lines. No text, no numbers, no labels, no arrows, no frames around the figure.
Panel 1 (top-left): full body from the front, standing relaxed in a neutral pose, feet hip-width apart, arms hanging with a small gap from the body, looking straight at the camera.
Panel 2 (top-right): the same person, full body, exact side profile facing the RIGHT edge of the panel (the camera sees the right side of the body), standing relaxed with the arms hanging naturally.
Panel 3 (bottom-left): the same person, full body from behind, same pose as panel 1.
Panel 4 (bottom-right): head and shoulders close-up from the front, calm neutral expression, mouth closed, showing the face, the hair and the neckline of the shirt clearly.

In panels 1 to 3 the full body from head to shoes is visible with at least 8 percent margin on every side, at the same scale and with the feet at the same position in each panel. The face, hair, body proportions, clothes and colors are exactly identical in all four panels.

Background: a perfectly flat, uniform chroma key green screen (#00B140) in every panel, with no gradient, no vignette, no wrinkles, no floor line and no cast shadow on the ground. Soft, even, shadowless studio lighting, identical in all panels. Realistic photograph, sharp focus, natural skin texture, no lens distortion, camera at chest height.
```

Prompt negatif:

```text
text, numbers, labels, watermark, logo, arrows, extra people, extra limbs, distorted hands, distorted feet, motion blur, shadow on the floor, gradient background, green clothing, cropped head, cropped feet, different clothing between panels, different face between panels, 3D render, cartoon, illustration, smiling, glasses, hat, accessories
```

Prompt B: satu gambar tampak samping (referensi tunggal)

```text
Photorealistic full-body studio photo of ONE person: an Indonesian woman in her late 20s, about 163 cm tall, lean athletic build, long black hair tied in a high ponytail, no visible makeup, calm neutral expression with the mouth closed, wearing a fitted short-sleeve slate-blue athletic t-shirt, black athletic shorts that end about 10 cm above the knee, and light grey running shoes with white soles; no hat, no watch, no jewelry, no green clothing. One square image (1:1) with a single panel and no grid. Exact side profile facing the RIGHT edge of the image (the camera sees the right side of the body), standing relaxed and tall, feet hip-width apart, arms hanging naturally at the sides, eyes looking straight ahead. The whole body from head to shoes is visible, centered, about 85 percent of the image height, with clear margin around it.

Background: a perfectly flat, uniform chroma key green screen (#00B140), with no gradient, no vignette, no wrinkles, no floor line and no cast shadow on the ground. Soft, even, shadowless studio lighting. Realistic photograph, sharp focus, natural skin texture, no lens distortion, camera at chest height.
```

Prompt negatif:

```text
text, numbers, labels, watermark, logo, arrows, extra people, extra limbs, distorted hands, distorted feet, motion blur, shadow on the floor, gradient background, green clothing, cropped head, cropped feet, 3D render, cartoon, illustration, smiling, glasses, hat, accessories, front view, three-quarter view, back view
```

**Periksa card:** satu orang yang sama di semua panel (wajah, rambut, tinggi, baju), tampak samping benar-benar profil menghadap kanan, seluruh badan masuk dengan margin, latar hijau rata tanpa bayangan, tanpa hijau di pakaian. Jika wajah berubah antar panel, ulangi.

---

## 1. Squat (`squat`)

**Cue di app:** Kaki selebar bahu, dorong pinggul ke belakang, turun sampai paha sejajar lantai. Lutut searah jari kaki.

**Catatan:** Video squat yang sudah ada di app memakai model perempuan. Buat ulang versi laki-laki ini agar semua gerakan konsisten.

### Prompt 1: gambar (9 keyframe, 1:1)

```text
Photorealistic studio photo sheet of one man performing the bodyweight squat, shown as nine sequential keyframes of ONE repetition.

The same man in every panel: an Indonesian man in his late 20s, about 175 cm tall, lean athletic build, short neat black hair, clean-shaven, calm neutral expression with the mouth closed. He wears a fitted short-sleeve slate-blue athletic t-shirt, black athletic shorts that end about 10 cm above the knee, and light grey running shoes with white soles. No hat, no watch, no jewelry, no green clothing. If a character reference image is attached, reproduce exactly that man: same face, hair, build and clothes.

Background: a perfectly flat, uniform chroma key green screen (#00B140) filling the entire panel, with no gradient, no vignette, no wrinkles, no floor line, no horizon and no cast shadow on the ground. Soft, even, shadowless studio lighting. Realistic photograph, sharp focus, natural skin texture. The camera is locked off, perfectly perpendicular to the plane of movement, with no lens distortion and no perspective tilt, at the same distance in every panel.

Output ONE square image (1:1) that contains a 3x3 grid of nine equal square panels, read left to right and top to bottom, separated by thin solid white lines. Panel 1 is top-left, panel 9 is bottom-right. Each panel is one keyframe of the same exercise, in order. No text, no numbers, no labels, no arrows and no frames around the figure. The figure uses the same scale in all nine panels, fits fully inside its panel with at least 8 percent margin on every side, and the planted foot (or the body, for floor exercises) stays at exactly the same position from panel to panel, so that only the movement changes. Everything else (face, clothes, camera distance, background) is identical in all nine panels.

View: exact side profile. He faces the right edge of the panel and the camera sees his right side, so his right arm and right leg are the near limbs and his left arm and left leg are the far limbs. The camera is at hip height.
Exercise: bodyweight squat. Feet shoulder-width apart, toes turned out about 15 degrees, both feet flat. No prop.

Keyframes (join them as one smooth movement; panel 9 must be identical to panel 1):

Panel 1: Standing tall and relaxed, feet shoulder-width apart, legs straight (knees 180 degrees), arms hanging at his sides, torso vertical, eyes looking straight ahead.
Panel 2: Starting to sit back: hips move back and down, knees bent to about 150 degrees, torso leaning forward about 10 degrees, both arms swinging forward to about 30 degrees from vertical.
Panel 3: Knees bent to about 125 degrees, hips further back, torso leaning forward about 20 degrees, arms straight and raised to about 60 degrees from vertical.
Panel 4: Knees bent to about 105 degrees, thighs about 20 degrees above horizontal, torso leaning forward about 30 degrees with a straight back, arms straight at shoulder height pointing forward.
Panel 5: Bottom position: thighs parallel to the floor (knees about 90 degrees), shins leaning forward slightly, knees stacked over the middle of the feet and pointing the same way as the toes, torso leaning forward about 35 to 40 degrees with a neutral flat back and chest up, heels flat on the floor, arms straight forward at shoulder height, head neutral.
Panel 6: Rising: same pose as panel 4 (knees about 105 degrees, arms at shoulder height), moving upward.
Panel 7: Rising: same pose as panel 3 (knees about 125 degrees, arms at about 60 degrees).
Panel 8: Rising: same pose as panel 2 (knees about 150 degrees, arms at about 30 degrees).
Panel 9: Identical to panel 1: standing tall, arms at his sides.
```

Prompt negatif:

```text
text, numbers, labels, watermark, logo, arrows, extra people, extra limbs, distorted hands, distorted feet, motion blur, shadow on the floor, gradient background, green clothing, cropped head, cropped feet, different clothing between panels, different face between panels, mirrored panels, duplicated panels, 3D render, cartoon, illustration, knees caving inward, rounded back, heels lifting, feet sliding, squatting deeper than parallel, jumping
```

### Prompt 2: video (satu gambar: panel 1 terpotong = frame pertama)

Model `seedance-2.0-*-image-to-video`. Unggah hanya panel 1 yang sudah dipotong (1:1, tanpa garis putih). **Jangan unggah lembar 3x3.**

```text
Image-to-video. The input image is the first frame: the same man in the start posture of the bodyweight squat. Keep the man, his clothes, the camera framing, his size and position in the frame and the plain green background exactly as in the input image for the whole video, with a single man in the frame. He performs ONE slow, controlled repetition of the bodyweight squat in a single continuous, fluid, natural motion, like real footage of a person exercising: one steady tempo with gentle slowing at the turning points, no cuts, no morphing, no jumps between poses, no flicker. He ends in exactly the same posture as the first frame, so the video loops seamlessly.

Exercise setup: Feet shoulder-width apart, toes turned out about 15 degrees, both feet flat. No prop.

View: exact side profile. He faces the right edge of the frame and the camera sees his right side, so his right arm and right leg are the near limbs and his left arm and left leg are the far limbs. The camera is at hip height.

Movement: He sits back and down slowly with the arms rising straight forward to shoulder height as a counterbalance, pauses briefly at the bottom with the thighs parallel to the floor, then drives up through the heels while the arms lower back to his sides.

Key postures (the movement passes through them smoothly and never stops or snaps to them):
- Start posture (the input image): standing tall and relaxed, feet shoulder-width apart, legs straight (knees 180 degrees), arms hanging at his sides, torso vertical, eyes looking straight ahead.
- Midway posture: knees bent to about 125 degrees, hips further back, torso leaning forward about 20 degrees, arms straight and raised to about 60 degrees from vertical.
- Peak posture: thighs parallel to the floor (knees about 90 degrees), shins leaning forward slightly, knees stacked over the middle of the feet and pointing the same way as the toes, torso leaning forward about 35 to 40 degrees with a neutral flat back and chest up, heels flat on the floor, arms straight forward at shoulder height, head neutral.

Timeline (5 seconds in total):
- 0.0 to 0.4 s: stays still, exactly as in the input image.
- 0.4 to 2.4 s: moves from the start posture to the peak posture in one continuous motion, passing through the midway posture.
- 2.4 to 2.8 s: holds the peak posture briefly.
- 2.8 to 5.0 s: returns to the start posture in one continuous motion, passing through the midway posture in reverse, and ends exactly as in the input image.

Technique rules:
- Knees stay in line with the toes and never cave inward.
- Back stays flat and neutral, chest up, no rounding.
- Both heels stay flat on the floor, feet do not slide or shuffle.
- Depth: thighs parallel to the floor, not deeper.

Camera and look: square 1:1, 24 fps, a completely static locked-off camera (no pan, zoom, shake or cut). The same flat uniform chroma key green background (#00B140), with no gradient, no floor line, no grid, no white lines and no shadow on the ground, and soft even shadowless lighting that never changes. Same face, slate-blue t-shirt, black shorts and light grey shoes throughout. The full body stays inside the frame with at least 8 percent margin.

Avoid: camera movement, zoom, pan, cut, shake, shadow on the floor, gradient background, green clothing, motion blur, jumping, bouncing, fast or jerky movement, extra limbs, distorted hands, distorted feet, different clothing, different face, text, watermark, logo, extra people, grid, multiple panels, split screen, collage, white lines, multiple copies of the man, morphing, cross-fade, jump between poses, sudden pose change, flicker, changing camera framing, changing scale, changing background, knees caving inward, rounded back, heels lifting, feet sliding, squatting deeper than parallel, jumping
```

**Periksa hasil:** Lutut searah jari kaki, paha sejajar lantai di panel 5, punggung rata, tumit menempel, panel 9 sama dengan panel 1.

---

## 2. Split squat (`split_squat`)

**Cue di app:** Satu kaki di depan, satu di belakang. Turunkan lutut belakang lurus ke bawah, badan tetap tegak.

### Prompt 1: gambar (9 keyframe, 1:1)

```text
Photorealistic studio photo sheet of one man performing the split squat (static lunge), shown as nine sequential keyframes of ONE repetition.

The same man in every panel: an Indonesian man in his late 20s, about 175 cm tall, lean athletic build, short neat black hair, clean-shaven, calm neutral expression with the mouth closed. He wears a fitted short-sleeve slate-blue athletic t-shirt, black athletic shorts that end about 10 cm above the knee, and light grey running shoes with white soles. No hat, no watch, no jewelry, no green clothing. If a character reference image is attached, reproduce exactly that man: same face, hair, build and clothes.

Background: a perfectly flat, uniform chroma key green screen (#00B140) filling the entire panel, with no gradient, no vignette, no wrinkles, no floor line, no horizon and no cast shadow on the ground. Soft, even, shadowless studio lighting. Realistic photograph, sharp focus, natural skin texture. The camera is locked off, perfectly perpendicular to the plane of movement, with no lens distortion and no perspective tilt, at the same distance in every panel.

Output ONE square image (1:1) that contains a 3x3 grid of nine equal square panels, read left to right and top to bottom, separated by thin solid white lines. Panel 1 is top-left, panel 9 is bottom-right. Each panel is one keyframe of the same exercise, in order. No text, no numbers, no labels, no arrows and no frames around the figure. The figure uses the same scale in all nine panels, fits fully inside its panel with at least 8 percent margin on every side, and the planted foot (or the body, for floor exercises) stays at exactly the same position from panel to panel, so that only the movement changes. Everything else (face, clothes, camera distance, background) is identical in all nine panels.

View: exact side profile. He faces the right edge of the panel and the camera sees his right side, so his right arm and right leg are the near limbs and his left arm and left leg are the far limbs. The camera is at hip height.
Exercise: split squat (static lunge). Split stance: the near (right) leg is the FRONT leg, the far (left) leg is the BACK leg, about 90 cm between the feet front to back and about hip-width apart side to side. Front foot flat, back heel raised with the toes on the floor. Both hands on his hips. The feet do not move during the whole repetition. No prop.

Keyframes (join them as one smooth movement; panel 9 must be identical to panel 1):

Panel 1: Standing tall in the split stance, front foot flat, back heel raised, both knees almost straight (about 170 degrees), torso vertical, hands on hips, eyes straight ahead.
Panel 2: Lowering straight down: front knee about 145 degrees, back knee about 145 degrees, torso still vertical, hips moving straight down (not forward).
Panel 3: Front knee about 120 degrees, back knee about 115 degrees, torso vertical, back knee about 25 cm above the floor.
Panel 4: Front knee about 100 degrees, back knee about 95 degrees, front thigh about 15 degrees above horizontal, torso vertical.
Panel 5: Bottom position: front thigh parallel to the floor (front knee about 90 degrees), front shin vertical with the knee directly above the ankle and not past the toes, back knee about 90 degrees and about 5 cm above the floor, back thigh vertical, torso upright and tall, pelvis level, hands on hips.
Panel 6: Rising: same pose as panel 4.
Panel 7: Rising: same pose as panel 3.
Panel 8: Rising: same pose as panel 2.
Panel 9: Identical to panel 1.
```

Prompt negatif:

```text
text, numbers, labels, watermark, logo, arrows, extra people, extra limbs, distorted hands, distorted feet, motion blur, shadow on the floor, gradient background, green clothing, cropped head, cropped feet, different clothing between panels, different face between panels, mirrored panels, duplicated panels, 3D render, cartoon, illustration, feet stepping, torso leaning far forward, front knee past the toes, front heel lifting, back knee touching the floor hard, hips tilting
```

### Prompt 2: video (satu gambar: panel 1 terpotong = frame pertama)

Model `seedance-2.0-*-image-to-video`. Unggah hanya panel 1 yang sudah dipotong (1:1, tanpa garis putih). **Jangan unggah lembar 3x3.**

```text
Image-to-video. The input image is the first frame: the same man in the start posture of the split squat (static lunge). Keep the man, his clothes, the camera framing, his size and position in the frame and the plain green background exactly as in the input image for the whole video, with a single man in the frame. He performs ONE slow, controlled repetition of the split squat (static lunge) in a single continuous, fluid, natural motion, like real footage of a person exercising: one steady tempo with gentle slowing at the turning points, no cuts, no morphing, no jumps between poses, no flicker. He ends in exactly the same posture as the first frame, so the video loops seamlessly.

Exercise setup: Split stance: the near (right) leg is the FRONT leg, the far (left) leg is the BACK leg, about 90 cm between the feet front to back and about hip-width apart side to side. Front foot flat, back heel raised with the toes on the floor. Both hands on his hips. The feet do not move during the whole repetition. No prop.

View: exact side profile. He faces the right edge of the frame and the camera sees his right side, so his right arm and right leg are the near limbs and his left arm and left leg are the far limbs. The camera is at hip height.

Movement: He lowers his hips straight down, the back knee travelling vertically toward the floor, pauses briefly at the bottom, then pushes up through the front heel back to the start, torso upright the whole time.

Key postures (the movement passes through them smoothly and never stops or snaps to them):
- Start posture (the input image): standing tall in the split stance, front foot flat, back heel raised, both knees almost straight (about 170 degrees), torso vertical, hands on hips, eyes straight ahead.
- Midway posture: front knee about 120 degrees, back knee about 115 degrees, torso vertical, back knee about 25 cm above the floor.
- Peak posture: front thigh parallel to the floor (front knee about 90 degrees), front shin vertical with the knee directly above the ankle and not past the toes, back knee about 90 degrees and about 5 cm above the floor, back thigh vertical, torso upright and tall, pelvis level, hands on hips.

Timeline (5 seconds in total):
- 0.0 to 0.4 s: stays still, exactly as in the input image.
- 0.4 to 2.4 s: moves from the start posture to the peak posture in one continuous motion, passing through the midway posture.
- 2.4 to 2.8 s: holds the peak posture briefly.
- 2.8 to 5.0 s: returns to the start posture in one continuous motion, passing through the midway posture in reverse, and ends exactly as in the input image.

Technique rules:
- Both feet stay planted in the same place, no stepping.
- Torso stays upright, no forward lean beyond a few degrees.
- Front knee stays above the ankle, the front heel stays down.
- Back knee moves straight down, hips stay level and square to the camera plane.

Camera and look: square 1:1, 24 fps, a completely static locked-off camera (no pan, zoom, shake or cut). The same flat uniform chroma key green background (#00B140), with no gradient, no floor line, no grid, no white lines and no shadow on the ground, and soft even shadowless lighting that never changes. Same face, slate-blue t-shirt, black shorts and light grey shoes throughout. The full body stays inside the frame with at least 8 percent margin.

Avoid: camera movement, zoom, pan, cut, shake, shadow on the floor, gradient background, green clothing, motion blur, jumping, bouncing, fast or jerky movement, extra limbs, distorted hands, distorted feet, different clothing, different face, text, watermark, logo, extra people, grid, multiple panels, split screen, collage, white lines, multiple copies of the man, morphing, cross-fade, jump between poses, sudden pose change, flicker, changing camera framing, changing scale, changing background, feet stepping, torso leaning far forward, front knee past the toes, front heel lifting, back knee touching the floor hard, hips tilting
```

**Periksa hasil:** Lutut belakang turun lurus, badan tegak, lutut depan di atas pergelangan kaki, kaki tidak berpindah, panel 9 = panel 1.

---

## 3. Bulgarian split squat (`bulgarian_split_squat`)

**Cue di app:** Punggung kaki belakang di kursi atau bangku. Turun pelan sampai paha depan sejajar lantai, dorong lewat tumit depan.

### Prompt 1: gambar (9 keyframe, 1:1)

```text
Photorealistic studio photo sheet of one man performing the Bulgarian split squat, shown as nine sequential keyframes of ONE repetition.

The same man in every panel: an Indonesian man in his late 20s, about 175 cm tall, lean athletic build, short neat black hair, clean-shaven, calm neutral expression with the mouth closed. He wears a fitted short-sleeve slate-blue athletic t-shirt, black athletic shorts that end about 10 cm above the knee, and light grey running shoes with white soles. No hat, no watch, no jewelry, no green clothing. If a character reference image is attached, reproduce exactly that man: same face, hair, build and clothes.

Background: a perfectly flat, uniform chroma key green screen (#00B140) filling the entire panel, with no gradient, no vignette, no wrinkles, no floor line, no horizon and no cast shadow on the ground. Soft, even, shadowless studio lighting. Realistic photograph, sharp focus, natural skin texture. The camera is locked off, perfectly perpendicular to the plane of movement, with no lens distortion and no perspective tilt, at the same distance in every panel.

Output ONE square image (1:1) that contains a 3x3 grid of nine equal square panels, read left to right and top to bottom, separated by thin solid white lines. Panel 1 is top-left, panel 9 is bottom-right. Each panel is one keyframe of the same exercise, in order. No text, no numbers, no labels, no arrows and no frames around the figure. The figure uses the same scale in all nine panels, fits fully inside its panel with at least 8 percent margin on every side, and the planted foot (or the body, for floor exercises) stays at exactly the same position from panel to panel, so that only the movement changes. Everything else (face, clothes, camera distance, background) is identical in all nine panels.

View: exact side profile. He faces the right edge of the panel and the camera sees his right side, so his right arm and right leg are the near limbs and his left arm and left leg are the far limbs. The camera is at hip height.
Prop: A plain dark grey bench about 45 cm high and 40 cm long, standing on the LEFT side of the panel behind him (the bench is the only prop). Any prop is a plain matte dark grey (#3A3A3C) object with no logo and no green.
Exercise: Bulgarian split squat. The far (left) foot is the REAR foot, with the top of the foot (laces down) resting on the bench behind him. The near (right) leg is the FRONT leg, with the front foot flat on the floor about 75 cm in front of the bench. Both hands on his hips. The front foot does not move during the repetition.

Keyframes (join them as one smooth movement; panel 9 must be identical to panel 1):

Panel 1: Standing tall, rear foot on the bench, front leg almost straight (about 170 degrees), torso upright, hands on hips, eyes straight ahead.
Panel 2: Lowering: front knee about 145 degrees, rear knee about 150 degrees, torso upright with at most 5 degrees of forward lean.
Panel 3: Front knee about 120 degrees, rear knee about 125 degrees, torso upright with a slight forward lean of about 8 degrees.
Panel 4: Front knee about 100 degrees, front thigh about 15 degrees above horizontal, rear knee about 105 degrees, rear thigh pointing down and back.
Panel 5: Bottom position: front thigh parallel to the floor (front knee about 90 degrees), front shin nearly vertical with the knee over the ankle, rear knee bent about 100 degrees and pointing down about 15 cm above the floor, rear foot still on the bench, torso upright with a forward lean of about 10 degrees, pelvis level, weight on the front heel.
Panel 6: Rising: same pose as panel 4.
Panel 7: Rising: same pose as panel 3.
Panel 8: Rising: same pose as panel 2.
Panel 9: Identical to panel 1.
```

Prompt negatif:

```text
text, numbers, labels, watermark, logo, arrows, extra people, extra limbs, distorted hands, distorted feet, motion blur, shadow on the floor, gradient background, green clothing, cropped head, cropped feet, different clothing between panels, different face between panels, mirrored panels, duplicated panels, 3D render, cartoon, illustration, rear foot sliding off the bench, front knee far past the toes, front heel lifting, torso leaning far forward, bouncing, hips twisting
```

### Prompt 2: video (satu gambar: panel 1 terpotong = frame pertama)

Model `seedance-2.0-*-image-to-video`. Unggah hanya panel 1 yang sudah dipotong (1:1, tanpa garis putih). **Jangan unggah lembar 3x3.**

```text
Image-to-video. The input image is the first frame: the same man in the start posture of the Bulgarian split squat. Keep the man, his clothes, the camera framing, his size and position in the frame and the plain green background exactly as in the input image for the whole video, with a single man in the frame. He performs ONE slow, controlled repetition of the Bulgarian split squat in a single continuous, fluid, natural motion, like real footage of a person exercising: one steady tempo with gentle slowing at the turning points, no cuts, no morphing, no jumps between poses, no flicker. He ends in exactly the same posture as the first frame, so the video loops seamlessly.

Exercise setup: The far (left) foot is the REAR foot, with the top of the foot (laces down) resting on the bench behind him. The near (right) leg is the FRONT leg, with the front foot flat on the floor about 75 cm in front of the bench. Both hands on his hips. The front foot does not move during the repetition.

View: exact side profile. He faces the right edge of the frame and the camera sees his right side, so his right arm and right leg are the near limbs and his left arm and left leg are the far limbs. The camera is at hip height. Prop: A plain dark grey bench about 45 cm high and 40 cm long, standing on the LEFT side of the frame behind him (the bench is the only prop). Any prop is a plain matte dark grey (#3A3A3C) object with no logo and no green.

Movement: He lowers slowly and under control until the front thigh is parallel to the floor, pauses briefly, then pushes up through the front heel back to the start, with the rear foot resting on the bench the whole time.

Key postures (the movement passes through them smoothly and never stops or snaps to them):
- Start posture (the input image): standing tall, rear foot on the bench, front leg almost straight (about 170 degrees), torso upright, hands on hips, eyes straight ahead.
- Midway posture: front knee about 120 degrees, rear knee about 125 degrees, torso upright with a slight forward lean of about 8 degrees.
- Peak posture: front thigh parallel to the floor (front knee about 90 degrees), front shin nearly vertical with the knee over the ankle, rear knee bent about 100 degrees and pointing down about 15 cm above the floor, rear foot still on the bench, torso upright with a forward lean of about 10 degrees, pelvis level, weight on the front heel.

Timeline (5 seconds in total):
- 0.0 to 0.4 s: stays still, exactly as in the input image.
- 0.4 to 2.4 s: moves from the start posture to the peak posture in one continuous motion, passing through the midway posture.
- 2.4 to 2.8 s: holds the peak posture briefly.
- 2.8 to 5.0 s: returns to the start posture in one continuous motion, passing through the midway posture in reverse, and ends exactly as in the input image.

Technique rules:
- The rear foot stays on the bench, the front foot stays planted.
- Front knee stays above the ankle and tracks over the toes, front heel stays down.
- Torso stays nearly upright, pelvis stays level.
- Slow, controlled tempo, no bouncing at the bottom.

Camera and look: square 1:1, 24 fps, a completely static locked-off camera (no pan, zoom, shake or cut). The same flat uniform chroma key green background (#00B140), with no gradient, no floor line, no grid, no white lines and no shadow on the ground, and soft even shadowless lighting that never changes. Same face, slate-blue t-shirt, black shorts and light grey shoes throughout. The full body stays inside the frame with at least 8 percent margin.

Avoid: camera movement, zoom, pan, cut, shake, shadow on the floor, gradient background, green clothing, motion blur, jumping, bouncing, fast or jerky movement, extra limbs, distorted hands, distorted feet, different clothing, different face, text, watermark, logo, extra people, grid, multiple panels, split screen, collage, white lines, multiple copies of the man, morphing, cross-fade, jump between poses, sudden pose change, flicker, changing camera framing, changing scale, changing background, rear foot sliding off the bench, front knee far past the toes, front heel lifting, torso leaning far forward, bouncing, hips twisting
```

**Periksa hasil:** Kaki belakang tetap di bangku, paha depan sejajar lantai di panel 5, lutut depan di atas tumit, badan hampir tegak.

---

## 4. Glute bridge (`glute_bridge`)

**Cue di app:** Berbaring, lutut ditekuk. Angkat pinggul sampai badan lurus dari bahu ke lutut, tahan 1 detik.

### Prompt 1: gambar (9 keyframe, 1:1)

```text
Photorealistic studio photo sheet of one man performing the glute bridge, shown as nine sequential keyframes of ONE repetition.

The same man in every panel: an Indonesian man in his late 20s, about 175 cm tall, lean athletic build, short neat black hair, clean-shaven, calm neutral expression with the mouth closed. He wears a fitted short-sleeve slate-blue athletic t-shirt, black athletic shorts that end about 10 cm above the knee, and light grey running shoes with white soles. No hat, no watch, no jewelry, no green clothing. If a character reference image is attached, reproduce exactly that man: same face, hair, build and clothes.

Background: a perfectly flat, uniform chroma key green screen (#00B140) filling the entire panel, with no gradient, no vignette, no wrinkles, no floor line, no horizon and no cast shadow on the ground. Soft, even, shadowless studio lighting. Realistic photograph, sharp focus, natural skin texture. The camera is locked off, perfectly perpendicular to the plane of movement, with no lens distortion and no perspective tilt, at the same distance in every panel.

Output ONE square image (1:1) that contains a 3x3 grid of nine equal square panels, read left to right and top to bottom, separated by thin solid white lines. Panel 1 is top-left, panel 9 is bottom-right. Each panel is one keyframe of the same exercise, in order. No text, no numbers, no labels, no arrows and no frames around the figure. The figure uses the same scale in all nine panels, fits fully inside its panel with at least 8 percent margin on every side, and the planted foot (or the body, for floor exercises) stays at exactly the same position from panel to panel, so that only the movement changes. Everything else (face, clothes, camera distance, background) is identical in all nine panels.

View: exact side profile at floor level, camera about 30 cm above the floor. He lies with his head toward the left edge of the panel and his feet toward the right edge. The camera sees his right side, so his right arm and right leg are the near limbs and his left arm and left leg are the far limbs. There is no mat and no visible floor.
Exercise: glute bridge. He lies on his back, knees bent about 90 degrees, feet flat and hip-width apart with the heels about 30 cm from his glutes, arms resting on the floor along his sides with the palms down. The feet do not move.

Keyframes (join them as one smooth movement; panel 9 must be identical to panel 1):

Panel 1: Lying flat on his back, knees bent about 90 degrees, feet flat, arms along his sides, lower back lying naturally on the floor, head and shoulders on the floor.
Panel 2: Hips lifting: glutes about 5 cm off the floor, back of the pelvis tilting slightly, shoulders and head on the floor, feet flat.
Panel 3: Hips about 15 cm off the floor, thighs and torso forming a shallow angle with the floor, shoulders on the floor.
Panel 4: Hips about 25 cm off the floor, almost at full height, glutes tight.
Panel 5: Top position: hips fully raised so that shoulders, hips and knees form one straight diagonal line that rises from the shoulders (on the floor) to the knees, the thighs sloping up from the hips to the knees at about 20 to 30 degrees above horizontal, shins vertical, knees about 90 degrees, feet flat directly below the knees, glutes squeezed, ribs down with no arch in the lower back, shoulders and head still on the floor, arms along his sides.
Panel 6: Lowering: same pose as panel 4.
Panel 7: Lowering: same pose as panel 3.
Panel 8: Lowering: same pose as panel 2, glutes just above the floor.
Panel 9: Identical to panel 1.
```

Prompt negatif:

```text
text, numbers, labels, watermark, logo, arrows, extra people, extra limbs, distorted hands, distorted feet, motion blur, shadow on the floor, gradient background, green clothing, cropped head, cropped feet, different clothing between panels, different face between panels, mirrored panels, duplicated panels, 3D render, cartoon, illustration, arched lower back, hips sagging, feet sliding, heels lifting, neck lifting off the floor, knees falling inward
```

### Prompt 2: video (satu gambar: panel 1 terpotong = frame pertama)

Model `seedance-2.0-*-image-to-video`. Unggah hanya panel 1 yang sudah dipotong (1:1, tanpa garis putih). **Jangan unggah lembar 3x3.**

```text
Image-to-video. The input image is the first frame: the same man in the start posture of the glute bridge. Keep the man, his clothes, the camera framing, his size and position in the frame and the plain green background exactly as in the input image for the whole video, with a single man in the frame. He performs ONE slow, controlled repetition of the glute bridge in a single continuous, fluid, natural motion, like real footage of a person exercising: one steady tempo with gentle slowing at the turning points, no cuts, no morphing, no jumps between poses, no flicker. He ends in exactly the same posture as the first frame, so the video loops seamlessly.

Exercise setup: He lies on his back, knees bent about 90 degrees, feet flat and hip-width apart with the heels about 30 cm from his glutes, arms resting on the floor along his sides with the palms down. The feet do not move.

View: exact side profile at floor level, camera about 30 cm above the floor. He lies with his head toward the left edge of the frame and his feet toward the right edge. The camera sees his right side, so his right arm and right leg are the near limbs and his left arm and left leg are the far limbs. There is no mat and no visible floor.

Movement: He lifts his hips smoothly by pushing through his heels until the body is a straight line from shoulders to knees, holds that top position for one second, then lowers slowly back to the floor.

Key postures (the movement passes through them smoothly and never stops or snaps to them):
- Start posture (the input image): lying flat on his back, knees bent about 90 degrees, feet flat, arms along his sides, lower back lying naturally on the floor, head and shoulders on the floor.
- Midway posture: hips about 15 cm off the floor, thighs and torso forming a shallow angle with the floor, shoulders on the floor.
- Peak posture: hips fully raised so that shoulders, hips and knees form one straight diagonal line that rises from the shoulders (on the floor) to the knees, the thighs sloping up from the hips to the knees at about 20 to 30 degrees above horizontal, shins vertical, knees about 90 degrees, feet flat directly below the knees, glutes squeezed, ribs down with no arch in the lower back, shoulders and head still on the floor, arms along his sides.

Timeline (5 seconds in total):
- 0.0 to 0.4 s: stays still, exactly as in the input image.
- 0.4 to 2.0 s: moves from the start posture to the peak posture in one continuous motion, passing through the midway posture.
- 2.0 to 3.0 s: holds the peak posture briefly.
- 3.0 to 5.0 s: returns to the start posture in one continuous motion, passing through the midway posture in reverse, and ends exactly as in the input image.

Technique rules:
- The line from shoulders to knees is straight at the top, with no arching of the lower back and no over-extension.
- Feet stay flat and in place, shoulders and head stay on the floor.
- Hold the top position for about 1 second.
- Lower slowly, the glutes just touch the floor before the next repetition.

Camera and look: square 1:1, 24 fps, a completely static locked-off camera (no pan, zoom, shake or cut). The same flat uniform chroma key green background (#00B140), with no gradient, no floor line, no grid, no white lines and no shadow on the ground, and soft even shadowless lighting that never changes. Same face, slate-blue t-shirt, black shorts and light grey shoes throughout. The full body stays inside the frame with at least 8 percent margin.

Avoid: camera movement, zoom, pan, cut, shake, shadow on the floor, gradient background, green clothing, motion blur, jumping, bouncing, fast or jerky movement, extra limbs, distorted hands, distorted feet, different clothing, different face, text, watermark, logo, extra people, grid, multiple panels, split screen, collage, white lines, multiple copies of the man, morphing, cross-fade, jump between poses, sudden pose change, flicker, changing camera framing, changing scale, changing background, arched lower back, hips sagging, feet sliding, heels lifting, neck lifting off the floor, knees falling inward
```

**Periksa hasil:** Garis lurus bahu ke lutut di panel 5, punggung bawah tidak melengkung, tumit menempel, tahan 1 detik di puncak.

---

## 5. Glute bridge satu kaki (`single_leg_glute_bridge`)

**Cue di app:** Seperti glute bridge, satu kaki lurus ke atas. Pinggul tetap rata, tidak miring.

### Prompt 1: gambar (9 keyframe, 1:1)

```text
Photorealistic studio photo sheet of one man performing the single-leg glute bridge, shown as nine sequential keyframes of ONE repetition.

The same man in every panel: an Indonesian man in his late 20s, about 175 cm tall, lean athletic build, short neat black hair, clean-shaven, calm neutral expression with the mouth closed. He wears a fitted short-sleeve slate-blue athletic t-shirt, black athletic shorts that end about 10 cm above the knee, and light grey running shoes with white soles. No hat, no watch, no jewelry, no green clothing. If a character reference image is attached, reproduce exactly that man: same face, hair, build and clothes.

Background: a perfectly flat, uniform chroma key green screen (#00B140) filling the entire panel, with no gradient, no vignette, no wrinkles, no floor line, no horizon and no cast shadow on the ground. Soft, even, shadowless studio lighting. Realistic photograph, sharp focus, natural skin texture. The camera is locked off, perfectly perpendicular to the plane of movement, with no lens distortion and no perspective tilt, at the same distance in every panel.

Output ONE square image (1:1) that contains a 3x3 grid of nine equal square panels, read left to right and top to bottom, separated by thin solid white lines. Panel 1 is top-left, panel 9 is bottom-right. Each panel is one keyframe of the same exercise, in order. No text, no numbers, no labels, no arrows and no frames around the figure. The figure uses the same scale in all nine panels, fits fully inside its panel with at least 8 percent margin on every side, and the planted foot (or the body, for floor exercises) stays at exactly the same position from panel to panel, so that only the movement changes. Everything else (face, clothes, camera distance, background) is identical in all nine panels.

View: exact side profile at floor level, camera about 30 cm above the floor. He lies with his head toward the left edge of the panel and his feet toward the right edge. The camera sees his right side, so his right arm and right leg are the near limbs and his left arm and left leg are the far limbs. There is no mat and no visible floor.
Exercise: single-leg glute bridge. He lies on his back. The near (right) foot is flat on the floor with the knee bent about 90 degrees: this is the working leg. The far (left) leg is held straight (knee 180 degrees) with its thigh parallel to the near thigh, the foot flexed, hovering in the air and never touching the floor. Arms rest on the floor along his sides, palms down.

Keyframes (join them as one smooth movement; panel 9 must be identical to panel 1):

Panel 1: Lying flat on his back, near knee bent about 90 degrees with the foot flat, far leg straight (knee 180 degrees) and raised so that it is parallel to the near thigh, pointing diagonally up, arms along his sides.
Panel 2: Hips lifting: glutes about 5 cm off the floor, far leg still straight and still parallel to the near thigh.
Panel 3: Hips about 15 cm off the floor, far leg straight, pelvis level (not rotating toward either side).
Panel 4: Hips about 25 cm off the floor, almost at full height, far leg straight.
Panel 5: Top position: hips fully raised so that shoulders, hips and the near knee form one straight diagonal line, near shin vertical, near foot flat, far leg straight and held in line with the near thigh (parallel to it, rising at about 20 to 30 degrees above horizontal), pelvis level and square (hips not dropping or twisting), ribs down with no arch in the lower back, shoulders and head on the floor.
Panel 6: Lowering: same pose as panel 4.
Panel 7: Lowering: same pose as panel 3.
Panel 8: Lowering: same pose as panel 2.
Panel 9: Identical to panel 1.
```

Prompt negatif:

```text
text, numbers, labels, watermark, logo, arrows, extra people, extra limbs, distorted hands, distorted feet, motion blur, shadow on the floor, gradient background, green clothing, cropped head, cropped feet, different clothing between panels, different face between panels, mirrored panels, duplicated panels, 3D render, cartoon, illustration, far leg bending, hips twisting, far hip dropping, arched lower back, working foot sliding, both feet on the floor
```

### Prompt 2: video (satu gambar: panel 1 terpotong = frame pertama)

Model `seedance-2.0-*-image-to-video`. Unggah hanya panel 1 yang sudah dipotong (1:1, tanpa garis putih). **Jangan unggah lembar 3x3.**

```text
Image-to-video. The input image is the first frame: the same man in the start posture of the single-leg glute bridge. Keep the man, his clothes, the camera framing, his size and position in the frame and the plain green background exactly as in the input image for the whole video, with a single man in the frame. He performs ONE slow, controlled repetition of the single-leg glute bridge in a single continuous, fluid, natural motion, like real footage of a person exercising: one steady tempo with gentle slowing at the turning points, no cuts, no morphing, no jumps between poses, no flicker. He ends in exactly the same posture as the first frame, so the video loops seamlessly.

Exercise setup: He lies on his back. The near (right) foot is flat on the floor with the knee bent about 90 degrees: this is the working leg. The far (left) leg is held straight (knee 180 degrees) with its thigh parallel to the near thigh, the foot flexed, hovering in the air and never touching the floor. Arms rest on the floor along his sides, palms down.

View: exact side profile at floor level, camera about 30 cm above the floor. He lies with his head toward the left edge of the frame and his feet toward the right edge. The camera sees his right side, so his right arm and right leg are the near limbs and his left arm and left leg are the far limbs. There is no mat and no visible floor.

Movement: He lifts his hips by pushing through the heel of the near foot only, while the other leg stays straight and parallel to the working thigh, holds the top for one second with level hips, then lowers slowly.

Key postures (the movement passes through them smoothly and never stops or snaps to them):
- Start posture (the input image): lying flat on his back, near knee bent about 90 degrees with the foot flat, far leg straight (knee 180 degrees) and raised so that it is parallel to the near thigh, pointing diagonally up, arms along his sides.
- Midway posture: hips about 15 cm off the floor, far leg straight, pelvis level (not rotating toward either side).
- Peak posture: hips fully raised so that shoulders, hips and the near knee form one straight diagonal line, near shin vertical, near foot flat, far leg straight and held in line with the near thigh (parallel to it, rising at about 20 to 30 degrees above horizontal), pelvis level and square (hips not dropping or twisting), ribs down with no arch in the lower back, shoulders and head on the floor.

Timeline (5 seconds in total):
- 0.0 to 0.4 s: stays still, exactly as in the input image.
- 0.4 to 2.0 s: moves from the start posture to the peak posture in one continuous motion, passing through the midway posture.
- 2.0 to 3.0 s: holds the peak posture briefly.
- 3.0 to 5.0 s: returns to the start posture in one continuous motion, passing through the midway posture in reverse, and ends exactly as in the input image.

Technique rules:
- Only the near foot is on the floor, the far leg stays straight and parallel to the working thigh the whole time.
- Hips stay level at the top, no rotation or dropping of the far hip.
- No arching of the lower back, shoulders and head stay on the floor.
- Hold the top for about 1 second, lower slowly.

Camera and look: square 1:1, 24 fps, a completely static locked-off camera (no pan, zoom, shake or cut). The same flat uniform chroma key green background (#00B140), with no gradient, no floor line, no grid, no white lines and no shadow on the ground, and soft even shadowless lighting that never changes. Same face, slate-blue t-shirt, black shorts and light grey shoes throughout. The full body stays inside the frame with at least 8 percent margin.

Avoid: camera movement, zoom, pan, cut, shake, shadow on the floor, gradient background, green clothing, motion blur, jumping, bouncing, fast or jerky movement, extra limbs, distorted hands, distorted feet, different clothing, different face, text, watermark, logo, extra people, grid, multiple panels, split screen, collage, white lines, multiple copies of the man, morphing, cross-fade, jump between poses, sudden pose change, flicker, changing camera framing, changing scale, changing background, far leg bending, hips twisting, far hip dropping, arched lower back, working foot sliding, both feet on the floor
```

**Periksa hasil:** Kaki bebas tetap lurus dan sejajar paha kaki tumpu, pinggul rata di panel 5, hanya kaki dekat yang menapak, tahan 1 detik.

---

## 6. Single-leg deadlift (`single_leg_deadlift`)

**Cue di app:** Berdiri satu kaki, badan condong ke depan sambil kaki lain lurus ke belakang. Punggung rata, kembali pelan.

### Prompt 1: gambar (9 keyframe, 1:1)

```text
Photorealistic studio photo sheet of one man performing the bodyweight single-leg deadlift, shown as nine sequential keyframes of ONE repetition.

The same man in every panel: an Indonesian man in his late 20s, about 175 cm tall, lean athletic build, short neat black hair, clean-shaven, calm neutral expression with the mouth closed. He wears a fitted short-sleeve slate-blue athletic t-shirt, black athletic shorts that end about 10 cm above the knee, and light grey running shoes with white soles. No hat, no watch, no jewelry, no green clothing. If a character reference image is attached, reproduce exactly that man: same face, hair, build and clothes.

Background: a perfectly flat, uniform chroma key green screen (#00B140) filling the entire panel, with no gradient, no vignette, no wrinkles, no floor line, no horizon and no cast shadow on the ground. Soft, even, shadowless studio lighting. Realistic photograph, sharp focus, natural skin texture. The camera is locked off, perfectly perpendicular to the plane of movement, with no lens distortion and no perspective tilt, at the same distance in every panel.

Output ONE square image (1:1) that contains a 3x3 grid of nine equal square panels, read left to right and top to bottom, separated by thin solid white lines. Panel 1 is top-left, panel 9 is bottom-right. Each panel is one keyframe of the same exercise, in order. No text, no numbers, no labels, no arrows and no frames around the figure. The figure uses the same scale in all nine panels, fits fully inside its panel with at least 8 percent margin on every side, and the planted foot (or the body, for floor exercises) stays at exactly the same position from panel to panel, so that only the movement changes. Everything else (face, clothes, camera distance, background) is identical in all nine panels.

View: exact side profile. He faces the right edge of the panel and the camera sees his right side, so his right arm and right leg are the near limbs and his left arm and left leg are the far limbs. The camera is at hip height.
Exercise: bodyweight single-leg deadlift. He stands on the near (right) leg, which is the working leg, with the knee slightly soft (about 170 degrees). The far (left) leg is the free leg: it starts hanging beside the working leg with the toes hovering about 3 cm above the floor, and it swings straight back. Arms hang straight down, no weights. The standing foot does not move.

Keyframes (join them as one smooth movement; panel 9 must be identical to panel 1):

Panel 1: Standing tall on the near leg, near knee about 170 degrees, free leg straight beside it with the toes hovering above the floor, torso vertical, arms hanging down, eyes straight ahead.
Panel 2: Hinging forward at the hips: torso leaning about 20 degrees forward, free leg beginning to swing back about 10 degrees, back flat, arms hanging straight down.
Panel 3: Torso about 40 degrees forward, free leg raised back about 25 degrees, back flat.
Panel 4: Torso about 60 degrees forward, free leg raised back about 45 degrees, standing knee about 160 degrees, back flat.
Panel 5: Bottom position: torso and free leg together form one long straight line, almost parallel to the floor (torso about 80 degrees forward from vertical, free leg raised back to the same height as the hips), standing knee softly bent about 155 degrees, back flat and neutral, hips square to the side (pelvis not opened), free foot flexed with the toes pointing down, arms hanging straight down from the shoulders, head neutral looking at the floor about 1 meter ahead.
Panel 6: Returning: same pose as panel 4.
Panel 7: Returning: same pose as panel 3.
Panel 8: Returning: same pose as panel 2.
Panel 9: Identical to panel 1.
```

Prompt negatif:

```text
text, numbers, labels, watermark, logo, arrows, extra people, extra limbs, distorted hands, distorted feet, motion blur, shadow on the floor, gradient background, green clothing, cropped head, cropped feet, different clothing between panels, different face between panels, mirrored panels, duplicated panels, 3D render, cartoon, illustration, rounded back, squatting with the standing knee, hips opening up, free foot touching the floor, standing foot hopping, bouncing
```

### Prompt 2: video (satu gambar: panel 1 terpotong = frame pertama)

Model `seedance-2.0-*-image-to-video`. Unggah hanya panel 1 yang sudah dipotong (1:1, tanpa garis putih). **Jangan unggah lembar 3x3.**

```text
Image-to-video. The input image is the first frame: the same man in the start posture of the bodyweight single-leg deadlift. Keep the man, his clothes, the camera framing, his size and position in the frame and the plain green background exactly as in the input image for the whole video, with a single man in the frame. He performs ONE slow, controlled repetition of the bodyweight single-leg deadlift in a single continuous, fluid, natural motion, like real footage of a person exercising: one steady tempo with gentle slowing at the turning points, no cuts, no morphing, no jumps between poses, no flicker. He ends in exactly the same posture as the first frame, so the video loops seamlessly.

Exercise setup: He stands on the near (right) leg, which is the working leg, with the knee slightly soft (about 170 degrees). The far (left) leg is the free leg: it starts hanging beside the working leg with the toes hovering about 3 cm above the floor, and it swings straight back. Arms hang straight down, no weights. The standing foot does not move.

View: exact side profile. He faces the right edge of the frame and the camera sees his right side, so his right arm and right leg are the near limbs and his left arm and left leg are the far limbs. The camera is at hip height.

Movement: He hinges forward from the hips like a seesaw, the torso lowering as the free leg rises straight back, keeps the back flat, pauses briefly, then returns slowly to standing by squeezing the glute of the standing leg.

Key postures (the movement passes through them smoothly and never stops or snaps to them):
- Start posture (the input image): standing tall on the near leg, near knee about 170 degrees, free leg straight beside it with the toes hovering above the floor, torso vertical, arms hanging down, eyes straight ahead.
- Midway posture: torso about 40 degrees forward, free leg raised back about 25 degrees, back flat.
- Peak posture: torso and free leg together form one long straight line, almost parallel to the floor (torso about 80 degrees forward from vertical, free leg raised back to the same height as the hips), standing knee softly bent about 155 degrees, back flat and neutral, hips square to the side (pelvis not opened), free foot flexed with the toes pointing down, arms hanging straight down from the shoulders, head neutral looking at the floor about 1 meter ahead.

Timeline (5 seconds in total):
- 0.0 to 0.4 s: stays still, exactly as in the input image.
- 0.4 to 2.4 s: moves from the start posture to the peak posture in one continuous motion, passing through the midway posture.
- 2.4 to 2.8 s: holds the peak posture briefly.
- 2.8 to 5.0 s: returns to the start posture in one continuous motion, passing through the midway posture in reverse, and ends exactly as in the input image.

Technique rules:
- The movement is a hip hinge: the standing knee only softens slightly, it does not squat.
- Back stays flat, no rounding.
- Hips stay square, the free leg goes straight back without rotating the pelvis open.
- The standing foot stays planted, slow controlled tempo, the free foot does not touch the floor.

Camera and look: square 1:1, 24 fps, a completely static locked-off camera (no pan, zoom, shake or cut). The same flat uniform chroma key green background (#00B140), with no gradient, no floor line, no grid, no white lines and no shadow on the ground, and soft even shadowless lighting that never changes. Same face, slate-blue t-shirt, black shorts and light grey shoes throughout. The full body stays inside the frame with at least 8 percent margin.

Avoid: camera movement, zoom, pan, cut, shake, shadow on the floor, gradient background, green clothing, motion blur, jumping, bouncing, fast or jerky movement, extra limbs, distorted hands, distorted feet, different clothing, different face, text, watermark, logo, extra people, grid, multiple panels, split screen, collage, white lines, multiple copies of the man, morphing, cross-fade, jump between poses, sudden pose change, flicker, changing camera framing, changing scale, changing background, rounded back, squatting with the standing knee, hips opening up, free foot touching the floor, standing foot hopping, bouncing
```

**Periksa hasil:** Punggung rata, kaki bebas dan badan satu garis di panel 5, lutut tumpu hanya sedikit menekuk, pinggul tidak terbuka.

---

## 7. Reverse lunge (`reverse_lunge`)

**Cue di app:** Langkah mundur, turunkan lutut belakang hampir ke lantai. Dorong lewat kaki depan untuk berdiri.

### Prompt 1: gambar (9 keyframe, 1:1)

```text
Photorealistic studio photo sheet of one man performing the reverse lunge, shown as nine sequential keyframes of ONE repetition.

The same man in every panel: an Indonesian man in his late 20s, about 175 cm tall, lean athletic build, short neat black hair, clean-shaven, calm neutral expression with the mouth closed. He wears a fitted short-sleeve slate-blue athletic t-shirt, black athletic shorts that end about 10 cm above the knee, and light grey running shoes with white soles. No hat, no watch, no jewelry, no green clothing. If a character reference image is attached, reproduce exactly that man: same face, hair, build and clothes.

Background: a perfectly flat, uniform chroma key green screen (#00B140) filling the entire panel, with no gradient, no vignette, no wrinkles, no floor line, no horizon and no cast shadow on the ground. Soft, even, shadowless studio lighting. Realistic photograph, sharp focus, natural skin texture. The camera is locked off, perfectly perpendicular to the plane of movement, with no lens distortion and no perspective tilt, at the same distance in every panel.

Output ONE square image (1:1) that contains a 3x3 grid of nine equal square panels, read left to right and top to bottom, separated by thin solid white lines. Panel 1 is top-left, panel 9 is bottom-right. Each panel is one keyframe of the same exercise, in order. No text, no numbers, no labels, no arrows and no frames around the figure. The figure uses the same scale in all nine panels, fits fully inside its panel with at least 8 percent margin on every side, and the planted foot (or the body, for floor exercises) stays at exactly the same position from panel to panel, so that only the movement changes. Everything else (face, clothes, camera distance, background) is identical in all nine panels.

View: exact side profile. He faces the right edge of the panel and the camera sees his right side, so his right arm and right leg are the near limbs and his left arm and left leg are the far limbs. The camera is at hip height.
Exercise: reverse lunge. He starts standing with the feet hip-width apart, both hands on his hips. The near (right) leg steps BACK and the far (left) leg stays as the front leg with the foot planted. No prop.

Keyframes (join them as one smooth movement; panel 9 must be identical to panel 1):

Panel 1: Standing tall, feet hip-width apart, both legs straight, torso vertical, hands on hips.
Panel 2: The near foot lifts and steps back about 20 cm, toes touching the floor, hips beginning to lower, torso vertical.
Panel 3: The near foot is about 50 cm behind, toes on the floor with the heel raised, both knees bent about 130 degrees, torso vertical.
Panel 4: Lowering: front knee about 110 degrees, back knee about 105 degrees, back knee about 20 cm above the floor.
Panel 5: Bottom position: front thigh parallel to the floor (front knee about 90 degrees) with the shin vertical and the knee above the ankle, back knee about 90 degrees and almost touching the floor (about 3 cm above it), back heel raised, torso upright, hands on hips, pelvis level.
Panel 6: Rising: pushing up through the front leg, same pose as panel 4, the back foot begins to leave the floor.
Panel 7: Rising: same pose as panel 3, the back foot moving forward off the floor.
Panel 8: Rising: same pose as panel 2, the back foot almost back beside the front foot.
Panel 9: Identical to panel 1, both feet together at hip width.
```

Prompt negatif:

```text
text, numbers, labels, watermark, logo, arrows, extra people, extra limbs, distorted hands, distorted feet, motion blur, shadow on the floor, gradient background, green clothing, cropped head, cropped feet, different clothing between panels, different face between panels, mirrored panels, duplicated panels, 3D render, cartoon, illustration, front foot sliding, front knee past the toes, torso leaning far forward, back knee slamming into the floor, wide or crossed stance, hopping
```

### Prompt 2: video (satu gambar: panel 1 terpotong = frame pertama)

Model `seedance-2.0-*-image-to-video`. Unggah hanya panel 1 yang sudah dipotong (1:1, tanpa garis putih). **Jangan unggah lembar 3x3.**

```text
Image-to-video. The input image is the first frame: the same man in the start posture of the reverse lunge. Keep the man, his clothes, the camera framing, his size and position in the frame and the plain green background exactly as in the input image for the whole video, with a single man in the frame. He performs ONE slow, controlled repetition of the reverse lunge in a single continuous, fluid, natural motion, like real footage of a person exercising: one steady tempo with gentle slowing at the turning points, no cuts, no morphing, no jumps between poses, no flicker. He ends in exactly the same posture as the first frame, so the video loops seamlessly.

Exercise setup: He starts standing with the feet hip-width apart, both hands on his hips. The near (right) leg steps BACK and the far (left) leg stays as the front leg with the foot planted. No prop.

View: exact side profile. He faces the right edge of the frame and the camera sees his right side, so his right arm and right leg are the near limbs and his left arm and left leg are the far limbs. The camera is at hip height.

Movement: He steps one leg straight back and lowers until the back knee almost touches the floor, pauses briefly, then pushes through the front foot and brings the back foot forward to stand tall again.

Key postures (the movement passes through them smoothly and never stops or snaps to them):
- Start posture (the input image): standing tall, feet hip-width apart, both legs straight, torso vertical, hands on hips.
- Midway posture: the near foot is about 50 cm behind, toes on the floor with the heel raised, both knees bent about 130 degrees, torso vertical.
- Peak posture: front thigh parallel to the floor (front knee about 90 degrees) with the shin vertical and the knee above the ankle, back knee about 90 degrees and almost touching the floor (about 3 cm above it), back heel raised, torso upright, hands on hips, pelvis level.

Timeline (5 seconds in total):
- 0.0 to 0.4 s: stays still, exactly as in the input image.
- 0.4 to 2.4 s: moves from the start posture to the peak posture in one continuous motion, passing through the midway posture.
- 2.4 to 2.8 s: holds the peak posture briefly.
- 2.8 to 5.0 s: returns to the start posture in one continuous motion, passing through the midway posture in reverse, and ends exactly as in the input image.

Technique rules:
- The front foot stays planted and does not move, the front heel stays down.
- Front knee stays above the ankle, torso stays upright.
- The back knee lowers almost to the floor but does not rest on it.
- Stand fully back up, feet hip-width apart, before the next repetition.

Camera and look: square 1:1, 24 fps, a completely static locked-off camera (no pan, zoom, shake or cut). The same flat uniform chroma key green background (#00B140), with no gradient, no floor line, no grid, no white lines and no shadow on the ground, and soft even shadowless lighting that never changes. Same face, slate-blue t-shirt, black shorts and light grey shoes throughout. The full body stays inside the frame with at least 8 percent margin.

Avoid: camera movement, zoom, pan, cut, shake, shadow on the floor, gradient background, green clothing, motion blur, jumping, bouncing, fast or jerky movement, extra limbs, distorted hands, distorted feet, different clothing, different face, text, watermark, logo, extra people, grid, multiple panels, split screen, collage, white lines, multiple copies of the man, morphing, cross-fade, jump between poses, sudden pose change, flicker, changing camera framing, changing scale, changing background, front foot sliding, front knee past the toes, torso leaning far forward, back knee slamming into the floor, wide or crossed stance, hopping
```

**Periksa hasil:** Kaki depan tidak bergeser, lutut belakang hampir menyentuh lantai di panel 5, badan tegak, berdiri tegak di panel 9.

---

## 8. Step-up (`step_up`)

**Cue di app:** Naik ke anak tangga atau bangku dengan satu kaki, dorong sampai lurus. Turun pelan dengan kaki yang sama.

### Prompt 1: gambar (9 keyframe, 1:1)

```text
Photorealistic studio photo sheet of one man performing the step-up, shown as nine sequential keyframes of ONE repetition.

The same man in every panel: an Indonesian man in his late 20s, about 175 cm tall, lean athletic build, short neat black hair, clean-shaven, calm neutral expression with the mouth closed. He wears a fitted short-sleeve slate-blue athletic t-shirt, black athletic shorts that end about 10 cm above the knee, and light grey running shoes with white soles. No hat, no watch, no jewelry, no green clothing. If a character reference image is attached, reproduce exactly that man: same face, hair, build and clothes.

Background: a perfectly flat, uniform chroma key green screen (#00B140) filling the entire panel, with no gradient, no vignette, no wrinkles, no floor line, no horizon and no cast shadow on the ground. Soft, even, shadowless studio lighting. Realistic photograph, sharp focus, natural skin texture. The camera is locked off, perfectly perpendicular to the plane of movement, with no lens distortion and no perspective tilt, at the same distance in every panel.

Output ONE square image (1:1) that contains a 3x3 grid of nine equal square panels, read left to right and top to bottom, separated by thin solid white lines. Panel 1 is top-left, panel 9 is bottom-right. Each panel is one keyframe of the same exercise, in order. No text, no numbers, no labels, no arrows and no frames around the figure. The figure uses the same scale in all nine panels, fits fully inside its panel with at least 8 percent margin on every side, and the planted foot (or the body, for floor exercises) stays at exactly the same position from panel to panel, so that only the movement changes. Everything else (face, clothes, camera distance, background) is identical in all nine panels.

View: exact side profile. He faces the right edge of the panel and the camera sees his right side, so his right arm and right leg are the near limbs and his left arm and left leg are the far limbs. The camera is at hip height.
Prop: A plain dark grey sturdy box about 40 cm high and 50 cm long, placed on the RIGHT side of the panel in front of him (the box is the only prop). Any prop is a plain matte dark grey (#3A3A3C) object with no logo and no green.
Exercise: step-up. The near (right) foot is the working foot, placed flat on top of the box. The far (left) foot is on the floor. Both hands on his hips. He steps up with the near foot and steps down with the same foot leading.

Keyframes (join them as one smooth movement; panel 9 must be identical to panel 1):

Panel 1: Standing facing the box, near foot flat on top of the box, far foot flat on the floor about 20 cm behind the box edge, near knee bent about 100 degrees, torso upright, hands on hips.
Panel 2: Pushing up: weight shifts onto the near foot, far heel lifting, near knee about 120 degrees, torso upright.
Panel 3: Far foot leaving the floor, near knee about 145 degrees, hips rising straight up over the box.
Panel 4: Near knee about 165 degrees, far knee lifting forward, hips above the box.
Panel 5: Top position: standing tall on the box on the near leg with the near knee fully straight (about 180 degrees), the far knee raised to about hip height with the shin hanging down and the foot not touching anything, torso upright, hands on hips, pelvis level.
Panel 6: Lowering: the far foot reaching down toward the floor, near knee about 145 degrees, same pose as panel 3 but descending.
Panel 7: Lowering: near knee about 120 degrees, the far foot just above the floor.
Panel 8: Lowering: the far foot touching the floor lightly in front of the box, near knee about 105 degrees, still on the box.
Panel 9: Identical to panel 1.
```

Prompt negatif:

```text
text, numbers, labels, watermark, logo, arrows, extra people, extra limbs, distorted hands, distorted feet, motion blur, shadow on the floor, gradient background, green clothing, cropped head, cropped feet, different clothing between panels, different face between panels, mirrored panels, duplicated panels, 3D render, cartoon, illustration, pushing off the floor with the far foot, jumping, dropping down fast, torso leaning far forward, knee caving inward, foot hanging off the box
```

### Prompt 2: video (satu gambar: panel 1 terpotong = frame pertama)

Model `seedance-2.0-*-image-to-video`. Unggah hanya panel 1 yang sudah dipotong (1:1, tanpa garis putih). **Jangan unggah lembar 3x3.**

```text
Image-to-video. The input image is the first frame: the same man in the start posture of the step-up. Keep the man, his clothes, the camera framing, his size and position in the frame and the plain green background exactly as in the input image for the whole video, with a single man in the frame. He performs ONE slow, controlled repetition of the step-up in a single continuous, fluid, natural motion, like real footage of a person exercising: one steady tempo with gentle slowing at the turning points, no cuts, no morphing, no jumps between poses, no flicker. He ends in exactly the same posture as the first frame, so the video loops seamlessly.

Exercise setup: The near (right) foot is the working foot, placed flat on top of the box. The far (left) foot is on the floor. Both hands on his hips. He steps up with the near foot and steps down with the same foot leading.

View: exact side profile. He faces the right edge of the frame and the camera sees his right side, so his right arm and right leg are the near limbs and his left arm and left leg are the far limbs. The camera is at hip height. Prop: A plain dark grey sturdy box about 40 cm high and 50 cm long, placed on the RIGHT side of the frame in front of him (the box is the only prop). Any prop is a plain matte dark grey (#3A3A3C) object with no logo and no green.

Movement: He drives up through the near foot on the box until the near leg is fully straight and the other knee lifts, pauses briefly standing tall, then lowers slowly and controlled with the same near leg until the other foot touches the floor.

Key postures (the movement passes through them smoothly and never stops or snaps to them):
- Start posture (the input image): standing facing the box, near foot flat on top of the box, far foot flat on the floor about 20 cm behind the box edge, near knee bent about 100 degrees, torso upright, hands on hips.
- Midway posture: far foot leaving the floor, near knee about 145 degrees, hips rising straight up over the box.
- Peak posture: standing tall on the box on the near leg with the near knee fully straight (about 180 degrees), the far knee raised to about hip height with the shin hanging down and the foot not touching anything, torso upright, hands on hips, pelvis level.

Timeline (5 seconds in total):
- 0.0 to 0.4 s: stays still, exactly as in the input image.
- 0.4 to 2.0 s: moves from the start posture to the peak posture in one continuous motion, passing through the midway posture.
- 2.0 to 2.6 s: holds the peak posture briefly.
- 2.6 to 5.0 s: returns to the start posture in one continuous motion, passing through the midway posture in reverse, and ends exactly as in the input image.

Technique rules:
- The near foot stays flat on the box and does all the work, the far foot does not push off the floor.
- Stand fully tall at the top with the near knee straight.
- Lower slowly with control, no dropping or jumping down.
- Torso stays upright, pelvis stays level.

Camera and look: square 1:1, 24 fps, a completely static locked-off camera (no pan, zoom, shake or cut). The same flat uniform chroma key green background (#00B140), with no gradient, no floor line, no grid, no white lines and no shadow on the ground, and soft even shadowless lighting that never changes. Same face, slate-blue t-shirt, black shorts and light grey shoes throughout. The full body stays inside the frame with at least 8 percent margin.

Avoid: camera movement, zoom, pan, cut, shake, shadow on the floor, gradient background, green clothing, motion blur, jumping, bouncing, fast or jerky movement, extra limbs, distorted hands, distorted feet, different clothing, different face, text, watermark, logo, extra people, grid, multiple panels, split screen, collage, white lines, multiple copies of the man, morphing, cross-fade, jump between poses, sudden pose change, flicker, changing camera framing, changing scale, changing background, pushing off the floor with the far foot, jumping, dropping down fast, torso leaning far forward, knee caving inward, foot hanging off the box
```

**Periksa hasil:** Kaki dekat menapak penuh di bangku, lutut lurus di panel 5, turun pelan dengan kaki yang sama, badan tegak.

---

## 9. Calf raise (`calf_raise`)

**Cue di app:** Berdiri di ujung kaki, naik setinggi mungkin, tahan 1 detik, turun pelan.

### Prompt 1: gambar (9 keyframe, 1:1)

```text
Photorealistic studio photo sheet of one man performing the standing calf raise, shown as nine sequential keyframes of ONE repetition.

The same man in every panel: an Indonesian man in his late 20s, about 175 cm tall, lean athletic build, short neat black hair, clean-shaven, calm neutral expression with the mouth closed. He wears a fitted short-sleeve slate-blue athletic t-shirt, black athletic shorts that end about 10 cm above the knee, and light grey running shoes with white soles. No hat, no watch, no jewelry, no green clothing. If a character reference image is attached, reproduce exactly that man: same face, hair, build and clothes.

Background: a perfectly flat, uniform chroma key green screen (#00B140) filling the entire panel, with no gradient, no vignette, no wrinkles, no floor line, no horizon and no cast shadow on the ground. Soft, even, shadowless studio lighting. Realistic photograph, sharp focus, natural skin texture. The camera is locked off, perfectly perpendicular to the plane of movement, with no lens distortion and no perspective tilt, at the same distance in every panel.

Output ONE square image (1:1) that contains a 3x3 grid of nine equal square panels, read left to right and top to bottom, separated by thin solid white lines. Panel 1 is top-left, panel 9 is bottom-right. Each panel is one keyframe of the same exercise, in order. No text, no numbers, no labels, no arrows and no frames around the figure. The figure uses the same scale in all nine panels, fits fully inside its panel with at least 8 percent margin on every side, and the planted foot (or the body, for floor exercises) stays at exactly the same position from panel to panel, so that only the movement changes. Everything else (face, clothes, camera distance, background) is identical in all nine panels.

View: exact side profile. He faces the right edge of the panel and the camera sees his right side, so his right arm and right leg are the near limbs and his left arm and left leg are the far limbs. The camera is at hip height.
Exercise: standing calf raise. He stands on a flat floor with the feet hip-width apart and parallel, both hands on his hips. No prop.

Keyframes (join them as one smooth movement; panel 9 must be identical to panel 1):

Panel 1: Standing tall on both feet flat, legs straight, torso vertical, hands on hips, eyes straight ahead.
Panel 2: Heels lifting about 3 cm off the floor, knees straight, torso vertical.
Panel 3: Heels about 7 cm off the floor, weight on the balls of the feet.
Panel 4: Heels about 11 cm off the floor, ankles strongly extended.
Panel 5: Top position: rising as high as possible onto the balls of both feet, heels about 15 cm off the floor, ankles fully extended, knees straight (180 degrees), torso tall and vertical, hips stacked over the balls of the feet.
Panel 6: Lowering: same pose as panel 4.
Panel 7: Lowering: same pose as panel 3.
Panel 8: Lowering: same pose as panel 2, heels just above the floor.
Panel 9: Identical to panel 1, heels on the floor.
```

Prompt negatif:

```text
text, numbers, labels, watermark, logo, arrows, extra people, extra limbs, distorted hands, distorted feet, motion blur, shadow on the floor, gradient background, green clothing, cropped head, cropped feet, different clothing between panels, different face between panels, mirrored panels, duplicated panels, 3D render, cartoon, illustration, bending the knees, ankles rolling outward, swaying forward, bouncing, hopping, heels dropping fast
```

### Prompt 2: video (satu gambar: panel 1 terpotong = frame pertama)

Model `seedance-2.0-*-image-to-video`. Unggah hanya panel 1 yang sudah dipotong (1:1, tanpa garis putih). **Jangan unggah lembar 3x3.**

```text
Image-to-video. The input image is the first frame: the same man in the start posture of the standing calf raise. Keep the man, his clothes, the camera framing, his size and position in the frame and the plain green background exactly as in the input image for the whole video, with a single man in the frame. He performs ONE slow, controlled repetition of the standing calf raise in a single continuous, fluid, natural motion, like real footage of a person exercising: one steady tempo with gentle slowing at the turning points, no cuts, no morphing, no jumps between poses, no flicker. He ends in exactly the same posture as the first frame, so the video loops seamlessly.

Exercise setup: He stands on a flat floor with the feet hip-width apart and parallel, both hands on his hips. No prop.

View: exact side profile. He faces the right edge of the frame and the camera sees his right side, so his right arm and right leg are the near limbs and his left arm and left leg are the far limbs. The camera is at hip height.

Movement: He rises up onto the balls of his feet as high as he can, holds the top position for one second, then lowers slowly and under control until the heels touch the floor.

Key postures (the movement passes through them smoothly and never stops or snaps to them):
- Start posture (the input image): standing tall on both feet flat, legs straight, torso vertical, hands on hips, eyes straight ahead.
- Midway posture: heels about 7 cm off the floor, weight on the balls of the feet.
- Peak posture: rising as high as possible onto the balls of both feet, heels about 15 cm off the floor, ankles fully extended, knees straight (180 degrees), torso tall and vertical, hips stacked over the balls of the feet.

Timeline (5 seconds in total):
- 0.0 to 0.4 s: stays still, exactly as in the input image.
- 0.4 to 1.6 s: moves from the start posture to the peak posture in one continuous motion, passing through the midway posture.
- 1.6 to 2.6 s: holds the peak posture briefly.
- 2.6 to 5.0 s: returns to the start posture in one continuous motion, passing through the midway posture in reverse, and ends exactly as in the input image.

Technique rules:
- Knees stay straight the whole time, no bending.
- Rise as high as possible, the ankles stay upright (no rolling outward).
- Hold the top for about 1 second.
- Lower slowly (the lowering is about twice as long as the rising), the body stays upright, no swaying.

Camera and look: square 1:1, 24 fps, a completely static locked-off camera (no pan, zoom, shake or cut). The same flat uniform chroma key green background (#00B140), with no gradient, no floor line, no grid, no white lines and no shadow on the ground, and soft even shadowless lighting that never changes. Same face, slate-blue t-shirt, black shorts and light grey shoes throughout. The full body stays inside the frame with at least 8 percent margin.

Avoid: camera movement, zoom, pan, cut, shake, shadow on the floor, gradient background, green clothing, motion blur, jumping, bouncing, fast or jerky movement, extra limbs, distorted hands, distorted feet, different clothing, different face, text, watermark, logo, extra people, grid, multiple panels, split screen, collage, white lines, multiple copies of the man, morphing, cross-fade, jump between poses, sudden pose change, flicker, changing camera framing, changing scale, changing background, bending the knees, ankles rolling outward, swaying forward, bouncing, hopping, heels dropping fast
```

**Periksa hasil:** Lutut lurus, tumit naik setinggi mungkin di panel 5, tahan 1 detik, turun lebih lambat dari naik.

---

## 10. Single-leg calf raise (`single_leg_calf_raise`)

**Cue di app:** Seperti calf raise dengan satu kaki. Pegang dinding untuk keseimbangan.

### Prompt 1: gambar (9 keyframe, 1:1)

```text
Photorealistic studio photo sheet of one man performing the single-leg calf raise, shown as nine sequential keyframes of ONE repetition.

The same man in every panel: an Indonesian man in his late 20s, about 175 cm tall, lean athletic build, short neat black hair, clean-shaven, calm neutral expression with the mouth closed. He wears a fitted short-sleeve slate-blue athletic t-shirt, black athletic shorts that end about 10 cm above the knee, and light grey running shoes with white soles. No hat, no watch, no jewelry, no green clothing. If a character reference image is attached, reproduce exactly that man: same face, hair, build and clothes.

Background: a perfectly flat, uniform chroma key green screen (#00B140) filling the entire panel, with no gradient, no vignette, no wrinkles, no floor line, no horizon and no cast shadow on the ground. Soft, even, shadowless studio lighting. Realistic photograph, sharp focus, natural skin texture. The camera is locked off, perfectly perpendicular to the plane of movement, with no lens distortion and no perspective tilt, at the same distance in every panel.

Output ONE square image (1:1) that contains a 3x3 grid of nine equal square panels, read left to right and top to bottom, separated by thin solid white lines. Panel 1 is top-left, panel 9 is bottom-right. Each panel is one keyframe of the same exercise, in order. No text, no numbers, no labels, no arrows and no frames around the figure. The figure uses the same scale in all nine panels, fits fully inside its panel with at least 8 percent margin on every side, and the planted foot (or the body, for floor exercises) stays at exactly the same position from panel to panel, so that only the movement changes. Everything else (face, clothes, camera distance, background) is identical in all nine panels.

View: exact side profile. He faces the right edge of the panel and the camera sees his right side, so his right arm and right leg are the near limbs and his left arm and left leg are the far limbs. The camera is at hip height.
Prop: A plain dark grey vertical wall panel about 1.4 m tall standing at the RIGHT edge of the panel in front of him, used only for balance. Any prop is a plain matte dark grey (#3A3A3C) object with no logo and no green.
Exercise: single-leg calf raise. He stands on the near (right) leg only, which is the working leg. The far (left) leg is bent about 90 degrees with the foot raised behind him (shin roughly parallel to the floor), not touching the standing leg or the floor. His near hand rests with the fingertips lightly on the wall panel at shoulder height, the arm slightly bent. Only a light touch for balance, no pushing.

Keyframes (join them as one smooth movement; panel 9 must be identical to panel 1):

Panel 1: Standing tall on the near foot flat, far foot raised behind with the knee bent about 90 degrees, near fingertips lightly touching the wall, torso vertical.
Panel 2: Near heel lifting about 3 cm, near knee straight.
Panel 3: Near heel about 7 cm off the floor.
Panel 4: Near heel about 11 cm off the floor.
Panel 5: Top position: rising as high as possible onto the ball of the near foot, heel about 15 cm off the floor, ankle fully extended, near knee straight (180 degrees), torso tall and vertical, far foot still raised behind, fingertips lightly on the wall.
Panel 6: Lowering: same pose as panel 4.
Panel 7: Lowering: same pose as panel 3.
Panel 8: Lowering: same pose as panel 2, heel just above the floor.
Panel 9: Identical to panel 1, near heel on the floor.
```

Prompt negatif:

```text
text, numbers, labels, watermark, logo, arrows, extra people, extra limbs, distorted hands, distorted feet, motion blur, shadow on the floor, gradient background, green clothing, cropped head, cropped feet, different clothing between panels, different face between panels, mirrored panels, duplicated panels, 3D render, cartoon, illustration, far foot touching the floor, bending the working knee, leaning on the wall, ankle rolling outward, hopping, swaying
```

### Prompt 2: video (satu gambar: panel 1 terpotong = frame pertama)

Model `seedance-2.0-*-image-to-video`. Unggah hanya panel 1 yang sudah dipotong (1:1, tanpa garis putih). **Jangan unggah lembar 3x3.**

```text
Image-to-video. The input image is the first frame: the same man in the start posture of the single-leg calf raise. Keep the man, his clothes, the camera framing, his size and position in the frame and the plain green background exactly as in the input image for the whole video, with a single man in the frame. He performs ONE slow, controlled repetition of the single-leg calf raise in a single continuous, fluid, natural motion, like real footage of a person exercising: one steady tempo with gentle slowing at the turning points, no cuts, no morphing, no jumps between poses, no flicker. He ends in exactly the same posture as the first frame, so the video loops seamlessly.

Exercise setup: He stands on the near (right) leg only, which is the working leg. The far (left) leg is bent about 90 degrees with the foot raised behind him (shin roughly parallel to the floor), not touching the standing leg or the floor. His near hand rests with the fingertips lightly on the wall panel at shoulder height, the arm slightly bent. Only a light touch for balance, no pushing.

View: exact side profile. He faces the right edge of the frame and the camera sees his right side, so his right arm and right leg are the near limbs and his left arm and left leg are the far limbs. The camera is at hip height. Prop: A plain dark grey vertical wall panel about 1.4 m tall standing at the RIGHT edge of the frame in front of him, used only for balance. Any prop is a plain matte dark grey (#3A3A3C) object with no logo and no green.

Movement: He rises up onto the ball of the near foot as high as possible with the other foot held off the floor behind him, holds the top for one second, then lowers slowly and under control, with fingertips lightly on the wall for balance.

Key postures (the movement passes through them smoothly and never stops or snaps to them):
- Start posture (the input image): standing tall on the near foot flat, far foot raised behind with the knee bent about 90 degrees, near fingertips lightly touching the wall, torso vertical.
- Midway posture: near heel about 7 cm off the floor.
- Peak posture: rising as high as possible onto the ball of the near foot, heel about 15 cm off the floor, ankle fully extended, near knee straight (180 degrees), torso tall and vertical, far foot still raised behind, fingertips lightly on the wall.

Timeline (5 seconds in total):
- 0.0 to 0.4 s: stays still, exactly as in the input image.
- 0.4 to 1.6 s: moves from the start posture to the peak posture in one continuous motion, passing through the midway posture.
- 1.6 to 2.6 s: holds the peak posture briefly.
- 2.6 to 5.0 s: returns to the start posture in one continuous motion, passing through the midway posture in reverse, and ends exactly as in the input image.

Technique rules:
- Only the near foot touches the floor, the far foot never touches down.
- The near knee stays straight, the ankle stays upright, no rolling outward.
- The hand only touches the wall lightly for balance, it does not pull or push.
- Hold the top for about 1 second, lower slowly.

Camera and look: square 1:1, 24 fps, a completely static locked-off camera (no pan, zoom, shake or cut). The same flat uniform chroma key green background (#00B140), with no gradient, no floor line, no grid, no white lines and no shadow on the ground, and soft even shadowless lighting that never changes. Same face, slate-blue t-shirt, black shorts and light grey shoes throughout. The full body stays inside the frame with at least 8 percent margin.

Avoid: camera movement, zoom, pan, cut, shake, shadow on the floor, gradient background, green clothing, motion blur, jumping, bouncing, fast or jerky movement, extra limbs, distorted hands, distorted feet, different clothing, different face, text, watermark, logo, extra people, grid, multiple panels, split screen, collage, white lines, multiple copies of the man, morphing, cross-fade, jump between poses, sudden pose change, flicker, changing camera framing, changing scale, changing background, far foot touching the floor, bending the working knee, leaning on the wall, ankle rolling outward, hopping, swaying
```

**Periksa hasil:** Hanya satu kaki menapak, lutut lurus, tumit naik setinggi mungkin di panel 5, tangan hanya menyentuh dinding.

---

## 11. Plank (`plank`)

**Cue di app:** Bertumpu lengan bawah dan ujung kaki. Badan lurus dari kepala ke tumit, perut dikencangkan.

### Prompt 1: gambar (9 keyframe, 1:1)

```text
Photorealistic studio photo sheet of one man performing the forearm plank, shown as nine sequential keyframes of ONE repetition.

The same man in every panel: an Indonesian man in his late 20s, about 175 cm tall, lean athletic build, short neat black hair, clean-shaven, calm neutral expression with the mouth closed. He wears a fitted short-sleeve slate-blue athletic t-shirt, black athletic shorts that end about 10 cm above the knee, and light grey running shoes with white soles. No hat, no watch, no jewelry, no green clothing. If a character reference image is attached, reproduce exactly that man: same face, hair, build and clothes.

Background: a perfectly flat, uniform chroma key green screen (#00B140) filling the entire panel, with no gradient, no vignette, no wrinkles, no floor line, no horizon and no cast shadow on the ground. Soft, even, shadowless studio lighting. Realistic photograph, sharp focus, natural skin texture. The camera is locked off, perfectly perpendicular to the plane of movement, with no lens distortion and no perspective tilt, at the same distance in every panel.

Output ONE square image (1:1) that contains a 3x3 grid of nine equal square panels, read left to right and top to bottom, separated by thin solid white lines. Panel 1 is top-left, panel 9 is bottom-right. Each panel is one keyframe of the same exercise, in order. No text, no numbers, no labels, no arrows and no frames around the figure. The figure uses the same scale in all nine panels, fits fully inside its panel with at least 8 percent margin on every side, and the planted foot (or the body, for floor exercises) stays at exactly the same position from panel to panel, so that only the movement changes. Everything else (face, clothes, camera distance, background) is identical in all nine panels.

View: exact side profile at low camera height (about 40 cm above the floor). He faces the right edge of the panel, the camera sees his right side, so his right arm and right leg are the near limbs and his left arm and left leg are the far limbs. There is no mat and no visible floor.
Exercise: forearm plank. He comes from kneeling on forearms and knees into a full forearm plank, holds it, then lowers back to the knees. The forearms are flat on the floor, parallel and pointing forward, elbows directly below the shoulders.

Keyframes (join them as one smooth movement; panel 9 must be identical to panel 1):

Panel 1: Start: kneeling on the forearms and knees, forearms flat on the floor pointing forward with the elbows directly below the shoulders, thighs vertical, hips just above the knees, back flat, head neutral looking down at the floor.
Panel 2: Starting to extend: the near knee lifts off the floor and the near foot moves back, hips staying low.
Panel 3: Both knees lifting: the legs extending backward with the toes on the floor, hips still slightly above the straight line.
Panel 4: Almost in full plank: legs nearly straight, hips settling into line, toes on the floor.
Panel 5: Hold position: full forearm plank, forearms flat on the floor with the upper arms vertical and the elbows directly below the shoulders, toes on the floor, body one straight line from the back of the head to the heels, hips neither sagging nor piking, glutes and abs braced, neck neutral with eyes looking at the floor about 30 cm ahead of the hands.
Panel 6: Hold position with a tiny breathing movement: identical to panel 5 apart from a very slight rise of the ribcage.
Panel 7: Lowering: both knees returning toward the floor, same pose as panel 3 in reverse.
Panel 8: Lowering: knees touching the floor, same pose as panel 2 in reverse.
Panel 9: Identical to panel 1.
```

Prompt negatif:

```text
text, numbers, labels, watermark, logo, arrows, extra people, extra limbs, distorted hands, distorted feet, motion blur, shadow on the floor, gradient background, green clothing, cropped head, cropped feet, different clothing between panels, different face between panels, mirrored panels, duplicated panels, 3D render, cartoon, illustration, sagging hips, raised hips (pike), head dropping, elbows ahead of the shoulders, arched lower back, shaking body, hands clasped overhead
```

### Prompt 2: video (satu gambar: panel 1 terpotong = frame pertama)

Model `seedance-2.0-*-image-to-video`. Unggah hanya panel 1 yang sudah dipotong (1:1, tanpa garis putih). **Jangan unggah lembar 3x3.**

```text
Image-to-video. The input image is the first frame: the same man in the start posture of the forearm plank. Keep the man, his clothes, the camera framing, his size and position in the frame and the plain green background exactly as in the input image for the whole video, with a single man in the frame. He performs ONE slow, controlled repetition of the forearm plank in a single continuous, fluid, natural motion, like real footage of a person exercising: one steady tempo with gentle slowing at the turning points, no cuts, no morphing, no jumps between poses, no flicker. He ends in exactly the same posture as the first frame, so the video loops seamlessly.

Exercise setup: He comes from kneeling on forearms and knees into a full forearm plank, holds it, then lowers back to the knees. The forearms are flat on the floor, parallel and pointing forward, elbows directly below the shoulders.

View: exact side profile at low camera height (about 40 cm above the floor). He faces the right edge of the frame, the camera sees his right side, so his right arm and right leg are the near limbs and his left arm and left leg are the far limbs. There is no mat and no visible floor.

Movement: He moves from kneeling into a straight forearm plank, holds it steady for about two seconds with only a very slight breathing movement of the ribcage and no other movement, then lowers his knees back to the floor.

Key postures (the movement passes through them smoothly and never stops or snaps to them):
- Start posture (the input image): kneeling on the forearms and knees, forearms flat on the floor pointing forward with the elbows directly below the shoulders, thighs vertical, hips just above the knees, back flat, head neutral looking down at the floor.
- Midway posture: both knees lifting: the legs extending backward with the toes on the floor, hips still slightly above the straight line.
- Peak posture: full forearm plank, forearms flat on the floor with the upper arms vertical and the elbows directly below the shoulders, toes on the floor, body one straight line from the back of the head to the heels, hips neither sagging nor piking, glutes and abs braced, neck neutral with eyes looking at the floor about 30 cm ahead of the hands.

Timeline (5 seconds in total):
- 0.0 to 0.4 s: stays still, exactly as in the input image.
- 0.4 to 1.6 s: moves from the start posture to the peak posture in one continuous motion, passing through the midway posture.
- 1.6 to 3.6 s: holds the peak posture perfectly steady, with only a very slight breathing movement of the ribcage.
- 3.6 to 5.0 s: returns to the start posture in one continuous motion, passing through the midway posture in reverse, and ends exactly as in the input image.

Technique rules:
- In the plank the body is one straight line from head to heels, hips do not sag and do not rise.
- Elbows stay directly under the shoulders, forearms stay flat and in place.
- Neck stays neutral, the eyes look at the floor.
- During the hold only the breathing moves, the body stays perfectly still.

Camera and look: square 1:1, 24 fps, a completely static locked-off camera (no pan, zoom, shake or cut). The same flat uniform chroma key green background (#00B140), with no gradient, no floor line, no grid, no white lines and no shadow on the ground, and soft even shadowless lighting that never changes. Same face, slate-blue t-shirt, black shorts and light grey shoes throughout. The full body stays inside the frame with at least 8 percent margin.

Avoid: camera movement, zoom, pan, cut, shake, shadow on the floor, gradient background, green clothing, motion blur, jumping, bouncing, fast or jerky movement, extra limbs, distorted hands, distorted feet, different clothing, different face, text, watermark, logo, extra people, grid, multiple panels, split screen, collage, white lines, multiple copies of the man, morphing, cross-fade, jump between poses, sudden pose change, flicker, changing camera framing, changing scale, changing background, sagging hips, raised hips (pike), head dropping, elbows ahead of the shoulders, arched lower back, shaking body, hands clasped overhead
```

**Periksa hasil:** Badan lurus kepala ke tumit di panel 5, siku di bawah bahu, pinggul tidak turun atau naik, panel 9 = panel 1.

---

## 12. Side plank (`side_plank`)

**Cue di app:** Bertumpu satu lengan bawah, badan miring dan lurus. Pinggul jangan turun.

### Prompt 1: gambar (9 keyframe, 1:1)

```text
Photorealistic studio photo sheet of one man performing the side plank, shown as nine sequential keyframes of ONE repetition.

The same man in every panel: an Indonesian man in his late 20s, about 175 cm tall, lean athletic build, short neat black hair, clean-shaven, calm neutral expression with the mouth closed. He wears a fitted short-sleeve slate-blue athletic t-shirt, black athletic shorts that end about 10 cm above the knee, and light grey running shoes with white soles. No hat, no watch, no jewelry, no green clothing. If a character reference image is attached, reproduce exactly that man: same face, hair, build and clothes.

Background: a perfectly flat, uniform chroma key green screen (#00B140) filling the entire panel, with no gradient, no vignette, no wrinkles, no floor line, no horizon and no cast shadow on the ground. Soft, even, shadowless studio lighting. Realistic photograph, sharp focus, natural skin texture. The camera is locked off, perfectly perpendicular to the plane of movement, with no lens distortion and no perspective tilt, at the same distance in every panel.

Output ONE square image (1:1) that contains a 3x3 grid of nine equal square panels, read left to right and top to bottom, separated by thin solid white lines. Panel 1 is top-left, panel 9 is bottom-right. Each panel is one keyframe of the same exercise, in order. No text, no numbers, no labels, no arrows and no frames around the figure. The figure uses the same scale in all nine panels, fits fully inside its panel with at least 8 percent margin on every side, and the planted foot (or the body, for floor exercises) stays at exactly the same position from panel to panel, so that only the movement changes. Everything else (face, clothes, camera distance, background) is identical in all nine panels.

View: front view, the camera faces his chest squarely at the height of his torso. His body lies horizontally across the panel with his head toward the left edge and his feet toward the right edge, resting on his right side (his right forearm is the supporting arm). There is no mat and no visible floor.
Exercise: side plank. He lies on his right side with his legs stacked. The right forearm lies flat on the floor with the elbow directly below the right shoulder, perpendicular to his body line and pointing toward the camera. The left arm rests on his left hip. He lifts into a side plank, holds it, then lowers his hips to the floor.

Keyframes (join them as one smooth movement; panel 9 must be identical to panel 1):

Panel 1: Start: lying on his right side, hips on the floor, legs straight and stacked, the right forearm flat on the floor with the elbow below the shoulder, left hand resting on the left hip, head in line with the spine.
Panel 2: Hips starting to lift: the hips about 8 cm off the floor, the legs stacked and straight.
Panel 3: Hips about 20 cm off the floor, body forming a shallow angle with the floor.
Panel 4: Hips about 32 cm off the floor, almost a straight line.
Panel 5: Hold position: full side plank, body one straight line from the head through the hips to the stacked feet, the hips lifted high and not dropping, the right elbow directly below the right shoulder with the forearm flat on the floor, the left hand resting on the left hip, the chest facing the camera (no rotation forward or backward), neck neutral.
Panel 6: Hold position with a tiny breathing movement: identical to panel 5 apart from a very slight rise of the ribcage.
Panel 7: Lowering: hips about 20 cm off the floor, same pose as panel 3 in reverse.
Panel 8: Lowering: hips about 8 cm off the floor, same pose as panel 2 in reverse.
Panel 9: Identical to panel 1.
```

Prompt negatif:

```text
text, numbers, labels, watermark, logo, arrows, extra people, extra limbs, distorted hands, distorted feet, motion blur, shadow on the floor, gradient background, green clothing, cropped head, cropped feet, different clothing between panels, different face between panels, mirrored panels, duplicated panels, 3D render, cartoon, illustration, hips dropping, hips piking up, body rolling forward or backward, elbow far from the shoulder, legs bent or apart, head dropping
```

### Prompt 2: video (satu gambar: panel 1 terpotong = frame pertama)

Model `seedance-2.0-*-image-to-video`. Unggah hanya panel 1 yang sudah dipotong (1:1, tanpa garis putih). **Jangan unggah lembar 3x3.**

```text
Image-to-video. The input image is the first frame: the same man in the start posture of the side plank. Keep the man, his clothes, the camera framing, his size and position in the frame and the plain green background exactly as in the input image for the whole video, with a single man in the frame. He performs ONE slow, controlled repetition of the side plank in a single continuous, fluid, natural motion, like real footage of a person exercising: one steady tempo with gentle slowing at the turning points, no cuts, no morphing, no jumps between poses, no flicker. He ends in exactly the same posture as the first frame, so the video loops seamlessly.

Exercise setup: He lies on his right side with his legs stacked. The right forearm lies flat on the floor with the elbow directly below the right shoulder, perpendicular to his body line and pointing toward the camera. The left arm rests on his left hip. He lifts into a side plank, holds it, then lowers his hips to the floor.

View: front view, the camera faces his chest squarely at the height of his torso. His body lies horizontally across the frame with his head toward the left edge and his feet toward the right edge, resting on his right side (his right forearm is the supporting arm). There is no mat and no visible floor.

Movement: He lifts his hips from the floor into a straight side plank supported by the forearm and the side of the feet, holds it steady for about two seconds with only a very slight breathing movement, then lowers his hips back to the floor.

Key postures (the movement passes through them smoothly and never stops or snaps to them):
- Start posture (the input image): lying on his right side, hips on the floor, legs straight and stacked, the right forearm flat on the floor with the elbow below the shoulder, left hand resting on the left hip, head in line with the spine.
- Midway posture: hips about 20 cm off the floor, body forming a shallow angle with the floor.
- Peak posture: full side plank, body one straight line from the head through the hips to the stacked feet, the hips lifted high and not dropping, the right elbow directly below the right shoulder with the forearm flat on the floor, the left hand resting on the left hip, the chest facing the camera (no rotation forward or backward), neck neutral.

Timeline (5 seconds in total):
- 0.0 to 0.4 s: stays still, exactly as in the input image.
- 0.4 to 1.6 s: moves from the start posture to the peak posture in one continuous motion, passing through the midway posture.
- 1.6 to 3.6 s: holds the peak posture perfectly steady, with only a very slight breathing movement of the ribcage.
- 3.6 to 5.0 s: returns to the start posture in one continuous motion, passing through the midway posture in reverse, and ends exactly as in the input image.

Technique rules:
- In the hold the body is one straight line from head to feet, the hips do not drop or pike.
- The elbow stays directly below the shoulder, the chest faces the camera, no rolling forward or backward.
- The legs stay stacked and straight.
- During the hold only the breathing moves.

Camera and look: square 1:1, 24 fps, a completely static locked-off camera (no pan, zoom, shake or cut). The same flat uniform chroma key green background (#00B140), with no gradient, no floor line, no grid, no white lines and no shadow on the ground, and soft even shadowless lighting that never changes. Same face, slate-blue t-shirt, black shorts and light grey shoes throughout. The full body stays inside the frame with at least 8 percent margin.

Avoid: camera movement, zoom, pan, cut, shake, shadow on the floor, gradient background, green clothing, motion blur, jumping, bouncing, fast or jerky movement, extra limbs, distorted hands, distorted feet, different clothing, different face, text, watermark, logo, extra people, grid, multiple panels, split screen, collage, white lines, multiple copies of the man, morphing, cross-fade, jump between poses, sudden pose change, flicker, changing camera framing, changing scale, changing background, hips dropping, hips piking up, body rolling forward or backward, elbow far from the shoulder, legs bent or apart, head dropping
```

**Periksa hasil:** Badan lurus dari kepala ke kaki di panel 5, pinggul tinggi, siku di bawah bahu, dada menghadap kamera.

---

## 13. Dead bug (`dead_bug`)

**Cue di app:** Berbaring, lengan dan lutut ke atas. Turunkan lengan dan kaki yang berlawanan pelan, punggung bawah tetap menempel lantai.

### Prompt 1: gambar (9 keyframe, 1:1)

```text
Photorealistic studio photo sheet of one man performing the dead bug, shown as nine sequential keyframes of ONE repetition.

The same man in every panel: an Indonesian man in his late 20s, about 175 cm tall, lean athletic build, short neat black hair, clean-shaven, calm neutral expression with the mouth closed. He wears a fitted short-sleeve slate-blue athletic t-shirt, black athletic shorts that end about 10 cm above the knee, and light grey running shoes with white soles. No hat, no watch, no jewelry, no green clothing. If a character reference image is attached, reproduce exactly that man: same face, hair, build and clothes.

Background: a perfectly flat, uniform chroma key green screen (#00B140) filling the entire panel, with no gradient, no vignette, no wrinkles, no floor line, no horizon and no cast shadow on the ground. Soft, even, shadowless studio lighting. Realistic photograph, sharp focus, natural skin texture. The camera is locked off, perfectly perpendicular to the plane of movement, with no lens distortion and no perspective tilt, at the same distance in every panel.

Output ONE square image (1:1) that contains a 3x3 grid of nine equal square panels, read left to right and top to bottom, separated by thin solid white lines. Panel 1 is top-left, panel 9 is bottom-right. Each panel is one keyframe of the same exercise, in order. No text, no numbers, no labels, no arrows and no frames around the figure. The figure uses the same scale in all nine panels, fits fully inside its panel with at least 8 percent margin on every side, and the planted foot (or the body, for floor exercises) stays at exactly the same position from panel to panel, so that only the movement changes. Everything else (face, clothes, camera distance, background) is identical in all nine panels.

View: exact side profile at floor level, camera about 30 cm above the floor. He lies with his head toward the left edge of the panel and his feet toward the right edge. The camera sees his right side, so his right arm and right leg are the near limbs and his left arm and left leg are the far limbs. There is no mat and no visible floor.
Exercise: dead bug. He lies on his back in the tabletop position: both arms straight and pointing straight up to the ceiling, both hips and knees bent 90 degrees with the shins parallel to the floor. In this video the NEAR (right) arm and the FAR (left) leg move together. The lower back stays pressed to the floor the whole time.

Keyframes (join them as one smooth movement; panel 9 must be identical to panel 1):

Panel 1: Start: lying on his back, both arms straight up toward the ceiling (vertical), both hips bent 90 degrees and both knees bent 90 degrees with the shins parallel to the floor, lower back flat on the floor, head and shoulders on the floor.
Panel 2: The near arm begins to lower backward over his head (about 20 degrees from vertical) while the far leg begins to straighten (knee about 120 degrees). The other arm stays vertical and the near leg stays in tabletop.
Panel 3: The near arm about 45 degrees from vertical, the far leg about 150 degrees at the knee and lowering.
Panel 4: The near arm about 70 degrees from vertical, the far leg almost straight and about 40 degrees above the floor.
Panel 5: Bottom position: the near arm straight overhead and hovering about 10 cm above the floor, the far leg fully straight and hovering about 10 cm above the floor, the other arm still vertical and the near leg still in tabletop (hip 90 degrees, knee 90 degrees), the lower back pressed flat to the floor with no arch, ribs down, head and shoulders on the floor.
Panel 6: Returning: same pose as panel 4.
Panel 7: Returning: same pose as panel 3.
Panel 8: Returning: same pose as panel 2.
Panel 9: Identical to panel 1.
```

Prompt negatif:

```text
text, numbers, labels, watermark, logo, arrows, extra people, extra limbs, distorted hands, distorted feet, motion blur, shadow on the floor, gradient background, green clothing, cropped head, cropped feet, different clothing between panels, different face between panels, mirrored panels, duplicated panels, 3D render, cartoon, illustration, arched lower back, lifting the head, ribs flaring, moving the same-side arm and leg, fast swinging, arm or leg touching the floor
```

### Prompt 2: video (satu gambar: panel 1 terpotong = frame pertama)

Model `seedance-2.0-*-image-to-video`. Unggah hanya panel 1 yang sudah dipotong (1:1, tanpa garis putih). **Jangan unggah lembar 3x3.**

```text
Image-to-video. The input image is the first frame: the same man in the start posture of the dead bug. Keep the man, his clothes, the camera framing, his size and position in the frame and the plain green background exactly as in the input image for the whole video, with a single man in the frame. He performs ONE slow, controlled repetition of the dead bug in a single continuous, fluid, natural motion, like real footage of a person exercising: one steady tempo with gentle slowing at the turning points, no cuts, no morphing, no jumps between poses, no flicker. He ends in exactly the same posture as the first frame, so the video loops seamlessly.

Exercise setup: He lies on his back in the tabletop position: both arms straight and pointing straight up to the ceiling, both hips and knees bent 90 degrees with the shins parallel to the floor. In this video the NEAR (right) arm and the FAR (left) leg move together. The lower back stays pressed to the floor the whole time.

View: exact side profile at floor level, camera about 30 cm above the floor. He lies with his head toward the left edge of the frame and his feet toward the right edge. The camera sees his right side, so his right arm and right leg are the near limbs and his left arm and left leg are the far limbs. There is no mat and no visible floor.

Movement: He slowly lowers the near arm backward over his head and extends the opposite (far) leg at the same time, both hovering just above the floor, with the lower back pressed flat, then slowly returns both to the tabletop starting position.

Key postures (the movement passes through them smoothly and never stops or snaps to them):
- Start posture (the input image): lying on his back, both arms straight up toward the ceiling (vertical), both hips bent 90 degrees and both knees bent 90 degrees with the shins parallel to the floor, lower back flat on the floor, head and shoulders on the floor.
- Midway posture: the near arm about 45 degrees from vertical, the far leg about 150 degrees at the knee and lowering.
- Peak posture: the near arm straight overhead and hovering about 10 cm above the floor, the far leg fully straight and hovering about 10 cm above the floor, the other arm still vertical and the near leg still in tabletop (hip 90 degrees, knee 90 degrees), the lower back pressed flat to the floor with no arch, ribs down, head and shoulders on the floor.

Timeline (5 seconds in total):
- 0.0 to 0.4 s: stays still, exactly as in the input image.
- 0.4 to 2.2 s: moves from the start posture to the peak posture in one continuous motion, passing through the midway posture.
- 2.2 to 2.6 s: holds the peak posture briefly.
- 2.6 to 5.0 s: returns to the start posture in one continuous motion, passing through the midway posture in reverse, and ends exactly as in the input image.

Technique rules:
- The lower back stays pressed into the floor with no arching at any time.
- The arm and the opposite leg move together, slowly and with control.
- The other arm stays vertical and the other leg stays in tabletop.
- The arm and leg hover above the floor and do not touch it.

Camera and look: square 1:1, 24 fps, a completely static locked-off camera (no pan, zoom, shake or cut). The same flat uniform chroma key green background (#00B140), with no gradient, no floor line, no grid, no white lines and no shadow on the ground, and soft even shadowless lighting that never changes. Same face, slate-blue t-shirt, black shorts and light grey shoes throughout. The full body stays inside the frame with at least 8 percent margin.

Avoid: camera movement, zoom, pan, cut, shake, shadow on the floor, gradient background, green clothing, motion blur, jumping, bouncing, fast or jerky movement, extra limbs, distorted hands, distorted feet, different clothing, different face, text, watermark, logo, extra people, grid, multiple panels, split screen, collage, white lines, multiple copies of the man, morphing, cross-fade, jump between poses, sudden pose change, flicker, changing camera framing, changing scale, changing background, arched lower back, lifting the head, ribs flaring, moving the same-side arm and leg, fast swinging, arm or leg touching the floor
```

**Periksa hasil:** Punggung bawah menempel lantai, lengan dan kaki berlawanan turun bersamaan, kaki lain tetap tabletop.

---

## 14. Bird dog (`bird_dog`)

**Cue di app:** Posisi merangkak. Luruskan lengan dan kaki yang berlawanan, tahan 2 detik, pinggul tetap rata.

### Prompt 1: gambar (9 keyframe, 1:1)

```text
Photorealistic studio photo sheet of one man performing the bird dog, shown as nine sequential keyframes of ONE repetition.

The same man in every panel: an Indonesian man in his late 20s, about 175 cm tall, lean athletic build, short neat black hair, clean-shaven, calm neutral expression with the mouth closed. He wears a fitted short-sleeve slate-blue athletic t-shirt, black athletic shorts that end about 10 cm above the knee, and light grey running shoes with white soles. No hat, no watch, no jewelry, no green clothing. If a character reference image is attached, reproduce exactly that man: same face, hair, build and clothes.

Background: a perfectly flat, uniform chroma key green screen (#00B140) filling the entire panel, with no gradient, no vignette, no wrinkles, no floor line, no horizon and no cast shadow on the ground. Soft, even, shadowless studio lighting. Realistic photograph, sharp focus, natural skin texture. The camera is locked off, perfectly perpendicular to the plane of movement, with no lens distortion and no perspective tilt, at the same distance in every panel.

Output ONE square image (1:1) that contains a 3x3 grid of nine equal square panels, read left to right and top to bottom, separated by thin solid white lines. Panel 1 is top-left, panel 9 is bottom-right. Each panel is one keyframe of the same exercise, in order. No text, no numbers, no labels, no arrows and no frames around the figure. The figure uses the same scale in all nine panels, fits fully inside its panel with at least 8 percent margin on every side, and the planted foot (or the body, for floor exercises) stays at exactly the same position from panel to panel, so that only the movement changes. Everything else (face, clothes, camera distance, background) is identical in all nine panels.

View: exact side profile at low camera height (about 40 cm above the floor). He faces the right edge of the panel, the camera sees his right side, so his right arm and right leg are the near limbs and his left arm and left leg are the far limbs. There is no mat and no visible floor.
Exercise: bird dog. He starts on hands and knees facing the right edge of the panel: hands directly below the shoulders, knees directly below the hips, back flat, head neutral looking at the floor. In this video the NEAR (right) arm and the FAR (left) leg extend together.

Keyframes (join them as one smooth movement; panel 9 must be identical to panel 1):

Panel 1: Start: on hands and knees, hands below the shoulders, knees below the hips, back flat and level, neck neutral, head in line with the spine.
Panel 2: The near arm begins to reach forward (about 30 degrees above the floor) and the far leg begins to slide back (knee still bent about 120 degrees), hips level.
Panel 3: The near arm reaching forward at about 20 degrees below horizontal, the far leg about 20 degrees below horizontal and almost straight.
Panel 4: The near arm almost horizontal, the far leg almost horizontal and straight, hips still level.
Panel 5: Hold position: the near arm fully extended forward at shoulder height and the far leg fully extended backward at hip height, so the arm, torso and leg form one straight horizontal line from the fingertips to the heel, the far foot flexed, the hips level and square (no rotation), the back flat, the neck neutral with the eyes on the floor, the supporting hand and supporting knee firmly on the floor.
Panel 6: Returning: same pose as panel 4.
Panel 7: Returning: same pose as panel 3.
Panel 8: Returning: same pose as panel 2.
Panel 9: Identical to panel 1.
```

Prompt negatif:

```text
text, numbers, labels, watermark, logo, arrows, extra people, extra limbs, distorted hands, distorted feet, motion blur, shadow on the floor, gradient background, green clothing, cropped head, cropped feet, different clothing between panels, different face between panels, mirrored panels, duplicated panels, 3D render, cartoon, illustration, arched back, hips rotating or tilting, leg raised higher than the hips, head lifting, sagging back, shaking, same-side arm and leg
```

### Prompt 2: video (satu gambar: panel 1 terpotong = frame pertama)

Model `seedance-2.0-*-image-to-video`. Unggah hanya panel 1 yang sudah dipotong (1:1, tanpa garis putih). **Jangan unggah lembar 3x3.**

```text
Image-to-video. The input image is the first frame: the same man in the start posture of the bird dog. Keep the man, his clothes, the camera framing, his size and position in the frame and the plain green background exactly as in the input image for the whole video, with a single man in the frame. He performs ONE slow, controlled repetition of the bird dog in a single continuous, fluid, natural motion, like real footage of a person exercising: one steady tempo with gentle slowing at the turning points, no cuts, no morphing, no jumps between poses, no flicker. He ends in exactly the same posture as the first frame, so the video loops seamlessly.

Exercise setup: He starts on hands and knees facing the right edge of the frame: hands directly below the shoulders, knees directly below the hips, back flat, head neutral looking at the floor. In this video the NEAR (right) arm and the FAR (left) leg extend together.

View: exact side profile at low camera height (about 40 cm above the floor). He faces the right edge of the frame, the camera sees his right side, so his right arm and right leg are the near limbs and his left arm and left leg are the far limbs. There is no mat and no visible floor.

Movement: He reaches the near arm forward and extends the opposite (far) leg backward until they form one straight horizontal line with the torso, holds that position steady for two seconds with the hips level, then brings the arm and leg back to the hands-and-knees position.

Key postures (the movement passes through them smoothly and never stops or snaps to them):
- Start posture (the input image): on hands and knees, hands below the shoulders, knees below the hips, back flat and level, neck neutral, head in line with the spine.
- Midway posture: the near arm reaching forward at about 20 degrees below horizontal, the far leg about 20 degrees below horizontal and almost straight.
- Peak posture: the near arm fully extended forward at shoulder height and the far leg fully extended backward at hip height, so the arm, torso and leg form one straight horizontal line from the fingertips to the heel, the far foot flexed, the hips level and square (no rotation), the back flat, the neck neutral with the eyes on the floor, the supporting hand and supporting knee firmly on the floor.

Timeline (5 seconds in total):
- 0.0 to 0.3 s: stays still, exactly as in the input image.
- 0.3 to 1.6 s: moves from the start posture to the peak posture in one continuous motion, passing through the midway posture.
- 1.6 to 3.6 s: holds the peak posture briefly.
- 3.6 to 5.0 s: returns to the start posture in one continuous motion, passing through the midway posture in reverse, and ends exactly as in the input image.

Technique rules:
- The hips and shoulders stay level and square, no rotation or tilting.
- The back stays flat, no arching and no sagging.
- The arm and the opposite leg extend to the height of the torso, not higher.
- Hold the extended position for about 2 seconds, then return slowly.

Camera and look: square 1:1, 24 fps, a completely static locked-off camera (no pan, zoom, shake or cut). The same flat uniform chroma key green background (#00B140), with no gradient, no floor line, no grid, no white lines and no shadow on the ground, and soft even shadowless lighting that never changes. Same face, slate-blue t-shirt, black shorts and light grey shoes throughout. The full body stays inside the frame with at least 8 percent margin.

Avoid: camera movement, zoom, pan, cut, shake, shadow on the floor, gradient background, green clothing, motion blur, jumping, bouncing, fast or jerky movement, extra limbs, distorted hands, distorted feet, different clothing, different face, text, watermark, logo, extra people, grid, multiple panels, split screen, collage, white lines, multiple copies of the man, morphing, cross-fade, jump between poses, sudden pose change, flicker, changing camera framing, changing scale, changing background, arched back, hips rotating or tilting, leg raised higher than the hips, head lifting, sagging back, shaking, same-side arm and leg
```

**Periksa hasil:** Lengan dan kaki berlawanan satu garis lurus dengan badan di panel 5, pinggul rata, tahan 2 detik.

---

## 15. Copenhagen plank (`copenhagen_plank`)

**Cue di app:** Side plank dengan kaki atas di bangku, kaki bawah menggantung. Mulai dari lutut di bangku jika masih berat.

### Prompt 1: gambar (9 keyframe, 1:1)

```text
Photorealistic studio photo sheet of one man performing the Copenhagen plank, shown as nine sequential keyframes of ONE repetition.

The same man in every panel: an Indonesian man in his late 20s, about 175 cm tall, lean athletic build, short neat black hair, clean-shaven, calm neutral expression with the mouth closed. He wears a fitted short-sleeve slate-blue athletic t-shirt, black athletic shorts that end about 10 cm above the knee, and light grey running shoes with white soles. No hat, no watch, no jewelry, no green clothing. If a character reference image is attached, reproduce exactly that man: same face, hair, build and clothes.

Background: a perfectly flat, uniform chroma key green screen (#00B140) filling the entire panel, with no gradient, no vignette, no wrinkles, no floor line, no horizon and no cast shadow on the ground. Soft, even, shadowless studio lighting. Realistic photograph, sharp focus, natural skin texture. The camera is locked off, perfectly perpendicular to the plane of movement, with no lens distortion and no perspective tilt, at the same distance in every panel.

Output ONE square image (1:1) that contains a 3x3 grid of nine equal square panels, read left to right and top to bottom, separated by thin solid white lines. Panel 1 is top-left, panel 9 is bottom-right. Each panel is one keyframe of the same exercise, in order. No text, no numbers, no labels, no arrows and no frames around the figure. The figure uses the same scale in all nine panels, fits fully inside its panel with at least 8 percent margin on every side, and the planted foot (or the body, for floor exercises) stays at exactly the same position from panel to panel, so that only the movement changes. Everything else (face, clothes, camera distance, background) is identical in all nine panels.

View: front view, the camera faces his chest squarely at the height of his torso. His body lies horizontally across the panel with his head toward the left edge and his feet toward the right edge, resting on his right side (his right forearm is the supporting arm). There is no mat and no visible floor.
Prop: A plain dark grey bench about 45 cm high and 100 cm long, lying along the RIGHT side of the panel, used as the support for the top leg. Any prop is a plain matte dark grey (#3A3A3C) object with no logo and no green.
Exercise: Copenhagen plank. He lies on his right side. The right forearm is on the floor with the elbow directly below the right shoulder. The TOP leg (left) rests with the inside of the foot and the ankle on top of the bench. The BOTTOM leg (right) is not on the bench and hangs under the top leg. The left arm rests on the left hip. He lifts into the Copenhagen plank, holds it, then lowers back.

Keyframes (join them as one smooth movement; panel 9 must be identical to panel 1):

Panel 1: Start: lying on his right side on the floor next to the bench, the right forearm on the floor with the elbow below the shoulder, the top (left) leg straight with the inside of the foot resting on the bench, the bottom (right) leg straight on the floor under the bench, left hand on the left hip.
Panel 2: Hips starting to lift: hips about 8 cm off the floor, the top leg pressing into the bench.
Panel 3: Hips about 22 cm off the floor, the bottom leg beginning to lift off the floor.
Panel 4: Hips about 36 cm off the floor, the bottom leg almost off the floor, body almost straight.
Panel 5: Hold position: full Copenhagen plank, body one straight line from the head through the hips to the top foot on the bench, the right elbow directly below the right shoulder, the bottom leg lifted off the floor and held straight right under the top leg, the left hand on the left hip, the chest facing the camera, the hips lifted and not dropping, neck neutral.
Panel 6: Hold position with a tiny breathing movement: identical to panel 5 apart from a very slight rise of the ribcage.
Panel 7: Lowering: hips about 22 cm off the floor, bottom leg descending, same pose as panel 3 in reverse.
Panel 8: Lowering: hips about 8 cm off the floor, same pose as panel 2 in reverse.
Panel 9: Identical to panel 1.
```

Prompt negatif:

```text
text, numbers, labels, watermark, logo, arrows, extra people, extra limbs, distorted hands, distorted feet, motion blur, shadow on the floor, gradient background, green clothing, cropped head, cropped feet, different clothing between panels, different face between panels, mirrored panels, duplicated panels, 3D render, cartoon, illustration, hips dropping, body rolling forward or backward, bottom leg touching the floor, both legs on the bench, elbow far from the shoulder, head dropping
```

### Prompt 2: video (satu gambar: panel 1 terpotong = frame pertama)

Model `seedance-2.0-*-image-to-video`. Unggah hanya panel 1 yang sudah dipotong (1:1, tanpa garis putih). **Jangan unggah lembar 3x3.**

```text
Image-to-video. The input image is the first frame: the same man in the start posture of the Copenhagen plank. Keep the man, his clothes, the camera framing, his size and position in the frame and the plain green background exactly as in the input image for the whole video, with a single man in the frame. He performs ONE slow, controlled repetition of the Copenhagen plank in a single continuous, fluid, natural motion, like real footage of a person exercising: one steady tempo with gentle slowing at the turning points, no cuts, no morphing, no jumps between poses, no flicker. He ends in exactly the same posture as the first frame, so the video loops seamlessly.

Exercise setup: He lies on his right side. The right forearm is on the floor with the elbow directly below the right shoulder. The TOP leg (left) rests with the inside of the foot and the ankle on top of the bench. The BOTTOM leg (right) is not on the bench and hangs under the top leg. The left arm rests on the left hip. He lifts into the Copenhagen plank, holds it, then lowers back.

View: front view, the camera faces his chest squarely at the height of his torso. His body lies horizontally across the frame with his head toward the left edge and his feet toward the right edge, resting on his right side (his right forearm is the supporting arm). There is no mat and no visible floor. Prop: A plain dark grey bench about 45 cm high and 100 cm long, lying along the RIGHT side of the frame, used as the support for the top leg. Any prop is a plain matte dark grey (#3A3A3C) object with no logo and no green.

Movement: He lifts his hips into a straight Copenhagen plank with the top leg on the bench and the bottom leg hanging in the air under it, holds it steady for two seconds with only a very slight breathing movement, then lowers his hips and bottom leg back to the floor.

Key postures (the movement passes through them smoothly and never stops or snaps to them):
- Start posture (the input image): lying on his right side on the floor next to the bench, the right forearm on the floor with the elbow below the shoulder, the top (left) leg straight with the inside of the foot resting on the bench, the bottom (right) leg straight on the floor under the bench, left hand on the left hip.
- Midway posture: hips about 22 cm off the floor, the bottom leg beginning to lift off the floor.
- Peak posture: full Copenhagen plank, body one straight line from the head through the hips to the top foot on the bench, the right elbow directly below the right shoulder, the bottom leg lifted off the floor and held straight right under the top leg, the left hand on the left hip, the chest facing the camera, the hips lifted and not dropping, neck neutral.

Timeline (5 seconds in total):
- 0.0 to 0.4 s: stays still, exactly as in the input image.
- 0.4 to 1.6 s: moves from the start posture to the peak posture in one continuous motion, passing through the midway posture.
- 1.6 to 3.6 s: holds the peak posture perfectly steady, with only a very slight breathing movement of the ribcage.
- 3.6 to 5.0 s: returns to the start posture in one continuous motion, passing through the midway posture in reverse, and ends exactly as in the input image.

Technique rules:
- In the hold the body is one straight line from head to the top foot, the hips do not drop.
- The elbow stays directly below the shoulder, the chest faces the camera.
- The bottom leg hangs in the air under the top leg and does not touch the floor or the bench.
- During the hold only the breathing moves.

Camera and look: square 1:1, 24 fps, a completely static locked-off camera (no pan, zoom, shake or cut). The same flat uniform chroma key green background (#00B140), with no gradient, no floor line, no grid, no white lines and no shadow on the ground, and soft even shadowless lighting that never changes. Same face, slate-blue t-shirt, black shorts and light grey shoes throughout. The full body stays inside the frame with at least 8 percent margin.

Avoid: camera movement, zoom, pan, cut, shake, shadow on the floor, gradient background, green clothing, motion blur, jumping, bouncing, fast or jerky movement, extra limbs, distorted hands, distorted feet, different clothing, different face, text, watermark, logo, extra people, grid, multiple panels, split screen, collage, white lines, multiple copies of the man, morphing, cross-fade, jump between poses, sudden pose change, flicker, changing camera framing, changing scale, changing background, hips dropping, body rolling forward or backward, bottom leg touching the floor, both legs on the bench, elbow far from the shoulder, head dropping
```

**Periksa hasil:** Kaki atas di bangku, kaki bawah menggantung di panel 5, badan lurus, pinggul tinggi, dada menghadap kamera.

---

## Catatan dan batasan

- Gambar dan video buatan AI bisa melenceng dari gerakan (sudut sendi, tempo, sisi kerja). Periksa tiap hasil dengan daftar periksa dan minta pelatih menilai tekniknya sebelum dipakai.
- Angka sudut di keyframe adalah patokan teknik umum, bukan standar yang sudah direview pelatih. Aturan engine tetap tunduk pada review D6.
- Izin pemakaian hasil Seedance untuk app yang dirilis belum dikonfirmasi pemilik produk.
- Gerakan berbasis properti (bangku, kotak, dinding) dibuat dengan properti abu tua polos supaya mudah dipisahkan dari latar hijau.
- Setelah video jadi, pembuatan pasangan terang/gelap dan pemasangan di app mengikuti `apps/app/assets/exercises/README.md`.
