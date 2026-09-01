"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  passwordResetRequestSchema,
  newPasswordSchema,
} from "@/lib/validation/password-reset";

export type ResetResult = { ok: true } | { ok: false; error: string };

/** Qayerga qaytadi — tiklash sahifasi */
async function recoveryUrl(): Promise<string> {
  const h = await headers();
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (h.get("origin") || `https://${h.get("host") ?? "localhost:3000"}`);
  return `${origin}/auth/callback?next=/account/reset`;
}

/**
 * Tiklash havolasini yuboradi.
 *
 * MUHIM: email ro'yxatda bor-yo'qligini OSHKOR QILMAYMIZ — aks holda
 * begona odam qaysi manzillar ro'yxatdan o'tganini bilib oladi.
 * Shuning uchun har doim muvaffaqiyat qaytariladi.
 */
export async function requestPasswordReset(raw: unknown): Promise<ResetResult> {
  const parsed = passwordResetRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    { redirectTo: await recoveryUrl() }
  );

  // Faqat tezlik cheklovini ko'rsatamiz — qolgani yashiriladi
  if (error && /rate limit|too many/i.test(error.message)) {
    return { ok: false, error: "tooManyAttempts" };
  }

  return { ok: true };
}

/**
 * Yangi parolni o'rnatadi.
 * Faqat tiklash havolasi bergan sessiya bilan ishlaydi.
 */
export async function updatePassword(raw: unknown): Promise<ResetResult> {
  const parsed = newPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "sessionExpired" };

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    if (/should be different|same as the old/i.test(error.message)) {
      return { ok: false, error: "samePassword" };
    }
    if (/weak|password/i.test(error.message)) {
      return { ok: false, error: "passwordWeak" };
    }
    return { ok: false, error: "unknown" };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}
