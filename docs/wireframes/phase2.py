"""Wireframe fase 2 (F-21 strength, F-22 bahasa, F-23 Premium) dalam 2 bahasa.

Menulis source/P2-*.dc.html (ID) dan source/P2-*.en.dc.html (EN) dengan format yang sama dengan
wireframe lain (token Lintas, tanpa hex lepas), lalu render ke png/ lewat render.js:

    python3 docs/wireframes/phase2.py
    PW_CHROMIUM_PATH=/opt/pw-browsers/chromium node docs/wireframes/render.js \
        docs/wireframes/source docs/wireframes/png $(python3 docs/wireframes/phase2.py --pairs)

Teks contoh diambil dari katalog app (apps/app/src/i18n/{id,en}.ts) dan engine.
"""

import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'source')

ICON = {
    'strength': '<path d="M6 8v8M18 8v8M3 10v4M21 10v4M6 12h12"/>',
    'premium': '<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/>',
    'check': '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    'play': '<path d="M7 4.5v15a1 1 0 0 0 1.5.9l12-7.5a1 1 0 0 0 0-1.7l-12-7.5A1 1 0 0 0 7 4.5z" fill="currentColor"/>',
    'chevron': '<path d="M9 5l7 7-7 7"/>',
    'back': '<path d="M15 5l-7 7 7 7"/>',
    'sound': '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 8.5a5 5 0 0 1 0 7M19.5 6a8.5 8.5 0 0 1 0 12"/>',
    'link': '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    'lock': '<rect x="4" y="10" width="16" height="11" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    'info': '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>',
    'distance': '<rect x="2.5" y="6" width="19" height="12" rx="6"/><circle cx="17" cy="9.5" r="1.6" fill="currentColor" stroke="none"/>',
    'today': '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    'plan': '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    'progress': '<path d="M3 21h18M6 17v-6M11 17V6M16 17v-4M21 17V9"/>',
    'profile': '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
}

