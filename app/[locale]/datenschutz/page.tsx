import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";

export default async function DatenschutzPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "legal.datenschutz" });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-4">{t("heading")}</h1>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {t("placeholder")}
      </p>
    </div>
  );
}
