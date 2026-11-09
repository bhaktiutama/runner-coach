import { tokens } from '@run-coach/ui/tokens';
import { spotIconSvg } from '@run-coach/ui/spot';
import { afterEach, describe, expect, it } from 'vitest';
import { applyLocale } from '../src/i18n/locale';
import {
  achievementCard,
  activityCard,
  activityHighlight,
  CARD_H,
  CARD_W,
  cardSvg,
  planCard,
  svgInner,
  weekCard,
  weekDays,
  wrapText,
  type ActivityInput,
  type CardPalette,
} from '../src/lib/shareCard';

// Kartu bagikan (F-29, 10-SHARE bagian 3, 8). Dibuat di HP; tidak boleh memuat data kesehatan.
const c = tokens.color;
const P: CardPalette = {
  dark: false,
  bg: c.bg,
  surface: c.surface,
  surfaceSunken: c.surfaceSunken,
  text: c.text,
  textMuted: c.textMuted,
  line: c.line,
  primary: c.primary,
  onPrimary: c.onPrimary,
  success: c.success,
  zone: c.zone,
  onZone: {
    recovery: c.zone.onRecovery,
    easy: c.zone.onEasy,
    long: c.zone.onLong,
    tempo: c.zone.onTempo,
    interval: c.zone.onInterval,
    strength: c.zone.onStrength,
  },
  phase: c.phase,
};

const run: ActivityInput = {
  type: 'long',
  distanceM: 12000,
  durationS: 4320,
  date: '2026-11-08',
  unit: 'km',
  showPace: true,
  weekIndex: 5,
  weeksTotal: 12,
  goal: '10k',
};

afterEach(() => void applyLocale('id-ID'));

describe('kartu latihan selesai', () => {
  it('lari: jarak besar + satuan, durasi, pace, tanggal, konteks minggu', () => {
    const m = activityCard(run, P);
    expect(m.hero).toEqual({ value: '12', unit: 'km' });
    expect(m.stats.map((s) => s.label)).toEqual(['Durasi', 'Pace', 'Tanggal']);
    expect(m.stats[0]!.value).toBe('1:12:00');
    expect(m.stats[1]!.value).toContain('6:00');
    expect(m.context).toBe('Minggu 5 dari 12 · Menuju 10K');
    expect(m.accent).toBe(c.zone.long);
  });
  it('pace bisa disembunyikan; mil memakai satuan mi', () => {
    expect(activityCard({ ...run, showPace: false }, P).stats.map((s) => s.label)).toEqual([
      'Durasi',
      'Tanggal',
    ]);
    expect(activityCard({ ...run, unit: 'mi' }, P).hero?.unit).toBe('mi');
  });
  it('strength: menit + jumlah gerakan, tanpa jarak/pace', () => {
    const m = activityCard({ ...run, type: 'strength', distanceM: 0, durationS: 1500, exercises: 6 }, P);
    expect(m.hero).toEqual({ value: '25', unit: 'mnt' });
    expect(m.stats.map((s) => s.label)).toEqual(['Gerakan', 'Tanggal']);
  });
  it('RPE, tag, catatan, HR tidak pernah masuk gambar, walau ada di objek masukan', () => {
    const leaky = { ...run, rpe: 9, tags: ['pain'], notes: 'lutut kiri nyeri', avg_hr: 171 };
    const svg = cardSvg(activityCard(leaky as ActivityInput, P), P);
    for (const s of ['lutut', 'nyeri', 'RPE', '171', 'pain']) expect(svg).not.toContain(s);
  });
  it('nama hanya jika diberikan (sakelar 2.7)', () => {
    expect(cardSvg(activityCard(run, P), P)).not.toContain('Bhakti');
    expect(cardSvg(activityCard({ ...run, name: 'Bhakti' }, P), P)).toContain('Bhakti');
  });
  it('sorotan 5K pertama dan lari terjauh', () => {
    expect(activityCard({ ...run, highlight: 'record' }, P).highlight).toBe('Lari terjauh di plan ini');
    expect(activityCard({ ...run, highlight: 'first_5k' }, P).highlight).toBe('5K pertama!');
  });
  it('English', () => {
    applyLocale('en-US');
    const m = activityCard(run, P);
    expect(m.kicker).toBe('WORKOUT DONE');
    expect(activityCard({ ...run, distanceM: 12400 }, { ...P }).hero?.value).toBe('12.4');
    expect(activityCard({ ...run, distanceM: 12400 }, P).hero?.value).toBe('12.4');
    expect(m.context).toBe('Week 5 of 12 · Road to 10K');
  });
});

describe('SVG kartu', () => {
  it('1080 x 1920, teks di-escape, merek ada', () => {
    const svg = cardSvg(
      planCard(
        {
          goal: 'hm',
          raceName: 'Jakarta <Run> & Co',
          raceDate: '2027-03-01',
          weeks: [],
          daysPerWeek: 4,
          unit: 'km',
        },
        P,
      ),
      P,
    );
    expect(
      svg.startsWith(`<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_W}" height="${CARD_H}"`),
    ).toBe(true);
    expect(svg).toContain('Jakarta &lt;Run&gt; &amp; Co');
    expect(svg).not.toContain('<Run>');
    expect(svg).toContain('RunCo');
  });
  it('font web hanya disisipkan untuk ekspor', () => {
    const m = activityCard(run, P);
    expect(cardSvg(m, P)).not.toContain('<style>');
    expect(cardSvg(m, P, { fontCss: '@font-face{}' })).toContain('<style>@font-face{}</style>');
  });
  it('ikon spot disisipkan sebagai grup', () => {
    const body = svgInner(spotIconSvg('long'));
    expect(body.startsWith('<svg')).toBe(false);
    expect(cardSvg(activityCard({ ...run, icon: body }, P), P)).toContain(body);
  });
});

