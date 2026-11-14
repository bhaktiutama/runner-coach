#!/usr/bin/env python3
"""Copy the landing into a deploy folder and stamp CSS/JS URLs with a content hash.

EAS Hosting serves styles.css, app.js and plan3d.js with `cache-control: max-age=3600`, so a browser
that saw the page before keeps the old files for up to an hour after a deploy. A `?v=<hash>` on every
reference makes each deploy load fresh files, while unchanged files stay cached.

Usage: python3 marketing/landing/prepare-deploy.py <out-dir>   (then `eas deploy --export-dir <out-dir>`)
"""
import hashlib
import os
import shutil
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.abspath(sys.argv[1])

subprocess.run([sys.executable, os.path.join(HERE, 'build-id.py')], check=True)
if os.path.exists(OUT):
    raise SystemExit(f'{OUT} exists: give a new folder')
os.makedirs(OUT)
for name in ['index.html', 'styles.css', 'app.js', 'plan3d.js']:
    shutil.copy2(os.path.join(HERE, name), OUT)
for name in ['assets', 'id', 'privacy']:
    shutil.copytree(os.path.join(HERE, name), os.path.join(OUT, name), symlinks=False)


def stamp(name):
    return hashlib.sha256(open(os.path.join(HERE, name), 'rb').read()).hexdigest()[:10]


v = {n: stamp(n) for n in ['styles.css', 'app.js', 'plan3d.js']}


def rewrite(path, pairs):
    s = open(path, encoding='utf-8').read()
    for old, new in pairs:
        if old not in s:
            raise SystemExit(f'prepare-deploy: {old!r} not found in {path}')
        s = s.replace(old, new)
    open(path, 'w', encoding='utf-8').write(s)


rewrite(os.path.join(OUT, 'index.html'), [('href="styles.css"', f'href="styles.css?v={v["styles.css"]}"'),
                                          ('src="app.js"', f'src="app.js?v={v["app.js"]}"')])
rewrite(os.path.join(OUT, 'id', 'index.html'), [('href="../styles.css"', f'href="../styles.css?v={v["styles.css"]}"'),
                                                ('src="../app.js"', f'src="../app.js?v={v["app.js"]}"')])
rewrite(os.path.join(OUT, 'app.js'), [("import('./plan3d.js')", f"import('./plan3d.js?v={v['plan3d.js']}')")])
print('prepared', OUT, v)
