"""Alternatif ikon spot gaya lukisan cat air (terinspirasi animasi Jepang klasik, tanpa karakter film mana pun).

Konsep sama dengan spot_icons.py (27 nama sama), tetapi tiap ubin adalah pemandangan kecil:
langit bergradasi, bukit, awan, garis cokelat hangat yang sedikit goyah (filter) dan tekstur kertas.

    python3 docs/design-system/assets/_build/spot_icons_painted.py
"""

import pathlib

import spot_icons as si

OUT = si.ROOT / "spot-icons-painted-draft"

INK = "#5A4636"
COL = {
    "k": INK, "p": "#FFF8EC", "a": "#E8743B", "y": "#F3CF7A", "c": "#F29E98", "l": "#8CC7E6",
    "g1": "#9CCB7A", "g2": "#6FA35B", "g3": "#4E7F45", "tan": "#E2C9A0", "wood": "#8A5A3B",
}


def fill(markup):
    for key in sorted(COL, key=len, reverse=True):
        markup = markup.replace("{" + key + "}", COL[key])
    return markup


# ---------- potongan pemandangan ----------

def grad(gid, top, bottom, x2="0", y2="1"):
    return (f'<linearGradient id="{gid}" x1="0" y1="0" x2="{x2}" y2="{y2}">'
            f'<stop offset="0" stop-color="{top}"/><stop offset="1" stop-color="{bottom}"/></linearGradient>')


def radial(gid, inner, outer, o_in=1, o_out=0):
    return (f'<radialGradient id="{gid}"><stop offset="0" stop-color="{inner}" stop-opacity="{o_in}"/>'
            f'<stop offset="1" stop-color="{outer}" stop-opacity="{o_out}"/></radialGradient>')


def cloud(x, y, s=1.0, shade="#DCE8F0"):
    def blob(dx, dy, col):
        return (f'<path d="M{x+dx-8*s:.1f} {y+dy+3*s:.1f}a3.6 3.6 0 0 1 2.4-5.6a4.8 4.8 0 0 1 9-1.6'
                f'a3.6 3.6 0 0 1 5.8 3.2a2.6 2.6 0 0 1-.6 4z" transform="scale(1)" fill="{col}"/>')
    # Dua lapis: bayangan bawah lalu putih, seperti awan cumulus yang dicat.
    return (f'<g transform="translate({x:.1f} {y:.1f}) scale({s}) translate({-x:.1f} {-y:.1f})">'
            + blob(0, 1.2, shade) + blob(0, 0, "#FFFDF7") + "</g>")


def hills(back, front, y_back=33, y_front=38):
    return (f'<path d="M0 {y_back}Q12 {y_back-7} 24 {y_back-2}T48 {y_back-4}V48H0z" fill="{back}"/>'
            f'<path d="M0 {y_front}Q16 {y_front-6} 30 {y_front-1}T48 {y_front-2}V48H0z" fill="{front}"/>')


def grass(xs, y, col="{g3}"):
    return "".join(f'<path d="M{x} {y}l-1-2.6M{x} {y}l1.2-2.2" stroke="{col}" stroke-width="1.1"/>' for x in xs)


def flowers(pts):
    return "".join(f'<circle cx="{x}" cy="{y}" r=".9" fill="{c}"/>' for x, y, c in pts)


def face(cx, cy, mood="smile", s=1.0, ink="{k}", blush=True):
    f = si.face(cx, cy, mood, s).replace("{k}", ink)
    ex = 3.2 * s
    if mood in ("smile", "big", "worried", "calm"):
        f += "".join(f'<circle cx="{cx+d+0.45*s:.2f}" cy="{cy-0.45*s:.2f}" r="{0.42*s:.2f}" fill="#FFFDF7"/>' for d in (-ex, ex))
    if blush:
        f += "".join(f'<ellipse cx="{cx+d:.2f}" cy="{cy+2.1*s:.2f}" rx="{1.8*s:.2f}" ry="{1.1*s:.2f}" fill="{{c}}" opacity=".75"/>'
                     for d in (-5.6 * s, 5.6 * s))
    return f


