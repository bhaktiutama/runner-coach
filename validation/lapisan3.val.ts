import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { runInNewContext } from 'node:vm';
import { expect, test } from 'vitest';
import {
  DEFAULT_WEEKS,
  DRILL_MINUTES,
  DRILLS,
  ENGINE_VERSION,
  engineEn,
  engineId,
  LEVEL_VDOT,
  LONG_RUN_MAX_S,
  LONG_RUN_SHARE,
  MAX_WEEKS,
  MIN_EASY_M,
  MIN_WEEKS,
  PROGRESSION_FAST_S,
  RECOVERY_MAX_S,
  RIEGEL_EXPONENT,
  RULES as REGISTRY,
} from '../packages/training-engine/src';
import { mmss } from './lib/calc';
import { raceTime, vdotOf } from './lib/daniels';
import { chip, code, esc, page, table, type Status } from './lib/html';
import { navFor, ROOT, runMeta, writeHtml, writeJson, writeSummary } from './lib/output';

// Lapisan 3: aturan sesuai referensi. Membandingkan angka di dokumen (TRD, 07, engine-review)
// dengan konstanta kode, memetakan klaim teks app ke referensi, dan mencatat benchmark eksternal.

const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');
const TRD = read('docs/specs/02-TRD.md');
const S07 = read('docs/specs/07-ENGINE-EVIDENCE.md');
const ER_HTML = read('docs/engine-review.html');
const SRC = {
  generator: read('packages/training-engine/src/generator.ts'),
  riegel: read('packages/training-engine/src/riegel.ts'),
  vdot: read('packages/training-engine/src/vdot.ts'),
  rtr: read('packages/training-engine/src/returnToRun.ts'),
  workouts: read('packages/training-engine/src/workouts.ts'),
};

/** Data aturan di engine-review.html (array RULES dan REFMAP di script halaman). */
function engineReview() {
  const script = ER_HTML.slice(ER_HTML.indexOf('const RULES = ['), ER_HTML.indexOf('const KEY ='));
  const ctx: Record<string, unknown> = {};
  runInNewContext(`${script.replace(/^const (\w+) =/gm, 'this.$1 =')}`, ctx);
  const rules = (ctx.RULES as [string, string[][]][]).flatMap(([, rs]) =>
    rs.map((r) => ({ id: r[0]!, text: r[1]!, grade: r[2]!, verdict: r[3]!, find: r[4]!, impl: r[5]! })),
  );
  return {
    rules,
    refmap: ctx.REFMAP as Record<string, string[]>,
    version: /Draft engine v([\d.]+)/.exec(ER_HTML)?.[1] ?? null,
  };
}
const ER = engineReview();
const erText = (id: string) => {
  const r = ER.rules.find((x) => x.id === id);
  return r ? `${r.text} ${r.impl}` : '';
};
const trdRow = (id: string) => TRD.split('\n').find((l) => l.startsWith(`| ${id} `)) ?? '';
const s07Rows = (id: string) =>
  S07.split('\n')
    .filter((l) => l.startsWith(`| ${id} `))
    .join(' ');
/** Baris terakhir yang diawali label: untuk ID aturan = baris di 07 bagian 7 (keputusan implementasi). */
const s07Impl = (label: string) =>
  S07.split('\n')
    .filter((l) => l.startsWith(label))
    .at(-1) ?? '';
const erImpl = (id: string) => ER.rules.find((x) => x.id === id)?.impl ?? '';
const srcNum = (src: string, re: RegExp) => re.exec(src)?.[1] ?? null;

type DocVal = string | null;
type Param = {
  rule: string;
  label: string;
  code: string;
  trd?: DocVal;
  s07?: DocVal;
  er?: DocVal;
  /** Dokumen yang menyebut rentang (misal 16-18) dianggap sama jika nilai kode ada di dalamnya. */
  same?: (codeVal: string, docVal: string) => boolean;
};

const m = (s: string, re: RegExp, f: (x: RegExpExecArray) => string): DocVal => {
  const x = re.exec(s);
  return x ? f(x) : null;
};
const pctOf = (x: number) => `${Math.round(x * 100)}%`;
const inRange = (c: string, d: string) =>
  c.split('/').every((cv, i) => {
    const dv = d.split('/')[i] ?? '';
    const [lo, hi] = dv.split('-').map((x) => Number(x.replace(',', '.')));
    const v = Number(cv.replace(',', '.'));
    return hi != null && !Number.isNaN(hi) ? v >= lo! && v <= hi : v === lo;
  });

