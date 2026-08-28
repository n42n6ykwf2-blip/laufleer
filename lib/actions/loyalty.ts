"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getOwnedRestaurant } from "@/lib/owner";
import type { ActionResult } from "@/lib/actions/menu";

const settingsSchema = z.object({
  enabled: z.boolean(),
  pointsPerVisit: z.number().int().min(0).max(1000),
});

export async function saveLoyaltySettings(
  raw: unknown
): Promise<ActionResult> {
  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "unknown" };

  const { supabase, restaurant } = await getOwnedRestaurant();
  if (!restaurant) return { ok: false, error: "noProfile" };

  const { error } = await supabase
    .from("restaurants")
    .update({
      loyalty_enabled: parsed.data.enabled,
      loyalty_points_per_visit: parsed.data.pointsPerVisit,
    })
    .eq("id", restaurant.id);

  if (error) return { ok: false, error: "unknown" };

  revalidatePath("/partner/loyalty", "page");
  return { ok: true };
}
