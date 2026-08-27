"use client";

import { useState, useTransition } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import PhoneInput from "react-phone-number-input";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { reservationInputSchema } from "@/lib/validation/reservation";
import { createReservation } from "@/lib/actions/create-reservation";
import type { ReservationInput } from "@/lib/validation/reservation";

interface Props {
  restaurantId: string;
  restaurantName: string;
  restaurantSlug: string;
}

function isoTomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function BookingForm({
  restaurantId,
  restaurantName,
  restaurantSlug,
}: Props) {
  const t = useTranslations("bookingForm");
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ReservationInput>({
    resolver: zodResolver(reservationInputSchema) as unknown as Resolver<ReservationInput>,
    defaultValues: {
      restaurantId,
      guestName: "",
      guestPhone: "",
      guestEmail: "",
      partySize: 2,
      date: isoTomorrow(),
      time: "19:00",
      notes: "",
    },
  });

  const errKey = (path: string): string | null => {
    const parts = path.split(".");
    let cur: unknown = errors;
    for (const p of parts) {
      if (cur && typeof cur === "object" && p in (cur as object)) {
        cur = (cur as Record<string, unknown>)[p];
      } else {
        return null;
      }
    }
    if (cur && typeof cur === "object" && "message" in cur) {
      const msg = (cur as { message?: unknown }).message;
      return typeof msg === "string" ? msg : null;
    }
    return null;
  };

  const errText = (key: string | null) => {
    if (!key) return null;
    try {
      return t(`errors.${key}` as never);
    } catch {
      return key;
    }
  };

  const onSubmit = handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const result = await createReservation(values);
      if (result.ok) {
        router.push(
          `/r/${restaurantSlug}/book/success?code=${result.reservationCode}&at=${encodeURIComponent(
            `${values.date}T${values.time}`
          )}&size=${values.partySize}`
        );
      } else {
        setServerError(result.error);
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <input type="hidden" {...register("restaurantId")} />

      <div>
        <Label>{t("restaurantLabel")}</Label>
        <div className="rounded-md border border-border bg-muted px-3 py-2 text-sm">
          {restaurantName}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="date">{t("dateLabel")}</Label>
          <Input
            id="date"
            type="date"
            min={new Date().toISOString().slice(0, 10)}
            {...register("date")}
          />
          {errKey("date") ? (
            <p className="mt-1 text-xs text-destructive">
              {errText(errKey("date"))}
            </p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="time">{t("timeLabel")}</Label>
          <Input id="time" type="time" step={900} {...register("time")} />
        </div>
        <div>
          <Label htmlFor="partySize">{t("partySizeLabel")}</Label>
          <Input
            id="partySize"
            type="number"
            min={1}
            max={20}
            {...register("partySize", { valueAsNumber: true })}
          />
          {errKey("partySize") ? (
            <p className="mt-1 text-xs text-destructive">
              {errText(errKey("partySize"))}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <Label htmlFor="guestName">{t("nameLabel")}</Label>
        <Input
          id="guestName"
          placeholder={t("namePlaceholder")}
          autoComplete="name"
          {...register("guestName")}
        />
        {errKey("guestName") ? (
          <p className="mt-1 text-xs text-destructive">
            {errText(errKey("guestName"))}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="guestPhone">{t("phoneLabel")}</Label>
          <Controller
            name="guestPhone"
            control={control}
            render={({ field }) => (
              <div className="flex h-10 items-center rounded-md border border-border bg-card px-3 focus-within:ring-2 focus-within:ring-ring">
                <PhoneInput
                  international
                  defaultCountry="DE"
                  value={field.value ?? undefined}
                  onChange={(v) => field.onChange(v ?? undefined)}
                  className="flex-1 flex items-center gap-2"
                  id="guestPhone"
                  autoComplete="tel"
                />
              </div>
            )}
          />
          {errKey("guestPhone") ? (
            <p className="mt-1 text-xs text-destructive">
              {errText(errKey("guestPhone"))}
            </p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="guestEmail">{t("emailLabel")}</Label>
          <Input
            id="guestEmail"
            type="email"
            placeholder={t("emailPlaceholder")}
            autoComplete="email"
            {...register("guestEmail")}
          />
          {errKey("guestEmail") ? (
            <p className="mt-1 text-xs text-destructive">
              {errText(errKey("guestEmail"))}
            </p>
          ) : null}
        </div>
      </div>
      <p className="text-xs text-muted-foreground -mt-2">{t("contactHint")}</p>

      <div>
        <Label htmlFor="notes">{t("notesLabel")}</Label>
        <Textarea
          id="notes"
          placeholder={t("notesPlaceholder")}
          {...register("notes")}
        />
      </div>

      {serverError ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {errText(serverError) ?? errText("unknown")}
        </div>
      ) : null}

      <p className="text-xs text-muted-foreground">{t("consentHint")}</p>

      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
