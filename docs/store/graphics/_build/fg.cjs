const { chromium } = require('playwright'); const fs = require('fs');
const S = process.argv[2], F = '/root/.fonts/', R = '/home/user/runner-coach/';
const b64 = (f) => 'data:image/png;base64,' + fs.readFileSync(`${S}/shots/${f}.png`).toString('base64');
const logo = fs.readFileSync(R + 'docs/design-system/assets/logo/logo-horizontal-dark.svg', 'utf8').replace(/width="[\d.]+" height="[\d.]+"/, 'height="64"');
const html = `<!doctype html><html><head><style>
@font-face{font-family:B;src:url(file://${F}BricolageGrotesque_800ExtraBold.ttf)}
@font-face{font-family:J;src:url(file://${F}PlusJakartaSans_600SemiBold.ttf)}
*{margin:0;box-sizing:border-box}body{width:1024px;height:500px;overflow:hidden;background:#1B2126;position:relative;font-family:J}
.c{position:absolute;border-radius:50%;background:#F26B38}
.col{position:absolute;left:64px;top:0;height:500px;width:500px;display:flex;flex-direction:column;justify-content:center;gap:22px}
h1{font-family:B;font-size:52px;line-height:1.02;letter-spacing:-1.5px;color:#F5F4F2}
h1 span{color:#F26B38}
p{font-size:21px;width:430px;line-height:1.35;color:#B9C0C6}
.ph{position:absolute;width:228px;border-radius:32px;padding:6px;background:#3A444C;box-shadow:0 18px 40px rgba(0,0,0,.45)}
.ph img{display:block;width:100%;border-radius:27px}
</style></head><body>
<div class="c" style="width:560px;height:560px;left:640px;top:-40px;opacity:.9"></div>
<div class="col"><div>${logo}</div><h1>Your running coach,<br><span>5K to marathon</span></h1><p>A full plan, a guided timer and strength for runners.</p></div>
<div class="ph" style="left:640px;top:78px;transform:rotate(-8deg)"><img src="${b64('light-timer')}"></div>
<div class="ph" style="left:800px;top:40px;transform:rotate(6deg)"><img src="${b64('light-today')}"></div>
</body></html>`;
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1024, height: 500 } });
  fs.writeFileSync(`${S}/fg.html`, html); await p.goto(`file://${S}/fg.html`); await p.waitForTimeout(500);
  await p.screenshot({ path: `${S}/store/feature-graphic.png` }); await b.close(); })();
