"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveTable, deleteTable } from "@/lib/actions/tables";
import type { RestaurantTable } from "@/lib/types";

export function TablesManager({ tables }: { tables: RestaurantTable[] }) {
  const t = useTranslations("partner.tables");
  const reduce = useReducedMotion();
  const [label, setLabel] = React.useState("");
  const [capacity, setCapacity] = React.useState(2);
  const [pending, startTransition] = React.useTransition();
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const sorted = [...tables].sort(
    (a, b) => a.capacity - b.capacity || a.label.localeCompare(b.label)
  );
  const seats = tables.reduce((sum, tb) => sum + tb.capacity, 0);

  const add = () => {
    if (!label.trim()) return;
    startTransition(async () => {
      await saveTable({ label: label.trim(), capacity });
      setLabel("");
      setCapacity(2);
    });
  };

  return (
    <div className="space-y-8">
      <p className="text-sm leading-relaxed text-muted-foreground">
        {t("intro")}
      </p>

      {/* Qo'shish formasi */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label htmlFor="tbl-label" className="mb-2">
              {t("label")}
            </Label>
            <Input
              id="tbl-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={t("labelPlaceholder")}
              maxLength={20}
              className="h-12 sm:h-11"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  add();
                }
              }}
            />
          </div>
          <div className="w-full sm:w-28">
            <Label htmlFor="tbl-cap" className="mb-2">
              {t("capacity")}
            </Label>
            <Input
              id="tbl-cap"
              type="number"
              min={1}
              max={50}
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="h-12 sm:h-11"
            />
          </div>
          <Button
            onClick={add}
            disabled={pending || !label.trim()}
            className="h-12 sm:h-11"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            {t("add")}
          </Button>
        </div>
      </div>

      {/* Ro'yxat */}
      {sorted.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          {t("noTables")}
        </p>
      ) : (
        <div className="space-y-3">
          <p className="eyebrow">{t("totalSeats", { count: tables.length, seats })}</p>
          <ul className="divide-y divide-border rounded-lg border border-border bg-card">
            <AnimatePresence initial={false}>
              {sorted.map((tb) => (
                <motion.li
                  key={tb.id}
                  layout={!reduce}
                  exit={reduce ? undefined : { opacity: 0, height: 0 }}
                  className="flex items-center justify-between gap-4 px-4 py-3"
                >
                  <div className="flex items-baseline gap-3">
                    <span className="font-heading text-base font-medium">
                      {tb.label}
                    </span>
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {tb.capacity} {t("capacity")}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t("deleteConfirm")}
                    disabled={busyId === tb.id}
                    onClick={() => {
                      if (!confirm(t("deleteConfirm"))) return;
                      setBusyId(tb.id);
                      startTransition(async () => {
                        await deleteTable(tb.id);
                        setBusyId(null);
                      });
                    }}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    {busyId === tb.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                  </Button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      )}
    </div>
  );
}
