import type { BottomTabBarProps } from 'expo-router/tabs';
import { border, color, Icon, type IconName, radius, size, space, Text } from '@run-coach/ui';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const icons: Record<string, IconName> = {
  index: 'today',
  plan: 'plan',
  progress: 'progress',
  profile: 'profile',
};

export function TabBar({ state, descriptors, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, space[2]) }]}>
      {state.routes.map((route, i) => {
        const focused = state.index === i;
        const label = String(descriptors[route.key]?.options.title ?? route.name);
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={label}
            testID={`tab-${route.name}`}
            onPress={() => {
              if (!focused) navigateToTab(route.key);
            }}
            style={styles.item}
          >
            <View style={[styles.pill, focused && styles.pillActive]}>
              <Icon name={icons[route.name] ?? 'today'} color={focused ? color.text : color.textMuted} />
            </View>
            <Text variant="label" color={focused ? 'text' : 'textMuted'}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: color.bg,
    borderTopWidth: border.hairline,
    borderTopColor: color.line,
    paddingTop: space[2],
  },
  item: { flex: 1, alignItems: 'center', gap: space[1], minHeight: size.touchMin },
  pill: { paddingHorizontal: space[5], paddingVertical: space[1], borderRadius: radius.stadium },
  pillActive: { backgroundColor: color.surfaceSunken },
});
