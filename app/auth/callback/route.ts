import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { routing } from "@/i18n/routing";

/**
 * Email tasdiqlash havolasi shu yerga tushadi.
 *
 * Supabase `?code=` beradi, uni sessiyaga almashtiramiz va
 * foydalanuvchini `next` sahifasiga yuboramiz.
 *
 * Bu marshrut locale'siz (`/auth/callback`) — shuning uchun proxy
 * matcher'idan tashqarida qolmasligi uchun locale prefiksi qo'lda
 * qo'shiladi.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/account/complete";

  // Faqat ichki yo'l — ochiq yo'naltirishning oldini olamiz
  const next =
    rawNext.startsWith("/") && !rawNext.startsWith("//")
      ? rawNext
      : "/account/complete";

  const locale = routing.defaultLocale;
  const failUrl = `${origin}/${locale}/account/login?error=confirm`;

  if (!code) return NextResponse.redirect(failUrl);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return NextResponse.redirect(failUrl);

  const response = NextResponse.redirect(`${origin}/${locale}${next}`);

  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(failUrl);

  return response;
}
