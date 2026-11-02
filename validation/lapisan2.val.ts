import { expect, test } from 'vitest';
import {
  buildReturnWeek,
  checkMove,
  engineEn,
  engineId,
  generatePlan,
  paceZones,
  proposeAdjustments,
  type AdaptInput,
  type GeneratedPlan,
  type MovableWorkout,
  type PlanInput,
  type Step,
  type WorkoutType,
} from '../packages/training-engine/src';
import { addDays, km, runDistance, type AnyStep } from './lib/calc';
import { chip, code, esc, page, table, type Status } from './lib/html';
import { CHECKS, newTally, validatePlan, type Tally } from './lib/oracle';
import { navFor, runMeta, writeHtml, writeJson, writeSummary } from './lib/output';
import {
  describeInput,
  matrixScenarios,
  MIN_WEEKS,
  personas,
  raceFor,
  BASE_MONDAY,
  type Scenario,
} from './lib/scenarios';

// Lapisan 2: engine sesuai aturan. Menjalankan matriks skenario + persona lewat generatePlan(),
// memeriksa hasilnya dengan validator independen, lalu menulis docs/validation/engine-<versi>/lapisan-2.html.

type Row = { id: string; desc: string; expect: string; actual: string; status: Status };

const catalogs = { id: engineId as Record<string, string>, en: engineEn as Record<string, string> };

function runMatrix(scenarios: Scenario[], tally: Tally) {
  const errors: { id: string; label: string; error: string }[] = [];
  const plans = new Map<string, GeneratedPlan>();
  for (const s of scenarios) {
    try {
      const p = generatePlan(s.input);
      plans.set(s.id, p);
      validatePlan(s.input, p, tally, { scenario: s.id, catalogs });
    } catch (e) {
      errors.push({ id: s.id, label: s.label, error: (e as { code?: string }).code ?? String(e) });
    }
  }
  return { errors, plans };
}

/** E-03c: input yang wajib ditolak engine. */
function rejections(): Row[] {
  const rows: Row[] = [];
  const base = (over: Partial<PlanInput>, goal: Partial<PlanInput['goal']>): PlanInput => ({
    goal: {
      distance: '10k',
      raceDate: raceFor(BASE_MONDAY, 10, 6),
      baselineDistance: '5k',
      baselineTimeS: 1950,
      level: null,
      weeklyVolumeM: 15000,
      longestRunM: 7000,
      ...goal,
    },
    availableDays: [0, 2, 4, 6],
    longRunDay: 6,
    lightMode: false,
    startDate: BASE_MONDAY,
    ...over,
  });
  const cases: { desc: string; input: PlanInput; code: string }[] = [
    ...(['5k', '10k', 'hm', 'fm'] as const).map((t) => ({
      desc: `${t.toUpperCase()}: race ${MIN_WEEKS[t] - 1} minggu lagi (minimum ${MIN_WEEKS[t]})`,
      input: base({}, { distance: t, raceDate: raceFor(BASE_MONDAY, MIN_WEEKS[t] - 1, 6) }),
      code: 'race_too_soon',
    })),
    { desc: 'Race di hari mulai plan', input: base({}, { raceDate: BASE_MONDAY }), code: 'race_in_past' },
    {
      desc: 'Race sebelum hari mulai',
      input: base({}, { raceDate: addDays(BASE_MONDAY, -3) }),
      code: 'race_in_past',
    },
    { desc: 'Hanya 2 hari tersedia', input: base({ availableDays: [2, 6] }, {}), code: 'invalid_days' },
    {
      desc: '7 hari tersedia',
      input: base({ availableDays: [0, 1, 2, 3, 4, 5, 6] }, {}),
      code: 'invalid_days',
    },
    {
      desc: 'Hari long run bukan hari tersedia',
      input: base({ availableDays: [0, 2, 4, 5], longRunDay: 6 }, {}),
      code: 'long_run_day_unavailable',
    },
  ];
  cases.forEach((c, i) => {
    let got = 'tidak ditolak';
    try {
      generatePlan(c.input);
    } catch (e) {
      got = (e as { code?: string }).code ?? String(e);
    }
    rows.push({
      id: `TL-${String(i + 1).padStart(2, '0')}`,
      desc: c.desc,
      expect: `ditolak: ${c.code}`,
      actual: got === 'tidak ditolak' ? got : `ditolak: ${got}`,
      status: got === c.code ? 'pass' : 'mayor',
    });
  });
  return rows;
}

