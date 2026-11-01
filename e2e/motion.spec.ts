import { expect, test } from '@playwright/test';
import { onboard, restoreSeed } from './helpers';

// UI/UX bagian 11 (G1): cincin Progres benar-benar bergerak saat layar terlihat.
test('cincin Progres beranimasi saat layar terlihat', async ({ page }) => {
  await onboard(page);
  const card = page.getByTestId('workout-card');
  test.skip(!(await card.isVisible()), 'Hari ini istirahat di plan ini');
  await card.getByTestId('start').click();
  await expect(page.getByTestId('timer-remaining')).toBeVisible({ timeout: 10_000 });
  await page.waitForTimeout(1500);
  await page.getByTestId('timer-end').click();
  await page.getByTestId('timer-confirm-yes').click();
  await page.getByTestId('finish-distance').fill('1,2');
  await page.getByTestId('rpe-6').click();
  await page.getByTestId('finish-save').click();
  // Latihan terakhir minggu itu membuka 2.5 dulu; tutup supaya Today terlihat.
  const week = await page
    .getByTestId('screen-week')
    .waitFor({ timeout: 4000 })
    .then(
      () => true,
      () => false,
    );
  if (week)
    await page
      .getByRole('button', { name: /Tutup|Close/ })
      .first()
      .click();

  // Cincin kepatuhan tumbuh dari 0 setiap tab Progres terlihat (bukan langsung penuh).
  await page.getByRole('tab', { name: 'Progres' }).click();
  const readRing = () =>
    page.evaluate(() => {
      const r = document.querySelectorAll('[role="progressbar"] svg rect')[1];
      return r ? Number((r.getAttribute('stroke-dasharray') ?? '0').split(' ')[0]) : -1;
    });
  const ring: number[] = [];
  for (let i = 0; i < 40; i++) {
    ring.push(await readRing());
    await page.waitForTimeout(50);
  }
  const full = Math.max(...ring);
  expect(full).toBeGreaterThan(0);
  expect(ring.some((v) => v >= 0 && v < full * 0.9)).toBe(true);
});

// Ukur nilai berubah-ubah selama animasi: fungsi pembaca dipanggil tiap 40 ms.
async function sample<T>(read: () => Promise<T>, n = 30, ms = 40): Promise<T[]> {
  const out: T[] = [];
  for (let i = 0; i < n; i++) {
    out.push(await read());
    await new Promise((r) => setTimeout(r, ms));
  }
  return out;
}

