// Rekam frame layar app (build web EN, data contoh) untuk video. Jalankan dengan Playwright global.
// node scripts/capture.cjs <seedDir> <outDir>   (seedDir berisi seed-tempo.json)
const { chromium } = require('playwright');
const SEED = process.argv[2],
  OUT = process.argv[3];
const fs = require('fs');
fs.mkdirSync(OUT, { recursive: true });
const hideWeb = (p) =>
  p
    .getByText('On the web, cues only play')
    .evaluateAll((els) => els.forEach((e) => (e.style.visibility = 'hidden')))
    .catch(() => {});
async function mk(b) {
  const ctx = await b.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    locale: 'en-US',
    colorScheme: 'light',
    timezoneId: 'Asia/Jakarta',
  });
  const page = await ctx.newPage();
  await page.clock.install({ time: new Date('2026-11-04T06:30:00+07:00') });
  await page.clock.resume();
  page.shot = async (n, o = {}) => {
    await hideWeb(page);
    await page.screenshot({ path: `${OUT}/${n}.png`, ...o });
    console.log('ok', n);
  };
  return page;
}
const next = (p, s) => p.getByTestId(`screen-${s}`).getByTestId('next').click();
(async () => {
  const b = await chromium.launch();
  {
    // seed: timer sequence + full-page progress
    const page = await mk(b);
    await page.goto('http://localhost:8081/');
    await page.getByText('Have an account? Sign in').click();
    await page.getByTestId('auth-skip').click();
    await page.getByText('Restore from backup file').click();
    const ch = page.waitForEvent('filechooser');
    await page.getByTestId('restore').click();
    await (await ch).setFiles(`${SEED}/seed-tempo.json`);
    await page.getByTestId('restore-yes').click();
    await page.getByTestId('screen-today').waitFor();
    await page.waitForTimeout(1200);
    await page.shot('today');
    await page.getByTestId('workout-card').getByTestId('start').click();
    await page.getByTestId('screen-timer').waitFor();
    for (let i = 0; i < 8; i++) {
      await page.waitForTimeout(1500);
      const seg =
        (await page
          .getByTestId('timer-segment')
          .textContent()
          .catch(() => '')) || '';
      if (/3 of 4/.test(seg)) break;
      for (const id of ['drill-skip', 'timer-skip']) {
        const l = page.getByTestId(id);
        if (await l.isVisible().catch(() => false)) {
          await l.click();
          break;
        }
      }
    }
    await page.waitForTimeout(1200);
    for (let i = 0; i < 12; i++) {
      const t0 = Date.now();
      await page.shot(`timer-${String(i).padStart(2, '0')}`);
      await page.waitForTimeout(Math.max(0, 1000 - (Date.now() - t0)));
    }
    await page.getByTestId('timer-end').click();
    await page.getByTestId('timer-confirm-yes').click();
    await page.goto('http://localhost:8081/progress');
    await page.getByTestId('screen-progress').waitFor();
    await page.waitForTimeout(1500);
    await page.shot('progress-full', { fullPage: true });
    await page.goto('http://localhost:8081/privacy');
    await page.waitForTimeout(1500);
    await page.shot('privacy');
  }
  {
    // onboarding + strength sequence
    const page = await mk(b);
    await page.goto('http://localhost:8081/');
    await page.getByTestId('screen-welcome').waitFor();
    await page.waitForTimeout(1200);
    await page.shot('onb-welcome');
    await page.getByTestId('welcome-start').click();
    await page.getByTestId('goal-hm').click();
    await page.waitForTimeout(500);
    await page.shot('onb-goal');
    await next(page, 'goal');
    for (let i = 0; i < 4; i++) await page.getByRole('button', { name: 'Next month' }).click();
    await page.locator('[data-testid^="day-"]').nth(14).click();
    await page.waitForTimeout(400);
    await page.shot('onb-race');
    await next(page, 'race');
    await page.getByTestId('screen-ability').getByTestId('time').fill('3230');
    await next(page, 'ability');
    await page.getByRole('button', { name: '10-20 km' }).click();
    await page.getByTestId('longest-7').click();
    await next(page, 'volume');
    for (const d of [1, 3, 5, 6]) await page.getByTestId(`wd-${d}`).click();
    await page.getByTestId('strength-choice').getByRole('tab', { name: 'Yes' }).click();
    await page.waitForTimeout(400);
    await page.shot('onb-days');
    await next(page, 'days');
    await page.getByTestId('disclaimer').click();
    await next(page, 'health');
    await page.getByTestId('screen-preview').waitFor();
    await page.waitForTimeout(1500);
    await page.shot('onb-preview-full', { fullPage: true });
    await page.getByTestId('auth-skip').click();
    await page.getByTestId('screen-today').waitFor();
    await page.goto('http://localhost:8081/plan');
    await page.getByTestId('screen-plan').waitFor();
    await page
      .getByText(/Strength/)
      .first()
      .click();
    await page.getByTestId('screen-detail').getByTestId('start').click();
    await page.getByTestId('timer-exercise').waitFor({ timeout: 20000 });
    await page.waitForTimeout(2500);
    for (let i = 0; i < 10; i++) {
      const t0 = Date.now();
      await page.shot(`strength-${String(i).padStart(2, '0')}`);
      await page.waitForTimeout(Math.max(0, 400 - (Date.now() - t0)));
    }
  }
  await b.close();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
