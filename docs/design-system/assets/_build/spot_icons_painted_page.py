"""Halaman pratinjau ikon spot gaya lukisan + pembanding versi flat. python3 spot_icons_painted_page.py"""

import html

import spot_icons as flat
import spot_icons_painted as pt
from spot_icons_page import GROUPS, USE

USE = {**USE, "streak": "Minggu beruntun (api unggun)", "sound": "Bunyi penanda (lonceng angin)",
       "privacy": "Data di perangkat (rumah)", "empty": "Belum ada aktivitas", "rest": "Istirahat, +15 dtk"}


def cell(n):
    return (f'<figure class="cell"><div class="pair">{pt.svg(n, 88)}<span class="was" title="Versi flat">{flat.svg(n, "html", 28)}</span></div>'
            f'<figcaption><b>{html.escape(USE[n])}</b><code>{n}</code></figcaption></figure>')


sections = "".join(
    f'<section class="group"><header><h2>{t}</h2><p>{note}</p></header>'
    f'<div class="grid">{"".join(cell(n) for n, (g, _) in pt.ALL.items() if g == gid)}</div></section>'
    for gid, t, note in GROUPS
)

ladder = "".join(
    f'<div class="rung"><div class="row">{"".join(pt.svg(n, sz) for n in ["easy","long","feel-ok","rest-day","privacy","badge-plan"])}</div><span>{sz} px</span></div>'
    for sz in (72, 56, 40, 32)
)

