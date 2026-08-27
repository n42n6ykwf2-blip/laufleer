"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signInSchema, signUpSchema } from "@/lib/validation/auth";

export type AuthResult =
  | { ok: true; needsEmailConfirmation?: boolean }
  | { ok: false; error: string; field?: string };

/** Supabase xato matnini tarjima kalitiga aylantiradi */
function mapAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "invalidCredentials";
  if (m.includes("email not confirmed")) return "emailNotConfirmed";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "emailTaken";
  if (m.includes("rate limit") || m.includes("too many"))
    return "tooManyAttempts";
  if (m.includes("password")) return "passwordWeak";
  return "unknown";
}

export async function signUp(raw: unknown): Promise<AuthResult> {
  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first.message, field: first.path.join(".") };
  }
  const { email, password, contactName } = parsed.data;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Faqat aloqa uchun ism — parol Supabase tomonidan hash qilinadi
      data: { contact_name: contactName },
    },
  });

  if (error) return { ok: false, error: mapAuthError(error.message) };

  // Email tasdiqlash yoqilgan bo'lsa, sessiya darhol berilmaydi
  const needsEmailConfirmation = !data.session;
  return { ok: true, needsEmailConfirmation };
}

export async function signIn(raw: unknown): Promise<AuthResult> {
  const parsed = signInSchema.safeParse(raw);
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

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
}
