"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentCustomer } from "@/lib/customer";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { CANCEL_CUTOFF_HOURS } from "@/lib/booking-rules";

export type CancelResult = { ok: true } | { ok: false; error: string };

const schema = z.object({ id: z.string().uuid() });

/**
 * Mijoz o'z bronini bekor qiladi.
 *
 * Mijozga bazada UPDATE huquqi berilmagan — aks holda statusni
 * 'completed' qilib o'ziga sodiqlik ballari yozib olardi. Shuning uchun
 * bu yerda service_role ishlatiladi va hamma shart qo'lda tekshiriladi:
 *   1. bron shu mijozning emailiga tegishli
 *   2. status pending yoki confirmed
 *   3. bron vaqti kelajakda
 *   4. boshlanishiga CANCEL_CUTOFF_HOURS dan ko'p qolgan
 *
 * Bekor qilingan bron stolni avtomatik bo'shatadi — bandlik mantiqi
 * 'cancelled' holatini hisobga olmaydi.
 */
export async function cancelMyReservation(
  raw: unknown
): Promise<CancelResult> {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "unknown" };

  const { customer } = await getCurrentCustomer();
  if (!customer?.email) return { ok: false, error: "notAuthenticated" };

  const admin = createSupabaseAdminClient();

  const { data: reservation } = await admin
    .from("reservations")
    .select("id, guest_email, status, reservation_at, reward_id")
    .eq("id", parsed.data.id)
    .maybeSingle();

  if (!reservation) return { ok: false, error: "notFound" };

  // 1) Egalik — emailni taqqoslaymiz
  const mine =
    reservation.guest_email != null &&
    reservation.guest_email.trim().toLowerCase() ===
      customer.email.trim().toLowerCase();
  if (!mine) return { ok: false, error: "notFound" };

  // 2) Holat
  if (!["pending", "confirmed"].includes(reservation.status)) {
    return { ok: false, error: "notCancellable" };
  }

  // 3) va 4) Vaqt
  const startsAt = new Date(reservation.reservation_at).getTime();
  const cutoff = Date.now() + CANCEL_CUTOFF_HOURS * 60 * 60 * 1000;
  if (startsAt <= Date.now()) return { ok: false, error: "alreadyPassed" };
  if (startsAt < cutoff) return { ok: false, error: "tooLate" };

  const { error } = await admin
    .from("reservations")
    /**
     * reward_id ni ham uzamiz: aks holda bekor qilingan bron chegirmani
     * "band" qilib turadi va reservations_reward_unique indeksi tufayli
     * qaytgan chegirma bilan yangi bron 409 bilan yiqiladi.
     */
    .update({ status: "cancelled", reward_id: null, discount_percent: null })
    .eq("id", reservation.id);

  if (error) return { ok: false, error: "unknown" };

  /**
   * Chegirma mijozga QAYTADI — bekor qilgani uchun 10 tashrif mehnatini
   * yo'qotmasligi kerak. `status = 'reserved'` sharti bilan: allaqachon
   * ishlatilgan (redeemed) chegirma qaytarilmaydi.
   */
  if (reservation.reward_id) {
    await admin
      .from("loyalty_rewards")
      .update({ status: "active", reserved_at: null })
      .eq("id", reservation.reward_id)
      .eq("status", "reserved");
  }

  revalidatePath("/account/bookings", "page");
  revalidatePath("/account/points", "page");
  return { ok: true };
}
