import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AccountNav } from "@/components/account/account-nav";
import { MyPoints, type PointsRow } from "@/components/account/my-points";
import { FadeIn } from "@/components/motion-primitives";
import { getCurrentCustomer } from "@/lib/customer";
import { DEFAULT_LOYALTY_THRESHOLD } from "@/lib/loyalty";
import type { LoyaltyReward } from "@/lib/types";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account.points" });
  return { title: t("heading"), robots: { index: false } };
}

export default async function MyPointsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "account.points" });

  const { supabase, user, customer } = await getCurrentCustomer();
  if (!user) redirect(`/${locale}/account/login`);
  if (!customer) redirect(`/${locale}/account/complete`);

  /**
   * RLS o'zi filtrlaydi — mijoz faqat o'z loyalty_account_id siga
   * tegishli balans va chegirmalarni ko'radi (0007 va 0011 siyosatlari).
   *
   * `!left`: restoran qatori o'qilmasa ham qator tushib ketmasin
   * (0009/0010 dagi saboq).
   */
  const [balancesRes, rewardsRes] = await Promise.all([
    supabase
      .from("loyalty_balances")
      .select(
        "restaurant_id, points, restaurants!left(name, slug, loyalty_threshold, loyalty_discount_percent)"
      )
      .order("points", { ascending: false }),
    supabase
      .from("loyalty_rewards")
      .select("*, restaurants!left(name, slug)")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  if (balancesRes.error) {
    console.error("[laufleer] balans so'rovi xato:", balancesRes.error);
  }
  if (rewardsRes.error) {
    console.error("[laufleer] chegirma so'rovi xato:", rewardsRes.error);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6 pb-16 sm:px-6 sm:pt-10">
      <div className="mb-8">
        <AccountNav />
      </div>

      <FadeIn as="header" className="mb-7">
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("heading")}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t("intro", { threshold: DEFAULT_LOYALTY_THRESHOLD })}
        </p>
      </FadeIn>

      <FadeIn delay={0.05}>
        {/* PostgREST embed turini massiv deb chiqaradi — o'zimiz aniqlaymiz */}
        <MyPoints
          balances={(balancesRes.data ?? []) as unknown as PointsRow[]}
          rewards={(rewardsRes.data ?? []) as unknown as LoyaltyReward[]}
          locale={locale}
        />
      </FadeIn>
    </div>
  );
}
