import { StyleSheet, View, type ViewProps } from 'react-native';
import { border, color, radius, ring, shadow, space, themed } from '../theme';

export function Card({
  style,
  variant = 'raised',
  ...rest
}: ViewProps & { variant?: 'raised' | 'outline' | 'sunken' }) {
  return <View {...rest} style={[styles.base, styles[variant], style]} />;
}

const styles = themed(() =>
  StyleSheet.create({
    base: { borderRadius: radius.lg, padding: space[5] },
    raised: { backgroundColor: color.surface, ...shadow.card },
    outline: { backgroundColor: color.surface, ...ring(border.hairline, color.line) },
    sunken: { backgroundColor: color.surfaceSunken },
  }),
);
