"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getOwnedRestaurant } from "@/lib/owner";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  DEFAULT_LOYALTY_THRESHOLD,
  DEFAULT_DISCOUNT_PERCENT,
} from "@/lib/loyalty";
import type { ReservationStatus } from "@/lib/types";

export type StatusResult =
  | { ok: true; pointsAwarded?: number; rewardsCreated?: number }
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
  guestPhone: string | null,
  threshold: number,
  discountPercent: number
): Promise<{ points: number; rewardsCreated: number }> {
  const none = { points: 0, rewardsCreated: 0 };
  if (!guestEmail || points <= 0) return none;

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
    if (error || !created) return none;
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
  if (txError) return none; // allaqachon berilgan

  // TypeScript uchun aniqlik — yuqorida hisob yaratilgan yoki topilgan
  if (!accountId) return none;
  const account: string = accountId;

  const { data: balance } = await admin
    .from("loyalty_balances")
    .select("points")
    .eq("account_id", account)
    .eq("restaurant_id", restaurantId)
    .maybeSingle();

  let running = (balance?.points ?? 0) + points;

  /**
   * Aylana: chegara to'lgani sari chegirma yaratiladi va ball AYIRILADI.
   * Ayirish shu bosqichda — tasdiqlashda emas. Shunda mijoz ishlatilmagan
   * chegirma ushlab turganda ham yangi ball yig'a boshlaydi va hech narsa
   * yo'qolmaydi.
   *
   * Halqa, chunki restoran bir tashrifga chegaradan ko'p ball qo'ysa
   * bir vaqtda bir nechta chegirma tushishi mumkin. `safety` — cheksiz
   * aylanishdan himoya.
   */
  let rewardsCreated = 0;
  if (threshold > 0) {
    for (let safety = 0; safety < 50 && running >= threshold; safety++) {
      const { data: reward, error: rewardError } = await admin
        .from("loyalty_rewards")
        .insert({
          account_id: account,
          restaurant_id: restaurantId,
          discount_percent: discountPercent,
          points_spent: threshold,
          status: "active",
          expires_at: null, // muddatsiz
        })
        .select("id")
        .single();

      // Chegirma yozilmasa balansni ham kamaytirmaymiz — ball yo'qolmasin
      if (rewardError || !reward) break;

      running -= threshold;
      rewardsCreated++;

      await admin.from("loyalty_transactions").insert({
        account_id: account,
        restaurant_id: restaurantId,
        reservation_id: null,
        points: -threshold,
        kind: "redeemed",
        note: `reward ${reward.id}`,
      });
    }
  }

  await admin.from("loyalty_balances").upsert(
    {
      account_id: account,
      restaurant_id: restaurantId,
      points: Math.max(0, running),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "account_id,restaurant_id" }
  );

  return { points, rewardsCreated };
}

/**
 * Bronga bog'langan chegirmani yangi holatga o'tkazadi.
 *
 * "keldi"            -> redeemed (ishlatildi)
 * bekor / kelmadi    -> active   (mijozga QAYTADI)
 *
 * Qaytarish muhim: aks holda bir marta bekor qilgan odam 10 tashrif
 * mehnatini yo'qotardi.
 */
async function settleReservationReward(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  rewardId: string | null,
  outcome: "redeemed" | "returned"
): Promise<void> {
  if (!rewardId) return;

  if (outcome === "redeemed") {
    await admin
      .from("loyalty_rewards")
      .update({ status: "redeemed", redeemed_at: new Date().toISOString() })
      .eq("id", rewardId)
      .eq("status", "reserved");
    return;
  }

  await admin
    .from("loyalty_rewards")
    .update({ status: "active", reserved_at: null })
    .eq("id", rewardId)
    .eq("status", "reserved");
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
    .select(
      "id, restaurant_id, status, guest_email, guest_name, guest_phone, reward_id"
    )
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
  let rewardsCreated = 0;
  if (
    status === "completed" &&
    restaurant.loyalty_enabled &&
    reservation.status !== "completed"
  ) {
    const result = await awardPoints(
      reservation.id,
      restaurant.id,
      restaurant.loyalty_points_per_visit ?? 0,
      reservation.guest_email,
      reservation.guest_name,
      reservation.guest_phone,
      restaurant.loyalty_threshold ?? DEFAULT_LOYALTY_THRESHOLD,
      restaurant.loyalty_discount_percent ?? DEFAULT_DISCOUNT_PERCENT
    );
    pointsAwarded = result.points;
    rewardsCreated = result.rewardsCreated;
  }

  // Bronga bog'langan chegirma taqdirini hal qilamiz
  if (reservation.reward_id) {
    const admin = createSupabaseAdminClient();
    if (status === "completed") {
      await settleReservationReward(admin, reservation.reward_id, "redeemed");
    } else if (status === "cancelled" || status === "no_show") {
      await settleReservationReward(admin, reservation.reward_id, "returned");
    }
  }

  revalidatePath("/partner/reservations", "page");
  revalidatePath("/partner/loyalty", "page");
  revalidatePath("/account/points", "page");
  return { ok: true, pointsAwarded, rewardsCreated };
}
