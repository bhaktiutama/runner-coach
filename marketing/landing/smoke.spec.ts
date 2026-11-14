import { expect, test, type Page } from '@playwright/test';

// The landing loads clean on a phone and a desktop, sends nothing to third parties,
// never scrolls sideways, and both store links point at the stores.
const SIZES = [
  { name: 'phone', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 900 },
];

const watch = (page: Page) => {
  const problems: string[] = [];
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') problems.push(`console: ${m.text()}`);
  });
  page.on('request', (r) => {
    const u = new URL(r.url());
    if (u.hostname !== 'localhost' && u.protocol !== 'data:' && u.protocol !== 'blob:')
      problems.push(`external: ${r.url()}`);
  });
  return problems;
};

for (const lang of ['', 'id/']) {
  for (const s of SIZES) {
    test(`${lang || 'en/'} ${s.name}: loads, scrolls to the finish, nothing external`, async ({ page }) => {
      await page.setViewportSize({ width: s.width, height: s.height });
      const problems = watch(page);
      await page.goto(`/${lang}`);
      await expect(page.locator('html')).toHaveAttribute('data-page-ready', '');
      await expect(page.locator('h1')).toBeVisible();
      for (const store of ['play', 'ios']) {
        await expect(page.locator(`[data-store="${store}"]`).first()).toHaveAttribute(
          'href',
          /^https:\/\/(play\.google\.com|apps\.apple\.com)\//,
        );
      }
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < height; y += s.height) {
        await page.evaluate((top) => window.scrollTo(0, top), y);
        await page.waitForTimeout(120);
      }
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await expect(page.locator('[data-res="splits"] li')).toHaveCount(5);
      const sideways = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(sideways).toBeLessThanOrEqual(0);
      expect(problems).toEqual([]);
    });
  }
}

test('reduced motion: content visible, KM 1 falls back to the chart', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const problems = watch(page);
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-plan', 'flat');
  await expect(page.locator('#strength-h')).toBeVisible();
  await expect(page.locator('[data-flip="rep"]')).toHaveText('10');
  expect(problems).toEqual([]);
  await ctx.close();
});
