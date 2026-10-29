"""Sandingkan screenshot app (@2x) dengan PNG wireframe bernomor sama.

python3 scripts/compare-wireframes.py <folder-screenshot>  ->  <folder>/cmp-<nama>.jpg
Kiri: wireframe, kanan: app. Butuh Pillow.
"""
import sys
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent.parent / 'docs' / 'wireframes' / 'png'
out = Path(sys.argv[1])
for shot in sorted(out.glob('[0-9]*.png')):
    ref = root / shot.name
    if not ref.exists():
        continue
    a = Image.open(ref).convert('RGB')
    b = Image.open(shot).convert('RGB')
    h = max(a.height, b.height)
    canvas = Image.new('RGB', (a.width + b.width + 20, h), 'white')
    canvas.paste(a, (0, 0))
    canvas.paste(b, (a.width + 20, 0))
    canvas.save(out / f'cmp-{shot.stem}.jpg', quality=82)
    print('cmp', shot.stem, a.size, b.size)
