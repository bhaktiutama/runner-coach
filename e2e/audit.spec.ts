import { test, type Page } from '@playwright/test';
import { onboard } from './helpers';

// Screenshot audit visual (bukan assertion). SHOTS_DIR=<folder> pnpm test:e2e e2e/audit.spec.ts
const dir = process.env.SHOTS_DIR;
test.skip(!dir, 'SHOTS_DIR tidak diset');
const shot = (page: Page, name: string) => page.screenshot({ path: `${dir}/${name}.png`, fullPage: false });
const next = (page: Page, step: string) => page.getByTestId(`screen-${step}`).getByTestId('next').click();

test('audit onboarding', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('welcome-start').click();
  await page.getByTestId('goal-fitness').click();
  await shot(page, 'a-goal');
  await next(page, 'goal');
  await page.getByTestId('ability-mode').getByRole('tab', { name: 'Saya tidak tahu' }).click();
  await page.getByTestId('level-beginner').click();
  await shot(page, 'a-ability-level');
  await page.getByTestId('ability-mode').getByRole('tab', { name: 'Saya tahu waktunya' }).click();
  await page.getByTestId('screen-ability').getByTestId('time').fill('3230');
  await shot(page, 'a-ability-time');
  await next(page, 'ability');
  await page.getByTestId('longest-5').click();
  await shot(page, 'a-volume');
  await next(page, 'volume');
  for (const d of [1, 3]) await page.getByTestId(`wd-${d}`).click();
  await shot(page, 'a-days');
  await next(page, 'days');
  await page.getByTestId('screen-health').waitFor();
  await shot(page, 'a-health');
});

test('audit app', async ({ page }) => {
  await onboard(page);
  await shot(page, 'b-today');
  await page.getByTestId('manual-log').click();
  await page.getByTestId('screen-log').waitFor();
  await shot(page, 'b-log');
  await page.goto('/pause');
  await page.getByTestId('screen-pause').waitFor();
  await shot(page, 'b-pause');
  await page.goto('/privacy');
  await page.getByTestId('screen-privacy').waitFor();
  await shot(page, 'b-privacy');
  await page.goto('/profile');
  await page.getByTestId('screen-profile').waitFor();
  await shot(page, 'b-profile');
  await page.goto('/progress');
  await page.getByTestId('screen-progress').waitFor();
  await shot(page, 'b-progress');
});
