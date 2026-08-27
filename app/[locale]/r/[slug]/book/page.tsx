import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BookingForm } from "@/components/booking-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Locale } from "@/i18n/routing";

export default async function BookPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "bookingForm" });

  const supabase = await createSupabaseServerClient();
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (!restaurant) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{t("heading")}</h1>
      </header>
      <BookingForm
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
        restaurantSlug={restaurant.slug}
      />
    </div>
  );
}
