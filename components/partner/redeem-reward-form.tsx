"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AlertCircle, Check, Loader2, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { redeemRewardByCode } from "@/lib/actions/loyalty-rewards";

export function RedeemRewardForm() {
  const t = useTranslations("partner.loyalty");
  const reduce = useReducedMotion();
  const [code, setCode] = React.useState("");
  const [ok, setOk] = React.useState<{
    percent: number;
    name: string | null;
  } | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  const err = (key: string) => {
    try {
      return t(`redeemErrors.${key}` as never);
    } catch {
      return t("redeemErrors.unknown");
    }
  };

  const submit = () => {
    if (!code.trim()) return;
    setOk(null);
    setError(null);
    startTransition(async () => {
      const result = await redeemRewardByCode({ code });
      if (result.ok) {
        setOk({ percent: result.discountPercent, name: result.guestName });
        setCode("");
      } else {
        setError(err(result.error));
      }
    });
  };

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <Ticket className="size-4 text-primary" />
        <h2 className="font-heading text-lg font-medium">{t("redeemTitle")}</h2>
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        {t("redeemIntro")}
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Label htmlFor="reward-code" className="mb-2">
            {t("redeemCode")}
          </Label>
          <Input
            id="reward-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="LF-XXXXX"
            autoComplete="off"
            spellCheck={false}
            className="h-12 font-mono tracking-widest uppercase sm:h-11"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
          />
        </div>
        <Button
          onClick={submit}
          disabled={pending || !code.trim()}
          className="h-12 sm:h-11"
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {t("redeemChecking")}
            </>
          ) : (
            t("redeemSubmit")
          )}
        </Button>
      </div>

      <AnimatePresence initial={false}>
        {ok ? (
          <motion.div
            initial={reduce ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 flex gap-2.5 rounded-lg border border-primary/30 bg-primary/8 p-3.5 text-sm">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              <p className="font-medium">
                {ok.name
                  ? t("redeemSuccessNamed", {
                      percent: ok.percent,
                      name: ok.name,
                    })
                  : t("redeemSuccess", { percent: ok.percent })}
              </p>
            </div>
          </motion.div>
        ) : null}

        {error ? (
          <motion.div
            role="alert"
            initial={reduce ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 flex gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 p-3.5 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <p>{error}</p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
