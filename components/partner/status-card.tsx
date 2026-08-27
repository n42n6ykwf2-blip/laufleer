"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, Clock, ExternalLink, Loader2, Send } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { submitForReview } from "@/lib/actions/restaurant";
import { cn } from "@/lib/utils";

type Status = "draft" | "pending" | "approved" | "rejected";

const tone: Record<Status, string> = {
  draft: "border-border bg-muted/50",
  pending: "border-primary/30 bg-primary/6",
  approved: "border-primary/40 bg-primary/8",
  rejected: "border-destructive/30 bg-destructive/5",
};

export function StatusCard({
  status,
  slug,
  rejectionReason,
  hasProfile,
}: {
  status: Status;
  slug: string | null;
  rejectionReason: string | null;
  hasProfile: boolean;
}) {
  const t = useTranslations("partner.status");
  const tp = useTranslations("partner.profile");
  const te = useTranslations("partner.profileErrors");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  const canSubmit = hasProfile && (status === "draft" || status === "rejected");

  const onSubmit = () => {
    setError(null);
    startTransition(async () => {
      const result = await submitForReview();
      if (!result.ok) setError(result.error);
    });
  };

  return (
    <div className={cn("rounded-lg border p-5", tone[status])}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="eyebrow">{t("label")}</span>
        <Badge
          variant={status === "rejected" ? "destructive" : "secondary"}
          className="rounded-full"
        >
          {t(status)}
        </Badge>
        {status === "pending" ? (
          <Clock className="size-4 text-primary" aria-hidden />
        ) : null}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {t(`${status}Text` as "draftText")}
      </p>

      {status === "rejected" && rejectionReason ? (
        <p className="mt-3 rounded-md border border-destructive/25 bg-background/60 p-3 text-sm">
          {rejectionReason}
        </p>
      ) : null}

      {status === "approved" && slug ? (
        <Link
          href={`/r/${slug}`}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-2 hover:underline"
        >
          {t("viewPublic")}
          <ExternalLink className="size-3.5" />
        </Link>
      ) : null}

      {canSubmit ? (
        <div className="mt-5 space-y-3">
          <Button onClick={onSubmit} disabled={pending} className="h-11">
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {tp("submitting")}
              </>
            ) : (
              <>
                <Send className="size-4" />
                {tp("submitForReview")}
              </>
            )}
          </Button>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {tp("submitHint")}
          </p>
        </div>
      ) : null}

      {error ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {te(error as never)}
        </p>
      ) : null}
    </div>
  );
}
