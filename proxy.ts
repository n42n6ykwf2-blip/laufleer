import createIntlMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const handleI18n = createIntlMiddleware(routing);

/**
 * Ikki vazifa bir joyda:
 *  1. next-intl — tilni aniqlab, /de yoki /en ga yo'naltiradi
 *  2. Supabase — auth sessiyasini yangilab, cookie'ni javobga yozadi
 *
 * Tartib muhim: avval i18n javobini olamiz, keyin Supabase cookie'larni
 * o'sha javobga yozadi — aks holda yangilangan sessiya yo'qoladi.
 */
export default async function proxy(request: NextRequest) {
  const response = handleI18n(request);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return response;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Sessiyani yangilaydi (kerak bo'lsa tokenni almashtiradi)
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
