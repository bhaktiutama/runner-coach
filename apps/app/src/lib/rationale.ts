import {
  engineEn,
  engineId,
  REFERENCES,
  RULES,
  type EngineMessageKey,
  type Rationale,
  type Reference,
} from '@run-coach/training-engine';
import { formatDistance, formatNumber, formatPace, formatRaceTime, type Unit } from '@run-coach/ui/format';
import { currentLang } from '@/i18n/locale';

// Ubah rationale engine `{rule, values}` jadi teks (07 bagian 3). Format nilai dari akhiran kunci:
// `_m` jarak, `_s` waktu, `_pace` pace, `_code` kode jarak target, lainnya angka.

/** Katalog engine bahasa aktif (F-22). */
export function engineCatalog(): Record<EngineMessageKey, string> {
  return currentLang() === 'en' ? engineEn : engineId;
}

export function et(key: EngineMessageKey): string {
  return engineCatalog()[key];
}

function formatValue(key: string, v: number | string, unit: Unit): string {
  if (typeof v === 'string') {
    if (key.endsWith('_code')) return engineCatalog()[`distance.${v}` as EngineMessageKey] ?? v;
    return v;
  }
  if (key.endsWith('_m')) return formatDistance(v, unit);
  if (key.endsWith('_s')) return formatRaceTime(v);
  if (key.endsWith('_pace')) return formatPace(v, unit);
  return formatNumber(v, 1);
}

export function rationaleText(r: Rationale, unit: Unit = 'km'): string {
  // Varian template (mis. `rule.E-06.plan`, `rule.E-25.down`) dipakai jika engine mengisi `scope`.
  const cat = engineCatalog();
  const scoped =
    typeof r.values.scope === 'string'
      ? cat[`rule.${r.rule}.${r.values.scope}` as EngineMessageKey]
      : undefined;
  const tpl = scoped ?? cat[`rule.${r.rule}` as EngineMessageKey] ?? r.rule;
  return tpl.replace(/\{(\w+)\}/g, (m, k: string) =>
    k in r.values ? formatValue(k, r.values[k]!, unit) : m,
  );
}

export type RationaleView = {
  id: string;
  text: string;
  gradeKey: string | null;
  gradeLabel: string;
  refs: Reference[];
};

export function rationaleView(r: Rationale, unit: Unit = 'km'): RationaleView {
  const entry = RULES[r.rule];
  return {
    id: r.rule,
    text: rationaleText(r, unit),
    gradeKey: entry?.grade ?? null,
    gradeLabel: entry ? et(`grade.${entry.grade}` as EngineMessageKey) : '',
    refs: (entry?.refs ?? [])
      .map((id) => REFERENCES[id])
      .filter((x): x is Reference => !!x)
      .map((x) => ({ ...x, short: refShort(x) })),
  };
}

/** Sitasi singkat ditulis "dkk."; versi EN memakai "et al.". */
export function refShort(r: Reference): string {
  return currentLang() === 'en' ? r.short.replace(' dkk.', ' et al.') : r.short;
}
