import type { RuleId } from '../types';

// Registri aturan engine (07 bagian 2). Setiap aturan TRD 4.2/4.3 wajib ada di sini
// (test 07 bagian 3.5 no. 1). Teks template di i18n/id.ts dengan kunci `rule.<ID>`.

export type Grade = 'A' | 'B' | 'C' | 'D';

export type RuleEntry = {
  id: RuleId;
  grade: Grade;
  refs: string[];
};

// Placeholder template ada di i18n/id.ts (`rule.<ID>`); test memastikan semuanya terisi `values`.
const r = (id: RuleId, grade: Grade, refs: string[]): RuleEntry => ({ id, grade, refs });

export const RULES: Record<RuleId, RuleEntry> = Object.fromEntries(
  [
    r('E-01', 'C', ['R1', 'R2']),
    r('E-02', 'C', ['R3']),
    r('E-03', 'D', []),
    r('E-04', 'C', ['R4']),
    r('E-05', 'B', ['R5', 'R6', 'R7']),
    r('E-06', 'B', ['R7']),
    r('E-07', 'D', ['R4']),
    r('E-08', 'D', ['R8']),
    r('E-09', 'A', ['R9', 'R10']),
    r('E-10', 'C', ['R11', 'R12']),
    r('E-11', 'A', ['R13']),
    r('E-12', 'C', ['R17', 'R18']),
    r('E-13', 'C', ['R19']),
    r('E-14', 'B', ['R14', 'R12']),
    r('E-15', 'C', ['R15', 'R16']),
    r('E-16', 'B', ['R20', 'R21']),
    r('E-17', 'D', ['R4']),
    r('E-18', 'D', []),
    r('E-19', 'D', []),
    r('E-20', 'C', ['R3']),
  ].map((e) => [e.id, e]),
) as Record<RuleId, RuleEntry>;

export const GRADE_LABEL_KEY: Record<Grade, string> = {
  A: 'grade.A',
  B: 'grade.B',
  C: 'grade.C',
  D: 'grade.D',
};
