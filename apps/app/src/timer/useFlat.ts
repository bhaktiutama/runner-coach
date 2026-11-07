import { DeviceMotion } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';
import { isFlat } from './flat';

// U3 (09-VOICE bagian 13): HP mendatar menghadap ke atas (di lantai saat plank/push-up) -> tampilan jarak jauh.

/** Harus stabil sekian lama sebelum berganti, agar tidak berkedip saat HP diangkat sebentar. */
const SETTLE_MS = 800;

/** true saat HP terletak datar menghadap ke atas. Selalu false jika sensor tidak ada (mis. desktop). */
export function useFlat(enabled = true): boolean {
  const [flat, setFlat] = useState(false);
  const since = useRef<{ value: boolean; at: number } | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let sub: { remove: () => void } | null = null;
    let alive = true;
    void (async () => {
      try {
        if (!(await DeviceMotion.isAvailableAsync()) || !alive) return;
        DeviceMotion.setUpdateInterval(250);
        sub = DeviceMotion.addListener((m) => {
          const r = m.rotation;
          if (!r) return;
          const now = Date.now();
          const v = isFlat(r.beta, r.gamma);
          if (!since.current || since.current.value !== v) since.current = { value: v, at: now };
          else if (now - since.current.at >= SETTLE_MS) setFlat(v);
        });
      } catch {
        /* sensor tidak tersedia / izin ditolak: tetap tampilan biasa */
      }
    })();
    return () => {
      alive = false;
      sub?.remove();
    };
  }, [enabled]);
  return enabled && flat;
}