def sky(top, bottom):
    return ("sky", top, bottom)


# ---------- ikon ----------
# (grup, label, (atas langit, bawah langit), latar tambahan, isi)

DAY = ("#9FD3EC", "#E8F4F1")
SUNRISE = ("#A9D4EC", "#F8D9A8")
SUNSET = ("#F2A16B", "#FBDDA0")
DUSK = ("#5D5C8E", "#E39A7C")
NIGHT = ("#2C3B66", "#5E70A3")
GOLD = ("#F6CF84", "#FCEFCB")
LAV = ("#C3CDF3", "#F0EFE0")
HOT = ("#F3A07E", "#FAD9A2")
ROOM = ("#EBCB9C", "#D4A574")
MEADOW_TOP = ("#A6CF83", "#7DB466")

SHOE = si.SHOE.replace("{p}", "{p}")

ICONS = {
    "easy": ("latihan", "Easy run", DAY,
             cloud(33, 12, 1.0) + hills("{g1}", "{g2}", 34, 39),
             SHOE + face(17, 27.5, "smile", 0.85) + grass([8, 41, 44], 42)),
    "long": ("latihan", "Long run", SUNRISE,
             '<circle cx="34" cy="23" r="9" fill="url(#ID-glow)"/>'
             '<path d="M28.5 23a5.5 5.5 0 0 1 11 0z" fill="{y}" stroke="{k}" stroke-width="1.8"/>'
             '<path d="M0 23h48v25H0z" fill="url(#ID-ground)"/>'
             '<path d="M11 13.5q1.3-1.3 2.6 0q1.3-1.3 2.6 0M17 10q1-1 2 0q1-1 2 0" stroke="{k}" stroke-width="1.2"/>',
             '<path d="M22.5 23L13 48h22L25.5 23z" fill="{tan}" stroke="{k}" stroke-width="1.8"/>'
             '<path d="M24 27v2M24 32.5v3.5M24 40v5" stroke="{p}" stroke-width="2"/>'
             '<path d="M0 23h22.5M25.5 23H48" stroke="{k}" stroke-width="1.6"/>'
             + grass([8, 12, 39, 43], 33)),
    "tempo": ("latihan", "Tempo", SUNSET,
              '<circle cx="12" cy="14" r="8" fill="url(#ID-glow)"/>'
              '<path d="M0 36Q14 30 26 34T48 32V48H0z" fill="#B98A9E" opacity=".55"/>',
              '<path d="M10.5 32a13.5 13.5 0 0 1 27 0z" fill="{p}" stroke="{k}" stroke-width="2"/>'
              '<path d="M28.8 19.4a13.5 13.5 0 0 1 8.7 12.6" stroke="{a}" stroke-width="4" stroke-linecap="butt" opacity=".9"/>'
              '<path d="M15.5 25l1.5 1M24 19v2" stroke="{k}" stroke-width="1.8"/>'
              '<path d="M24 31l6-7.5" stroke="{k}" stroke-width="2.6"/>'
              '<circle cx="24" cy="31" r="2.4" fill="{k}"/>'
              '<path d="M12 37h24" stroke="{k}" stroke-width="2"/>'),
    "interval": ("latihan", "Interval", DUSK,
                 '<circle cx="35" cy="12" r=".8" fill="{p}"/><circle cx="40" cy="17" r=".6" fill="{p}"/>'
                 + hills("#6E6A7E", "#4F5B4A", 36, 40),
                 "".join(f'<rect x="{x-1.9}" y="{y}" width="3.8" height="{38-y}" rx="1.9" fill="{{p}}" stroke="{{k}}" stroke-width="1.6"/>'
                         for x, y in ((11, 30), (17.5, 17), (24, 30), (30.5, 17), (37, 30)))
                 + '<circle cx="17.5" cy="12.5" r="1.4" fill="{y}"/><circle cx="30.5" cy="12.5" r="1.4" fill="{y}"/>'),
    "recovery": ("latihan", "Recovery / jalan", LAV,
                 hills("#B5D59A", "{g1}", 30, 36)
                 + '<path d="M6 48C14 40 22 34 40 22" stroke="{tan}" stroke-width="9" stroke-linecap="round"/>'
                 + flowers([(9, 34, "#FFFDF7"), (40, 36, "{c}"), (36, 41, "#FFFDF7"), (6, 41, "{c}")]),
                 '<g fill="{k}" opacity=".85">'
                 '<ellipse cx="18" cy="34" rx="2.6" ry="4" transform="rotate(48 18 34)"/>'
                 '<ellipse cx="29" cy="26" rx="2.6" ry="4" transform="rotate(52 29 26)"/>'
                 '<circle cx="21.6" cy="31.6" r=".9"/><circle cx="22.6" cy="33.4" r=".8"/>'
                 '<circle cx="32.6" cy="23.6" r=".9"/><circle cx="33.6" cy="25.4" r=".8"/></g>'),
    "strength": ("latihan", "Strength", ROOM,
                 '<path d="M30 6h12v14H30z" fill="#FBEBC8" stroke="{k}" stroke-width="1.4"/>'
                 '<path d="M36 6v14M30 13h12" stroke="{k}" stroke-width="1"/>'
                 '<path d="M30 20L18 48h18l6-28z" fill="#FFF6DD" opacity=".35"/>'
                 '<path d="M0 40h48v8H0z" fill="#B98455"/><path d="M0 40h48M16 40v8M34 44h14" stroke="{k}" stroke-width="1" opacity=".5"/>',
                 '<ellipse cx="24" cy="40" rx="11" ry="2" fill="#7A5236" opacity=".45"/>'
                 '<path d="M18.5 19.5v-1.5a5.5 5.5 0 0 1 11 0v1.5" stroke="#3F4A52" stroke-width="3"/>'
                 '<path d="M14.5 29a9.5 9.5 0 0 1 19 0c0 3.5-1.5 6-3.5 7.5h-12c-2-1.5-3.5-4-3.5-7.5z" fill="url(#ID-iron)" stroke="{k}" stroke-width="1.8"/>'
                 '<path d="M17.5 25.5a6.5 6.5 0 0 1 4-4" stroke="#FFFDF7" stroke-width="1.4" opacity=".7"/>'
                 + face(24, 28, "smile", 0.85, ink="{p}")),
    "drill": ("latihan", "Drill", DAY,
              cloud(13, 11, 0.8) + hills("{g1}", "{g2}", 32, 37),
              '<ellipse cx="24" cy="37" rx="10" ry="2" fill="{g3}" opacity=".5"/>'
              '<path d="M24 12.5l7.5 22h-15z" fill="{a}" stroke="{k}" stroke-width="1.8"/>'
              '<path d="M19.6 25.5h8.8" stroke="{p}" stroke-width="3"/>'
              '<path d="M14 35.5h20" stroke="{k}" stroke-width="2.6"/>'
              '<path d="M22 16l-2.4 7" stroke="#FFFDF7" stroke-width="1.2" opacity=".6"/>'
              + grass([8, 11, 39, 42], 43)),
    "rest-day": ("latihan", "Hari istirahat", NIGHT,
                 flowers([(8, 10, "#FFF6D8"), (14, 18, "#FFF6D8"), (40, 34, "#FFF6D8"), (10, 30, "#FFF6D8"), (42, 9, "#FFF6D8")])
                 + '<path d="M0 41Q14 35 26 39T48 37V48H0z" fill="#26334F"/>',
                 '<circle cx="24" cy="24" r="13" fill="url(#ID-glow)"/>'
                 '<path d="M27 12.5a12 12 0 1 0 9.5 18.5A10 10 0 0 1 27 12.5z" fill="#F6E3A1" stroke="{k}" stroke-width="1.8"/>'
                 + face(22.5, 26, "sleep", 0.85)
                 + '<path d="M33 11.5h4.5l-4.5 4.5h4.5" stroke="#FFF6D8" stroke-width="1.8"/>'),
    "race-day": ("today", "Race countdown", DAY,
                 '<path d="M0 7Q24 15 48 7" stroke="{k}" stroke-width="1"/>'
                 + "".join(f'<path d="M{x} {y}l2.6 4.4 2.6-4.6z" fill="{c}" stroke="{{k}}" stroke-width=".8"/>'
                           for x, y, c in ((4, 8.4, "{a}"), (12, 10.6, "{y}"), (20.4, 11.4, "#8CC7E6"), (28.6, 11.2, "{a}"), (36.6, 9.8, "{y}")))
                 + hills("{g1}", "{g2}", 36, 41),
                 '<rect x="10.5" y="16" width="27" height="21" rx="3.5" fill="{p}" stroke="{k}" stroke-width="1.8"/>'
                 '<path d="M10.5 21.5h27" stroke="{a}" stroke-width="2.6"/>'
                 '<circle cx="14.5" cy="33" r=".9" fill="{k}"/><circle cx="33.5" cy="33" r=".9" fill="{k}"/>'
                 + face(24, 27.5, "smile", 0.8)),
    "next-long": ("today", "Long run berikutnya", DAY,
                  cloud(36, 8, 0.8) + hills("{g1}", "{g2}", 38, 42),
                  '<rect x="10" y="13" width="28" height="24" rx="3" fill="{p}" stroke="{k}" stroke-width="1.8"/>'
                  '<path d="M10 19h28" stroke="{k}" stroke-width="1.6"/><path d="M10.9 13.9h26.2v4.2H10.9z" fill="{a}" opacity=".8"/>'
                  '<path d="M16 10.5v4M32 10.5v4" stroke="{k}" stroke-width="1.8"/>'
                  '<path d="M15 32c3-6 7 0 10-4.5s5-2.5 7-4" stroke="{a}" stroke-dasharray="0.1 3.2" stroke-width="2.2"/>'
                  '<circle cx="15" cy="32" r="1.6" fill="{k}"/>'
                  '<path d="M33 30v-8.5l4 1.6-4 1.6" stroke="{k}" stroke-width="1.6" fill="{a}"/>'),
    "records": ("today", "Rekor plan", GOLD,
                '<circle cx="24" cy="28" r="16" fill="url(#ID-glow)"/>' + hills("#C9D98F", "#A5C47A", 39, 43),
                '<path d="M17.5 8.5l4.5 11M30.5 8.5l-4.5 11" stroke="{a}" stroke-width="3"/>'
                '<circle cx="24" cy="28" r="9" fill="url(#ID-gold)" stroke="{k}" stroke-width="1.8"/>'
                f'<path d="{si.star(24, 28.3, 4.4, 1.9)}" fill="{{p}}" stroke="{{k}}" stroke-width="1.2"/>'
                '<path d="M37 14l.8 1.8 1.8.8-1.8.8-.8 1.8-.8-1.8-1.8-.8 1.8-.8zM10 20l.6 1.2 1.2.6-1.2.6-.6 1.2-.6-1.2-1.2-.6 1.2-.6z" fill="#FFFDF7"/>'),
    "streak": ("today", "Streak minggu (api unggun)", DUSK,
               flowers([(9, 9, "#FFF6D8"), (39, 12, "#FFF6D8"), (33, 7, "#FFF6D8")])
               + '<path d="M0 39Q14 34 26 37T48 35V48H0z" fill="#3F4B3E"/>'
               + '<circle cx="24" cy="30" r="16" fill="url(#ID-glow)"/>',
               '<path d="M24 12c3.5 4.5 9 7.5 9 14.5a9 9 0 0 1-18 0c0-3.4 1.6-5.6 3.4-7.2.3 2.2 1.2 3.6 2.6 4.2C20 19.5 21.4 15.6 24 12z" fill="{a}" stroke="{k}" stroke-width="1.8"/>'
               '<path d="M24 22c2 2.6 4.4 4 4.4 7.4a4.4 4.4 0 0 1-8.8 0c0-2.6 2.2-4.4 4.4-7.4z" fill="{y}"/>'
               '<path d="M13 39l22-5M13 34l22 5" stroke="{wood}" stroke-width="3.4"/>'
               '<path d="M13 39l22-5M13 34l22 5" stroke="{k}" stroke-width=".8" opacity=".6"/>'),
    "feel-easy": ("rasa", "Terlalu ringan (RPE 1-4)", LAV,
                  hills("#B5D59A", "{g1}", 36, 41)
                  + '<path d="M33 12q3-2 6 0t6 0M30 17q2.4-1.6 4.8 0" stroke="#FFFDF7" stroke-width="1.4"/>',
                  '<circle cx="24" cy="26" r="11.5" fill="{p}" stroke="{k}" stroke-width="1.8"/>'
                  + face(24, 24.5, "chill", 1.0)),
    "feel-ok": ("rasa", "Pas (RPE 5-7)", DAY,
                cloud(10, 11, 0.7) + hills("{g1}", "{g2}", 36, 41),
                '<circle cx="24" cy="26" r="11.5" fill="{p}" stroke="{k}" stroke-width="1.8"/>'
                + face(24, 24.5, "big", 1.0)),
    "feel-hard": ("rasa", "Terlalu berat (RPE 8-10)", HOT,
                  '<circle cx="38" cy="10" r="9" fill="url(#ID-glow)"/>' + hills("#C9C98A", "#A9B86F", 37, 42),
                  '<circle cx="24" cy="26" r="11.5" fill="{p}" stroke="{k}" stroke-width="1.8"/>'
                  + face(24, 24.5, "strain", 1.0)
                  + '<path d="M36 14c1.6 2.2 2.4 3.6 2.4 4.7a2.4 2.4 0 0 1-4.8 0c0-1.1.8-2.5 2.4-4.7z" fill="{l}" stroke="{k}" stroke-width="1.3"/>'),
    "get-ready": ("timer", "Siap-siap", SUNRISE,
                  cloud(38, 10, 0.7) + hills("{g1}", "{g2}", 38, 42),
                  '<path d="M21 10.5h6M24 10.5v4" stroke="{k}" stroke-width="2"/>'
                  '<path d="M33.5 16.5l2-2" stroke="{k}" stroke-width="2"/>'
                  '<circle cx="24" cy="27" r="11.5" fill="{p}" stroke="{k}" stroke-width="1.8"/>'
                  '<path d="M24 15.5a11.5 11.5 0 0 1 11.5 11.5" stroke="{a}" stroke-width="2.8"/>'
                  + face(24, 26.5, "smile", 0.9)),
    "rest": ("timer", "Istirahat (minum di sungai)", DAY,
             hills("{g1}", "{g2}", 28, 32)
             + '<path d="M0 36Q12 33 24 36T48 35V48H0z" fill="#7FBCE0"/>'
             + '<path d="M6 41q2-1 4 0M30 39q2-1 4 0M38 44q2-1 4 0" stroke="#FFFDF7" stroke-width="1.2"/>',
             '<rect x="21" y="9.5" width="6" height="3.5" rx="1" fill="{a}" stroke="{k}" stroke-width="1.6"/>'
             '<path d="M21.5 13h5v3l3.5 3.5v15a3.5 3.5 0 0 1-3.5 3.5h-5a3.5 3.5 0 0 1-3.5-3.5v-15l3.5-3.5z" fill="#E6F4FA" stroke="{k}" stroke-width="1.8"/>'
             '<path d="M18.2 30.5h11.6v4a3.5 3.5 0 0 1-3.5 3.5h-4.6a3.5 3.5 0 0 1-3.5-3.5z" fill="{l}" opacity=".8"/>'
             + face(24, 24.5, "smile", 0.75)),
    "sound": ("timer", "Bunyi penanda (lonceng angin)", DAY,
              cloud(38, 30, 0.8) + '<path d="M4 6h40" stroke="{wood}" stroke-width="2.4"/>',
              '<path d="M24 6v6" stroke="{k}" stroke-width="1.2"/>'
              '<path d="M16.5 23Q16.5 12.5 24 12.5T31.5 23z" fill="#DDF0F7" stroke="{k}" stroke-width="1.8"/>'
              '<path d="M19 20q.6-4 3.6-5.6" stroke="{a}" stroke-width="1.4"/>'
              '<path d="M24 23v6" stroke="{k}" stroke-width="1.2"/>'
              '<path d="M21 29h6l-.6 11h-4.8z" fill="{p}" stroke="{k}" stroke-width="1.4"/>'
              '<path d="M21.4 33h5.2" stroke="{a}" stroke-width="1.6"/>'
              '<path d="M33 17q3 1 5 0M35 21q2.4 1 4 0M9 18q2.4 1 4 0" stroke="#FFFDF7" stroke-width="1.4"/>'),
    "finish": ("timer", "Selesai (bendera di bukit)", DAY,
               cloud(36, 10, 0.9) + '<path d="M0 40Q24 22 48 40V48H0z" fill="{g2}"/><path d="M0 44Q20 36 48 44V48H0z" fill="{g3}" opacity=".6"/>',
               '<path d="M18 33V10" stroke="{k}" stroke-width="2"/>'
               '<path d="M18 11.5h15l-2.5 5 2.5 5H18z" fill="{p}" stroke="{k}" stroke-width="1.8"/>'
               '<path d="M22 11.5h3.6v5H22zM25.6 16.5h3.6v5h-3.6z" fill="{k}"/>'
               '<path d="M10 22l1 1.4M38 26l1.4-.6M30 30l.6 1.6M8 30l1.4-.4" stroke="{a}" stroke-width="1.6"/>'
               '<circle cx="36" cy="33" r="1" fill="{y}"/><circle cx="12" cy="27" r="1" fill="{c}"/>'),
    "week-done": ("progress", "Minggu tuntas (lintasan dari atas)", MEADOW_TOP,
                  '<circle cx="7" cy="8" r="4" fill="{g3}"/><circle cx="42" cy="41" r="4.5" fill="{g3}"/><circle cx="41" cy="7" r="3" fill="{g3}"/>'
                  '<circle cx="6" cy="41" r="3" fill="{g3}"/>',
                  '<rect x="7.5" y="13" width="33" height="22" rx="11" fill="#C9764F" stroke="{k}" stroke-width="1.8"/>'
                  '<rect x="10.5" y="16" width="27" height="16" rx="8" fill="none" stroke="#F3D9C4" stroke-width=".8"/>'
                  '<rect x="13.5" y="19" width="21" height="10" rx="5" fill="{g1}" stroke="{k}" stroke-width="1.4"/>'
                  '<path d="M19.5 24l3 3 6-6" stroke="{p}" stroke-width="2.6"/>'
                  '<circle cx="35" cy="14.5" r="2.2" fill="{k}"/>'),
    "distance": ("progress", "Total jarak", DAY,
                 cloud(14, 10, 0.75) + hills("{g1}", "{g2}", 30, 36),
                 '<path d="M10 44c4-8 12-3 15-9s7-7 9-9" stroke="{p}" stroke-dasharray="0.1 3.6" stroke-width="2.4"/>'
                 '<circle cx="10" cy="44" r="2" fill="{k}"/>'
                 '<path d="M34 26s6-5 6-9.5a6 6 0 0 0-12 0c0 4.5 6 9.5 6 9.5z" fill="{a}" stroke="{k}" stroke-width="1.8"/>'
                 '<circle cx="34" cy="16.5" r="2" fill="{p}"/>'),
    "privacy": ("progress", "Data tinggal di perangkat (rumah)", DUSK,
                flowers([(8, 8, "#FFF6D8"), (40, 10, "#FFF6D8")]) + hills("#5E7A55", "#4A6544", 38, 42)
                + '<path d="M33 9q-2-2 0-4M35 12q-3-3 0-6" stroke="#E9E2EE" stroke-width="1.2" opacity=".8"/>',
                '<path d="M31 18v-6h4v9" fill="{wood}" stroke="{k}" stroke-width="1.4"/>'
                '<path d="M12 23l12-10 12 10" fill="#C8553D" stroke="{k}" stroke-width="1.8"/>'
                '<path d="M14 22v16h20V22" fill="{p}" stroke="{k}" stroke-width="1.8"/>'
                '<path d="M10.5 23.5L24 12l13.5 11.5" stroke="#C8553D" stroke-width="3"/><path d="M10.5 23.5L24 12l13.5 11.5" stroke="{k}" stroke-width="1.2"/>'
                '<rect x="16.5" y="26" width="6" height="5" rx="1" fill="#FFD77A" stroke="{k}" stroke-width="1.2"/>'
                '<circle cx="19.5" cy="28.5" r="6" fill="url(#ID-glow)"/>'
                '<path d="M26 38v-6.5a2.5 2.5 0 0 1 5 0V38" fill="{wood}" stroke="{k}" stroke-width="1.4"/>'
                '<circle cx="28.5" cy="33.5" r=".7" fill="{y}"/>'),
    "empty": ("progress", "Belum ada aktivitas (tidur di bawah pohon)", DAY,
              hills("{g1}", "{g2}", 34, 39)
              + '<path d="M2 32V22" stroke="{wood}" stroke-width="3"/>'
              + '<circle cx="2" cy="10" r="12" fill="{g3}"/><circle cx="12" cy="6" r="7" fill="{g2}"/>'
              + '<path d="M0 30h30" stroke="none"/><ellipse cx="22" cy="35" rx="16" ry="3" fill="{g3}" opacity=".35"/>',
              SHOE + face(17, 27.5, "sleep", 0.85, blush=True)
              + '<path d="M31 9.5h4l-4 4h4M37 15h2.6l-2.6 2.6h2.6" stroke="{k}" stroke-width="1.6"/>'),
    "injury": ("progress", "Cedera / nyeri", LAV,
               hills("#B5D59A", "{g1}", 36, 41) + flowers([(8, 40, "{c}"), (41, 38, "#FFFDF7"), (36, 44, "{c}")]),
               '<g transform="rotate(-35 24 24)">'
               '<rect x="8" y="17" width="32" height="14" rx="7" fill="#F5D7BC" stroke="{k}" stroke-width="1.8"/>'
               '<rect x="18.5" y="17" width="11" height="14" fill="#FBEBDC" stroke="{k}" stroke-width="1.4"/>'
               '<circle cx="12.5" cy="22" r=".8" fill="{k}"/><circle cx="12.5" cy="26" r=".8" fill="{k}"/>'
               '<circle cx="35.5" cy="22" r=".8" fill="{k}"/><circle cx="35.5" cy="26" r=".8" fill="{k}"/>'
               '</g>'
               + face(24, 23.2, "worried", 0.7)),
}

