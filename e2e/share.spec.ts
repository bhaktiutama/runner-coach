import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { restoreSeed } from './helpers';

test.use({ actionTimeout: 10_000 });

// F-29 Bagikan (10-SHARE bagian 8): kartu 1080 x 1920 dibuat di HP, gratis untuk semua, tanpa request
// ke luar, tanpa RPE / tag / catatan.

function pngSize(file: string) {
  const b = readFileSync(file);
  expect(b.subarray(1, 4).toString()).toBe('PNG');
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}

async function download(page: Page) {
  await expect(page.getByTestId('share-download')).toBeEnabled({ timeout: 15_000 });
  const dl = page.waitForEvent('download');
  await page.getByTestId('share-download').click();
  const d = await dl;
  return { name: d.suggestedFilename(), path: (await d.path())! };
}

test('latihan selesai (3.4) -> 2.7 -> PNG 1080 x 1920, tanpa request ke luar', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await restoreSeed(page);
  const external: string[] = [];
  page.on('request', (r) => {
    const u = new URL(r.url());
    if (!['localhost', '127.0.0.1'].includes(u.hostname) && u.protocol.startsWith('http'))
      external.push(u.host);
  });
  await page.getByRole('tab', { name: 'Progres' }).click();
  await page.locator('[data-testid^="activity-"]').first().click();
  await expect(page.getByTestId('screen-activity')).toBeVisible();
  await page.getByTestId('share-open').click();
  await expect(page.getByTestId('screen-share')).toBeVisible();
  const preview = page.getByTestId('share-preview');
  await expect(preview).toContainText('LATIHAN SELESAI');
  await expect(preview).toContainText('Run Coach');
  for (const s of ['RPE', 'Nyeri', 'Kurang tidur', 'Panas']) await expect(preview).not.toContainText(s);
  // Pace bisa disembunyikan (lari dengan jarak).
  if (await page.getByTestId('share-pace').count()) {
    await expect(preview).toContainText('Pace');
    await page.getByTestId('share-pace').click();
    await expect(preview).not.toContainText('Pace');
  }
  const f = await download(page);
  expect(f.name).toMatch(/^run-coach-activity-\d{4}-\d{2}-\d{2}\.png$/);
  expect(pngSize(f.path)).toEqual({ w: 1080, h: 1920 });
  await expect(page.getByTestId('share-note')).toContainText('Gambar diunduh');
  expect(external).toEqual([]);
  expect(errors).toEqual([]);
});

test('ringkasan minggu (2.5), plan (3.1) dan pencapaian (3.3) bisa dibagikan', async ({ page }) => {
  await restoreSeed(page, 'docs/prototypes/seed/seed-minggu-4-tuntas.json');
  // 2.5: tombol "Bagikan kartu ringkasan" (wireframe WeekDone).
  await page.getByRole('tab', { name: 'Progres' }).click();
  await page.getByTestId('open-week-summary').click();
  await page.getByTestId('screen-week').getByTestId('share-open').click();
  await expect(page.getByTestId('share-preview')).toContainText(/MINGGU \d+/);
  expect(pngSize((await download(page)).path)).toEqual({ w: 1080, h: 1920 });
  // 3.1: plan.
  await page.goto('/plan');
  await page.getByTestId('screen-plan').getByTestId('share-open').click();
  await expect(page.getByTestId('share-preview')).toContainText('PLAN LATIHANKU');
  await expect(page.getByTestId('share-go')).toBeEnabled({ timeout: 15_000 });
  // 3.3: badge yang sudah didapat.
  await page.goto('/progress');
  const earned = page.locator('[data-testid$="-earned"]');
  if (await earned.count()) {
    await earned.first().click();
    await expect(page.getByTestId('share-preview')).toContainText('PENCAPAIAN BARU');
  }
});

test('Premium tidak dibutuhkan untuk berbagi', async ({ page }) => {
  await restoreSeed(page);
  await page.goto('/share?kind=plan');
  await expect(page.getByTestId('screen-share')).toBeVisible();
  await expect(page.getByTestId('share-go')).toBeEnabled({ timeout: 15_000 });
  await expect(page.getByText('Buka dengan Premium')).toHaveCount(0);
});
