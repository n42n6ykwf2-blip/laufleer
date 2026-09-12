/**
 * Bron qoidalari — server va klient o'rtasida umumiy.
 *
 * Alohida faylda, chunki "use server" moduli faqat async funksiya
 * eksport qila oladi — konstantani u yerdan olish mumkin emas.
 */

/** Bron boshlanishiga shundan kam qolsa, mijoz o'zi bekor qila olmaydi */
export const CANCEL_CUTOFF_HOURS = 2;
