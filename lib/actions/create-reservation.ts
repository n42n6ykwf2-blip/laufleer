"use server";

import { fromZonedTime } from "date-fns-tz";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentCustomer } from "@/lib/customer";
import { reservationInputSchema } from "@/lib/validation/reservation";
import type { RestaurantTable, Reservation } from "@/lib/types";

const RESTAURANT_TZ = "Europe/Berlin";
const DEFAULT_DURATION_MIN = 90;

export type CreateReservationResult =
  | {
      ok: true;
      reservationId: string;
      reservationCode: string;
      discountPercent?: number;
    }
  | { ok: false; error: string; field?: string };

export async function createReservation(
  raw: unknown
): Promise<CreateReservationResult> {
  const parsed = reservationInputSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      ok: false,
      error: first.message,
      field: first.path.join("."),
    };
  }
  const input = parsed.data;

  // sanani Europe/Berlin da UTC ga o'giramiz
  const reservationAt = fromZonedTime(
    `${input.date}T${input.time}:00`,
    RESTAURANT_TZ
  );
  if (Number.isNaN(reservationAt.getTime()) || reservationAt <= new Date()) {
    return { ok: false, error: "dateInPast", field: "date" };
  }

  const supabase = createSupabaseAdminClient();

  // 1) Mos sig'imli stollarni yuklash
  const { data: tables, error: tablesErr } = await supabase
    .from("restaurant_tables")
    .select("*")
    .eq("restaurant_id", input.restaurantId)
    .gte("capacity", input.partySize)
    .order("capacity", { ascending: true });

  if (tablesErr) {
    return { ok: false, error: "unknown" };
  }
  if (!tables || tables.length === 0) {
    return { ok: false, error: "noTableAvailable" };
  }

  // 2) Kesishuvchi rezervatsiyalar oynasi
  const startsAt = reservationAt;
  const endsAt = new Date(
    reservationAt.getTime() + DEFAULT_DURATION_MIN * 60_000
  );

  const { data: overlapping, error: overlapErr } = await supabase
    .from("reservations")
    .select("id, table_id, reservation_at, duration_min, status")
    .eq("restaurant_id", input.restaurantId)
    .neq("status", "cancelled")
    // faqat shu restoran uchun; oralig'ini kengroq olamiz, JS'da aniqroq tekshiramiz
    .gte(
      "reservation_at",
      new Date(startsAt.getTime() - 6 * 60 * 60_000).toISOString()
    )
    .lte(
      "reservation_at",
      new Date(endsAt.getTime() + 6 * 60 * 60_000).toISOString()
    );

  if (overlapErr) {
    return { ok: false, error: "unknown" };
  }

  const bookedTableIds = new Set<string>();
  for (const r of (overlapping ?? []) as Reservation[]) {
    if (!r.table_id) continue;
    const rStart = new Date(r.reservation_at);
    const rEnd = new Date(
      rStart.getTime() + (r.duration_min ?? DEFAULT_DURATION_MIN) * 60_000
    );
    // kesishadi: rStart < endsAt AND rEnd > startsAt
    if (rStart < endsAt && rEnd > startsAt) {
      bookedTableIds.add(r.table_id);
    }
  }

  const chosen = (tables as RestaurantTable[]).find(
    (t) => !bookedTableIds.has(t.id)
  );
  if (!chosen) {
    return { ok: false, error: "noTableAvailable" };
  }

  /**
   * 3) Chegirmani band qilish (agar mijoz kirgan bo'lsa va chegirmasi bo'lsa)
   *
   * Shartli yangilanish — `status = 'active'` sharti bilan. Ikki qurilmadan
   * bir vaqtda bron qilinsa, ikkinchisiga 0 qator tegadi va bron
   * chegirmasiz davom etadi. Ya'ni bitta chegirma ikki marta ketmaydi.
   */
  let rewardId: string | null = null;
  let discountPercent: number | null = null;

  if (input.rewardId) {
    /**
     * XAVFSIZLIK: rewardId klientdan keladi, shuning uchun uning
     * TIZIMGA KIRGAN mijozga tegishliligini serverda tekshiramiz.
     * Busiz begona odam boshqasining chegirmasini ishlatib olardi.
     */
    const { customer } = await getCurrentCustomer();
    if (customer?.loyalty_account_id) {
      const claimed = await claimReward(
        input.rewardId,
        input.restaurantId,
        customer.loyalty_account_id
      );
      if (claimed) {
        rewardId = claimed.id;
        discountPercent = claimed.discount_percent;
      }
    }
  }

  // 4) Rezervatsiya kiritish
  const { data: created, error: insertErr } = await supabase
    .from("reservations")
    .insert({
      restaurant_id: input.restaurantId,
      table_id: chosen.id,
      guest_name: input.guestName,
      guest_phone: input.guestPhone ?? null,
      guest_email: input.guestEmail ?? null,
      party_size: input.partySize,
      reservation_at: reservationAt.toISOString(),
      duration_min: DEFAULT_DURATION_MIN,
      status: "confirmed",
      notes: input.notes ?? null,
      reward_id: rewardId,
      discount_percent: discountPercent,
    })
    .select("id")
    .single();

  if (insertErr || !created) {
    // Bron yozilmasa, band qilingan chegirmani qaytaramiz
    if (rewardId) {
      await supabase
        .from("loyalty_rewards")
        .update({ status: "active", reserved_at: null })
        .eq("id", rewardId)
        .eq("status", "reserved");
    }
    return { ok: false, error: "unknown" };
  }

  return {
    ok: true,
    reservationId: created.id,
    reservationCode: created.id.slice(0, 8).toUpperCase(),
    discountPercent: discountPercent ?? undefined,
  };
}

/**
 * Chegirmani 'active' -> 'reserved' ga o'tkazadi.
 *
 * Uch shart birga tekshiriladi — hammasi bitta `update` ichida,
 * shuning uchun poyga holatida ham ishonchli:
 *   - chegirma shu MIJOZGA tegishli
 *   - chegirma shu RESTORANGA tegishli
 *   - holati hali 'active'
 */
async function claimReward(
  rewardId: string,
  restaurantId: string,
  accountId: string
): Promise<{ id: string; discount_percent: number } | null> {
  const admin = createSupabaseAdminClient();

  const { data } = await admin
    .from("loyalty_rewards")
    .update({ status: "reserved", reserved_at: new Date().toISOString() })
    .eq("id", rewardId)
    .eq("restaurant_id", restaurantId)
    .eq("account_id", accountId)
    .eq("status", "active")
    .select("id, discount_percent")
    .maybeSingle();

  return data ?? null;
}