T = {
    'id': {
        'lang': 'id', 'date': 'Selasa, 3 Nov', 'today': 'Latihan hari ini', 'week': 'Minggu 1/10',
        'easy': 'EASY', 'km': '~4 km', 'min': 'menit', 'easyRow': 'Easy', 'easyVal': '30 mnt, easy',
        'start': 'Mulai latihan', 'details': 'Lihat detail & alasan latihan',
        'strength': 'STRENGTH', 'core': 'CORE', 'nEx': '6 gerakan', 'strengthMin': '15',
        'strengthBody': 'Kaki + core tanpa alat. Kerjakan sesudah lari atau kapan saja hari ini.',
        'startStrength': 'Mulai strength', 'thisWeek': 'Minggu ini', 'weekKm': '/ 16 km',
        'days': ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'], 'S': 'S',
        'log': 'Catat lari manual', 'tabs': ['Hari ini', 'Plan', 'Progres', 'Profil'],
        'detailTitle': 'Strength 15 menit', 'anim': 'Animasi gerakan menyusul',
        'ex': [('Squat', '2 x 10x', 'Kaki selebar bahu, dorong pinggul ke belakang, turun sampai paha sejajar lantai.'),
               ('Glute bridge', '2 x 12x', 'Berbaring, lutut ditekuk. Angkat pinggul sampai badan lurus, tahan 1 detik.'),
               ('Plank', '2 x 30 dtk', 'Bertumpu lengan bawah dan ujung kaki. Badan lurus, perut dikencangkan.')],
        'rest': 'Istirahat 45 dtk antar set', 'more': '+ 3 gerakan lain',
        'why': 'Kenapa latihan ini?',
        'whyBody': 'Latihan kekuatan kaki dan core tanpa alat. Otot yang kuat membantu langkah tetap stabil saat lelah. Rasa: 5-6 dari 10.',
        'rule': 'Latihan kekuatan 2x seminggu di fase ini. Meta-analisis 25 uji acak menemukan latihan kekuatan menurunkan risiko cedera olahraga.',
        'grade': 'Bukti kuat', 'sources': 'Lihat sumber', 'move': 'Pindah hari',
        'end': 'Akhiri', 'seg': 'Segmen 1 dari 6', 'exBib': 'GERAKAN 1/6', 'set': 'Set 1 dari 2', 'dose': '10x',
        'cues': ['Kaki selebar bahu, dorong pinggul ke belakang', 'Turun sampai paha sejajar lantai', 'Lutut searah jari kaki'],
        'hint': 'Tekan Selesai set setiap selesai 1 set. Istirahat dihitung otomatis.',
        'setDone': 'Selesai set', 'pause': 'Jeda', 'skipEx': 'Lewati gerakan',
        'restBib': 'ISTIRAHAT', 'restNext': 'Berikutnya: Squat, set 2 dari 2', 'skipRest': 'Lewati istirahat',
        'finTitle': 'Strength selesai', 'finSeg': '6 dari 6 segmen tuntas', 'dur': 'Durasi',
        'feel': 'Bebannya terasa', 'feels': ['Terlalu berat', 'Pas', 'Terlalu ringan'],
        'rpeTitle': 'Seberapa berat rasanya?', 'rpeVal': '6 / 10: Agak berat', 'save': 'Simpan',
        'discard': 'Buang tanpa menyimpan',
        'runner': 'Pelari', 'nameSub': 'Paket Gratis · nama hanya di HP ini', 'training': 'LATIHAN', 'data': 'DATA',
        'goal': 'Target aktif', 'goalVal': '10K, 10 Jan 2027', 'zones': 'Zona pace', 'zonesVal': 'Easy 7:44 - 9:10',
        'daysRow': 'Hari & pengingat', 'daysVal': '4 hari, 06:00', 'strengthRow': 'Strength + core',
        'strengthSub': 'Kaki + core tanpa alat, 1-2x seminggu. Lari tidak berubah.',
        'pauseRow': 'Saya cedera / sakit', 'pauseVal': 'Jeda plan', 'premiumRow': 'Premium', 'premiumVal': 'Coba gratis 14 hari',
        'premiumNote': 'Baris Premium hanya tampil saat paywall aktif (F-23).',
        'privacy': 'Data & privasi', 'privacyVal': 'Tersimpan di HP ini', 'help': 'Panduan & istilah', 'helpVal': 'Cara kerja plan',
        'langRow': 'Bahasa', 'langVal': 'Ikuti perangkat', 'unit': 'Satuan',
        'pKicker': 'PREMIUM', 'pTitle': 'Lari tetap gratis. Strength penuh dengan Premium.',
        'pSub': 'Plan lari lengkap gratis selamanya. Strength + core gratis 2 minggu pertama, lalu lanjut dengan Premium.',
        'free': 'Gratis', 'freeItems': ['Plan lari 5K, 10K, HM, FM, Bugar + adaptasi mingguan', 'Timer interval, suara + getar, log manual, RPE',
                                      'Progres 8 minggu, backup ke file', 'Strength + core di 2 minggu pertama'],
        'paid': 'Premium', 'paidItems': ['Strength + core sepanjang plan, dengan progresi gerakan', 'Siapkan target berikutnya sebelum plan sekarang selesai',
                                        'Riwayat progres penuh', 'Fitur berikutnya: mobility, strength dengan beban, animasi gerakan'],
        'yearly': 'Tahunan', 'monthly': 'Bulanan', 'yPrice': 'US$39,99', 'mPrice': 'US$5,99',
        'ySub': 'US$3,33 / bulan, hemat 44%', 'mSub': 'Batalkan kapan saja',
        'pPrivacy': 'Langganan dikelola App Store / Google Play. Data latihanmu tetap hanya di HP ini; kami tidak menerimanya.',
        'cta': 'Coba gratis 14 hari', 'soon': 'Pembelian belum tersedia di versi ini.',
        'lTitle': 'Bahasa', 'lSub': 'Teks app, notifikasi dan cue timer memakai bahasa ini.',
        'lOpts': [('Ikuti perangkat', 'Sekarang: Bahasa Indonesia'), ('Bahasa Indonesia', None), ('English', None)],
        'lNote': 'Satuan jarak tidak ikut berubah. Data latihanmu tidak berubah.', 'back': 'Kembali',
        'lockedTitle': 'Strength minggu 3', 'locked': 'Strength + core gratis di 2 minggu pertama. Lanjutkan dengan Premium; plan lari tetap gratis.',
        'unlock': 'Buka dengan Premium',
    },
    'en': {
        'lang': 'en', 'date': 'Tuesday, Nov 3', 'today': "Today's workout", 'week': 'Week 1/10',
        'easy': 'EASY', 'km': '~4 km', 'min': 'minutes', 'easyRow': 'Easy', 'easyVal': '30 min, easy',
        'start': 'Start workout', 'details': 'See details & why',
        'strength': 'STRENGTH', 'core': 'CORE', 'nEx': '6 exercises', 'strengthMin': '15',
        'strengthBody': 'Legs + core, no equipment. Do it after your run or any time today.',
        'startStrength': 'Start strength', 'thisWeek': 'This week', 'weekKm': '/ 16 km',
        'days': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], 'S': 'S',
        'log': 'Log a run manually', 'tabs': ['Today', 'Plan', 'Progress', 'Profile'],
        'detailTitle': 'Strength 15 minutes', 'anim': 'Exercise animation coming soon',
        'ex': [('Squat', '2 x 10x', 'Feet shoulder-width apart, push the hips back, lower until thighs are parallel to the floor.'),
               ('Glute bridge', '2 x 12x', 'Lie down, knees bent. Lift the hips until the body is straight, hold 1 second.'),
               ('Plank', '2 x 30 sec', 'On forearms and toes. Body straight from head to heels, brace your stomach.')],
        'rest': '45 sec rest between sets', 'more': '+ 3 more exercises',
        'why': 'Why this workout?',
        'whyBody': 'Leg and core strength without equipment. Strong muscles keep your stride stable when tired. Effort: 5-6 out of 10.',
        'rule': 'Strength training 2x a week in this phase. A meta-analysis of 25 randomised trials found strength training lowers sports injury risk.',
        'grade': 'Strong evidence', 'sources': 'See sources', 'move': 'Move day',
        'end': 'End', 'seg': 'Segment 1 of 6', 'exBib': 'EXERCISE 1/6', 'set': 'Set 1 of 2', 'dose': '10x',
        'cues': ['Feet shoulder-width apart, push the hips back', 'Lower until thighs are parallel to the floor', 'Knees in line with toes'],
        'hint': 'Tap Set done after each set. Rest is timed automatically.',
        'setDone': 'Set done', 'pause': 'Pause', 'skipEx': 'Skip exercise',
        'restBib': 'REST', 'restNext': 'Next: Squat, set 2 of 2', 'skipRest': 'Skip rest',
        'finTitle': 'Strength done', 'finSeg': '6 of 6 segments completed', 'dur': 'Duration',
        'feel': 'The load felt', 'feels': ['Too hard', 'Right', 'Too easy'],
        'rpeTitle': 'How hard did it feel?', 'rpeVal': '6 / 10: Somewhat hard', 'save': 'Save',
        'discard': 'Discard without saving',
        'runner': 'Runner', 'nameSub': 'Free plan · name stays on this phone', 'training': 'TRAINING', 'data': 'DATA',
        'goal': 'Active goal', 'goalVal': '10K, Jan 10, 2027', 'zones': 'Pace zones', 'zonesVal': 'Easy 7:44 - 9:10',
        'daysRow': 'Days & reminder', 'daysVal': '4 days, 06:00', 'strengthRow': 'Strength + core',
        'strengthSub': 'Legs + core, no equipment, 1-2x a week. Your runs stay the same.',
        'pauseRow': "I'm injured / sick", 'pauseVal': 'Pause plan', 'premiumRow': 'Premium', 'premiumVal': 'Try free for 14 days',
        'premiumNote': 'The Premium row only shows when the paywall is on (F-23).',
        'privacy': 'Data & privacy', 'privacyVal': 'Stored on this phone', 'help': 'Guide & glossary', 'helpVal': 'How the plan works',
        'langRow': 'Language', 'langVal': 'Use device language', 'unit': 'Units',
        'pKicker': 'PREMIUM', 'pTitle': 'Running stays free. Full strength with Premium.',
        'pSub': 'The full running plan is free forever. Strength + core is free for the first 2 weeks, then continue with Premium.',
        'free': 'Free', 'freeItems': ['5K, 10K, HM, FM, Fitness running plans + weekly adjustments', 'Interval timer, sound + vibration, manual log, RPE',
                                     '8-week progress, backup to file', 'Strength + core for the first 2 weeks'],
        'paid': 'Premium', 'paidItems': ['Strength + core for the whole plan, with exercise progressions', 'Set up your next goal before the current plan ends',
                                        'Full progress history', 'Coming next: mobility, weighted strength, exercise animations'],
        'yearly': 'Yearly', 'monthly': 'Monthly', 'yPrice': '$39.99', 'mPrice': '$5.99',
        'ySub': '$3.33 / month, save 44%', 'mSub': 'Cancel any time',
        'pPrivacy': 'Subscriptions are handled by the App Store / Google Play. Your training data stays only on this phone; we never receive it.',
        'cta': 'Try free for 14 days', 'soon': 'Purchases are not available in this version yet.',
        'lTitle': 'Language', 'lSub': 'App text, notifications and timer cues use this language.',
        'lOpts': [('Use device language', 'Now: English'), ('Bahasa Indonesia', None), ('English', None)],
        'lNote': "Distance units don't change. Your training data doesn't change.", 'back': 'Back',
        'lockedTitle': 'Strength week 3', 'locked': 'Strength + core is free for the first 2 weeks. Continue with Premium; your running plan stays free.',
        'unlock': 'Unlock with Premium',
    },
}


