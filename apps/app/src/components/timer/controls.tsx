// Tombol dan konfirmasi layar timer (dipisah dari app/timer/[id].tsx, tanpa perubahan perilaku).
import { Icon, type IconName, PrimaryButton, size, Text } from '@run-coach/ui';
import { type ReactNode, useState } from 'react';
import { Pressable, View } from 'react-native';
import { t } from '@/i18n/t';
import { holdHaptic } from '@/timer/cues';
import { dark, styles } from './styles';

/** Lama tahan untuk Selesai set (U2). */
const HOLD_MS = 500;

export function Confirm({ onYes, onNo }: { onYes: () => void; onNo: () => void }) {
  return (
    <View style={styles.overlay} testID="timer-confirm">
      <View style={styles.dialog}>
        <Text variant="title" color="darkText">
          {t('timer.confirmTitle')}
        </Text>
        <Text variant="bodySm" color="darkTextMuted">
          {t('timer.confirmBody')}
        </Text>
        <PrimaryButton label={t('timer.confirmYes')} testID="timer-confirm-yes" onPress={onYes} />
        <DarkButton label={t('common.cancel')} onPress={onNo} />
      </View>
    </View>
  );
}

/** 2.3b segmen drill (wireframe TimerDrill). */

export function HoldToFinish({
  enabled,
  onDone,
  children,
}: {
  enabled: boolean;
  onDone: () => void;
  children: ReactNode;
}) {
  const [holding, setHolding] = useState(false);
  return (
    <Pressable
      // Tanpa `disabled`: di web itu menandai semua isi (termasuk tombol +15 dtk) sebagai nonaktif.
      accessible={false}
      delayLongPress={HOLD_MS}
      onPressIn={enabled ? () => setHolding(true) : undefined}
      onPressOut={() => setHolding(false)}
      onLongPress={
        enabled
          ? () => {
              setHolding(false);
              holdHaptic();
              onDone();
            }
          : undefined
      }
      style={[styles.flex, holding && styles.holding]}
      testID="hold-to-finish"
    >
      {children}
    </Pressable>
  );
}

/** Pil mode otomatis/manual di bar atas (09-VOICE bagian 6). */
export function AutoPill({
  on,
  onPress,
  disabled,
}: {
  on: boolean;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      aria-checked={on}
      aria-disabled={disabled}
      accessibilityLabel={t('timer.autoLabel')}
      onPress={onPress}
      disabled={disabled}
      testID="timer-auto"
      style={[
        styles.autoPill,
        { backgroundColor: on ? dark.text : dark.surface, opacity: disabled ? 0.4 : 1 },
      ]}
    >
      <Icon name={on ? 'sync' : 'move'} size={size.iconSm} color={on ? dark.bg : dark.text} />
      <Text variant="controlSmStrong" style={{ color: on ? dark.bg : dark.text }}>
        {on ? t('timer.autoOn') : t('timer.autoOff')}
      </Text>
    </Pressable>
  );
}

export function RoundButton(p: {
  icon: IconName;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  active?: boolean;
  testID?: string;
  small?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={p.label}
      onPress={p.onPress}
      disabled={p.disabled}
      testID={p.testID}
      style={[
        p.small ? styles.roundSm : styles.round,
        { opacity: p.disabled ? 0.4 : 1, backgroundColor: p.active ? dark.text : dark.surface },
      ]}
    >
      <Icon name={p.icon} size={size.iconSm} color={p.active ? dark.bg : dark.text} />
    </Pressable>
  );
}

export function DarkButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.endPill, styles.darkBtn]}>
      <Text variant="row" color="darkText" align="center">
        {label}
      </Text>
    </Pressable>
  );
}
