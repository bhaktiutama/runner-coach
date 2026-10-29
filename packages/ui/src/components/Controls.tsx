import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { border, color, radius, size, space, typography } from '../theme';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

/** Tombol ikon bulat (mis. kembali), area sentuh >= 44. */
export function IconButton({
  icon,
  label,
  onPress,
  variant = 'outline',
  disabled,
  testID,
}: {
  icon: IconName;
  label: string;
  onPress?: () => void;
  variant?: 'outline' | 'sunken' | 'primary';
  disabled?: boolean;
  testID?: string;
}) {
  const bg =
    variant === 'primary' ? color.primary : variant === 'sunken' ? color.surfaceSunken : color.surface;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.iconBtn,
        { backgroundColor: bg, opacity: disabled ? 0.4 : pressed ? 0.7 : 1 },
        variant === 'outline' && styles.outline,
      ]}
    >
      <Icon name={icon} color={variant === 'primary' ? color.onPrimary : color.text} />
    </Pressable>
  );
}

/** Kartu pilihan besar (1.2). */
export function ChoiceCard({
  title,
  subtitle,
  selected,
  onPress,
  testID,
  wide,
}: {
  title: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
  testID?: string;
  wide?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={title}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.choice,
        wide && styles.choiceWide,
        selected ? styles.choiceSelected : null,
        { opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <View style={styles.choiceHead}>
        <Text variant={wide ? 'heading' : 'title'} style={styles.flex}>
          {title}
        </Text>
        {selected ? (
          <View style={styles.check}>
            <Icon name="check" size={18} color={color.palette.cream} />
          </View>
        ) : wide ? (
          <Icon name="chevron-right" />
        ) : null}
      </View>
      {subtitle ? <Text color="textMuted">{subtitle}</Text> : null}
    </Pressable>
  );
}

/** Chip stadium (pilihan cepat). */
export function Chip({
  label,
  selected,
  onPress,
  testID,
  disabled,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  testID?: string;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected, disabled: !!disabled }}
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.chipSelected : null,
        { opacity: disabled ? 0.4 : pressed ? 0.8 : 1 },
      ]}
    >
      <Text variant="heading" style={{ color: selected ? color.palette.cream : color.text }}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Segmented control 2-3 item. */
