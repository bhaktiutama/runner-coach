"""Halaman pratinjau ikon spot (artifact). python3 docs/design-system/assets/_build/spot_icons_page.py"""

import html

import spot_icons as si

GROUPS = [
    ("latihan", "Jenis latihan", "Warna ubin = skala panas zona, jadi warna tetap punya arti."),
    ("latihan2", "Jenis latihan tambahan", "Untuk jenis yang sekarang masih meminjam ikon lain (progression, run-walk, strides, core)."),
    ("today", "Kartu Today", "Kepala kartu geser 2.1."),
    ("rasa", "Rasa setelah latihan", "Wajah RPE: 1-4 ringan, 5-7 pas, 8-10 berat. Angka tetap tertulis."),
    ("catatan", "Catatan latihan", "Tag di 2.4 / 2.6: cuaca panas, kurang tidur, kaki pegal (ada nyeri memakai ikon cedera)."),
    ("timer", "Timer", "Siap-siap, istirahat, bunyi penanda, selesai."),
    ("target", "Target", "Pilihan target 1.2 dan baris Target di Profil."),
    ("fase", "Fase plan", "Base, Build, Peak, Taper. Warna ubin = token fase."),
    ("progress", "Progres, privasi, keadaan kosong", "Ringkasan minggu, total jarak, data di HP, belum ada aktivitas, cedera."),
    ("jeda", "Jeda plan", "Alasan jeda 4.3 (cedera memakai ikon cedera)."),
    ("setelan", "Pengaturan dan onboarding", "Pengingat, backup, bahasa, panduan, Premium, zona, detak jantung, integrasi, cek kesehatan, hari latihan."),
    ("badge", "Badge pencapaian", "Kartu Pencapaian di Progres (F-28)."),
]

USE = {
    "easy": "Easy run", "long": "Long run", "tempo": "Tempo, threshold", "interval": "Interval",
    "recovery": "Recovery, jalan", "strength": "Strength, core", "drill": "Drill, strides", "rest-day": "Hari tanpa latihan",
    "race-day": "Hitung mundur race", "next-long": "Long run berikutnya", "records": "Rekor plan", "streak": "Minggu beruntun",
    "feel-easy": "Terlalu ringan", "feel-ok": "Pas", "feel-hard": "Terlalu berat",
    "get-ready": "Siap-siap 5 dtk", "rest": "Istirahat, +15 dtk", "sound": "Bunyi penanda", "finish": "Latihan selesai",
    "week-done": "Minggu tuntas", "distance": "Total km", "privacy": "Data di perangkat", "empty": "Belum ada aktivitas",
    "injury": "Cedera, nyeri", "badge-5k": "5K pertama", "badge-plan": "Plan tuntas", "badge-streak": "4 minggu beruntun",
    **{k: v[1] for k, v in si.NEXT.items()},
}

# Tempat ikon sudah dipakai di app (layar).
IN_APP = {
    "easy": "2.1 · 3.1 · 3.3 · 3.4", "long": "2.1 · 3.1 · 3.3 · 3.4", "tempo": "2.1 · 3.1 · 3.3 · 3.4",
    "interval": "2.1 · 3.1 · 3.3 · 3.4", "recovery": "3.1 · 3.3 · 3.4", "strength": "2.1 · 3.1 · 3.3 · 3.4",
    "drill": "3.1 · 3.3 (strides)", "rest-day": "3.1", "race-day": "2.1 kartu geser", "next-long": "2.1 kartu geser",
    "records": "2.1 kartu geser", "streak": "2.1 kartu geser", "feel-easy": "2.4 · 2.6 · 3.4", "feel-ok": "2.4 · 2.6 · 3.4",
    "feel-hard": "2.4 · 2.6 · 3.4", "get-ready": "2.3s · 2.5", "rest": "2.3s", "sound": "2.3 izin notifikasi",
    "finish": "2.4 · 2.1 (sisa plan)", "week-done": "3.3", "distance": "2.5", "privacy": "4.5", "empty": "3.3",
    "injury": "4.3", "badge-5k": "3.3 Pencapaian", "badge-plan": "3.3 Pencapaian", "badge-streak": "3.3 Pencapaian",
}

