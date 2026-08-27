"use client";

import * as React from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import PhoneInput from "react-phone-number-input";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ImageUpload } from "@/components/partner/image-upload";
import {
  restaurantProfileSchema,
  WEEKDAYS,
  type RestaurantProfileInput,
} from "@/lib/validation/restaurant";
import { saveRestaurantProfile } from "@/lib/actions/restaurant";
import { ALL_FEATURES } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProfileForm({
  defaultValues,
}: {
  defaultValues: RestaurantProfileInput;
}) {
  const t = useTranslations("partner.profile");
  const te = useTranslations("partner.profileErrors");
  const tf = useTranslations("features");
  const tw = useTranslations("weekday");
  const reduce = useReducedMotion();

  const [serverError, setServerError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  const form = useForm<RestaurantProfileInput>({
    resolver: zodResolver(
      restaurantProfileSchema
    ) as unknown as Resolver<RestaurantProfileInput>,
    defaultValues,
  });

  const err = (message?: string) => {
    if (!message) return null;
    try {
      return te(message as never);
    } catch {
      return message;
    }
  };

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await saveRestaurantProfile(values);
      if (result.ok) {
        setSaved(true);
        form.reset(values);
        setTimeout(() => setSaved(false), 4000);
      } else {
        setServerError(result.error);
      }
    });
  });

  const features = form.watch("features");
  const toggleFeature = (f: string) => {
    const next = features.includes(f)
      ? features.filter((x) => x !== f)
      : [...features, f];
    form.setValue("features", next, { shouldDirty: true });
  };

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-10">
        {/* ---------- Grunddaten ---------- */}
        <section className="space-y-5">
          <h2 className="font-heading text-lg font-medium">{t("basics")}</h2>

          <FormField
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t("name")}</FormLabel>
                <FormControl>
                  <Input className="h-12 sm:h-11" {...field} />
                </FormControl>
                <FormMessage>{err(fieldState.error?.message)}</FormMessage>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cuisine"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t("cuisine")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("cuisinePlaceholder")}
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
            name="descriptionDe"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t("descriptionDe")}</FormLabel>
                <FormControl>
                  <Textarea
                    rows={4}
                    placeholder={t("descriptionPlaceholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage>{err(fieldState.error?.message)}</FormMessage>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="descriptionEn"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t("descriptionEn")}</FormLabel>
                <FormControl>
                  <Textarea rows={4} {...field} value={field.value ?? ""} />
                </FormControl>
                <FormDescription>{t("descriptionEnHint")}</FormDescription>
                <FormMessage>{err(fieldState.error?.message)}</FormMessage>
              </FormItem>
            )}
          />
        </section>

        <Separator />

        {/* ---------- Adresse ---------- */}
        <section className="space-y-5">
          <h2 className="font-heading text-lg font-medium">{t("address")}</h2>

          <div className="grid gap-4 sm:grid-cols-[1fr_7rem]">
            <FormField
              control={form.control}
              name="street"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("street")}</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="address-line1"
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
              name="houseNumber"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("houseNumber")}</FormLabel>
                  <FormControl>
                    <Input className="h-12 sm:h-11" {...field} />
                  </FormControl>
                  <FormMessage>{err(fieldState.error?.message)}</FormMessage>
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
            <FormField
              control={form.control}
              name="postalCode"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("postalCode")}</FormLabel>
                  <FormControl>
                    <Input
                      inputMode="numeric"
                      maxLength={5}
                      autoComplete="postal-code"
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
              name="city"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("city")}</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="address-level2"
                      className="h-12 sm:h-11"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage>{err(fieldState.error?.message)}</FormMessage>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="neighborhood"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t("neighborhood")}</FormLabel>
                <FormControl>
                  <Input
                    className="h-12 sm:h-11"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormDescription>{t("neighborhoodHint")}</FormDescription>
                <FormMessage>{err(fieldState.error?.message)}</FormMessage>
              </FormItem>
            )}
          />
        </section>

        <Separator />

        {/* ---------- Kontakt ---------- */}
        <section className="space-y-5">
          <h2 className="font-heading text-lg font-medium">{t("contact")}</h2>

          <FormField
            control={form.control}
            name="phone"
            render={({ field, fieldState }) => (
              <FormItem className="sm:max-w-sm">
                <FormLabel>{t("phone")}</FormLabel>
                <FormControl>
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
        </section>

        <Separator />

        {/* ---------- Weitere Angaben ---------- */}
        <section className="space-y-6">
          <h2 className="font-heading text-lg font-medium">{t("details")}</h2>

          <FormField
            control={form.control}
            name="priceLevel"
            render={({ field, fieldState }) => (
              <FormItem className="sm:max-w-xs">
                <FormLabel>{t("priceLevel")}</FormLabel>
                <FormControl>
                  <ToggleGroup
                    type="single"
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(v) => v && field.onChange(Number(v))}
                    variant="outline"
                    className="w-full"
                  >
                    {[1, 2, 3, 4].map((lvl) => (
                      <ToggleGroupItem
                        key={lvl}
                        value={String(lvl)}
                        className="h-12 flex-1 sm:h-11"
                      >
                        {"€".repeat(lvl)}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </FormControl>
                <FormMessage>{err(fieldState.error?.message)}</FormMessage>
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>{t("features")}</FormLabel>
            <div className="flex flex-wrap gap-2">
              {ALL_FEATURES.map((f) => {
                const on = features.includes(f);
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggleFeature(f)}
                    aria-pressed={on}
                    className={cn(
                      "rounded-full border px-3.5 py-2.5 text-sm transition-colors sm:py-2",
                      "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                      on
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                    )}
                  >
                    {tf(f)}
                  </button>
                );
              })}
            </div>
          </FormItem>

          <FormField
            control={form.control}
            name="coverImageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("image")}</FormLabel>
                <ImageUpload
                  value={field.value ?? ""}
                  onChange={(url) =>
                    form.setValue("coverImageUrl", url, { shouldDirty: true })
                  }
                />
              </FormItem>
            )}
          />
        </section>

        <Separator />

        {/* ---------- Öffnungszeiten ---------- */}
        <section className="space-y-4">
          <h2 className="font-heading text-lg font-medium">{t("hours")}</h2>

          <div className="space-y-2.5">
            {WEEKDAYS.map((day) => (
              <Controller
                key={day}
                control={form.control}
                name={`openingHours.${day}`}
                render={({ field, fieldState }) => (
                  <div className="rounded-lg border border-border bg-card p-3">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                      <span className="w-24 shrink-0 text-sm font-medium">
                        {tw(day)}
                      </span>

                      <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                        <Checkbox
                          checked={field.value.closed}
                          onCheckedChange={(v) =>
                            field.onChange({ ...field.value, closed: v === true })
                          }
                        />
                        {t("closed")}
                      </label>

                      {!field.value.closed ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            step={900}
                            value={field.value.open}
                            onChange={(e) =>
                              field.onChange({
                                ...field.value,
                                open: e.target.value,
                              })
                            }
                            className="h-11 w-[7.5rem] sm:h-9"
                            aria-label={`${tw(day)} — ${t("from")}`}
                          />
                          <span className="text-muted-foreground">–</span>
                          <Input
                            type="time"
                            step={900}
                            value={field.value.close}
                            onChange={(e) =>
                              field.onChange({
                                ...field.value,
                                close: e.target.value,
                              })
                            }
                            className="h-11 w-[7.5rem] sm:h-9"
                            aria-label={`${tw(day)} — ${t("to")}`}
                          />
                        </div>
                      ) : null}
                    </div>
                    {fieldState.error ? (
                      <p className="mt-2 text-sm text-destructive">
                        {err(fieldState.error.message)}
                      </p>
                    ) : null}
                  </div>
                )}
              />
            ))}
          </div>

          {form.formState.errors.openingHours?.message ? (
            <p className="text-sm text-destructive">
              {err(form.formState.errors.openingHours.message as string)}
            </p>
          ) : null}
        </section>

        {/* ---------- Xabarlar va saqlash ---------- */}
        <AnimatePresence initial={false}>
          {serverError ? (
            <motion.div
              initial={reduce ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div
                role="alert"
                className="flex gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 p-3.5 text-sm text-destructive"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <p>{err(serverError)}</p>
              </div>
            </motion.div>
          ) : null}

          {saved ? (
            <motion.div
              initial={reduce ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex gap-2.5 rounded-lg border border-primary/30 bg-primary/6 p-3.5 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                <p>{t("saved")}</p>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Mobilda saqlash tugmasi pastda yopishib turadi */}
        <div className="sticky bottom-0 -mx-4 border-t border-border bg-background/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-[2px] sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
          <Button
            type="submit"
            size="lg"
            disabled={pending}
            className="h-12 w-full text-base sm:w-auto sm:px-8"
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {t("saving")}
              </>
            ) : (
              t("save")
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
