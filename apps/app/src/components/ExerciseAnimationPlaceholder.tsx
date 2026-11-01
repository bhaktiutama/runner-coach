import { border, color, Icon, radius, space, Text, themed } from '@run-coach/ui';
import { StyleSheet, View } from 'react-native';
import { t } from '@/i18n/t';

type Props = { exerciseId: string; dark?: boolean; height?: number };

/** Tempat animasi kosong untuk gerakan yang belum punya animasi (F-21, D8). */
export function ExerciseAnimationPlaceholder({ exerciseId, dark, height = space[10] * 4 }: Props) {
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

const styles = themed(() =>
  StyleSheet.create({
    box: {
      width: '100%',
      borderRadius: radius.md,
      borderWidth: border.selected,
      borderStyle: 'dashed',
      alignItems: 'center',
      justifyContent: 'center',
      gap: space[2],
    },
  }),
);
