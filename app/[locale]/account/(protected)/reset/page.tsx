import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { NewPasswordForm } from "@/components/account/new-password-form";
import { FadeIn } from "@/components/motion-primitives";
import { getCurrentCustomer } from "@/lib/customer";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account.reset" });
  return { title: t("heading"), robots: { index: false } };
}

/**
 * Yangi parol o'rnatish. Bu sahifaga faqat tiklash havolasi bergan
 * sessiya bilan kirish mumkin — (protected) layout tekshiradi.
 */
export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "account.reset" });

  // Muvaffaqiyatdan keyin qayerga yuborishni aniqlaymiz
  const { customer } = await getCurrentCustomer();

  return (
    <div className="mx-auto max-w-md px-4 pt-10 pb-16 sm:px-6 sm:pt-14">
      <FadeIn as="header" className="mb-8">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {t("heading")}
        </h1>
        <p className="mt-2 leading-relaxed text-muted-foreground">
          {t("subheading")}
        </p>
      </FadeIn>

      <FadeIn delay={0.06}>
        <NewPasswordForm isCustomer={Boolean(customer)} />
      </FadeIn>
    </div>
  );
}
