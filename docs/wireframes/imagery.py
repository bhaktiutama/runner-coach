"""Eksplorasi imagery (draft): gambar ditempelkan ke wireframe yang SUDAH ADA.

Tidak menggambar ulang layar. Script membaca sumber asli (source/Main.dc.html, dst.),
menyisipkan blok gambar di titik yang ditentukan (setiap sisipan harus cocok tepat
satu kali, kalau tidak script berhenti), lalu menulis varian source/IMG-*.dc.html.
Teks, komponen dan token Lintas tetap dari sumber asli; mode gelap memakai
[data-theme="dark"] yang sama.

    python3 docs/wireframes/imagery.py            # tulis varian + salin gambar + update canvas.json
    PW_CHROMIUM_PATH=/opt/pw-browsers/chromium node docs/wireframes/render.js \
        docs/wireframes/source docs/wireframes/png/imagery $(python3 docs/wireframes/imagery.py --pairs)
    PW_CHROMIUM_PATH=/opt/pw-browsers/chromium WF_THEME=dark node docs/wireframes/render.js \
        docs/wireframes/source docs/wireframes/png/imagery/dark $(python3 docs/wireframes/imagery.py --pairs)

Gambar: docs/design-system/assets/imagery/ (draft, lisensi belum diverifikasi), disalin ke
source/ds/lintas/imagery/ seperti token disalin ke source/ds/lintas/.
"""

import json
import os
import re
import shutil
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'source')
IMG_SRC = os.path.join(HERE, '..', 'design-system', 'assets', 'imagery')
IMG_DST = os.path.join(SRC, 'ds', 'lintas', 'imagery')

# Usulan token baru (belum ada di tokens.json). Didefinisikan sekali di sini supaya
# layar tetap memakai var(); jika disetujui, pindahkan ke tokens.json + cek kontras.
PROPOSED_TOKENS = """
/* USULAN TOKEN (draft imagery), belum di tokens.json */
:root{--on-image:#FFF9F2;--scrim-top:linear-gradient(180deg,#161B1F99 0%,#161B1F00 100%);--scrim-bottom:linear-gradient(180deg,#161B1F00 0%,#161B1FB3 100%);--primary-edge:#C4521F;--button-depth:0 4px 0 0 var(--primary-edge),0 8px 8px -4px #161B1F40,inset 0 1px 0 0 #FFFFFF59}
"""

ROOT_OPEN = "overflow: hidden\">"


def hero(img, height, pos, fade_from=50):
    """Gambar di atas layar: memudar ke var(--bg) sehingga ikut tema terang/gelap."""
    return (
        f'<div aria-hidden="true" style="position: absolute; top: 0; left: 0; right: 0; height: {height}px; z-index: 0">'
        f'<img src="ds/lintas/imagery/{img}.webp" alt="" style="width: 100%; height: 100%; object-fit: cover; object-position: {pos}; display: block">'
        f'<div style="position: absolute; inset: 0 0 auto 0; height: 120px; background: var(--scrim-top)"></div>'
        f'<div style="position: absolute; inset: 0; background: linear-gradient(180deg, transparent {fade_from}%, var(--bg) 100%)"></div>'
        '</div>'
    )


def spacer(h):
    return f'<div aria-hidden="true" style="height: {h}px; flex-shrink: 0"></div>'



def card_image(img, pos, height=150):
    """Header gambar di dalam kartu (bleed ke tepi kartu dengan padding 20/16)."""
    return (
        f'<div aria-hidden="true" style="margin: -20px -20px 0; height: {height}px; border-radius: var(--radius-lg) var(--radius-lg) 0 0; overflow: hidden">'
        f'<img src="ds/lintas/imagery/{img}.webp" alt="" style="width: 100%; height: 100%; object-fit: cover; object-position: {pos}; display: block"></div>'
    )


BACK_ROW_END = '<span style="width: 44px"></span></div>'
WORKOUT_CARD = r'<div style="display: flex; flex-direction: column; gap: 16px; padding: 20px; border-radius: var\(--radius-lg\); background: var\(--surface\); box-shadow: var\(--shadow-card\)"><div style="display: flex; justify-content: space-between; align-items: center"><span class="ln-bib ln-bib--tempo">.*?Lihat detail &amp; alasan latihan</a></div>'

