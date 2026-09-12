import { getTranslations } from "next-intl/server";
import { Gift, Ticket } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/format";
import { DEFAULT_LOYALTY_THRESHOLD } from "@/lib/loyalty";
import type { LoyaltyReward } from "@/lib/types";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export interface PointsRow {
  restaurant_id: string;
  points: number;
  restaurants?: {
    name: string;
    slug: string;
    loyalty_threshold: number | null;
    loyalty_discount_percent: number | null;
  } | null;
}

export async function MyPoints({
  balances,
  rewards,
  locale,
}: {
  balances: PointsRow[];
  rewards: LoyaltyReward[];
  locale: Locale;
}) {
  const t = await getTranslations("account.points");

  // Foydalanilmagan: hali bronga bog'lanmagan (active) yoki bog'langan (reserved)
  const usable = rewards.filter(
    (r) => r.status === "active" || r.status === "reserved"
  );
  const usedUp = rewards.filter(
    (r) => r.status !== "active" && r.status !== "reserved"
  );

  if (balances.length === 0 && rewards.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center">
        <Gift className="mx-auto size-6 text-muted-foreground" />
        <p className="mt-3 font-heading text-lg font-medium">{t("none")}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t("noneHint")}
        </p>
        <Button asChild className="mt-5 h-11">
          <Link href="/">{t("discover")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Ballar — har restoran uchun alohida */}
      {balances.length > 0 ? (
        <ul className="divide-y divide-border rounded-lg border border-border bg-card">
          {balances.map((b) => {
            const threshold =
              b.restaurants?.loyalty_threshold ?? DEFAULT_LOYALTY_THRESHOLD;
            const missing = Math.max(0, threshold - b.points);
            const pct = Math.min(100, Math.round((b.points / threshold) * 100));

            return (
              <li key={b.restaurant_id} className="px-4 py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  {b.restaurants ? (
                    <Link
                      href={`/r/${b.restaurants.slug}`}
                      className="font-heading text-base font-medium underline-offset-2 hover:text-primary hover:underline"
                    >
                      {b.restaurants.name}
                    </Link>
                  ) : (
                    <span className="font-heading text-base font-medium">—</span>
                  )}
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {t("progress", { points: b.points, threshold })}
                  </span>
                </div>

                {/* Progress — sodda va o'qiladigan */}
                <div
                  className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-valuenow={b.points}
                  aria-valuemin={0}
                  aria-valuemax={threshold}
                >
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {missing > 0 ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {t("almost", { missing })}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}

      {/* Chegirma kodlari */}
      {rewards.length > 0 ? (
        <section>
          <h2 className="eyebrow mb-3">{t("rewardsTitle")}</h2>

          <div className="space-y-3">
            {usable.map((r) => (
              <div
                key={r.id}
                className="rounded-lg border border-primary/30 bg-primary/6 p-5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                  <div className="flex items-center gap-2">
                    <Ticket className="size-4 text-primary" />
                    <span className="font-medium">
                      {t("rewardValue", { percent: r.discount_percent })}
                    </span>
                  </div>
                  <Badge className="rounded-full bg-primary/20 font-normal text-primary">
                    {r.status === "reserved"
                      ? t("status.reserved")
                      : t("status.active")}
                  </Badge>
                </div>

                {r.restaurants ? (
                  <Link
                    href={`/r/${r.restaurants.slug}`}
                    className="mt-1 inline-block text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                  >
                    {r.restaurants.name}
                  </Link>
                ) : null}

                <Separator className="my-4" />

                {/* Kod yo'q — chegirma bronda avtomatik qo'llanadi */}
                <p className="text-sm leading-relaxed">
                  {r.status === "reserved"
                    ? t("rewardReserved")
                    : t("rewardAuto")}
                </p>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {t("noExpiry")}
                </p>
              </div>
            ))}

            {usedUp.length > 0 ? (
              <ul className="divide-y divide-border rounded-lg border border-border bg-card">
                {usedUp.map((r) => (
                  <li
                    key={r.id}
                    className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <span className="text-sm text-muted-foreground">
                        {t("rewardValue", { percent: r.discount_percent })}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "text-xs text-muted-foreground",
                        r.status === "redeemed" && "text-primary"
                      )}
                    >
                      {r.status === "redeemed" && r.redeemed_at
                        ? t("redeemedOn", {
                            date: formatDate(r.redeemed_at, locale),
                          })
                        : t(`status.${r.status}` as "status.expired")}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