def icon(name, size=20, sw=2):
    return (f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
            f'stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{ICON[name]}</svg>')


def page(title, lang, body, dark=False):
    theme = ' data-theme="dark"' if dark else ''
    return f'''<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<title>{title}</title>
<script src="./support.js"></script>
<link rel="stylesheet" href="ds/lintas/tokens.css">
<link rel="stylesheet" href="ds/lintas/components/bundle.css">
</head>
<body>
<x-dc>
<helmet>
<style>
body{{margin:0}}
a{{color:var(--primary-ink)}}
button{{font-family:inherit}}
</style>
</helmet>
<div{theme} style="position: relative; width: 390px; height: 844px; box-sizing: border-box; display: flex; flex-direction: column; background: var(--bg); color: var(--text); font-family: var(--font-ui); font-feature-settings: 'tnum' 1; overflow: hidden">
{body}
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{"$preview":{{"width":390,"height":844}}}}'>
class Component extends DCLogic {{
  renderVals() {{ return {{}}; }}
}}
</script>
</body>
</html>
'''


PRIMARY = ('display: flex; align-items: center; justify-content: center; gap: 10px; border-radius: var(--radius-stadium); '
           'text-decoration: none; font-weight: 700; box-sizing: border-box; height: 60px; background: var(--primary); '
           'color: var(--on-primary); font-size: 17px; box-shadow: var(--shadow-raised)')
