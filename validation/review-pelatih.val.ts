import { expect, test } from 'vitest';
import { engineEn, engineId, generatePlan, type GeneratedWorkout } from '../packages/training-engine/src';
import {
  daysBetween,
  HARD_TYPES,
  isRun,
  km,
  mmss,
  runDistance,
  segments,
  totalSeconds,
  WEEKDAY_ID,
  weekdayOf,
  type AnyStep,
} from './lib/calc';
import { chip, code, esc, page, table } from './lib/html';
import { CHECKS, newTally, validatePlan } from './lib/oracle';
import { navFor, runMeta, writeHtml, writeJson, writeSummary } from './lib/output';
import { describeInput, personas } from './lib/scenarios';

// L3.6: paket review pelatih (D6). Plan 10 persona golden disajikan per minggu dalam bahasa pelatih,
// dengan catatan validator, untuk dinilai memakai formulir di docs/engine-review.html.

const pace = (p?: { min: number; max: number } | null) => (p ? `${mmss(p.min)}-${mmss(p.max)}/km` : '');
const min = (s: number) => `${Math.round(s / 60)} mnt`;

function describeQuality(w: GeneratedWorkout): string {
  const st = w.steps as AnyStep[];
  const segs = segments(st);
  if (w.type === 'tempo') {
    const work = segs.filter((s) => s.zone === 'tempo');
    return `Tempo ${min(work.reduce((a, s) => a + s.durationS, 0))} @ ${pace(work[0]?.pace)}`;
  }
  if (w.type === 'interval') {
    const rep = st.find((s) => s.kind === 'repeat');
    const work = rep?.steps?.find((s) => s.kind === 'work');
    return `Interval ${rep?.times ?? '?'} x ${work?.distance_m ?? '?'} m @ ${pace(work?.pace_s_per_km)}`;
  }
  return w.type;
}

