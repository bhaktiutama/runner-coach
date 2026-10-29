import { InfoBox, LinkButton, PrimaryButton, SecondaryButton, space, Text, TextField } from '@run-coach/ui';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { auth } from '@/data/hooks';
import { t, type MessageKey } from '@/i18n/t';

type Props = { onSignedIn: (userId: string | null) => void; variant: 'create' | 'signin' };

const ERR: Record<string, MessageKey> = {
  not_configured: 'auth.notConfigured',
  offline: 'auth.offline',
  invalid: 'auth.failed',
  failed: 'auth.failed',
  provider_unavailable: 'auth.providerUnavailable',
};

/** Tombol Apple / Google / Email (1.8, 1.9). Login gagal: tetap di layar, plan tidak hilang. */
export function AuthPanel({ onSignedIn, variant }: Props) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [mode, setMode] = useState<'buttons' | 'email' | 'code'>(variant === 'signin' ? 'email' : 'buttons');
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

  return (
    <View style={styles.wrap}>
      {mode === 'buttons' || variant === 'signin' ? (
        <>
          <PrimaryButton
            label={t('auth.apple')}
            variant={variant === 'signin' ? 'dark' : 'primary'}
            disabled={busy}
            onPress={() => void provider('apple')}
          />
          {variant === 'create' ? (
            <View style={styles.row}>
              <View style={styles.flex}>
                <SecondaryButton
                  label={t('auth.googleShort')}
                  disabled={busy}
                  onPress={() => void provider('google')}
                />
              </View>
              <View style={styles.flex}>
                <SecondaryButton
                  label={t('auth.email')}
                  testID="auth-email"
                  disabled={busy}
                  onPress={() => setMode('email')}
                />
              </View>
            </View>
          ) : (
            <SecondaryButton
              label={t('auth.google')}
              disabled={busy}
              onPress={() => void provider('google')}
            />
          )}
        </>
      ) : null}
      {mode === 'email' ? (
        <>
          {variant === 'signin' ? (
            <Text variant="label" color="textMuted" align="center">
              {t('auth.or')}
            </Text>
          ) : null}
          <TextField
            testID="email"
            label={t('auth.emailLabel')}
            placeholder={t('auth.emailPlaceholder')}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            inputMode="email"
          />
          <PrimaryButton
            label={t('auth.sendCode')}
            testID="send-code"
            loading={busy}
            onPress={() => void send()}
          />
        </>
      ) : null}
      {mode === 'code' ? (
        <>
          <InfoBox tone="info">
            <Text>{t('auth.codeSent', { email: email.trim() })}</Text>
          </InfoBox>
          <TextField
            testID="otp"
            label={t('auth.codeLabel')}
            value={code}
            onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 10))}
            keyboardType="number-pad"
            autoComplete="one-time-code"
          />
          <PrimaryButton
            label={t('auth.verify')}
            loading={busy}
            disabled={code.length < 6}
            onPress={() => void verify()}
          />
          <View style={styles.row}>
            <LinkButton label={t('auth.resend')} onPress={() => void send()} />
            <LinkButton label={t('auth.changeEmail')} onPress={() => setMode('email')} />
          </View>
        </>
      ) : null}
      {error ? (
        <InfoBox tone="danger" testID="auth-error">
          <Text>{t(error.key, { provider: error.provider ?? '' })}</Text>
        </InfoBox>
      ) : null}
      {variant === 'signin' ? (
        <Text variant="caption" color="textMuted" align="center">
          {t('auth.onlyEmail')}
        </Text>
      ) : null}
      {auth.authBypassAllowed ? (
        <LinkButton label={t('auth.skipTest')} testID="auth-skip" onPress={() => onSignedIn(null)} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space[3] },
  row: { flexDirection: 'row', gap: space[3], justifyContent: 'center' },
  flex: { flex: 1 },
});
