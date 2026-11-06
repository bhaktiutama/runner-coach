"""Halaman pratinjau ikon spot (artifact). python3 docs/design-system/assets/_build/spot_icons_page.py"""

import html

import spot_icons as si

GROUPS = [
    ("latihan", "Jenis latihan", "Kartu latihan di Today dan Plan, hero detail aktivitas. Warna ubin mengikuti skala panas zona, jadi warna tetap punya arti."),
    ("today", "Kartu Today", "Kepala tiap kartu carousel: race, long run berikutnya, rekor, streak."),
    ("rasa", "Rasa setelah latihan", "Layar Selesai: tiga pilihan RPE (1-4, 5-7, 8-10) sebagai wajah, angka tetap tertulis."),
    ("timer", "Timer", "Siap-siap, istirahat, pengaturan bunyi penanda, layar selesai."),
    ("progress", "Progress, profil, keadaan kosong", "Ringkasan minggu, total jarak, privasi data, layar tanpa aktivitas, catatan cedera."),
    ("badge", "Badge pencapaian", "Bentuk stadium tegak dengan pita. Muncul di ringkasan minggu dan profil (sebelumnya tercatat 'Belum ada')."),
]

USE = {
    "easy": "Easy, run-walk", "long": "Long run", "tempo": "Tempo, threshold", "interval": "Interval",
    "recovery": "Recovery, jalan", "strength": "Strength, core", "drill": "Drill, strides", "rest-day": "Hari tanpa latihan",
    "race-day": "Hitung mundur race", "next-long": "Long run berikutnya", "records": "Rekor plan", "streak": "Minggu beruntun",
    "feel-easy": "Terlalu ringan", "feel-ok": "Pas", "feel-hard": "Terlalu berat",
    "get-ready": "Siap-siap 5 dtk", "rest": "Istirahat, +15 dtk", "sound": "Bunyi penanda", "finish": "Latihan selesai",
    "week-done": "Minggu tuntas", "distance": "Total km", "privacy": "Data di perangkat", "empty": "Belum ada aktivitas",
    "injury": "Cedera, nyeri", "badge-5k": "5K pertama", "badge-plan": "Plan tuntas", "badge-streak": "4 minggu beruntun",
}


def ic(name, size=56):
    return si.svg(name, "html", size)


def tile_grid(group):
    names = [n for n, (g, _) in si.ALL.items() if g == group]
    cells = []
    for n in names:
        cells.append(
            f'<figure class="cell">{ic(n, 64)}<figcaption><b>{html.escape(USE[n])}</b><code>{n}</code></figcaption></figure>'
        )
    return "".join(cells)


sections = []
for gid, title, note in GROUPS:
    sections.append(
        f'<section class="group" id="g-{gid}"><header><h2>{title}</h2><p>{note}</p></header>'
        f'<div class="grid">{tile_grid(gid)}</div></section>'
    )

ladder = "".join(
    f'<div class="rung"><div class="row">{"".join(ic(n, sz) for n in ["easy","streak","feel-ok","get-ready","privacy","badge-5k"])}</div><span>{sz} px</span></div>'
    for sz in (64, 48, 40, 32)
)