export function SegmentedControl<T extends string>({
  items,
  value,
  onChange,
  testID,
}: {
  items: { value: T; label: string; disabled?: boolean }[];
  value: T;
  onChange: (v: T) => void;
  testID?: string;
}) {
  return (
    <View style={styles.seg} accessibilityRole="tablist" testID={testID}>
      {items.map((it) => {
        const on = it.value === value;
        return (
          <Pressable
            key={it.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: on, disabled: !!it.disabled }}
            accessibilityLabel={it.label}
            disabled={it.disabled}
            onPress={() => onChange(it.value)}
            style={[styles.segItem, on && styles.segOn, { opacity: it.disabled ? 0.4 : 1 }]}
          >
            <Text variant="heading" color={on ? 'text' : 'textMuted'} align="center">
              {it.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Stepper - angka + (1.5). */
export function Stepper({
  value,
  unitLabel,
  onChange,
  min,
  max,
  step = 1,
  decLabel,
  incLabel,
}: {
  value: number;
  unitLabel: string;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  decLabel: string;
  incLabel: string;
}) {
  return (
    <View style={styles.stepper}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={decLabel}
        disabled={value <= min}
        onPress={() => onChange(Math.max(min, value - step))}
        style={[styles.stepBtn, styles.outline, { opacity: value <= min ? 0.4 : 1 }]}
      >
        <Icon name="minus" />
      </Pressable>
      <View style={styles.stepValue}>
        <Text variant="numberXl" align="center" testID="stepper-value">
          {String(value)}
        </Text>
        <Text variant="label" color="textMuted" align="center">
          {unitLabel}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={incLabel}
        disabled={value >= max}
        onPress={() => onChange(Math.min(max, value + step))}
        style={[styles.stepBtn, { backgroundColor: color.primary, opacity: value >= max ? 0.4 : 1 }]}
      >
        <Icon name="plus" color={color.onPrimary} />
      </Pressable>
    </View>
  );
}

/** Kotak info berwarna status, selalu dengan ikon + teks. */
export function InfoBox({
  tone,
  children,
  icon,
  testID,
}: {
  tone: 'ok' | 'warn' | 'info' | 'danger';
  children: React.ReactNode;
  icon?: IconName;
  testID?: string;
}) {
  const bg = {
    ok: color.status.onTrack,
    warn: color.status.attention,
    info: color.status.recovery,
    danger: color.status.behind,
  }[tone];
  const ic: IconName = icon ?? (tone === 'ok' ? 'check' : tone === 'info' ? 'info' : 'alert');
  return (
    <View style={[styles.info, { backgroundColor: bg }]} testID={testID} accessibilityRole="alert">
      <Icon name={ic} color={color.status.onStatus} />
      <View style={styles.flex}>{children}</View>
    </View>
  );
}

export function TextField(props: TextInputProps & { label?: string }) {
  const { label, style, ...rest } = props;
  return (
    <View style={styles.fieldWrap}>
      {label ? (
        <Text variant="label" color="textMuted">
          {label}
        </Text>
      ) : null}
      <TextInput
        placeholderTextColor={color.textMuted}
        accessibilityLabel={label}
        {...rest}
        style={[styles.field, typography.body, style]}
      />
    </View>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
  testID,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  testID?: string;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      onPress={() => onChange(!checked)}
      testID={testID}
      style={styles.checkRow}
    >
      <View style={[styles.box, checked && styles.boxOn]}>
        {checked ? <Icon name="check" size={18} color={color.palette.cream} strokeWidth={3} /> : null}
      </View>
      <Text style={styles.flex}>{label}</Text>
    </Pressable>
  );
}

/** Progress onboarding 6 lajur + tombol kembali (1.2-1.7). */
export function OnboardingHeader({
  step,
  total,
  onBack,
  backLabel,
  counter,
}: {
  step: number;
  total: number;
  onBack: () => void;
  backLabel: string;
  counter: string;
}) {
  return (
    <View style={styles.obHead}>
      <IconButton icon="back" label={backLabel} onPress={onBack} testID="back" />
      <View
        style={styles.lanes}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: total, now: step }}
      >
        {Array.from({ length: total }, (_, i) => (
          <View
            key={i}
            style={[styles.lane, { backgroundColor: i < step ? color.primary : color.surfaceSunken }]}
          />
        ))}
      </View>
      <Text variant="label" color="textMuted">
        {counter}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  iconBtn: {
    width: size.touchMin + 4,
    height: size.touchMin + 4,
    borderRadius: radius.stadium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outline: { borderWidth: border.control, borderColor: color.line, backgroundColor: color.surface },
  choice: {
    flex: 1,
    minHeight: size.buttonPrimary + size.touchMin,
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: border.control,
    borderColor: color.line,
    padding: space[4],
    gap: space[2],
  },
  choiceWide: { flex: 0, minHeight: 0, paddingVertical: space[5] },
  choiceSelected: { borderWidth: border.selected, borderColor: color.text },
  choiceHead: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  check: {
    width: size.touchMin - space[4],
    height: size.touchMin - space[4],
    borderRadius: radius.stadium,
    backgroundColor: color.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    minHeight: size.chip,
    paddingHorizontal: space[5],
    borderRadius: radius.stadium,
    borderWidth: border.control,
    borderColor: color.line,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: { backgroundColor: color.text, borderColor: color.text },
  seg: {
    flexDirection: 'row',
    backgroundColor: color.surfaceSunken,
    borderRadius: radius.stadium,
    padding: space[1],
  },
  segItem: {
    flex: 1,
    minHeight: size.touchMin,
    borderRadius: radius.stadium,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space[2],
  },
  segOn: { backgroundColor: color.surface, boxShadow: `0px 2px 0px 0px ${color.line}` },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepBtn: {
    width: size.buttonPrimary,
    height: size.buttonPrimary,
    borderRadius: radius.stadium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: { flex: 1 },
  info: {
    flexDirection: 'row',
    gap: space[3],
    padding: space[4],
    borderRadius: radius.md,
    alignItems: 'flex-start',
  },
  fieldWrap: { gap: space[2] },
  field: {
    minHeight: size.input,
    borderWidth: border.control,
    borderColor: color.lineStrong,
    borderRadius: radius.md,
    paddingHorizontal: space[4],
    backgroundColor: color.surface,
    color: color.text,
  },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: space[3], minHeight: size.touchMin },
  box: {
    width: size.touchMin - space[4],
    height: size.touchMin - space[4],
    borderRadius: radius.bib,
    borderWidth: border.control,
    borderColor: color.lineStrong,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.surface,
  },
  boxOn: { backgroundColor: color.text, borderColor: color.text },
  obHead: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  lanes: { flex: 1, flexDirection: 'row', gap: space[1] },
  lane: { flex: 1, height: space[2], borderRadius: radius.stadium },
});