page = f"""<title>Ikon Spot Lukisan</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap">
<style>
/* Tata letak: lembar spesimen per fitur; tiap ikon lukisan ditemani versi flat kecil sebagai pembanding. */
:root {{
  --bg: #F5F4F2; --surface: #FFFFFF; --text: #242C32; --muted: #5E6670; --line: #DDDAD6; --ink: #5A4636; --accent: #C63F0D;
  --si-charcoal: #242C32; --si-cream: #FFF9F2; --si-white: #FFFFFF; --si-orange: #F26B38; --si-peach: #E9B79D;
  --si-long: #D9946F; --si-interval: #B4361A; --si-mint: #70D6B3; --si-sand: #F2C66D; --si-coral: #FF806E;
  --si-lavender: #A6B8FF; --si-sunken: #EAE8E5; --si-strength: #242C32;
  --f-display: "Bricolage Grotesque", system-ui, sans-serif; --f-ui: "Plus Jakarta Sans", system-ui, sans-serif;
}}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{
  --bg: #161B1F; --surface: #242C32; --text: #FFF9F2; --muted: #A9B0B7; --line: #343D44; --ink: #E9D6C2; --accent: #F58A5F;
  --si-strength: #3A444C; --si-sunken: #343D44; color-scheme: dark; }} }}
:root[data-theme="dark"] {{
  --bg: #161B1F; --surface: #242C32; --text: #FFF9F2; --muted: #A9B0B7; --line: #343D44; --ink: #E9D6C2; --accent: #F58A5F;
  --si-strength: #3A444C; --si-sunken: #343D44; color-scheme: dark; }}
* {{ box-sizing: border-box; }}
body {{ background: var(--bg); color: var(--text); font-family: var(--f-ui); font-size: 15px; line-height: 1.5; }}
.wrap {{ max-width: 1080px; margin: 0 auto; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 40px 64px; display: grid; gap: 44px; }}
h1, h2 {{ font-family: var(--f-display); text-wrap: balance; margin: 0; }}
h1 {{ font-size: clamp(30px, 5vw, 44px); font-weight: 800; line-height: 1.1; }}
h2 {{ font-size: 22px; font-weight: 800; }}
p {{ margin: 0; max-width: 64ch; }}
header p, .muted {{ color: var(--muted); }}
.eyebrow {{ font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent); }}
.intro {{ display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 32px; align-items: center; }}
.lede {{ display: grid; gap: 12px; }}
.hero {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; justify-items: center; }}
.hero svg {{ width: 100%; height: auto; max-width: 132px; }}
.rules {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 12px; }}
.rule {{ background: var(--surface); border: 1px solid var(--line); border-radius: 16px; padding: 16px; display: grid; gap: 4px; }}
.rule b {{ font-family: var(--f-display); font-size: 17px; }}
.rule span {{ color: var(--muted); font-size: 13px; }}
.group {{ display: grid; gap: 16px; }}
.group header {{ display: grid; gap: 4px; border-top: 1px solid var(--line); padding-top: 20px; }}
.grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; }}
.cell {{ margin: 0; background: var(--surface); border-radius: 20px; padding: 16px 12px 14px; display: grid; justify-items: center; gap: 10px; text-align: center; }}
.pair {{ position: relative; }}
.was {{ position: absolute; right: -10px; bottom: -6px; background: var(--surface); border-radius: 10px; padding: 3px; line-height: 0; }}
.cell figcaption {{ display: grid; gap: 2px; font-size: 13px; }}
.cell code {{ font-size: 11px; color: var(--muted); }}
.ladder {{ display: grid; gap: 12px; background: var(--surface); border-radius: 20px; padding: 20px; overflow-x: auto; }}
.rung {{ display: flex; align-items: center; gap: 16px; }}
.rung .row {{ display: flex; gap: 12px; align-items: center; }}
.rung span {{ font-size: 12px; color: var(--muted); font-variant-numeric: tabular-nums; }}
.compare {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 12px; }}
.compare table {{ width: 100%; border-collapse: collapse; font-size: 14px; }}
.tbl {{ background: var(--surface); border-radius: 20px; padding: 8px 16px; overflow-x: auto; }}
th, td {{ text-align: left; padding: 10px 8px; border-bottom: 1px solid var(--line); vertical-align: top; }}
tr:last-child td {{ border-bottom: 0; }}
th {{ font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }}
.notes ul {{ margin: 0; padding-left: 20px; display: grid; gap: 6px; max-width: 74ch; }}
@media (max-width: 720px) {{ .intro {{ grid-template-columns: minmax(0, 1fr); }} }}
</style>
<div class="wrap">
  <section class="intro">
    <div class="lede">
      <span class="eyebrow">Alternatif gaya, belum di app</span>
      <h1>Ikon spot gaya lukisan cat air</h1>
      <p>Konsep dan nama sama dengan versi flat (27 ikon), tetapi tiap ubin jadi pemandangan kecil: langit pagi atau senja, bukit hijau, awan cumulus, garis cokelat yang sedikit goyah seperti digambar tangan dan tekstur kertas. Terinspirasi suasana film animasi Jepang klasik, tanpa memakai karakter film mana pun.</p>
      <p class="muted">Ikon kecil di pojok tiap kartu = versi flat yang sudah disetujui, untuk membandingkan.</p>
    </div>
    <div class="hero">{pt.svg("long", 132)}{pt.svg("rest-day", 132)}{pt.svg("privacy", 132)}</div>
  </section>

  <section class="rules" aria-label="Ciri gaya">
    <div class="rule"><b>Ubin = pemandangan</b><span>Waktu dalam hari punya arti: pagi untuk mulai, senja untuk tempo dan streak, malam untuk istirahat</span></div>
    <div class="rule"><b>Tinta cokelat</b><span>Garis 1.8 warna cokelat hangat, bukan charcoal, dengan goyangan halus</span></div>
    <div class="rule"><b>Cat air + kertas</b><span>Bukit dan awan dengan tepi luntur, butir kertas tipis di atas semua</span></div>
    <div class="rule"><b>Wajah lembut</b><span>Mata dengan titik cahaya dan pipi merona, hanya di benda yang punya rasa</span></div>
    <div class="rule"><b>Oranye tetap</b><span>Aksen oranye brand tetap ada: sol, kerucut, api, pita badge</span></div>
  </section>

  {sections}

  <section class="group">
    <header><h2>Tangga ukuran</h2><p>Gaya ini butuh ruang. Detail pemandangan mulai hilang di 32 px, jadi paling cocok di 48 px ke atas (kartu, hero, layar selesai).</p></header>
    <div class="ladder">{ladder}</div>
  </section>

  <section class="group">
    <header><h2>Flat atau lukisan?</h2><p>Perbandingan untuk keputusan. Keduanya bisa dipakai bersama: flat untuk daftar kecil, lukisan untuk momen besar.</p></header>
    <div class="tbl"><table>
      <thead><tr><th>Aspek</th><th>Flat (versi 1)</th><th>Lukisan (versi ini)</th></tr></thead>
      <tbody>
        <tr><td>Kesan</td><td>Rapi, modern, seperti app iOS</td><td>Hangat, bercerita, terasa seperti buku bergambar</td></tr>
        <tr><td>Ukuran minimum</td><td>32 px masih jelas</td><td>Sebaiknya 48 px ke atas</td></tr>
        <tr><td>Warna</td><td>Semua dari token Lintas</td><td>Butuh warna baru (langit, rumput, tinta cokelat); perlu masuk token dan cek kontras</td></tr>
        <tr><td>Mode gelap</td><td>Ubin pastel, strength menyesuaikan</td><td>Pemandangan tetap sama di dua tema (berdiri sendiri seperti gambar)</td></tr>
        <tr><td>Di app native</td><td>SVG biasa, bisa langsung</td><td>Efek goyang dan kertas memakai filter SVG yang kemungkinan tidak didukung react-native-svg; rencana: ekspor PNG 3x</td></tr>
        <tr><td>Ukuran file</td><td>Sekitar 1 KB per ikon</td><td>Sekitar 4 KB per SVG; PNG 3x akan lebih besar</td></tr>
        <tr><td>Cocok untuk</td><td>Kartu latihan, daftar, chip RPE</td><td>Hero detail aktivitas, layar selesai, ringkasan minggu, keadaan kosong, badge</td></tr>
      </tbody>
    </table></div>
  </section>

  <section class="notes group">
    <h2>Catatan</h2>
    <ul>
      <li>Belum dipasang di app. File di <code>docs/design-system/assets/spot-icons-painted-draft/</code>, dibuat dari <code>_build/spot_icons_painted.py</code>.</li>
      <li>Ubah konsep dari versi flat: streak jadi api unggun tanpa wajah, bunyi penanda jadi lonceng angin, privasi jadi rumah dengan jendela menyala (data tinggal di rumah = di HP), belum ada aktivitas jadi sepatu tidur di bawah pohon, istirahat jadi botol di tepi sungai.</li>
      <li>Ini gambar vektor buatan kode, bukan lukisan asli. Jika ingin hasil yang benar-benar seperti dilukis tangan, perlu ilustrator atau generator gambar, lalu dirapikan ke ukuran ikon.</li>
    </ul>
  </section>
</div>
"""

(pt.OUT / "index.html").write_text(page)
print("ok")