page = f"""<title>Ikon Spot Run Coach</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap">
<style>
/* Tata letak: lembar spesimen per kelompok fitur, lalu tangga ukuran dan contoh di layar app. Token = design system Lintas. */
:root {{
  --bg: #F5F4F2; --surface: #FFFFFF; --sunken: #EAE8E5; --text: #242C32; --muted: #5E6670; --line: #DDDAD6;
  --primary: #F26B38; --primary-ink: #C63F0D;
  --si-charcoal: #242C32; --si-cream: #FFF9F2; --si-white: #FFFFFF; --si-orange: #F26B38; --si-peach: #E9B79D;
  --si-long: #D9946F; --si-interval: #B4361A; --si-mint: #70D6B3; --si-sand: #F2C66D; --si-coral: #FF806E;
  --si-lavender: #A6B8FF; --si-sunken: #EAE8E5; --si-strength: #242C32;
  --f-display: "Bricolage Grotesque", system-ui, sans-serif;
  --f-ui: "Plus Jakarta Sans", system-ui, sans-serif;
}}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{
  --bg: #161B1F; --surface: #242C32; --sunken: #1D2328; --text: #FFF9F2; --muted: #A9B0B7; --line: #343D44;
  --primary-ink: #F58A5F; --si-strength: #3A444C; --si-sunken: #343D44; color-scheme: dark; }} }}
:root[data-theme="dark"] {{
  --bg: #161B1F; --surface: #242C32; --sunken: #1D2328; --text: #FFF9F2; --muted: #A9B0B7; --line: #343D44;
  --primary-ink: #F58A5F; --si-strength: #3A444C; --si-sunken: #343D44; color-scheme: dark; }}
* {{ box-sizing: border-box; }}
body {{ background: var(--bg); color: var(--text); font-family: var(--f-ui); font-size: 15px; line-height: 1.5; }}
.wrap {{ max-width: 1080px; margin: 0 auto; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 40px 64px; display: grid; gap: 48px; }}
h1, h2, h3 {{ font-family: var(--f-display); text-wrap: balance; margin: 0; }}
h1 {{ font-size: clamp(30px, 5vw, 44px); font-weight: 800; letter-spacing: -0.01em; line-height: 1.1; }}
h2 {{ font-size: 22px; font-weight: 800; }}
h3 {{ font-size: 16px; font-weight: 700; font-family: var(--f-ui); }}
p {{ margin: 0; max-width: 64ch; }}
.muted, header p {{ color: var(--muted); }}
.intro {{ display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 32px; align-items: end; }}
.intro .hero {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; justify-items: center; }}
.intro .hero svg {{ width: 100%; height: auto; max-width: 96px; }}
.eyebrow {{ font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--primary-ink); }}
.lede {{ display: grid; gap: 12px; }}
.rules {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }}
.rule {{ background: var(--surface); border: 1px solid var(--line); border-radius: 16px; padding: 16px; display: grid; gap: 4px; }}
.rule b {{ font-family: var(--f-display); font-size: 18px; font-variant-numeric: tabular-nums; }}
.rule span {{ color: var(--muted); font-size: 13px; }}
.group {{ display: grid; gap: 16px; }}
.group header {{ display: grid; gap: 4px; border-top: 1px solid var(--line); padding-top: 20px; }}
.grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(118px, 1fr)); gap: 12px; }}
.cell {{ margin: 0; background: var(--surface); border-radius: 18px; padding: 18px 12px 14px; display: grid; justify-items: center; gap: 10px; text-align: center; }}
.cell figcaption {{ display: grid; gap: 2px; font-size: 13px; }}
.cell code {{ font-size: 11px; color: var(--muted); }}
.ladder {{ display: grid; gap: 12px; background: var(--surface); border-radius: 20px; padding: 20px; overflow-x: auto; }}
.rung {{ display: flex; align-items: center; gap: 16px; }}
.rung .row {{ display: flex; gap: 12px; align-items: center; }}
.rung span {{ font-size: 12px; color: var(--muted); font-variant-numeric: tabular-nums; }}
.demo {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }}
.phone {{ background: var(--bg); border: 1px solid var(--line); border-radius: 28px; padding: 16px; display: grid; gap: 12px; align-content: start; }}
.phone > h3 {{ font-size: 13px; color: var(--muted); font-weight: 600; }}
.card {{ background: var(--surface); border-radius: 18px; padding: 14px; display: flex; gap: 12px; align-items: center; }}
.card .txt {{ display: grid; gap: 2px; min-width: 0; flex: 1; }}
.card .t1 {{ font-weight: 700; }}
.card .t2 {{ font-size: 13px; color: var(--muted); }}
.num {{ font-family: var(--f-display); font-weight: 800; font-variant-numeric: tabular-nums; }}
.card .num {{ font-size: 16px; }}
.big {{ display: grid; gap: 10px; }}
.big .count {{ display: flex; gap: 16px; align-items: baseline; }}
.big .count .num {{ font-size: 36px; line-height: 1; }}
.big .count small {{ color: var(--muted); font-size: 13px; }}
.feel {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }}
.feel button {{ font: inherit; color: var(--text); background: var(--surface); border: 2px solid transparent; border-radius: 16px; padding: 12px 4px; display: grid; justify-items: center; gap: 6px; cursor: pointer; }}
.feel button[aria-pressed="true"] {{ border-color: var(--text); }}
.feel button:focus-visible {{ outline: 3px solid var(--primary); outline-offset: 2px; }}
.feel span {{ font-size: 12px; font-weight: 600; }}
.feel small {{ font-size: 11px; color: var(--muted); font-variant-numeric: tabular-nums; }}
.badges {{ display: flex; gap: 12px; }}
.notes {{ display: grid; gap: 8px; }}
.notes ul {{ margin: 0; padding-left: 20px; display: grid; gap: 6px; max-width: 72ch; }}
@media (max-width: 720px) {{ .intro {{ grid-template-columns: minmax(0, 1fr); }} }}
</style>
<div class="wrap">
  <section class="intro">
    <div class="lede">
      <span class="eyebrow">Usulan desain, belum di app</span>
      <h1>Ikon spot Run Coach</h1>
      <p>27 ikon berwarna untuk menempel di fitur: jenis latihan, kartu Today, rasa setelah latihan, timer, progress dan badge. Ikon garis 24 px yang sudah ada tetap dipakai untuk navigasi dan tombol; ikon spot ini untuk memberi wajah pada konten.</p>
    </div>
    <div class="hero">{ic("easy", 96)}{ic("streak", 96)}{ic("feel-ok", 96)}{ic("strength", 96)}</div>
  </section>

  <section class="rules" aria-label="Aturan bentuk">
    <div class="rule"><b>48 px grid</b><span>Ubin persegi radius 14, tampil 32 sampai 64 px</span></div>
    <div class="rule"><b>Garis 1.75</b><span>Tipis dan luwes, ujung bulat, tinta charcoal (krem di ubin gelap)</span></div>
    <div class="rule"><b>1 aksen</b><span>Oranye primary untuk satu bagian saja: sol, nyala, pita</span></div>
    <div class="rule"><b>Wajah titik</b><span>Dua titik + senyum, hanya di ikon yang punya rasa (sepatu, nyala, stopwatch, RPE)</span></div>
    <div class="rule"><b>Warna = arti</b><span>Ubin latihan = skala panas zona; ubin status = mint, sand, coral, lavender</span></div>
  </section>

  {"".join(sections)}

  <section class="group">
    <header><h2>Tangga ukuran</h2><p>Wajah dan detail masih terbaca di 32 px. Di bawah 32 px pakai ikon garis 24 px.</p></header>
    <div class="ladder">{ladder}</div>
  </section>

  <section class="group">
    <header><h2>Contoh di layar</h2><p>Mockup kasar untuk melihat proporsi, bukan desain layar final.</p></header>
    <div class="demo">
      <div class="phone">
        <h3>Today: kartu latihan</h3>
        <div class="card">{ic("easy", 44)}<div class="txt"><span class="t1">Easy run</span><span class="t2">40 menit, santai bisa ngobrol</span></div><span class="num">6:45</span></div>
        <div class="card">{ic("strength", 44)}<div class="txt"><span class="t1">Strength</span><span class="t2">Squat, plank, glute bridge</span></div><span class="num">25'</span></div>
        <div class="card">{ic("rest-day", 44)}<div class="txt"><span class="t1">Hari istirahat</span><span class="t2">Besok tempo 30 menit</span></div></div>
      </div>
      <div class="phone">
        <h3>Today: kartu carousel</h3>
        <div class="card big"><div style="display:flex;gap:12px;align-items:center">{ic("race-day", 44)}<div class="txt"><span class="t1">Jakarta 10K</span><span class="t2">Min 14 Des · 06.00</span></div></div>
          <div class="count"><span class="num">37</span><small>hari</small><span class="num">18</span><small>jam</small></div></div>
        <div class="card">{ic("streak", 44)}<div class="txt"><span class="t1">5 minggu beruntun</span><span class="t2">Minggu ini 2 dari 4 latihan</span></div></div>
      </div>
      <div class="phone">
        <h3>Selesai: bagaimana rasanya?</h3>
        <div class="feel" role="group" aria-label="Rasa latihan">
          <button type="button" id="feel-1" aria-pressed="false">{ic("feel-easy", 44)}<span>Terlalu ringan</span><small>RPE 1-4</small></button>
          <button type="button" id="feel-2" aria-pressed="true">{ic("feel-ok", 44)}<span>Pas</span><small>RPE 5-7</small></button>
          <button type="button" id="feel-3" aria-pressed="false">{ic("feel-hard", 44)}<span>Terlalu berat</span><small>RPE 8-10</small></button>
        </div>
        <h3>Ringkasan minggu: badge</h3>
        <div class="badges">{ic("badge-5k", 56)}{ic("badge-plan", 56)}{ic("badge-streak", 56)}</div>
      </div>
    </div>
  </section>

  <section class="notes">
    <h2>Catatan sebelum implementasi</h2>
    <ul>
      <li>Belum dipasang di app. File SVG ada di <code>docs/design-system/assets/spot-icons-draft/</code>, dibuat dari <code>_build/spot_icons.py</code>.</li>
      <li>Semua warna dari token Lintas. Mode gelap: ubin pastel tetap, ubin strength memakai <code>zone-strength</code> gelap.</li>
      <li>Wajah di RPE selalu disertai teks dan angka, jadi tidak bergantung pada warna atau ekspresi saja.</li>
      <li>Perlu keputusan: ikon mana yang dipakai dan di layar mana, lalu update spec 04-UI-UX (komponen baru <code>SpotIcon</code>) sebelum dipasang.</li>
    </ul>
  </section>
</div>
<script>
document.querySelectorAll('.feel button').forEach(b => b.addEventListener('click', () => {{
  document.querySelectorAll('.feel button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
}}));
</script>
"""

(si.OUT / "index.html").write_text(page)
print("ok", si.OUT / "index.html")
