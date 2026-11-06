"""Draft ikon spot Run Coach (usulan, belum dipakai di app).

Grid 48, ubin radius 14, garis 2.5 bulat. Warna dari tokens.json.
Keluaran: assets/spot-icons-draft/<nama>.svg + index.html (pratinjau).

    python3 docs/design-system/assets/_build/spot_icons.py
"""

import math
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / "spot-icons-draft"

# Token -> (hex terang, hex gelap). Ubin pastel tetap sama di mode gelap; hanya ubin charcoal berubah.
HEX = {
    "charcoal": ("#242C32", "#242C32"),
    "cream": ("#FFF9F2", "#FFF9F2"),
    "white": ("#FFFFFF", "#FFFFFF"),
    "orange": ("#F26B38", "#F26B38"),
    "peach": ("#E9B79D", "#E9B79D"),
    "long": ("#D9946F", "#D9946F"),
    "interval": ("#B4361A", "#B4361A"),
    "mint": ("#70D6B3", "#70D6B3"),
    "sand": ("#F2C66D", "#F2C66D"),
    "coral": ("#FF806E", "#FF806E"),
    "lavender": ("#A6B8FF", "#A6B8FF"),
    "sunken": ("#EAE8E5", "#EAE8E5"),
    "strength": ("#242C32", "#3A444C"),
}

SW = 1.75
# v1.1: semua garis ditipiskan (2.5 -> 1.75) agar tidak kaku; lebar eksplisit ikut diskalakan, minimum 1.1.
STROKE_SCALE = 0.7


def thin(markup):
    import re

    def r(m):
        return f'stroke-width="{max(1.1, float(m.group(1)) * STROKE_SCALE):.2f}"'

    return re.sub(r'stroke-width="([0-9.]+)"', r, markup)


def face(cx, cy, mood="smile", s=1.0):
    """Wajah kecil: dua titik + senyum. Ciri khas set ini."""
    ex = 3.2 * s
    r = 1.35 * s
    out = []
    if mood in ("smile", "big", "worried", "calm"):
        out.append(f'<circle cx="{cx-ex:.2f}" cy="{cy:.2f}" r="{r:.2f}" fill="{{k}}"/>')
        out.append(f'<circle cx="{cx+ex:.2f}" cy="{cy:.2f}" r="{r:.2f}" fill="{{k}}"/>')
    if mood in ("sleep", "chill"):
        for d in (-ex, ex):
            out.append(
                f'<path d="M{cx+d-1.6*s:.2f} {cy:.2f}q{1.6*s:.2f} {1.4*s:.2f} {3.2*s:.2f} 0" stroke="{{k}}" stroke-width="{1.8*s:.2f}"/>'
            )
    if mood == "strain":
        for d, sg in ((-ex, 1), (ex, -1)):
            out.append(
                f'<path d="M{cx+d-1.4*s*sg:.2f} {cy-1.4*s:.2f}l{1.4*s*sg:.2f} {1.4*s:.2f}l{-1.4*s*sg:.2f} {1.4*s:.2f}" stroke="{{k}}" stroke-width="{1.7*s:.2f}"/>'
            )
    m = cy + 3.2 * s
    w = 2.4 * s
    if mood in ("smile", "sleep"):
        out.append(f'<path d="M{cx-w:.2f} {m:.2f}q{w:.2f} {1.8*s:.2f} {2*w:.2f} 0" stroke="{{k}}" stroke-width="{1.8*s:.2f}"/>')
    elif mood == "calm" or mood == "chill":
        out.append(f'<path d="M{cx-w*0.7:.2f} {m:.2f}h{1.4*w:.2f}" stroke="{{k}}" stroke-width="{1.8*s:.2f}"/>')
    elif mood == "big":
        out.append(
            f'<path d="M{cx-3.2*s:.2f} {m-0.6*s:.2f}h{6.4*s:.2f}a{3.2*s:.2f} {3.2*s:.2f} 0 0 1 {-6.4*s:.2f} 0z" fill="{{k}}" stroke="{{k}}" stroke-width="{1.2*s:.2f}"/>'
        )
    elif mood in ("strain", "worried"):
        out.append(
            f'<path d="M{cx-3*s:.2f} {m+0.8*s:.2f}q{1*s:.2f} {-1.6*s:.2f} {2*s:.2f} 0t{2*s:.2f} 0t{2*s:.2f} 0" stroke="{{k}}" stroke-width="{1.7*s:.2f}"/>'
        )
    return "".join(out)


