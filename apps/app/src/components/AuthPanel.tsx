import {
  border,
  color,
  fontFiles,
  InfoBox,
  LinkButton,
  PrimaryButton,
  radius,
  ring,
  SecondaryButton,
  size,
  space,
  Text,
  TextField,
  typography,
} from '@run-coach/ui';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { auth } from '@/data/hooks';
import { t, type MessageKey } from '@/i18n/t';

const ERR: Record<string, MessageKey> = {
  not_configured: 'auth.notConfigured',
  offline: 'auth.offline',
  invalid: 'auth.failed',
  failed: 'auth.failed',
  provider_unavailable: 'auth.providerUnavailable',
};

/** Alur login (F-01): Apple / Google / kode email. Gagal = tetap di layar, plan tidak hilang. */
export function useAuthFlow(onSignedIn: (userId: string | null) => void) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [mode, setMode] = useState<'buttons' | 'email' | 'code'>('buttons');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ key: MessageKey; provider?: string } | null>(null);

  const provider = async (p: 'apple' | 'google') => {
    setBusy(true);
    setError(null);
    const r = await auth.signInWithProvider(p);
    setBusy(false);
    if (r.ok) onSignedIn(r.userId);
    else if (r.error !== 'cancelled')
      setError({ key: ERR[r.error] ?? 'auth.failed', provider: p === 'apple' ? 'Apple' : 'Google' });
  };
  const send = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError({ key: 'auth.invalidEmail' });
    setBusy(true);
    setError(null);
    const r = await auth.sendEmailCode(email.trim());
    setBusy(false);
    if (r.ok) setMode('code');
    else setError({ key: ERR[r.error] ?? 'auth.failed' });
  };
  const verify = async () => {
    setBusy(true);
    setError(null);
    const r = await auth.verifyEmailCode(email.trim(), code.trim());
    setBusy(false);
    if (r.ok) onSignedIn(r.userId);
    else setError({ key: ERR[r.error] ?? 'auth.failed' });
  };
  return { email, setEmail, code, setCode, mode, setMode, busy, error, provider, send, verify, onSignedIn };
}

type Flow = ReturnType<typeof useAuthFlow>;

export function EmailInput({ flow }: { flow: Flow }) {
  return (
    <TextField
      testID="email"
      label={t('auth.emailLabel')}
      placeholder={t('auth.emailPlaceholder')}
      value={flow.email}
      onChangeText={flow.setEmail}
      autoCapitalize="none"
      autoComplete="email"
      keyboardType="email-address"
      inputMode="email"
    />
  );
}

export function CodeInput({ flow }: { flow: Flow }) {
  return (
    <>
      <InfoBox tone="info">{t('auth.codeSent', { email: flow.email.trim() })}</InfoBox>
      <TextField
        testID="otp"
        label={t('auth.codeLabel')}
        value={flow.code}
        onChangeText={(v) => flow.setCode(v.replace(/\D/g, '').slice(0, 10))}
        keyboardType="number-pad"
        autoComplete="one-time-code"
      />
      <View style={styles.row}>
        <LinkButton label={t('auth.resend')} onPress={() => void flow.send()} />
        <LinkButton label={t('auth.changeEmail')} onPress={() => flow.setMode('email')} />
      </View>
    </>
  );
}

export function AuthError({ flow }: { flow: Flow }) {
  return flow.error ? (
    <InfoBox tone="danger" testID="auth-error">
      {t(flow.error.key, { provider: flow.error.provider ?? '' })}
    </InfoBox>
  ) : null;
}

export function SkipLogin({ flow }: { flow: Flow }) {
  return auth.authBypassAllowed ? (
    <LinkButton label={t('auth.skipTest')} testID="auth-skip" onPress={() => flow.onSignedIn(null)} />
  ) : null;
}

/** Tombol akun di sheet 1.8: Apple (primary 60) + Google | Email (48). */
export function CreateAccountButtons({ flow }: { flow: Flow }) {
  if (flow.mode !== 'buttons') {
    return (
      <View style={styles.col}>
        {flow.mode === 'email' ? <EmailInput flow={flow} /> : <CodeInput flow={flow} />}
        <AuthError flow={flow} />
        {flow.mode === 'email' ? (
          <PrimaryButton
            label={t('auth.sendCode')}
            testID="send-code"
            loading={flow.busy}
            onPress={() => void flow.send()}
          />
        ) : (
          <PrimaryButton
            label={t('auth.verify')}
            loading={flow.busy}
            disabled={flow.code.length < 6}
            onPress={() => void flow.verify()}
          />
        )}
        <SkipLogin flow={flow} />
      </View>
    );
  }
  return (
    <View style={styles.col}>
      <PrimaryButton
        label={t('auth.apple')}
        disabled={flow.busy}
        onPress={() => void flow.provider('apple')}
      />
      <View style={styles.pair}>
        <View style={styles.flex}>
          <SecondaryButton
            label={t('auth.googleShort')}
            disabled={flow.busy}
            onPress={() => void flow.provider('google')}
          />
        </View>
        <View style={styles.flex}>
          <SecondaryButton
            label={t('auth.email')}
            testID="auth-email"
            disabled={flow.busy}
            onPress={() => flow.setMode('email')}
          />
        </View>
      </View>
      <AuthError flow={flow} />
      <SkipLogin flow={flow} />
    </View>
  );
}

/** Tombol masuk 1.9: Apple gelap 56 + Google garis 56. */
export function SignInButtons({ flow }: { flow: Flow }) {
  return (
    <View style={styles.col}>
      <Pressable
        accessibilityRole="button"
        disabled={flow.busy}
        onPress={() => void flow.provider('apple')}
        style={[styles.tall, styles.dark]}
      >
        <Text variant="button" style={styles.darkText}>
          {t('auth.apple')}
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        disabled={flow.busy}
        onPress={() => void flow.provider('google')}
        style={[styles.tall, styles.outline]}
      >
        <Text variant="row">{t('auth.google')}</Text>
      </Pressable>
    </View>
  );
}

/** Pemisah "atau" dengan garis kiri-kanan. */
export function OrDivider() {
  return (
    <View style={styles.or}>
      <View style={styles.line} />
      <Text variant="controlSm" color="textMuted">
        {t('auth.or')}
      </Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  col: { gap: space[2] + space[1] / 2 },
  pair: { flexDirection: 'row', gap: space[2] },
  row: { flexDirection: 'row', gap: space[3], justifyContent: 'center' },
  tall: {
    height: size.buttonPrimary - space[1],
    borderRadius: radius.stadium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dark: { backgroundColor: color.text },
  darkText: { ...typography.body, fontFamily: fontFiles.ui700, color: color.bg },
  outline: { backgroundColor: color.surface, ...ring(border.control, color.lineStrong) },
  or: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  line: { flex: 1, height: border.hairline, backgroundColor: color.line },
});