# Usulan penempatan untuk ikon baru: (layar, isi, prioritas).
IDEAS = {
    "progression": ("2.1 · 3.1 · 3.3 · 3.4", "Ganti ikon pinjaman (sekarang easy) lewat TYPE_SPOT", "Tinggi"),
    "strides": ("2.1 · 3.1 · 3.3 · 3.4", "Ganti ikon pinjaman (sekarang drill)", "Tinggi"),
    "run-walk": ("2.1 · 3.1 · 3.3 · 3.4", "Ganti ikon pinjaman (sekarang recovery)", "Tinggi"),
    "core": ("2.1 · 3.1 · 3.3 · 3.4", "Bedakan core dari strength", "Tinggi"),
    "tag-hot": ("2.4 · 2.6 · 3.4", "Ikon kecil di chip tag dan baris catatan detail aktivitas", "Sedang"),
    "tag-sleep": ("2.4 · 2.6 · 3.4", "Sama, chip Kurang tidur", "Sedang"),
    "tag-sore": ("2.4 · 2.6 · 3.4", "Sama, chip Kaki pegal (Ada nyeri = ikon cedera)", "Sedang"),
    "goal-5k": ("1.2 · 4.1", "Kartu pilihan target dan baris Target di Profil", "Sedang"),
    "goal-10k": ("1.2 · 4.1", "Sama", "Sedang"),
    "goal-hm": ("1.2 · 4.1", "Sama", "Sedang"),
    "goal-fm": ("1.2 · 4.1", "Sama", "Sedang"),
    "goal-fitness": ("1.2 · 4.1", "Sama, target Bugar", "Sedang"),
    "phase-base": ("3.1 · 1.8 · 2.5", "Di samping nama minggu (\"Minggu 3 · Base\") dan legenda fase", "Sedang"),
    "phase-build": ("3.1 · 1.8 · 2.5", "Sama", "Sedang"),
    "phase-peak": ("3.1 · 1.8 · 2.5", "Sama", "Sedang"),
    "phase-taper": ("3.1 · 1.8 · 2.5", "Sama; juga kartu \"minggu taper\" di 2.1", "Sedang"),
    "pause-sick": ("4.3", "Chip alasan Sakit (Cedera = ikon cedera)", "Sedang"),
    "pause-busy": ("4.3", "Chip alasan Sibuk / libur", "Sedang"),
    "backup": ("2.1 · 4.5", "Kartu pengingat backup di Hari ini dan bagian Backup di 4.5", "Sedang"),
    "reminder": ("1.6 · 4.1", "Baris pengingat latihan", "Rendah"),
    "days": ("1.6 · 4.1", "Judul pilih hari latihan, baris Hari di Profil", "Rendah"),
    "health": ("1.7", "Kepala layar cek kesehatan", "Rendah"),
    "language": ("4.8", "Kepala layar Bahasa", "Rendah"),
    "guide": ("4.7", "Kepala layar Panduan & istilah", "Rendah"),
    "premium": ("4.4 · 2.1", "Hero Premium dan kartu strength terkunci", "Rendah"),
    "zones": ("Zona pace · 1.8", "Kepala layar zona dan bagian zona di preview plan", "Rendah"),
    "heart-rate": ("2.2 · 4.2", "Panduan detak jantung (fase 2)", "Rendah, fase 2"),
    "integration": ("4.2", "Layar integrasi Strava / Health (fase 2)", "Rendah, fase 2"),
}

# Ide tambahan untuk ikon yang sudah ada.
MORE = [
    ("week-done", "2.1 kartu \"Minggu ini\"", "Ikon kecil di kepala kartu lajur minggu"),
    ("records", "3.3 kartu Prediksi", "Ikon di label prediksi race"),
    ("distance", "2.6 Catat lari manual", "Kepala layar, menggantikan ruang kosong di atas form"),
    ("finish", "1.3 Tanggal race", "Ikon di samping tanggal yang dipilih"),
    ("badge-5k", "2.5 Ringkasan minggu", "Badge yang baru didapat minggu ini tampil besar di bawah oval 4/4"),
]


def ic(name, size=64):
    return si.svg(name, "html", size)


def cell(n):
    new = n in si.NEXT
    status = (f'<span class="pill new">Baru</span>' if new else f'<span class="pill on">Di app</span>')
    where = IDEAS[n][0] if new else IN_APP.get(n, "")
    return (f'<figure class="cell" data-kind="{"new" if new else "app"}"><div class="ico">{ic(n)}</div>'
            f'<figcaption><b>{html.escape(USE[n])}</b>{status}<small>{html.escape(where)}</small><code>{n}</code></figcaption></figure>')


sections = "".join(
    f'<section class="group" data-group="{gid}"><header><h2>{t}</h2><p>{note}</p></header>'
    f'<div class="grid">{"".join(cell(n) for n, (g, _) in si.ALL.items() if g == gid)}</div></section>'
    for gid, t, note in GROUPS
)