test('Today: lajur minggu muncul bergantian; Progres: batang tumbuh', async ({ page }) => {
  await restoreSeed(page);
  const lanes = await sample(() =>
    page.evaluate(() => {
      const el = document.querySelector('[data-testid="screen-today"] [aria-label="Min"]');
      const c = el?.children[0] as HTMLElement | undefined;
      return c ? Number(getComputedStyle(c).opacity) : 1;
    }),
  );
  // Lajur terakhir (Min) muncul paling akhir: pernah belum tampil penuh, lalu penuh.
  expect(Math.min(...lanes)).toBeLessThan(1);
  expect(lanes[lanes.length - 1]).toBe(1);
  // Lajur tetap selebar kolomnya setelah animasi (bug: pembungkus animasi menyempitkan lajur).
  const widths = await page.evaluate(() =>
    ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((d) => {
      const col = document.querySelector(`[data-testid="screen-today"] [aria-label="${d}"]`) as HTMLElement;
      const lane = col.children[0]!.children[0] as HTMLElement;
      return lane.getBoundingClientRect().width / col.getBoundingClientRect().width;
    }),
  );
  for (const w of widths) expect(w).toBeGreaterThan(0.95);

  await page.getByRole('tab', { name: 'Progres' }).click();
  const frames = await sample(
    () =>
      page.evaluate(() => {
        const c = [...document.querySelectorAll('[data-testid="screen-progress"] div')].find(
          (e) => /height: 96px/.test(e.getAttribute('style') || '') && e.children.length >= 2,
        );
        const last = c ? (c.children[c.children.length - 1]!.children[1] as HTMLElement) : null;
        const m = last && /matrix\([^,]+,[^,]+,[^,]+,\s*([^,]+),/.exec(getComputedStyle(last).transform);
        const line = document.querySelector('[data-testid="screen-progress"] polyline');
        return {
          scale: m ? Number(m[1]) : -1,
          dash: line ? Number(line.getAttribute('stroke-dashoffset') ?? 0) : -1,
        };
      }),
    40,
  );
  const scales = frames.map((f) => f.scale);
  const dashes = frames.map((f) => f.dash).filter((v) => v >= 0);
  expect(Math.max(...dashes)).toBeGreaterThan(1); // garis mulai tersembunyi
  expect(dashes[dashes.length - 1]).toBeCloseTo(0, 0); // lalu tergambar penuh
  expect(Math.min(...scales.filter((v) => v >= 0))).toBeLessThan(0.9);
  expect(scales[scales.length - 1]).toBeCloseTo(1, 1);
});

test('hitung mundur, pilihan RPE, dan sakelar bergerak halus', async ({ page }) => {
  await onboard(page);
  const card = page.getByTestId('workout-card');
  test.skip(!(await card.isVisible()), 'Hari ini istirahat di plan ini');
  await card.getByTestId('start').click();
  const sizes = await sample(
    () =>
      page.evaluate(() => {
        const n = document.querySelector('[data-testid="timer-countdown"]')?.children[1] as
          HTMLElement | undefined;
        return n ? n.getBoundingClientRect().height : 0;
      }),
    40,
    50,
  );
  const live = sizes.filter((v) => v > 0);
  expect(new Set(live.map((v) => Math.round(v))).size).toBeGreaterThan(2); // ukuran berubah = zoom berjalan

  await expect(page.getByTestId('timer-remaining')).toBeVisible({ timeout: 10_000 });
  await page.getByTestId('timer-end').click();
  await page.getByTestId('timer-confirm-yes').click();
  await page.getByTestId('finish-distance').fill('1,2');
  await page.getByTestId('rpe-6').click();
  const rpe = await sample(() =>
    page.evaluate(() => {
      const t = document.querySelector('[data-testid="rpe-6"]') as HTMLElement | null;
      const cs = t && getComputedStyle(t);
      const m = cs && /matrix\(\s*([^,]+),/.exec(cs.transform);
      return { scale: m ? Number(m[1]) : 1, bg: cs ? cs.backgroundColor : '' };
    }),
  );
  // Kotak tombolnya (bukan hanya angka) membesar melewati 1 lalu menetap, dan warnanya terisi bertahap.
  expect(Math.max(...rpe.map((r) => r.scale))).toBeGreaterThan(1.05);
  expect(rpe[rpe.length - 1]!.scale).toBeCloseTo(1, 1);
  expect(new Set(rpe.map((r) => r.bg)).size).toBeGreaterThan(2);

  await page.getByTestId('finish-save').click();
  const week = await page
    .getByTestId('screen-week')
    .waitFor({ timeout: 4000 })
    .then(
      () => true,
      () => false,
    );
  if (week)
    await page
      .getByRole('button', { name: /Tutup|Close/ })
      .first()
      .click();
  await page.getByRole('tab', { name: 'Profil' }).click();
  await page.getByTestId('row-privacy').click();
  const sw = page.getByTestId('analytics-switch');
  await sw.click();
  const knob = await sample(() =>
    sw.evaluate((el) => {
      const m = /matrix\([^,]+,[^,]+,[^,]+,[^,]+,\s*([^,]+),/.exec(
        getComputedStyle(el.children[0]!).transform,
      );
      return m ? Number(m[1]) : 0;
    }),
  );
  const lo = Math.min(...knob);
  const hi = Math.max(...knob);
  expect(hi).toBeGreaterThan(lo);
  expect(knob.some((v) => v > lo + 1 && v < hi - 1)).toBe(true); // ada posisi di tengah = bergeser, bukan loncat
});
