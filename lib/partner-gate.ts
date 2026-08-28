/**
 * Hamkor bo'limi uchun kirish to'sig'i.
 *
 * Loyiha hali huquqiy jihatdan ishga tushirilmagan (kompaniya yo'q,
 * Impressum/Datenschutz haqiqiy emas). `noindex` saytni qidiruvdan
 * yashiradi, lekin manzilni bilgan odam baribir kira oladi —
 * shuning uchun ro'yxatdan o'tish formasi kod bilan yopiladi.
 *
 * Xatti-harakat:
 *   - Lokal (production emas) + kod yo'q  -> to'siq YO'Q, erkin sinash
 *   - Production + kod bor               -> kod so'raladi
 *   - Production + kod YO'Q              -> BUTUNLAY YOPIQ (fail-closed)
 *
 * Oxirgi holat ataylab shunday: sozlash unutilsa, forma ochiq qolib
 * ketmasligi kerak. Ochiq qolsa — begona odam haqiqiy ma'lumot kiritishi
 * mumkin, bu esa DSGVO/TMG jihatdan xavfli.
 */
export const PARTNER_COOKIE = "laufleer_partner_access";

/** Hech qachon mos kelmaydigan qiymat — "yopiq" holatni bildiradi */
const LOCKED = "__laufleer_locked__";

export function partnerAccessCode(): string | null {
  const code = process.env.PARTNER_ACCESS_CODE?.trim();
  if (code) return code;
  // Production'da kod yo'q bo'lsa — kirib bo'lmaydigan qiymat qaytaramiz
  return process.env.NODE_ENV === "production" ? LOCKED : null;
}

/** To'siq yoqilganmi? */
export function isPartnerGateEnabled(): boolean {
  return partnerAccessCode() !== null;
}

/** Kod umuman sozlanmagan (production'da butunlay yopiq) holat */
export function isPartnerAreaLocked(): boolean {
  return partnerAccessCode() === LOCKED;
}

export function isPartnerCookieValid(cookieValue: string | undefined): boolean {
  const code = partnerAccessCode();
  if (!code) return true;
  if (code === LOCKED) return false;
  return cookieValue === code;
}
