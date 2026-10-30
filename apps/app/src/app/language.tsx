import { ChoiceCard, IconButton, space, Text } from '@run-coach/ui';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { useProfile, useUpdateProfile } from '@/data/hooks';
import { deviceLocale, LOCALE_PREFS, resolveLocale } from '@/i18n/locale';
import { languageLabel, t } from '@/i18n/t';

/** 4.8 Bahasa (F-22): Ikuti perangkat / Bahasa Indonesia / English. Tersimpan di profile.locale. */
export default function Language() {
  const profile = useProfile();
  const update = useUpdateProfile();
  const cur = profile.data?.locale ?? 'id-ID';
  const back = () => (router.canGoBack() ? router.back() : router.replace('/profile'));
  return (
    <Screen testID="screen-language">
      <IconButton icon="back" label={t('common.back')} onPress={back} testID="back" />
      <View style={styles.head}>
        <Text variant="title">{t('language.title')}</Text>
        <Text color="textMuted">{t('language.subtitle')}</Text>
      </View>
      <View style={styles.list}>
        {LOCALE_PREFS.map((p) => (
          <ChoiceCard
            key={p}
            wide
            title={languageLabel(p)}
            subtitle={
              p === 'system'
                ? t('language.systemSub', { lang: languageLabel(resolveLocale('system', deviceLocale())) })
                : undefined
            }
            selected={cur === p}
            onPress={() => update.mutate({ locale: p })}
            testID={`lang-${p}`}
          />
        ))}
      </View>
      <Text variant="caption" color="textMuted">
        {t('language.note')}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { gap: space[2] },
  list: { gap: space[2] },
});
