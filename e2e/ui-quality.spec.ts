import { expect, test, type Page } from '@playwright/test';
import { next, onboard } from './helpers';

// Cek kualitas UI/UX otomatis (struktural, tanpa library tambahan), dijalankan lintas
// ukuran layar dan tema terang/gelap. Aturan mengacu ke docs/specs/04-UI-UX.md:
//  - tidak ada scroll horizontal (konten tidak terpotong di layar sempit)
//  - target sentuh min 44 px (hint (i), tombol bulat, tab)
//  - tidak ada error JS / console.error saat layar dibuka
//  - tombol dan tab punya nama aksesibel
// Lantai WCAG 2.2 SC 2.5.8 (AA) = 24 px. Target 44 px di spec dicapai lewat hitSlop di native
// (tidak terlihat di DOM web), jadi yang diperiksa di sini hanya ukuran kotak yang tampil.
// Hint (i) 18 px memakai hitSlop sehingga dikecualikan.
const MIN_TARGET = 24;
const HITSLOP_PREFIX = 'hint-';
// Temuan nyata yang belum diperbaiki (tautan teks 16-20 px di preview 1.8). Hapus dari daftar
// setelah dibesarkan; jangan menambah entri baru tanpa alasan.
const KNOWN = ['Lihat sumber', 'Kenapa plan ini?'];

const VIEWPORTS = [
  { name: 'hp-kecil', width: 360, height: 640 },
  { name: 'hp-standar', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
] as const;
const SCHEMES = ['light', 'dark'] as const;

type Problem = string;

async function auditPage(page: Page, label: string): Promise<Problem[]> {
  return page.evaluate(
    ({ label, min, skip, known }) => {
      const out: string[] = [];
      const root = document.documentElement;
      if (root.scrollWidth > root.clientWidth + 1)
        out.push(`${label}: scroll horizontal (scrollWidth ${root.scrollWidth} > ${root.clientWidth})`);

      const visible = (el: Element) => {
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none';
      };
      const nameOf = (el: Element) =>
        el.getAttribute('data-testid') ||
        el.getAttribute('aria-label') ||
        (el.textContent ?? '').trim().slice(0, 30) ||
        el.tagName;

      const targets = document.querySelectorAll(
        '[role="button"], [role="tab"], [role="link"], [role="switch"], [role="radio"], [role="checkbox"], button, a[href]',
      );
      targets.forEach((el) => {
        if (!visible(el)) return;
        if ((el.getAttribute('data-testid') ?? '').startsWith(skip)) return;
        if (known.includes((el.textContent ?? '').trim())) return;
        const r = el.getBoundingClientRect();
        // Hanya yang berada di dalam layar (bukan konten yang tergulir keluar).
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        if (r.height + 0.5 < min || r.width + 0.5 < min)
          out.push(
            `${label}: target sentuh ${Math.round(r.width)}x${Math.round(r.height)} < ${min} -> "${nameOf(el)}"`,
          );
        const accessible =
          el.getAttribute('aria-label') ||
          el.getAttribute('aria-labelledby') ||
          (el.textContent ?? '').trim() ||
          el.querySelector('img[alt]:not([alt=""])');
        if (!accessible) out.push(`${label}: tanpa nama aksesibel -> ${nameOf(el)}`);
      });
      return out;
    },
    { label, min: MIN_TARGET, skip: HITSLOP_PREFIX, known: KNOWN },
  );
}

for (const vp of VIEWPORTS) {
  for (const scheme of SCHEMES) {
    test.describe(`${vp.name} ${vp.width}x${vp.height} ${scheme}`, () => {
      test.use({ viewport: { width: vp.width, height: vp.height }, colorScheme: scheme });

      test('onboarding: tiap langkah rapi', async ({ page }) => {
        test.setTimeout(120_000);
        const errors: string[] = [];
        const problems: Problem[] = [];
        page.on('pageerror', (e) => errors.push(e.message));
        page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
        const check = async (id: string) => {
          await expect(page.getByTestId(id)).toBeVisible();
          problems.push(...(await auditPage(page, id)));
        };

        await page.goto('/');
        await check('screen-welcome');
        await page.getByTestId('welcome-start').click();
        await page.getByTestId('goal-10k').click();
        await check('screen-goal');
        await next(page, 'goal');
        for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Bulan berikutnya' }).click();
        await page.locator('[data-testid^="day-"]').nth(10).click();
        await check('screen-race');
        await next(page, 'race');
        await page.getByTestId('screen-ability').getByTestId('time').fill('3230');
        await check('screen-ability');
        await next(page, 'ability');
        await page.getByRole('button', { name: '10-20 km' }).click();
        await page.getByTestId('longest-7').click();
        await check('screen-volume');
        await next(page, 'volume');
        for (const d of [0, 1, 2, 3, 4]) await page.getByTestId(`wd-${d}`).click();
        await check('screen-days');
        await next(page, 'days');
        await page.getByTestId('disclaimer').click();
        await check('screen-health');
        await next(page, 'health');
        await check('screen-preview');

        expect(problems, problems.join('\n')).toEqual([]);
        expect(errors).toEqual([]);
      });

      test('app: tab dan layar sekunder rapi', async ({ page }) => {
        test.setTimeout(120_000);
        const errors: string[] = [];
        const problems: Problem[] = [];
        page.on('pageerror', (e) => errors.push(e.message));
        page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
        await onboard(page);

        const check = async (id: string) => {
          await expect(page.getByTestId(id)).toBeVisible();
          problems.push(...(await auditPage(page, id)));
        };

        await check('screen-today');
        for (const [tab, id] of [
          ['Plan', 'screen-plan'],
          ['Progres', 'screen-progress'],
          ['Profil', 'screen-profile'],
        ] as const) {
          await page.getByRole('tab', { name: tab }).click();
          await check(id);
        }
        for (const [path, id] of [
          ['/log', 'screen-log'],
          ['/pause', 'screen-pause'],
          ['/privacy', 'screen-privacy'],
          ['/help', 'screen-help'],
          ['/language', 'screen-language'],
          ['/premium', 'screen-premium'],
        ] as const) {
          await page.goto(path);
          await check(id);
        }

        expect(problems, problems.join('\n')).toEqual([]);
        expect(errors).toEqual([]);
      });
    });
  }
}
