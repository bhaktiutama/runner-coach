import { Text } from '@run-coach/ui';
import { Screen } from '@/components/Screen';
import { t } from '@/i18n/t';

export default function ProgressTab() {
  return (
    <Screen>
      <Text variant="title">{t('tabs.progress')}</Text>
    </Screen>
  );
}
