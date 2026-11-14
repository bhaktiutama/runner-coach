#!/usr/bin/env python3
"""Build marketing/landing/id/index.html from index.html (the English source of truth).

The structure stays identical; only text, the language attributes and asset paths change.
Rule sentences and grade names are the app's own Indonesian (packages/training-engine/src/i18n/id.ts).
Run after any change to index.html:  python3 marketing/landing/build-id.py
The script fails if an English string it expects is missing, so the two pages cannot drift apart silently.
"""
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'index.html')
OUT = os.path.join(HERE, 'id', 'index.html')


def ws(text):
    """Regex for an English string that Prettier may have wrapped over several lines."""
    return r'\s+'.join(re.escape(w) for w in text.split())


# (English, Indonesian). Longest first is not needed: every entry is matched as a whole text or attribute.
TEXT = [
    ('RunCo: running coach app for 5K to marathon', 'RunCo: app pelatih lari untuk 5K sampai maraton'),
    ('RunCo builds a training plan back from your race date and coaches every run with a guided timer. The full running plan is free.',
     'RunCo menyusun program latihan mundur dari tanggal race-mu dan memandu setiap lari dengan timer. Plan lari lengkap gratis.'),
    ('A plan built back from race day, a timer that coaches every interval, and data that stays on your phone.',
     'Plan yang disusun mundur dari hari race, timer yang memandu setiap interval, dan data yang tetap di HP-mu.'),
    ('Skip to the plan', 'Lewati ke plan'),
    ('RunCo, back to the start', 'RunCo, kembali ke awal'),
    ('Get the app', 'Unduh app'),
    ('Scroll pace, average', 'Pace scroll, rata-rata'),
    ('Scroll pace', 'Pace scroll'),
    ('Timer sounds', 'Bunyi timer'),
    ('Easy. About 80% of your running should be.', 'Easy. Sekitar 80% larimu seharusnya begini.'),
    ('14 min at 6:46 /km', '14 mnt di 6:46 /km'),
    ('RunCo · running coach app · 5K to marathon', 'RunCo · app pelatih lari · 5K sampai maraton'),
    ('RunCo builds your plan back from race day, then coaches every run. The full running plan is free.',
     'RunCo menyusun plan-mu mundur dari hari race, lalu memandu setiap lari. Plan lari lengkap gratis.'),
    ('Get it on', 'Dapatkan di'),
    ('Download on the', 'Download di'),
    ('move your mouse: it changes every day', 'gerakkan mouse: tiap hari beda'),
    ('Pause the background film', 'Jeda video latar'),
    ('Scroll to run', 'Scroll untuk lari'),
    ('Race in 18 weeks', 'Race 18 minggu lagi'),
    ('Give RunCo your race date and training days. It builds every week back from that date. Each flag on this road is one week: the taller the flag, the more you run.',
     'Masukkan tanggal race dan hari latihanmu. RunCo menyusun setiap minggu mundur dari tanggal itu. Tiap bendera di jalan ini adalah satu minggu: makin tinggi benderanya, makin jauh larimu.'),
    ('Weekly volume of a 19-week half marathon plan in km: Base 15, 16, 17, 13, 18, 20, 21; Build 17, 23, 25, 27, 21, 29, 32; Peak 35, 27, 38; Taper 26, 19. Race day March 15.',
     'Volume mingguan plan half marathon 19 minggu dalam km: Base 15, 16, 17, 13, 18, 20, 21; Build 17, 23, 25, 27, 21, 29, 32; Peak 35, 27, 38; Taper 26, 19. Hari race 15 Maret.'),
    ('Target pace on screen. Sound cues and haptics for work, recovery, halfway and the final 3-2-1.',
     'Target pace di layar. Bunyi dan getar untuk kerja, pemulihan, setengah jalan, dan hitungan 3-2-1 terakhir.'),
    ('Try the 3-2-1', 'Coba 3-2-1'),
    ('The RunCo timer: a 44 minute tempo workout in four segments, counting down as you scroll',
     'Timer RunCo: latihan tempo 44 menit dalam empat bagian, menghitung mundur saat kamu scroll'),
    ('left of 10:00', 'tersisa dari 10:00'),
    ('Warm-up · easy pace', 'Pemanasan · pace easy'),
    ('The RunCo timer screen: tempo, 13:52 left of 14:00, target pace 6:46 per km',
     'Layar timer RunCo: tempo, 13:52 tersisa dari 14:00, target pace 6:46 per km'),
    ('this is the real screen', 'ini layar aslinya'),
    ('Optional bodyweight legs and core, 15 to 30 minutes, placed around your hard running days. Free for the first two weeks of every plan.',
     'Kaki dan core tanpa alat, opsional, 15 sampai 30 menit, diletakkan di sekitar hari lari beratmu. Gratis di dua minggu pertama setiap plan.'),
    ('The 14 exercises: pick one to see its form', '14 gerakan: pilih satu untuk melihat tekniknya'),
    ('Single-leg glute bridge', 'Glute bridge satu kaki'),
    ('Single-leg calf raise', 'Calf raise satu kaki'),
    ('Squat, shown as a looping animation of the movement', 'Squat, animasi gerakan yang berulang'),
    ('Pause the exercise animation', 'Jeda animasi gerakan'),
    ('Set done', 'Set selesai'),
    ('Open any workout and RunCo says why it is there. Every rule carries a grade, from strong evidence down to plain coaching practice.',
     'Buka latihan mana saja dan RunCo menjelaskan kenapa latihan itu ada. Setiap aturan punya tingkat bukti, dari bukti kuat sampai praktik pelatih.'),
    ("A workout's steps and the Why this workout card with a Limited evidence label and a link to sources",
     'Langkah sebuah latihan dan kartu Kenapa latihan ini dengan label Bukti terbatas dan tautan ke sumber'),
    ('Strong evidence', 'Bukti kuat'),
    ('Moderate evidence', 'Bukti sedang'),
    ('Coaching practice', 'Praktik pelatih'),
    ('Most of your running is easy', 'Sebagian besar larimu easy'),
    ('“A large easy share builds endurance with a low recovery cost.”',
     '“Porsi easy yang besar membangun daya tahan dengan beban pemulihan rendah.”'),
    ('Meta-analysis of 17 studies.', 'Meta-analisis 17 studi.'),
    ('Taper: less volume, same intensity', 'Taper: volume turun, intensitas tetap'),
    ('“A meta-analysis found this pattern helps race performance the most.”',
     '“Meta-analisis menemukan pola ini paling membantu performa saat race.”'),
    ('27 studies.', '27 studi.'),
    ('Strength, twice a week', 'Strength, dua kali seminggu'),
    ('“A meta-analysis of 25 randomised trials found strength training lowers sports injury risk.”',
     '“Meta-analisis 25 uji acak menemukan latihan kekuatan menurunkan risiko cedera olahraga.”'),
    ('No single run jumps too far', 'Tidak ada lari yang melonjak terlalu jauh'),
    ('“A study of 5,205 runners found injury risk rises when one run goes past this limit.”',
     '“Studi pada 5.205 pelari menemukan risiko cedera naik saat satu lari melewati batas ini.”'),
    ('Volume rises 10% at most', 'Volume naik paling banyak 10%'),
    ('“Research has not shown that the 10% figure itself prevents injury.”',
     '“Penelitian belum membuktikan angka 10% itu sendiri mencegah cedera.”'),
    ('Randomised trial.', 'Uji acak.'),
    ('Every few weeks is lighter', 'Tiap beberapa minggu lebih ringan'),
    ('“Volume drops so your body absorbs the training of the previous weeks.”',
     '“Volume turun supaya tubuhmu menyerap latihan minggu-minggu sebelumnya.”'),
    ('No study found that tests it.', 'Belum ada studi yang mengujinya.'),
    ('we show the weak ones too.', 'yang lemah juga kami tunjukkan.'),
    ('Back up to a file, restore on a new phone, or delete everything.',
     'Backup ke file, pulihkan di HP baru, atau hapus semuanya.'),
    ('go on, try to drag it out.', 'ayo, coba tarik keluar.'),
    ('Effort ratings', 'Rasa (RPE)'),
    ('Health answers', 'Jawaban kesehatan'),
    ('Tried to leave:', 'Mencoba keluar:'),
    ('· Left the phone:', '· Keluar dari HP:'),
    ('Our server', 'Server kami'),
    ('Sign-in email', 'Email login'),
    ('Anonymous usage stats and error reports are off until you turn them on, and never carry your name, email or training data.',
     'Statistik pemakaian dan laporan error anonim mati sampai kamu menyalakannya, dan tidak pernah membawa nama, email atau data latihanmu.'),
    ('FINISH · FINISH · FINISH · FINISH · FINISH · FINISH ·', 'FINIS · FINIS · FINIS · FINIS · FINIS · FINIS ·'),
    ('Your run through this page', 'Larimu di halaman ini'),
    ('Page 5K · finished', '5K halaman · selesai'),
    ('Thumb distance', 'Jarak jempol'),
    ('Mostly easy. That is how a base is built.', 'Kebanyakan easy. Begitulah fondasi dibangun.'),
    ('Counted in this tab only. Nothing was sent anywhere.', 'Dihitung di tab ini saja. Tidak ada yang dikirim ke mana pun.'),
    ('Your thumb did five kilometres of page. RunCo plans the real ones, free, from day one to race day.',
     'Jempolmu sudah lari lima kilometer halaman. RunCo menyusun yang sungguhan, gratis, dari hari pertama sampai hari race.'),
    ('Run it again', 'Lari lagi'),
    ('Is RunCo free?', 'Apakah RunCo gratis?'),
    ('Running is free: the full plan, the timer and your progress. Strength sessions are free for two weeks of a plan, then part of Premium, which is not on sale yet.',
     'Lari gratis: plan lengkap, timer dan progresmu. Sesi strength gratis selama dua minggu pertama plan, lalu masuk Premium, yang belum dijual.'),
    ('Which races does RunCo plan for?', 'Race apa saja yang bisa direncanakan RunCo?'),
    ('5K, 10K, half marathon and marathon, or fitness with no race.', '5K, 10K, half marathon dan marathon, atau Bugar tanpa race.'),
    ('Does RunCo need an account?', 'Apakah RunCo butuh akun?'),
    ('Yes. It holds your sign-in email and nothing about your training.', 'Ya. Akun hanya menyimpan email login-mu, tidak ada data latihanmu.'),
    ('Is RunCo medical advice?', 'Apakah RunCo saran medis?'),
    ('No. RunCo is a training guide, not a medical device. Check with a doctor before a new program.',
     'Bukan. RunCo adalah panduan latihan, bukan alat medis. Konsultasikan dengan dokter sebelum memulai program baru.'),
    ('see you at 6 am.', 'sampai jumpa jam 6 pagi.'),
    ('A running coach for your next race.', 'Pelatih lari untuk race berikutnya.'),
    ('Privacy policy', 'Kebijakan privasi'),
    ('RunCo is a training guide, not a medical device. © 2026 Bhakti Utama', 'RunCo adalah panduan latihan, bukan alat medis. © 2026 Bhakti Utama'),
]