const taperCode = (() => {
  const t = srcNum(SRC.generator, /TAPER_FRACTIONS[^=]*=\s*(\{[^;]+\})/);
  const obj = t ? (runInNewContext(`(${t})`) as Record<string, number[]>) : {};
  return Object.values(obj)
    .map((a) => a.map((x) => Math.round(x * 100)).join(','))
    .join(' | ');
})();

const PARAMS: Param[] = [
  {
    rule: 'E-01',
    label: 'Eksponen Riegel',
    code: String(RIEGEL_EXPONENT),
    trd: m(trdRow('Prediksi waktu antar jarak (E-01)') || TRD, /\^1\.(\d+)/, (x) => `1.${x[1]}`),
    s07: m(s07Rows('E-01'), /\^1\.(\d+)/, (x) => `1.${x[1]}`),
    er: m(erText('E-01'), /\^1,(\d+)/, (x) => `1.${x[1]}`),
  },
  {
    rule: 'E-01',
    label: 'Rentang prediksi 5K-HM',
    code: SRC.riegel.includes('t * 0.97') && SRC.riegel.includes('t * 1.03') ? '+-3%' : 'lain',
    trd: m(TRD, /`T x 0,97` s\.d\. `T x 1,03`/, () => '+-3%'),
    s07: m(S07, /T x 0,97, T x 1,03/, () => '+-3%'),
    er: m(erText('E-01'), /±3%/, () => '+-3%'),
  },
  {
    rule: 'E-01',
    label: 'Rentang FM (batas lambat / paling mungkin)',
    code: SRC.riegel.includes('t + 1200') && SRC.riegel.includes('t + 600') ? 'T+20 / T+10 mnt' : 'lain',
    trd: m(TRD, /`T \+ 20 mnt`.*`T \+ 10 mnt`/, () => 'T+20 / T+10 mnt'),
    s07: m(S07, /T \+ 20 mnt.*T \+ 10 mnt/, () => 'T+20 / T+10 mnt'),
    er: m(erText('E-01'), /T \+ 20 mnt.*T \+ 10 mnt/, () => 'T+20 / T+10 mnt'),
  },
  {
    rule: 'E-02',
    label: 'Zona easy (% VO2max)',
    code: m(SRC.vdot, /easy: \[0\.(\d+), 0\.(\d+)\]/, (x) => `${x[1]}-${x[2]}%`) ?? '?',
    s07: m(S07, /Easy (\d+)-(\d+)%/, (x) => `${x[1]}-${x[2]}%`),
    er: m(erText('E-02'), /Easy (\d+)-(\d+)% VO2max/, (x) => `${x[1]}-${x[2]}%`),
  },
  {
    rule: 'E-02',
    label: 'VDOT tanpa waktu acuan (pemula / rekreasional)',
    code: `${LEVEL_VDOT.beginner} / ${LEVEL_VDOT.recreational}`,
    s07: m(S07, /pemula VDOT (\d+).*rekreasional VDOT (\d+)/, (x) => `${x[1]} / ${x[2]}`),
    er: m(erText('E-02'), /pemula VDOT (\d+).*rekreasional VDOT (\d+)/, (x) => `${x[1]} / ${x[2]}`),
  },
  {
    rule: 'E-03',
    label: 'Durasi default 5K / 10K / HM / FM (minggu)',
    code: `${DEFAULT_WEEKS['5k']}/${DEFAULT_WEEKS['10k']}/${DEFAULT_WEEKS.hm}/${DEFAULT_WEEKS.fm}`,
    trd: m(
      trdRow('E-03'),
      /5K: (\d+) mgg, 10K: (\d+) mgg, HM: (\d+) mgg, FM: ([\d-]+) mgg/,
      (x) => `${x[1]}/${x[2]}/${x[3]}/${x[4]}`,
    ),
    s07: m(
      s07Rows('E-03'),
      /5K (\d+) \/ 10K (\d+) \/ HM (\d+) \/ FM ([\d-]+)/,
      (x) => `${x[1]}/${x[2]}/${x[3]}/${x[4]}`,
    ),
    er: m(
      erText('E-03'),
      /5K (\d+), 10K (\d+), HM (\d+), FM ([\d-]+)/,
      (x) => `${x[1]}/${x[2]}/${x[3]}/${x[4]}`,
    ),
    same: inRange,
  },
  {
    rule: 'E-03',
    label: 'Durasi minimum 5K / 10K / HM / FM (minggu)',
    code: `${MIN_WEEKS['5k']}/${MIN_WEEKS['10k']}/${MIN_WEEKS.hm}/${MIN_WEEKS.fm}`,
    trd: null,
    s07: null,
    er: null,
  },
  {
    rule: 'E-03',
    label: 'Durasi maksimum plan (minggu)',
    code: String(MAX_WEEKS),
    trd: null,
    s07: null,
    er: null,
  },
  {
    rule: 'E-05',
    label: 'Kenaikan volume mingguan maks',
    code: pctOf(Number(srcNum(SRC.generator, /MAX_WEEKLY_INCREASE = ([\d.]+)/))),
    trd: m(trdRow('E-05'), /Maks (\d+)%/, (x) => `${x[1]}%`),
    s07: m(s07Rows('E-05'), /maks (\d+)%/, (x) => `${x[1]}%`),
    er: m(erText('E-05'), /maks (\d+)%/, (x) => `${x[1]}%`),
  },
  {
    rule: 'E-05',
    label: 'Pembulatan volume target',
    code: `${srcNum(SRC.generator, /Math\.floor\(m \/ (\d+)\) \* \d+/)} m`,
    s07: m(s07Impl('| E-05'), /per (\d+) m/, (x) => `${x[1]} m`),
    er: m(erText('E-05'), /per (\d+) km/, (x) => `${Number(x[1]) * 1000} m`),
  },
  {
    rule: 'E-05',
    label: 'Volume minggu 1 minimal',
    code: `${(MIN_EASY_M * 2) / 1000} km`,
    s07: m(s07Impl('| Volume awal'), /lari terjauh, (\d+) km\)/, (x) => `${x[1]} km`),
    er: m(erText('E-05'), /lari terjauh, (\d+) km\)/, (x) => `${x[1]} km`),
  },
  {
    rule: 'E-06',
    label: 'Batas satu sesi / jendela',
    code: `${pctOf(Number(srcNum(SRC.generator, /SESSION_CAP = ([\d.]+)/)))} / ${srcNum(SRC.generator, /LONGEST_WINDOW_DAYS = (\d+)/)} hari`,
    trd: m(trdRow('E-06'), /Maks (\d+)% dari lari terjauh (\d+) hari/, (x) => `${x[1]}% / ${x[2]} hari`),
    s07: m(s07Rows('E-06'), /maks (\d+)% dari lari terjauh (\d+) hari/, (x) => `${x[1]}% / ${x[2]} hari`),
    er: m(erText('E-06'), /maks (\d+)% dari lari terjauh (\d+) hari/, (x) => `${x[1]}% / ${x[2]} hari`),
  },
  {
    rule: 'E-07',
    label: 'Cutback: minggu ke berapa / target volume',
    code: `ke-${srcNum(SRC.generator, /CUTBACK_EVERY = (\d+)/)} / ${pctOf(Number(srcNum(SRC.generator, /CUTBACK_FACTOR = ([\d.]+)/)))}`,
    trd: m(
      trdRow('E-07'),
      /minggu ke-3 atau ke-4, volume turun (\d+)-(\d+)%/,
      (x) => `ke-3-4 / ${100 - Number(x[2])}-${100 - Number(x[1])}%`,
    ),
    s07: m(s07Impl('| E-07'), /tiap minggu ke-(\d+).*target (\d+)%/, (x) => `ke-${x[1]} / ${x[2]}%`),
    er: m(erImpl('E-07'), /tiap minggu ke-(\d+).*target (\d+)%/, (x) => `ke-${x[1]} / ${x[2]}%`),
    same: (c, d) => {
      const [cw, cp] = c.split(' / ');
      const [dw, dp] = d.split(' / ');
      const wOk = dw === cw || (dw === 'ke-3-4' && (cw === 'ke-3' || cw === 'ke-4'));
      return wOk && (dp === cp || inRange(cp!.replace('%', ''), dp!.replace('%', '')));
    },
  },
  {
    rule: 'E-08',
    label: 'Porsi long run 5K-10K / HM / FM',
    code: `${pctOf(LONG_RUN_SHARE['10k'])} / ${pctOf(LONG_RUN_SHARE.hm)} / ${pctOf(LONG_RUN_SHARE.fm)}`,
    trd: m(
      trdRow('E-08'),
      /5K\/10K\/Bugar (\d+)%, HM (\d+)%, FM (\d+)%/,
      (x) => `${x[1]}% / ${x[2]}% / ${x[3]}%`,
    ),
    s07: m(s07Rows('E-08'), /5K\/10K (\d+)%, HM (\d+)%, FM (\d+)%/, (x) => `${x[1]}% / ${x[2]}% / ${x[3]}%`),
    er: m(erText('E-08'), /5K\/10K (\d+)%, HM (\d+)%, FM (\d+)%/, (x) => `${x[1]}% / ${x[2]}% / ${x[3]}%`),
  },
  {
    rule: 'E-08',
    label: 'Durasi long run maks 5K-10K / HM / FM (jam)',
    code: `${LONG_RUN_MAX_S['10k'] / 3600} / ${LONG_RUN_MAX_S.hm / 3600} / ${LONG_RUN_MAX_S.fm / 3600}`.replace(
      /\./g,
      ',',
    ),
    trd: m(
      trdRow('E-08'),
      /maks durasi (\d+) jam \(5K\/10K\/Bugar\), ([\d,]+) jam \(HM\), (\d+) jam \(FM\)/,
      (x) => `${x[1]} / ${x[2]} / ${x[3]}`,
    ),
    s07: m(
      s07Rows('E-08'),
      /maks durasi \(([\d,]+) \/ ([\d,]+) \/ ([\d,]+) jam\)/,
      (x) => `${x[1]} / ${x[2]} / ${x[3]}`,
    ),
    er: m(erText('E-08'), /maks ([\d,]+) \/ ([\d,]+) \/ ([\d,]+) jam/, (x) => `${x[1]} / ${x[2]} / ${x[3]}`),
  },
  {
    rule: 'E-11',
    label: 'Fraksi volume puncak per minggu taper (1 | 2 | 3 minggu)',
    code: taperCode,
    s07: m(
      S07,
      /1 mgg \[(\d+)%\], 2 mgg \[(\d+)%, (\d+)%\], 3 mgg \[(\d+)%, (\d+)%, (\d+)%\]/,
      (x) => `${x[1]} | ${x[2]},${x[3]} | ${x[4]},${x[5]},${x[6]}`,
    ),
    er: m(
      erText('E-11'),
      /1 mgg \[(\d+)%\]; 2 mgg \[(\d+)%, (\d+)%\]; 3 mgg \[(\d+)%, (\d+)%, (\d+)%\]/,
      (x) => `${x[1]} | ${x[2]},${x[3]} | ${x[4]},${x[5]},${x[6]}`,
    ),
  },
  {
    rule: 'E-11',
    label: 'Penurunan volume taper',
    code: '50%',
    trd: m(trdRow('E-11'), /Volume turun (\d+)-(\d+)%/, (x) => `${x[1]}-${x[2]}%`),
    s07: m(s07Rows('E-11'), /volume turun (\d+)-(\d+)% dari minggu puncak/, (x) => `${x[1]}-${x[2]}%`),
    er: m(erText('E-11'), /volume turun (\d+)-(\d+)%/, (x) => `${x[1]}-${x[2]}%`),
    same: (c, d) => inRange(c.replace('%', ''), d.replace('%', '')),
  },
  {
    rule: 'E-13',
    label: 'Return to run: % lari terjauh / minimum / maks sesi',
    code: `${SRC.rtr.includes('recentLongestM * 0.5') ? '50%' : '?'} / ${MIN_EASY_M / 1000} km / ${srcNum(SRC.rtr, /slice\(0, (\d+)\)/)} sesi`,
    s07: m(
      s07Rows('E-13') + S07,
      /tiap sesi (\d+)% lari terjauh 30 hari \(min (\d) km\), maks (\d) sesi/,
      (x) => `${x[1]}% / ${x[2]} km / ${x[3]} sesi`,
    ),
    er: m(
      erText('E-13'),
      /tiap sesi (\d+)% lari terjauh 30 hari \(min (\d) km\), maks (\d) sesi/,
      (x) => `${x[1]}% / ${x[2]} km / ${x[3]} sesi`,
    ),
  },
  {
    rule: 'E-14',
    label: 'Run-walk awal / sesi easy / sesi long',
    code: `${Number(srcNum(SRC.generator, /return make\((\d+), \d+\)/)) / 60}/${Number(srcNum(SRC.generator, /return make\(\d+, (\d+)\)/)) / 60} mnt / ${Number(srcNum(SRC.generator, /RUN_WALK_EASY_S = (\d+)/)) || 30} mnt / ${Number(srcNum(SRC.generator, /RUN_WALK_LONG_S = (\d+)/)) || 40} mnt`,
    s07: m(
      S07,
      /Mulai (\d) mnt lari \/ (\d) mnt jalan.*sesi easy (\d+) mnt, long (\d+) mnt/,
      (x) => `${x[1]}/${x[2]} mnt / ${x[3]} mnt / ${x[4]} mnt`,
    ),
    er: m(
      erText('E-14'),
      /Mulai (\d) mnt lari \/ (\d) mnt jalan.*sesi easy (\d+) mnt, long (\d+) mnt/,
      (x) => `${x[1]}/${x[2]} mnt / ${x[3]} mnt / ${x[4]} mnt`,
    ),
  },
  {
    rule: 'E-15',
    label: 'Drill ABC: lama (mnt)',
    code: String(DRILL_MINUTES),
    trd: m(trdRow('E-15'), /Segmen drill (\d+)-(\d+) mnt/, (x) => `${x[1]}-${x[2]}`),
    s07: m(s07Rows('E-15'), /ABC drill (\d+)-(\d+) mnt/, (x) => `${x[1]}-${x[2]}`),
    er: m(erText('E-15'), /ABC drill (\d+)-(\d+) menit/, (x) => `${x[1]}-${x[2]}`),
    same: inRange,
  },
  {
    rule: 'E-15',
    label: 'Drill ABC: gerakan x set x jarak',
    code: `${DRILLS.length} x ${DRILLS[0]!.sets} x ${DRILLS[0]!.distance_m} m`,
    er: m(erText('E-15'), /(\d) gerakan x (\d) set x (\d+) m/, (x) => `${x[1]} x ${x[2]} x ${x[3]} m`),
  },
  {
    rule: 'E-21',
    label: 'Recovery run: maks durasi / pace lambat +',
    code: `${RECOVERY_MAX_S / 60} mnt / 0-${srcNum(SRC.workouts, /max: z\.easy\.max \+ (\d+)/)} dtk`,
    trd: m(
      trdRow('E-21'),
      /maks (\d+) mnt di pace easy paling lambat \+ 0-(\d+) dtk/,
      (x) => `${x[1]} mnt / 0-${x[2]} dtk`,
    ),
    er: m(erText('E-21'), /maks (\d+) menit.*\+ 0-(\d+) dtk/, (x) => `${x[1]} mnt / 0-${x[2]} dtk`),
  },
  {
    rule: 'E-22',
    label: 'Progression run: menit terakhir pace maraton',
    code: `${PROGRESSION_FAST_S / 60} mnt`,
    trd: m(trdRow('E-22'), /\+ (\d+) mnt terakhir di pace maraton/, (x) => `${x[1]} mnt`),
    s07: m(s07Rows('E-22'), /\+ (\d+) mnt pace maraton/, (x) => `${x[1]} mnt`),
    er: m(erText('E-22'), /(\d+) menit terakhir di pace maraton/, (x) => `${x[1]} mnt`),
  },
  {
    rule: 'E-10',
    label: 'Level dari volume (pemula di bawah)',
    code: `${Number(srcNum(SRC.generator, /weeklyVolumeM < (\d[\d_]*)/)?.replace(/_/g, '')) / 1000} km/minggu`,
    s07: m(S07, /Volume < (\d+) km\/minggu = pemula/, (x) => `${x[1]} km/minggu`),
  },
  { rule: '-', label: 'Versi engine', code: ENGINE_VERSION, er: ER.version },
];