def cheeks(cx, cy, s=1.0):
    return (
        f'<circle cx="{cx-6*s:.2f}" cy="{cy+1.8*s:.2f}" r="{1.6*s:.2f}" fill="{{c}}" stroke="none"/>'
        f'<circle cx="{cx+6*s:.2f}" cy="{cy+1.8*s:.2f}" r="{1.6*s:.2f}" fill="{{c}}" stroke="none"/>'
    )


def star(cx, cy, R, r):
    pts = []
    for i in range(10):
        a = -math.pi / 2 + i * math.pi / 5
        rr = R if i % 2 == 0 else r
        pts.append(f"{cx + rr*math.cos(a):.2f} {cy + rr*math.sin(a):.2f}")
    return "M" + "L".join(pts) + "z"


SHOE = (
    '<path d="M10 33h25.5a3.5 3.5 0 0 0 3.5-3.5c0-3.2-2.8-5.3-6.8-5.9L26 22.5l-3.6-5h-5.6'
    'c-.9 2.8-3.4 4.2-6.8 4.2z" fill="{p}" stroke="{k}"/>'
    '<path d="M9.5 37h28" stroke="{a}"/>'
    '<path d="M24 24.2l2-2.4M27.4 24.4l1.6-2" stroke="{k}" stroke-width="1.8"/>'
)

