import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';

// Suara + getar di setiap pergantian segmen selama app aktif (F-05).

let cue: AudioPlayer | null = null;
let done: AudioPlayer | null = null;

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
  cue ??= createAudioPlayer(require('../../assets/sounds/cue.wav'));
  done ??= createAudioPlayer(require('../../assets/sounds/done.wav'));
}

export function playCue(kind: 'segment' | 'finish') {
  const p = kind === 'finish' ? done : cue;
  try {
    p?.seekTo(0);
    p?.play();
  } catch {
    /* audio tidak tersedia */
  }
  if (process.env.EXPO_OS !== 'web') {
    void Haptics.notificationAsync(
      kind === 'finish' ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning,
    );
  }
}

export function releaseCues() {
  cue?.release();
  done?.release();
  cue = null;
  done = null;
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
