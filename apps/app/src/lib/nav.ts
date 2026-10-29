import { router } from 'expo-router';

/** Kembali ke tab yang sudah ada di stack (tanpa membuat tab ganda). */
export function goHome(path: '/' | '/week-summary' = '/') {
  if (path === '/') return router.dismissTo('/');
  router.dismissTo('/');
  router.push(path);
}

/** Setelah onboarding/login: buang riwayat onboarding, mulai dari tab Hari ini. */
export function startFresh() {
  if (router.canDismiss()) router.dismissAll();
  router.replace('/');
}