# nama: (grup, label, ubin, tinta, aksen, pipi, isi)
ICONS = {
    # A. Jenis latihan: warna ubin = skala panas zona (tokens color.zone)
    "easy": ("latihan", "Easy run", "peach", "charcoal", "orange", "coral",
             SHOE + face(17, 27.5, "smile", 0.85)),
    "long": ("latihan", "Long run", "long", "charcoal", "white", "coral",
             '<path d="M29 23a5.5 5.5 0 0 1 11 0" fill="{y}" stroke="{k}"/>'
             '<path d="M8 23h11M29 23h11" stroke="{k}"/>'
             '<path d="M22.5 23l-8 15M25.5 23l8 15" stroke="{k}"/>'
             '<path d="M24 27v2M24 32v4" stroke="{p}" stroke-width="2.4"/>'
             '<path d="M11 16.5h5M13.5 12.5h6" stroke="{p}" stroke-width="2"/>'),
    "tempo": ("latihan", "Tempo", "orange", "charcoal", "white", "coral",
              '<path d="M10.5 32a13.5 13.5 0 0 1 27 0z" fill="{p}" stroke="{k}"/>'
              '<path d="M28.8 19.4a13.5 13.5 0 0 1 8.7 12.6" stroke="{y}" stroke-width="4" stroke-linecap="butt"/>'
              '<path d="M15.5 25l1.5 1M24 19v2" stroke="{k}" stroke-width="2"/>'
              '<path d="M24 31l6-7.5" stroke="{k}" stroke-width="3"/>'
              '<circle cx="24" cy="31" r="2.6" fill="{k}"/>'
              '<path d="M14 37h20" stroke="{k}"/>'),
    "interval": ("latihan", "Interval", "interval", "cream", "sand", "coral",
                 '<path d="M11 33v-5M17.5 33V16M24 33v-5M30.5 33V16M37 33v-5" stroke="{k}" stroke-width="3"/>'
                 '<path d="M9 37h30" stroke="{a}"/>'
                 '<path d="M17.5 12v.01M30.5 12v.01" stroke="{a}" stroke-width="3"/>'),
    "recovery": ("latihan", "Recovery / jalan", "lavender", "charcoal", "white", "coral",
                 '<g fill="{k}" stroke="none">'
                 '<ellipse cx="18" cy="30" rx="3.6" ry="5.6" transform="rotate(-14 18 30)"/>'
                 '<circle cx="15.2" cy="22.2" r="1.3"/><circle cx="18.2" cy="21.4" r="1.2"/><circle cx="20.8" cy="22.4" r="1.1"/>'
                 '<ellipse cx="30" cy="22" rx="3.6" ry="5.6" transform="rotate(10 30 22)"/>'
                 '<circle cx="28.2" cy="14" r="1.3"/><circle cx="31.2" cy="13.8" r="1.2"/><circle cx="33.6" cy="15.2" r="1.1"/>'
                 '</g>'
                 '<path d="M10 37c4-1.5 8-1.5 12 0s8 1.5 12 0" stroke="{a}" stroke-width="2"/>'),
    "strength": ("latihan", "Strength", "strength", "cream", "orange", "coral",
                 '<path d="M18.5 19.5v-1.5a5.5 5.5 0 0 1 11 0v1.5" stroke="{k}" stroke-width="3"/>'
                 '<path d="M14.5 29a9.5 9.5 0 0 1 19 0c0 3.5-1.5 6-3.5 7.5h-12c-2-1.5-3.5-4-3.5-7.5z" fill="{k}" stroke="{k}"/>'
                 + face(24, 27.5, "smile", 0.85).replace("{k}", "{ink2}")
                 + '<path d="M17 38.5h14" stroke="{a}"/>'),
    "drill": ("latihan", "Drill", "sand", "charcoal", "orange", "coral",
              '<path d="M24 12.5l7.5 22h-15z" fill="{a}" stroke="{k}"/>'
              '<path d="M19.6 25.5h8.8" stroke="{p}" stroke-width="3"/>'
              '<path d="M12.5 35.5h23" stroke="{k}" stroke-width="3"/>'),
    "rest-day": ("latihan", "Hari istirahat", "sunken", "charcoal", "orange", "coral",
                 '<path d="M27 12.5a12 12 0 1 0 9.5 18.5A10 10 0 0 1 27 12.5z" fill="{y}" stroke="{k}"/>'
                 + face(22.5, 26, "sleep", 0.85)
                 + '<path d="M33 11.5h4.5l-4.5 4.5h4.5" stroke="{a}" stroke-width="2"/>'),
    # B. Kartu Today
    "race-day": ("today", "Race countdown", "sand", "charcoal", "orange", "coral",
                 '<rect x="10.5" y="13.5" width="27" height="22" rx="3.5" fill="{p}" stroke="{k}"/>'
                 '<path d="M10.5 19.5h27" stroke="{a}" stroke-width="3"/>'
                 '<circle cx="14.5" cy="31.5" r="1" fill="{k}" stroke="none"/><circle cx="33.5" cy="31.5" r="1" fill="{k}" stroke="none"/>'
                 + face(24, 26, "smile", 0.85)),
    "next-long": ("today", "Long run berikutnya", "peach", "charcoal", "orange", "coral",
                  '<rect x="10" y="13" width="28" height="24" rx="4" fill="{p}" stroke="{k}"/>'
                  '<path d="M10 19h28M16 10.5v4M32 10.5v4" stroke="{k}"/>'
                  '<path d="M15 32c3-6 7 0 10-4.5s5-2.5 7-4" stroke="{a}" stroke-dasharray="0.1 3.4" stroke-width="2.4"/>'
                  '<circle cx="15" cy="32" r="1.8" fill="{k}" stroke="none"/>'
                  '<path d="M33 30v-8.5l4 1.6-4 1.6" stroke="{k}" stroke-width="2" fill="{a}"/>'),
    "records": ("today", "Rekor plan", "mint", "charcoal", "orange", "coral",
                '<path d="M17.5 10.5l4.5 10M30.5 10.5l-4.5 10" stroke="{a}" stroke-width="3"/>'
                '<circle cx="24" cy="29" r="9" fill="{y}" stroke="{k}"/>'
                f'<path d="{star(24, 29.3, 4.6, 2)}" fill="{{p}}" stroke="{{k}}" stroke-width="1.6"/>'),
    "streak": ("today", "Streak minggu", "coral", "charcoal", "orange", "sand",
               '<path d="M24 10.5c4.5 5 11 9 11 17a11 11 0 0 1-22 0c0-4 2-6.6 4.2-8.4.3 2.6 1.4 4.2 3 4.9'
               'C19.6 19 21 14.6 24 10.5z" fill="{a}" stroke="{k}"/>'
               + face(24, 29, "smile", 0.85)),
    # C. Rasa setelah latihan (RPE 1-4, 5-7, 8-10)
    "feel-easy": ("rasa", "Terlalu ringan (RPE 1-4)", "lavender", "charcoal", "white", "coral",
                  '<circle cx="24" cy="25" r="12" fill="{p}" stroke="{k}"/>'
                  + face(24, 23.5, "chill", 1.0)
                  + '<path d="M33.5 12.5c1.5-1 3-1 4.5 0M35 9c1-.7 2-.7 3 0" stroke="{k}" stroke-width="1.8"/>'),
    "feel-ok": ("rasa", "Pas (RPE 5-7)", "mint", "charcoal", "white", "coral",
                '<circle cx="24" cy="25" r="12" fill="{p}" stroke="{k}"/>'
                + face(24, 23.5, "big", 1.0) + cheeks(24, 23.5, 1.0)),
    "feel-hard": ("rasa", "Terlalu berat (RPE 8-10)", "coral", "charcoal", "white", "coral",
                  '<circle cx="24" cy="25" r="12" fill="{p}" stroke="{k}"/>'
                  + face(24, 23.5, "strain", 1.0)
                  + '<path d="M36 13.5c1.6 2.2 2.4 3.6 2.4 4.7a2.4 2.4 0 0 1-4.8 0c0-1.1.8-2.5 2.4-4.7z" fill="{l}" stroke="{k}" stroke-width="1.6"/>'),
    # D. Timer
    "get-ready": ("timer", "Siap-siap", "sand", "charcoal", "orange", "coral",
                  '<path d="M21 10.5h6M24 10.5v4" stroke="{k}"/>'
                  '<path d="M33.5 16.5l2-2" stroke="{k}"/>'
                  '<circle cx="24" cy="27" r="11.5" fill="{p}" stroke="{k}"/>'
                  '<path d="M24 15.5a11.5 11.5 0 0 1 11.5 11.5" stroke="{a}" stroke-width="3"/>'
                  + face(24, 26.5, "smile", 0.9)),
    "rest": ("timer", "Istirahat", "lavender", "charcoal", "orange", "coral",
             '<rect x="21" y="9.5" width="6" height="3.5" rx="1" fill="{a}" stroke="{k}" stroke-width="2"/>'
             '<path d="M21.5 13h5v3l3.5 3.5v15a3.5 3.5 0 0 1-3.5 3.5h-5a3.5 3.5 0 0 1-3.5-3.5v-15l3.5-3.5z" fill="{p}" stroke="{k}"/>'
             '<path d="M18 31.5h12" stroke="{l}" stroke-width="2"/>'
             + face(24, 25, "smile", 0.75)),
    "sound": ("timer", "Bunyi penanda", "mint", "charcoal", "orange", "coral",
              '<path d="M10 21.5h5l6-5v15l-6-5h-5z" fill="{p}" stroke="{k}"/>'
              '<path d="M26.5 19a6.5 6.5 0 0 1 0 10" stroke="{a}" stroke-width="2.6"/>'
              '<path d="M31 15a12 12 0 0 1 0 18" stroke="{k}"/>'
              '<circle cx="36.5" cy="14" r="1.4" fill="{a}" stroke="none"/>'),
    "finish": ("timer", "Selesai", "mint", "charcoal", "orange", "coral",
               '<path d="M15 38V11" stroke="{k}"/>'
               '<path d="M15 12.5h19l-3 6 3 6H15z" fill="{p}" stroke="{k}"/>'
               '<path d="M20 12.5h4.5v6H20zM24.5 18.5h4.5v6h-4.5zM29 12.5h3.5" fill="{k}" stroke="none"/>'
               '<circle cx="36" cy="31" r="1.4" fill="{a}" stroke="none"/><circle cx="29" cy="35" r="1.2" fill="{a}" stroke="none"/>'
               '<path d="M21 31.5l1.5 1.5M36.5 37l1.2-1.2" stroke="{a}" stroke-width="2"/>'),
    # E. Progress, profil, keadaan kosong
    "week-done": ("progress", "Minggu tuntas", "mint", "charcoal", "orange", "coral",
                  '<rect x="8.5" y="14" width="31" height="20" rx="10" fill="{p}" stroke="{k}"/>'
                  '<rect x="14" y="19.5" width="20" height="9" rx="4.5" stroke="{k}" stroke-width="1.6"/>'
                  '<path d="M19.5 24l3 3 6-6" stroke="{a}" stroke-width="3"/>'
                  '<circle cx="34.5" cy="15" r="2.4" fill="{k}" stroke="none"/>'),
    "distance": ("progress", "Total jarak", "peach", "charcoal", "orange", "coral",
                 '<path d="M12 35c4-8 14-2 16-10s6-8 8-8" stroke="{k}" stroke-dasharray="0.1 4" stroke-width="2.6"/>'
                 '<circle cx="12" cy="35" r="2.4" fill="{k}" stroke="none"/>'
                 '<path d="M33 25s6-5 6-9.5a6 6 0 0 0-12 0c0 4.5 6 9.5 6 9.5z" fill="{a}" stroke="{k}"/>'
                 '<circle cx="33" cy="15.5" r="2" fill="{p}" stroke="none"/>'),
    "privacy": ("progress", "Data di perangkat", "lavender", "charcoal", "orange", "coral",
                '<rect x="15" y="9.5" width="18" height="29" rx="4" fill="{p}" stroke="{k}"/>'
                '<path d="M22 13h4" stroke="{k}" stroke-width="2"/>'
                '<path d="M24 18.5l6 2.2v4.4c0 4-2.6 6.4-6 7.6-3.4-1.2-6-3.6-6-7.6v-4.4z" fill="{a}" stroke="{k}" stroke-width="2"/>'
                '<path d="M24 23.5v3.5" stroke="{p}" stroke-width="2.4"/>'),
    "empty": ("progress", "Belum ada aktivitas", "sunken", "charcoal", "orange", "coral",
              SHOE + face(17, 27.5, "sleep", 0.85)
              + '<path d="M31 9.5h4l-4 4h4M37 15h2.6l-2.6 2.6h2.6" stroke="{k}" stroke-width="1.8"/>'),
    "injury": ("progress", "Cedera / nyeri", "sand", "charcoal", "orange", "coral",
               '<g transform="rotate(-35 24 24)">'
               '<rect x="8" y="17" width="32" height="14" rx="7" fill="{p}" stroke="{k}"/>'
               '<rect x="18.5" y="17" width="11" height="14" fill="{y2}" stroke="{k}" stroke-width="2"/>'
               '<circle cx="12.5" cy="22" r=".9" fill="{k}" stroke="none"/><circle cx="12.5" cy="26" r=".9" fill="{k}" stroke="none"/>'
               '<circle cx="35.5" cy="22" r=".9" fill="{k}" stroke="none"/><circle cx="35.5" cy="26" r=".9" fill="{k}" stroke="none"/>'
               '</g>'
               + face(24, 23.2, "worried", 0.7)),
}