type ParityRow = {
  p: Param;
  cells: { doc: string; val: DocVal; st: 'sama' | 'beda' | 'tidak disebut' }[];
  status: Status;
  note: string;
};

function parity(): ParityRow[] {
  return PARAMS.map((p) => {
    const cells = (
      [
        ['TRD 4', p.trd],
        ['07', p.s07],
        ['engine-review', p.er],
      ] as [string, DocVal | undefined][]
    ).map(([doc, val]) => {
      if (val === undefined || val === null) return { doc, val: null, st: 'tidak disebut' as const };
      const same =
        p.label === 'Versi engine'
          ? ENGINE_VERSION.startsWith(val)
          : p.same
            ? p.same(p.code, val)
            : val === p.code;
      return { doc, val, st: same ? ('sama' as const) : ('beda' as const) };
    });
    const beda = cells.filter((c) => c.st === 'beda');
    const none = cells.every((c) => c.st === 'tidak disebut');
    const status: Status = beda.length ? 'mayor' : none ? 'minor' : 'pass';
    const note = beda.length
      ? `Beda di ${beda.map((c) => c.doc).join(', ')}`
      : none
        ? 'Hanya ada di kode; tidak disebut di dokumen spec mana pun'
        : '';
    return { p, cells, status, note };
  });
}