const easyStep = (s: number): Step[] => [
  { kind: 'work', duration_s: s, zone: 'easy', pace_s_per_km: { min: 464, max: 550 } },
];

/** Skenario adaptasi (TRD 4.3). Harapan ditulis dari bunyi tabel TRD, bukan dari kode. */
function adaptation(): Row[] {
  const today = '2027-01-11';
  const wk = (statuses: ('completed' | 'skipped')[]) =>
    statuses.map((st, i) => ({
      id: `w${i}`,
      date: addDays('2027-01-04', i),
      type: 'easy' as WorkoutType,
      steps: easyStep(1800),
      status: st,
    }));
  const nextWeek = [
    {
      id: 'n-tempo',
      date: '2027-01-13',
      type: 'tempo' as WorkoutType,
      steps: easyStep(2400),
      status: 'scheduled' as const,
    },
    {
      id: 'n-easy',
      date: '2027-01-12',
      type: 'easy' as WorkoutType,
      steps: easyStep(1800),
      status: 'scheduled' as const,
    },
  ];
  const fb = (pairs: [WorkoutType, number][]) =>
    pairs.map(([type, rpe], i) => ({ date: addDays('2027-01-04', i), type, rpe }));
  const base = (o: Partial<AdaptInput>): AdaptInput => ({
    week: wk(['completed', 'completed', 'completed', 'completed']),
    nextWeek,
    feedback: [],
    lastRunDate: '2027-01-10',
    today,
    ...o,
  });
  const cases: {
    id: string;
    desc: string;
    input: AdaptInput;
    expect: string[];
    info?: string;
    extra?: (r: ReturnType<typeof proposeAdjustments>) => string | null;
  }[] = [
    {
      id: 'AD-01',
      desc: 'RPE easy run 8 lalu 8',
      input: base({
        feedback: fb([
          ['easy', 4],
          ['easy', 8],
          ['easy', 8],
        ]),
      }),
      expect: ['E-17'],
      extra: (r) => {
        const p = r.find((x) => x.rule === 'E-17');
        const ok =
          p?.changes.some((c) => c.kind === 'volume' && c.pct === -10) &&
          p.changes.some((c) => c.kind === 'hard_to_easy' && c.workout_id === 'n-tempo');
        return ok ? null : 'perubahan bukan "volume -10% + 1 sesi berat jadi easy"';
      },
    },
    {
      id: 'AD-02',
      desc: 'RPE easy run 8, 7, 8',
      input: base({
        feedback: fb([
          ['easy', 8],
          ['easy', 7],
          ['easy', 8],
        ]),
      }),
      expect: [],
    },
    {
      id: 'AD-03',
      desc: 'RPE easy 8 lalu long run 8 (TRD hanya menyebut "easy run")',
      input: base({
        feedback: fb([
          ['easy', 8],
          ['long', 8],
        ]),
      }),
      expect: [],
      info: 'Engine menghitung long run, recovery dan strides sebagai "easy". TRD 4.3 hanya menyebut easy run; perlu keputusan apakah long run ikut.',
    },
    {
      id: 'AD-04',
      desc: 'RPE sesi kualitas 4, 4, 4',
      input: base({
        feedback: fb([
          ['tempo', 4],
          ['interval', 4],
          ['tempo', 4],
        ]),
      }),
      expect: ['E-18'],
      extra: (r) => {
        const p = r.find((x) => x.rule === 'E-18');
        return p?.changes.some((c) => c.kind === 'pace_up') && p.changes.some((c) => c.kind === 'time_trial')
          ? null
          : 'usulan tanpa "pace naik" atau "time trial"';
      },
    },
    {
      id: 'AD-05',
      desc: 'RPE sesi kualitas 4, 5, 4',
      input: base({
        feedback: fb([
          ['tempo', 4],
          ['interval', 5],
          ['tempo', 4],
        ]),
      }),
      expect: [],
    },
    { id: 'AD-06', desc: '0 latihan terlewat', input: base({}), expect: [] },
    {
      id: 'AD-07',
      desc: '1 latihan terlewat',
      input: base({ week: wk(['completed', 'skipped', 'completed', 'completed']) }),
      expect: [],
    },
    {
      id: 'AD-08',
      desc: '2 latihan terlewat',
      input: base({ week: wk(['completed', 'skipped', 'skipped', 'completed']) }),
      expect: ['E-19'],
    },
    {
      id: 'AD-09',
      desc: '3 latihan terlewat',
      input: base({ week: wk(['skipped', 'skipped', 'skipped', 'completed']) }),
      expect: ['E-19'],
    },
    { id: 'AD-10', desc: 'Tidak lari 9 hari', input: base({ lastRunDate: addDays(today, -9) }), expect: [] },
    {
      id: 'AD-11',
      desc: 'Tidak lari 10 hari',
      input: base({ lastRunDate: addDays(today, -10) }),
      expect: ['E-13'],
    },
    {
      id: 'AD-12',
      desc: 'Tidak lari 14 hari',
      input: base({ lastRunDate: addDays(today, -14) }),
      expect: ['E-13'],
    },
    {
      id: 'AD-13',
      desc: 'RPE easy 8, 8 dan 2 latihan terlewat di minggu yang sama',
      input: base({
        week: wk(['completed', 'skipped', 'skipped', 'completed']),
        feedback: fb([
          ['easy', 8],
          ['easy', 8],
        ]),
      }),
      expect: ['E-17', 'E-19'],
    },
  ];
  return cases.map((c) => {
    const r = proposeAdjustments(c.input);
    const got = r.map((x) => x.rule).sort();
    const exp = [...c.expect].sort();
    const same = got.join(',') === exp.join(',');
    const extra = same && c.extra ? c.extra(r) : null;
    const desc = got.length
      ? got
          .map(
            (g) =>
              `${g}: ${r
                .find((x) => x.rule === g)!
                .changes.map((ch) => ch.kind + ('pct' in ch ? ` ${ch.pct}%` : ''))
                .join(' + ')}`,
          )
          .join('; ')
      : 'tidak ada usulan';
    const status: Status = c.info ? 'info' : same && !extra ? 'pass' : 'mayor';
    return {
      id: c.id,
      desc: c.desc + (c.info ? `. ${c.info}` : ''),
      expect: exp.length ? exp.join(' + ') : 'tidak ada usulan',
      actual: desc + (extra ? ` (${extra})` : ''),
      status,
    };
  });
}

