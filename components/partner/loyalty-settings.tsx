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
  threshold: initialThreshold,
  discountPercent: initialPercent,
}: {
  enabled: boolean;
  pointsPerVisit: number;
  threshold: number;
  discountPercent: number;
}) {
  const t = useTranslations("partner.loyalty");
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = React.useState(initialEnabled);
  const [points, setPoints] = React.useState(initialPoints);
  const [threshold, setThreshold] = React.useState(initialThreshold);
  const [percent, setPercent] = React.useState(initialPercent);
  const [saved, setSaved] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  const save = () => {
    setSaved(false);
    startTransition(async () => {
      const result = await saveLoyaltySettings({
        enabled,
        pointsPerVisit: points,
        threshold,
        discountPercent: percent,
      });
      if (result.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 4000);
      }
    });
  };

  // Necha tashrifda chegirma tushadi — restoranga tushunarli bo'lsin
  const visitsNeeded = points > 0 ? Math.ceil(threshold / points) : 0;

  return (
    <div className="space-y-5 rounded-lg border border-border bg-card p-5">
      <label className="flex cursor-pointer items-center gap-3">
        <Checkbox
          checked={enabled}
          onCheckedChange={(v) => setEnabled(v === true)}
        />
        <span className="text-sm font-medium">{t("enabled")}</span>
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
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
        </div>

        <div>
          <Label htmlFor="thr" className="mb-2">
            {t("threshold")}
          </Label>
          <Input
            id="thr"
            type="number"
            min={1}
            max={1000}
            value={threshold}
            disabled={!enabled}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="h-12 sm:h-11"
          />
        </div>

        <div>
          <Label htmlFor="pct" className="mb-2">
            {t("discountPercent")}
          </Label>
          <Input
            id="pct"
            type="number"
            min={1}
            max={100}
            value={percent}
            disabled={!enabled}
            onChange={(e) => setPercent(Number(e.target.value))}
            className="h-12 sm:h-11"
          />
        </div>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        {t("thresholdHint")}
      </p>

      {/* Tirik misol — raqamlar o'zgarganda darhol yangilanadi */}
      {enabled && visitsNeeded > 0 ? (
        <p className="rounded-md border border-border bg-muted/50 p-3 text-xs leading-relaxed">
          {t("cycleExample", {
            perVisit: points,
            threshold,
            visits: visitsNeeded,
            percent,
          })}
        </p>
      ) : null}

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
