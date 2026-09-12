import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CalendarDays, Mail, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AccountNav } from "@/components/account/account-nav";
import { FadeIn } from "@/components/motion-primitives";
import { getCurrentCustomer } from "@/lib/customer";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account.dashboard" });
  return { title: t("heading"), robots: { index: false } };
}

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "account.dashboard" });
  const tp = await getTranslations({ locale, namespace: "account.panel" });

  const { user, customer } = await getCurrentCustomer();
  if (!user) redirect(`/${locale}/account/login`);

  // Profil hali to'ldirilmagan — 3-bosqichga
  if (!customer) redirect(`/${locale}/account/complete`);

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6 pb-16 sm:px-6 sm:pt-10">
      <div className="mb-8">
        <AccountNav />
      </div>

      <FadeIn as="header" className="mb-8">
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("heading")}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {t("greeting", { name: customer.first_name })}
        </p>
      </FadeIn>

      <FadeIn delay={0.05}>
        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="eyebrow">{t("profile")}</h2>

          <p className="mt-3 font-heading text-xl font-medium">
            {customer.first_name} {customer.last_name}
          </p>

          <Separator className="my-4" />

          <dl className="space-y-3 text-sm">
            <div className="flex items-center gap-2.5">
              <Mail className="size-4 shrink-0 text-muted-foreground" />
              <dt className="sr-only">{t("email")}</dt>
              <dd className="min-w-0 truncate">{customer.email}</dd>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="size-4 shrink-0 text-muted-foreground" />
              <dt className="sr-only">{t("phone")}</dt>
              <dd className={customer.phone ? "" : "text-muted-foreground"}>
                {customer.phone || t("phoneEmpty")}
              </dd>
            </div>
          </dl>
        </section>
      </FadeIn>

      <FadeIn delay={0.1} className="mt-6">
        <Button asChild variant="outline" className="h-11 w-full sm:w-auto">
          <Link href="/account/bookings">
            <CalendarDays className="size-4" />
            {tp("bookings")}
          </Link>
        </Button>
      </FadeIn>
    </div>
  );
}
