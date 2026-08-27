import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";
import { ALL_FEATURES } from "@/lib/types";

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

const daySchema = z
  .object({
    closed: z.boolean(),
    open: z.string(),
    close: z.string(),
  })
  .superRefine((d, ctx) => {
    if (d.closed) return;
    if (!timePattern.test(d.open) || !timePattern.test(d.close)) {
      ctx.addIssue({ code: "custom", message: "timeInvalid" });
      return;
    }
    if (d.open >= d.close) {
      ctx.addIssue({ code: "custom", message: "timeOrder" });
    }
  });

export const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

export const restaurantProfileSchema = z.object({
  name: z.string().trim().min(2, "nameRequired").max(120),
  cuisine: z.string().trim().min(2, "cuisineRequired").max(60),
  descriptionDe: z.string().trim().min(20, "descriptionRequired").max(1000),
  descriptionEn: z.string().trim().max(1000).optional(),

  street: z.string().trim().min(2, "streetRequired").max(120),
  houseNumber: z.string().trim().min(1, "houseNumberRequired").max(20),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}$/, "postalCodeInvalid"),
  city: z.string().trim().min(2, "cityRequired").max(80),
  neighborhood: z.string().trim().max(80).optional(),

  phone: z.string().trim().min(1, "phoneRequired"),

  priceLevel: z.number().int().min(1, "priceRequired").max(4),
  features: z.array(z.enum(ALL_FEATURES as [string, ...string[]])).max(6),

  coverImageUrl: z.string().trim().url("imageInvalid").optional().or(z.literal("")),

  openingHours: z.object({
    mon: daySchema,
    tue: daySchema,
    wed: daySchema,
    thu: daySchema,
    fri: daySchema,
    sat: daySchema,
    sun: daySchema,
  }),
}).superRefine((data, ctx) => {
  if (!isValidPhoneNumber(data.phone)) {
    ctx.addIssue({ code: "custom", path: ["phone"], message: "phoneInvalid" });
  }
  // Kamida bir kun ochiq bo'lishi kerak
  const anyOpen = WEEKDAYS.some((d) => !data.openingHours[d].closed);
  if (!anyOpen) {
    ctx.addIssue({
      code: "custom",
      path: ["openingHours"],
      message: "hoursAllClosed",
    });
  }
});

export type RestaurantProfileInput = z.infer<typeof restaurantProfileSchema>;

/** "Café Hüftgold" → "cafe-hueftgold" */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
