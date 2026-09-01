"use client";

import * as React from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import PhoneInput from "react-phone-number-input";
import { AlertCircle, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  customerProfileSchema,
  type CustomerProfileInput,
} from "@/lib/validation/customer";
import { completeCustomerProfile } from "@/lib/actions/customer";

export function CompleteProfileForm({
  defaultValues,
  hasExistingPoints = false,
  redirectTo = "/account",
}: {
  defaultValues: CustomerProfileInput;
  hasExistingPoints?: boolean;
  redirectTo?: string;
}) {
  const t = useTranslations("account.complete");
  const te = useTranslations("account.errors");
  const router = useRouter();
  const reduce = useReducedMotion();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  const form = useForm<CustomerProfileInput>({
    resolver: zodResolver(
      customerProfileSchema
    ) as unknown as Resolver<CustomerProfileInput>,
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
    startTransition(async () => {
      const result = await completeCustomerProfile(values);
      if (result.ok) {
        router.push(redirectTo);
        router.refresh();
      } else {
        setServerError(result.error);
      }
    });
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-5">
        {/* Mehmon sifatida yig'ilgan ballar topilgan bo'lsa aytamiz */}
        {hasExistingPoints ? (
          <div className="flex gap-2.5 rounded-lg border border-primary/25 bg-primary/6 p-3.5 text-sm">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="leading-relaxed">{t("pointsFound")}</p>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t("firstName")}</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="given-name"
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
            name="lastName"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t("lastName")}</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="family-name"
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
          name="phone"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="gap-1.5">
                {t("phone")}
                <span className="text-xs font-normal text-muted-foreground">
                  ({t("phoneOptional")})
                </span>
              </FormLabel>
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
              <FormDescription>{t("phoneHint")}</FormDescription>
              <FormMessage>{err(fieldState.error?.message)}</FormMessage>
            </FormItem>
          )}
        />

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
        </AnimatePresence>

        <Button
          type="submit"
          size="lg"
          disabled={pending}
          className="h-12 w-full text-base"
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
      </form>
    </Form>
  );
}
