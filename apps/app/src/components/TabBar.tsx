import type { BottomTabBarProps } from 'expo-router/tabs';
import { border, color, fontFiles, Icon, type IconName, radius, size, space, Text } from '@run-coach/ui';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const icons: Record<string, IconName> = {
  index: 'today',
  plan: 'plan',
  progress: 'progress',
  profile: 'profile',
};

/** Tab bar (wireframe Today nav): 4 kolom, padding 8/8/28, pil ikon 56x30, label 12. */
export function TabBar({ state, descriptors, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(space[6] + space[1], insets.bottom) }]}>
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
              <Icon
                name={icons[route.name] ?? 'today'}
                size={size.iconSm}
                color={focused ? color.text : color.textMuted}
              />
            </View>
            <Text variant="tab" color={focused ? 'text' : 'textMuted'} style={focused && styles.active}>
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
    backgroundColor: color.surface,
    boxShadow: `inset 0px ${border.hairline}px 0px 0px ${color.line}`,
    paddingTop: space[2],
    paddingHorizontal: space[2],
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[1],
    minHeight: size.touchMin + space[2],
  },
  pill: {
    width: space[10] + space[4],
    height: space[8] - space[1] / 2,
    borderRadius: radius.stadium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: { backgroundColor: color.surfaceSunken },
  active: { fontFamily: fontFiles.ui800 },
});
