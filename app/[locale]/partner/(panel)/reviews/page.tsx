import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/star-rating";
import { FadeIn } from "@/components/motion-primitives";
import { getOwnedRestaurant } from "@/lib/owner";
import { formatDate } from "@/lib/format";
import type { Locale } from "@/i18n/routing";

interface OwnerReview {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reservations: { reservation_at: string } | { reservation_at: string }[] | null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "partner.reviews" });
  return { title: t("heading"), robots: { index: false } };
}

export default async function PartnerReviewsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "partner.reviews" });
  const tp = await getTranslations({ locale, namespace: "partner.panel" });

  const { supabase, restaurant } = await getOwnedRestaurant();

  if (!restaurant) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">{tp("needsProfileFirst")}</p>
        <Button asChild className="mt-4 h-11">
          <Link href="/partner/profile">{tp("toProfile")}</Link>
        </Button>
      </div>
    );
  }

  /**
   * Mehmon ismi ATAYIN so'ralmaydi — faqat tashrif sanasi.
   * Restoran salbiy sharh yozgan mehmonga bosim o'tkaza olmasin.
   */
  const { data, error } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at, reservations!left(reservation_at)")
    .eq("restaurant_id", restaurant.id)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("[laufleer] sharhlar so'rovi xato:", error);
  }

  const reviews = (data ?? []) as unknown as OwnerReview[];
  const count = reviews.length;
  const avg = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
  const shown = new Intl.NumberFormat(locale === "de" ? "de-DE" : "en-GB", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(avg);
  const dist = [5, 4, 3, 2, 1].map((n) => ({
    n,
    c: reviews.filter((r) => r.rating === n).length,
  }));

  const visitDate = (r: OwnerReview) => {
    const res = Array.isArray(r.reservations) ? r.reservations[0] : r.reservations;
    return res?.reservation_at ?? null;
  };

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

      {count === 0 ? (
        <FadeIn delay={0.05}>
          <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            {t("none")}
          </p>
        </FadeIn>
      ) : (
        <>
          <FadeIn delay={0.05} className="mb-9">
            <div className="grid gap-6 rounded-lg border border-border bg-card p-5 sm:grid-cols-[auto_1fr] sm:items-center">
              <div>
                <p className="eyebrow">{t("average")}</p>
                <p className="mt-1 font-heading text-4xl font-semibold tabular-nums">{shown}</p>
                <StarRating value={avg} size="md" />
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("count", { count })}
                </p>
              </div>
              <ul className="space-y-1.5">
                {dist.map(({ n, c }) => (
                  <li key={n} className="flex items-center gap-3 text-sm">
                    <span className="w-6 tabular-nums text-muted-foreground">{n}★</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.round((c / count) * 100)}%` }}
                      />
                    </div>
                    <span className="w-6 text-right tabular-nums text-muted-foreground">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <ul className="divide-y divide-border rounded-lg border border-border bg-card">
              {reviews.map((r) => {
                const visit = visitDate(r);
                return (
                  <li key={r.id} className="space-y-2 px-4 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <StarRating value={r.rating} />
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {visit ? `${t("visitOn", { date: formatDate(visit, locale) })} · ` : ""}
                        {t("writtenOn", { date: formatDate(r.created_at, locale) })}
                      </span>
                    </div>
                    <p className={r.comment ? "text-sm leading-relaxed whitespace-pre-line" : "text-sm italic text-muted-foreground"}>
                      {r.comment || t("noComment")}
                    </p>
                  </li>
                );
              })}
            </ul>
          </FadeIn>
        </>
      )}
    </div>
  );
}
