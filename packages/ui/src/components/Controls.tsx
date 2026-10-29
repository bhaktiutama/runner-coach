import { Children, isValidElement, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { border, color, radius, ring, shadow, size, space, typography } from '../theme';
import { digitsToSeconds, formatTimeDigits, nextTimeDigits, secondsToDigits } from '../format';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

// Kontrol dasar. Ukuran mengikuti wireframe v0.4 (docs/wireframes/source), nilai dari token.

/** Tombol ikon bulat 44 px (kembali, bulan kalender). */
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
      <Icon name={icon} size={size.iconSm} color={variant === 'primary' ? color.onPrimary : color.text} />
    </Pressable>
  );
}

/** Kartu pilihan (1.2): grid 2 kolom, atau lebar penuh dengan chevron. */
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
        wide ? styles.choiceWide : styles.choiceGrid,
        selected ? styles.choiceSelected : null,
        { opacity: pressed ? 0.85 : 1 },
      ]}
    >
      {wide ? (
        <>
          <View style={styles.flex}>
            <Text variant="row">{title}</Text>
            {subtitle ? (
              <Text variant="control" color="textMuted" style={styles.wideSub}>
                {subtitle}
              </Text>
            ) : null}
          </View>
          {selected ? <Check /> : <Icon name="chevron-right" size={space[5]} />}
        </>
      ) : (
        <>
          <View style={styles.choiceHead}>
            <Text variant="title">{title}</Text>
            {selected ? <Check /> : null}
          </View>
          {subtitle ? (
            <Text variant="control" color="textMuted" style={styles.choiceSub}>
              {subtitle}
            </Text>
          ) : null}
        </>
      )}
    </Pressable>
  );
}

function Check() {
  return (
    <View style={styles.check}>
      <Icon name="check" size={space[4]} color={color.bg} strokeWidth={3} />
    </View>
  );
}

