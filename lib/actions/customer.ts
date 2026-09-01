"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentCustomer } from "@/lib/customer";
import {
  customerSignUpSchema,
  customerSignInSchema,
  customerProfileSchema,
} from "@/lib/validation/customer";

export type CustomerResult =
  | { ok: true; needsEmailConfirmation?: boolean }
  | { ok: false; error: string; field?: string };

/** Supabase xato matnini tarjima kalitiga aylantiradi */
function mapAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "invalidCredentials";
  if (m.includes("email not confirmed")) return "emailNotConfirmed";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "emailTaken";
  if (m.includes("rate limit") || m.includes("too many")) return "tooManyAttempts";
  if (m.includes("password")) return "passwordWeak";
  return "unknown";
}

/** Tasdiqlash havolasi qaytadigan manzil */
async function callbackUrl(): Promise<string> {
  const h = await headers();
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (h.get("origin") || `https://${h.get("host") ?? "localhost:3000"}`);
  return `${origin}/auth/callback?next=/account/complete`;
}

/** 1-bosqich — email va parol bilan hisob ochish */
export async function customerSignUp(raw: unknown): Promise<CustomerResult> {
  const parsed = customerSignUpSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first.message, field: first.path.join(".") };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: await callbackUrl(),
      // Bu foydalanuvchi mijoz ekanini belgilaydi (restoran egasi emas)
      data: { role: "customer" },
    },
  });

  if (error) return { ok: false, error: mapAuthError(error.message) };

  return { ok: true, needsEmailConfirmation: !data.session };
}

export async function customerSignIn(raw: unknown): Promise<CustomerResult> {
  const parsed = customerSignInSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first.message, field: first.path.join(".") };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) return { ok: false, error: mapAuthError(error.message) };

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function customerSignOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
}

/**
 * 3-bosqich — profilni to'ldirish.
 *
 * Shu yerda eng muhim qism: mijoz avval MEHMON sifatida kelib ball
 * yig'gan bo'lishi mumkin. `loyalty_accounts` email bo'yicha ochilgan,
 * shuning uchun o'sha hisobni topib bog'laymiz — ballar yo'qolmaydi.
 */
export async function completeCustomerProfile(
  raw: unknown
): Promise<CustomerResult> {
  const parsed = customerProfileSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first.message, field: first.path.join(".") };
  }
  const input = parsed.data;

  const { supabase, user, customer } = await getCurrentCustomer();
  if (!user?.email) return { ok: false, error: "notAuthenticated" };

  const phone = input.phone?.trim() || null;

  // Profil allaqachon bor -> faqat yangilaymiz.
  // Trigger email va loyalty_account_id ni o'zgartirishga yo'l qo'ymaydi.
  if (customer) {
    const { error } = await supabase
      .from("customers")
      .update({
        first_name: input.firstName,
        last_name: input.lastName,
        phone,
      })
      .eq("id", customer.id);
    if (error) return { ok: false, error: "unknown" };

    revalidatePath("/account", "layout");
    return { ok: true };
  }

  // Yangi profil — avval mavjud sodiqlik hisobini qidiramiz.
  // loyalty_accounts ga yozish siyosati yo'q, shuning uchun service_role.
  const admin = createSupabaseAdminClient();
  const email = user.email.trim().toLowerCase();

  const { data: existingLoyalty } = await admin
    .from("loyalty_accounts")
    .select("id")
    .ilike("email", email)
    .maybeSingle();

  let loyaltyAccountId = existingLoyalty?.id as string | undefined;

  if (loyaltyAccountId) {
    // Mehmon paytida ism bo'lmagan bo'lishi mumkin — to'ldirib qo'yamiz
    await admin
      .from("loyalty_accounts")
      .update({
        name: `${input.firstName} ${input.lastName}`,
        ...(phone ? { phone } : {}),
      })
      .eq("id", loyaltyAccountId);
  } else {
    const { data: created } = await admin
      .from("loyalty_accounts")
      .insert({
        email,
        name: `${input.firstName} ${input.lastName}`,
        phone,
      })
      .select("id")
      .single();
    loyaltyAccountId = created?.id;
  }

  const { error } = await supabase.from("customers").insert({
    user_id: user.id,
    first_name: input.firstName,
    last_name: input.lastName,
    email,
    phone,
    loyalty_account_id: loyaltyAccountId ?? null,
  });

  if (error) {
    return { ok: false, error: error.code === "23505" ? "emailTaken" : "unknown" };
  }

  revalidatePath("/account", "layout");
  return { ok: true };
}
