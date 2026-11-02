import { expect, test, type Page } from '@playwright/test';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  checkMove,
  engineEn,
  engineId,
  generatePlan,
  proposeAdjustments,
  RULES,
  type MovableWorkout,
  type PlanInput,
  type Rationale,
  type WorkoutType,
} from '../../packages/training-engine/src';
import { addDays, mondayOf, segments, totalSeconds, type AnyStep } from '../lib/calc';
import { chip, code, esc, page as htmlPage, table, type Status } from '../lib/html';
import { navFor, ROOT, runMeta, writeHtml, writeJson, writeSummary } from '../lib/output';
import { personas, type Scenario } from '../lib/scenarios';
import { matchRationale } from '../lib/textmatch';

// Lapisan 1: saran di app sama dengan keluaran engine (dokumen Plan Validity Testing, L1.1-L1.6).
// Setiap persona dijalankan lewat UI onboarding, plan diekspor lewat "Backup ke file", lalu
// dibandingkan dengan generatePlan() yang dijalankan ulang dari input di file backup.

type Check = { persona: string; test: string; status: Status; what: string; detail: string };
const results: Check[] = [];
let hardInfoNoted = false;
const add = (
  persona: string,
  testId: string,
  ok: boolean | 'info',
  what: string,
  detail = '',
  fail: Status = 'mayor',
) =>
  results.push({ persona, test: testId, status: ok === 'info' ? 'info' : ok ? 'pass' : fail, what, detail });

type Backup = { tables: Record<string, Record<string, unknown>[]> };
const ID = engineId as Record<string, string>;
const EN = engineEn as Record<string, string>;

const next = (page: Page, step: string) => page.getByTestId(`screen-${step}`).getByTestId('next').click();

async function onboard(page: Page, s: Scenario) {
  const i = s.input;
  const g = i.goal;
  await page.clock.install({ time: new Date(`${i.startDate}T08:00:00+07:00`) });
  await page.goto('/');
  await page.getByTestId('welcome-start').click();
  await page.getByTestId(`goal-${g.distance}`).click();
  await next(page, 'goal');
  if (g.distance !== 'fitness' && g.raceDate) {
    await expect(page.getByTestId('screen-race')).toBeVisible();
    for (let k = 0; k < 14 && !(await page.getByTestId(`day-${g.raceDate}`).isVisible()); k++)
      await page.getByRole('button', { name: 'Bulan berikutnya' }).click();
    await page.getByTestId(`day-${g.raceDate}`).click();
    await next(page, 'race');
  }
  await expect(page.getByTestId('screen-ability')).toBeVisible();
  if (g.baselineDistance && g.baselineTimeS) {
    await page.getByTestId(`base-${g.baselineDistance}`).click();
    const t = g.baselineTimeS;
    const digits =
      `${Math.floor(t / 3600)}${String(Math.floor((t % 3600) / 60)).padStart(2, '0')}${String(t % 60).padStart(2, '0')}`.replace(
        /^0+/,
        '',
      );
    await page.getByTestId('screen-ability').getByTestId('time').fill(digits);
  } else {
    await page.getByRole('tab', { name: 'Saya tidak tahu' }).click();
    await page.getByTestId(`level-${g.level}`).click();
  }
  await next(page, 'ability');
  const kmv = g.weeklyVolumeM / 1000;
  const chipName =
    kmv === 0
      ? 'Belum rutin'
      : kmv < 10
        ? '< 10 km'
        : kmv <= 20
          ? '10-20 km'
          : kmv <= 40
            ? '20-40 km'
            : '> 40 km';
  await page.getByRole('button', { name: chipName }).click();
  const chipKm = kmv === 0 ? 0 : kmv < 10 ? 6 : kmv <= 20 ? 15 : kmv <= 40 ? 30 : 45;
  for (let k = chipKm; k < kmv; k++) await page.getByRole('button', { name: 'Tambah' }).click();
  await page.getByTestId(`longest-${g.longestRunM / 1000}`).click();
  await next(page, 'volume');
  for (const d of i.availableDays) if (d !== i.longRunDay) await page.getByTestId(`wd-${d}`).click();
  if (i.longRunDay === 5) await page.getByRole('tab', { name: 'Sabtu' }).click();
  if (i.strength) await page.getByTestId('strength-choice').getByRole('tab', { name: 'Ya' }).click();
  await next(page, 'days');
  if (i.lightMode) await page.getByTestId('q1').getByRole('radio', { name: 'Ya' }).click();
  await page.getByTestId('disclaimer').click();
  await next(page, 'health');
  await expect(page.getByTestId('screen-preview')).toBeVisible();
}

