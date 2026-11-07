import { useProfile } from '@/data/hooks';

/** Ikon spot tampil kecuali dimatikan di Profil (`profile.spot_icons`, UI/UX 14). */
export function useSpotIcons(): boolean {
  return useProfile().data?.spot_icons !== 0;
}

export { feelSpot, TYPE_SPOT } from './spotMap';
