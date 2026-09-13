import { z } from "zod";

export const reviewInputSchema = z.object({
  reservationId: z.string().uuid(),
  rating: z
    .number({ error: "ratingRequired" })
    .int()
    .min(1, "ratingRequired")
    .max(5, "ratingRequired"),
  comment: z.string().max(1000).optional(),
});

export type ReviewInput = z.infer<typeof reviewInputSchema>;
