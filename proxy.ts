import createIntlMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import {
  PARTNER_COOKIE,
  isPartnerCookieValid,
  isPartnerGateEnabled,
} from "./lib/partner-gate";

const handleI18n = createIntlMiddleware(routing);

/** /de/partner/... yoki /en/partner/... (kirish sahifasining o'zidan tashqari) */
function needsPartnerGate(pathname: string): boolean {
  if (!isPartnerGateEnabled()) return false;
  const m = pathname.match(/^\/(de|en)\/partner(\/.*)?$/);
  if (!m) return false;
  const rest = m[2] ?? "";
  return !rest.startsWith("/zugang");
}

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

  // Hamkor bo'limi kod bilan yopiq (faqat production'da)
  const pathname = response.headers.get("x-middleware-rewrite")
    ? request.nextUrl.pathname
    : request.nextUrl.pathname;
  if (needsPartnerGate(pathname)) {
    const cookie = request.cookies.get(PARTNER_COOKIE)?.value;
    if (!isPartnerCookieValid(cookie)) {
      const locale = pathname.split("/")[1] || routing.defaultLocale;
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/partner/zugang`;
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

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
