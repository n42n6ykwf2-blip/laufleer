"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AlertCircle, Check, Loader2, Phone, Star, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cancelMyReservation } from "@/lib/actions/cancel-reservation";
import { CANCEL_CUTOFF_HOURS } from "@/lib/booking-rules";
import { StarRating } from "@/components/star-rating";
import { ReviewForm } from "@/components/account/review-form";
import { canStillReview, embeddedRating } from "@/lib/reviews";
import { formatDateTime } from "@/lib/format";
import type { Reservation, ReservationStatus } from "@/lib/types";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const badgeTone: Record<ReservationStatus, string> = {
  pending: "bg-muted text-muted-foreground",
  confirmed: "bg-primary/12 text-primary",
  completed: "bg-primary/20 text-primary",
  cancelled: "bg-muted text-muted-foreground",
  no_show: "bg-destructive/10 text-destructive",
};

/** Ro'yxatdagi bir bron — restoran ma'lumoti bilan birga */
export interface BookingRow extends Reservation {
  restaurants?: { name: string; slug: string } | null;
  reviews?: { rating: number }[] | { rating: number } | null;
}

export function MyBookingsList({ bookings }: { bookings: BookingRow[] }) {
  const t = useTranslations("account.bookings");
  const locale = useLocale() as Locale;
  const reduce = useReducedMotion();
  const [pending, startTransition] = React.useTransition();
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [reviewingId, setReviewingId] = React.useState<string | null>(null);
  // Yuborilgan bahoni sahifa qayta yuklanguncha darhol ko'rsatish uchun
  const [ratedLocal, setRatedLocal] = React.useState<Record<string, number>>({});

  const now = Date.now();
  const cutoffMs = CANCEL_CUTOFF_HOURS * 60 * 60 * 1000;

  const upcoming = bookings
    .filter((b) => new Date(b.reservation_at).getTime() >= now)
    .sort(
      (a, b) =>
        new Date(a.reservation_at).getTime() -
        new Date(b.reservation_at).getTime()
    );
  const past = bookings
    .filter((b) => new Date(b.reservation_at).getTime() < now)
    .sort(
      (a, b) =>
        new Date(b.reservation_at).getTime() -
        new Date(a.reservation_at).getTime()
    );

  const err = (key: string) => {
    try {
      return t(`errors.${key}` as never);
    } catch {
      return t("errors.unknown");
    }
  };

  const cancel = (id: string) => {
    if (!confirm(t("cancelConfirm"))) return;
    setError(null);
    setNotice(null);
    setBusyId(id);
    startTransition(async () => {
      const result = await cancelMyReservation({ id });
      if (result.ok) setNotice(t("cancelled"));
      else setError(err(result.error));
      setBusyId(null);
    });
  };

  if (bookings.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center">
        <p className="font-heading text-lg font-medium">{t("none")}</p>
        <p className="mt-2 text-sm text-muted-foreground">{t("noneHint")}</p>
        <Button asChild className="mt-5 h-11">
          <Link href="/">{t("discover")}</Link>
        </Button>
      </div>
    );
  }

  /** "Keldi" belgilangan bron uchun baho bloki */
  const reviewBlock = (b: BookingRow) => {
    if (b.status !== "completed") return null;

    const given = ratedLocal[b.id] ?? embeddedRating(b.reviews);
    if (given) {
      return (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">{t("yourRating")}</span>
          <StarRating value={given} label={`${given} / 5`} />
        </div>
      );
    }

    if (!canStillReview(b.reservation_at)) {
      return (
        <p className="text-xs text-muted-foreground">{t("windowClosed")}</p>
      );
    }

    if (reviewingId === b.id) {
      return (
        <ReviewForm
          reservationId={b.id}
          onCancel={() => setReviewingId(null)}
          onDone={(rating) => {
            setRatedLocal((prev) => ({ ...prev, [b.id]: rating }));
            setReviewingId(null);
            setError(null);
            setNotice(t("reviewThanks"));
          }}
        />
      );
    }

    return (
      <Button
        size="sm"
        variant="outline"
        className="h-10"
        onClick={() => setReviewingId(b.id)}
      >
        <Star className="size-3.5" />
        {t("rate")}
      </Button>
    );
  };

  const row = (b: BookingRow) => {
    const startsAt = new Date(b.reservation_at).getTime();
    const active = b.status === "pending" || b.status === "confirmed";
    const future = startsAt >= now;
    const canCancel = active && future && startsAt - now >= cutoffMs;
    const tooLate = active && future && !canCancel;

    return (
      <li key={b.id} className="space-y-3 px-4 py-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <div className="min-w-0">
            {b.restaurants ? (
              <Link
                href={`/r/${b.restaurants.slug}`}
                className="font-heading text-base font-medium underline-offset-2 hover:text-primary hover:underline"
              >
                {b.restaurants.name}
              </Link>
            ) : (
              <p className="font-heading text-base font-medium">—</p>
            )}
            <p className="mt-0.5 text-sm text-muted-foreground">
              {formatDateTime(b.reservation_at, locale)} · {b.party_size}{" "}
              {t("party")}
              {b.restaurant_tables
                ? ` · ${t("table")} ${b.restaurant_tables.label}`
                : ""}
            </p>
          </div>
          <Badge className={cn("rounded-full font-normal", badgeTone[b.status])}>
            {t(`status.${b.status}` as "status.pending")}
          </Badge>
        </div>

        {b.notes ? (
          <p className="rounded-md bg-muted/60 p-2.5 text-sm">{b.notes}</p>
        ) : null}

        {canCancel ? (
          <Button
            size="sm"
            variant="ghost"
            className="h-10 text-muted-foreground hover:text-destructive"
            disabled={pending && busyId === b.id}
            onClick={() => cancel(b.id)}
          >
            {pending && busyId === b.id ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <X className="size-3.5" />
            )}
            {pending && busyId === b.id ? t("cancelling") : t("cancel")}
          </Button>
        ) : tooLate ? (
          <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <Phone className="mt-0.5 size-3.5 shrink-0" />
            {t("tooLateHint", { hours: CANCEL_CUTOFF_HOURS })}
          </p>
        ) : null}

        {reviewBlock(b)}
      </li>
    );
  };

  const section = (title: string, rows: BookingRow[]) =>
    rows.length === 0 ? null : (
      <section>
        <h2 className="eyebrow mb-3">{title}</h2>
        <ul className="divide-y divide-border rounded-lg border border-border bg-card">
          {rows.map(row)}
        </ul>
      </section>
    );

  return (
    <div className="space-y-9">
      <AnimatePresence>
        {notice ? (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex gap-2.5 rounded-lg border border-primary/30 bg-primary/6 p-3.5 text-sm"
          >
            <Check className="mt-0.5 size-4 shrink-0 text-primary" />
            <p>{notice}</p>
          </motion.div>
        ) : null}

        {error ? (
          <motion.div
            role="alert"
            initial={reduce ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 p-3.5 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <p>{error}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {section(t("upcoming"), upcoming)}
      {section(t("past"), past)}
    </div>
  );
}
