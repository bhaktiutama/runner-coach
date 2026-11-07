"""Sampel wireframe: ikon spot v1.1 ditempel di layar app (belum implementasi).

    python3 docs/design-system/assets/_build/spot_icons_wireframe.py
"""

import spot_icons as si


def I(name, size, cls="si"):
    return f'<span class="{cls}">{si.svg(name, "html", size)}</span>'


def phone(title, body, notes, tab=None, dark=False):
    tabs = ""
    if tab is not None:
        items = ["Hari ini", "Plan", "Progres", "Profil"]
        tabs = '<nav class="tabs">' + "".join(
            f'<span class="{"on" if i == tab else ""}"><i></i>{t}</span>' for i, t in enumerate(items)) + "</nav>"
    li = "".join(f"<li>{n}</li>" for n in notes)
    return (f'<figure class="shot"><figcaption><h3>{title}</h3></figcaption>'
            f'<div class="ph{" dark" if dark else ""}"><div class="scr">{body}</div>{tabs}</div>'
            f'<ul class="notes">{li}</ul></figure>')


def row(day, num, icon, bar, title, sub, today=False):
    return (f'<div class="prow{" today" if today else ""}"><div class="day"><small>{day}</small><b>{num}</b></div>'
            f'{I(icon, 32)}<i class="alt bar {bar}"></i>'
            f'<div class="tx"><b>{title}</b><small>{sub}</small></div>'
            + ('<em class="pill">HARI INI</em>' if today else "") + "</div>")


today = phone("2.1 Hari ini", f"""
<div class="hdr"><div><small>Jumat, 6 Nov</small><h4>Latihan hari ini</h4></div><span class="chip">Minggu 3/10</span></div>
<div class="card">
  <div class="cardtop">{I("tempo", 44)}<div class="tx"><span class="bib">TEMPO</span></div><small class="mut">~5,5 km</small></div>
  <div class="big"><b class="num">42</b> menit</div>
  <div class="seg"><i class="e"></i><i class="e"></i><i class="t"></i><i class="e"></i></div>
  <div class="li"><span>Pemanasan</span><span>10 mnt, easy</span></div>
  <div class="li"><span>Tempo</span><b>14 mnt @ 6:45 /km</b></div>
  <div class="li"><span>Pendinginan</span><span>10 mnt, easy</span></div>
  <div class="btn">Mulai latihan</div>
</div>
<div class="card cs">
  <div class="cardtop">{I("race-day", 40)}<div class="tx"><b>Jakarta 10K</b><small>Min 3 Jan · 06.00</small></div></div>
  <div class="count"><b class="num">58</b><small>hari</small><b class="num">18</b><small>jam</small></div>
  <div class="dots"><i class="on"></i><i></i><i></i><i></i></div>
</div>
<div class="card"><div class="li"><b>Minggu ini</b><span>5,5 / 18 km</span></div>
<div class="wkdots">{"".join(f'<i class="{c}"></i>' for c in ("d", "n t", "", "o", "", "o", "o"))}</div></div>""", ["Kartu latihan: ikon zona 44 px di kiri label bib", "Kartu carousel: ikon kartu 40 px di kiri judul (race, long run, rekor, streak)"], tab=0)

plan = phone("3.1 Plan", f"""
<div class="hdr"><div><h4>Plan 10K</h4><small>Race Min, 3 Jan 2027: 58 hari lagi</small></div></div>
<div class="wk"><span>‹</span><div><b>Minggu 3</b><small>2 - 8 Nov · 18 km</small></div><span>›</span></div>
{row("Sen", 2, "rest-day", "r", "Istirahat", "Jalan santai atau stretching")}
{row("Sel", 3, "tempo", "t", "Tempo run", "42 mnt · ~5,5 km · + drill", True)}
{row("Rab", 4, "strength", "s", "Strength", "25 mnt · 5 gerakan")}
{row("Kam", 5, "easy", "e", "Easy + strides", "35 mnt + 6x20 dtk")}
{row("Jum", 6, "rest-day", "r", "Istirahat", "")}
{row("Sab", 7, "easy", "e", "Easy run", "30 mnt · ~4 km")}
{row("Min", 8, "long", "l", "Long run", "60 mnt · ~7,5 km")}
""", ["Ikon 32 px menggantikan garis warna di kiri tiap baris", "Hari istirahat punya ikon bulan, jadi tidak terlihat kosong"], tab=1)

