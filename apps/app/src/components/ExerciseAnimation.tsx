import { border, color, Icon, radius, space, Text } from '@run-coach/ui';
import { StyleSheet, View } from 'react-native';
import { t } from '@/i18n/t';

type Props = { exerciseId: string; dark?: boolean; height?: number };

/**
 * Tempat animasi gerakan strength/core (F-21). Fase 2 sengaja kosong: library belum punya
 * animasi (`animation: null`, format = D8, pipeline di docs/ANIMATION_PIPELINE.md). Saat animasi
 * siap, hanya isi komponen ini yang diganti; layar 2.2s dan 2.3s tidak berubah.
 */
export function ExerciseAnimation({ exerciseId, dark, height = space[10] * 4 }: Props) {
  const line = dark ? color.dark.line : color.lineStrong;
  const ink = dark ? color.dark.textMuted : color.textMuted;
  return (
    <View
      testID={`exercise-animation-${exerciseId}`}
      accessibilityLabel={t('strength.animationSoon')}
      style={[
        styles.box,
        { height, borderColor: line, backgroundColor: dark ? color.dark.surfaceSunken : color.surfaceSunken },
      ]}
    >
      <Icon name="strength" size={space[6]} color={ink} />
      <Text variant="caption" style={{ color: ink }} align="center">
        {t('strength.animationSoon')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: '100%',
    borderRadius: radius.md,
    borderWidth: border.selected,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[2],
  },
});