async function rationaleTexts(page: Page): Promise<{ rule: string; text: string }[]> {
  const items = page.locator('[data-testid^="rationale-"]');
  const n = await items.count();
  const out: { rule: string; text: string }[] = [];
  for (let k = 0; k < n; k++) {
    const el = items.nth(k);
    out.push({
      rule: ((await el.getAttribute('data-testid')) ?? '').replace('rationale-', ''),
      text: await el.innerText(),
    });
  }
  return out;
}

async function backup(page: Page): Promise<Backup> {
  if (!(await page.getByRole('tab', { name: /Profil|Profile/ }).isVisible())) {
    await page.goto('/');
    await expect(page.getByTestId('screen-today')).toBeVisible();
  }
  await page.getByRole('tab', { name: /Profil|Profile/ }).click();
  await page.getByTestId('row-privacy').click();
  const dl = page.waitForEvent('download');
  await page.getByTestId('backup').click();
  const file = await dl;
  return JSON.parse(readFileSync((await file.path())!, 'utf8')) as Backup;
}

function inputFromBackup(b: Backup): PlanInput {
  const g = b.tables.goals!.find((x) => x.status === 'active') ?? b.tables.goals![0]!;
  const p = b.tables.plans![0]!;
  const params = JSON.parse(String(p.params)) as {
    available_days: number[];
    long_run_day: number;
    light_mode: boolean;
    strength?: boolean;
  };
  return {
    goal: {
      distance: g.distance as PlanInput['goal']['distance'],
      raceDate: (g.race_date as string | null) ?? null,
      baselineDistance: (g.baseline_distance as PlanInput['goal']['baselineDistance']) ?? null,
      baselineTimeS: (g.baseline_time_s as number | null) ?? null,
      level: (g.level as PlanInput['goal']['level']) ?? null,
      weeklyVolumeM: Number(g.weekly_volume_m),
      longestRunM: Number(g.longest_run_m),
    },
    availableDays: params.available_days as PlanInput['availableDays'],
    longRunDay: params.long_run_day as PlanInput['longRunDay'],
    lightMode: !!params.light_mode,
    startDate: String(p.start_date),
    strength: !!params.strength,
  };
}

const distName = (cat: Record<string, string>) => (c: string) => cat[`distance.${c}`] ?? c;
function checkTexts(
  persona: string,
  testId: string,
  where: string,
  shown: { rule: string; text: string }[],
  expected: Rationale[],
  lang: 'id' | 'en',
) {
  const cat = lang === 'id' ? ID : EN;
  let ok = 0;
  const bad: string[] = [];
  expected.forEach((r, k) => {
    const s = shown.filter((x) => x.rule === r.rule)[
      expected.slice(0, k).filter((x) => x.rule === r.rule).length
    ];
    const scoped = typeof r.values.scope === 'string' ? cat[`rule.${r.rule}.${r.values.scope}`] : undefined;
    const tpl = scoped ?? cat[`rule.${r.rule}`] ?? '';
    if (!s) return bad.push(`${r.rule}: tidak tampil`);
    const m = matchRationale(tpl, r.values, s.text, lang, distName(cat));
    const grade = RULES[r.rule as keyof typeof RULES]?.grade;
    const gradeOk = !grade || s.text.includes(cat[`grade.${grade}`] ?? '###');
    if (m.ok && gradeOk) ok++;
    else bad.push(`${r.rule}: ${m.reason || ''}${gradeOk ? '' : ' label tingkat bukti tidak sesuai'}`);
  });
  add(
    persona,
    testId,
    bad.length === 0,
    `${where}: ${ok} dari ${expected.length} teks saran sesuai template + values`,
    bad.join(' | '),
  );
}

const sameJson = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