BADGES = {
    "badge-5k": ("badge", "5K pertama", DAY,
                 '<path d="M20.5 18h-5v4.6c.8-.6 1.8-.9 2.8-.9a3.4 3.4 0 0 1 0 6.8c-1.3 0-2.4-.6-3-1.5" stroke="{k}" stroke-width="2.2"/>'
                 '<path d="M24.5 18v10.5M31.5 18l-7 6M27 22.5l4.5 6" stroke="{k}" stroke-width="2.2"/>'),
    "badge-plan": ("badge", "Plan tuntas", GOLD,
                   '<path d="M19 15h10v4a5 5 0 0 1-10 0z" fill="url(#ID-gold)" stroke="{k}" stroke-width="1.8"/>'
                   '<path d="M19 16.5h-2.5a2.5 2.5 0 0 0 2.6 3.6M29 16.5h2.5a2.5 2.5 0 0 1-2.6 3.6M24 24v2.5M20.5 28h7" stroke="{k}" stroke-width="1.8"/>'),
    "badge-streak": ("badge", "4 minggu beruntun", DUSK,
                     '<path d="M24 13c2.4 3 6 5 6 9.5a6 6 0 0 1-12 0c0-2.3 1-3.8 2.3-4.8.2 1.5.8 2.4 1.7 2.8C21.6 18 22.4 15.4 24 13z" fill="{a}" stroke="{k}" stroke-width="1.6"/>'
                     '<path d="M24 19.5c1.3 1.7 2.8 2.6 2.8 4.8a2.8 2.8 0 0 1-5.6 0c0-1.7 1.4-2.8 2.8-4.8z" fill="{y}"/>'
                     '<path d="M17.5 30l13-3M17.5 27l13 3" stroke="{wood}" stroke-width="2.4"/>'),
}