SECONDARY = ('display: flex; align-items: center; justify-content: center; border-radius: var(--radius-stadium); '
             'height: 52px; background: var(--surface); box-shadow: inset 0 0 0 1.5px var(--line-strong); '
             'font-size: 15px; font-weight: 700; color: var(--text); text-decoration: none')
CARD = 'display: flex; flex-direction: column; gap: 16px; padding: 20px; border-radius: var(--radius-lg); background: var(--surface); box-shadow: var(--shadow-card)'
TITLE = 'margin: 0; font-family: var(--font-display); font-size: 28px; line-height: 1.1; font-weight: 800; letter-spacing: -0.02em'


def anim(t, h, dark=False):
    bg = 'var(--surface-sunken)'
    return (f'<div role="img" aria-label="{t["anim"]}" style="display: flex; flex-direction: column; gap: 8px; align-items: center; '
            f'justify-content: center; height: {h}px; border-radius: var(--radius-md); background: {bg}; '
            f'border: 2.5px dashed var(--line-strong); color: var(--text-muted); font-size: 12px; font-weight: 600">'
            f'{icon("strength", 24)}{t["anim"]}</div>')


def nav(t, active):
    items = [('today', 'Today'), ('plan', 'Plan'), ('progress', 'Progress'), ('profile', 'Profile')]
    out = []
    for i, (ic, _) in enumerate(items):
        on = i == active
        out.append(
            f'<a style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; min-height: 52px; '
            f'color: var({"--text" if on else "--text-muted"}); font-size: 12px; font-weight: {800 if on else 600}; text-decoration: none">'
            f'<span style="display: flex; align-items: center; justify-content: center; width: 56px; height: 30px; border-radius: var(--radius-stadium); '
            f'background: {"var(--surface-sunken)" if on else "transparent"}">{icon(ic, 22)}</span>{t["tabs"][i]}</a>')
    return ('<nav style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); padding: 8px 8px 28px; '
            'background: var(--surface); box-shadow: inset 0 1px 0 var(--line)">' + ''.join(out) + '</nav>')


def back_row(t, center=''):
    return (f'<div style="display: flex; align-items: center; gap: 12px"><a aria-label="{t["back"]}" style="display: flex; align-items: center; '
            f'justify-content: center; width: 44px; height: 44px; border-radius: 50%; background: var(--surface); color: var(--text); '
            f'box-shadow: inset 0 0 0 1px var(--line)">{icon("back", 22)}</a><span style="flex: 1; text-align: center; font-size: 14px; '
            f'font-weight: 700; color: var(--text-muted)">{center}</span><span style="width: 44px"></span></div>')