finish = phone("2.4 Selesai", f"""
<div class="fin">{I("finish", 56)}<span class="alt okc">✓</span></div>
<h4 class="h2">Tempo run selesai</h4>
<small class="ok">4 dari 4 segmen tuntas</small>
<div class="boxes"><div><small>Durasi</small><b class="num">42:20</b></div><div><small>Jarak (km)</small><b class="num">5,5</b></div><div><small>Rata-rata</small><b class="num">7:42</b></div></div>
<b>Seberapa berat rasanya?</b>
<div class="rpe">{"".join(f'<i class="{"sel" if n == 6 else ""}">{n}</i>' for n in range(1, 11))}</div>
<div class="feel">{I("feel-ok", 40)}<div class="tx"><b>6/10 · Pas</b><small>Sesuai target tempo</small></div></div>
<div class="bands"><span>{I("feel-easy", 22)}1-4 ringan</span><span class="on">{I("feel-ok", 22)}5-7 pas</span><span>{I("feel-hard", 22)}8-10 berat</span></div>
<div class="btn">Simpan</div>
""", ["Ikon bendera 56 px menggantikan centang di atas judul", "Wajah RPE berganti mengikuti angka yang dipilih (1-4, 5-7, 8-10)", "Angka 1-10 tetap ada; wajah hanya penjelas"])

week = phone("2.5 Ringkasan minggu", f"""
<div class="x">✕</div>
<div class="track"><b class="num">4/4</b><small>latihan</small></div>
<h4 class="h2 c">Minggu 3 tuntas</h4>
<small class="mut c">7 minggu lagi menuju race 10K</small>
<div class="tiles"><div>{I("distance", 28)}<small>Jarak minggu ini</small><b class="num">18,4 km</b></div><div>{I("streak", 28)}<small>Beruntun</small><b class="num">5 minggu</b></div></div>
<b>Pencapaian baru</b>
<div class="badges"><div>{I("badge-5k", 52)}<small>5K pertama</small></div><div>{I("badge-streak", 52)}<small>4 minggu beruntun</small></div><div class="lock">{I("badge-plan", 52)}<small>Plan tuntas</small></div></div>
<div class="btn ghost">Bagikan kartu ringkasan</div>
""", ["Hero oval lintasan tetap (ciri brand), tidak diganti ikon", "Ikon kecil 28 px di kotak statistik", "Badge 52 px; badge yang belum didapat tampil pudar"])

progress = phone("3.3 Progres", f"""
<div class="hdr"><h4>Progres</h4><span class="segc"><b>8 mgg</b><span>Plan</span><span>Semua</span></span></div>
<div class="grid2">
  <div class="st">{I("distance", 32)}<b class="num">18 km</b><small>minggu ini</small></div>
  <div class="st">{I("week-done", 32)}<b class="num">11/13</b><small>latihan tuntas</small></div>
  <div class="st">{I("records", 32)}<b class="num">12 km</b><small>long run terjauh</small></div>
  <div class="st">{I("streak", 32)}<b class="num">5</b><small>minggu beruntun</small></div>
</div>
<div class="chart">{"".join(f'<i style="height:{h}%"></i>' for h in (40, 48, 36, 52, 58, 66, 74, 24))}</div>
<b>Aktivitas terakhir</b>
<div class="act">{I("tempo", 32)}<i class="alt bar t"></i><div class="tx"><b>Tempo run</b><small>Sel 3 Nov · 5,2 km · 38:45</small></div><span>›</span></div>
<div class="act">{I("strength", 32)}<i class="alt bar s"></i><div class="tx"><b>Strength</b><small>Rab 4 Nov · 5 gerakan · 24 mnt</small></div><span>›</span></div>
""", ["Empat kotak statistik dengan ikon 32 px", "Daftar aktivitas: ikon jenis latihan menggantikan garis warna"], tab=2)

timer = phone("2.3s Timer istirahat", f"""
<div class="thdr"><small>Squat · set 1 dari 3</small></div>
<div class="restlbl">{I("rest", 36)}<b>Istirahat</b></div>
<div class="ring"><b class="num">0:45</b><small>tersisa</small></div>
<div class="tbtns"><span>+15 dtk</span><span>Lewati</span></div>
<div class="nxt">{I("strength", 32)}<div class="tx"><small>Berikutnya</small><b>Squat · set 2 · 10 repetisi</b></div></div>
""", ["Layar timer tetap gelap; ikon ubin pastel tetap terbaca", "Ikon 36 px di label Istirahat, 32 px di kartu berikutnya"], dark=True)

