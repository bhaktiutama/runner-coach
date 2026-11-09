const { chromium } = require('playwright');
const fs = require('fs');
const S = process.argv[2], W = +process.argv[3], H = +process.argv[4], tag = process.argv[5];
const F = '/root/.fonts/';
const frames = [
  { img: 'light-today', h: ['Know exactly what', ['to ', ['run today']]], s: 'Your plan, one screen, one tap to start.' },
  { img: 'light-preview', h: ['A real plan, built', ['around ', ['race day']]], s: '5K, 10K, half or full marathon, on your days.' },
  { img: 'light-timer', dark: true, h: ['Every interval,', [['coached']]], s: 'Target pace, sound cues and haptics.' },
  { img: 'light-detail-why', h: ['Every workout', [['explains itself']]], s: 'The reason and the evidence, in plain words.' },
  { img: 'light-strength-timer', dark: true, h: ['Strength built', ['for ', ['runners']]], s: 'Bodyweight legs and core, timed for you.' },
  { img: 'light-progress', h: ['See yourself', ['getting ', ['faster']]], s: 'Pace trend, consistency, race prediction.' },
  { img: 'light-week2', h: ['Every week, a', ['clear ', ['win']]], s: 'Distance, time and streaks at a glance.' },
  { img: 'light-privacy', dark: true, h: ['Your data stays', [['on your phone']]], s: 'No cloud profile. Your backup, your file.' },
];
const b64 = (f) => 'data:image/png;base64,' + fs.readFileSync(`${S}/shots/${f}.png`).toString('base64');
const line = (l, dark) => (Array.isArray(l) ? l : [l]).map((p) => Array.isArray(p) ? `<span class="${dark ? 'kd' : 'k'}">${p[0]}</span>` : p).join('');
const html = (fr, i) => `<!doctype html><html><head><style>
@font-face{font-family:B;src:url(file://${F}BricolageGrotesque_800ExtraBold.ttf)}
@font-face{font-family:J;src:url(file://${F}PlusJakartaSans_600SemiBold.ttf)}
@font-face{font-family:JB;src:url(file://${F}PlusJakartaSans_800ExtraBold.ttf)}
*{margin:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden}
body{background:${fr.dark ? '#1B2126' : '#F5F4F2'};position:relative;font-family:J}
.track{position:absolute;inset:0}
.top{position:absolute;left:7.4vw;right:7.4vw;top:${H / W > 2 ? 11 : 8.5}vw}
.ey{font-family:JB;font-size:2.9vw;letter-spacing:.32vw;color:${fr.dark ? '#F26B38' : '#C2481A'};margin-bottom:2.4vw}
h1{font-family:B;font-size:9.4vw;line-height:1.02;letter-spacing:-.25vw;color:${fr.dark ? '#F5F4F2' : '#242C32'}}
.k{background:linear-gradient(transparent 58%,#F26B38 58%,#F26B38 90%,transparent 90%);padding:0 .6vw;margin:0 -.6vw}
.kd{color:#F26B38}
p{margin-top:2.6vw;font-size:4.1vw;line-height:1.3;color:${fr.dark ? '#B9C0C6' : '#5E6670'}}
.phone{position:absolute;left:50%;transform:translateX(-50%);top:${H / W > 2 ? 62 : 57}vw;width:72vw;border-radius:9.6vw;padding:1.7vw;
 background:${fr.dark ? '#3A444C' : '#242C32'};box-shadow:0 4vw 9vw rgba(36,44,50,.28)}
.phone img{display:block;width:100%;border-radius:8vw}
</style></head><body>
<svg class="track" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
 <circle cx="${W * (i % 2 ? 0.08 : 0.92)}" cy="${H * 0.56}" r="${W * 0.5}" fill="#F26B38" opacity="${fr.dark ? 0.22 : 0.16}"/><circle cx="${W * (i % 2 ? 0.95 : 0.05)}" cy="${H * 0.93}" r="${W * 0.3}" fill="#F26B38" opacity="${fr.dark ? 0.14 : 0.1}"/>
</svg>
<div class="top"><div class="ey">RUNCO</div><h1>${fr.h.slice(0, 1).map((l) => line(l, fr.dark)).join('')}<br>${fr.h.slice(1).map((l) => line(l, fr.dark)).join('')}</h1><p>${fr.s}</p></div>
<div class="phone"><img src="${b64(fr.img)}"></div>
</body></html>`;
(async () => {
  const b = await chromium.launch();
  const page = await b.newPage({ viewport: { width: W, height: H } });
  for (const [i, fr] of frames.entries()) {
    fs.writeFileSync(`${S}/f.html`, html(fr, i));
    await page.goto(`file://${S}/f.html`); await page.waitForTimeout(400);
    await page.screenshot({ path: `${S}/store/${tag}-${String(i + 1).padStart(2, '0')}.png` });
  }
  await b.close();
})();