def today(t):
    lanes = []
    # Strength Selasa + Kamis (sesudah easy, E-24: tidak berurutan, tidak 1-2 hari sebelum long run).
    plan = [None, 'easy', None, 'easy', None, 'easy', 'long']
    for i, z in enumerate(plan):
        today_ = i == 1
        if z is None:
            lane = 'background: var(--surface-sunken)'
        else:
            lane = f'background: var(--surface); box-shadow: inset 0 0 0 2.5px var(--zone-{z})'
        outline = 'outline: 2px solid var(--text); outline-offset: 2px;' if today_ else ''
        badge = ''
        if i in (1, 3):
            badge = (f'<span style="position: absolute; top: -5px; right: -5px; min-width: 20px; height: 20px; padding: 0 4px; '
                     f'box-sizing: border-box; border-radius: var(--radius-stadium); background: var(--zone-strength); '
                     f'color: var(--on-zone-strength); font-size: 12px; font-weight: 800; display: flex; align-items: center; '
                     f'justify-content: center">{t["S"]}</span>')
        lanes.append(f'<div style="display: flex; flex-direction: column; align-items: center; gap: 6px"><div style="position: relative; '
                     f'width: 100%; height: 44px; border-radius: var(--radius-stadium); {lane}; {outline}">{badge}</div>'
                     f'<span style="font-size: 12px; font-weight: {800 if today_ else 600}; color: var({"--text" if today_ else "--text-muted"})">{t["days"][i]}</span></div>')
    body = f'''<div style="flex: 1; display: flex; flex-direction: column; gap: 18px; padding: 56px 20px 16px; min-height: 0">
  <div style="display: flex; justify-content: space-between; align-items: flex-start">
    <div style="display: flex; flex-direction: column; gap: 4px"><span style="font-size: 14px; font-weight: 700; color: var(--text-muted)">{t["date"]}</span><h1 style="{TITLE}">{t["today"]}</h1></div>
    <span style="padding: 6px 12px; border-radius: var(--radius-stadium); background: var(--surface); box-shadow: inset 0 0 0 1px var(--line); font-family: var(--font-display); font-size: 13px; font-weight: 700">{t["week"]}</span>
  </div>
  <div style="{CARD}">
    <div style="display: flex; justify-content: space-between; align-items: center"><span class="ln-bib ln-bib--easy"><span class="ln-bib-inner">{t["easy"]}</span></span><span style="font-size: 14px; font-weight: 700; color: var(--text-muted)">{t["km"]}</span></div>
    <div style="display: flex; align-items: baseline; gap: 8px"><span style="font-family: var(--font-display); font-size: 56px; font-weight: 800; letter-spacing: -0.03em; line-height: 1">30</span><span style="font-size: 18px; font-weight: 700; color: var(--text-muted)">{t["min"]}</span></div>
    <div style="height: 12px; border-radius: var(--radius-stadium); background: var(--zone-easy)"></div>
    <a style="{PRIMARY}">{icon("play")}{t["start"]}</a>
    <a style="display: flex; justify-content: center; margin-top: -8px; min-height: 36px; align-items: center; font-size: 14px; font-weight: 700; color: var(--primary-ink)">{t["details"]}</a>
  </div>
  <div style="{CARD}; border-left: 8px solid var(--zone-strength)">
    <div style="display: flex; justify-content: space-between; align-items: center"><span class="ln-bib ln-bib--strength"><span class="ln-bib-inner">{t["strength"]}</span></span><span style="font-size: 14px; font-weight: 700; color: var(--text-muted)">{t["nEx"]}</span></div>
    <div style="display: flex; align-items: baseline; gap: 8px"><span style="font-family: var(--font-display); font-size: 56px; font-weight: 800; letter-spacing: -0.03em; line-height: 1">{t["strengthMin"]}</span><span style="font-size: 18px; font-weight: 700; color: var(--text-muted)">{t["min"]}</span></div>
    <span style="font-size: 14px; line-height: 1.4; color: var(--text-muted)">{t["strengthBody"]}</span>
    <a style="{PRIMARY}">{icon("play")}{t["startStrength"]}</a>
  </div>
  <div style="display: flex; flex-direction: column; gap: 12px; padding: 16px; border-radius: var(--radius-lg); background: var(--surface); box-shadow: inset 0 0 0 1px var(--line)">
    <div style="display: flex; justify-content: space-between; font-size: 14px"><span style="font-weight: 700">{t["thisWeek"]}</span><span style="color: var(--text-muted); font-weight: 600"><b style="font-family: var(--font-display); color: var(--text)">0</b> {t["weekKm"]}</span></div>
    <div style="display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 8px">{"".join(lanes)}</div>
  </div>
</div>
{nav(t, 0)}'''
    return page('2.1s Hari ini + strength', t['lang'], body)


def detail(t):
    cards = []
    for i, (name, dose, cue) in enumerate(t['ex']):
        cards.append(f'''<div style="display: flex; flex-direction: column; gap: 8px; padding: 16px; border-radius: var(--radius-lg); background: var(--surface); box-shadow: inset 0 0 0 1px var(--line)">
    {anim(t, 88)}
    <div style="display: flex; justify-content: space-between; align-items: center"><span style="font-size: 15px; font-weight: 700">{i + 1}. {name}</span><span style="font-family: var(--font-display); font-size: 15px; font-weight: 800">{dose}</span></div>
    <span style="font-size: 14px; line-height: 1.4; color: var(--text-muted)">{cue}</span>
    <span style="font-size: 12px; color: var(--text-muted)">{t["rest"]}</span>
  </div>''')
    body = f'''<div style="flex: 1; display: flex; flex-direction: column; gap: 16px; padding: 56px 20px 16px; min-height: 0">
  {back_row(t, t["date"])}
  <div style="display: flex; flex-direction: column; gap: 10px; align-items: flex-start"><span class="ln-bib ln-bib--strength"><span class="ln-bib-inner">{t["strength"]}</span></span><h1 style="{TITLE}">{t["detailTitle"]}</h1></div>
  {"".join(cards)}
  <span style="font-size: 14px; font-weight: 700; color: var(--text-muted); text-align: center">{t["more"]}</span>
  <div style="display: flex; flex-direction: column; gap: 8px; padding: 20px; border-radius: var(--radius-lg); background: var(--surface); box-shadow: inset 0 0 0 1px var(--line)">
    <span style="font-family: var(--font-display); font-size: 17px; font-weight: 800">{t["why"]}</span>
    <span style="font-size: 14px; line-height: 1.4; color: var(--text-muted)">{t["whyBody"]}</span>
    <span style="font-size: 14px; line-height: 1.4">{t["rule"]}</span>
    <span style="display: flex; gap: 10px; align-items: center; font-size: 12px; font-weight: 700"><span style="width: 8px; height: 8px; border-radius: 50%; background: var(--success)"></span>{t["grade"]}<span style="color: var(--primary-ink); text-decoration: underline">{t["sources"]}</span></span>
  </div>
</div>
<div style="display: flex; flex-direction: column; gap: 8px; padding: 12px 20px 32px; background: var(--bg)">
  <a style="{PRIMARY}">{icon("play")}{t["start"]}</a>
  <a style="{SECONDARY}">{t["move"]}</a>
</div>'''
    return page('2.2s Detail strength', t['lang'], body)