function diffPlan(persona: string, b: Backup, expectedInput: PlanInput) {
  const input = inputFromBackup(b);
  const p = b.tables.plans![0]!;
  const params = JSON.parse(String(p.params)) as {
    engine_version: string;
    vdot: number;
    rationale: Rationale[];
  };
  // Input yang tersimpan sama dengan input persona (UI menangkap yang dimaksud).
  const inputDiff = (
    ['distance', 'raceDate', 'baselineDistance', 'baselineTimeS', 'weeklyVolumeM', 'longestRunM'] as const
  ).filter((k) => input.goal[k] !== expectedInput.goal[k]);
  if (expectedInput.goal.level && input.goal.level !== expectedInput.goal.level)
    inputDiff.push('level' as never);
  if (!sameJson([...input.availableDays].sort(), [...expectedInput.availableDays].sort()))
    inputDiff.push('availableDays' as never);
  if (input.longRunDay !== expectedInput.longRunDay) inputDiff.push('longRunDay' as never);
  if (input.lightMode !== expectedInput.lightMode) inputDiff.push('lightMode' as never);
  if (input.startDate !== expectedInput.startDate) inputDiff.push('startDate' as never);
  add(
    persona,
    'L1.1',
    inputDiff.length === 0,
    'Input yang disimpan app = input persona',
    inputDiff.length
      ? `beda: ${inputDiff.map((k) => `${k} app=${JSON.stringify((input.goal as never)[k] ?? (input as never)[k])}`).join(', ')}`
      : '',
  );

  const plan = generatePlan(input);
  const appW = (b.tables.planned_workouts ?? [])
    .filter((w) => w.type !== 'rest')
    .sort(
      (x, y) => String(x.date).localeCompare(String(y.date)) || String(x.type).localeCompare(String(y.type)),
    );
  const engW = plan.workouts
    .filter((w) => w.type !== 'rest')
    .sort((x, y) => x.date.localeCompare(y.date) || x.type.localeCompare(y.type));
  const diffs: string[] = [];
  if (appW.length !== engW.length) diffs.push(`jumlah latihan app ${appW.length}, engine ${engW.length}`);
  engW.forEach((e, k) => {
    const a = appW[k];
    if (!a) return;
    const f: string[] = [];
    if (a.date !== e.date) f.push('tanggal');
    if (a.type !== e.type) f.push('tipe');
    if (a.target_distance_m !== e.targetDistanceM)
      f.push(`jarak ${a.target_distance_m} vs ${e.targetDistanceM}`);
    if (a.target_duration_s !== e.targetDurationS)
      f.push(`durasi ${a.target_duration_s} vs ${e.targetDurationS}`);
    if (!sameJson(JSON.parse(String(a.steps)), e.steps)) f.push('steps');
    if (!sameJson(JSON.parse(String(a.rationale ?? '[]')), e.rationale)) f.push('rationale');
    if (f.length) diffs.push(`${e.date} ${e.type}: ${f.join(', ')}`);
  });
  if (params.engine_version !== plan.engineVersion)
    diffs.push(`engine_version app ${params.engine_version}, engine ${plan.engineVersion}`);
  if (params.vdot !== plan.vdot) diffs.push(`vdot app ${params.vdot}, engine ${plan.vdot}`);
  if (!sameJson(params.rationale, plan.rationale)) diffs.push('rationale tingkat plan beda');
  if (String(p.end_date) !== plan.endDate) diffs.push(`end_date app ${p.end_date}, engine ${plan.endDate}`);
  add(
    persona,
    'L1.1',
    diffs.length === 0,
    `Plan di app = generatePlan(): ${engW.length} latihan dibandingkan (tanggal, tipe, jarak, durasi, steps, rationale)`,
    diffs.slice(0, 6).join(' | ') + (diffs.length > 6 ? ` | +${diffs.length - 6} lainnya` : ''),
  );
  return { input, params, appW, plan };
}

