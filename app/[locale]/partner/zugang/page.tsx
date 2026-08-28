import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { AccessGateForm } from "@/components/partner/access-gate-form";
import type { Locale } from "@/i18n/routing";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function PartnerGatePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const { locale } = await params;
  const { next } = await searchParams;
  setRequestLocale(locale);

  // Faqat ichki yo'lga ruxsat — ochiq yo'naltirishning oldini olamiz
  const safeNext =
    next && next.startsWith("/") && !next.startsWith("//")
      ? next
      : `/${locale}/partner`;

  return (
    <div className="mx-auto max-w-sm px-4 pt-16 pb-16 sm:px-6 sm:pt-24">
      <AccessGateForm next={safeNext} />
    </div>
  );
}
