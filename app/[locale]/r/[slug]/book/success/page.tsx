import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Check } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FadeIn } from "@/components/motion-primitives";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/format";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "success" });
  return { title: t("heading"), robots: { index: false } };
}

export default async function BookingSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
  searchParams: Promise<{ code?: string; at?: string; size?: string }>;
}) {
  const { locale, slug } = await params;
  const { code, at, size } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "success" });

  const supabase = await createSupabaseServerClient();
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("name, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (!restaurant) notFound();

  const when = at ? formatDateTime(at, locale) : null;

  const rows = [
    { label: t("restaurantLabel"), value: restaurant.name },
    when ? { label: t("whenLabel"), value: when } : null,
    size ? { label: t("partyLabel"), value: size } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="mx-auto max-w-lg px-4 pt-12 pb-20 sm:px-6 sm:pt-16">
      <FadeIn>
        <div className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-5" strokeWidth={2.5} />
        </div>

        <p className="eyebrow mt-6">{t("eyebrow")}</p>
        <h1 className="mt-2 font-heading text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
          {t("heading")}
        </h1>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          {t("subheading")}
        </p>
      </FadeIn>

      {/* Rezervatsiya kodi — sahifadagi eng muhim ma'lumot */}
      {code ? (
        <FadeIn delay={0.1} className="mt-9">
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="eyebrow">{t("codeLabel")}</p>
            <p className="mt-2 font-mono text-3xl font-semibold tracking-[0.18em] tabular-nums">
              {code}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {t("codeHint")}
            </p>
          </div>
        </FadeIn>
      ) : null}

      <FadeIn delay={0.16} className="mt-8">
        <dl className="space-y-3.5 text-sm">
          {rows.map((row, i) => (
            <div key={row.label}>
              {i > 0 ? <Separator className="mb-3.5" /> : null}
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-muted-foreground">{row.label}</dt>
                <dd className="text-right font-medium">{row.value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </FadeIn>

      <FadeIn delay={0.22} className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Button asChild variant="outline" className="h-11 flex-1">
          <Link href={`/r/${restaurant.slug}`}>{t("viewRestaurant")}</Link>
        </Button>
        <Button asChild className="h-11 flex-1">
          <Link href="/">{t("backHome")}</Link>
        </Button>
      </FadeIn>
    </div>
  );
}