# Teks kartu istirahat dari katalog app: today.restTitle, today.restBody, today.next (apps/app/src/i18n/id.ts).
REST_CARD = (
    '<div style="display: flex; flex-direction: column; gap: 10px; padding: 20px; border-radius: var(--radius-lg); background: var(--surface); box-shadow: var(--shadow-card)">'
    + card_image('track-aerial', '50% 50%', 190)
    + '<h2 style="margin: 6px 0 0; font-family: var(--font-display); font-size: 24px; font-weight: 800; letter-spacing: -0.02em">Istirahat</h2>'
    '<p style="margin: 0; font-size: 15px; line-height: 1.45; color: var(--text-muted)">Hari ini istirahat. Jalan santai atau stretching boleh.</p>'
    '<a href="WorkoutDetail.dc.html" style="display: flex; align-items: center; min-height: 44px; font-size: 15px; font-weight: 700; text-decoration: none; color: var(--primary-ink)">Berikutnya: Easy Run, Rab 28 Okt</a></div>'
)

LOGO_DOT = '<circle cx="49.5" cy="19.5" r="5" fill="var(--text)"/>'
CONTENT_TOP = 'padding: 56px 20px 16px; min-height: 0">'


SCREENS = [
    {
        'src': 'Main.dc.html', 'out': 'IMG-1-1-selamat-datang', 'title': '1.1 Selamat datang + hero',
        'img': 'road-sunrise-m',
        'edits': [
            (ROOT_OPEN, ROOT_OPEN + hero('road-sunrise-m', 520, '62% 38%', 45)),
            # logo di atas foto: teks dan titik memakai --on-image
            ('<div style="display: flex; align-items: center; gap: 10px; padding: 64px 20px 0">',
             '<div style="position: relative; z-index: 1; display: flex; align-items: center; gap: 10px; padding: 64px 20px 0; color: var(--on-image)">'),
            (LOGO_DOT, '<circle cx="49.5" cy="19.5" r="5" fill="var(--on-image)"/>'),
            # grafik lajur zona diganti foto; judul turun ke bawah foto
            ('justify-content: center; gap: 32px; padding: 0 20px">',
             'justify-content: flex-end; gap: 32px; padding: 0 20px; position: relative; z-index: 1">'),
            ('<div aria-hidden="true" style="display: flex; flex-direction: column; gap: 10px; padding: 16px 0; box-shadow:', '<div aria-hidden="true" style="display: none; flex-direction: column; gap: 10px; padding: 16px 0; box-shadow:'),
            ('<div style="display: flex; flex-direction: column; gap: 8px; padding: 12px 20px 32px">',
             '<div style="position: relative; z-index: 1; display: flex; flex-direction: column; gap: 8px; padding: 12px 20px 32px">'),
        ],
    },
    {
        'src': 'OB9-Masuk.dc.html', 'out': 'IMG-1-9-masuk', 'title': '1.9 Masuk + header gambar',
        'img': 'riverside-city-f',
        'edits': [
            (ROOT_OPEN, ROOT_OPEN + hero('riverside-city-f', 330, '74% 52%', 45)),
            (CONTENT_TOP, CONTENT_TOP.replace('min-height: 0', 'min-height: 0; position: relative; z-index: 1')),
            ('<span style="width: 44px"></span></div>', '<span style="width: 44px"></span></div>' + spacer(150)),
        ],
    },
    {
        'src': 'Today.dc.html', 'out': 'IMG-2-1-hari-ini', 'title': '2.1 Hari ini + latar kartu',
        'img': 'track-back',
        'edits': [
            # baris bib + jarak menjadi header bergambar di dalam kartu yang sama
            ('<div style="display: flex; justify-content: space-between; align-items: center"><span class="ln-bib ln-bib--tempo">',
             '<div style="position: relative; margin: -20px -20px 0; height: 150px; border-radius: var(--radius-lg) var(--radius-lg) 0 0; overflow: hidden; display: flex; justify-content: space-between; align-items: flex-start; padding: 16px; box-sizing: border-box">'
             '<img src="ds/lintas/imagery/track-back.webp" alt="" aria-hidden="true" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 42%">'
             '<span style="position: relative" class="ln-bib ln-bib--tempo">'),
            ('<span style="font-size: 14px; font-weight: 700; color: var(--text-muted)">~5,5 km</span>',
             '<span style="position: relative; padding: 4px 10px; border-radius: var(--radius-stadium); background: var(--surface); font-size: 14px; font-weight: 700; color: var(--text)">~5,5 km</span>'),
        ],
    },
    {
        'src': 'Finish.dc.html', 'out': 'IMG-2-4-selesai', 'title': '2.4 Selesai + gambar',
        'img': 'shoe-sole',
        'edits': [
            (ROOT_OPEN, ROOT_OPEN + hero('shoe-sole', 320, '58% 30%', 40)),
            (CONTENT_TOP, CONTENT_TOP.replace('min-height: 0', 'min-height: 0; position: relative; z-index: 1') + spacer(196)),
        ],
    },
    {
        'src': 'P2-4-4-premium.dc.html', 'out': 'IMG-4-4-premium', 'title': '4.4 Premium + header gambar',
        'img': 'riverside-city-m',
        'edits': [
            (ROOT_OPEN, ROOT_OPEN + hero('riverside-city-m', 300, '80% 46%', 45)),
            (CONTENT_TOP, CONTENT_TOP.replace('min-height: 0', 'min-height: 0; position: relative; z-index: 1')),
            ('<span style="width: 44px"></span></div>', '<span style="width: 44px"></span></div>' + spacer(150)),
        ],
    },
    # --- Tahap lanjutan: 5 gambar sisa ---
    {
        'src': 'WeekDone.dc.html', 'out': 'IMG-2-5-ringkasan-minggu', 'title': '2.5 Ringkasan minggu + gambar',
        'img': 'track-overhead',
        'edits': [
            (ROOT_OPEN, ROOT_OPEN + hero('track-overhead', 300, '50% 40%', 45)),
            (CONTENT_TOP, CONTENT_TOP.replace('min-height: 0', 'min-height: 0; position: relative; z-index: 1')),
            (BACK_ROW_END, BACK_ROW_END + spacer(120)),
        ],
    },
    {
        'src': 'LogManual.dc.html', 'out': 'IMG-2-6-catat-lari', 'title': '2.6 Catat lari manual + gambar',
        'img': 'pov-feet',
        'edits': [
            (ROOT_OPEN, ROOT_OPEN + hero('pov-feet', 300, '55% 55%', 45)),
            (CONTENT_TOP, CONTENT_TOP.replace('min-height: 0', 'min-height: 0; position: relative; z-index: 1')),
            (BACK_ROW_END, BACK_ROW_END + spacer(150)),
            # judul kecil di baris atas berada di atas gambar
            ('font-weight: 700; color: var(--text-muted)">Catat lari</span>', 'font-weight: 700; color: var(--on-image)">Catat lari</span>'),
        ],
    },
    {
        'src': 'Today.dc.html', 'out': 'IMG-2-1i-hari-ini-interval', 'title': '2.1i Hari ini, interval (keadaan baru)',
        'img': 'track-side',
        'edits': [
            ('<div style="display: flex; justify-content: space-between; align-items: center"><span class="ln-bib ln-bib--tempo"><span class="ln-bib-inner">TEMPO</span></span>',
             '<div style="position: relative; margin: -20px -20px 0; height: 150px; border-radius: var(--radius-lg) var(--radius-lg) 0 0; overflow: hidden; display: flex; justify-content: space-between; align-items: flex-start; padding: 16px; box-sizing: border-box">'
             '<img src="ds/lintas/imagery/track-side.webp" alt="" aria-hidden="true" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 40%">'
             '<span style="position: relative" class="ln-bib ln-bib--interval"><span class="ln-bib-inner">INTERVAL</span></span>'),
            ('<span style="font-size: 14px; font-weight: 700; color: var(--text-muted)">~5,5 km</span>',
             '<span style="position: relative; padding: 4px 10px; border-radius: var(--radius-stadium); background: var(--surface); font-size: 14px; font-weight: 700; color: var(--text)">~7,5 km</span>'),
            ('font-size: 56px; font-weight: 800; letter-spacing: -0.03em; line-height: 1">42</span>',
             'font-size: 56px; font-weight: 800; letter-spacing: -0.03em; line-height: 1">61</span>'),
            ('<div style="flex: 14; border-radius: var(--radius-stadium); background: var(--zone-tempo)"></div>',
             '<div style="flex: 33; border-radius: var(--radius-stadium); background: repeating-linear-gradient(90deg, var(--zone-interval) 0 18px, var(--zone-recovery) 18px 26px)"></div>'),
            ('background: var(--zone-tempo)"></span>Tempo</span><span style="">14 mnt @ 6:45 /km</span>',
             'background: var(--zone-interval)"></span>Interval</span><span style="">5 x (800 m + 2 mnt)</span>'),
        ],
    },
    {
        'src': 'Today.dc.html', 'out': 'IMG-2-1r-hari-ini-istirahat', 'title': '2.1r Hari ini, istirahat (keadaan baru)',
        'img': 'track-aerial',
        'edits': [('re', WORKOUT_CARD, REST_CARD)],
    },
    {
        'src': 'Progress.dc.html', 'out': 'IMG-3-3k-progres-kosong', 'title': '3.3k Progres, belum ada aktivitas (keadaan baru)',
        'img': 'track-aerial',
        'edits': [
            # Teks dari katalog: progress.empty, progress.paceEmpty, progress.adherenceEmpty.
            ('re', r'<div role="img" aria-label="Volume 8 minggu terakhir.*?<span>Ini</span></div>',
             '<div aria-hidden="true" style="height: 150px; border-radius: var(--radius-md); overflow: hidden"><img src="ds/lintas/imagery/track-aerial.webp" alt="" style="width: 100%; height: 100%; object-fit: cover; object-position: 50% 45%; display: block"></div>'
             '<span style="font-size: 14px; line-height: 1.45; color: var(--text-muted)">Belum ada aktivitas. Selesaikan latihan pertamamu dari Hari ini.</span>'),
            ('<span style="font-family: var(--font-display); font-weight: 700; color: var(--success-ink)">7:58 ke 7:41 /km</span>', ''),
            ('re', r'<svg width="318" height="56".*?kebugaran naik</span>',
             '<span style="font-size: 14px; color: var(--text-muted)">Belum cukup easy run untuk melihat tren.</span>'),
            ('stroke-dasharray="85 100"', 'stroke-dasharray="85 100" stroke-opacity="0"'),
            ('aria-label="Kepatuhan 85 persen"', 'aria-label="Kepatuhan belum ada"'),
            ('font-size: 22px; font-weight: 800">85%</span>', 'font-size: 22px; font-weight: 800">-</span>'),
            ('11 dari 13 latihan', 'Belum ada latihan yang jatuh tempo'),
            ('re', r'<a href="ActivityDetail\.dc\.html".*?</a>',
             '<span style="font-size: 14px; color: var(--text-muted)">Belum ada aktivitas. Selesaikan latihan pertamamu dari Hari ini.</span>'),
        ],
    },
]