describe('kartu ringkasan minggu', () => {
  it('semua tuntas: aksen sukses, 7 hari, jarak + waktu', () => {
    const m = weekCard(
      {
        weekIndex: 3,
        weeksTotal: 10,
        done: 4,
        total: 4,
        distanceM: 21500,
        durationS: 9000,
        unit: 'km',
        phase: 'build',
        goal: '10k',
        days: ['done', 'rest', 'done', 'rest', 'done', 'rest', 'done'],
      },
      P,
    );
    expect(m.kicker).toBe('MINGGU 3 TUNTAS');
    expect(m.title).toBe('Semua latihan tuntas');
    expect(m.hero).toEqual({ value: '21,5', unit: 'km' });
    expect(m.days).toHaveLength(7);
    expect(m.days![0]!.label).toBe('Sen');
    expect(m.accent).toBe(c.success);
  });
  it('sebagian: judul jumlah selesai', () => {
    const m = weekCard(
      {
        weekIndex: 2,
        weeksTotal: 10,
        done: 2,
        total: 4,
        distanceM: 8000,
        durationS: 3000,
        unit: 'km',
        days: [],
      },
      P,
    );
    expect(m.kicker).toBe('MINGGU 2');
    expect(m.title).toBe('2 dari 4 latihan selesai');
  });
  it('weekDays: selesai, terlewat, akan datang, tanpa lari', () => {
    const ws = [
      { date: '2026-11-02', type: 'easy' as const, status: 'completed' },
      { date: '2026-11-03', type: 'rest' as const, status: 'scheduled' },
      { date: '2026-11-04', type: 'tempo' as const, status: 'missed' },
      { date: '2026-11-06', type: 'easy' as const, status: 'scheduled' },
      { date: '2026-11-08', type: 'long' as const, status: 'scheduled' },
    ];
    expect(weekDays('2026-11-02', '2026-11-07', ws)).toEqual([
      'done',
      'rest',
      'missed',
      'rest',
      'missed',
      'rest',
      'planned',
    ]);
  });
});

describe('kartu pencapaian dan plan', () => {
  it('pencapaian: nama badge + keterangan', () => {
    const m = achievementCard({ id: 'streak_4', goal: 'fitness' }, P);
    expect(m.title).toBe('4 minggu beruntun');
    expect(m.body).toContain('4 minggu beruntun');
    expect(m.context).toBe('Lari untuk bugar');
  });
  it('plan: hitung mundur race, fase digabung, minggu ini ditandai', () => {
    const m = planCard(
      {
        goal: '10k',
        raceDate: '2027-01-10',
        daysToRace: 64,
        weeks: [
          { phase: 'base' },
          { phase: 'base' },
          { phase: 'build' },
          { phase: 'build' },
          { phase: 'taper' },
        ],
        currentWeek: 3,
        daysPerWeek: 4,
        peakM: 32000,
        unit: 'km',
      },
      P,
    );
    expect(m.hero).toEqual({ value: '64', unit: 'hari ke race' });
    expect(m.phases).toEqual([
      { color: c.phase.base, weeks: 2, current: false },
      { color: c.phase.build, weeks: 1, current: true },
      { color: c.phase.build, weeks: 1, current: false },
      { color: c.phase.taper, weeks: 1, current: false },
    ]);
    expect(m.stats.map((s) => s.value)).toEqual(['5', '4', '32 km']);
    expect(m.context).toBe('Minggu 3 dari 5');
  });
  it('plan tanpa race: jumlah minggu', () => {
    expect(
      planCard({ goal: 'fitness', weeks: [{ phase: 'base' }], daysPerWeek: 3, unit: 'km' }, P).hero,
    ).toEqual({
      value: '1',
      unit: 'minggu',
    });
  });
});

describe('activityHighlight', () => {
  const a = (id: string, km: number, day: number, type: 'easy' | 'long' | 'strength' = 'easy') => ({
    id,
    distance_m: km * 1000,
    started_at: `2026-11-${String(day).padStart(2, '0')}T06:00:00Z`,
    workout_type: type,
  });
  it('aktivitas pertama >= 5 km = 5K pertama', () => {
    const all = [a('1', 3, 1), a('2', 5, 3), a('3', 6, 5)];
    expect(activityHighlight(all[1]!, all, '2026-11-01')).toBe('first_5k');
    expect(activityHighlight(all[2]!, all, '2026-11-01')).toBe('record');
  });
  it('rekor butuh minimal 3 lari di plan; strength tidak dihitung', () => {
    const two = [a('1', 6, 1), a('2', 8, 3), a('s', 0, 4, 'strength')];
    expect(activityHighlight(two[1]!, two, '2026-11-01')).toBeNull();
    const many = [a('1', 6, 1), a('2', 4, 3), a('3', 10, 5), a('4', 7, 6)];
    expect(activityHighlight(many[2]!, many, '2026-11-01')).toBe('record');
    expect(activityHighlight(many[3]!, many, '2026-11-01')).toBeNull();
  });
});

describe('wrapText', () => {
  it('bungkus per kata, baris lebih jadi elipsis', () => {
    expect(wrapText('Menuju Half Marathon Jakarta', 12, 2)).toEqual(['Menuju Half', 'Marathon…']);
    expect(wrapText('Easy', 12, 2)).toEqual(['Easy']);
  });
});
