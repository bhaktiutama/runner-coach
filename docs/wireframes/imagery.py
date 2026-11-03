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
:root{--on-image:#FFF9F2;--scrim-top:linear-gradient(180deg,#161B1F99 0%,#161B1F00 100%);--scrim-bottom:linear-gradient(180deg,#161B1F00 0%,#161B1FB3 100%)}
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
]


def build():
    os.makedirs(IMG_DST, exist_ok=True)
    for s in SCREENS:
        shutil.copyfile(os.path.join(IMG_SRC, s['img'] + '.webp'), os.path.join(IMG_DST, s['img'] + '.webp'))
        html = open(os.path.join(SRC, s['src']), encoding='utf8').read()
        for old, new in s['edits']:
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
        c['boards'][k] = {'x': i * 470, 'y': y, 'w': 390, 'h': 844, 'title': s['title'] + ' (draft)', 'is_interactive': True, 'radius': 40}
        if k not in c['order']:
            c['order'].append(k)
    c['notes']['t5'] = {'x': 0, 'y': y - 300, 'text': '5. Eksplorasi imagery (draft, belum masuk spec)', 'kind': 'title1', 'maxW': 2300}
    c['notes']['s5'] = {'x': -560, 'y': y, 'w': 460, 'fill': 'teal', 'size': 'm', 'text': (
        'Eksplorasi imagery\n\nVarian dari layar asli (tata letak dan teks sama), dibuat oleh imagery.py. '
        'Gambar: ds/lintas/imagery (lisensi belum diverifikasi). Usulan token: --on-image, --scrim-top. '
        'Mode gelap: gambar sama, fade ke --bg gelap.')}
    json.dump(c, open(path, 'w', encoding='utf8'), indent=1, ensure_ascii=False)
    open(path, 'a').write('\n')
    print('update canvas.json')


if __name__ == '__main__':
    if '--pairs' in sys.argv:
        print(' '.join(f"{s['out']}.dc.html={s['out'][4:]}.png" for s in SCREENS))
    else:
        build()