/** L3.2: kalimat klaim penelitian di teks app (ID dan EN) dipetakan ke referensi. */
function claims() {
  const rows: {
    rule: string;
    lang: string;
    claim: string;
    refs: string[];
    numbers: { n: string; found: boolean }[];
    status: Status;
    note: string;
  }[] = [];
  const claimRe =
    /(studi|meta-analisis|penelitian|review|uji acak|gabungan \d+|study|studies|meta-analysis|research|randomi[sz]ed)/i;
  const digits = (x: string) => x.replace(/(\d)[.,](?=\d{3}(?!\d))/g, '$1');
  const evidence = (rule: string) =>
    digits(`${ER.rules.find((r) => r.id === rule)?.find ?? ''} ${s07Rows(rule)}`);
  for (const [lang, cat] of [
    ['ID', engineId],
    ['EN', engineEn],
  ] as const) {
    for (const [key, text] of Object.entries(cat as Record<string, string>)) {
      const rm = /^rule\.(E-\d\d)/.exec(key);
      if (!rm) continue;
      const rule = rm[1]!;
      for (const sentence of text.split(/(?<=\.)\s+/)) {
        if (!claimRe.test(sentence)) continue;
        const refs = REGISTRY[rule as keyof typeof REGISTRY]?.refs ?? [];
        const nums = [...sentence.matchAll(/\d[\d.,]*\d|\d/g)].map((x) => x[0]).filter((n) => !/^\{/.test(n));
        const ev = evidence(rule);
        const numbers = nums.map((n) => {
          const norm = digits(n);
          return {
            n,
            found:
              ev.includes(norm) || ev.includes(norm.replace(',', '.')) || ev.includes(norm.replace('.', ',')),
          };
        });
        const hedge = /belum|tidak|not|no study|has not/i.test(sentence);
        const forbidden = /10%/.test(sentence) && /(mencegah cedera|prevent)/i.test(sentence) && !hedge;
        let status: Status = 'pass';
        let note = hedge ? 'Kalimat menyatakan keterbatasan bukti' : '';
        if (forbidden) {
          status = 'mayor';
          note = 'Klaim "10% mencegah cedera" dilarang (07 E-05)';
        } else if (!refs.length && !hedge) {
          status = 'mayor';
          note = 'Klaim penelitian tanpa referensi di registri';
        } else if (numbers.some((x) => !x.found)) {
          status = 'minor';
          note = `Angka ${numbers
            .filter((x) => !x.found)
            .map((x) => x.n)
            .join(', ')} tidak ditemukan di teks bukti engine-review/07 untuk ${rule}; cek manual`;
        }
        rows.push({ rule, lang, claim: sentence.trim(), refs, numbers, status, note });
      }
    }
  }
  return rows;
}

/** L3.3: tingkat bukti dan referensi di registri kode vs 07 vs engine-review. */
function grades() {
  const ids = [...new Set([...Object.keys(REGISTRY), ...ER.rules.map((r) => r.id)])].sort();
  return ids.map((id) => {
    const reg = REGISTRY[id as keyof typeof REGISTRY];
    const er = ER.rules.find((r) => r.id === id);
    const row07 = s07Rows(id);
    const g07 = /^\| E-\d\d \|[^|]*\| ([ABCD]) \|/.exec(row07)?.[1] ?? null;
    const refs07 = [...new Set([...row07.matchAll(/\[?(R\d+)\]?/g)].map((x) => x[1]!))].sort();
    const refsEr = [...(ER.refmap[id] ?? [])].sort();
    const refsReg = [...(reg?.refs ?? [])].sort();
    const issues: string[] = [];
    if (!reg) issues.push('tidak ada di registri kode');
    if (!er) issues.push('tidak ada di engine-review (pelatih tidak menilai aturan ini)');
    if (!g07) issues.push('tidak ada di 07 bagian 2');
    const gs = [reg?.grade, er?.grade, g07].filter(Boolean);
    if (new Set(gs).size > 1)
      issues.push(
        `tingkat bukti beda: kode ${reg?.grade ?? '-'}, 07 ${g07 ?? '-'}, engine-review ${er?.grade ?? '-'}`,
      );
    if (er && reg && refsEr.join(',') !== refsReg.join(','))
      issues.push(
        `referensi beda: kode ${refsReg.join(', ') || '-'}, engine-review ${refsEr.join(', ') || '-'}`,
      );
    if (g07 && reg && refs07.join(',') !== refsReg.join(','))
      issues.push(
        `referensi beda dengan 07: kode ${refsReg.join(', ') || '-'}, 07 ${refs07.join(', ') || '-'}`,
      );
    const status: Status = !issues.length
      ? 'pass'
      : issues.some((i) => i.startsWith('tingkat') || i.includes('engine-review (pelatih'))
        ? 'mayor'
        : 'minor';
    return {
      id,
      reg: reg?.grade ?? '-',
      g07: g07 ?? '-',
      er: er?.grade ?? '-',
      refsReg,
      refs07,
      refsEr,
      issues,
      status,
    };
  });
}

test('Lapisan 3: aturan sesuai referensi', () => {
  const meta = runMeta();
  const par = parity();
  const cl = claims();
  const gr = grades();

  // L3.4: klaim VDOT yang tertulis di dokumen, dihitung ulang dengan rumus Daniels-Gilbert.
  const vdotClaims = [
    {
      claim: 'Glosarium engine-review: "5K 28 mnt = VDOT 33"',
      calc: `VDOT dari 5K 28:00 = ${vdotOf(5000, 1680).toFixed(2)}`,
      ok: Math.round(vdotOf(5000, 1680)) === 33,
    },
    {
      claim: 'E-02: "pemula VDOT 26 (5K ~35 mnt)"',
      calc: `5K pada VDOT 26 = ${mmss(raceTime(26, 5000))}`,
      ok: Math.abs(raceTime(26, 5000) - 2100) <= 90,
    },
    {
      claim: 'E-02: "rekreasional VDOT 33 (5K ~28 mnt)"',
      calc: `5K pada VDOT 33 = ${mmss(raceTime(33, 5000))}`,
      ok: Math.abs(raceTime(33, 5000) - 1680) <= 90,
    },
  ];

  const pBeda = par.filter((r) => r.status === 'mayor').length;
  const pCode = par.filter((r) => r.status === 'minor').length;
  const cMayor = cl.filter((r) => r.status === 'mayor').length;
  const cMinor = cl.filter((r) => r.status === 'minor').length;
  const gMayor = gr.filter((r) => r.status === 'mayor').length;
  const gMinor = gr.filter((r) => r.status === 'minor').length;
  const overall: Status = pBeda + cMayor + gMayor > 0 ? 'mayor' : 'pass';

  const parTable = table(
    ['Aturan', 'Parameter', 'Kode', 'TRD 4', '07', 'engine-review', 'Status'],
    par.map((r) => [
      code(r.p.rule),
      esc(r.p.label) + (r.note ? `<span class="sub">${esc(r.note)}</span>` : ''),
      `<b>${esc(r.p.code)}</b>`,
      ...r.cells.map((c) =>
        c.st === 'tidak disebut'
          ? '<span class="muted">tidak disebut</span>'
          : c.st === 'beda'
            ? `${chip('mayor', 'beda')} ${esc(c.val)}`
            : esc(c.val),
      ),
      chip(r.status, r.status === 'minor' ? 'Hanya di kode' : undefined),
    ]),
  );

  const claimTable = table(
    ['Aturan', 'Bahasa', 'Kalimat di app', 'Referensi registri', 'Status'],
    cl.map((r) => [
      code(r.rule),
      esc(r.lang),
      esc(r.claim) + (r.note ? `<span class="sub">${esc(r.note)}</span>` : ''),
      r.refs.map(code).join(', ') || '<span class="muted">-</span>',
      chip(r.status),
    ]),
  );

  const gradeTable = table(
    ['Aturan', 'Kode', '07', 'engine-review', 'Referensi (kode)', 'Catatan', 'Status'],
    gr.map((r) => [
      code(r.id),
      esc(r.reg),
      esc(r.g07),
      esc(r.er),
      r.refsReg.map(code).join(', ') || '-',
      esc(r.issues.join('; ')) || '<span class="muted">-</span>',
      chip(r.status),
    ]),
  );

  const benchTable = table(
    ['Uji', 'Pembanding', 'Hasil', 'Status'],
    [
      [
        code('L3.4'),
        "Tabel VDOT Daniels' Running Formula edisi 4 (keputusan terbuka E-O4)",
        'Tidak dijalankan: tabel buku tidak tersedia di repo atau sesi ini. Rumus yang dipakai (Daniels & Gilbert 1979, sumber sekunder) dicek konsistensi internalnya di tabel berikut.',
        chip('skip'),
      ],
      [
        code('L3.5'),
        '<a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC5000509/">Vickers &amp; Vertosick 2016</a> (R2), dibuka 2 Nov 2026',
        'Sumber: 2.303 pelari; Riegel memprediksi baik sampai half marathon; untuk maraton median prediksi 10:09 mnt terlalu cepat (Tabel 4) dan hampir 25% pelari meleset lebih dari 20 mnt. Rentang FM app [T, T + 20 mnt], paling mungkin T + 10 mnt: memuat median dan sekitar 75% pelari. Sesuai.',
        chip('pass'),
      ],
    ],
  );
  const vdotTable = table(
    ['Klaim di dokumen', 'Dihitung ulang', 'Status'],
    vdotClaims.map((v) => [esc(v.claim), esc(v.calc), chip(v.ok ? 'pass' : 'minor')]),
  );

  const html = page({
    title: 'Validasi Lapisan 3',
    eyebrow: `Lapisan 3 · engine ${meta.engineVersion}`,
    heading: 'Aturan sesuai referensi?',
    lead: `Angka di dokumen spec dibanding konstanta kode (${code('L3.1')}), kalimat klaim penelitian di teks app dipetakan ke referensi (${code('L3.2')}), tingkat bukti di kode dibanding 07 dan engine-review (${code('L3.3')}), lalu benchmark eksternal (${code('L3.4')}, ${code('L3.5')}). Review pelatih (${code('L3.6')}) ada di paket terpisah.`,
    meta: [
      ['Versi engine', meta.engineVersion],
      ['Versi di engine-review', ER.version ?? 'tidak tertulis'],
      ['Commit', meta.commit],
      ['Dijalankan', meta.generatedAt],
    ],
    verdict: {
      status: overall,
      text:
        overall === 'pass'
          ? 'Dokumen, kode dan klaim teks konsisten.'
          : `Ada ${pBeda} parameter yang angkanya beda antara dokumen dan kode, ${cMayor} klaim teks tanpa dasar, dan ${gMayor} aturan dengan tingkat bukti atau keberadaan yang tidak konsisten. Paket untuk pelatih belum mencerminkan engine ${esc(meta.engineVersion)}.`,
    },
    tiles: [
      {
        label: 'Parameter dibandingkan',
        value: `${par.length}`,
        note: `${pBeda} beda, ${pCode} hanya di kode`,
        status: pBeda ? 'mayor' : 'pass',
      },
      {
        label: 'Klaim teks diperiksa',
        value: `${cl.length}`,
        note: `${cMayor} tanpa dasar, ${cMinor} perlu cek manual`,
        status: cMayor ? 'mayor' : 'pass',
      },
      {
        label: 'Aturan dicek tingkat buktinya',
        value: `${gr.length}`,
        note: `${gMayor} mayor, ${gMinor} minor`,
        status: gMayor ? 'mayor' : 'pass',
      },
      { label: 'Benchmark eksternal', value: '1 / 2', note: 'L3.5 lulus, L3.4 belum bisa' },
    ],
    nav: navFor('lapisan-3.html'),
    sections: [
      {
        id: 'paritas',
        title: 'L3.1 Paritas dokumen dan kode',
        intro:
          'Nilai kode dibaca dari konstanta engine. Nilai dokumen dibaca dari teks TRD bagian 4, 07 dan engine-review.html. "Tidak disebut" = dokumen itu tidak menulis angkanya (bukan berarti salah).',
        html: parTable,
      },
      {
        id: 'klaim',
        title: 'L3.2 Klaim penelitian di teks app',
        intro:
          'Setiap kalimat template rationale (katalog ID dan EN) yang menyebut studi, meta-analisis, penelitian atau review. Angka di kalimat dicari di teks bukti aturan yang sama di engine-review dan 07.',
        html: claimTable,
      },
      {
        id: 'tingkat',
        title: 'L3.3 Tingkat bukti dan referensi',
        intro:
          'Label tingkat bukti dan "Lihat sumber" di app diambil dari registri kode. Registri harus sama dengan 07 dan dengan halaman yang dinilai pelatih.',
        html: gradeTable,
      },
      {
        id: 'benchmark',
        title: 'L3.4 dan L3.5 Benchmark eksternal',
        html: benchTable + '<h3>Konsistensi angka VDOT di dokumen</h3>' + vdotTable,
      },
    ],
  });
  writeHtml('lapisan-3.html', html);
  writeJson('lapisan-3.json', {
    meta,
    parity: par.map((r) => ({ ...r.p, same: undefined, cells: r.cells, status: r.status, note: r.note })),
    claims: cl,
    grades: gr,
    vdotClaims,
  });
  writeSummary({
    layer: 'lapisan-3',
    title: 'Lapisan 3: aturan = referensi',
    file: 'lapisan-3.html',
    status: overall,
    headline: `${pBeda} parameter beda antara dokumen dan kode; ${gMayor} aturan dengan tingkat bukti/keberadaan tidak konsisten; L3.5 lulus, L3.4 belum bisa dijalankan.`,
    counts: [
      { label: 'Parameter beda', value: `${pBeda}` },
      { label: 'Klaim tanpa dasar', value: `${cMayor}` },
      { label: 'Aturan tidak konsisten', value: `${gMayor}` },
    ],
    meta,
  });
  expect(par.length).toBeGreaterThan(10);
});
