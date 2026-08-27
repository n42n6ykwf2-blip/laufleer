import { getTranslations, setRequestLocale } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { RestaurantCard } from "@/components/restaurant-card";
import type { Restaurant } from "@/lib/types";
import type { Locale } from "@/i18n/routing";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "discover" });
  const cta = await getTranslations({ locale, namespace: "restaurantCard" });

  let restaurants: Restaurant[] = [];
  let dbError: string | null = null;
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    restaurants = (data ?? []) as Restaurant[];
  } catch (err) {
    dbError =
      err instanceof Error
        ? err.message
        : typeof err === "object" && err !== null
          ? JSON.stringify(err)
          : String(err);
    console.error("[laufleer] restaurants query failed:", err);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t("heading")}</h1>
        <p className="mt-2 text-muted-foreground">{t("subheading")}</p>
      </header>

      {dbError ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          <p className="font-medium">Supabase</p>
          <p className="mt-1 opacity-80">{dbError}</p>
        </div>
      ) : restaurants.length === 0 ? (
        <p className="text-muted-foreground">{t("empty")}</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((r) => (
            <RestaurantCard
              key={r.id}
              restaurant={r}
              locale={locale}
              ctaLabel={cta("viewMenu")}
            />
          ))}
        </div>
      )}
    </div>
  );
}
