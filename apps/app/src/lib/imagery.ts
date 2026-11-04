import type { WorkoutType } from '@run-coach/training-engine';
import type { ImageSourcePropType } from 'react-native';
import { workoutImageKey, type ImageKey } from './imageryKeys';

export { workoutImageKey, type ImageKey };

/**
 * Gambar app (UI/UX 12, draft): salinan docs/design-system/assets/imagery/. Statis di dalam app,
 * tidak diunduh dan tidak berisi data pengguna. Lisensi sumber belum diverifikasi: wajib jelas
 * sebelum rilis toko.
 */
export const IMAGES = {
  roadSunriseM: require('../../assets/imagery/road-sunrise-m.webp'),
  roadSunriseF: require('../../assets/imagery/road-sunrise-f.webp'),
  riversideCityF: require('../../assets/imagery/riverside-city-f.webp'),
  riversideCityM: require('../../assets/imagery/riverside-city-m.webp'),
  trackBack: require('../../assets/imagery/track-back.webp'),
  trackSide: require('../../assets/imagery/track-side.webp'),
  trackOverhead: require('../../assets/imagery/track-overhead.webp'),
  trackAerial: require('../../assets/imagery/track-aerial.webp'),
  shoeSole: require('../../assets/imagery/shoe-sole.webp'),
  povFeet: require('../../assets/imagery/pov-feet.webp'),
  promoScience: require('../../assets/imagery/promo-science.webp'),
  promoPrivacy: require('../../assets/imagery/promo-privacy.webp'),
  promoCompanion: require('../../assets/imagery/promo-companion.webp'),
} satisfies Record<ImageKey, ImageSourcePropType>;

export function workoutImage(type: WorkoutType, date: string): ImageSourcePropType | null {
  const k = workoutImageKey(type, date);
  return k ? IMAGES[k] : null;
}
