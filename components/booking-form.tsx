"use client";

import * as React from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import PhoneInput from "react-phone-number-input";
import { AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const PARTY_SIZES = Array.from({ length: 20 }, (_, i) => i + 1);

export function BookingForm({
  restaurantId,
  restaurantName,
  restaurantSlug,
}: Props) {
  const t = useTranslations("bookingForm");
  const router = useRouter();
  const reduce = useReducedMotion();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  const form = useForm<ReservationInput>({
    resolver: zodResolver(
      reservationInputSchema
    ) as unknown as Resolver<ReservationInput>,
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

  /** Zod xabar kalitini tarjimaga aylantiradi */
  const err = (message?: string) => {
    if (!message) return null;
    try {
      return t(`errors.${message}` as never);
    } catch {
      return message;
    }
  };

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const result = await createReservation(values);
      if (result.ok) {
        const at = encodeURIComponent(`${values.date}T${values.time}`);
        router.push(
          `/r/${restaurantSlug}/book/success?code=${result.reservationCode}&at=${at}&size=${values.partySize}`
        );
      } else {
        setServerError(result.error);
      }
    });
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-9">
        <input type="hidden" {...form.register("restaurantId")} />

        {/* Restoran */}
        <div>
          <p className="eyebrow">{t("restaurantLabel")}</p>
          <p className="mt-1.5 font-heading text-xl font-medium">
            {restaurantName}
          </p>
        </div>

        <Separator />

        {/* Qachon */}
        <section className="space-y-5">
          <h2 className="font-heading text-lg font-medium">
            {t("whenSection")}
          </h2>

          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="date"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("dateLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      min={new Date().toISOString().slice(0, 10)}
                      className="h-12 sm:h-11"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage>{err(fieldState.error?.message)}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="time"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("timeLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      step={900}
                      className="h-12 sm:h-11"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage>{err(fieldState.error?.message)}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="partySize"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("partySizeLabel")}</FormLabel>
                  <Select
                    value={String(field.value)}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12 w-full sm:h-11">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PARTY_SIZES.map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage>{err(fieldState.error?.message)}</FormMessage>
                </FormItem>
              )}
            />
          </div>
        </section>

        <Separator />

        {/* Aloqa */}
        <section className="space-y-5">
          <h2 className="font-heading text-lg font-medium">
            {t("contactSection")}
          </h2>

          <FormField
            control={form.control}
            name="guestName"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t("nameLabel")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("namePlaceholder")}
                    autoComplete="name"
                    className="h-12 sm:h-11"
                    {...field}
                  />
                </FormControl>
                <FormMessage>{err(fieldState.error?.message)}</FormMessage>
              </FormItem>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="guestPhone"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("phoneLabel")}</FormLabel>
                  <FormControl>
                    {/* Butun dunyo raqamlari — mamlakat tanlash bilan */}
                    <PhoneInput
                      international
                      defaultCountry="DE"
                      value={field.value || undefined}
                      onChange={(v) => field.onChange(v ?? "")}
                      autoComplete="tel"
                      className="!h-12 sm:!h-11"
                    />
                  </FormControl>
                  <FormMessage>{err(fieldState.error?.message)}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="guestEmail"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("emailLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      inputMode="email"
                      placeholder={t("emailPlaceholder")}
                      autoComplete="email"
                      className="h-12 sm:h-11"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage>{err(fieldState.error?.message)}</FormMessage>
                </FormItem>
              )}
            />
          </div>

          <FormDescription>{t("contactHint")}</FormDescription>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="gap-1.5">
                  {t("notesLabel")}
                  <span className="text-xs font-normal text-muted-foreground">
                    ({t("notesOptional")})
                  </span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("notesPlaceholder")}
                    rows={3}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </section>

        {/* Server xatosi */}
        <AnimatePresence initial={false}>
          {serverError ? (
            <motion.div
              initial={reduce ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div
                role="alert"
                className="flex gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 p-3.5 text-sm text-destructive"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <p>{err(serverError) ?? err("unknown")}</p>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="space-y-3">
          <Button
            type="submit"
            size="lg"
            disabled={pending}
            className="h-12 w-full text-base sm:w-auto sm:px-8"
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {t("submitting")}
              </>
            ) : (
              t("submit")
            )}
          </Button>

          <p className="text-xs leading-relaxed text-muted-foreground">
            {t("consentHint")}
          </p>
        </div>
      </form>
    </Form>
  );
}
