import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Faqat kirgan foydalanuvchi uchun.
 * Profil to'liqligini tekshirish sahifalarning o'zida — chunki
 * /account/complete aynan profilni to'ldirish uchun ochiq bo'lishi kerak.
 */
export default async function ProtectedAccountLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/account/login`);

  return <>{children}</>;
}
