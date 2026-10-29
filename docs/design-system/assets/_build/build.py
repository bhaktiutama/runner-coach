"""Build Lintas brand assets: logo mark, wordmark (text converted to paths), app icon SVG sources."""
import sys
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

FONT, OUT = sys.argv[1], Path(sys.argv[2])
OUT.mkdir(parents=True, exist_ok=True)

BG, PRIMARY, TEXT = "#FFF9F2", "#F26B38", "#242C32"

# Mark: running track (stadium) left open at top-right, runner dot in the gap.
# Geometry on a 64 grid: straights x 22..42, radius 14, centre y 32, stroke 7.
TRACK = "M38 18H22a14 14 0 0 0 0 28h20a14 14 0 0 0 14-14"
DOT = (49.5, 19.5, 5)


def mark(track, dot, stroke=7):
    cx, cy, r = DOT
    return (f'<path d="{TRACK}" fill="none" stroke="{track}" stroke-width="{stroke}" stroke-linecap="round"/>'
            f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{dot}"/>')


def svg(w, h, body, vb=None):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="{vb or f"0 0 {w} {h}"}">'
            f'{body}</svg>\n')


def write(name, text):
    (OUT / name).write_text(text)


# Wordmark glyphs as paths
font = TTFont(FONT)
font = instantiateVariableFont(font, {"wght": 800, "opsz": 96, "wdth": 88})
gs, cmap = font.getGlyphSet(), font.getBestCmap()
upm = font["head"].unitsPerEm
ascent = font["hhea"].ascent


def text_path(text, size, x0, baseline, tracking=-0.02):
    s = size / upm
    x, parts = x0, []
    for ch in text:
        g = cmap[ord(ch)]
        pen = SVGPathPen(gs)
        gs[g].draw(TransformPen(pen, (s, 0, 0, -s, x, baseline)))
        parts.append(pen.getCommands())
        x += gs[g].width * s + tracking * size
    return " ".join(p for p in parts if p), x - tracking * size


WORD = "runner coach"
wd, wend = text_path(WORD, 40, 0, 40)
write("wordmark.svg", svg(round(wend), 52, f'<path d="{wd}" fill="{TEXT}"/>'))

# Horizontal lockup: mark 64 + gap 12 + wordmark (x-height aligned to the track centre)
lw, lend = text_path(WORD, 30, 72, 41)
lock_w = round(lend) + 2
write("logo-horizontal.svg", svg(lock_w, 64, mark(PRIMARY, TEXT) + f'<path d="{lw}" fill="{TEXT}"/>'))
lw2, _ = text_path(WORD, 30, 72, 41)
write("logo-horizontal-dark.svg", svg(lock_w, 64, mark(PRIMARY, BG) + f'<path d="{lw2}" fill="{BG}"/>'))

# Mark variants
write("logo-mark.svg", svg(64, 64, mark(PRIMARY, TEXT)))
write("logo-mark-dark.svg", svg(64, 64, mark(PRIMARY, BG)))
write("logo-mark-mono.svg", svg(64, 64, mark(TEXT, TEXT)))


def scaled(size, scale, track, dot, bg=None, rx=0):
    off = (64 - 64 * scale) / 2 * (size / 64) / 1
    body = f'<rect width="{size}" height="{size}" rx="{rx}" fill="{bg}"/>' if bg else ""
    k = size / 64 * scale
    t = size * (1 - scale) / 2
    body += f'<g transform="translate({t:.2f} {t:.2f}) scale({k:.4f})">{mark(track, dot)}</g>'
    return svg(size, size, body)


# App icon sources (rendered to PNG by render.js)
write("app-icon.svg", scaled(1024, 0.78, BG, TEXT, PRIMARY))              # iOS / store, full bleed
write("adaptive-foreground.svg", scaled(1024, 0.52, BG, TEXT))            # Android safe zone 66%
write("adaptive-monochrome.svg", scaled(1024, 0.52, "#000000", "#000000"))
write("splash-icon.svg", scaled(1024, 0.7, PRIMARY, TEXT))               # on bg #FFF9F2
write("favicon.svg", scaled(64, 0.92, BG, TEXT, PRIMARY, rx=14))
print("ok", sorted(p.name for p in OUT.iterdir()))
