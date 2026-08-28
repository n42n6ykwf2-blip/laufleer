import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Tizimga kirgan foydalanuvchining restoranini qaytaradi.
 * RLS baribir himoya qiladi — bu shunchaki qulaylik va aniq xato uchun.
 */
export async function getOwnedRestaurant() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, restaurant: null };

  const { data } = await supabase
    .from("restaurants")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();

  return { supabase, user, restaurant: data };
}
