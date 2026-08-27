import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { MenuSection } from "@/components/menu-section";
import { OpeningHoursList } from "@/components/opening-hours";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { localizedText } from "@/lib/format";
import type { MenuCategory, MenuItem, Restaurant } from "@/lib/types";
import type { Locale } from "@/i18n/routing";

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "restaurantPage" });

  const supabase = await createSupabaseServerClient();
  const { data: restaurant, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !restaurant) {
    notFound();
  }

  const r = restaurant as Restaurant;

  const [{ data: categories }, { data: items }] = await Promise.all([
    supabase.from("menu_categories").select("*").eq("restaurant_id", r.id),
    supabase.from("menu_items").select("*").eq("restaurant_id", r.id),
  ]);

  const description = localizedText(r.description, locale);
  const addressLine1 = [r.street, r.house_number].filter(Boolean).join(" ");
  const addressLine2 = [r.postal_code, r.city].filter(Boolean).join(" ");

  return (
    <article className="mx-auto max-w-5xl px-4 py-8">
      <div className="relative aspect-[21/9] rounded-lg overflow-hidden bg-muted mb-6">
        {r.cover_image_url ? (
          <Image
            src={r.cover_image_url}
            alt={r.name}
            fill
            priority
            sizes="(min-width: 1024px) 1024px, 100vw"
            className="object-cover"
          />
        ) : null}
      </div>

      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{r.name}</h1>
          {r.cuisine ? (
            <p className="text-muted-foreground mt-1">{r.cuisine}</p>
          ) : null}
          {description ? (
            <p className="mt-4 max-w-2xl text-sm text-foreground/80 leading-relaxed">
              {description}
            </p>
          ) : null}
        </div>
        <Link href={`/r/${r.slug}/book`}>
          <Button size="lg">{t("reserve")}</Button>
        </Link>
      </header>

      <div className="grid gap-8 md:grid-cols-[1fr_260px]">
        <div>
          <h2 className="text-2xl font-semibold mb-6">{t("menu")}</h2>
          <MenuSection
            categories={(categories ?? []) as MenuCategory[]}
            items={(items ?? []) as MenuItem[]}
            locale={locale}
          />
        </div>

        <aside className="space-y-6 md:sticky md:top-4 md:self-start">
          <section>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              {t("address")}
            </h4>
            <address className="not-italic text-sm">
              {addressLine1 ? <div>{addressLine1}</div> : null}
              {addressLine2 ? <div>{addressLine2}</div> : null}
            </address>
          </section>
          {r.phone ? (
            <section>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                {t("phone")}
              </h4>
              <a href={`tel:${r.phone}`} className="text-sm hover:underline">
                {r.phone}
              </a>
            </section>
          ) : null}
          <section>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              {t("openingHours")}
            </h4>
            <OpeningHoursList hours={r.opening_hours ?? {}} />
          </section>
        </aside>
      </div>
    </article>
  );
}
