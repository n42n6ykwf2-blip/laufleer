/**
 * Hamkor bo'limi uchun kirish to'sig'i.
 *
 * Loyiha hali huquqiy jihatdan ishga tushirilmagan (kompaniya yo'q,
 * Impressum/Datenschutz haqiqiy emas). `noindex` saytni qidiruvdan
 * yashiradi, lekin manzilni bilgan odam baribir kira oladi —
 * shuning uchun ro'yxatdan o'tish formasi kod bilan yopiladi.
 *
 * PARTNER_ACCESS_CODE o'rnatilmagan bo'lsa (lokal ishlab chiqish),
 * to'siq umuman ishlamaydi.
 */
export const PARTNER_COOKIE = "laufleer_partner_access";

export function partnerAccessCode(): string | null {
  const code = process.env.PARTNER_ACCESS_CODE?.trim();
  return code ? code : null;
}

/** To'siq yoqilganmi? */
export function isPartnerGateEnabled(): boolean {
  return partnerAccessCode() !== null;
}

export function isPartnerCookieValid(cookieValue: string | undefined): boolean {
  const code = partnerAccessCode();
  if (!code) return true;
  return cookieValue === code;
}
