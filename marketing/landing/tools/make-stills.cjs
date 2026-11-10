// Chromium: PW_CHROMIUM_PATH, else /opt/pw-browsers/chromium (the cloud session's browser).
// Renders the hero's stills (assets/hero/hero-still*.webp) from the live 3D scene, so the picture under
// the canvas is the scene's own frame. Needs Playwright (global: NODE_PATH=$(npm root -g)) and Pillow.
//   node tools/make-stills.cjs            from marketing/landing
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..'), T = { '.html': 'text/html', '.js': 'text/javascript', '.webp': 'image/webp', '.css': 'text/css' };
const srv = http.createServer((q, r) => {
  const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]));
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) return r.writeHead(404).end();
  r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
});
(async () => {
  await new Promise(ok => srv.listen(0, '127.0.0.1', ok));
  const base = `http://127.0.0.1:${srv.address().port}/tools/still.html`;
  const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM_PATH || '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  for (const [name, w, h] of [['hero-still', 1280, 566], ['hero-still-phone', 342, 394]]) {
    const page = await b.newPage({ viewport: { width: Math.max(w, 400), height: Math.max(h, 400) }, deviceScaleFactor: 2 });
    page.on('pageerror', e => console.error('page error:', e.message));
    await page.goto(`${base}?w=${w}&h=${h}&still=${process.argv[2] || 2.4}`);
    await page.waitForFunction(() => window.__hero3d && window.__hero3d.isReady(), null, { timeout: 30000 });
    const url = await page.evaluate(t => { const s = window.__hero3d; s.frame(t); return s.canvas.toDataURL('image/png'); }, +(process.argv[2] || 2.4));
    const png = path.join(ROOT, 'assets/hero', name + '.png');
    fs.writeFileSync(png, Buffer.from(url.split(',')[1], 'base64'));
    execFileSync('python3', ['-c', `from PIL import Image; im=Image.open(r'${png}'); im.save(r'${png.replace(/\.png$/, '.webp')}', 'WEBP', quality=88, method=6); print('${name}', im.size)`], { stdio: 'inherit' });
    fs.unlinkSync(png);
    await page.close();
  }
  await b.close(); srv.close();
})().catch(e => { console.error(e); process.exit(1); });
