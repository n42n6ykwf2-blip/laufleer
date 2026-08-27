import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { LanguageSwitcher } from "@/components/language-switcher";
import { CookieBanner } from "@/components/cookie-banner";
import "../globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "app" });
  return {
    title: t("name"),
    description: t("tagline"),
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
  const t = await getTranslations({ locale, namespace: "nav" });
  const app = await getTranslations({ locale, namespace: "app" });

  return (
    <html lang={locale} className={inter.variable}>
      <body className="min-h-screen font-sans antialiased flex flex-col">
        <NextIntlClientProvider>
          <header className="border-b border-border bg-card">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
              <Link
                href="/"
                className="font-semibold tracking-tight text-lg text-primary"
              >
                {app("name")}
              </Link>
              <LanguageSwitcher />
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border bg-card mt-16">
            <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <p>
                &copy; {new Date().getFullYear()} {app("name")}
              </p>
              <nav className="flex gap-4">
                <Link href="/impressum" className="hover:text-foreground">
                  {t("impressum")}
                </Link>
                <Link href="/datenschutz" className="hover:text-foreground">
                  {t("datenschutz")}
                </Link>
              </nav>
            </div>
          </footer>
          <CookieBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
