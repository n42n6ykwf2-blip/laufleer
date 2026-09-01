import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Customer } from "@/lib/types";

/**
 * Tizimga kirgan mijozni qaytaradi.
 *
 * `user` bor, `customer` yo'q  -> email tasdiqlangan, lekin profil
 *                                 to'ldirilmagan (3-bosqich qolgan)
 * ikkalasi ham yo'q            -> kirmagan
 *
 * RLS baribir himoya qiladi — bu yordamchi faqat qulaylik uchun.
 */
export async function getCurrentCustomer() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, user: null, customer: null };

  const { data } = await supabase
    .from("customers")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return { supabase, user, customer: (data as Customer | null) ?? null };
}
