// Render SVG files to PNG at given sizes. Usage: node render.js <svgdir> <pngdir> file.svg:out.png:size[:bg] ...
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const [src, dst, ...jobs] = process.argv.slice(2);
  fs.mkdirSync(dst, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const job of jobs) {
    const [file, out, size, bg] = job.split(':');
    const svg = fs.readFileSync(path.join(src, file), 'utf8');
    const m = svg.match(/width="([\d.]+)" height="([\d.]+)"/);
    const w = +m[1], h = +m[2], s = +size / Math.max(w, h);
    await page.setViewportSize({ width: Math.round(w * s), height: Math.round(h * s) });
    await page.setContent(`<html><body style="margin:0;background:${bg ? '#' + bg : 'transparent'}">` +
      svg.replace(/width="[\d.]+" height="[\d.]+"/, `width="${Math.round(w * s)}" height="${Math.round(h * s)}"`) + '</body></html>');
    await page.screenshot({ path: path.join(dst, out), omitBackground: !bg });
  }
  await browser.close();
})();
