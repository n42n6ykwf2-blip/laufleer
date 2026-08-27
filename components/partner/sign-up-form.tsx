"use client";

import * as React from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { AlertCircle, Loader2, MailCheck } from "lucide-react";
import { useRouter, Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { signUpSchema, type SignUpInput } from "@/lib/validation/auth";
import { signUp } from "@/lib/actions/auth";

export function SignUpForm() {
  const t = useTranslations("partner.signUp");
  const te = useTranslations("partner.authErrors");
  const router = useRouter();
  const reduce = useReducedMotion();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [awaitingEmail, setAwaitingEmail] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema) as unknown as Resolver<SignUpInput>,
    defaultValues: {
      contactName: "",
      email: "",
      password: "",
      passwordConfirm: "",
      acceptTerms: false,
    },
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
      const result = await signUp(values);
      if (!result.ok) {
        setServerError(result.error);
        return;
      }
      if (result.needsEmailConfirmation) {
        setAwaitingEmail(true);
      } else {
        router.push("/partner/profile");
      }
    });
  });

  if (awaitingEmail) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <MailCheck className="size-6 text-primary" />
        <h2 className="mt-4 font-heading text-xl font-medium">
          {t("checkEmailTitle")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t("checkEmailText")}
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-5">
        <FormField
          control={form.control}
          name="contactName"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>{t("contactName")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("contactNamePlaceholder")}
                  autoComplete="name"
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

        <FormField
          control={form.control}
          name="acceptTerms"
          render={({ field, fieldState }) => (
            <FormItem>
              <div className="flex items-start gap-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(v) => field.onChange(v === true)}
                    className="mt-0.5"
                  />
                </FormControl>
                <label
                  onClick={() => field.onChange(!field.value)}
                  className="cursor-pointer text-sm leading-relaxed"
                >
                  {t("acceptTerms")}{" "}
                  <Link
                    href="/datenschutz"
                    target="_blank"
                    className="underline underline-offset-2 hover:text-primary"
                    onClick={(e) => e.stopPropagation()}
                  >
                    ↗
                  </Link>
                </label>
              </div>
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

        <p className="text-center text-sm text-muted-foreground">
          {t("hasAccount")}{" "}
          <Link
            href="/partner/login"
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            {t("toSignIn")}
          </Link>
        </p>
      </form>
    </Form>
  );
}
