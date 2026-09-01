import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { BookingForm } from "@/components/booking-form";
import { DemoNotice } from "@/components/demo-notice";
import { FadeIn } from "@/components/motion-primitives";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentCustomer } from "@/lib/customer";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "bookingForm" });
  return { title: t("heading") };
}

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

  // Hisob MAJBURIY EMAS — kirgan bo'lsa maydonlarni oldindan to'ldiramiz,
  // kirmagan bo'lsa mehmon oqimi avvalgidek ishlaydi.
  const { customer } = await getCurrentCustomer();

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6 pb-16 sm:px-6 sm:pt-10">
      <Link
        href={`/r/${restaurant.slug}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {restaurant.name}
      </Link>

      <FadeIn as="header" className="mt-6 mb-9">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h1 className="mt-2 font-heading text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
          {t("heading")}
        </h1>
      </FadeIn>

      <FadeIn delay={0.04} className="mb-8">
        <DemoNotice variant="bookingWarning" />
      </FadeIn>

      <FadeIn delay={0.06}>
        <BookingForm
          restaurantId={restaurant.id}
          restaurantName={restaurant.name}
          restaurantSlug={restaurant.slug}
          guestDefaults={
            customer
              ? {
                  name: `${customer.first_name} ${customer.last_name}`,
                  email: customer.email,
                  phone: customer.phone ?? "",
                }
              : undefined
          }
        />
      </FadeIn>
    </div>
  );
}