/** E-13 Return to run (engine-review E-13): easy saja, tiap sesi 50% lari terjauh 30 hari (min 2 km), maks 4 sesi. */
function returnWeek(): Row[] {
  const zones = paceZones(28);
  const cases = [
    { longest: 7000, days: [0, 1, 2, 3, 4, 6], off: 12 },
    { longest: 3000, days: [0, 2, 4, 6], off: 10 },
    { longest: 20000, days: [0, 1, 3, 4, 6], off: 21 },
    { longest: 9000, days: [1, 3, 6], off: 14 },
  ];
  return cases.map((c, i) => {
    const out = buildReturnWeek({
      resumeDate: '2027-01-06',
      availableDays: c.days as never,
      zones,
      recentLongestM: c.longest,
      daysOff: c.off,
      weekIndex: 9,
    });
    const target = Math.max(2000, c.longest * 0.5);
    const dists = out.map((w) => runDistance(w.steps as AnyStep[]));
    const shapeOk =
      out.length <= 4 &&
      out.length >= Math.min(4, c.days.length) &&
      out.every((w) => w.type === 'easy') &&
      dists.every((d) => Math.abs(d - target) <= 300);
    const minOk = dists.every((d) => d >= 1999);
    return {
      id: `RR-${String(i + 1).padStart(2, '0')}`,
      desc: `Lari terjauh 30 hari ${km(c.longest, 1)} km, ${c.days.length} hari tersedia, jeda ${c.off} hari`,
      expect: `${Math.min(4, c.days.length)} sesi easy @ ${km(target, 1)} km`,
      actual: `${out.length} sesi: ${out.map((w, j) => `${w.type} ${km(dists[j]!, 2)} km`).join(', ')}${minOk ? '' : ' (di bawah minimum 2 km karena durasi dibulatkan ke bawah per menit)'}`,
      status: !shapeOk ? 'kritis' : minOk ? 'pass' : 'minor',
    };
  });
}

