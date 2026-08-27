import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FadeIn } from "@/components/motion-primitives";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.impressum" });
  return { title: t("heading") };
}

export default async function ImpressumPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "legal.impressum" });

  return (
    <div className="mx-auto max-w-2xl px-4 pt-10 pb-16 sm:px-6 sm:pt-14">
      <FadeIn>
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("heading")}
        </h1>
        <p className="mt-5 leading-relaxed text-muted-foreground">
          {t("placeholder")}
        </p>
      </FadeIn>
    </div>
  );
}
