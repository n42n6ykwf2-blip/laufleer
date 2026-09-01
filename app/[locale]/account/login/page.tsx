import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { CustomerSignInForm } from "@/components/account/customer-sign-in-form";
import { FadeIn } from "@/components/motion-primitives";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account.signIn2" });
  return { title: t("heading"), robots: { index: false } };
}

export default async function CustomerLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale } = await params;
  const { error } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "account.signIn2" });

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
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {t("heading")}
        </h1>
        <p className="mt-2 leading-relaxed text-muted-foreground">
          {t("subheading")}
        </p>
      </FadeIn>

      <FadeIn delay={0.06}>
        <CustomerSignInForm confirmFailed={error === "confirm"} />
      </FadeIn>
    </div>
  );
}