def timer(t, rest=False):
    top = (f'<div style="display: flex; align-items: center; justify-content: space-between"><a style="display: flex; align-items: center; '
           f'min-height: 44px; padding: 0 16px; border-radius: var(--radius-stadium); background: var(--surface); color: var(--text); font-size: 14px; '
           f'font-weight: 700">{t["end"]}</a><span style="font-size: 14px; font-weight: 700; color: var(--text-muted)">{t["seg"]}</span>'
           f'<span style="width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; '
           f'background: var(--surface)">{icon("sound", 22)}</span></div>')
    if rest:
        main = f'''<div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px">
    <span class="ln-bib ln-bib--recovery"><span class="ln-bib-inner">{t["restBib"]}</span></span>
    <span style="font-family: var(--font-display); font-size: 96px; font-weight: 800; letter-spacing: -0.03em; line-height: 1">00:38</span>
    <span style="font-size: 17px; font-weight: 600; color: var(--text-muted)">{t["restNext"]}</span>
  </div>'''
        foot = f'<a style="{PRIMARY}; height: 64px; font-size: 18px">{t["skipRest"]}</a>'
    else:
        cues = ''.join(f'<li style="display: flex; gap: 10px; font-size: 14px; line-height: 1.4"><span style="color: var(--success-ink)">'
                       f'{icon("check", 18, 2.5)}</span>{c}</li>' for c in t['cues'])
        main = f'''{anim(t, 120, True)}
  <div style="display: flex; flex-direction: column; gap: 8px; align-items: flex-start">
    <span class="ln-bib ln-bib--strength"><span class="ln-bib-inner">{t["exBib"]}</span></span>
    <h1 style="margin: 0; font-family: var(--font-display); font-size: 44px; line-height: 1.1; font-weight: 800; letter-spacing: -0.02em">Squat</h1>
    <span style="font-family: var(--font-display); font-size: 20px; font-weight: 700">{t["set"]}<span style="color: var(--text-muted)"> · {t["dose"]}</span></span>
    <div style="display: flex; gap: 6px"><span style="width: 40px; height: 8px; border-radius: var(--radius-stadium); background: var(--primary)"></span><span style="width: 40px; height: 8px; border-radius: var(--radius-stadium); background: var(--surface-sunken)"></span></div>
  </div>
  <ul style="margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 10px">{cues}</ul>
  <span style="font-size: 13px; font-weight: 600; color: var(--text-muted)">{t["hint"]}</span>'''
        foot = f'<a style="{PRIMARY}; height: 64px; font-size: 18px">{icon("check", 22, 2.5)}{t["setDone"]}</a>'
    body = f'''<div style="flex: 1; display: flex; flex-direction: column; gap: 20px; padding: 56px 20px 16px; min-height: 0">
  {top}
  {main}
</div>
<div style="display: flex; flex-direction: column; gap: 8px; padding: 8px 20px 32px">
  {foot}
  <div style="display: flex"><a style="flex: 1; min-height: 44px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: var(--text-muted)">{t["pause"]}</a><a style="flex: 1; min-height: 44px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: var(--text-muted)">{t["skipEx"]}</a></div>
</div>'''
    return page('2.3s Timer: istirahat' if rest else '2.3s Timer: mode gerakan', t['lang'], body, dark=True)


def finish(t):
    seg = ''.join(
        f'<span style="flex: 1; display: flex; align-items: center; justify-content: center; height: 40px; border-radius: var(--radius-stadium); '
        f'font-size: 13px; font-weight: {700 if i == 1 else 600}; {"background: var(--surface); box-shadow: var(--shadow-card)" if i == 1 else "color: var(--text-muted)"}">{f}</span>'
        for i, f in enumerate(t['feels']))
    rpe = ''.join(
        f'<span style="display: flex; align-items: center; justify-content: center; height: 44px; border-radius: var(--radius-md); '
        f'font-family: var(--font-display); font-weight: 800; font-size: 16px; {"background: var(--text); color: var(--bg)" if n == 6 else "background: var(--surface); box-shadow: inset 0 0 0 1px var(--line)"}">{n}</span>'
        for n in range(1, 11))
    body = f'''<div style="flex: 1; display: flex; flex-direction: column; gap: 22px; padding: 56px 20px 16px; min-height: 0">
  <div style="display: flex; flex-direction: column; gap: 8px; align-items: flex-start">
    <span style="width: 52px; height: 52px; border-radius: 50%; background: var(--success); color: var(--on-success); display: flex; align-items: center; justify-content: center">{icon("check", 26, 3)}</span>
    <h1 style="{TITLE}">{t["finTitle"]}</h1>
    <span style="font-size: 14px; font-weight: 600; color: var(--success)">{t["finSeg"]}</span>
  </div>
  <div style="display: flex; flex-direction: column; gap: 8px"><span style="font-size: 13px; font-weight: 700; color: var(--text-muted)">{t["dur"]}</span><span style="display: flex; align-items: center; height: 52px; padding: 0 16px; border-radius: var(--radius-md); background: var(--surface); box-shadow: inset 0 0 0 1.5px var(--line); font-family: var(--font-display); font-size: 20px; font-weight: 800">16:40</span></div>
  <div style="display: flex; flex-direction: column; gap: 8px"><span style="font-size: 13px; font-weight: 700; color: var(--text-muted)">{t["feel"]}</span><div style="display: flex; gap: 4px; padding: 4px; border-radius: var(--radius-stadium); background: var(--surface-sunken)">{seg}</div></div>
  <div style="display: flex; flex-direction: column; gap: 10px"><span style="font-family: var(--font-display); font-size: 17px; font-weight: 800">{t["rpeTitle"]}</span><div style="display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px">{rpe}</div><span style="font-size: 14px; font-weight: 700">{t["rpeVal"]}</span></div>
  <span style="font-size: 14px; font-weight: 700; color: var(--text-muted); text-align: center">{t["discard"]}</span>
</div>
<div style="padding: 12px 20px 32px"><a style="{PRIMARY}">{t["save"]}</a></div>'''
    return page('2.4s Selesai strength', t['lang'], body)


