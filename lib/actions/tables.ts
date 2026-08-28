"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getOwnedRestaurant } from "@/lib/owner";
import type { ActionResult } from "@/lib/actions/menu";

const tableSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().trim().min(1, "labelRequired").max(20),
  capacity: z.number().int().min(1, "capacityInvalid").max(50),
});

export async function saveTable(raw: unknown): Promise<ActionResult> {
  const parsed = tableSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }
  const input = parsed.data;

  const { supabase, restaurant } = await getOwnedRestaurant();
  if (!restaurant) return { ok: false, error: "noProfile" };

  const row = {
    restaurant_id: restaurant.id,
    label: input.label,
    capacity: input.capacity,
  };

  const { error } = input.id
    ? await supabase.from("restaurant_tables").update(row).eq("id", input.id)
    : await supabase.from("restaurant_tables").insert(row);

  if (error) return { ok: false, error: "unknown" };
  revalidatePath("/partner/tables", "page");
  return { ok: true };
}

export async function deleteTable(id: string): Promise<ActionResult> {
  const { supabase, restaurant } = await getOwnedRestaurant();
  if (!restaurant) return { ok: false, error: "noProfile" };

  const { error } = await supabase
    .from("restaurant_tables")
    .delete()
    .eq("id", id);
  if (error) return { ok: false, error: "unknown" };

  revalidatePath("/partner/tables", "page");
  return { ok: true };
}
