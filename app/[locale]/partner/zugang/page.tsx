import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Lock } from "lucide-react";
import { AccessGateForm } from "@/components/partner/access-gate-form";
import { isPartnerAreaLocked } from "@/lib/partner-gate";
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
  const t = await getTranslations({ locale, namespace: "partner.gate" });

  // Kod umuman sozlanmagan — kirish yo'li yo'q, forma ham ko'rsatilmaydi
  if (isPartnerAreaLocked()) {
    return (
      <div className="mx-auto max-w-sm px-4 pt-16 pb-16 sm:px-6 sm:pt-24">
        <div className="flex size-11 items-center justify-center rounded-full bg-muted">
          <Lock className="size-5 text-muted-foreground" />
        </div>
        <h1 className="mt-5 font-heading text-2xl font-semibold tracking-tight">
          {t("lockedTitle")}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t("lockedText")}
        </p>
      </div>
    );
  }

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
