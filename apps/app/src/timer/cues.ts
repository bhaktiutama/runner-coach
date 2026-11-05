import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import type { Earcon } from './earcons';

// Bunyi penanda + getar timer (F-05, 09-VOICE bagian 5). Bunyi dibuat oleh scripts/make-earcons.py.

const SOURCES: Record<Earcon, number> = {
  tick: require('../../assets/sounds/tick.wav'),
  go: require('../../assets/sounds/go.wav'),
  rest: require('../../assets/sounds/rest.wav'),
  halfway: require('../../assets/sounds/halfway.wav'),
  warning: require('../../assets/sounds/warning.wav'),
  switch: require('../../assets/sounds/switch.wav'),
  segment: require('../../assets/sounds/segment.wav'),
  finish: require('../../assets/sounds/finish.wav'),
  pause: require('../../assets/sounds/pause.wav'),
  resume: require('../../assets/sounds/resume.wav'),
};

let players: Partial<Record<Earcon, AudioPlayer>> = {};

export async function prepareCues(): Promise<void> {
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'mixWithOthers',
    });
  } catch {
    /* web / tidak didukung */
  }
  for (const k of Object.keys(SOURCES) as Earcon[]) {
    try {
      players[k] ??= createAudioPlayer(SOURCES[k]);
    } catch {
      /* audio tidak tersedia */
    }
  }
}

const native = process.env.EXPO_OS !== 'web';

/** Getar yang sepadan dengan bunyi (tetap jalan saat bisu). Tidak ada di web. */
function haptic(kind: Earcon) {
  if (!native) return;
  const I = Haptics.ImpactFeedbackStyle;
  switch (kind) {
    case 'finish':
      return void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    case 'go':
      return void Haptics.impactAsync(I.Heavy);
    case 'rest':
    case 'segment':
    case 'switch':
      return void Haptics.impactAsync(I.Medium);
    case 'tick':
    case 'warning':
    case 'pause':
    case 'resume':
      return void Haptics.impactAsync(I.Light);
    case 'halfway':
      return;
  }
}

/** Putar bunyi penanda; saat `muted` hanya getar. */
export function playEarcon(kind: Earcon, muted = false) {
  haptic(kind);
  if (muted) return;
  const p = players[kind];
  try {
    p?.seekTo(0);
    p?.play();
  } catch {
    /* audio tidak tersedia */
  }
}

/** Hitung mundur 3-2-1 sebelum mulai (UI/UX bagian 11, G11). */
export function countdownTick(muted = false) {
  playEarcon('tick', muted);
}

export function releaseCues() {
  for (const p of Object.values(players)) p?.release();
  players = {};
}

/** Web: Wake Lock API jika tersedia (TRD 5). */
export async function requestWakeLock(): Promise<{ release: () => Promise<void> } | null> {
  const nav = globalThis.navigator as unknown as {
    wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> };
  };
  try {
    return (await nav?.wakeLock?.request('screen')) ?? null;
  } catch {
    return null;
  }
}