/** Pindah latihan (layar 3.2, E-10): pesan peringatan harus muncul bila sesi berat bersebelahan dengan sesi berat/long run. */
function moves(): Row[] {
  const step = easyStep(1800);
  const w = (id: string, date: string, type: WorkoutType): MovableWorkout => ({
    id,
    date,
    type,
    steps: step,
    status: 'scheduled',
  });
  // Minggu Senin 2027-01-04: Sen easy, Rab interval, Kam recovery, Jum tempo, Min long. Selasa dan Sabtu kosong.
  const week = [
    w('mon', '2027-01-04', 'easy'),
    w('wed', '2027-01-06', 'interval'),
    w('thu', '2027-01-07', 'recovery'),
    w('fri', '2027-01-08', 'tempo'),
    w('sun', '2027-01-10', 'long'),
  ];
  // Minggu berikutnya tanpa sesi Senin; long run Minggu 2027-01-10 ada di minggu sebelumnya.
  const nextWeek = [
    w('n-wed', '2027-01-13', 'tempo'),
    w('n-fri', '2027-01-15', 'easy'),
    w('n-sun', '2027-01-17', 'long'),
  ];
  const warn = (v: string) => v === 'hard_adjacent' || v === 'after_hard';
  const cases = [
    {
      desc: 'Tempo Jumat dipindah ke Selasa (sehari sebelum interval Rabu)',
      moving: week[3]!,
      to: '2027-01-05',
      list: week,
      expectWarn: true,
    },
    {
      desc: 'Interval Rabu dipindah ke Sabtu (sehari sebelum long run Minggu; tempo Jumat sudah dihapus)',
      moving: week[1]!,
      to: '2027-01-09',
      list: week.filter((x) => x.id !== 'fri'),
      expectWarn: true,
    },
    {
      desc: 'Easy Senin dipindah ke Selasa',
      moving: week[0]!,
      to: '2027-01-05',
      list: week,
      expectWarn: false,
    },
    {
      desc: 'Tempo Rabu minggu depan dipindah ke Senin (sehari sesudah long run Minggu minggu ini); app hanya mengirim latihan minggu yang sama',
      moving: nextWeek[0]!,
      to: '2027-01-11',
      list: nextWeek,
      expectWarn: true,
    },
    {
      desc: 'Easy Senin dipindah ke hari recovery Kamis (tabrakan, tawarkan gabung dengan cek E-06)',
      moving: week[0]!,
      to: '2027-01-07',
      list: week,
      expectWarn: false,
      expectVerdict: 'occupied',
    },
  ];
  return cases.map((c, i) => {
    const r = checkMove(c.moving, c.to, c.list, 7000);
    const ok = c.expectVerdict
      ? r.verdict === c.expectVerdict && r.rationale.some((x) => x.rule === 'E-06')
      : warn(r.verdict) === c.expectWarn;
    return {
      id: `PD-${String(i + 1).padStart(2, '0')}`,
      desc: c.desc,
      expect: c.expectVerdict ? `${c.expectVerdict} + pesan E-06` : c.expectWarn ? 'peringatan E-10' : 'aman',
      actual: `${r.verdict}${r.rationale.length ? ` (${r.rationale.map((x) => x.rule).join(', ')})` : ''}`,
      status: ok ? 'pass' : c.expectWarn ? 'kritis' : 'mayor',
    };
  });
}

const statusOf = (sev: string, failed: number): Status => (failed === 0 ? 'pass' : (sev as Status));