async function checkDetail(page: Page, persona: string, w: Record<string, unknown>, lang: 'id' | 'en') {
  await page.goto(`/workout/${String(w.id)}`);
  await expect(page.getByTestId('screen-detail')).toBeVisible({ timeout: 15_000 });
  const txt = await page.getByTestId('screen-detail').innerText();
  const steps = JSON.parse(String(w.steps)) as AnyStep[];
  checkTexts(
    persona,
    'L1.2',
    `Layar 2.2 ${String(w.type)} ${String(w.date)}`,
    await rationaleTexts(page),
    JSON.parse(String(w.rationale)) as Rationale[],
    lang,
  );
  const mins = Math.round(totalSeconds(steps) / 60);
  const minsShown = [...txt.matchAll(/(\d+)\s*(menit|min)/g)].map((m) => Number(m[1]));
  // Tampilan 2.2 (lib/workoutView.ts): segmen tempo/interval = batas cepat zona; segmen utama easy/long/recovery = rentang;
  // pemanasan/pendinginan/jog pemulihan = nama zona. Yang diperiksa: angka yang memang dirancang tampil.
  // Lari-jalan ditampilkan sebagai dosis ("6 x (1:00 lari + 2:00 jalan)") tanpa pace: hanya durasi yang diperiksa.
  const segs = w.type === 'run_walk' ? [] : segments(steps).filter((s) => s.pace && !s.walk);
  const shownBounds = segs.flatMap((s) =>
    s.zone === 'tempo' || s.zone === 'interval'
      ? [s.pace!.min]
      : s.kind === 'work'
        ? [s.pace!.min, s.pace!.max]
        : [],
  );
  const paces = [...new Set(shownBounds)].map(
    (v) => `${Math.floor(v / 60)}:${String(v % 60).padStart(2, '0')}`,
  );
  const hardSeg = segs.find((s) => s.zone === 'tempo' || s.zone === 'interval');
  if (hardSeg && !hardInfoNoted) {
    hardInfoNoted = true;
    add(
      persona,
      'L1.3',
      'info',
      'Desain layar 2.2: sesi berat hanya menampilkan batas cepat zona pace',
      `contoh ${String(w.type)}: layar "${Math.floor(hardSeg.pace!.min / 60)}:${String(hardSeg.pace!.min % 60).padStart(2, '0')} /km", zona engine ${hardSeg.pace!.min}-${hardSeg.pace!.max} dtk/km. Pemanasan/pendinginan tanpa angka pace. Perlu dikonfirmasi pelatih: target di batas cepat bisa mendorong pelari ke ujung atas zona.`,
    );
  }
  const missing = paces.filter((p) => !txt.includes(p));
  const minsOk = minsShown.some((m) => Math.abs(m - mins) <= 1);
  add(
    persona,
    'L1.3',
    minsOk && missing.length === 0,
    `Layar 2.2 ${String(w.type)} ${String(w.date)}: durasi ${mins} mnt dan ${paces.length} batas pace tampil`,
    `${minsOk ? '' : `durasi di layar ${minsShown.join('/') || '-'}; `}${missing.length ? `pace tidak tampil: ${missing.join(', ')}. Teks layar: ${txt.replace(/\s+/g, ' ').slice(0, 400)}` : ''}`,
  );
}