# Short texts: only as the whole content of one element, so "Plan" or "min" never match inside a sentence.
EXACT = [
    ('Course', 'Lintasan'), ('Dist', 'Jarak'), ('Time', 'Waktu'), ('Evidence', 'Bukti'), ('Privacy', 'Privasi'),
    ('Finish', 'Finis'), ('Standing', 'Diam'), ('Wednesday', 'Rabu'), ('min', 'mnt'), ('The plan', 'Plan-nya'),
    ('Week', 'Minggu'), ('of 19', 'dari 19'), ('Phase', 'Fase'), ('This week', 'Minggu ini'),
    ('Countdown', 'Hitung mundur'), ('The timer', 'Timer-nya'), ('of 2 ·', 'dari 2 ·'), ('Your plan', 'Plan-mu'),
    ('Your runs', 'Larimu'), ('Notes', 'Catatan'), ('Legal', 'Legal'),
]

# Headlines with a marker: the whole <h1>/<h2> line pair is rewritten (word order differs).
HEADS = {
    'start-h': ('Tahu pasti harus', 'lari apa <span class="mk">hari ini</span>'),
    'plan-h': ('Plan sungguhan,', 'dari <span class="mk">hari race</span>'),
    'timer-h': ('Setiap interval,', '<span class="mk">dipandu</span>'),
    'strength-h': ('Latihan kekuatan', 'untuk <span class="mk">pelari</span>'),
    'evidence-h': ('Setiap latihan', '<span class="mk">ada alasannya</span>'),
    'privacy-h': ('Datamu tetap', '<span class="mk">di HP-mu</span>'),
    'finish-h': ('Sekarang lari', 'yang <span class="mk mk--ink">asli</span>.'),
}


