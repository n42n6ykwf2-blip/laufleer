"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  restaurantProfileSchema,
  slugify,
  WEEKDAYS,
} from "@/lib/validation/restaurant";
import type { OpeningHours } from "@/lib/types";

export type SaveResult =
  | { ok: true; slug: string }
  | { ok: false; error: string; field?: string };

export type SubmitResult = { ok: true } | { ok: false; error: string };

/** Forma ko'rinishidagi ish vaqtini bazadagi jsonb shakliga o'giradi */
function toOpeningHours(
  input: Record<string, { closed: boolean; open: string; close: string }>
): OpeningHours {
  const out: OpeningHours = {};
  for (const day of WEEKDAYS) {
    const d = input[day];
    out[day] = d.closed ? [] : [{ open: d.open, close: d.close }];
  }
  return out;
}

async function uniqueSlug(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  base: string,
  ownRestaurantId: string | null
): Promise<string> {
  const root = base || "restaurant";
  for (let attempt = 0; attempt < 25; attempt++) {
    const candidate =
      attempt === 0 ? root : `${root}-${Math.random().toString(36).slice(2, 6)}`;
    const { data } = await supabase
      .from("restaurants")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data || data.id === ownRestaurantId) return candidate;
  }
  return `${root}-${Date.now().toString(36)}`;
}

export async function saveRestaurantProfile(
  raw: unknown
): Promise<SaveResult> {
  const parsed = restaurantProfileSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first.message, field: first.path.join(".") };
  }
  const input = parsed.data;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "notAuthenticated" };

  const { data: existing } = await supabase
    .from("restaurants")
    .select("id, slug, status")
    .eq("owner_id", user.id)
    .maybeSingle();

  // Tasdiqlangan profil nomi o'zgarsa ham slug saqlanadi (havolalar buzilmasin)
  const slug =
    existing?.slug && existing.status === "approved"
      ? existing.slug
      : await uniqueSlug(supabase, slugify(input.name), existing?.id ?? null);

  const row = {
    owner_id: user.id,
    slug,
    name: input.name,
    cuisine: input.cuisine,
    description: {
      de: input.descriptionDe,
      ...(input.descriptionEn ? { en: input.descriptionEn } : {}),
    },
    street: input.street,
    house_number: input.houseNumber,
    postal_code: input.postalCode,
    city: input.city,
    neighborhood: input.neighborhood || null,
    country: "DE",
    phone: input.phone,
    price_level: input.priceLevel,
    features: input.features,
    cover_image_url: input.coverImageUrl || null,
    opening_hours: toOpeningHours(input.openingHours),
  };

  const { error } = existing
    ? await supabase.from("restaurants").update(row).eq("id", existing.id)
    : await supabase.from("restaurants").insert(row);

  if (error) {
    return { ok: false, error: error.code === "23505" ? "slugTaken" : "unknown" };
  }

  revalidatePath("/partner/profile", "page");
  return { ok: true, slug };
}

/** Profilni tekshiruvga yuboradi (draft/rejected → pending) */
export async function submitForReview(): Promise<SubmitResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "notAuthenticated" };

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, status")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!restaurant) return { ok: false, error: "noProfile" };
  if (!["draft", "rejected"].includes(restaurant.status)) {
    return { ok: false, error: "alreadySubmitted" };
  }

  // Statusni faqat draft/rejected → pending ga o'zgartirishga
  // ma'lumotlar bazasidagi trigger ham ruxsat beradi
  const { error } = await supabase
    .from("restaurants")
    .update({ status: "pending", submitted_at: new Date().toISOString() })
    .eq("id", restaurant.id);

  if (error) return { ok: false, error: "unknown" };

  revalidatePath("/partner/profile", "page");
  return { ok: true };
}