empty = phone("3.3 Progres kosong", f"""
<div class="hdr"><h4>Progres</h4></div>
<div class="empty">{I("empty", 96)}<b>Belum ada aktivitas</b><small>Selesaikan latihan pertama di Hari ini, atau catat lari yang sudah kamu lakukan.</small><div class="btn">Catat lari manual</div></div>
<div class="card priv">{I("privacy", 36)}<div class="tx"><b>Data kamu tetap di HP ini</b><small>Tidak dikirim ke server</small></div></div>
""", ["Keadaan kosong: ikon besar 96 px sebagai ilustrasi", "Ikon privasi di kartu info (juga bisa di Profil 4.5)"], tab=2)

detail = phone("3.4 Detail aktivitas", f"""
<div class="hero">{I("tempo", 64)}<div class="tx"><small>Sel 3 Nov · 06.12</small><h4 class="h2">Tempo run</h4><small class="ok">Sesuai target</small></div></div>
<div class="statc"><div><small>Jarak</small><b class="num">5,2 km</b></div><div><small>Durasi</small><b class="num">38:45</b></div><div><small>Pace</small><b class="num">7:27</b></div></div>
<div class="feel">{I("feel-ok", 36)}<div class="tx"><b>RPE 6 · Pas</b><small>Cuaca panas</small></div></div>
<b>Segmen</b>
<div class="li"><span>Pemanasan</span><span>10:00 · easy</span></div>
<div class="li"><span>Tempo</span><b>14:00 @ 6:41 /km</b></div>
<div class="li"><span>Pendinginan</span><span>10:00 · easy</span></div>
""", ["Hero: ikon jenis latihan 64 px di kiri judul", "Rasa latihan ikut tampil dengan wajah RPE 36 px"])

screens = today + plan + finish + week + progress + timer + detail + empty