# 1.1 varian B: sisipan sama dengan 1.1, gambar road-sunrise-f.
_m = SCREENS[0]
SCREENS.append({'src': _m['src'], 'out': 'IMG-1-1b-selamat-datang', 'title': '1.1 Selamat datang, gambar B', 'img': 'road-sunrise-f',
                'edits': [(o, n.replace('road-sunrise-m', 'road-sunrise-f').replace('62% 38%', '74% 45%')) if o != 're' else (o, n) for o, n in _m['edits']]})

# --- Status hari di 3.1 (UI/UX 8a): minggu lalu dengan latihan selesai dan terlewat ---
PLAN_ROWS_OLD = """      { dow: 'Sen', date: '26', type: 'rest', title: 'Istirahat', sub: 'Jalan santai atau stretching', tag: '' },
      { dow: 'Sel', date: '27', type: 'tempo', bib: 'TEMPO', title: 'Tempo Run', sub: '42 mnt  ·  ~5,5 km  ·  + drill', tag: 'HARI INI', today: true, href: 'WorkoutDetail.dc.html' },
      { dow: 'Rab', date: '28', type: 'rest', title: 'Istirahat', sub: '', tag: '' },
      { dow: 'Kam', date: '29', type: 'easy', bib: 'EASY', title: 'Easy + strides', sub: '35 mnt + 6x20 dtk', tag: '', href: 'MoveWorkout.dc.html' },
      { dow: 'Jum', date: '30', type: 'rest', title: 'Istirahat', sub: '', tag: '' },
      { dow: 'Sab', date: '31', type: 'easy', bib: 'EASY', title: 'Easy Run', sub: '30 mnt  ·  ~4 km', tag: '' },
      { dow: 'Min', date: '1', type: 'long', bib: 'LONG', title: 'Long Run', sub: '60 mnt  ·  ~7,5 km', tag: '' }"""
