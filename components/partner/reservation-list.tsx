"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, Loader2, UserX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { updateReservationStatus } from "@/lib/actions/reservations";
import { formatDateTime } from "@/lib/format";
import type { Reservation, ReservationStatus } from "@/lib/types";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const badgeTone: Record<ReservationStatus, string> = {
  pending: "bg-muted text-muted-foreground",
  confirmed: "bg-primary/12 text-primary",
  completed: "bg-primary/20 text-primary",
  cancelled: "bg-muted text-muted-foreground line-through",
  no_show: "bg-destructive/10 text-destructive",
};

export function ReservationList({
  reservations,
  loyaltyEnabled,
}: {
  reservations: Reservation[];
  loyaltyEnabled: boolean;
}) {
  const t = useTranslations("partner.reservations");
  const locale = useLocale() as Locale;
  const reduce = useReducedMotion();
  const [pending, startTransition] = React.useTransition();
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<string | null>(null);

  const now = Date.now();
  const upcoming = reservations
    .filter((r) => new Date(r.reservation_at).getTime() >= now)
    .sort(
      (a, b) =>
        new Date(a.reservation_at).getTime() -
        new Date(b.reservation_at).getTime()
    );
  const past = reservations
    .filter((r) => new Date(r.reservation_at).getTime() < now)
    .sort(
      (a, b) =>
        new Date(b.reservation_at).getTime() -
        new Date(a.reservation_at).getTime()
    );

  const act = (id: string, status: ReservationStatus) => {
    setBusyId(id);
    startTransition(async () => {
      const result = await updateReservationStatus({ id, status });
      if (result.ok && result.pointsAwarded) {
        setToast(t("pointsAwarded", { points: result.pointsAwarded }));
        setTimeout(() => setToast(null), 4000);
      }
      setBusyId(null);
    });
  };

  const Row = ({ r }: { r: Reservation }) => {
    const active = r.status === "confirmed" || r.status === "pending";
    return (
      <li className="space-y-3 px-4 py-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <div className="min-w-0">
            <p className="font-heading text-base font-medium">{r.guest_name}</p>
            <p className="text-sm text-muted-foreground">
              {formatDateTime(r.reservation_at, locale)} · {r.party_size}{" "}
              {t("party")}
              {r.restaurant_tables
                ? ` · ${t("table")} ${r.restaurant_tables.label}`
                : ""}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {/* Sodiqlik chegirmasi — xodim darhol ko'rishi kerak */}
            {r.discount_percent ? (
              <Badge className="rounded-full bg-primary/15 font-medium text-primary">
                {t("discount", { percent: r.discount_percent })}
              </Badge>
            ) : null}
            <Badge
              className={cn("rounded-full font-normal", badgeTone[r.status])}
            >
              {t(`status.${r.status}` as "status.pending")}
            </Badge>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          {[r.guest_phone, r.guest_email].filter(Boolean).join(" · ")}
        </p>

        {r.notes ? (
          <p className="rounded-md bg-muted/60 p-2.5 text-sm">{r.notes}</p>
        ) : null}

        {active ? (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              className="h-10"
              disabled={pending && busyId === r.id}
              onClick={() => act(r.id, "completed")}
            >
              {pending && busyId === r.id ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Check className="size-3.5" />
              )}
              {t("markCompleted")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-10"
              disabled={pending && busyId === r.id}
              onClick={() => act(r.id, "no_show")}
            >
              <UserX className="size-3.5" />
              {t("markNoShow")}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-10 text-muted-foreground hover:text-destructive"
              disabled={pending && busyId === r.id}
              onClick={() => {
                if (!confirm(t("cancelConfirm"))) return;
                act(r.id, "cancelled");
              }}
            >
              <X className="size-3.5" />
              {t("cancel")}
            </Button>
          </div>
        ) : null}
      </li>
    );
  };

  const Section = ({
    title,
    rows,
  }: {
    title: string;
    rows: Reservation[];
  }) => (
    <section>
      <h2 className="eyebrow mb-3">{title}</h2>
      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          {t("none")}
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-card">
          {rows.map((r) => (
            <Row key={r.id} r={r} />
          ))}
        </ul>
      )}
    </section>
  );

  return (
    <div className="space-y-9">
      {!loyaltyEnabled ? null : null}

      <AnimatePresence>
        {toast ? (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-lg border border-primary/30 bg-primary/6 p-3.5 text-sm"
          >
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Section title={t("upcoming")} rows={upcoming} />
      <Section title={t("past")} rows={past} />
    </div>
  );
}