page = f"""<title>Wireframe Ikon Spot</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap">
<style>
/* Tata letak: deretan layar HP (wireframe app) dengan catatan penempatan di bawah tiap layar; tombol untuk membandingkan dengan dan tanpa ikon. */
:root {{
  --bg: #ECEAE6; --surface: #FFFFFF; --text: #242C32; --muted: #5E6670; --line: #DDDAD6; --accent: #C63F0D; --frame: #242C32;
  --app-bg: #F5F4F2; --app-card: #FFFFFF; --app-sunken: #EAE8E5; --app-text: #242C32; --app-muted: #5E6670; --app-line: #DDDAD6;
  --app-primary: #F26B38; --app-success: #467861; --app-peach: #E9B79D; --app-long: #D9946F; --app-lav: #A6B8FF; --app-charcoal: #242C32;
  --tm-bg: #161B1F; --tm-card: #242C32; --tm-text: #FFF9F2; --tm-muted: #A9B0B7; --tm-line: #343D44;
  --si-charcoal: #242C32; --si-cream: #FFF9F2; --si-white: #FFFFFF; --si-orange: #F26B38; --si-peach: #E9B79D;
  --si-long: #D9946F; --si-interval: #B4361A; --si-mint: #70D6B3; --si-sand: #F2C66D; --si-coral: #FF806E;
  --si-lavender: #A6B8FF; --si-sunken: #EAE8E5; --si-strength: #242C32;
  --f-display: "Bricolage Grotesque", system-ui, sans-serif; --f-ui: "Plus Jakarta Sans", system-ui, sans-serif;
}}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{ --bg: #101417; --surface: #1D2328; --text: #FFF9F2; --muted: #A9B0B7; --line: #343D44; --accent: #F58A5F; --frame: #3A444C; color-scheme: dark; }} }}
:root[data-theme="dark"] {{ --bg: #101417; --surface: #1D2328; --text: #FFF9F2; --muted: #A9B0B7; --line: #343D44; --accent: #F58A5F; --frame: #3A444C; color-scheme: dark; }}
* {{ box-sizing: border-box; }}
body {{ background: var(--bg); color: var(--text); font-family: var(--f-ui); font-size: 15px; line-height: 1.45; }}
.wrap {{ max-width: 1360px; margin: 0 auto; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 36px 64px; display: grid; gap: 28px; }}
h1, h2 {{ font-family: var(--f-display); margin: 0; text-wrap: balance; }}
h1 {{ font-size: clamp(28px, 4.5vw, 40px); font-weight: 800; line-height: 1.1; }}
.top {{ display: flex; flex-wrap: wrap; gap: 16px; justify-content: space-between; align-items: end; }}
.top p {{ margin: 6px 0 0; color: var(--muted); max-width: 62ch; }}
.eyebrow {{ font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--accent); }}
.toggle {{ display: inline-flex; background: var(--surface); border: 1px solid var(--line); border-radius: 999px; padding: 4px; gap: 4px; }}
.toggle button {{ font: inherit; font-weight: 600; font-size: 14px; color: var(--text); background: transparent; border: 0; border-radius: 999px; padding: 8px 16px; cursor: pointer; }}
.toggle button[aria-pressed="true"] {{ background: var(--text); color: var(--bg); }}
.toggle button:focus-visible {{ outline: 3px solid var(--accent); outline-offset: 2px; }}
.screens {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 28px 20px; justify-items: center; }}
.shot {{ margin: 0; display: grid; gap: 10px; width: 100%; max-width: 320px; align-content: start; }}
.shot h3 {{ margin: 0; font-size: 14px; font-weight: 700; color: var(--muted); }}
.notes {{ margin: 0; padding-left: 18px; font-size: 13px; color: var(--muted); display: grid; gap: 4px; }}

/* ---------- layar HP (warna app, sama di kedua tema halaman) ---------- */
.ph {{ width: 100%; aspect-ratio: 320 / 640; max-width: 100%; background: var(--app-bg); color: var(--app-text); border: 7px solid var(--frame); border-radius: 36px; overflow: hidden; display: flex; flex-direction: column; font-size: 13px; }}
.scr {{ flex: 1; padding: 22px 14px 10px; display: flex; flex-direction: column; gap: 10px; overflow: hidden; }}
.ph small {{ font-size: 11px; color: var(--app-muted); }}
.ph b {{ font-weight: 700; }}
.num {{ font-family: var(--f-display); font-weight: 800; font-variant-numeric: tabular-nums; }}
.si, .alt {{ flex: none; line-height: 0; }}
.si svg {{ display: block; }}
.tx {{ display: grid; min-width: 0; flex: 1; }}
.tx small {{ white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }}
.hdr {{ display: flex; justify-content: space-between; align-items: center; gap: 8px; }}
.hdr h4, .h2 {{ font-family: var(--f-display); font-size: 21px; font-weight: 800; margin: 0; line-height: 1.15; }}
.chip {{ font-size: 11px; font-weight: 600; background: var(--app-card); border: 1px solid var(--app-line); border-radius: 999px; padding: 4px 10px; }}
.card {{ background: var(--app-card); border-radius: 18px; padding: 12px; display: grid; gap: 8px; }}
.cardtop {{ display: flex; align-items: center; gap: 10px; }}
.bib {{ justify-self: start; font-size: 11px; font-weight: 800; letter-spacing: .08em; background: var(--app-primary); border-radius: 4px; padding: 3px 8px; }}
.big {{ font-size: 13px; color: var(--app-muted); }} .big b {{ font-size: 38px; color: var(--app-text); line-height: 1; }}
.seg {{ display: grid; grid-template-columns: 1fr 1fr 2fr 1fr; gap: 3px; }} .seg i {{ height: 7px; border-radius: 4px; background: var(--app-peach); }} .seg i.t {{ background: var(--app-primary); }}
.li {{ display: flex; justify-content: space-between; font-size: 12px; }} .li span:last-child {{ color: var(--app-muted); }}
.btn {{ background: var(--app-primary); color: var(--app-charcoal); font-weight: 700; text-align: center; border-radius: 999px; padding: 10px; }}
.btn.ghost {{ background: transparent; border: 1.5px solid var(--app-text); }}
.cs {{ position: relative; padding-bottom: 22px; }}
.pin {{ font-size: 12px; filter: grayscale(1); opacity: .6; }}
.count {{ display: flex; align-items: baseline; gap: 6px; }} .count b {{ font-size: 30px; line-height: 1; }} .count small {{ margin-right: 8px; }}
.dots {{ position: absolute; bottom: 9px; left: 0; right: 0; display: flex; justify-content: center; gap: 4px; }} .dots i {{ width: 5px; height: 5px; border-radius: 3px; background: var(--app-line); }} .dots i.on {{ width: 14px; background: var(--app-text); }}
.wk {{ display: flex; justify-content: space-between; align-items: center; text-align: center; }} .wk div {{ display: grid; }} .wk span {{ width: 28px; height: 28px; border-radius: 14px; border: 1px solid var(--app-line); display: grid; place-items: center; background: var(--app-card); }}
.prow {{ display: flex; align-items: center; gap: 10px; background: var(--app-card); border-radius: 14px; padding: 8px 10px; }}
.prow.today {{ outline: 2px solid var(--app-text); }}
.day {{ display: grid; width: 26px; text-align: center; line-height: 1.1; }} .day b {{ font-family: var(--f-display); font-size: 15px; }}
.pill {{ font-style: normal; font-size: 9px; font-weight: 800; background: var(--app-text); color: var(--app-bg); border-radius: 999px; padding: 3px 7px; }}
.bar {{ width: 4px; align-self: stretch; border-radius: 2px; }} .bar.t {{ background: var(--app-primary); }} .bar.e {{ background: var(--app-peach); }} .bar.l {{ background: var(--app-long); }} .bar.r {{ background: var(--app-line); }} .bar.s {{ background: var(--app-charcoal); }}
.fin {{ line-height: 0; }} .okc {{ width: 48px; height: 48px; border-radius: 24px; background: var(--app-success); color: #FFFFFF; display: grid; place-items: center; font-size: 22px; line-height: 1; }}
.ok {{ color: var(--app-success) !important; font-weight: 600; margin-top: -6px; }}
.boxes {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }} .boxes div {{ display: grid; }} .boxes b {{ font-size: 17px; background: var(--app-card); border: 1.5px solid var(--app-text); border-radius: 10px; padding: 6px 8px; }}
.rpe {{ display: grid; grid-template-columns: repeat(10, 1fr); gap: 3px; }} .rpe i {{ font-style: normal; text-align: center; background: var(--app-sunken); border-radius: 999px; padding: 5px 0; font-weight: 700; font-size: 12px; }} .rpe i.sel {{ background: var(--app-long); outline: 2px solid var(--app-text); }}
.feel {{ display: flex; align-items: center; gap: 10px; background: var(--app-card); border-radius: 14px; padding: 8px 10px; }}
.bands {{ display: flex; justify-content: space-between; gap: 4px; }} .bands span {{ display: flex; align-items: center; gap: 4px; font-size: 10px; color: var(--app-muted); opacity: .55; }} .bands span.on {{ opacity: 1; color: var(--app-text); font-weight: 700; }}
.ph .btn:last-child {{ margin-top: auto; }}
.x {{ width: 30px; height: 30px; border-radius: 15px; border: 1px solid var(--app-line); display: grid; place-items: center; background: var(--app-card); }}
.track {{ align-self: center; width: 170px; height: 100px; border: 11px solid var(--app-success); border-radius: 60px; display: grid; place-items: center; align-content: center; }} .track b {{ font-size: 30px; line-height: 1; }}
.c {{ text-align: center; }}
.tiles {{ display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }} .tiles div {{ background: var(--app-card); border-radius: 14px; padding: 10px; display: grid; gap: 2px; }} .tiles b {{ font-size: 17px; }}
.badges {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; text-align: center; }} .badges div {{ display: grid; justify-items: center; gap: 2px; }} .badges .lock {{ opacity: .35; filter: grayscale(.9); }}
.segc {{ display: flex; gap: 2px; background: var(--app-card); border-radius: 999px; padding: 3px; font-size: 11px; }} .segc > * {{ padding: 3px 8px; border-radius: 999px; }} .segc b {{ background: var(--app-sunken); }}
.grid2 {{ display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }}
.st {{ background: var(--app-card); border-radius: 14px; padding: 10px; display: grid; gap: 2px; }} .st b {{ font-size: 19px; line-height: 1.2; margin-top: 4px; }}
.chart {{ background: var(--app-card); border-radius: 14px; padding: 10px; height: 82px; display: flex; align-items: end; gap: 6px; }} .chart i {{ flex: 1; background: var(--app-peach); border-radius: 4px 4px 2px 2px; }} .chart i:nth-child(7) {{ background: var(--app-primary); }}
.act {{ display: flex; align-items: center; gap: 10px; background: var(--app-card); border-radius: 14px; padding: 8px 10px; }}
.empty {{ flex: 1; display: grid; justify-items: center; align-content: center; gap: 8px; text-align: center; padding: 0 8px; }} .empty b {{ font-family: var(--f-display); font-size: 18px; }} .empty .btn {{ margin-top: 6px; padding: 10px 18px; }}
.priv {{ display: flex; align-items: center; gap: 10px; }}
.tabs {{ display: grid; grid-template-columns: repeat(4, 1fr); background: var(--app-card); border-top: 1px solid var(--app-line); padding: 8px 0 12px; text-align: center; font-size: 10px; color: var(--app-muted); }}
.tabs span {{ display: grid; justify-items: center; gap: 3px; }} .tabs i {{ width: 18px; height: 18px; border: 1.8px solid currentColor; border-radius: 6px; }} .tabs .on {{ color: var(--app-text); font-weight: 700; }}
.wkdots {{ display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }} .wkdots i {{ aspect-ratio: 1; border-radius: 50%; background: var(--app-sunken); }} .wkdots i.d {{ background: var(--app-success); }} .wkdots i.o {{ border: 2px solid var(--app-peach); background: transparent; }} .wkdots i.t {{ border: 2px solid var(--app-primary); background: transparent; outline: 2px solid var(--app-text); outline-offset: 1px; }}
.hero {{ display: flex; gap: 12px; align-items: center; background: var(--app-card); border-radius: 18px; padding: 12px; }}
.statc {{ display: grid; grid-template-columns: repeat(3, 1fr); background: var(--app-card); border-radius: 14px; padding: 10px; }} .statc div {{ display: grid; }} .statc b {{ font-size: 17px; }}
/* timer gelap */
.ph.dark {{ background: var(--tm-bg); color: var(--tm-text); }} .ph.dark small {{ color: var(--tm-muted); }}
.thdr {{ text-align: center; }}
.restlbl {{ display: flex; align-items: center; justify-content: center; gap: 8px; font-family: var(--f-display); font-size: 20px; }}
.ring {{ align-self: center; width: 210px; height: 140px; border: 12px solid var(--app-lav); border-right-color: var(--tm-line); border-bottom-color: var(--tm-line); border-radius: 80px; display: grid; place-items: center; align-content: center; margin: 10px 0; }} .ring b {{ font-size: 46px; line-height: 1; }}
.tbtns {{ display: flex; justify-content: center; gap: 10px; }} .tbtns span {{ border: 1.5px solid var(--tm-muted); border-radius: 999px; padding: 8px 16px; font-weight: 600; }}
.nxt {{ margin-top: auto; display: flex; align-items: center; gap: 10px; background: var(--tm-card); border-radius: 16px; padding: 10px; }}
/* tanpa ikon */
.alt {{ display: none; }}
body.noicons .si {{ display: none; }}
body.noicons .alt {{ display: block; }}
body.noicons .okc {{ display: grid; }}
</style>
<div class="wrap">
  <div class="top">
    <div><span class="eyebrow">Sampel wireframe, belum di app</span><h1>Ikon spot di layar Run Coach</h1>
    <p>Delapan layar dari wireframe yang ada, dengan ikon versi 1.1 (garis tipis) ditempel di tempat yang diusulkan. Pakai tombol di kanan untuk melihat layar yang sama tanpa ikon.</p></div>
    <div class="toggle" role="group" aria-label="Bandingkan">
      <button type="button" id="with" aria-pressed="true">Dengan ikon</button>
      <button type="button" id="without" aria-pressed="false">Tanpa ikon</button>
    </div>
  </div>
  <div class="screens">{screens}</div>
</div>
<script>
const w = document.getElementById('with'), wo = document.getElementById('without');
function set(on) {{ document.body.classList.toggle('noicons', !on); w.setAttribute('aria-pressed', String(on)); wo.setAttribute('aria-pressed', String(!on)); }}
w.addEventListener('click', () => set(true)); wo.addEventListener('click', () => set(false));
</script>
"""

(si.OUT / "wireframe.html").write_text(page)
print("ok")
