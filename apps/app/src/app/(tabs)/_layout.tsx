import { color } from '@run-coach/ui';
import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { TabBar } from '@/components/TabBar';
import { useActivePlan, useDraft } from '@/data/hooks';
import { t } from '@/i18n/t';

/** Gerbang: onboarding belum selesai -> lanjut langkah terakhir; belum ada plan -> 1.1. */
export default function TabsLayout() {
  const { draft, isPending } = useDraft();
  const plan = useActivePlan();
  if (isPending || plan.isPending) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: color.bg }}>
        <ActivityIndicator color={color.primary} />
      </View>
    );
  }
  if (draft) return <Redirect href={`/onboarding/${draft.step}`} />;
  if (!plan.data) return <Redirect href="/welcome" />;
  return (
    <Tabs
      tabBar={(p) => <TabBar {...p} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: color.bg } }}
    >
      <Tabs.Screen name="index" options={{ title: t('tabs.today') }} />
      <Tabs.Screen name="plan" options={{ title: t('tabs.plan') }} />
      <Tabs.Screen name="progress" options={{ title: t('tabs.progress') }} />
      <Tabs.Screen name="profile" options={{ title: t('tabs.profile') }} />
    </Tabs>
  );
}
