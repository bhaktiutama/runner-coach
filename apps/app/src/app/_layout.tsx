import {
  BricolageGrotesque_500Medium,
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
} from '@expo-google-fonts/bricolage-grotesque';
import {
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { color, setColorScheme } from '@run-coach/ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DbGate } from '@/components/DbGate';
import { LocaleGate } from '@/components/LocaleGate';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } }),
  );
  const [fontsLoaded, fontError] = useFonts({
    BricolageGrotesque_500Medium,
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  const ready = fontsLoaded || !!fontError;
  // Mode gelap (F-24): ikut tema perangkat. Palet diset sebelum anak dirender; saat tema berganti
  // pohon layar di-remount (key) supaya gaya `themed()` dibaca ulang.
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  setColorScheme(scheme);

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <DbGate>
          <LocaleGate>
            <Stack
              key={scheme}
              screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.bg } }}
            >
              <Stack.Screen
                name="move/[id]"
                options={{
                  presentation: 'transparentModal',
                  animation: 'fade',
                  contentStyle: { backgroundColor: 'transparent' },
                }}
              />
            </Stack>
          </LocaleGate>
        </DbGate>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
