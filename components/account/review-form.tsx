"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/star-rating";
import { submitReview } from "@/lib/actions/reviews";

export function ReviewForm({
  reservationId,
  onDone,
  onCancel,
}: {
  reservationId: string;
  onDone: (rating: number) => void;
  onCancel: () => void;
}) {
  const t = useTranslations("account.bookings");
  const [rating, setRating] = React.useState(0);
  const [comment, setComment] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  const err = (key: string) => {
    try {
      return t(`reviewErrors.${key}` as never);
    } catch {
      return t("reviewErrors.unknown");
    }
  };

  const submit = () => {
    setError(null);
    if (rating < 1) {
      setError(err("ratingRequired"));
      return;
    }
    startTransition(async () => {
      const result = await submitReview({ reservationId, rating, comment });
      if (result.ok) onDone(rating);
      else setError(err(result.error));
    });
  };

  return (
    <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-4">
      <p className="text-sm font-medium">{t("ratingLabel")}</p>
      <StarRating
        value={rating}
        onChange={setRating}
        size="lg"
        label={t("ratingLabel")}
      />

      <div>
        <label
          htmlFor={`review-${reservationId}`}
          className="mb-1.5 block text-xs text-muted-foreground"
        >
          {t("commentLabel")}
        </label>
        <Textarea
          id={`review-${reservationId}`}
          rows={3}
          maxLength={1000}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t("commentPlaceholder")}
        />
      </div>

      {error ? (
        <p
          role="alert"
          className="flex items-start gap-2 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button onClick={submit} disabled={pending} className="h-10">
          {pending ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              {t("submittingReview")}
            </>
          ) : (
            t("submitReview")
          )}
        </Button>
        <Button
          variant="ghost"
          onClick={onCancel}
          disabled={pending}
          className="h-10"
        >
          {t("cancelReview")}
        </Button>
      </div>
    </div>
  );
}
