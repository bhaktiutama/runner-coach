import { RULES } from '@run-coach/training-engine';
import { describe, expect, it } from 'vitest';
import { HELP, HELP_TOPIC_IDS } from '../src/i18n/help';

// F-20: Panduan harus mencakup setiap aturan engine dan setiap topik yang dirujuk hint (i).
describe('Panduan & istilah (F-20)', () => {
  it('setiap aturan di registri engine punya topik penjelasan', () => {
    const ruleTopics = HELP.flatMap((g) => g.topics)
      .map((x) => x.rule)
      .filter(Boolean);
    for (const id of Object.keys(RULES)) expect(ruleTopics).toContain(id);
  });

  it('id topik unik dan isi tidak kosong', () => {
    expect(new Set(HELP_TOPIC_IDS).size).toBe(HELP_TOPIC_IDS.length);
    for (const x of HELP.flatMap((g) => g.topics)) {
      expect(x.title.length).toBeGreaterThan(0);
      expect(x.body.length).toBeGreaterThan(40);
    }
  });

  it('topik yang dirujuk hint (i) ada', () => {
    const used = [
      'volume',
      'volume-puncak',
      'zona',
      'rpe',
      'fase',
      'kepatuhan',
      'prediksi',
      'easy',
      'recovery',
      'long',
      'tempo',
      'interval',
      'strides',
      'run-walk',
      'istirahat',
    ];
    for (const id of used) expect(HELP_TOPIC_IDS).toContain(id);
  });
});
