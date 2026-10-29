import { Text } from '@run-coach/ui';
import { Screen } from '@/components/Screen';
import { t } from '@/i18n/t';

export default function TodayTab() {
  return (
    <Screen>
      <Text variant="title">{t('tabs.today')}</Text>
    </Screen>
  );
}
