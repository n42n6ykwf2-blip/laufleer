import { getTranslations } from "next-intl/server";
import { ShieldCheck } from "lucide-react";
import { StarRating } from "@/components/star-rating";
import { formatDate } from "@/lib/format";
import { MIN_REVIEWS_FOR_AVERAGE } from "@/lib/reviews";
import type { Locale } from "@/i18n/routing";

/** get_restaurant_rating natijasi — identifikatsiyasiz */
export interface RatingStats {
  avg_rating: number | string | null;
  review_count: number;
}

/** get_restaurant_reviews natijasi — muallif YO'Q */
export interface PublicReview {
  rating: number;
  comment: string | null;
  created_at: string;
}

function formatAverage(avg: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "de" ? "de-DE" : "en-GB", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(avg);
}

/** Sarlavha ostidagi qisqa reyting qatori */
export async function RatingSummary({
  stats,
  locale,
}: {
  stats: RatingStats | null;
  locale: Locale;
}) {
  const t = await getTranslations("reviews");
  const count = stats?.review_count ?? 0;

  if (count === 0) return null;

  // Bitta-ikkita sharh restoranni noto'g'ri tasvirlamasin
  if (count < MIN_REVIEWS_FOR_AVERAGE) {
    return (
      <a
        href="#bewertungen"
        className="mt-2 inline-block text-sm text-muted-foreground underline-offset-2 hover:underline"
      >
        {t("tooFew")}
      </a>
    );
  }

  const avg = Number(stats?.avg_rating ?? 0);
  const shown = formatAverage(avg, locale);

  return (
    <a
      href="#bewertungen"
      className="mt-2 inline-flex items-center gap-2 text-sm transition-colors hover:text-primary"
    >
      <StarRating value={avg} label={t("stars", { rating: shown })} />
      <span className="font-medium tabular-nums">{shown}</span>
      <span className="text-muted-foreground">
        · {t("count", { count })}
      </span>
    </a>
  );
}

/** Restoran sahifasidagi sharhlar bo'limi */
export async function RestaurantReviews({
  stats,
  reviews,
  locale,
}: {
  stats: RatingStats | null;
  reviews: PublicReview[];
  locale: Locale;
}) {
  const t = await getTranslations("reviews");
  const count = stats?.review_count ?? 0;
  const avg = Number(stats?.avg_rating ?? 0);

  return (
    <section id="bewertungen" className="scroll-mt-24">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          {t("heading")}
        </h2>
        {count >= MIN_REVIEWS_FOR_AVERAGE ? (
          <div className="flex items-center gap-2 text-sm">
            <StarRating
              value={avg}
              size="md"
              label={t("stars", { rating: formatAverage(avg, locale) })}
            />
            <span className="font-medium tabular-nums">
              {formatAverage(avg, locale)}
            </span>
            <span className="text-muted-foreground">
              · {t("count", { count })}
            </span>
          </div>
        ) : count > 0 ? (
          <span className="text-sm text-muted-foreground">{t("tooFew")}</span>
        ) : null}
      </div>

      {/* §5b UWG: sharhlar qanday tekshirilishini ochiq aytamiz */}
      <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        {t("verifiedNote")}
      </p>

      {reviews.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">{t("none")}</p>
      ) : (
        <ul className="mt-6 divide-y divide-border/60">
          {reviews.map((rv, i) => (
            <li key={`${rv.created_at}-${i}`} className="py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <StarRating
                  value={rv.rating}
                  label={t("stars", { rating: String(rv.rating) })}
                />
                <span className="text-xs text-muted-foreground tabular-nums">
                  {t("anonymous")} · {formatDate(rv.created_at, locale)}
                </span>
              </div>
              {rv.comment ? (
                <p className="mt-2 text-sm leading-relaxed whitespace-pre-line">
                  {rv.comment}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
