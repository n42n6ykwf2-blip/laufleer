import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProfileForm } from "@/components/partner/profile-form";
import { StatusCard } from "@/components/partner/status-card";
import { SignOutButton } from "@/components/partner/sign-out-button";
import { FadeIn } from "@/components/motion-primitives";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { WEEKDAYS, type RestaurantProfileInput } from "@/lib/validation/restaurant";
import type { OpeningHours, Restaurant, RestaurantFeature } from "@/lib/types";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "partner.profile" });
  return { title: t("heading"), robots: { index: false } };
}

/** Bazadagi jsonb ish vaqtini forma ko'rinishiga o'giradi */
function toFormHours(hours: OpeningHours | null) {
  const out = {} as RestaurantProfileInput["openingHours"];
  for (const day of WEEKDAYS) {
    const slots = hours?.[day];
    const slot = slots?.[0];
    out[day] = slot
      ? { closed: false, open: slot.open, close: slot.close }
      : { closed: !slots || slots.length === 0, open: "11:30", close: "22:00" };
  }
  return out;
}

export default async function PartnerProfilePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "partner.profile" });

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/partner/login`);

  const { data } = await supabase
    .from("restaurants")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();
  const restaurant = data as Restaurant & {
    status: "draft" | "pending" | "approved" | "rejected";
    rejection_reason: string | null;
  } | null;

  const defaultValues: RestaurantProfileInput = {
    name: restaurant?.name ?? "",
    cuisine: restaurant?.cuisine ?? "",
    descriptionDe: restaurant?.description?.de ?? "",
    descriptionEn: restaurant?.description?.en ?? "",
    street: restaurant?.street ?? "",
    houseNumber: restaurant?.house_number ?? "",
    postalCode: restaurant?.postal_code ?? "",
    city: restaurant?.city ?? "",
    neighborhood: restaurant?.neighborhood ?? "",
    phone: restaurant?.phone ?? "",
    priceLevel: restaurant?.price_level ?? 2,
    features: (restaurant?.features ?? []) as RestaurantFeature[],
    coverImageUrl: restaurant?.cover_image_url ?? "",
    openingHours: toFormHours(restaurant?.opening_hours ?? null),
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pt-8 pb-16 sm:px-6 sm:pt-12">
      <FadeIn as="header" className="mb-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("heading")}
          </h1>
          <SignOutButton />
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {t("signedInAs")} {user.email}
        </p>
      </FadeIn>

      <FadeIn delay={0.05} className="mb-9">
        <StatusCard
          status={restaurant?.status ?? "draft"}
          slug={restaurant?.slug ?? null}
          rejectionReason={restaurant?.rejection_reason ?? null}
          hasProfile={Boolean(restaurant)}
        />
      </FadeIn>

      <FadeIn delay={0.1}>
        <ProfileForm defaultValues={defaultValues} />
      </FadeIn>
    </div>
  );
}