def row(label, value=None, sub=None, ico=None, right=None, first=False, danger=False):
    sep = '' if first else 'box-shadow: inset 0 1px 0 var(--line);'
    color = 'var(--status-behind-ink)' if danger else 'var(--text)'
    ic = f'<span style="color: {color}">{icon(ico)}</span>' if ico else ''
    subh = f'<span style="font-size: 12px; color: var(--text-muted)">{sub}</span>' if sub else ''
    val = f'<span style="font-size: 14px; color: var(--text-muted)">{value}</span>' if value else ''
    tail = right if right else f'<span style="color: var(--text-muted)">{icon("chevron", 18)}</span>'
    return (f'<div style="display: flex; align-items: center; gap: 12px; min-height: 52px; padding: 8px 16px; {sep}">{ic}'
            f'<span style="flex: 1; display: flex; flex-direction: column; gap: 2px"><span style="font-size: 15px; font-weight: 600; color: {color}">{label}</span>{subh}</span>'
            f'{val}{tail}</div>')


SWITCH_ON = ('<span style="width: 52px; height: 32px; border-radius: var(--radius-stadium); background: var(--success); position: relative">'
             '<span style="position: absolute; top: 3px; right: 3px; width: 26px; height: 26px; border-radius: 50%; background: var(--surface)"></span></span>')


def group(title, rows):
    head = f'<span style="font-size: 12px; font-weight: 800; letter-spacing: .08em; color: var(--text-muted); padding-left: 4px">{title}</span>' if title else ''
    return (f'<div style="display: flex; flex-direction: column; gap: 8px">{head}<div style="border-radius: var(--radius-md); '
            f'background: var(--surface); box-shadow: var(--shadow-card); overflow: hidden">{"".join(rows)}</div></div>')


def profile(t):
    body = f'''<div style="flex: 1; display: flex; flex-direction: column; gap: 18px; padding: 56px 20px 16px; min-height: 0">
  <div style="display: flex; align-items: center; gap: 14px"><span style="width: 56px; height: 56px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 24px; font-weight: 800">{t["runner"][0]}</span><span style="display: flex; flex-direction: column; gap: 2px"><span style="font-family: var(--font-display); font-size: 22px; font-weight: 800">{t["runner"]}</span><span style="font-size: 13px; color: var(--text-muted)">{t["nameSub"]}</span></span></div>
  {group(t["training"], [row(t["goal"], t["goalVal"], first=True), row(t["zones"], t["zonesVal"]), row(t["daysRow"], t["daysVal"]),
                         row(t["strengthRow"], sub=t["strengthSub"], right=SWITCH_ON), row(t["pauseRow"], t["pauseVal"], danger=True)])}
  {group(None, [row(t["premiumRow"], t["premiumVal"], ico="premium", first=True)])}
  <span style="font-size: 12px; color: var(--text-muted); margin-top: -10px">{t["premiumNote"]}</span>
  {group(t["data"], [row(t["privacy"], t["privacyVal"], ico="lock", first=True), row(t["help"], t["helpVal"], ico="info"),
                     row(t["langRow"], t["langVal"], ico="link"), row(t["unit"], "km", ico="distance", right="<span></span>")])}
</div>
{nav(t, 3)}'''
    return page('4.1 Profil (fase 2)', t['lang'], body)


