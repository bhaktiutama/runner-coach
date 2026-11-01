import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useReducedMotion } from '../motion';
import { color, radius, size, space, themed } from '../theme';
import { SecondaryButton, PrimaryButton } from './Button';
import { DangerButton } from './Settings';
import { Text } from './Text';

type Props = {
  visible: boolean;
  title: string;
  body?: string;
  confirmLabel: string;
  cancelLabel: string;
  /** Aksi merusak (hapus data): tombol konfirmasi merah. */
  danger?: boolean;
  loading?: boolean;
  /** Aksi tambahan di atas tombol konfirmasi, mis. "Backup dulu". */
  extra?: { label: string; onPress: () => void };
  onConfirm: () => void;
  onCancel: () => void;
  testID?: string;
  confirmTestID?: string;
};

/**
 * Dialog konfirmasi di tengah layar, di atas semua isi (tidak ikut tergulir). Latar gelap bisa
 * diketuk untuk batal. Dipakai untuk Keluar dan Hapus data di HP (4.5).
 */
export function ConfirmDialog({
  visible,
  title,
  body,
  confirmLabel,
  cancelLabel,
  danger,
  loading,
  extra,
  onConfirm,
  onCancel,
  testID,
  confirmTestID,
}: Props) {
  const reduced = useReducedMotion();
  return (
    <Modal
      visible={visible}
      transparent
      animationType={reduced ? 'none' : 'fade'}
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <Pressable
        style={styles.backdrop}
        onPress={onCancel}
        accessibilityLabel={cancelLabel}
        accessibilityRole="button"
      >
        {/* View di dalam Pressable: ketukan di kartu tidak menutup dialog. */}
        <View
          style={styles.card}
          testID={testID}
          accessibilityViewIsModal
          accessibilityRole="alert"
          onStartShouldSetResponder={() => true}
        >
          <Text variant="heading">{title}</Text>
          {body ? (
            <Text variant="bodySm" color="textMuted">
              {body}
            </Text>
          ) : null}
          {extra ? <SecondaryButton label={extra.label} icon="share" onPress={extra.onPress} /> : null}
          {danger ? (
            <DangerButton label={confirmLabel} loading={loading} onPress={onConfirm} testID={confirmTestID} />
          ) : (
            <PrimaryButton
              label={confirmLabel}
              loading={loading}
              onPress={onConfirm}
              testID={confirmTestID}
            />
          )}
          <SecondaryButton label={cancelLabel} variant="ghost" onPress={onCancel} />
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: color.overlay,
      justifyContent: 'center',
      padding: space[5],
    },
    card: {
      backgroundColor: color.surface,
      borderRadius: radius.lg,
      padding: space[5],
      gap: space[3],
      maxWidth: size.contentMax,
      width: '100%',
      alignSelf: 'center',
    },
  }),
);
