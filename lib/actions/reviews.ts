"use server";

import { revalidatePath } from "next/cache";
import { getCurrentCustomer } from "@/lib/customer";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { reviewInputSchema } from "@/lib/validation/review";
import { canStillReview } from "@/lib/reviews";

export type ReviewResult = { ok: true } | { ok: false; error: string };

/**
 * Mijoz tashrifidan keyin sharh qoldiradi.
 *
 * `reviews` jadvalida yozish siyosati yo'q — shuning uchun service_role
 * va barcha shartlar shu yerda, tartib bilan tekshiriladi:
 *   1. mijoz tizimga kirgan
 *   2. bron shu mijozning emailiga tegishli
 *   3. bron "keldi" (completed) belgilangan
 *   4. tashrif o'tgan va 30 kundan oshmagan
 *   5. bir bron — bir sharh (unique indeks, 23505)
 */
export async function submitReview(raw: unknown): Promise<ReviewResult> {
  const parsed = reviewInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }
  const input = parsed.data;

  const { customer } = await getCurrentCustomer();
  if (!customer?.email) return { ok: false, error: "notAuthenticated" };

  const admin = createSupabaseAdminClient();

  const { data: reservation } = await admin
    .from("reservations")
    .select("id, restaurant_id, guest_email, status, reservation_at")
    .eq("id", input.reservationId)
    .maybeSingle();

  // Begona bron — mavjudligini ham oshkor qilmaymiz
  const mine =
    reservation?.guest_email != null &&
    reservation.guest_email.trim().toLowerCase() ===
      customer.email.trim().toLowerCase();
  if (!reservation || !mine) return { ok: false, error: "notFound" };

  if (reservation.status !== "completed") {
    return { ok: false, error: "notCompleted" };
  }

  if (!canStillReview(reservation.reservation_at)) {
    return { ok: false, error: "windowClosed" };
  }

  const comment = input.comment?.trim() || null;

  const { error } = await admin.from("reviews").insert({
    reservation_id: reservation.id,
    restaurant_id: reservation.restaurant_id,
    customer_id: customer.id,
    rating: input.rating,
    comment,
  });

  if (error) {
    return {
      ok: false,
      error: error.code === "23505" ? "alreadyReviewed" : "unknown",
    };
  }

  revalidatePath("/account/bookings", "page");
  revalidatePath("/partner/reviews", "page");
  return { ok: true };
}
