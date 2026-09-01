"use client";

import * as React from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { AlertCircle, Loader2, MailCheck } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  passwordResetRequestSchema,
  type PasswordResetRequestInput,
} from "@/lib/validation/password-reset";
import { requestPasswordReset } from "@/lib/actions/password-reset";

export function ForgotPasswordForm({ backTo }: { backTo: string }) {
  const t = useTranslations("account.forgot");
  const te = useTranslations("account.errors");
  const reduce = useReducedMotion();
  const [sent, setSent] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  const form = useForm<PasswordResetRequestInput>({
    resolver: zodResolver(
      passwordResetRequestSchema
    ) as unknown as Resolver<PasswordResetRequestInput>,
    defaultValues: { email: "" },
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
      const result = await requestPasswordReset(values);
      if (result.ok) setSent(true);
      else setServerError(result.error);
    });
  });

  if (sent) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <MailCheck className="size-6 text-primary" />
        <h2 className="mt-4 font-heading text-xl font-medium">
          {t("sentTitle")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t("sentText")}
        </p>
        <Link
          href={backTo}
          className="mt-4 inline-block text-sm font-medium text-primary underline-offset-2 hover:underline"
        >
          {t("backToLogin")}
        </Link>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-5">
        <FormField
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>{t("email")}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
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

        <p className="text-center text-sm">
          <Link
            href={backTo}
            className="text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            {t("backToLogin")}
          </Link>
        </p>
      </form>
    </Form>
  );
}
