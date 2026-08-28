"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getOwnedRestaurant } from "@/lib/owner";

export type ActionResult = { ok: true } | { ok: false; error: string };

const categorySchema = z.object({
  id: z.string().uuid().optional(),
  nameDe: z.string().trim().min(2, "nameRequired").max(80),
  nameEn: z.string().trim().max(80).optional(),
  sortOrder: z.number().int().min(0).max(999),
});

const itemSchema = z.object({
  id: z.string().uuid().optional(),
  categoryId: z.string().uuid(),
  nameDe: z.string().trim().min(2, "nameRequired").max(120),
  nameEn: z.string().trim().max(120).optional(),
  descDe: z.string().trim().max(500).optional(),
  descEn: z.string().trim().max(500).optional(),
  priceCents: z.number().int().min(0).max(1_000_000),
  isAvailable: z.boolean(),
  sortOrder: z.number().int().min(0).max(999),
});

function localized(de: string, en?: string) {
  return en?.trim() ? { de, en: en.trim() } : { de };
}

export async function saveCategory(raw: unknown): Promise<ActionResult> {
  const parsed = categorySchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }
  const input = parsed.data;

  const { supabase, restaurant } = await getOwnedRestaurant();
  if (!restaurant) return { ok: false, error: "noProfile" };

  const row = {
    restaurant_id: restaurant.id,
    name: localized(input.nameDe, input.nameEn),
    sort_order: input.sortOrder,
  };

  const { error } = input.id
    ? await supabase.from("menu_categories").update(row).eq("id", input.id)
    : await supabase.from("menu_categories").insert(row);

  if (error) return { ok: false, error: "unknown" };
  revalidatePath("/partner/menu", "page");
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const { supabase, restaurant } = await getOwnedRestaurant();
  if (!restaurant) return { ok: false, error: "noProfile" };

  const { error } = await supabase.from("menu_categories").delete().eq("id", id);
  if (error) return { ok: false, error: "unknown" };

  revalidatePath("/partner/menu", "page");
  return { ok: true };
}

export async function saveItem(raw: unknown): Promise<ActionResult> {
  const parsed = itemSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }
  const input = parsed.data;

  const { supabase, restaurant } = await getOwnedRestaurant();
  if (!restaurant) return { ok: false, error: "noProfile" };

  const row = {
    restaurant_id: restaurant.id,
    category_id: input.categoryId,
    name: localized(input.nameDe, input.nameEn),
    description: input.descDe
      ? localized(input.descDe, input.descEn)
      : {},
    price_cents: input.priceCents,
    currency: "EUR",
    is_available: input.isAvailable,
    sort_order: input.sortOrder,
  };

  const { error } = input.id
    ? await supabase.from("menu_items").update(row).eq("id", input.id)
    : await supabase.from("menu_items").insert(row);

  if (error) return { ok: false, error: "unknown" };
  revalidatePath("/partner/menu", "page");
  return { ok: true };
}

export async function deleteItem(id: string): Promise<ActionResult> {
  const { supabase, restaurant } = await getOwnedRestaurant();
  if (!restaurant) return { ok: false, error: "noProfile" };

  const { error } = await supabase.from("menu_items").delete().eq("id", id);
  if (error) return { ok: false, error: "unknown" };

  revalidatePath("/partner/menu", "page");
  return { ok: true };
}
