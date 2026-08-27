import { getTranslations, setRequestLocale } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { RestaurantCard } from "@/components/restaurant-card";
import { RestaurantFilters } from "@/components/restaurant-filters";
import { DemoNotice } from "@/components/demo-notice";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion-primitives";
import { ALL_FEATURES, type Restaurant } from "@/lib/types";
import type { Locale } from "@/i18n/routing";

interface SearchParams {
  city?: string;
  cuisine?: string;
  price?: string;
  features?: string;
  q?: string;
}

export default async function HomePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "discover" });
  const tf = await getTranslations({ locale, namespace: "features" });

  const featureLabels = Object.fromEntries(
    ALL_FEATURES.map((f) => [f, tf(f)])
  ) as Record<string, string>;

  let restaurants: Restaurant[] = [];
  let allForFacets: Pick<Restaurant, "city" | "cuisine">[] = [];
  let loadError = false;

  try {
    const supabase = await createSupabaseServerClient();

    // Filtr ro'yxatlari uchun barcha shahar/oshxona qiymatlari
    const facetsPromise = supabase.from("restaurants").select("city, cuisine");

    /**
     * `advanced` — 0003 migratsiyasi qo'shadigan ustunlarga tayanadigan filtrlar.
     * Kod migratsiyadan oldin deploy bo'lishi mumkin, shuning uchun ular
     * ishlamasa, qolgan filtrlar bilan qayta urinib ko'ramiz.
     */
    const build = (advanced: boolean) => {
      let q = supabase.from("restaurants").select("*");
      if (sp.city) q = q.eq("city", sp.city);
      if (sp.cuisine) q = q.eq("cuisine", sp.cuisine);
      if (sp.q?.trim()) {
        const term = sp.q.trim().replace(/[%,()]/g, "");
        if (term) q = q.or(`name.ilike.%${term}%,city.ilike.%${term}%`);
      }
      if (advanced) {
        const lvl = Number(sp.price);
        if (sp.price && Number.isInteger(lvl) && lvl >= 1 && lvl <= 4) {
          q = q.eq("price_level", lvl);
        }
        const wanted = (sp.features ?? "").split(",").filter(Boolean);
        if (wanted.length) q = q.contains("features", wanted);
      }
      return q.order("name");
    };

    const [first, { data: facets }] = await Promise.all([
      build(true),
      facetsPromise,
    ]);

    let rows = first.data;
    if (first.error) {
      // 42703 = "column does not exist" — migratsiya hali ishga tushmagan
      if (first.error.code === "42703") {
        const retry = await build(false);
        if (retry.error) throw retry.error;
        rows = retry.data;
      } else {
        throw first.error;
      }
    }

    restaurants = (rows ?? []) as Restaurant[];
    allForFacets = (facets ?? []) as Pick<Restaurant, "city" | "cuisine">[];
  } catch {
    loadError = true;
  }

  const cities = [
    ...new Set(allForFacets.map((r) => r.city).filter(Boolean)),
  ].sort() as string[];
  const cuisines = [
    ...new Set(allForFacets.map((r) => r.cuisine).filter(Boolean)),
  ].sort() as string[];

  const resultLabel = t("resultCount", { count: restaurants.length });
  const hasFilters = Boolean(
    sp.city || sp.cuisine || sp.price || sp.features || sp.q?.trim()
  );

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 pb-4 sm:px-6 sm:pt-12">
      {/* Hero — editorial, chapga tekislangan */}
      <FadeIn as="header" className="max-w-2xl">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h1 className="mt-3 font-heading text-[2.125rem] leading-[1.08] font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.5rem]">
          {t("heading")}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {t("subheading")}
        </p>
      </FadeIn>

      <FadeIn delay={0.06} className="mt-7 max-w-2xl">
        <DemoNotice />
      </FadeIn>

      {/* Filtrlar */}
      <FadeIn delay={0.1} className="mt-9 sm:mt-11">
        <RestaurantFilters
          cities={cities}
          cuisines={cuisines}
          resultLabel={resultLabel}
        />
      </FadeIn>

      {/* Natijalar soni */}
      <div className="mt-8 flex items-baseline justify-between gap-4 border-t border-border/70 pt-5">
        <p className="text-sm font-medium tabular-nums">{resultLabel}</p>
      </div>

      {/* Ro'yxat */}
      {loadError ? (
        <p className="mt-10 text-sm text-destructive">{t("loadError")}</p>
      ) : restaurants.length === 0 ? (
        <div className="mt-16 mb-8 text-center">
          {hasFilters ? (
            <>
              <p className="font-heading text-xl font-medium">{t("empty")}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("emptyHint")}
              </p>
            </>
          ) : (
            // Platformada hali bironta tasdiqlangan restoran yo'q
            <div className="mx-auto max-w-md">
              <p className="font-heading text-xl font-medium">{t("noneYet")}</p>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                {t("noneYetHint")}
              </p>
              <Button asChild className="mt-6 h-11">
                <Link href="/partner">{t("noneYetCta")}</Link>
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Stagger className="mt-7 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((r, i) => (
            <StaggerItem key={r.id}>
              <RestaurantCard
                restaurant={r}
                locale={locale}
                featureLabels={featureLabels}
                priority={i < 3}
              />
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}
