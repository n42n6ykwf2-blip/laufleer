import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";

const isoDate = /^\d{4}-\d{2}-\d{2}$/;
const isoTime = /^\d{2}:\d{2}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isBlank(v: string | undefined | null): boolean {
  return !v || v.trim().length === 0;
}

export const reservationInputSchema = z
  .object({
    restaurantId: z.string().uuid(),
    guestName: z.string().min(2, "nameRequired").max(100),
    guestPhone: z.string().optional(),
    guestEmail: z.string().optional(),
    partySize: z
      .number({ error: "partySizeInvalid" })
      .int()
      .min(1, "partySizeInvalid")
      .max(20, "partySizeInvalid"),
    date: z.string().regex(isoDate, "dateInPast"),
    time: z.string().regex(isoTime, "dateInPast"),
    notes: z.string().max(500).optional(),
    // Chegirma id si — serverda mijozga tegishliligi tekshiriladi
    rewardId: z.string().uuid().optional(),
  })
  .superRefine((data, ctx) => {
    const phoneBlank = isBlank(data.guestPhone);
    const emailBlank = isBlank(data.guestEmail);

    if (phoneBlank && emailBlank) {
      ctx.addIssue({
        code: "custom",
        path: ["guestPhone"],
        message: "contactRequired",
      });
    }
    if (!phoneBlank && !isValidPhoneNumber(data.guestPhone!.trim())) {
      ctx.addIssue({
        code: "custom",
        path: ["guestPhone"],
        message: "phoneInvalid",
      });
    }
    if (!emailBlank && !emailPattern.test(data.guestEmail!.trim())) {
      ctx.addIssue({
        code: "custom",
        path: ["guestEmail"],
        message: "emailInvalid",
      });
    }
    if (isBlank(data.guestName)) {
      ctx.addIssue({
        code: "custom",
        path: ["guestName"],
        message: "nameRequired",
      });
    }
  });

export type ReservationInput = z.infer<typeof reservationInputSchema>;