def premium(t):
    li = lambda items, ic, col: ''.join(
        f'<li style="display: flex; gap: 12px; font-size: 14px; line-height: 1.4"><span style="color: var({col}); flex-shrink: 0">{icon(ic)}</span>{x}</li>'
        for x in items)
    price = lambda name, p, sub, on: (
        f'<div style="flex: 1; display: flex; flex-direction: column; gap: 4px; padding: 16px; border-radius: var(--radius-lg); background: var(--surface); '
        f'box-shadow: inset 0 0 0 2.5px var({"--text" if on else "--line"})"><span style="font-size: 14px; font-weight: 700">{name}</span>'
        f'<span style="font-family: var(--font-display); font-size: 22px; font-weight: 800">{p}</span><span style="font-size: 12px; color: var(--text-muted)">{sub}</span></div>')
    body = f'''<div style="flex: 1; display: flex; flex-direction: column; gap: 16px; padding: 56px 20px 16px; min-height: 0">
  {back_row(t)}
  <div style="display: flex; flex-direction: column; gap: 8px"><span style="font-size: 12px; font-weight: 800; letter-spacing: .08em; color: var(--primary-ink)">{t["pKicker"]}</span><h1 style="{TITLE}">{t["pTitle"]}</h1><span style="font-size: 15px; line-height: 1.4; color: var(--text-muted)">{t["pSub"]}</span></div>
  <div style="{CARD}; gap: 12px"><span style="font-family: var(--font-display); font-size: 17px; font-weight: 800">{t["free"]}</span><ul style="margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 10px">{li(t["freeItems"], "check", "--success")}</ul></div>
  <div style="{CARD}; gap: 12px; border-left: 8px solid var(--primary)"><span style="font-family: var(--font-display); font-size: 17px; font-weight: 800">{t["paid"]}</span><ul style="margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 10px">{li(t["paidItems"], "premium", "--primary-ink")}</ul></div>
  <div style="display: flex; gap: 8px">{price(t["yearly"], t["yPrice"], t["ySub"], True)}{price(t["monthly"], t["mPrice"], t["mSub"], False)}</div>
  <div style="display: flex; gap: 10px; padding: 12px 14px; border-radius: var(--radius-md); background: var(--status-recovery); font-size: 13px; line-height: 1.4">{icon("info", 18)}<span>{t["pPrivacy"]}</span></div>
</div>
<div style="display: flex; flex-direction: column; gap: 8px; padding: 12px 20px 32px">
  <a style="{PRIMARY}; opacity: .5">{icon("premium")}{t["cta"]}</a>
  <span style="font-size: 12px; color: var(--text-muted); text-align: center">{t["soon"]}</span>
</div>'''
    return page('4.4 Premium', t['lang'], body)


def language(t):
    opts = []
    for i, (name, sub) in enumerate(t['lOpts']):
        on = i == 0
        check = (f'<span style="width: 28px; height: 28px; border-radius: 50%; background: var(--text); color: var(--bg); display: flex; '
                 f'align-items: center; justify-content: center">{icon("check", 16, 3)}</span>') if on else f'<span style="color: var(--text-muted)">{icon("chevron", 20)}</span>'
        subh = f'<span style="font-size: 14px; color: var(--text-muted)">{sub}</span>' if sub else ''
        opts.append(f'<div style="display: flex; align-items: center; gap: 12px; min-height: 64px; padding: 12px 16px; border-radius: var(--radius-lg); '
                    f'background: var(--surface); box-shadow: inset 0 0 0 {"2.5px var(--text)" if on else "1.5px var(--line)"}"><span style="flex: 1; '
                    f'display: flex; flex-direction: column; gap: 4px"><span style="font-size: 15px; font-weight: 700">{name}</span>{subh}</span>{check}</div>')
    body = f'''<div style="flex: 1; display: flex; flex-direction: column; gap: 20px; padding: 56px 20px 16px; min-height: 0">
  {back_row(t)}
  <div style="display: flex; flex-direction: column; gap: 8px"><h1 style="{TITLE}">{t["lTitle"]}</h1><span style="font-size: 15px; line-height: 1.4; color: var(--text-muted)">{t["lSub"]}</span></div>
  <div style="display: flex; flex-direction: column; gap: 8px">{"".join(opts)}</div>
  <span style="font-size: 12px; color: var(--text-muted)">{t["lNote"]}</span>
</div>'''
    return page('4.8 Bahasa', t['lang'], body)


SCREENS = [
    ('P2-2-1s-hari-ini-strength', '2-1s-hari-ini-strength', today),
    ('P2-2-2s-detail-strength', '2-2s-detail-strength', detail),
    ('P2-2-3s-timer-gerakan', '2-3s-timer-gerakan', timer),
    ('P2-2-3s-timer-istirahat', '2-3s-timer-istirahat', lambda t: timer(t, rest=True)),
    ('P2-2-4s-selesai-strength', '2-4s-selesai-strength', finish),
    ('P2-4-1-profil-fase2', '4-1-profil-fase2', profile),
    ('P2-4-4-premium', '4-4-premium', premium),
    ('P2-4-8-bahasa', '4-8-bahasa', language),
]


def main():
    pairs = []
    for src, png, fn in SCREENS:
        for lang in ('id', 'en'):
            suffix = '' if lang == 'id' else '.en'
            name = f'{src}{suffix}.dc.html'
            out = f'{png}{"-en" if lang == "en" else ""}.png'
            pairs.append(f'{name}={out}')
            if '--pairs' not in sys.argv:
                with open(os.path.join(SRC, name), 'w', encoding='utf-8') as f:
                    f.write(fn(T[lang]))
    if '--pairs' in sys.argv:
        print(' '.join(pairs))


if __name__ == '__main__':
    main()
