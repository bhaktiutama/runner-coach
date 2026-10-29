import type { Rationale } from '@run-coach/training-engine';
import { border, color, LinkButton, radius, space, Text } from '@run-coach/ui';
import { useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { t } from '@/i18n/t';
import { rationaleView } from '@/lib/rationale';

/** Daftar alasan engine + label bukti + "Lihat sumber" (07 bagian 3.3). Tautan dibuka di browser luar. */
export function RationaleList({ items, limit }: { items: Rationale[]; limit?: number }) {
  const [all, setAll] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const shown = !limit || all ? items : items.slice(0, limit);
  return (
    <View style={styles.list}>
      {shown.map((r, i) => {
        const v = rationaleView(r);
        const key = `${r.rule}-${i}`;
        return (
          <View key={key} style={[styles.item, i > 0 && styles.sep]} testID={`rationale-${r.rule}`}>
            <Text>{v.text}</Text>
            <View style={styles.meta}>
              <View style={styles.grade}>
                <View style={styles.dot} />
                <Text variant="label">{v.gradeLabel}</Text>
              </View>
              {v.refs.length ? (
                <LinkButton
                  label={open === key ? t('preview.hideSources') : t('preview.sources')}
                  onPress={() => setOpen(open === key ? null : key)}
                />
              ) : null}
            </View>
            {open === key
              ? v.refs.map((ref) => (
                  <Text
                    key={ref.id}
                    variant="label"
                    color={ref.url ? 'primaryInk' : 'textMuted'}
                    onPress={ref.url ? () => void Linking.openURL(ref.url!) : undefined}
                  >
                    {ref.short}
                  </Text>
                ))
              : null}
          </View>
        );
      })}
      {limit && items.length > limit ? (
        <LinkButton
          label={all ? t('preview.seeLess') : t('preview.seeAll', { n: items.length })}
          onPress={() => setAll(!all)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: space[1] },
  item: { gap: space[2], paddingVertical: space[3] },
  sep: { borderTopWidth: border.hairline, borderTopColor: color.line },
  meta: { flexDirection: 'row', alignItems: 'center', gap: space[3], flexWrap: 'wrap' },
  grade: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    backgroundColor: color.surfaceSunken,
    borderRadius: radius.stadium,
    paddingHorizontal: space[3],
    paddingVertical: space[1],
  },
  dot: { width: space[2], height: space[2], borderRadius: radius.stadium, backgroundColor: color.success },
});
