import type { Metadata, Viewport } from "next";
import { Fraunces, Geist } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CookieBanner } from "@/components/cookie-banner";
import "../globals.css";

// Sarlavhalar — o'zgaruvchan serif, optik o'lcham va "wonk" o'qi bilan
const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

// Matn — toza, zamonaviy sans
const geist = Geist({
  subsets: ["latin", "latin-ext"],
  variable: "--font-geist",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f2e9" },
    { media: "(prefers-color-scheme: dark)", color: "#221d19" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "app" });
  return {
    title: {
      default: `${t("name")} — ${t("tagline")}`,
      template: `%s — ${t("name")}`,
    },
    description: t("description"),
    // Loyiha ishga tushmaguncha qidiruv tizimlariga yopiq.
    // Ishga tushirishda bu blokni va app/robots.ts ni yangilash kerak.
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: { index: false, follow: false },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html lang={locale} className={`${fraunces.variable} ${geist.variable}`}>
      <body className="flex min-h-dvh flex-col antialiased">
        <NextIntlClientProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <CookieBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