PLAN_ROWS_NEW = """      { dow: 'Sen', date: '19', type: 'rest', title: 'Istirahat', sub: 'Jalan santai atau stretching', tag: '' },
      { dow: 'Sel', date: '20', type: 'tempo', bib: 'TEMPO', title: 'Tempo Run', sub: '38 mnt  ·  ~5,2 km  ·  + drill', tag: '', status: 'completed' },
      { dow: 'Rab', date: '21', type: 'rest', title: 'Istirahat', sub: '', tag: '' },
      { dow: 'Kam', date: '22', type: 'easy', bib: 'EASY', title: 'Easy + strides', sub: '25 mnt + 6x20 dtk', tag: '', status: 'missed' },
      { dow: 'Jum', date: '23', type: 'rest', title: 'Istirahat', sub: '', tag: '' },
      { dow: 'Sab', date: '24', type: 'easy', bib: 'EASY', title: 'Easy Run', sub: '25 mnt  ·  ~3 km', tag: '', status: 'completed' },
      { dow: 'Min', date: '25', type: 'long', bib: 'LONG', title: 'Long Run', sub: '50 mnt  ·  ~6 km', tag: '', status: 'completed' }"""
CHECK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
TAG_IF = '<sc-if value="{{d.isTag}}" hint-placeholder-val="{{false}}">'
SCREENS.append({
    'src': 'Plan.dc.html', 'out': 'ST-3-1b-plan-status', 'title': '3.1b Plan, minggu lalu: selesai dan terlewat', 'img': None,
    'edits': [
        (PLAN_ROWS_OLD, PLAN_ROWS_NEW),
        ('>Minggu 3</span>', '>Minggu 2</span>'),
        ('>26 Okt - 1 Nov  ·  18 km</span>', '>19 - 25 Okt  ·  17 km</span>'),
        ("outline: i === 2 ?", "outline: i === 1 ?"),
        ('<span style="font-size: 15px; font-weight: 700; color: {{d.titleColor}}">{{d.title}}</span>',
         '<span style="font-size: 15px; font-weight: 700; color: {{d.titleColor}}; text-decoration: {{d.deco}}">{{d.title}}</span>'),
        (TAG_IF, '<span style="display: flex; align-items: center; gap: 8px"><sc-if value="{{d.done}}" hint-placeholder-val="{{false}}"><span role="img" aria-label="Selesai" style="width: 24px; height: 24px; border-radius: var(--radius-stadium); display: flex; align-items: center; justify-content: center; background: {{d.color}}; color: {{d.onColor}}">' + CHECK + '</span></sc-if>' + TAG_IF),
        ('</sc-if>\n        </a>', '</sc-if></span>\n        </a>'),
        ("dow: r.dow, date: r.date,", "done: r.status === 'completed', deco: r.status === 'missed' ? 'line-through' : 'none', onColor: 'var(--on-zone-' + (r.type === 'rest' ? 'easy' : r.type) + ')', dow: r.dow, date: r.date,"),
    ],
})