/** Chip stadium. `size="option"` 44 px (pilihan setara, `fill` = lebar rata), `quick` 40 px. */
export function Chip({
  label,
  selected,
  onPress,
  testID,
  disabled,
  fill,
  size: chipSize = 'option',
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  testID?: string;
  disabled?: boolean;
  fill?: boolean;
  /** option 44, quick 40, large 48 (4.3, teks tebal). */
  size?: 'option' | 'quick' | 'large';
}) {
  const h = chipSize === 'quick' ? size.chip : chipSize === 'large' ? size.buttonSecondary : size.touchMin;
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
        { minHeight: h },
        fill && styles.chipFill,
        selected ? styles.chipSelected : styles.chipIdle,
        { opacity: disabled ? 0.4 : pressed ? 0.8 : 1 },
      ]}
    >
      <Text
        variant={selected || chipSize === 'large' ? 'controlStrong' : 'control'}
        numberOfLines={1}
        style={{ color: selected ? color.bg : color.text }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/** Segmented control 2-4 item (teks 13, terpilih kartu putih + bayangan). */
export function SegmentedControl<T extends string>({
  items,
  value,
  onChange,
  testID,
  compact,
}: {
  items: { value: T; label: string; disabled?: boolean }[];
  value: T;
  onChange: (v: T) => void;
  testID?: string;
  /** Tinggi item 40 (2.2) alih-alih 44. */
  compact?: boolean;
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
            style={[
              styles.segItem,
              compact && styles.segCompact,
              on && styles.segOn,
              { opacity: it.disabled ? 0.4 : 1 },
            ]}
          >
            <Text
              variant={on ? 'controlSmStrong' : 'controlSm'}
              color={on ? 'text' : 'textMuted'}
              align="center"
              numberOfLines={1}
            >
              {it.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Stepper - angka + (1.5): tombol 60, angka 64, satuan 14/700. */
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
        <Text variant="controlStrong" color="textMuted" align="center">
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

/** Kotak info berwarna status + ikon. Anak berupa teks otomatis memakai body-sm (14/1.45). */
export function InfoBox({
  tone,
  children,
  icon,
  testID,
}: {
  tone: 'ok' | 'warn' | 'info' | 'danger';
  children: ReactNode;
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
      <View style={styles.infoIcon}>
        <Icon name={ic} size={space[5]} color={color.status.onStatus} />
      </View>
      <View style={styles.infoBody}>
        {Children.map(children, (c) =>
          typeof c === 'string' || typeof c === 'number' ? (
            <Text variant="bodySm">{c}</Text>
          ) : isValidElement<{ variant?: string }>(c) && c.type === Text && !c.props.variant ? (
            <Text {...(c.props as object)} variant="bodySm" />
          ) : (
            c
          ),
        )}
      </View>
    </View>
  );
}

/** Input teks 52 px, radius 10, garis 1.5 line-strong. */
export function TextField(props: TextInputProps & { label?: string; numeric?: boolean }) {
  const { label, style, numeric, ...rest } = props;
  const input = (
    <TextInput
      placeholderTextColor={color.textMuted}
      accessibilityLabel={label}
      {...rest}
      style={[
        styles.field,
        numeric ? typography.numberInput : typography.body,
        numeric ? styles.numberText : styles.fieldText,
        style,
      ]}
    />
  );
  return label ? <Field label={label}>{input}</Field> : input;
}

/**
 * Input waktu satu kotak "j : mm : dd" (1.4). Pengguna mengetik angka saja (maks 5 digit,
 * diisi dari kanan); nilai dikembalikan dalam detik, null jika kosong.
 */
export function TimeField({
  label,
  seconds,
  onChange,
  testID,
}: {
  label: string;
  seconds: number | null;
  onChange: (s: number | null) => void;
  testID?: string;
}) {
  const [digits, setDigits] = useState(() => (seconds ? secondsToDigits(seconds) : ''));
  return (
    <Field label={label}>
      <TextInput
        testID={testID}
        accessibilityLabel={label}
        keyboardType="number-pad"
        inputMode="numeric"
        placeholder={formatTimeDigits('')}
        placeholderTextColor={color.textMuted}
        value={digits ? formatTimeDigits(digits) : ''}
        onChangeText={(v) => {
          const d = nextTimeDigits(digits, v);
          setDigits(d);
          onChange(d ? digitsToSeconds(d) : null);
        }}
        style={[styles.field, typography.numberInput, styles.numberText]}
      />
    </Field>
  );
}

/** Label bagian (13/700) + kontrolnya dengan jarak 8 (input) atau 12 (pilihan). */
export function Field({
  label,
  children,
  hint,
  gap = 'tight',
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  gap?: 'tight' | 'group';
}) {
  return (
    <View style={{ gap: gap === 'group' ? space[3] : space[2] }}>
      <Text variant="label" color="textMuted">
        {label}
      </Text>
      {children}
      {hint ? (
        <Text variant="caption" color="textMuted">
          {hint}
        </Text>
      ) : null}
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
        {checked ? <Icon name="check" size={space[4]} color={color.bg} strokeWidth={3} /> : null}
      </View>
      <Text variant="bodyStrong" style={styles.flex}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Header onboarding (1.2-1.7): kembali 44 + 6 lajur progres 8 px + penghitung. */
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
      <Text variant="counter" color="textMuted">
        {counter}
      </Text>
    </View>
  );
}

/** Judul layar (28/800) + subjudul (15/1.45), jarak 8. */
export function ScreenTitle({
  title,
  subtitle,
  large,
}: {
  title: string;
  subtitle?: string;
  large?: boolean;
}) {
  return (
    <View style={{ gap: large ? space[3] : space[2] }}>
      <Text variant={large ? 'display' : 'title'} accessibilityRole="header">
        {title}
      </Text>
      {subtitle ? (
        <Text variant="subtitle" color="textMuted">
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const CHECK = space[6];
const styles = StyleSheet.create({
  flex: { flex: 1 },
  iconBtn: {
    width: size.touchMin,
    height: size.touchMin,
    borderRadius: radius.stadium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outline: { ...ring(border.control, color.line), backgroundColor: color.surface },
  choice: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    ...ring(border.control, color.line),
  },
  choiceGrid: {
    flex: 1,
    minHeight: size.buttonPrimary + size.touchMin,
    padding: space[4],
    gap: space[1] + space[1] / 2,
  },
  choiceWide: {
    minHeight: size.buttonPrimary,
    paddingHorizontal: space[5],
    paddingVertical: space[3],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  choiceSelected: ring(border.selected, color.text),
  choiceHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
  },
  choiceSub: { ...typography.controlSm, lineHeight: typography.label.lineHeight },
  wideSub: { marginTop: space[1] },
  check: {
    width: CHECK,
    height: CHECK,
    borderRadius: radius.stadium,
    backgroundColor: color.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    paddingHorizontal: space[4],
    borderRadius: radius.stadium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipFill: { flex: 1, paddingHorizontal: space[1] },
  chipIdle: { backgroundColor: color.surface, ...ring(border.control, color.line) },
  chipSelected: { backgroundColor: color.text },
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
    paddingHorizontal: space[1] + space[1] / 2,
  },
  segCompact: { minHeight: space[10] },
  segOn: { backgroundColor: color.surface, ...shadow.card },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: space[2],
    paddingHorizontal: space[1],
  },
  stepBtn: {
    width: size.buttonPrimary,
    height: size.buttonPrimary,
    borderRadius: radius.stadium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: { flex: 1, gap: space[1] },
  info: {
    flexDirection: 'row',
    gap: space[3],
    paddingVertical: space[3] + space[1] / 2,
    paddingHorizontal: space[4],
    borderRadius: radius.md,
    alignItems: 'flex-start',
  },
  infoIcon: { paddingTop: border.hairline },
  infoBody: { flex: 1, gap: space[1] },
  field: {
    height: size.input,
    ...ring(border.control, color.lineStrong),
    borderRadius: radius.sm,
    paddingHorizontal: space[4],
    backgroundColor: color.surface,
  },
  fieldText: { color: color.text, fontFamily: typography.control.fontFamily },
  numberText: { color: color.text },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space[3], minHeight: size.touchMin },
  box: {
    width: size.iconSm,
    height: size.iconSm,
    borderRadius: radius.bib / 1.5,
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
