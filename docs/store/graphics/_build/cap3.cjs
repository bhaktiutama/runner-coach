const { chromium } = require('playwright');
const S = process.argv[2], scheme = process.argv[3] || 'light', only = process.argv[4] || 'all';
const hideWeb = (p) => p.getByText('On the web, cues only play').evaluateAll(els => els.forEach(e => e.style.visibility = 'hidden')).catch(() => {});
async function mk(b) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, locale: 'en-US', colorScheme: scheme, timezoneId: 'Asia/Jakarta' });
  const page = await ctx.newPage();
  await page.clock.install({ time: new Date('2026-11-04T06:30:00+07:00') });
  await page.clock.resume();
  page.shot = async (n) => { await page.waitForTimeout(1200); await hideWeb(page); await page.screenshot({ path: `${S}/shots/${scheme}-${n}.png` }); console.log('ok', n); };
  return page;
}
const next = (p, s) => p.getByTestId(`screen-${s}`).getByTestId('next').click();
(async () => {
  const b = await chromium.launch();
  if (only === 'all' || only === 'seed') {
    const page = await mk(b);
    await page.goto('http://localhost:8081/');
    await page.getByText('Have an account? Sign in').click();
    await page.getByTestId('auth-skip').click();
    await page.getByText('Restore from backup file').click();
    const ch = page.waitForEvent('filechooser');
    await page.getByTestId('restore').click();
    await (await ch).setFiles(`${S}/seed-tempo.json`);
    await page.getByTestId('restore-yes').click();
    await page.getByTestId('screen-today').waitFor();
    await page.shot('today');
    await page.getByTestId('workout-card').getByTestId('start').click();
    await page.getByTestId('screen-timer').waitFor();
    for (let i = 0; i < 8; i++) {
      await page.waitForTimeout(1500);
      const seg = (await page.getByTestId('timer-segment').textContent().catch(() => '')) || '';
      if (/3 of 4/.test(seg)) break;
      for (const id of ['drill-skip', 'timer-skip']) { const l = page.getByTestId(id); if (await l.isVisible().catch(() => false)) { await l.click(); break; } }
    }
    await page.waitForTimeout(6000);
    await page.shot('timer');
    await page.getByTestId('timer-end').click(); await page.getByTestId('timer-confirm-yes').click();
    await page.goto('http://localhost:8081/plan'); await page.getByTestId('screen-plan').waitFor();
    await page.shot('plan');
    await page.goto('http://localhost:8081/progress'); await page.getByTestId('screen-progress').waitFor();
    await page.shot('progress');
    await page.getByTestId('open-week-summary').click(); await page.getByTestId('screen-week').waitFor();
    await page.shot('week');
    await page.goto('http://localhost:8081/privacy'); await page.waitForTimeout(1500);
    await page.shot('privacy');
  }
  if (only === 'all' || only === 'onb') {
    const page = await mk(b);
    await page.goto('http://localhost:8081/');
    await page.getByTestId('screen-welcome').waitFor(); await page.shot('welcome');
    await page.getByTestId('welcome-start').click();
    await page.getByTestId('goal-hm').click().catch(async () => page.getByTestId('goal-10k').click());
    await page.shot('goal');
    await next(page, 'goal');
    for (let i = 0; i < 4; i++) await page.getByRole('button', { name: 'Next month' }).click();
    await page.locator('[data-testid^="day-"]').nth(14).click();
    await next(page, 'race');
    await page.getByTestId('screen-ability').getByTestId('time').fill('3230');
    await next(page, 'ability');
    await page.getByRole('button', { name: '10-20 km' }).click();
    await page.getByTestId('longest-7').click();
    await next(page, 'volume');
    for (const d of [1, 3, 5, 6]) await page.getByTestId(`wd-${d}`).click();
    await page.getByTestId('strength-choice').getByRole('tab', { name: 'Yes' }).click();
    await next(page, 'days');
    await page.getByTestId('disclaimer').click();
    await next(page, 'health');
    await page.getByTestId('screen-preview').waitFor();
    await page.shot('preview');
    await page.getByTestId('auth-skip').click();
    await page.getByTestId('screen-today').waitFor();
    await page.goto('http://localhost:8081/plan'); await page.getByTestId('screen-plan').waitFor();
    await page.getByText(/Strength/).first().click();
    await page.getByTestId('screen-detail').waitFor();
    await page.shot('strength-detail');
    await page.getByTestId('screen-detail').getByTestId('start').click();
    await page.getByTestId('timer-exercise').waitFor({ timeout: 20000 });
    await page.waitForTimeout(4000);
    await page.shot('strength-timer');
  }
  await b.close();
})().catch(e => { console.error(e.message); process.exit(1); });