# --- 1.1 carousel 3 halaman penuh (usulan): keunggulan app, gambar promo-* ---
# Isi dari layar asli Main: logo, CTA "Buat plan saya", "Sudah punya akun? Masuk", catatan HP.
# Gambar memudar ke --bg (ikut tema); hanya logo di atas gambar memakai --on-image. UI/UX 13.
_MAIN = open(os.path.join(SRC, 'Main.dc.html'), encoding='utf8').read()
_LOGO = re.search(r'<svg width="40" height="40".*?</svg>', _MAIN, re.S).group(0).replace('fill="var(--text)"', 'fill="var(--on-image)"')
_CTA = re.search(r'<a href="OB2-Target\.dc\.html".*?</a>', _MAIN, re.S).group(0)
_LOCK = re.search(r'<svg width="16" height="16".*?</svg>', _MAIN, re.S).group(0)
SLIDES = [
    ('promo-science', '22% 40%', 'ADA DASARNYA', 'Latihan pintar, bukan asal capek.',
     'Tiap sesi ada alasannya, diambil dari riset olahraga. Naiknya pelan-pelan, ada minggu santai juga.'),
    ('promo-privacy', '45% 30%', 'PRIVASI', 'Data larimu, ya punyamu.',
     'Plan dan catatan lari cuma disimpan di HP kamu, nggak dikirim ke server. Akun cuma buat masuk.'),
    ('promo-companion', '40% 40%', 'TEMAN STRAVA', 'Strava tetap jalan, kami yang atur menunya.',
     'Kamu tinggal lari. Run Coach kasih tahu hari ini lari apa, berapa lama, dan sesantai apa. Mulai dari 3 hari seminggu.'),
]


