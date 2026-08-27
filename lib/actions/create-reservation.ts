"use server";

import { fromZonedTime } from "date-fns-tz";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { reservationInputSchema } from "@/lib/validation/reservation";
import type { RestaurantTable, Reservation } from "@/lib/types";

const RESTAURANT_TZ = "Europe/Berlin";
const DEFAULT_DURATION_MIN = 90;

export type CreateReservationResult =
  | { ok: true; reservationId: string; reservationCode: string }
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

  // 3) Rezervatsiya kiritish
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
    })
    .select("id")
    .single();

  if (insertErr || !created) {
    return { ok: false, error: "unknown" };
  }

  return {
    ok: true,
    reservationId: created.id,
    reservationCode: created.id.slice(0, 8).toUpperCase(),
  };
}
