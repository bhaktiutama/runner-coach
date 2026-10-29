"""Check WCAG contrast for every text/background pair the design system uses.

Usage: python3 docs/design-system/check_contrast.py
Exits 1 if any pair is below its minimum (4.5:1 text, 3:1 large text and controls).
"""
import json
import pathlib
import sys

TOKENS = json.loads((pathlib.Path(__file__).parent / "tokens.json").read_text())

# (foreground, background, minimum ratio, where it is used)
PAIRS = [
    ("color.text", "color.bg", 4.5, "teks utama"),
    ("color.text", "color.surface", 4.5, "teks di kartu"),
    ("color.text", "color.surface-sunken", 4.5, "teks di kotak statistik"),
    ("color.text-muted", "color.bg", 4.5, "teks kedua"),
    ("color.text-muted", "color.surface", 4.5, "teks kedua di kartu"),
    ("color.text-muted", "color.surface-sunken", 4.5, "teks kedua di kotak statistik"),
    ("color.line-strong", "color.bg", 3.0, "border kontrol"),
    ("color.on-primary", "color.primary", 4.5, "tombol utama"),
    ("color.primary-ink", "color.bg", 4.5, "link / angka sorotan"),
    ("color.primary-ink", "color.surface", 4.5, "link di kartu"),
    ("color.accent-ink", "color.bg", 4.5, "teks aksen"),
    ("color.success", "color.bg", 4.5, "teks sukses"),
    ("color.on-success", "color.success", 4.5, "badge sukses"),
    ("color.status.on-status", "color.status.on-track", 4.5, "chip on track"),
    ("color.status.on-status", "color.status.attention", 4.5, "chip perhatian"),
    ("color.status.on-status", "color.status.behind", 4.5, "chip tertinggal"),
    ("color.status.on-status", "color.status.recovery", 4.5, "chip recovery"),
    ("color.status.on-track-ink", "color.surface", 4.5, "teks on track"),
    ("color.status.attention-ink", "color.surface", 4.5, "teks perhatian"),
    ("color.status.behind-ink", "color.surface", 4.5, "teks tertinggal"),
    ("color.status.recovery-ink", "color.surface", 4.5, "teks recovery"),
    ("color.zone.on-recovery", "color.zone.recovery", 4.5, "bib recovery"),
    ("color.zone.on-easy", "color.zone.easy", 4.5, "bib easy"),
    ("color.zone.on-long", "color.zone.long", 4.5, "bib long"),
    ("color.zone.on-tempo", "color.zone.tempo", 4.5, "bib tempo"),
    ("color.zone.on-interval", "color.zone.interval", 4.5, "bib interval"),
    ("color.zone.on-strength", "color.zone.strength", 4.5, "bib strength"),
    ("color.dark.text", "color.dark.bg", 4.5, "timer teks"),
    ("color.dark.text-muted", "color.dark.bg", 4.5, "timer teks kedua"),
    ("color.dark.text-muted", "color.dark.surface", 4.5, "timer kartu"),
    ("color.primary", "color.dark.bg", 3.0, "cincin progres timer"),
    ("color.dark.zone-interval", "color.dark.bg", 3.0, "cincin interval di timer"),
]


def resolve(path):
    node = TOKENS
    for key in path.split("."):
        node = node[key]
    value = node["$value"]
    if isinstance(value, str) and value.startswith("{"):
        return resolve(value.strip("{}"))
    return value


def luminance(hex_color):
    h = hex_color.lstrip("#")[:6]
    channels = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    linear = [c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4 for c in channels]
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]


def ratio(a, b):
    la, lb = luminance(a), luminance(b)
    return (max(la, lb) + 0.05) / (min(la, lb) + 0.05)


failed = 0
for fg, bg, minimum, use in PAIRS:
    r = ratio(resolve(fg), resolve(bg))
    ok = r >= minimum
    failed += not ok
    print(f"{'OK  ' if ok else 'FAIL'} {r:5.2f} (min {minimum}) {use}: {fg} on {bg}")
print(f"\n{len(PAIRS) - failed}/{len(PAIRS)} pairs pass")
sys.exit(1 if failed else 0)
