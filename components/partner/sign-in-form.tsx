"use client";

import * as React from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { AlertCircle, Loader2 } from "lucide-react";
import { useRouter, Link } from "@/i18n/navigation";
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
import { signInSchema, type SignInInput } from "@/lib/validation/auth";
import { signIn } from "@/lib/actions/auth";

export function SignInForm() {
  const t = useTranslations("partner.signIn");
  const te = useTranslations("partner.authErrors");
  const tf = useTranslations("account.forgot");
  const router = useRouter();
  const reduce = useReducedMotion();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema) as unknown as Resolver<SignInInput>,
    defaultValues: { email: "", password: "" },
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
      const result = await signIn(values);
      if (result.ok) {
        router.push("/partner/profile");
        router.refresh();
      } else {
        setServerError(result.error);
      }
    });
  });

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

        <FormField
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>{t("password")}</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="current-password"
                  className="h-12 sm:h-11"
                  {...field}
                />
              </FormControl>
              <FormMessage>{err(fieldState.error?.message)}</FormMessage>
            </FormItem>
          )}
        />

        <p className="-mt-1 text-sm">
          <Link
            href="/account/forgot?from=partner"
            className="text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            {tf("link")}
          </Link>
        </p>

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
          {t("noAccount")}{" "}
          <Link
            href="/partner/register"
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            {t("toSignUp")}
          </Link>
        </p>
      </form>
    </Form>
  );
}