idea_rows = "".join(
    f'<tr><td class="ti">{ic(n, 32)}</td><td><b>{html.escape(USE[n])}</b><br><code>{n}</code></td>'
    f'<td>{html.escape(w)}</td><td>{html.escape(what)}</td><td><span class="prio p{prio.split(",")[0].lower()}">{html.escape(prio)}</span></td></tr>'
    for n, (w, what, prio) in sorted(IDEAS.items(), key=lambda kv: ["Tinggi", "Sedang", "Rendah"].index(kv[1][2].split(",")[0]))
)
more_rows = "".join(
    f'<tr><td class="ti">{ic(n, 32)}</td><td><code>{n}</code></td><td>{html.escape(w)}</td><td>{html.escape(what)}</td></tr>'
    for n, w, what in MORE
)

ladder = "".join(
    f'<div class="rung"><div class="row">{"".join(ic(n, sz) for n in ["easy", "streak", "feel-ok", "goal-10k", "phase-peak", "reminder", "badge-5k"])}</div><span>{sz} px</span></div>'
    for sz in (64, 48, 40, 32)
)

n_app = len(si.APP)
n_new = len(si.NEXT)

page = f"""<title>Ikon Spot Run Coach</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap">
<style>
/* Tata letak: katalog ikon per fitur dengan filter dan ukuran, lalu tabel ide penempatan. Token = design system Lintas. */
:root {{
  --bg: #F5F4F2; --surface: #FFFFFF; --sunken: #EAE8E5; --text: #242C32; --muted: #5E6670; --line: #DDDAD6;
  --primary: #F26B38; --primary-ink: #C63F0D; --ok: #247F60; --ok-bg: #D4F3E8; --new-bg: #FCE3D8;
  --si-charcoal: #242C32; --si-cream: #FFF9F2; --si-white: #FFFFFF; --si-orange: #F26B38; --si-peach: #E9B79D;
  --si-long: #D9946F; --si-interval: #B4361A; --si-mint: #70D6B3; --si-sand: #F2C66D; --si-coral: #FF806E;
  --si-lavender: #A6B8FF; --si-sunken: #EAE8E5; --si-strength: #242C32;
  --f-display: "Bricolage Grotesque", system-ui, sans-serif;
  --f-ui: "Plus Jakarta Sans", system-ui, sans-serif;
  --ico: 64px;
}}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{
  --bg: #161B1F; --surface: #242C32; --sunken: #1D2328; --text: #FFF9F2; --muted: #A9B0B7; --line: #343D44;
  --primary-ink: #F58A5F; --ok: #70D6B3; --ok-bg: #1F3A31; --new-bg: #4A2A1D; --si-strength: #3A444C; color-scheme: dark; }} }}
:root[data-theme="dark"] {{
  --bg: #161B1F; --surface: #242C32; --sunken: #1D2328; --text: #FFF9F2; --muted: #A9B0B7; --line: #343D44;
  --primary-ink: #F58A5F; --ok: #70D6B3; --ok-bg: #1F3A31; --new-bg: #4A2A1D; --si-strength: #3A444C; color-scheme: dark; }}
* {{ box-sizing: border-box; }}
body {{ background: var(--bg); color: var(--text); font-family: var(--f-ui); font-size: 15px; line-height: 1.5; }}
.wrap {{ max-width: 1120px; margin: 0 auto; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 40px 72px; display: grid; gap: 40px; }}
h1, h2, h3 {{ font-family: var(--f-display); text-wrap: balance; margin: 0; }}
h1 {{ font-size: clamp(30px, 5vw, 46px); font-weight: 800; line-height: 1.08; }}
h2 {{ font-size: 21px; font-weight: 800; }}
p {{ margin: 0; max-width: 66ch; }}
code {{ font-size: 11px; color: var(--muted); }}
header p, .muted {{ color: var(--muted); }}
.eyebrow {{ font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--primary-ink); }}
.intro {{ display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: 32px; align-items: center; }}
.lede {{ display: grid; gap: 14px; }}
.stats {{ display: flex; flex-wrap: wrap; gap: 10px; }}
.stat {{ background: var(--surface); border: 1px solid var(--line); border-radius: 14px; padding: 10px 14px; display: grid; }}
.stat b {{ font-family: var(--f-display); font-size: 26px; font-weight: 800; line-height: 1.1; font-variant-numeric: tabular-nums; }}
.stat span {{ font-size: 12px; color: var(--muted); }}
.mosaic {{ display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; }}
.mosaic svg {{ width: 100%; height: auto; display: block; }}
.rules {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 12px; }}
.rule {{ background: var(--surface); border: 1px solid var(--line); border-radius: 16px; padding: 14px 16px; display: grid; gap: 2px; }}
.rule b {{ font-family: var(--f-display); font-size: 17px; }}
.rule span {{ color: var(--muted); font-size: 13px; }}
.bar {{ position: sticky; top: env(safe-area-inset-top, 0px); z-index: 5; background: var(--bg); padding-block: 10px; display: flex; flex-wrap: wrap; gap: 10px; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--line); }}
body::before {{ content: ""; position: fixed; inset: 0 0 auto; height: env(safe-area-inset-top, 0px); z-index: 10; background: var(--bg); }}
.seg {{ display: inline-flex; flex-wrap: wrap; background: var(--surface); border: 1px solid var(--line); border-radius: 999px; padding: 3px; gap: 2px; }}
.seg button {{ font: inherit; font-size: 13px; font-weight: 600; color: var(--text); background: transparent; border: 0; border-radius: 999px; padding: 7px 14px; cursor: pointer; }}
.seg button[aria-pressed="true"] {{ background: var(--text); color: var(--bg); }}
.seg button:focus-visible {{ outline: 3px solid var(--primary); outline-offset: 2px; }}
.group {{ display: grid; gap: 14px; }}
.group header {{ display: grid; gap: 2px; padding-top: 8px; }}
.grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }}
.cell {{ margin: 0; background: var(--surface); border-radius: 18px; padding: 18px 12px 14px; display: grid; justify-items: center; gap: 10px; text-align: center; align-content: start; }}
.ico svg {{ width: var(--ico); height: var(--ico); display: block; }}
.cell figcaption {{ display: grid; gap: 4px; justify-items: center; font-size: 13px; }}
.cell small {{ font-size: 11px; color: var(--muted); line-height: 1.3; }}
.pill {{ font-size: 10px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; border-radius: 999px; padding: 2px 8px; }}
.pill.on {{ background: var(--ok-bg); color: var(--ok); }}
.pill.new {{ background: var(--new-bg); color: var(--primary-ink); }}
body[data-filter="app"] .cell[data-kind="new"], body[data-filter="new"] .cell[data-kind="app"] {{ display: none; }}
.group.empty {{ display: none; }}
.ladder {{ display: grid; gap: 12px; background: var(--surface); border-radius: 20px; padding: 20px; overflow-x: auto; }}
.rung {{ display: flex; align-items: center; gap: 16px; }}
.rung .row {{ display: flex; gap: 12px; align-items: center; }}
.rung span {{ font-size: 12px; color: var(--muted); font-variant-numeric: tabular-nums; white-space: nowrap; }}
.tbl {{ background: var(--surface); border-radius: 20px; padding: 6px 14px; overflow-x: auto; }}
table {{ width: 100%; border-collapse: collapse; font-size: 14px; min-width: 640px; }}
th, td {{ text-align: left; padding: 10px 8px; border-bottom: 1px solid var(--line); vertical-align: middle; }}
tr:last-child td {{ border-bottom: 0; }}
th {{ font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); }}
td.ti {{ width: 44px; line-height: 0; }}
.prio {{ font-size: 12px; font-weight: 700; border-radius: 999px; padding: 3px 10px; white-space: nowrap; }}
.ptinggi {{ background: var(--new-bg); color: var(--primary-ink); }}
.psedang {{ background: var(--sunken); color: var(--text); }}
.prendah {{ background: transparent; color: var(--muted); border: 1px solid var(--line); }}
.notes ul {{ margin: 0; padding-left: 20px; display: grid; gap: 6px; max-width: 74ch; }}
@media (max-width: 760px) {{ .intro {{ grid-template-columns: minmax(0, 1fr); }} .mosaic {{ grid-template-columns: repeat(4, 1fr); }} }}
</style>
<div class="wrap">
  <section class="intro">
    <div class="lede">
      <span class="eyebrow">Design system Lintas · ikon spot</span>
      <h1>Ikon spot Run Coach</h1>
      <p>Ikon berwarna yang memberi wajah pada konten: jenis latihan, kartu Today, rasa setelah latihan, timer, progres dan pencapaian. {n_app} ikon sudah dipakai di app; {n_new} ikon baru di halaman ini masih usulan.</p>
      <div class="stats">
        <div class="stat"><b>{n_app + n_new}</b><span>ikon total</span></div>
        <div class="stat"><b>{n_app}</b><span>di app</span></div>
        <div class="stat"><b>{n_new}</b><span>baru, usulan</span></div>
        <div class="stat"><b>{len(GROUPS)}</b><span>kelompok fitur</span></div>
      </div>
    </div>
    <div class="mosaic">{"".join(ic(n, 80) for n in ["easy", "streak", "feel-ok", "strength", "goal-10k", "phase-peak", "tag-hot", "reminder", "rest-day", "records", "premium", "badge-5k"])}</div>
  </section>

  <section class="rules" aria-label="Aturan bentuk">
    <div class="rule"><b>48 grid</b><span>Ubin radius 14; tampil 32 sampai 64 px (96 px untuk ilustrasi)</span></div>
    <div class="rule"><b>Garis 1.75</b><span>Ujung bulat, tinta charcoal (krem di ubin gelap)</span></div>
    <div class="rule"><b>1 aksen</b><span>Oranye primary untuk satu bagian saja</span></div>
    <div class="rule"><b>Wajah titik</b><span>Hanya di benda yang punya rasa</span></div>
    <div class="rule"><b>Warna = arti</b><span>Latihan = skala panas zona, fase = token fase, status = mint/sand/coral/lavender</span></div>
  </section>

  <div class="bar">
    <div class="seg" role="group" aria-label="Tampilkan">
      <button type="button" data-f="all" aria-pressed="true">Semua {n_app + n_new}</button>
      <button type="button" data-f="app" aria-pressed="false">Di app {n_app}</button>
      <button type="button" data-f="new" aria-pressed="false">Baru {n_new}</button>
    </div>
    <div class="seg" role="group" aria-label="Ukuran ikon">
      <button type="button" data-s="32" aria-pressed="false">32</button>
      <button type="button" data-s="48" aria-pressed="false">48</button>
      <button type="button" data-s="64" aria-pressed="true">64 px</button>
    </div>
  </div>

  {sections}

  <section class="group">
    <header><h2>Tangga ukuran</h2><p>Detail dan wajah masih terbaca di 32 px. Di bawah 32 px pakai ikon garis 24 px.</p></header>
    <div class="ladder">{ladder}</div>
  </section>

  <section class="group" id="ide">
    <header><h2>Ide penempatan ikon baru</h2><p>Diurutkan dari dampak terbesar. Prioritas tinggi = ganti ikon pinjaman, cukup ubah satu pemetaan tanpa menyentuh tata letak.</p></header>
    <div class="tbl"><table>
      <thead><tr><th></th><th>Ikon</th><th>Layar</th><th>Di mana</th><th>Prioritas</th></tr></thead>
      <tbody>{idea_rows}</tbody>
    </table></div>
  </section>

  <section class="group">
    <header><h2>Tempat lain untuk ikon yang sudah ada</h2><p>Ikon di app yang bisa dipakai di satu layar lagi.</p></header>
    <div class="tbl"><table>
      <thead><tr><th></th><th>Ikon</th><th>Layar</th><th>Di mana</th></tr></thead>
      <tbody>{more_rows}</tbody>
    </table></div>
  </section>

  <section class="notes group">
    <h2>Catatan</h2>
    <ul>
      <li>File SVG di <code>docs/design-system/assets/spot-icons/</code>, dibuat dari <code>_build/spot_icons.py</code>. Ikon baru belum masuk <code>spot-icons.json</code> app.</li>
      <li>Semua warna dari token Lintas. Mode gelap: ubin pastel tetap, ubin strength memakai <code>zone-strength</code> gelap.</li>
      <li>Angka di ikon target digambar sebagai garis (tanpa font), jadi tampil sama di semua perangkat.</li>
      <li>Pengaturan dan chip memakai komponen yang sudah ada; ikon spot di sana mengubah gaya baris, jadi perlu keputusan dulu.</li>
    </ul>
  </section>
</div>
<script>
const fBtns = document.querySelectorAll('[data-f]'), sBtns = document.querySelectorAll('[data-s]');
function filter(f) {{
  document.body.dataset.filter = f;
  fBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.f === f)));
  document.querySelectorAll('.group[data-group]').forEach((g) => {{
    const any = [...g.querySelectorAll('.cell')].some((c) => f === 'all' || c.dataset.kind === f);
    g.classList.toggle('empty', !any);
  }});
}}
function size(s) {{
  document.documentElement.style.setProperty('--ico', s + 'px');
  sBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.s === s)));
}}
fBtns.forEach((b) => b.addEventListener('click', () => filter(b.dataset.f)));
sBtns.forEach((b) => b.addEventListener('click', () => size(b.dataset.s)));
filter('all');
</script>
"""

if __name__ == "__main__":
    (si.OUT / "index.html").write_text(page)
    print("ok", si.OUT / "index.html")