const ps = personas();
for (const s of ps) {
  test(`${s.id} ${s.label}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await onboard(page, s);
    // Layar 1.8: buka semua alasan.
    const more = page.getByText(/Lihat semua \d+ alasan/);
    if (await more.isVisible()) await more.click();
    const preview = await rationaleTexts(page);
    await page.getByTestId('auth-skip').click();
    await expect(page.getByTestId('screen-today')).toBeVisible();
    const b = await backup(page);
    const { params, appW } = diffPlan(s.id, b, s.input);
    checkTexts(s.id, 'L1.2', 'Layar 1.8 Kenapa plan ini?', preview, params.rationale, 'id');

    // Layar 2.2 untuk long run, sesi kualitas dan easy/recovery pertama.
    const pick = (types: string[]) => appW.find((w) => types.includes(String(w.type)));
    const sample = [
      pick(['long']),
      pick(['tempo', 'interval']),
      pick(['easy', 'recovery', 'run_walk']),
    ].filter(Boolean) as Record<string, unknown>[];
    for (const w of sample) await checkDetail(page, s.id, w, 'id');

    if (s.id === 'P3') {
      // L1.5: pindah interval Rabu 2027-01-06 ke Sabtu 2027-01-09 (antara tempo Jumat dan long run Minggu).
      const iv = appW.find((w) => w.type === 'interval' && w.date === '2027-01-06');
      if (iv) {
        await page.goto(`/move/${String(iv.id)}`);
        await page.getByTestId('move-2027-01-09').click();
        const verdict = (await page.getByTestId('move-verdict').innerText()).trim();
        const mon = mondayOf('2027-01-06');
        const week = appW
          .filter((w) => String(w.date) >= mon && String(w.date) <= addDays(mon, 6))
          .map(
            (w) =>
              ({
                id: String(w.id),
                date: String(w.date),
                type: w.type as WorkoutType,
                steps: JSON.parse(String(w.steps)),
                status: 'scheduled' as const,
              }) satisfies MovableWorkout,
          );
        const eng = checkMove(
          week.find((w) => w.id === String(iv.id))!,
          '2027-01-09',
          week,
          9231,
        );
        const appIds = (await import('../../apps/app/src/i18n/id')).id as Record<string, string>;
        const want = appIds[`move.verdict.${eng.verdict}`] ?? '';
        add(
          s.id,
          'L1.5',
          verdict.includes(want.slice(0, 40)) && eng.verdict === 'hard_adjacent',
          'Layar 3.2: interval dipindah ke Sabtu (antara tempo dan long run)',
          `app: "${verdict}"; engine: ${eng.verdict}`,
          'kritis',
        );
      } else add(s.id, 'L1.5', false, 'Layar 3.2: interval 2027-01-06 tidak ditemukan', '');
    }

    if (s.id === 'P4') {
      // L1.6: reload dan ganti bahasa tidak mengubah plan; teks saran EN sesuai katalog EN.
      await page.reload();
      await page.goto('/');
      const b2 = await backup(page);
      add(
        s.id,
        'L1.6',
        sameJson(b2.tables.planned_workouts, b.tables.planned_workouts) &&
          sameJson(b2.tables.plans, b.tables.plans),
        'Reload: plan dan rationale tidak berubah',
        '',
      );
      await page.goto('/');
      await expect(page.getByTestId('screen-today')).toBeVisible();
      await page.getByRole('tab', { name: /Profil|Profile/ }).click();
      await page.getByTestId('row-language').click();
      await expect(page.getByTestId('screen-language')).toBeVisible();
      await page.getByTestId('lang-en-US').click();
      await page.waitForTimeout(500);
      const w = sample[0];
      if (w) await checkDetail(page, s.id, w, 'en');
      await page.goto('/');
      const b3 = await backup(page);
      add(
        s.id,
        'L1.6',
        sameJson(b3.tables.planned_workouts, b.tables.planned_workouts),
        'Ganti bahasa ke English: plan tidak berubah',
        '',
      );
    }
    add(
      s.id,
      'L1.1',
      errors.length === 0,
      'Tanpa error JavaScript di halaman',
      errors.slice(0, 3).join(' | '),
    );
  });
}

// L1.4: adaptasi. Data minggu 4 dari seed (plan buatan engine), RPE / status diubah, lalu dipulihkan lewat UI.
for (const v of [
  { id: 'AD-E17', label: 'RPE easy run 8 lalu 8 (Rabu dan Jumat minggu 4)', expect: ['E-17'] },
  { id: 'AD-E19', label: '2 latihan terlewat (Selasa dan Rabu minggu 4)', expect: ['E-19'] },
]) {
  test(`${v.id} ${v.label}`, async ({ page }) => {
    const seed = JSON.parse(
      readFileSync(join(ROOT, 'docs/prototypes/seed/seed-minggu-4.json'), 'utf8'),
    ) as Backup;
    const t = seed.tables;
    const wk4 = t.planned_workouts!.filter(
      (w) => String(w.date) >= '2026-10-26' && String(w.date) <= '2026-11-01',
    );
    if (v.id === 'AD-E17') {
      for (const date of ['2026-10-28', '2026-10-30']) {
        const w = wk4.find((x) => x.date === date)!;
        const a = t.activities!.find((x) => x.planned_workout_id === w.id)!;
        t.workout_feedback!.find((f) => f.activity_id === a.id)!.rpe = 8;
      }
    } else {
      for (const date of ['2026-10-27', '2026-10-28']) {
        const w = wk4.find((x) => x.date === date)!;
        w.status = 'skipped';
        const a = t.activities!.find((x) => x.planned_workout_id === w.id)!;
        t.activities = t.activities!.filter((x) => x !== a);
        t.workout_feedback = t.workout_feedback!.filter((f) => f.activity_id !== a.id);
      }
    }
    const file = join(mkdtempSync(join(tmpdir(), 'rc-val-')), `${v.id}.json`);
    writeFileSync(file, JSON.stringify(seed));
    await page.clock.install({ time: new Date('2026-11-01T19:00:00+07:00') });
    await page.goto('/');
    await page.getByText('Sudah punya akun? Masuk').click();
    await page.getByTestId('auth-skip').click();
    await page.getByText('Pulihkan dari file backup').click();
    const chooser = page.waitForEvent('filechooser');
    await page.getByTestId('restore').click();
    await (await chooser).setFiles(file);
    await page.getByTestId('restore-yes').click();
    await expect(page.getByTestId('screen-today')).toBeVisible();
    await page.goto('/week-summary');
    await expect(page.getByTestId('screen-week')).toBeVisible();
    await page.waitForTimeout(1500);
    const shown = (
      await page
        .locator('[data-testid^="proposal-"]')
        .evaluateAll((els) => els.map((e) => e.getAttribute('data-testid')))
    )
      .map((x) => String(x).replace('proposal-', ''))
      .sort();
    // Pembanding engine: data yang sama seperti yang dibaca app (minggu 4, minggu 5, semua feedback urut waktu).
    const act = new Map(t.activities!.map((a) => [a.id, a]));
    const pw = new Map(t.planned_workouts!.map((w) => [w.id, w]));
    const feedback = t
      .workout_feedback!.map((f) => {
        const a = act.get(f.activity_id)!;
        return {
          date: String(a.started_at),
          type: pw.get(a.planned_workout_id)!.type as WorkoutType,
          rpe: Number(f.rpe),
        };
      })
      .sort((x, y) => x.date.localeCompare(y.date));
    const toW = (w: Record<string, unknown>) => ({
      id: String(w.id),
      date: String(w.date),
      type: w.type as WorkoutType,
      steps: JSON.parse(String(w.steps)),
      status: w.status as 'scheduled',
    });
    const eng = proposeAdjustments({
      week: wk4.map(toW),
      nextWeek: t
        .planned_workouts!.filter((w) => String(w.date) >= '2026-11-02' && String(w.date) <= '2026-11-08')
        .map(toW),
      feedback,
      lastRunDate: feedback.at(-1)!.date.slice(0, 10),
      today: '2026-11-01',
    })
      .map((p) => p.rule)
      .sort();
    add(
      v.id,
      'L1.4',
      sameJson(shown, v.expect) && sameJson(eng, v.expect),
      `Layar 2.5: ${v.label}`,
      `app: ${shown.join(', ') || 'tidak ada usulan'}; engine: ${eng.join(', ') || 'tidak ada usulan'}; harapan TRD 4.3: ${v.expect.join(', ')}`,
    );
  });
}

test.afterAll(() => {
  const meta = runMeta();
  const byPersona = [...new Set(results.map((r) => r.persona))];
  const worst = (rs: Check[]): Status =>
    rs.some((r) => r.status === 'kritis')
      ? 'kritis'
      : rs.some((r) => r.status === 'mayor')
        ? 'mayor'
        : 'pass';
  const failed = results.filter((r) => r.status === 'kritis' || r.status === 'mayor');
  const overall: Status = results.length === 0 ? 'skip' : worst(results);
  const tests = ['L1.1', 'L1.2', 'L1.3', 'L1.4', 'L1.5', 'L1.6'];
  const titles: Record<string, string> = {
    'L1.1': 'Plan di app = engine',
    'L1.2': 'Teks saran = template + values',
    'L1.3': 'Angka di layar = steps',
    'L1.4': 'Usulan adaptasi = engine',
    'L1.5': 'Cek pindah latihan = engine',
    'L1.6': 'Tanpa perubahan diam-diam',
  };
  const matrix = byPersona.map((p) => [
    code(p),
    esc(ps.find((x) => x.id === p)?.label ?? results.find((r) => r.persona === p)?.what ?? ''),
    ...tests.map((t) => {
      const rs = results.filter((r) => r.persona === p && r.test === t);
      if (!rs.length) return '<span class="muted">-</span>';
      const ok = rs.filter((r) => r.status === 'pass').length;
      return `${chip(worst(rs), `${ok}/${rs.length}`)}`;
    }),
  ]);
  const html = htmlPage({
    title: 'Validasi Lapisan 1',
    eyebrow: `Lapisan 1 · engine ${meta.engineVersion}`,
    heading: 'Saran di app sama dengan engine?',
    lead: `Setiap persona golden diisi lewat layar onboarding asli (build web, Playwright), plan diekspor lewat "Backup ke file", lalu dibandingkan dengan <code>generatePlan()</code> yang dijalankan ulang dari input di file backup. Teks saran di layar 1.8 dan 2.2 dicocokkan dengan template katalog + angka di rationale tanpa memakai fungsi format app.`,
    meta: [
      ['Versi engine', meta.engineVersion],
      ['Commit', meta.commit],
      ['Dijalankan', meta.generatedAt],
      ['Build', 'apps/app/dist (EXPO_PUBLIC_E2E=1)'],
    ],
    verdict: {
      status: overall,
      text:
        overall === 'pass'
          ? `Semua ${results.length} pemeriksaan lulus: app menampilkan persis keluaran engine.`
          : `${failed.length} dari ${results.length} pemeriksaan gagal. Rincian di bawah.`,
    },
    tiles: [
      { label: 'Persona dan skenario', value: `${byPersona.length}` },
      { label: 'Pemeriksaan', value: `${results.length}` },
      { label: 'Gagal', value: `${failed.length}`, status: failed.length ? worst(failed) : 'pass' },
      {
        label: 'Latihan dibandingkan',
        value: results
          .filter((r) => r.what.startsWith('Plan di app'))
          .reduce((a, r) => a + Number(/: (\d+) latihan/.exec(r.what)?.[1] ?? 0), 0)
          .toLocaleString('id-ID'),
      },
    ],
    nav: navFor('lapisan-1.html'),
    sections: [
      {
        id: 'matriks',
        title: 'Hasil per persona',
        intro: `Angka = pemeriksaan lulus / jumlah pemeriksaan. ${tests.map((t) => `${code(t)} ${esc(titles[t]!)}`).join(' · ')}.`,
        html: table(['Kode', 'Persona / skenario', ...tests], matrix),
      },
      {
        id: 'gagal',
        title: 'Pemeriksaan yang gagal',
        html: failed.length
          ? table(
              ['Persona', 'Uji', 'Pemeriksaan', 'Rincian', 'Status'],
              failed.map((r) => [code(r.persona), code(r.test), esc(r.what), esc(r.detail), chip(r.status)]),
            )
          : '<p class="muted">Tidak ada.</p>',
      },
      {
        id: 'semua',
        title: 'Semua pemeriksaan',
        html: table(
          ['Persona', 'Uji', 'Pemeriksaan', 'Rincian', 'Status'],
          results.map((r) => [
            code(r.persona),
            code(r.test),
            esc(r.what),
            esc(r.detail) || '<span class="muted">-</span>',
            chip(r.status),
          ]),
        ),
      },
    ],
  });
  writeHtml('lapisan-1.html', html);
  writeJson('lapisan-1.json', { meta, results });
  const passed = results.filter((r) => r.status === 'pass').length;
  const notes = results.filter((r) => r.status === 'info').length;
  writeSummary({
    layer: 'lapisan-1',
    title: 'Lapisan 1: app = engine',
    file: 'lapisan-1.html',
    status: overall,
    headline: `${passed} pemeriksaan lulus, ${failed.length} gagal, ${notes} catatan desain, pada ${byPersona.length} persona/skenario.`,
    counts: [
      { label: 'Pemeriksaan lulus', value: `${passed} / ${results.length - notes}` },
      { label: 'Gagal', value: `${failed.length}` },
      { label: 'Catatan desain', value: `${notes}` },
    ],
    meta,
  });
});
