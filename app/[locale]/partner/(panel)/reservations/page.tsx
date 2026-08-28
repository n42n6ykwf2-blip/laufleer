import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ReservationList } from "@/components/partner/reservation-list";
import { FadeIn } from "@/components/motion-primitives";
import { getOwnedRestaurant } from "@/lib/owner";
import type { Reservation } from "@/lib/types";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "partner.reservations" });
  return { title: t("heading"), robots: { index: false } };
}

export default async function ReservationsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "partner.reservations" });
  const tp = await getTranslations({ locale, namespace: "partner.panel" });

  const { supabase, restaurant } = await getOwnedRestaurant();

  if (!restaurant) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">
          {tp("needsProfileFirst")}
        </p>
        <Button asChild className="mt-4 h-11">
          <Link href="/partner/profile">{tp("toProfile")}</Link>
        </Button>
      </div>
    );
  }

  const { data } = await supabase
    .from("reservations")
    .select("*, restaurant_tables(label, capacity)")
    .eq("restaurant_id", restaurant.id)
    .order("reservation_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <FadeIn as="header" className="mb-7">
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("heading")}
        </h1>
      </FadeIn>

      <FadeIn delay={0.05}>
        <ReservationList
          reservations={(data ?? []) as Reservation[]}
          loyaltyEnabled={Boolean(restaurant.loyalty_enabled)}
        />
      </FadeIn>
    </div>
  );
}
