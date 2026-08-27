import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion-primitives";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "partner.landing" });
  return { title: t("heading"), description: t("subheading") };
}

export default async function PartnerLandingPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "partner.landing" });

  // Allaqachon kirgan bo'lsa, to'g'ridan-to'g'ri profilga
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(`/${locale}/partner/profile`);

  const steps = [
    { title: t("step1Title"), text: t("step1Text") },
    { title: t("step2Title"), text: t("step2Text") },
    { title: t("step3Title"), text: t("step3Text") },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 pt-10 pb-16 sm:px-6 sm:pt-16">
      <FadeIn as="header" className="max-w-2xl">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h1 className="mt-3 font-heading text-[2.125rem] leading-[1.08] font-semibold tracking-tight text-balance sm:text-5xl">
          {t("heading")}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {t("subheading")}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-12 text-base sm:h-11">
            <Link href="/partner/register">{t("signUp")}</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 text-base sm:h-11"
          >
            <Link href="/partner/login">{t("signIn")}</Link>
          </Button>
        </div>
      </FadeIn>

      <Stagger className="mt-16 grid gap-8 sm:grid-cols-3 sm:gap-6">
        {steps.map((step, i) => (
          <StaggerItem key={step.title}>
            <div className="border-t border-border pt-4">
              <span className="font-heading text-2xl font-semibold text-primary tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="mt-2 font-heading text-lg font-medium">
                {step.title}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {step.text}
              </p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