def build():
    s = open(SRC, encoding='utf-8').read()

    def sub(pattern, repl, what, count=0):
        nonlocal s
        s2, n = re.subn(pattern, repl, s, count=count)
        if n == 0:
            raise SystemExit(f'build-id: not found in index.html: {what!r}')
        s = s2

    # language, alternate links, the switch, asset paths
    sub(r'<html lang="en"', '<html lang="id"', 'html lang', 1)
    sub(r'href="(styles\.css)"', r'href="../\1"', 'styles.css', 1)
    sub(r'src="(app\.js)"', r'src="../\1"', 'app.js', 1)
    sub(r'(src|href|content)="assets/', r'\1="../assets/', 'assets/')
    sub(r'href="privacy/"', 'href="../privacy/"', 'privacy link', 1)
    sub(r'<a\s+class="nav__lang"[^>]*>\s*ID\s*</a\s*>',
        '<a class="nav__lang" href="../" hreflang="en" lang="en" aria-label="Baca halaman ini dalam bahasa Inggris">EN</a>', 'language switch', 1)
    sub(r'<meta property="og:url" content="https://bhaktiutama\.com/runco/" />',
        '<meta property="og:url" content="https://bhaktiutama.com/runco/id/" />', 'og:url', 1)
    sub(r'<link rel="canonical" href="https://bhaktiutama\.com/runco/" />',
        '<link rel="canonical" href="https://bhaktiutama.com/runco/id/" />', 'canonical', 1)
    sub(r'<meta property="og:locale" content="en_US" />', '<meta property="og:locale" content="id_ID" />', 'og:locale', 1)

    for hid, (l1, l2) in HEADS.items():
        sub(r'(id="' + hid + r'"[^>]*>\s*<span class="ln">).*?(</span>\s*<span class="ln">).*?(</span>\s*</h[12]>)',
            lambda m, l1=l1, l2=l2: m.group(1) + l1 + m.group(2) + l2 + m.group(3), hid, 1)

    for en, idn in TEXT:
        sub(ws(en), idn.replace('\\', '\\\\'), en)
    for en, idn in EXACT:
        s, a = re.subn(r'>(\s*)' + re.escape(en) + r'(\s*)<', lambda m, t=idn: '>' + m.group(1) + t + m.group(2) + '<', s)
        s, b = re.subn(r'(aria-label|alt)="' + re.escape(en) + '"', r'\1="' + idn + '"', s)
        if a + b == 0:
            raise SystemExit(f'build-id: not found in index.html: {en!r}')
    sub(r'Rule (E-\d\d)', r'Aturan \1', 'Rule E-xx')

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    head = '<!-- Built from ../index.html by build-id.py: edit the English page, then rebuild. -->\n'
    open(OUT, 'w', encoding='utf-8').write(s.replace('<!doctype html>', '<!doctype html>\n' + head, 1))
    print('wrote', os.path.relpath(OUT))


if __name__ == '__main__':
    build()