# F. Badge pencapaian: bentuk stadium tegak (bahasa bentuk lintasan) + pita.
BADGES = {
    "badge-5k": ("badge", "5K pertama", "peach",
                 '<path d="M20.5 19h-5v4.6c.8-.6 1.8-.9 2.8-.9a3.4 3.4 0 0 1 0 6.8c-1.3 0-2.4-.6-3-1.5" stroke="{k}" stroke-width="2.4"/>'
                 '<path d="M24.5 19v10.5M31.5 19l-7 6M27 23.5l4.5 6" stroke="{k}" stroke-width="2.4"/>'),
    "badge-plan": ("badge", "Plan tuntas", "mint",
                   '<path d="M19 17h10v4a5 5 0 0 1-10 0z" fill="{p}" stroke="{k}" stroke-width="2.2"/>'
                   '<path d="M19 18.5h-2.5a2.5 2.5 0 0 0 2.6 3.6M29 18.5h2.5a2.5 2.5 0 0 1-2.6 3.6M24 26v2.5M20.5 30h7" stroke="{k}" stroke-width="2.2"/>'),
    "badge-streak": ("badge", "4 minggu beruntun", "coral",
                     '<path d="M24 15c3 3.4 7 6 7 11a7 7 0 0 1-14 0c0-2.6 1.3-4.3 2.7-5.4.2 1.7.9 2.7 1.9 3.2C21.2 21 22 18 24 15z" fill="{a}" stroke="{k}" stroke-width="2.2"/>'
                     + face(24, 26.5, "smile", 0.6)),
}


