import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ForgotPasswordForm } from "@/components/account/forgot-password-form";
import { FadeIn } from "@/components/motion-primitives";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account.forgot" });
  return { title: t("heading"), robots: { index: false } };
}

/**
 * Parol tiklashni so'rash. Bitta oqim ikkala tomon uchun —
 * Supabase auth mijoz va restoran egasi uchun umumiy.
 * `from=partner` bo'lsa, orqaga hamkor kirish sahifasiga qaytadi.
 */
export default async function ForgotPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { locale } = await params;
  const { from } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "account.forgot" });

  const backTo = from === "partner" ? "/partner/login" : "/account/login";

  return (
    <div className="mx-auto max-w-md px-4 pt-6 pb-16 sm:px-6 sm:pt-10">
      <Link
        href={backTo}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {t("backToLogin")}
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
        <ForgotPasswordForm backTo={backTo} />
      </FadeIn>
    </div>
  );
}