def _slide(i):
    img, pos, kicker, title, body = SLIDES[i]
    dots = ''.join(
        f'<span style="width: {24 if j == i else 8}px; height: 8px; border-radius: var(--radius-stadium); background: {'var(--text)' if j == i else 'var(--line-strong)'}"></span>'
        for j in range(len(SLIDES)))
    return (
        f'<img src="ds/lintas/imagery/{img}.webp" alt="" aria-hidden="true" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: {pos}">'
        '<div aria-hidden="true" style="position: absolute; inset: 0 0 auto 0; height: 160px; background: var(--scrim-top)"></div>'
        '<div aria-hidden="true" style="position: absolute; inset: 0; background: linear-gradient(180deg, transparent 36%, var(--bg) 66%)"></div>'
        '<div style="position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; padding: 64px 20px 0; color: var(--on-image)">'
        f'<div style="display: flex; align-items: center; gap: 10px">{_LOGO}<span style="font-family: var(--font-display); font-size: 24px; font-weight: 800; letter-spacing: -0.02em">run coach</span></div>'
        f'<span style="font-family: var(--font-display); font-size: 13px; font-weight: 700; opacity: 0.85">{i + 1}/{len(SLIDES)}</span></div>'
        '<div style="position: relative; z-index: 1; flex: 1; display: flex; flex-direction: column; justify-content: flex-end; gap: 12px; padding: 0 20px; color: var(--text)">'
        f'<span style="align-self: flex-start; padding: 5px 10px; border-radius: var(--radius-stadium); background: var(--primary); color: var(--on-primary); font-size: 12px; font-weight: 800; letter-spacing: 0.08em">{kicker}</span>'
        f'<h1 style="margin: 0; font-family: var(--font-display); font-size: 34px; line-height: 1.1; font-weight: 800; letter-spacing: -0.02em">{title}</h1>'
        f'<p style="margin: 0; font-size: 15px; line-height: 1.45; color: var(--text-muted)">{body}</p>'
        f'<div role="img" aria-label="Halaman {i + 1} dari {len(SLIDES)}" style="display: flex; gap: 6px; padding-top: 8px">{dots}</div></div>'
        '<div style="position: relative; z-index: 1; display: flex; flex-direction: column; gap: 8px; padding: 20px 20px 32px">'
        + _CTA.replace('box-shadow: var(--shadow-raised)', 'box-shadow: var(--button-depth)') +
        '<a href="OB9-Masuk.dc.html" style="display: flex; align-items: center; justify-content: center; min-height: 44px; font-size: 15px; font-weight: 700; color: var(--primary-ink); text-decoration: none">Sudah punya akun? Masuk</a>'
        f'<span style="display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 13px; font-weight: 600; color: var(--text-muted)">{_LOCK}Data latihanmu tersimpan di HP ini</span></div>'
    )


