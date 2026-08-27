import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AlertTriangle } from "lucide-react";
import { FadeIn } from "@/components/motion-primitives";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.datenschutz" });
  return { title: t("heading") };
}

export default async function DatenschutzPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "legal.datenschutz" });

  return (
    <div className="mx-auto max-w-2xl px-4 pt-10 pb-16 sm:px-6 sm:pt-14">
      <FadeIn>
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("heading")}
        </h1>

        <p className="mt-5 leading-relaxed text-muted-foreground">
          {t("placeholder")}
        </p>

        {/* Eng muhim jumla — alohida ajratilgan */}
        <div className="mt-6 flex gap-2.5 rounded-lg border border-primary/25 bg-primary/6 p-4">
          <AlertTriangle
            className="mt-0.5 size-4 shrink-0 text-primary"
            aria-hidden
          />
          <p className="text-sm font-medium leading-relaxed">{t("warning")}</p>
        </div>

        <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
          {t("later")}
        </p>
      </FadeIn>
    </div>
  );
}