test('Lapisan 2: engine sesuai aturan', () => {
  const meta = runMeta();
  const pers = personas();
  const matrix = matrixScenarios();
  const all = [...pers, ...matrix];
  const label = new Map(all.map((s) => [s.id, s]));
  const tally = newTally();
  const t0 = Date.now();
  const { errors } = runMatrix(all, tally);
  const ms = Date.now() - t0;
  const rej = rejections();
  const ad = adaptation();
  const rr = returnWeek();
  const pd = moves();

  const sevCount = (sev: string) =>
    CHECKS.filter((c) => c.severity === sev && tally[c.id]!.failed > 0).length;
  const failScen = (sev: string) =>
    new Set(CHECKS.filter((c) => c.severity === sev).flatMap((c) => [...tally[c.id]!.scenFail])).size;
  const extraKritis = [...rr, ...pd].filter((r) => r.status === 'kritis').length;
  const extraMayor = [...rej, ...ad, ...pd].filter((r) => r.status === 'mayor').length;
  const kritisChecks = sevCount('kritis');
  const mayorChecks = sevCount('mayor');
  const overall: Status =
    kritisChecks + extraKritis > 0
      ? 'kritis'
      : mayorChecks + extraMayor + errors.length > 0
        ? 'mayor'
        : 'pass';

  const regress = [
    {
      id: 'H1',
      check: 'E-11b',
      what: 'Taper mengikuti minggu kalender: volume 7 hari sebelum race tidak turun 40-60%',
    },
    { id: 'H2', check: 'E-10b', what: 'Sesi berat sehari sesudah long run (lintas minggu)' },
    { id: 'H3', check: 'E-11c', what: 'Sesi kualitas berkurang di minggu taper' },
    {
      id: 'H4',
      check: 'E-03b',
      what: 'Teks E-03 menyebut "durasi umum" untuk plan yang lebih panjang dari default',
    },
    { id: 'N1', check: 'RAT-a', what: 'Teks E-07 "turun 20%" tidak sama dengan penurunan sebenarnya' },
    { id: 'N2', check: 'WAJ-a', what: 'Easy run di bawah 2 km' },
  ].map((r) => {
    const t = tally[r.check]!;
    const still = t.scenFail.has('P3');
    return [
      code(r.id),
      esc(r.what),
      code(r.check),
      still ? chip('known', 'Masih terjadi') : chip('pass', 'Tidak terjadi lagi'),
      `${t.scenFail.size} dari ${t.scenEval.size} skenario`,
    ];
  });

  const checkRows = CHECKS.map((c) => {
    const t = tally[c.id]!;
    const st = statusOf(c.severity, t.failed);
    const ex = t.failures[0];
    return [
      code(c.id),
      `${esc(c.title)}<span class="sub">${esc(c.source)}${c.proposed ? ' · usulan, lebih ketat dari bunyi TRD' : ''}</span>`,
      esc(c.severity[0]!.toUpperCase() + c.severity.slice(1)),
      `${t.scenFail.size} / ${t.scenEval.size}`,
      t.scenEval.size === 0 ? chip('skip', 'Tidak ada kasus') : chip(st),
      ex ? `${code(ex.scenario)} ${esc(ex.detail)}` : '<span class="muted">-</span>',
    ];
  });

  const detail = (sev: string) =>
    CHECKS.filter((c) => c.severity === sev && tally[c.id]!.failed > 0)
      .map((c) => {
        const t = tally[c.id]!;
        const seen = new Set<string>();
        const ex = t.failures
          .filter((f) => (seen.has(f.scenario) ? false : (seen.add(f.scenario), true)))
          .slice(0, 8);
        return `<h3>${code(c.id)} ${esc(c.title)}</h3><p class="note">${t.scenFail.size} dari ${t.scenEval.size} skenario gagal. Contoh (maks 8, satu per skenario):</p>${table(
          ['Skenario', 'Profil dan input', 'Pelanggaran'],
          ex.map((f) => {
            const s = label.get(f.scenario)!;
            return [
              code(f.scenario),
              `${esc(s.label)}<span class="sub">${esc(describeInput(s.input))}</span>`,
              esc(f.detail),
            ];
          }),
        )}`;
      })
      .join('') || '<p class="muted">Tidak ada.</p>';

  const rowTable = (rows: Row[]) =>
    table(
      ['Kode', 'Skenario', 'Harapan (dari spec)', 'Hasil engine', 'Status'],
      rows.map((r) => [esc(r.id), esc(r.desc), esc(r.expect), esc(r.actual), chip(r.status)]),
    );

  const groups = {
    persona: pers.length,
    pairwise: all.filter((s) => s.group === 'pairwise').length,
    penuh: all.filter((s) => s.group === 'penuh').length,
  };

  const html = page({
    title: 'Validasi Lapisan 2',
    eyebrow: `Lapisan 2 · engine ${meta.engineVersion}`,
    heading: 'Engine sesuai aturan?',
    lead: `${all.length.toLocaleString('id-ID')} plan dibuat oleh <code>generatePlan()</code>, lalu diperiksa validator yang ditulis terpisah dari generator (berdasarkan tanggal kalender, termasuk lintas minggu). Ditambah ${rej.length} uji penolakan input, ${ad.length} skenario adaptasi, ${rr.length} skenario Return to run, dan ${pd.length} skenario pindah latihan.`,
    meta: [
      ['Versi engine', meta.engineVersion],
      ['Commit', meta.commit],
      ['Dijalankan', meta.generatedAt],
      ['Waktu proses', `${(ms / 1000).toFixed(1)} dtk`],
    ],
    verdict: {
      status: overall,
      text:
        overall === 'pass'
          ? 'Semua pemeriksaan Kritis dan Mayor lulus.'
          : `Ada ${kritisChecks} pemeriksaan Kritis dan ${mayorChecks} pemeriksaan Mayor yang gagal di matriks skenario${extraKritis + extraMayor ? `, ditambah ${extraKritis + extraMayor} skenario tambahan yang gagal` : ''}. Engine ${esc(meta.engineVersion)} belum memenuhi kriteria lulus Lapisan 2.`,
    },
    tiles: [
      {
        label: 'Plan diperiksa',
        value: all.length.toLocaleString('id-ID'),
        note: `${groups.persona} persona, ${groups.pairwise} pairwise, ${groups.penuh} kombinasi penuh`,
      },
      {
        label: 'Pemeriksaan Kritis gagal',
        value: `${kritisChecks}`,
        note: `${failScen('kritis')} skenario terdampak`,
        status: kritisChecks ? 'kritis' : 'pass',
      },
      {
        label: 'Pemeriksaan Mayor gagal',
        value: `${mayorChecks}`,
        note: `${failScen('mayor')} skenario terdampak`,
        status: mayorChecks ? 'mayor' : 'pass',
      },
      { label: 'Pemeriksaan Minor gagal', value: `${sevCount('minor')}`, note: 'dicatat, tidak menghalangi' },
      { label: 'Error tak terduga', value: `${errors.length}`, status: errors.length ? 'mayor' : 'pass' },
    ],
    nav: navFor('lapisan-2.html'),
    sections: [
      {
        id: 'per-aturan',
        title: 'Hasil per pemeriksaan',
        intro:
          'Satu baris per pemeriksaan validator. Kolom skenario = jumlah plan yang gagal dibanding jumlah plan tempat pemeriksaan itu berlaku.',
        html: table(
          ['Kode', 'Pemeriksaan dan sumber', 'Tingkat', 'Skenario gagal', 'Status', 'Contoh pertama'],
          checkRows,
        ),
      },
      {
        id: 'regresi',
        title: 'Temuan yang sudah diketahui',
        intro: `Kasus regresi dari analisis seed minggu 4, dicek pada persona ${code('P3')} (input seed). Validator dianggap benar karena menangkap semuanya.`,
        html: table(['Kode', 'Temuan', 'Pemeriksaan', 'Status di P3', 'Di seluruh matriks'], regress),
      },
      { id: 'kritis', title: 'Rincian pelanggaran Kritis', html: detail('kritis') },
      { id: 'mayor', title: 'Rincian pelanggaran Mayor', html: detail('mayor') },
      {
        id: 'minor',
        title: 'Rincian Minor dan invariant usulan',
        intro:
          'Tidak menghalangi kelulusan. Invariant usulan (ditandai di tabel atas) lebih ketat dari bunyi TRD dan perlu keputusan pemilik produk sebelum dijadikan aturan.',
        html: detail('minor'),
      },
      {
        id: 'tolak',
        title: 'Penolakan input (E-03c)',
        intro: 'Input yang tidak boleh menghasilkan plan.',
        html: rowTable(rej),
      },
      {
        id: 'adaptasi',
        title: 'Adaptasi mingguan (E-13, E-17, E-18, E-19)',
        intro: `Memanggil <code>proposeAdjustments()</code>. Harapan dari tabel TRD 4.3. Catatan E-20: engine menghitung ulang zona dari VDOT baru (diuji lewat skenario "VDOT 40" di matriks), tetapi alur memasukkan waktu race atau time trial baru tidak ditemukan di app maupun di PRD/APP-FLOW.`,
        html: rowTable(ad),
      },
      {
        id: 'return',
        title: 'Return to run (E-13)',
        intro:
          'Memanggil <code>buildReturnWeek()</code>. Harapan dari engine-review E-13: easy saja, tiap sesi 50% lari terjauh 30 hari (min 2 km), maks 4 sesi.',
        html: rowTable(rr),
      },
      {
        id: 'pindah',
        title: 'Pindah latihan (layar 3.2, E-10)',
        intro:
          'Memanggil <code>checkMove()</code> dengan daftar latihan seperti yang dikirim app (hanya minggu yang sama).',
        html: rowTable(pd),
      },
      {
        id: 'skenario',
        title: 'Skenario yang dijalankan',
        intro:
          'Semua skenario deterministik (seed tetap). Daftar lengkap beserta input ada di <code>data/lapisan-2.json</code>.',
        html: table(
          ['Kelompok', 'Jumlah', 'Isi'],
          [
            [
              `Persona golden ${code('P1')}-${code('P10')}`,
              `${groups.persona}`,
              pers.map((p) => `${code(p.id)} ${esc(p.label)}`).join('<br>'),
            ],
            [
              'Pairwise',
              `${groups.pairwise}`,
              'Setiap pasangan nilai dari 9 dimensi muncul minimal sekali: target (5), profil (7), pola hari (8), hari mulai (7), hari race (7), jarak ke race (minimum, default, default+6, 30, 34 minggu), mode ringan, strength, override VDOT 40.',
            ],
            [
              'Kombinasi penuh',
              `${groups.penuh}`,
              'Hari mulai (7) x hari race (7) x jarak ke race (4) x target race (4) x pola hari (6 hari dan 4 hari), profil tetap per target.',
            ],
          ],
        ),
      },
    ],
  });
  writeHtml('lapisan-2.html', html);
  writeJson('lapisan-2.json', {
    meta,
    checks: CHECKS.map((c) => ({
      ...c,
      evaluated: tally[c.id]!.evaluated,
      failed: tally[c.id]!.failed,
      scenariosEvaluated: tally[c.id]!.scenEval.size,
      scenariosFailed: [...tally[c.id]!.scenFail],
      failures: tally[c.id]!.failures,
    })),
    errors,
    rejections: rej,
    adaptation: ad,
    returnWeek: rr,
    moves: pd,
    scenarios: all.map((s) => ({ id: s.id, group: s.group, label: s.label, input: s.input })),
  });
  writeSummary({
    layer: 'lapisan-2',
    title: 'Lapisan 2: engine = aturan',
    file: 'lapisan-2.html',
    status: overall,
    headline: `${kritisChecks} pemeriksaan Kritis dan ${mayorChecks} Mayor gagal pada ${all.length.toLocaleString('id-ID')} plan.`,
    counts: [
      { label: 'Kritis gagal', value: `${kritisChecks}` },
      { label: 'Mayor gagal', value: `${mayorChecks}` },
      { label: 'Plan diperiksa', value: all.length.toLocaleString('id-ID') },
    ],
    meta,
  });
  expect(all.length).toBeGreaterThan(1000);
});
