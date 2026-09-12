/**
 * Sodiqlik chegirmasi yordamchilari.
 *
 * Kod generatori ATAYIN yo'q — chegirma bronda avtomatik qo'llanadi,
 * mijoz hech qanday kod ko'rsatmaydi.
 */

/** Standart chegara va foiz (restoran o'zgartira oladi) */
export const DEFAULT_LOYALTY_THRESHOLD = 10;
export const DEFAULT_DISCOUNT_PERCENT = 10;

/** Chegirmaga qancha ball qolgani */
export function pointsUntilReward(points: number, threshold: number): number {
  if (threshold <= 0) return 0;
  return Math.max(0, threshold - (points % threshold));
}
