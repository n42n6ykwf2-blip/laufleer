"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getOwnedRestaurant } from "@/lib/owner";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { normalizeRewardCode } from "@/lib/loyalty";

export type RedeemResult =
  | { ok: true; discountPercent: number; guestName: string | null }
  | { ok: false; error: string };

const schema = z.object({
  code: z.string().trim().min(3).max(32),
});

/**
 * Restoran chegirma kodini tasdiqlaydi.
 *
 * `loyalty_rewards` da yozish siyosati yo'q — shuning uchun service_role.
 * BALANSGA TEGILMAYDI: ball chegirma yaratilganda allaqachon ayirilgan,
 * bu amal shunchaki "kod ishlatildi" degan belgi qo'yadi.
 */
export async function redeemRewardByCode(
  raw: unknown
): Promise<RedeemResult> {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "codeInvalid" };

  const { restaurant } = await getOwnedRestaurant();
  if (!restaurant) return { ok: false, error: "noProfile" };

  const code = normalizeRewardCode(parsed.data.code);
  const admin = createSupabaseAdminClient();

  const { data: reward } = await admin
    .from("loyalty_rewards")
    .select(
      "id, restaurant_id, status, discount_percent, expires_at, account_id"
    )
    .ilike("code", code)
    .maybeSingle();

  if (!reward) return { ok: false, error: "codeNotFound" };

  // Boshqa restoranning kodi — mavjudligini ham oshkor qilmaymiz
  if (reward.restaurant_id !== restaurant.id) {
    return { ok: false, error: "codeNotFound" };
  }

  if (reward.status === "redeemed") {
    return { ok: false, error: "alreadyRedeemed" };
  }
  if (reward.status !== "active") {
    return { ok: false, error: "notActive" };
  }
  if (reward.expires_at && new Date(reward.expires_at) < new Date()) {
    return { ok: false, error: "expired" };
  }

  /**
   * Holatni faqat 'active' bo'lganda o'zgartiramiz. Ikki xodim bir vaqtda
   * bosib yuborsa, ikkinchisiga 0 qator tegadi va "allaqachon ishlatilgan"
   * javobini oladi.
   */
  const { data: updated, error } = await admin
    .from("loyalty_rewards")
    .update({ status: "redeemed", redeemed_at: new Date().toISOString() })
    .eq("id", reward.id)
    .eq("status", "active")
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, error: "unknown" };
  if (!updated) return { ok: false, error: "alreadyRedeemed" };

  // Mijoz ismini ko'rsatish uchun (xodimga tasdiq bo'lsin)
  const { data: account } = await admin
    .from("loyalty_accounts")
    .select("name")
    .eq("id", reward.account_id)
    .maybeSingle();

  revalidatePath("/partner/loyalty", "page");
  return {
    ok: true,
    discountPercent: reward.discount_percent,
    guestName: account?.name ?? null,
  };
}