ALL = {**{k: v[:2] for k, v in ICONS.items()}, **{k: v[:2] for k, v in BADGES.items()}}


def defs(pid, skyc):
    return (
        "<defs>"
        + grad(f"{pid}-sky", *skyc)
        + grad(f"{pid}-ground", "#A6CF83", "#6FA35B")
        + grad(f"{pid}-iron", "#56636C", "#2F3940", "1", "1")
        + radial(f"{pid}-glow", "#FFF3C4", "#FFE7A0", 0.95, 0)
        + radial(f"{pid}-gold", "#FBE39A", "#D9A93E", 1, 1)
        + f'<clipPath id="{pid}-clip"><rect width="48" height="48" rx="14"/></clipPath>'
        + f'<clipPath id="{pid}-bclip"><rect x="11" y="5" width="26" height="34" rx="13"/></clipPath>'
        # Garis goyah seperti digambar tangan.
        + f'<filter id="{pid}-wob" x="-5%" y="-5%" width="110%" height="110%">'
          '<feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="7"/>'
          '<feDisplacementMap in="SourceGraphic" scale="0.9" xChannelSelector="R" yChannelSelector="G"/></filter>'
        # Tekstur kertas cat air.
        + f'<filter id="{pid}-paper" x="0" y="0" width="100%" height="100%">'
          '<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" stitchTiles="stitch"/>'
          '<feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.27  0 0 0 0 0.2  0 0 0 0.12 0"/>'
          '<feComposite in2="SourceGraphic" operator="in"/></filter>'
        + f'<filter id="{pid}-wash" x="-5%" y="-5%" width="110%" height="110%">'
          '<feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="11"/>'
          '<feDisplacementMap in="SourceGraphic" scale="2.2" xChannelSelector="R" yChannelSelector="G"/></filter>'
        + "</defs>"
    )


