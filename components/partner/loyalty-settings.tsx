"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { saveLoyaltySettings } from "@/lib/actions/loyalty";

export function LoyaltySettings({
  enabled: initialEnabled,
  pointsPerVisit: initialPoints,
}: {
  enabled: boolean;
  pointsPerVisit: number;
}) {
  const t = useTranslations("partner.loyalty");
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = React.useState(initialEnabled);
  const [points, setPoints] = React.useState(initialPoints);
  const [saved, setSaved] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  const save = () => {
    setSaved(false);
    startTransition(async () => {
      const result = await saveLoyaltySettings({
        enabled,
        pointsPerVisit: points,
      });
      if (result.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 4000);
      }
    });
  };

  return (
    <div className="space-y-5 rounded-lg border border-border bg-card p-5">
      <label className="flex cursor-pointer items-center gap-3">
        <Checkbox
          checked={enabled}
          onCheckedChange={(v) => setEnabled(v === true)}
        />
        <span className="text-sm font-medium">{t("enabled")}</span>
      </label>

      <div className="max-w-40">
        <Label htmlFor="ppv" className="mb-2">
          {t("pointsPerVisit")}
        </Label>
        <Input
          id="ppv"
          type="number"
          min={0}
          max={1000}
          value={points}
          disabled={!enabled}
          onChange={(e) => setPoints(Number(e.target.value))}
          className="h-12 sm:h-11"
        />
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {t("pointsPerVisitHint")}
        </p>
      </div>

      <AnimatePresence initial={false}>
        {saved ? (
          <motion.p
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-sm text-primary"
          >
            <Check className="size-4" />
            {t("saved")}
          </motion.p>
        ) : null}
      </AnimatePresence>

      <Button onClick={save} disabled={pending} className="h-11">
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        {pending ? t("saving") : t("save")}
      </Button>
    </div>
  );
}
