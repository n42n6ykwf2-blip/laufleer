/**
 * Sharh qoidalari — server va klient uchun umumiy.
 * "use server" faylidan tashqarida, chunki u faqat async funksiya
 * eksport qila oladi.
 */

/** Tashrifdan keyin necha kun ichida baho berish mumkin */
export const REVIEW_WINDOW_DAYS = 30;

/** O'rtacha reyting kamida shuncha sharhdan keyin ko'rsatiladi */
export const MIN_REVIEWS_FOR_AVERAGE = 3;

/** Tashrif o'tgan va baho berish muddati hali tugamaganmi */
export function canStillReview(
  reservationAt: string,
  now: number = Date.now()
): boolean {
  const visit = new Date(reservationAt).getTime();
  if (Number.isNaN(visit) || visit > now) return false;
  return now - visit <= REVIEW_WINDOW_DAYS * 24 * 60 * 60 * 1000;
}

/**
 * PostgREST embed'i unique indeks bo'yicha ba'zan obyekt, ba'zan
 * massiv qaytaradi — ikkalasini ham qabul qilamiz.
 */
export function embeddedRating(
  embed: { rating: number }[] | { rating: number } | null | undefined
): number | null {
  if (!embed) return null;
  if (Array.isArray(embed)) return embed[0]?.rating ?? null;
  return embed.rating ?? null;
}
