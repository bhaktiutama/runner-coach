import type { Rationale } from '@run-coach/training-engine';
import { border, color, LinkButton, radius, space, Text } from '@run-coach/ui';
import { useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { t } from '@/i18n/t';
import { rationaleView } from '@/lib/rationale';

const GRADE_DOT = {
  A: color.success,
  B: color.success,
  C: color.status.attentionInk,
  D: color.textMuted,
} as const;

/** Daftar alasan engine + pil tingkat bukti + "Lihat sumber" (07 bagian 3.3, wireframe OB8). */
export function RationaleList({ items, limit }: { items: Rationale[]; limit?: number }) {
  const [all, setAll] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const shown = !limit || all ? items : items.slice(0, limit);
  return (
    <>
      {shown.map((r, i) => {
        const v = rationaleView(r);
        const key = `${r.rule}-${i}`;
        const grade = (v.gradeKey ?? 'D') as keyof typeof GRADE_DOT;
        return (
          <View key={key} style={styles.item} testID={`rationale-${r.rule}`}>
            <Text variant="bodySm">{v.text}</Text>
            <View style={styles.meta}>
              <View style={styles.grade}>
                <View style={[styles.dot, { backgroundColor: GRADE_DOT[grade] }]} />
                <Text variant="captionStrong">{v.gradeLabel}</Text>
              </View>
              {v.refs.length ? (
                <Pressable onPress={() => setOpen(open === key ? null : key)} accessibilityRole="button">
                  <Text variant="captionStrong" color="primaryInk" style={styles.underline}>
                    {open === key ? t('preview.hideSources') : t('preview.sources')}
                  </Text>
                </Pressable>
              ) : null}
            </View>
            {open === key
              ? v.refs.map((ref) => (
                  <Text
                    key={ref.id}
                    variant="note"
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
        <View style={styles.more}>
          <LinkButton
            label={all ? t('preview.seeLess') : t('preview.seeAll', { n: items.length })}
            onPress={() => setAll(!all)}
          />
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  item: {
    gap: space[1] + space[1] / 2,
    paddingBottom: space[3],
    borderBottomWidth: border.hairline,
    borderBottomColor: color.line,
  },
  meta: { flexDirection: 'row', alignItems: 'center', gap: space[2] + space[1] / 2, flexWrap: 'wrap' },
  grade: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1] + space[1] / 2,
    backgroundColor: color.surfaceSunken,
    borderRadius: radius.stadium,
    paddingHorizontal: space[2] + space[1] / 2,
    paddingVertical: border.selected,
  },
  dot: { width: space[2], height: space[2], borderRadius: radius.stadium },
  underline: { textDecorationLine: 'underline' },
  more: { alignItems: 'flex-start' },
});
