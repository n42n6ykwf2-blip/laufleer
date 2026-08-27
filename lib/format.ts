import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { de as deLocale, enGB as enLocale } from "date-fns/locale";
import type { Locale } from "@/i18n/routing";

const RESTAURANT_TZ = "Europe/Berlin";

const dateFnsLocale = {
  de: deLocale,
  en: enLocale,
} as const;

export function formatPrice(
  cents: number,
  locale: Locale,
  currency = "EUR"
): string {
  return new Intl.NumberFormat(locale === "de" ? "de-DE" : "en-GB", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function formatDateTime(input: string | Date, locale: Locale): string {
  const date = typeof input === "string" ? new Date(input) : input;
  const zoned = toZonedTime(date, RESTAURANT_TZ);
  const pattern = locale === "de" ? "dd.MM.yyyy 'um' HH:mm" : "dd/MM/yyyy 'at' HH:mm";
  return format(zoned, pattern, { locale: dateFnsLocale[locale] });
}

export function formatDate(input: string | Date, locale: Locale): string {
  const date = typeof input === "string" ? new Date(input) : input;
  const zoned = toZonedTime(date, RESTAURANT_TZ);
  const pattern = locale === "de" ? "dd.MM.yyyy" : "dd/MM/yyyy";
  return format(zoned, pattern, { locale: dateFnsLocale[locale] });
}

/** 2 → "€€" (4 tadan, faollari to'q rangda ko'rsatiladi) */
export function priceLevelSymbol(level: number | null): string {
  if (!level || level < 1) return "";
  return "€".repeat(Math.min(level, 4));
}

export function localizedText(
  value: unknown,
  locale: Locale,
  fallback = ""
): string {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null) {
    const dict = value as Record<string, string>;
    return dict[locale] ?? dict.de ?? dict.en ?? fallback;
  }
  return fallback;
}