for _i in range(len(SLIDES)):
    SCREENS.append({
        'src': 'Main.dc.html', 'out': f'IMG-1-1c{_i + 1}-carousel', 'title': f'1.1 Carousel {_i + 1}/3: {SLIDES[_i][2].lower()}',
        'img': SLIDES[_i][0],
        'edits': [('re', r'(?<=overflow: hidden">).*?(?=\n</div>\n</x-dc>)', '\n' + _slide(_i))],
    })


def build():
    os.makedirs(IMG_DST, exist_ok=True)
    for s in SCREENS:
        if s['img']:
            shutil.copyfile(os.path.join(IMG_SRC, s['img'] + '.webp'), os.path.join(IMG_DST, s['img'] + '.webp'))
        html = open(os.path.join(SRC, s['src']), encoding='utf8').read()
        for e in s['edits']:
            if e[0] == 're':
                html, n = re.subn(e[1], lambda m, r=e[2]: r, html, flags=re.S)
                if n != 1:
                    sys.exit(f"{s['src']}: pola regex cocok {n}x (harus 1): {e[1][:70]}")
                continue
            old, new = e
            n = html.count(old)
            if n != 1:
                sys.exit(f"{s['src']}: titik sisip ditemukan {n}x (harus 1): {old[:70]}")
            html = html.replace(old, new)
        html = html.replace('</style>\n</helmet>', PROPOSED_TOKENS + '</style>\n</helmet>', 1)
        html = html.replace('<title>', '<title>[Imagery draft] ', 1)
        open(os.path.join(SRC, s['out'] + '.dc.html'), 'w', encoding='utf8').write(html)
        print('tulis', s['out'] + '.dc.html')

    # Canvas: baris baru di bawah journey 4, papan asli tidak disentuh.
    path = os.path.join(SRC, 'canvas.json')
    c = json.load(open(path, encoding='utf8'))
    y = 5100
    for i, s in enumerate(SCREENS):
        k = s['out'] + '.dc.html'
        c['boards'][k] = {'x': (i % 5) * 470, 'y': y + (i // 5) * 1044, 'w': 390, 'h': 844, 'title': s['title'] + ' (draft)', 'is_interactive': True, 'radius': 40}
        if k not in c['order']:
            c['order'].append(k)
    c['notes']['t5'] = {'x': 0, 'y': y - 300, 'text': '5. Eksplorasi imagery (draft) + status 3.1', 'kind': 'title1', 'maxW': 2300}
    c['notes']['s5'] = {'x': -560, 'y': y, 'w': 460, 'fill': 'teal', 'size': 'm', 'text': (
        'Eksplorasi imagery\n\nVarian dari layar asli (tata letak dan teks sama), dibuat oleh imagery.py. '
        'Gambar: ds/lintas/imagery (lisensi belum diverifikasi). Usulan token: --on-image, --scrim-top. '
        'Mode gelap: gambar sama, fade ke --bg gelap. 3.1b: status hari selesai (centang warna zona) dan terlewat (dicoret), UI/UX 8a.')}
    json.dump(c, open(path, 'w', encoding='utf8'), indent=1, ensure_ascii=False)
    open(path, 'a').write('\n')
    print('update canvas.json')


if __name__ == '__main__':
    if '--pairs' in sys.argv:
        print(' '.join(f"{s['out']}.dc.html={s['out'].split('-', 1)[1]}.png" for s in SCREENS))
    else:
        build()
