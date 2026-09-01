import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { CustomerSignUpForm } from "@/components/account/customer-sign-up-form";
import { FadeIn } from "@/components/motion-primitives";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account.signUp" });
  return { title: t("heading"), robots: { index: false } };
}

export default async function CustomerRegisterPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "account.signUp" });

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(`/${locale}/account`);

  return (
    <div className="mx-auto max-w-md px-4 pt-6 pb-16 sm:px-6 sm:pt-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Laufleer
      </Link>

      <FadeIn as="header" className="mt-6 mb-8">
        <p className="eyebrow">{t("step")}</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">
          {t("heading")}
        </h1>
        <p className="mt-2 leading-relaxed text-muted-foreground">
          {t("subheading")}
        </p>
      </FadeIn>

      <FadeIn delay={0.06}>
        <CustomerSignUpForm />
      </FadeIn>
    </div>
  );
}
