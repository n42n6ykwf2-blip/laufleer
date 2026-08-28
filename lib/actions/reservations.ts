"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getOwnedRestaurant } from "@/lib/owner";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ReservationStatus } from "@/lib/types";

export type StatusResult =
  | { ok: true; pointsAwarded?: number }
  | { ok: false; error: string };

const schema = z.object({
  id: z.string().uuid(),
  status: z.enum(["confirmed", "cancelled", "completed", "no_show"]),
});

/**
 * Mijozga sodiqlik ballarini yozadi.
 * Sodiqlik jadvallarida INSERT siyosati yo'q — shuning uchun service_role.
 * Bir rezervatsiya uchun ikki marta ball berilmasligini
 * `loyalty_tx_one_earn_per_reservation` unique indeksi kafolatlaydi.
 */
async function awardPoints(
  reservationId: string,
  restaurantId: string,
  points: number,
  guestEmail: string | null,
  guestName: string | null,
  guestPhone: string | null
): Promise<number> {
  if (!guestEmail || points <= 0) return 0;

  const admin = createSupabaseAdminClient();
  const email = guestEmail.trim().toLowerCase();

  // Hisobni topamiz yoki yaratamiz
  const { data: existing } = await admin
    .from("loyalty_accounts")
    .select("id")
    .ilike("email", email)
    .maybeSingle();

  let accountId = existing?.id as string | undefined;
  if (!accountId) {
    const { data: created, error } = await admin
      .from("loyalty_accounts")
      .insert({ email, name: guestName, phone: guestPhone })
      .select("id")
      .single();
    if (error || !created) return 0;
    accountId = created.id;
  }

  // Tranzaksiya — takrorlansa unique indeks to'xtatadi
  const { error: txError } = await admin.from("loyalty_transactions").insert({
    account_id: accountId,
    restaurant_id: restaurantId,
    reservation_id: reservationId,
    points,
    kind: "earned",
  });
  if (txError) return 0; // allaqachon berilgan

  // Balansni yangilaymiz
  const { data: balance } = await admin
    .from("loyalty_balances")
    .select("points")
    .eq("account_id", accountId)
    .eq("restaurant_id", restaurantId)
    .maybeSingle();

  const next = (balance?.points ?? 0) + points;
  await admin.from("loyalty_balances").upsert(
    {
      account_id: accountId,
      restaurant_id: restaurantId,
      points: next,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "account_id,restaurant_id" }
  );

  return points;
}

export async function updateReservationStatus(
  raw: unknown
): Promise<StatusResult> {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "unknown" };
  const { id, status } = parsed.data;

  const { supabase, restaurant } = await getOwnedRestaurant();
  if (!restaurant) return { ok: false, error: "noProfile" };

  // RLS egalikni tekshiradi, lekin aniq xato uchun o'zimiz ham o'qiymiz
  const { data: reservation } = await supabase
    .from("reservations")
    .select("id, restaurant_id, status, guest_email, guest_name, guest_phone")
    .eq("id", id)
    .maybeSingle();

  if (!reservation || reservation.restaurant_id !== restaurant.id) {
    return { ok: false, error: "notFound" };
  }

  const { error } = await supabase
    .from("reservations")
    .update({ status: status as ReservationStatus })
    .eq("id", id);
  if (error) return { ok: false, error: "unknown" };

  let pointsAwarded = 0;
  if (
    status === "completed" &&
    restaurant.loyalty_enabled &&
    reservation.status !== "completed"
  ) {
    pointsAwarded = await awardPoints(
      reservation.id,
      restaurant.id,
      restaurant.loyalty_points_per_visit ?? 0,
      reservation.guest_email,
      reservation.guest_name,
      reservation.guest_phone
    );
  }

  revalidatePath("/partner/reservations", "page");
  revalidatePath("/partner/loyalty", "page");
  return { ok: true, pointsAwarded };
}