def badge_frame(tile):
    return (
        '<path d="M18 33l-3.5 9.5 4.5-1.5 2.5 3.5 2.5-8M30 33l3.5 9.5-4.5-1.5-2.5 3.5-2.5-8" fill="{a}" stroke="{k}" stroke-width="2.2"/>'
        f'<rect x="11" y="5" width="26" height="34" rx="13" fill="{{T}}" stroke="{{k}}"/>'
        '<rect x="14.5" y="8.5" width="19" height="27" rx="9.5" fill="none" stroke="{p}" stroke-width="1.4" stroke-dasharray="0.1 2.8"/>'
    )


def colors(tile, ink, acc, cheek, mode):
    """Nilai warna untuk placeholder. mode 'file' = hex, 'html' = var CSS."""
    def v(name):
        if mode == "file":
            return HEX[name][0]
        return f"var(--si-{name})"

    acc2 = "charcoal" if acc == "white" else acc
    return {
        "t": v(tile), "T": v(tile), "k": v(ink), "a": v(acc), "a2": v("white" if tile == "orange" else "orange"),
        "p": v("white"), "c": v(cheek), "y": v("sand"), "y2": v("peach"), "l": v("lavender"),
        "ink2": v("charcoal"), "acc2": v(acc2),
    }


def fill(markup, cmap):
    for key in sorted(cmap, key=len, reverse=True):
        markup = markup.replace("{" + key + "}", cmap[key])
    return markup


def svg(name, mode="file", size=48):
    if name in ICONS:
        _, _, tile, ink, acc, cheek, body = ICONS[name]
        cmap = colors(tile, ink, acc, cheek, mode)
        inner = f'<rect width="48" height="48" rx="14" fill="{cmap["t"]}"/>' + fill(body, cmap)
    else:
        _, _, tile, body = BADGES[name]
        cmap = colors(tile, "charcoal", "orange", "coral", mode)
        inner = fill(badge_frame(tile) + body, cmap)
    inner = thin(inner)
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 48 48" fill="none" '
        f'stroke-width="{SW}" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="{name}">{inner}</svg>'
    )


ALL = {**{k: v[:2] for k, v in ICONS.items()}, **{k: v[:2] for k, v in BADGES.items()}}

if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    for n in ALL:
        (OUT / f"{n}.svg").write_text(svg(n) + "\n")
    print(len(ALL), "ikon ->", OUT)
