import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/format";
import type { Locale } from "@/i18n/routing";

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
    .select("id, name")
    .eq("slug", slug)
    .maybeSingle();

  if (!restaurant) notFound();

  const when = at ? formatDateTime(at, locale) : null;

  return (
    <div className="mx-auto max-w-xl px-4 py-14">
      <Card>
        <CardContent className="p-8 text-center space-y-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary text-2xl">
            ✓
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t("heading")}
            </h1>
            <p className="mt-1 text-muted-foreground">{t("subheading")}</p>
          </div>

          <dl className="grid grid-cols-2 gap-y-3 text-sm text-left border-t border-border pt-6">
            {code ? (
              <>
                <dt className="text-muted-foreground">{t("codeLabel")}</dt>
                <dd className="text-right font-mono font-semibold tracking-widest">
                  {code}
                </dd>
              </>
            ) : null}
            <dt className="text-muted-foreground">{t("restaurantLabel")}</dt>
            <dd className="text-right font-medium">{restaurant.name}</dd>
            {when ? (
              <>
                <dt className="text-muted-foreground">{t("whenLabel")}</dt>
                <dd className="text-right">{when}</dd>
              </>
            ) : null}
            {size ? (
              <>
                <dt className="text-muted-foreground">{t("partyLabel")}</dt>
                <dd className="text-right">{size}</dd>
              </>
            ) : null}
          </dl>

          <div>
            <Link href="/">
              <Button variant="outline">{t("backHome")}</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
