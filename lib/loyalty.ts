/**
 * Sodiqlik chegirmasi yordamchilari — server va klient uchun umumiy.
 */

/** Standart chegara va foiz (restoran o'zgartira oladi) */
export const DEFAULT_LOYALTY_THRESHOLD = 10;
export const DEFAULT_DISCOUNT_PERCENT = 10;

/**
 * Chalkashmaydigan alifbo: 0/O, 1/I/L, 2/Z, 5/S, 8/B yo'q.
 * Kod og'zaki aytilishi va qog'ozga yozilishi mumkin.
 */
const ALPHABET = "ACDEFGHJKMNPQRTUVWXY34679";

/** "LF-7K2M9" ko'rinishidagi kod */
export function generateRewardCode(): string {
  let body = "";
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  for (const b of bytes) {
    body += ALPHABET[b % ALPHABET.length];
  }
  return `LF-${body}`;
}

/** Foydalanuvchi kiritgan kodni solishtirishga tayyorlaydi */
export function normalizeRewardCode(input: string): string {
  const cleaned = input.trim().toUpperCase().replace(/\s+/g, "");
  return cleaned.startsWith("LF-") ? cleaned : `LF-${cleaned.replace(/^LF/, "")}`;
}

/** Chegirmaga qancha ball qolgani */
export function pointsUntilReward(points: number, threshold: number): number {
  if (threshold <= 0) return 0;
  return Math.max(0, threshold - (points % threshold));
}