test('Paket review pelatih (L3.6)', () => {
  const meta = runMeta();
  const catalogs = { id: engineId as Record<string, string>, en: engineEn as Record<string, string> };
  const out: { id: string; label: string; weeks: unknown[] }[] = [];
  const sections = personas().map((p) => {
    const plan = generatePlan(p.input);
    const tally = newTally();
    validatePlan(p.input, plan, tally, { scenario: p.id, catalogs });
    const fails = CHECKS.flatMap((c) =>
      tally[c.id]!.failures.filter((f) => f.scenario === p.id).map((f) => ({ ...f, sev: c.severity })),
    );
    const runs = plan.workouts.filter((w) => isRun(w.type));
    const race = p.input.goal.distance === 'fitness' ? null : p.input.goal.raceDate;
    const weekRows = plan.weeks.map((wk) => {
      const ws = runs.filter((w) => w.weekIndex === wk.weekIndex);
      const long = ws.find((w) => w.type === 'long');
      const quality = ws.filter((w) => HARD_TYPES.has(w.type));
      const other = ws.filter((w) => w.type !== 'long' && !HARD_TYPES.has(w.type));
      const otherMin = other.map((w) => Math.round(totalSeconds(w.steps as AnyStep[]) / 60));
      const types = [...new Set(other.map((w) => w.type))].join(', ');
      const end = new Date(Date.parse(`${wk.startDate}T00:00:00Z`) + 6 * 864e5).toISOString().slice(0, 10);
      const flags = fails.filter((f) => f.date && f.date >= wk.startDate && f.date <= end);
      const visible = ws.reduce((a, w) => a + runDistance(w.steps as AnyStep[]), 0);
      return {
        week: wk.weekIndex,
        cells: [
          `${wk.weekIndex}`,
          `${esc(wk.phase)}${wk.cutback ? ' <span class="sub">cutback</span>' : ''}`,
          esc(wk.startDate),
          `${km(visible, 1)}${Math.abs(visible - wk.volumeM) > 50 ? `<span class="sub">hitungan engine ${km(wk.volumeM, 1)}</span>` : ''}`,
          long
            ? `${km(runDistance(long.steps as AnyStep[]), 1)} <span class="sub">${min(totalSeconds(long.steps as AnyStep[]))}, ${WEEKDAY_ID[weekdayOf(long.date)]}</span>`
            : '<span class="muted">-</span>',
          quality.length
            ? quality
                .map(
                  (q) =>
                    `${esc(describeQuality(q))} <span class="sub">${WEEKDAY_ID[weekdayOf(q.date)]} ${q.date}, total ${km(runDistance(q.steps as AnyStep[]), 1)} km</span>`,
                )
                .join('')
            : '<span class="muted">-</span>',
          other.length
            ? `${other.length} x ${otherMin.length ? `${Math.min(...otherMin)}-${Math.max(...otherMin)} mnt` : ''}<span class="sub">${esc(types)}</span>`
            : '<span class="muted">-</span>',
          flags.length
            ? flags.map((f) => `${chip(f.sev as never, f.check)} ${esc(f.detail)}`).join('<br>')
            : '<span class="muted">-</span>',
        ],
      };
    });
    const peak = Math.max(...plan.weeks.filter((w) => w.phase !== 'taper').map((w) => w.volumeM));
    const pre7 = race
      ? runs
          .filter((w) => daysBetween(w.date, race) >= 1 && daysBetween(w.date, race) <= 7)
          .reduce((a, w) => a + runDistance(w.steps as AnyStep[]), 0)
      : null;
    const maxLong = Math.max(
      0,
      ...runs.filter((w) => w.type === 'long').map((w) => runDistance(w.steps as AnyStep[])),
    );
    const firstInterval = runs.find((w) => w.type === 'interval');
    out.push({ id: p.id, label: p.label, weeks: weekRows.map((r) => r.week) });
    const facts = [
      ['Input', esc(describeInput(p.input))],
      [
        'Profil',
        esc(
          `${p.input.goal.baselineDistance ? `${p.input.goal.baselineDistance.toUpperCase()} ${mmss(p.input.goal.baselineTimeS!)}` : `tanpa waktu acuan (${p.input.goal.level ?? '-'})`}, ${km(p.input.goal.weeklyVolumeM, 0)} km/minggu, lari terjauh ${km(p.input.goal.longestRunM, 0)} km${p.input.lightMode ? ', mode ringan' : ''}${p.input.strength ? ', strength' : ''}`,
        ),
      ],
      [
        'VDOT dan pace easy',
        esc(
          `${plan.vdot} · easy ${pace(plan.zones.easy)}, tempo ${pace(plan.zones.threshold)}, interval ${pace(plan.zones.interval)}`,
        ),
      ],
      [
        'Prediksi',
        plan.prediction
          ? esc(
              `${mmss(plan.prediction.minS)} - ${mmss(plan.prediction.maxS)}, paling mungkin ${mmss(plan.prediction.likelyS)}${plan.prediction.rough ? ' (perkiraan kasar)' : ''}`,
            )
          : '-',
      ],
      [
        'Long run terjauh',
        `${km(maxLong, 1)} km${race && p.input.goal.distance !== 'fitness' ? ` (jarak race ${p.input.goal.distance.toUpperCase()})` : ''}`,
      ],
      [
        'Interval pertama',
        firstInterval
          ? esc(
              `minggu ${firstInterval.weekIndex} (${firstInterval.phase}): ${describeQuality(firstInterval)}`,
            )
          : 'tidak ada',
      ],
      [
        '7 hari sebelum race',
        pre7 != null
          ? `${km(pre7, 1)} km = ${Math.round((pre7 / peak) * 100)}% dari minggu puncak ${km(peak, 1)} km`
          : '-',
      ],
      [
        'Catatan validator',
        fails.length
          ? `${fails.length} (${['kritis', 'mayor', 'minor'].map((s) => `${fails.filter((f) => f.sev === s).length} ${s}`).join(', ')})`
          : 'tidak ada',
      ],
    ];
    return {
      id: p.id.toLowerCase(),
      title: `${p.id} · ${p.label}`,
      html:
        table(['Data', 'Nilai'], facts) +
        table(
          [
            'Mg',
            'Fase',
            'Mulai',
            'Volume (km)',
            'Long run (km)',
            'Sesi kualitas',
            'Easy / recovery / strides',
            'Catatan validator',
          ],
          weekRows.map((r) => r.cells),
        ) +
        `<p class="note">Penilaian: isi Setuju / Perlu diubah / Tidak setuju untuk ${code(p.id)} di kolom catatan umum formulir <a href="../../engine-review.html#s-hasil">engine-review.html</a>.</p>`,
    };
  });

  const questions = table(
    ['Kode', 'Pertanyaan untuk pelatih', 'Lihat di'],
    [
      [
        code('M1'),
        'Long run puncak di bawah jarak race (misal 10K: 9,2 km) dan porsi long run 30% (E-08) membuat long run awal jauh di bawah lari terjauh pengguna. Bisa diterima, atau porsi perlu dinaikkan pada volume rendah?',
        `${code('P3')}, ${code('P4')}`,
      ],
      [
        code('M2'),
        'Interval pertama muncul di fase Peak langsung 6 x 800 m (sekitar 16% volume minggu). Perlu diperkenalkan bertahap sejak Build?',
        `${code('P3')}, ${code('P4')}, ${code('P9')}`,
      ],
      [
        code('M3'),
        'Easy run 16-18 menit di 6 hari per minggu pada volume rendah. Lebih baik lebih sedikit sesi yang lebih panjang?',
        `${code('P3')}, ${code('P9')}`,
      ],
      [
        code('M4'),
        'Easy run panjang (sekitar 37 menit) pada H-2 dan H-1 race di minggu race. Bisa diterima?',
        `${code('P3')}`,
      ],
      [
        code('M5'),
        'Minggu cutback pertama di Build membawa tempo pertama, dan long run minggu itu lebih pendek dari sesi tempo. Bisa diterima?',
        `${code('P3')}`,
      ],
      [
        'E-23 sampai E-26',
        'Aturan strength dan core (fase 2) belum ada di formulir engine-review, jadi belum pernah dinilai pelatih. Perlu ditambahkan ke formulir.',
        `${code('P8')}`,
      ],
    ],
  );

  const html = page({
    title: 'Paket Review Pelatih',
    eyebrow: `L3.6 · Review pelatih (D6) · engine ${meta.engineVersion}`,
    heading: '10 plan contoh untuk dinilai pelatih',
    lead: `Plan dari 10 persona golden (${code('P1')}-${code('P10')}), dibuat engine ${esc(meta.engineVersion)} dan disajikan per minggu. Kolom "Catatan validator" berisi pelanggaran yang ditemukan Lapisan 2 di minggu itu. Pelatih menilai tiap plan dan menjawab pertanyaan ${code('M1')}-${code('M5')} memakai formulir di engine-review.html.`,
    meta: [
      ['Versi engine', meta.engineVersion],
      ['Commit', meta.commit],
      ['Dibuat', meta.generatedAt],
      ['Status', 'Menunggu pelatih'],
    ],
    verdict: {
      status: 'skip',
      text: 'Belum dinilai. L3.6 lulus setelah 10 dari 10 plan tanpa "Tidak setuju" yang terbuka dan formulir ditandatangani pelatih bersertifikat.',
    },
    tiles: [
      { label: 'Plan untuk dinilai', value: '10' },
      { label: 'Pertanyaan coaching', value: '6', note: 'M1-M5 + aturan strength' },
      {
        label: 'Plan dengan catatan Kritis',
        value: `${sections.filter((s) => s.html.includes('s-kritis')).length}`,
        status: sections.some((s) => s.html.includes('s-kritis')) ? 'kritis' : 'pass',
      },
    ],
    nav: navFor('review-pelatih.html'),
    sections: [{ id: 'pertanyaan', title: 'Pertanyaan untuk pelatih', html: questions }, ...sections],
  });
  writeHtml('review-pelatih.html', html);
  writeJson('review-pelatih.json', { meta, personas: out });
  writeSummary({
    layer: 'review-pelatih',
    title: 'Paket review pelatih (L3.6)',
    file: 'review-pelatih.html',
    status: 'skip',
    headline: '10 plan persona dan 6 pertanyaan siap dikirim ke pelatih; belum dinilai.',
    counts: [
      { label: 'Plan', value: '10' },
      { label: 'Status', value: 'Menunggu pelatih' },
    ],
    meta,
  });
  expect(sections.length).toBe(10);
});
