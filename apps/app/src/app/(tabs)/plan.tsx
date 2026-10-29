import { Text } from '@run-coach/ui';
import { Screen } from '@/components/Screen';
import { t } from '@/i18n/t';

export default function PlanTab() {
  return (
    <Screen>
      <Text variant="title">{t('tabs.plan')}</Text>
    </Screen>
  );
}
