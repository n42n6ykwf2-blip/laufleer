import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AccountNav } from "@/components/account/account-nav";
import {
  MyBookingsList,
  type BookingRow,
} from "@/components/account/my-bookings-list";
import { FadeIn } from "@/components/motion-primitives";
import { getCurrentCustomer } from "@/lib/customer";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account.bookings" });
  return { title: t("heading"), robots: { index: false } };
}

export default async function MyBookingsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "account.bookings" });

  const { supabase, user, customer } = await getCurrentCustomer();
  if (!user) redirect(`/${locale}/account/login`);
  if (!customer) redirect(`/${locale}/account/complete`);

  /**
   * RLS o'zi filtrlaydi: mijoz faqat o'z emailidagi bronlarni ko'radi
   * (0009 dagi "customer reads own reservations" siyosati).
   * Shuning uchun bu yerda qo'shimcha shart kerak emas.
   */
  const { data } = await supabase
    .from("reservations")
    .select("*, restaurants(name, slug), restaurant_tables(label, capacity)")
    .order("reservation_at", { ascending: false })
    .limit(100);

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6 pb-16 sm:px-6 sm:pt-10">
      <div className="mb-8">
        <AccountNav />
      </div>

      <FadeIn as="header" className="mb-7">
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("heading")}
        </h1>
      </FadeIn>

      <FadeIn delay={0.05}>
        <MyBookingsList bookings={(data ?? []) as BookingRow[]} />
      </FadeIn>
    </div>
  );
}
