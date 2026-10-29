// Render Design-canvas .dc.html artboards to PNG with a minimal stand-in for the
// canvas runtime: supports {{path}} holes, <sc-for>, <sc-if>, initial state, and
// stylesheets under ds/ (inlined from disk; fonts must be installed locally).
// Usage: node docs/wireframes/render.js <sourceDir> <outDir> <name.dc.html=out.png> ...
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const SHIM = `
<script>
class DCLogic { constructor(props){ this.props = props || {}; this.state = {}; } setState(s){ Object.assign(this.state, s); } }
window.addEventListener('DOMContentLoaded', () => {
  const src = document.querySelector('script[data-dc-script]').textContent;
  const Component = new Function('DCLogic', src + '; return Component;')(DCLogic);
  const vals = new Component({}).renderVals();
  const get = (scope, expr) => {
    expr = expr.trim();
    if (expr === 'true') return true;
    if (expr === 'false') return false;
    return expr.split('.').reduce((o, k) => (o == null ? undefined : o[k]), scope);
  };
  const sub = (s, scope) => s.replace(/{{([^}]+)}}/g, (_, e) => { const v = get(scope, e); return v == null || typeof v === 'function' ? '' : String(v); });
  const holeOf = (s) => { const m = /^{{([^}]+)}}$/.exec((s || '').trim()); return m ? m[1] : null; };
  function render(node, scope) {
    if (node.nodeType === 3) return [document.createTextNode(sub(node.textContent, scope))];
    if (node.nodeType !== 1) return [];
    const tag = node.tagName.toLowerCase();
    const kids = (sc) => [...node.childNodes].flatMap((c) => render(c, sc));
    if (tag === 'sc-for') {
      const list = get(scope, holeOf(node.getAttribute('list'))) || [];
      const as = node.getAttribute('as');
      return list.flatMap((item) => kids(Object.assign({}, scope, { [as]: item })));
    }
    if (tag === 'sc-if') return get(scope, holeOf(node.getAttribute('value'))) ? kids(scope) : [];
    const el = node.namespaceURI === 'http://www.w3.org/1999/xhtml' ? document.createElement(node.localName) : document.createElementNS(node.namespaceURI, node.localName);
    for (const a of node.attributes) { if (!/^on/i.test(a.name)) el.setAttribute(a.name, sub(a.value, scope)); }
    kids(scope).forEach((k) => el.appendChild(k));
    return [el];
  }
  const root = document.querySelector('x-dc');
  const helmet = root.querySelector('helmet');
  if (helmet) { [...helmet.children].forEach((c) => document.head.appendChild(c)); helmet.remove(); }
  const out = [...root.childNodes].flatMap((c) => render(c, vals));
  root.replaceWith(...out);
  // Artboards are fixed 390x844 with overflow hidden; let the screen grow to its
  // content so nothing is clipped (taller screens scroll in the real app).
  const screen = document.body.firstElementChild;
  screen.style.height = 'auto'; screen.style.minHeight = '844px'; screen.style.overflow = 'visible';
  [...screen.children].forEach((c) => { c.style.flexShrink = '0'; });
  document.body.dataset.rendered = '1';
});
</script>`;

(async () => {
  const [projectDir, outDir, ...pairs] = process.argv.slice(2);
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  for (const pair of pairs) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    page.on('pageerror', (e) => console.error('pageerror', e.message));
    await page.route('**/*', (r) => (r.request().url().startsWith('data:') || r.request().url().startsWith('about:') ? r.continue() : r.abort()));
    const [name, png] = pair.split('=');
    let html = fs.readFileSync(path.join(projectDir, name), 'utf8');
    html = html.replace('<script src="./support.js"></script>', SHIM);
    // Inline the design-system stylesheets copied into the canvas (ds/<folder>/...).
    html = html.replace(/<link rel="stylesheet" href="(ds\/[^"]+)">/g, (_, href) => `<style>${fs.readFileSync(path.join(projectDir, href), 'utf8')}</style>`);
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('body[data-rendered="1"]', { state: 'attached', timeout: 5000 });
    await page.evaluate(() => document.fonts.ready);
    await page.locator('body > :first-child').screenshot({ path: path.join(outDir, png) });
    console.log('ok', name, '->', png);
    await page.close();
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
