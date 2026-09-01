import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CompleteProfileForm } from "@/components/account/complete-profile-form";
import { FadeIn } from "@/components/motion-primitives";
import { getCurrentCustomer } from "@/lib/customer";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account.complete" });
  return { title: t("heading"), robots: { index: false } };
}

export default async function CompleteProfilePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "account.complete" });

  const { user, customer } = await getCurrentCustomer();
  if (!user) redirect(`/${locale}/account/login`);

  // Profil allaqachon to'liq bo'lsa, kabinetga
  if (customer) redirect(`/${locale}/account`);

  /**
   * Mehmon sifatida yig'ilgan ball bormi — shuni oldindan tekshiramiz,
   * foydalanuvchiga "ballaringiz saqlanadi" deb aytish uchun.
   * loyalty_accounts ni bu bosqichda mijoz o'qiy olmaydi (hali bog'lanmagan),
   * shuning uchun service_role.
   */
  let hasExistingPoints = false;
  if (user.email) {
    const admin = createSupabaseAdminClient();
    const { data: account } = await admin
      .from("loyalty_accounts")
      .select("id")
      .ilike("email", user.email.trim().toLowerCase())
      .maybeSingle();

    if (account) {
      const { data: balances } = await admin
        .from("loyalty_balances")
        .select("points")
        .eq("account_id", account.id)
        .gt("points", 0)
        .limit(1);
      hasExistingPoints = Boolean(balances?.length);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 pt-10 pb-16 sm:px-6 sm:pt-14">
      <FadeIn as="header" className="mb-8">
        <p className="eyebrow">{t("step")}</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">
          {t("heading")}
        </h1>
        <p className="mt-2 leading-relaxed text-muted-foreground">
          {t("subheading")}
        </p>
      </FadeIn>

      <FadeIn delay={0.06}>
        <CompleteProfileForm
          defaultValues={{ firstName: "", lastName: "", phone: "" }}
          hasExistingPoints={hasExistingPoints}
        />
      </FadeIn>
    </div>
  );
}
