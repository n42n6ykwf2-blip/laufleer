"use client";

import * as React from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
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
  newPasswordSchema,
  type NewPasswordInput,
} from "@/lib/validation/password-reset";
import { updatePassword } from "@/lib/actions/password-reset";

export function NewPasswordForm({ isCustomer }: { isCustomer: boolean }) {
  const t = useTranslations("account.reset");
  const te = useTranslations("account.errors");
  const reduce = useReducedMotion();
  const [done, setDone] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  const form = useForm<NewPasswordInput>({
    resolver: zodResolver(
      newPasswordSchema
    ) as unknown as Resolver<NewPasswordInput>,
    defaultValues: { password: "", passwordConfirm: "" },
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
      const result = await updatePassword(values);
      if (result.ok) setDone(true);
      else setServerError(result.error);
    });
  });

  if (done) {
    return (
      <div className="rounded-lg border border-primary/25 bg-primary/6 p-6">
        <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-5" strokeWidth={2.5} />
        </div>
        <h2 className="mt-4 font-heading text-xl font-medium">
          {t("doneTitle")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t("doneText")}
        </p>
        <Button asChild className="mt-5 h-11">
          <Link href={isCustomer ? "/account" : "/partner/profile"}>
            {isCustomer ? t("toAccount") : t("toPartner")}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-5">
        <FormField
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>{t("password")}</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  className="h-12 sm:h-11"
                  {...field}
                />
              </FormControl>
              <FormDescription>{t("passwordHint")}</FormDescription>
              <FormMessage>{err(fieldState.error?.message)}</FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="passwordConfirm"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>{t("passwordConfirm")}</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  className="h-12 sm:h-11"
                  {...field}
                />
              </FormControl>
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