def svg(name, size=48):
    pid = f"pt-{name}"
    if name in ICONS:
        _, _, skyc, scene, body = ICONS[name]
        inner = (
            f'<g clip-path="url(#{pid}-clip)">'
            f'<rect width="48" height="48" fill="url(#{pid}-sky)"/>'
            f'<g filter="url(#{pid}-wash)">{scene}</g>'
            f'<g filter="url(#{pid}-wob)">{body}</g>'
            f'<rect width="48" height="48" fill="#FFFFFF" filter="url(#{pid}-paper)"/>'
            "</g>"
        )
    else:
        _, _, skyc, body = BADGES[name]
        inner = (
            '<path d="M18 33l-3.5 9.5 4.5-1.5 2.5 3.5 2.5-8M30 33l3.5 9.5-4.5-1.5-2.5 3.5-2.5-8" fill="{a}" stroke="{k}" stroke-width="1.8"/>'
            f'<g clip-path="url(#{pid}-bclip)"><rect x="11" y="5" width="26" height="34" fill="url(#{pid}-sky)"/>'
            f'<g filter="url(#{pid}-wash)">' + hills("{g1}", "{g2}", 33, 36) + "</g>"
            f'<g filter="url(#{pid}-wob)">{body}</g>'
            f'<rect x="11" y="5" width="26" height="34" fill="#FFFFFF" filter="url(#{pid}-paper)"/></g>'
            '<rect x="11" y="5" width="26" height="34" rx="13" fill="none" stroke="{k}" stroke-width="2"/>'
            '<rect x="13.5" y="7.5" width="21" height="29" rx="10.5" fill="none" stroke="{y}" stroke-width="1" stroke-dasharray="0.1 2.6"/>'
        )
    inner = fill(inner.replace("#ID-", f"#{pid}-"))
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 48 48" fill="none" '
        f'stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="{name}">{defs(pid, skyc)}{inner}</svg>'
    )


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    for n in ALL:
        (OUT / f"{n}.svg").write_text(svg(n) + "\n")
    print(len(ALL), "ikon ->", OUT)
