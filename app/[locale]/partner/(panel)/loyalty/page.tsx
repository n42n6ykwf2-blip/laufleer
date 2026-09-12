import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoyaltySettings } from "@/components/partner/loyalty-settings";
import { RedeemRewardForm } from "@/components/partner/redeem-reward-form";
import { FadeIn } from "@/components/motion-primitives";
import { getOwnedRestaurant } from "@/lib/owner";
import { formatDate } from "@/lib/format";
import {
  DEFAULT_LOYALTY_THRESHOLD,
  DEFAULT_DISCOUNT_PERCENT,
} from "@/lib/loyalty";
import type { LoyaltyBalance, LoyaltyReward } from "@/lib/types";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "partner.loyalty" });
  return { title: t("heading"), robots: { index: false } };
}

export default async function LoyaltyPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "partner.loyalty" });
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

  const [membersRes, rewardsRes] = await Promise.all([
    supabase
      .from("loyalty_balances")
      .select("*, loyalty_accounts(email, name)")
      .eq("restaurant_id", restaurant.id)
      .order("points", { ascending: false })
      .limit(200),
    supabase
      .from("loyalty_rewards")
      .select("*, loyalty_accounts!left(email, name)")
      .eq("restaurant_id", restaurant.id)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  if (membersRes.error) {
    console.error("[laufleer] a'zolar so'rovi xato:", membersRes.error);
  }
  if (rewardsRes.error) {
    console.error("[laufleer] chegirmalar so'rovi xato:", rewardsRes.error);
  }

  const members = (membersRes.data ?? []) as LoyaltyBalance[];
  const rewards = (rewardsRes.data ?? []) as LoyaltyReward[];

  return (
    <div>
      <FadeIn as="header" className="mb-7">
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("heading")}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t("intro")}
        </p>
      </FadeIn>

      <FadeIn delay={0.05} className="mb-7">
        <LoyaltySettings
          enabled={Boolean(restaurant.loyalty_enabled)}
          pointsPerVisit={restaurant.loyalty_points_per_visit ?? 1}
          threshold={restaurant.loyalty_threshold ?? DEFAULT_LOYALTY_THRESHOLD}
          discountPercent={
            restaurant.loyalty_discount_percent ?? DEFAULT_DISCOUNT_PERCENT
          }
        />
      </FadeIn>

      {/* Kodni tasdiqlash */}
      <FadeIn delay={0.08} className="mb-9">
        <RedeemRewardForm />
      </FadeIn>

      {/* Berilgan chegirmalar */}
      <FadeIn delay={0.11} className="mb-9">
        <h2 className="eyebrow mb-3">{t("rewardsTitle")}</h2>
        {rewards.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            {t("noRewards")}
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border bg-card">
            {rewards.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3"
              >
                <div className="min-w-0">
                  <span className="font-mono text-sm tracking-widest">
                    {r.code}
                  </span>
                  <span className="ml-2.5 text-sm text-muted-foreground">
                    {r.discount_percent}%
                  </span>
                  {r.loyalty_accounts ? (
                    <p className="truncate text-xs text-muted-foreground">
                      {r.loyalty_accounts.name || r.loyalty_accounts.email}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2.5">
                  {r.status === "redeemed" && r.redeemed_at ? (
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {formatDate(r.redeemed_at, locale)}
                    </span>
                  ) : null}
                  <Badge
                    variant="secondary"
                    className="rounded-full font-normal"
                  >
                    {r.status === "active"
                      ? t("rewardActive")
                      : t("rewardRedeemed")}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </FadeIn>

      {/* A'zolar */}
      <FadeIn delay={0.14}>
        <h2 className="eyebrow mb-3">{t("members")}</h2>
        {members.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            {t("noMembers")}
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border bg-card">
            {members.map((m) => (
              <li
                key={m.account_id}
                className="flex items-baseline justify-between gap-4 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {m.loyalty_accounts?.name || m.loyalty_accounts?.email}
                  </p>
                  {m.loyalty_accounts?.name ? (
                    <p className="truncate text-sm text-muted-foreground">
                      {m.loyalty_accounts.email}
                    </p>
                  ) : null}
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {t("lastVisit")} {formatDate(m.updated_at, locale)}
                  </p>
                </div>
                <span className="shrink-0 font-heading text-lg font-semibold text-primary tabular-nums">
                  {m.points}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    {t("points")}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </FadeIn>
    </div>
  );
}
