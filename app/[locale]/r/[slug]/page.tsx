import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MenuSection } from "@/components/menu-section";
import { OpeningHoursList } from "@/components/opening-hours";
import {
  RatingSummary,
  RestaurantReviews,
  type PublicReview,
  type RatingStats,
} from "@/components/restaurant-reviews";
import { FadeIn, InView } from "@/components/motion-primitives";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { localizedText, priceLevelSymbol } from "@/lib/format";
import type { MenuCategory, MenuItem, Restaurant } from "@/lib/types";
import type { Locale } from "@/i18n/routing";

async function getRestaurant(slug: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return data as Restaurant | null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const r = await getRestaurant(slug);
  if (!r) return {};
  return {
    title: r.name,
    description: localizedText(r.description, locale).slice(0, 160),
  };
}

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "restaurantPage" });
  const tf = await getTranslations({ locale, namespace: "features" });

  const r = await getRestaurant(slug);
  if (!r) notFound();

  const supabase = await createSupabaseServerClient();
  const [{ data: categories }, { data: items }, ratingRes, reviewsRes] =
    await Promise.all([
      supabase.from("menu_categories").select("*").eq("restaurant_id", r.id),
      supabase.from("menu_items").select("*").eq("restaurant_id", r.id),
      // Jadval emas, identifikatsiyasiz funksiyalar (0012) — muallif ochilmaydi
      supabase.rpc("get_restaurant_rating", { p_restaurant_id: r.id }),
      supabase.rpc("get_restaurant_reviews", {
        p_restaurant_id: r.id,
        p_limit: 10,
      }),
    ]);

  if (ratingRes.error) {
    console.error("[laufleer] reyting so'rovi xato:", ratingRes.error);
  }
  if (reviewsRes.error) {
    console.error("[laufleer] sharhlar so'rovi xato:", reviewsRes.error);
  }
  const ratingStats = ((ratingRes.data as RatingStats[] | null)?.[0] ??
    null) as RatingStats | null;
  const publicReviews = (reviewsRes.data ?? []) as PublicReview[];

  const description = localizedText(r.description, locale);
  const price = priceLevelSymbol(r.price_level);
  const line1 = [r.street, r.house_number].filter(Boolean).join(" ");
  const line2 = [r.postal_code, r.city].filter(Boolean).join(" ");
  const place = [r.neighborhood, r.city].filter(Boolean).join(", ");

  return (
    <article className="pb-24 lg:pb-8">
      {/* Qopqoq rasm — mobilda to'liq kenglikda */}
      <div className="relative aspect-[4/3] w-full bg-muted sm:aspect-[21/9]">
        {r.cover_image_url ? (
          <Image
            src={r.cover_image_url}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : null}
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Orqaga qaytish */}
        <div className="pt-5">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            {t("backToList")}
          </Link>
        </div>

        {/* Sarlavha */}
        <FadeIn as="header" className="mt-5">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="eyebrow">{r.cuisine}</span>
            {price ? (
              <span className="text-xs font-medium text-muted-foreground">
                {price}
              </span>
            ) : null}
          </div>

          <h1 className="mt-2 font-heading text-[2rem] leading-[1.1] font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            {r.name}
          </h1>

          {place ? (
            <p className="mt-2 text-muted-foreground">{place}</p>
          ) : null}

          <RatingSummary stats={ratingStats} locale={locale} />

          {description ? (
            <p className="mt-5 max-w-2xl leading-relaxed text-foreground/85">
              {description}
            </p>
          ) : null}

          {/* Desktop CTA — mobilda pastdagi yopishqoq panel ishlatiladi */}
          <div className="mt-7 hidden lg:block">
            <Button asChild size="lg" className="h-11 px-6">
              <Link href={`/r/${r.slug}/book`}>{t("reserve")}</Link>
            </Button>
          </div>
        </FadeIn>

        <Separator className="my-9" />

        {/* Menyu + yon panel */}
        <div className="grid gap-12 lg:grid-cols-[1fr_18rem] lg:gap-16">
          <InView>
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              {t("menu")}
            </h2>
            <div className="mt-7">
              <MenuSection
                categories={(categories ?? []) as MenuCategory[]}
                items={(items ?? []) as MenuItem[]}
                locale={locale}
              />
            </div>
          </InView>

          <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
            <section>
              <h4 className="eyebrow">{t("address")}</h4>
              <address className="mt-2.5 text-sm leading-relaxed not-italic">
                {line1 ? <div>{line1}</div> : null}
                {line2 ? <div>{line2}</div> : null}
              </address>
            </section>

            {r.phone ? (
              <section>
                <h4 className="eyebrow">{t("phone")}</h4>
                <a
                  href={`tel:${r.phone}`}
                  className="mt-2.5 inline-flex items-center gap-2 text-sm transition-colors hover:text-primary"
                >
                  <Phone className="size-3.5" />
                  {r.phone}
                </a>
              </section>
            ) : null}

            <section>
              <h4 className="eyebrow">{t("openingHours")}</h4>
              <div className="mt-2.5">
                <OpeningHoursList hours={r.opening_hours ?? {}} />
              </div>
            </section>

            {r.features?.length ? (
              <section>
                <h4 className="eyebrow">{t("features")}</h4>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {r.features.map((f) => (
                    <Badge
                      key={f}
                      variant="secondary"
                      className="rounded-full font-normal"
                    >
                      {tf(f)}
                    </Badge>
                  ))}
                </div>
              </section>
            ) : null}
          </aside>
        </div>

        <Separator className="my-12" />

        <InView>
          <RestaurantReviews
            stats={ratingStats}
            reviews={publicReviews}
            locale={locale}
          />
        </InView>
      </div>

      {/* Mobil: pastda yopishib turadigan band qilish paneli */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-[2px] lg:hidden">
        <Button asChild size="lg" className="h-12 w-full text-base">
          <Link href={`/r/${r.slug}/book`}>{t("reserve")}</Link>
        </Button>
      </div>
    </article>
  );
}
