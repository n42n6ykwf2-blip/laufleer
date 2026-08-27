"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ALL_FEATURES } from "@/lib/types";
import { cn } from "@/lib/utils";

const ALL = "__all__";

interface Props {
  cities: string[];
  cuisines: string[];
  resultLabel: string;
}

export function RestaurantFilters({ cities, cuisines, resultLabel }: Props) {
  const t = useTranslations("filters");
  const tf = useTranslations("features");
  const tp = useTranslations("priceLevel");
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const city = params.get("city") ?? "";
  const cuisine = params.get("cuisine") ?? "";
  const price = params.get("price") ?? "";
  const features = React.useMemo(
    () => (params.get("features") ?? "").split(",").filter(Boolean),
    [params]
  );
  const q = params.get("q") ?? "";

  const activeCount =
    (city ? 1 : 0) + (cuisine ? 1 : 0) + (price ? 1 : 0) + features.length;

  const setParams = React.useCallback(
    (next: Record<string, string | null>) => {
      const sp = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(next)) {
        if (!v) sp.delete(k);
        else sp.set(k, v);
      }
      const qs = sp.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router]
  );

  // Qidiruv — 300 ms kechikish bilan URL'ga yoziladi
  const [draft, setDraft] = React.useState(q);
  React.useEffect(() => setDraft(q), [q]);
  React.useEffect(() => {
    if (draft === q) return;
    const id = setTimeout(() => setParams({ q: draft || null }), 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  const reset = () =>
    setParams({ city: null, cuisine: null, price: null, features: null, q: null });

  const toggleFeature = (f: string) => {
    const next = features.includes(f)
      ? features.filter((x) => x !== f)
      : [...features, f];
    setParams({ features: next.length ? next.join(",") : null });
  };

  /* ---------- Filtr maydonlari (mobil panel va desktop uchun umumiy) ---------- */
  const fields = (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label className="mb-2 text-xs text-muted-foreground">
            {t("city")}
          </Label>
          <Select
            value={city || ALL}
            onValueChange={(v) => setParams({ city: v === ALL ? null : v })}
          >
            <SelectTrigger className="h-11 w-full sm:h-9">
              <SelectValue placeholder={t("allCities")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t("allCities")}</SelectItem>
              {cities.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-2 text-xs text-muted-foreground">
            {t("cuisine")}
          </Label>
          <Select
            value={cuisine || ALL}
            onValueChange={(v) => setParams({ cuisine: v === ALL ? null : v })}
          >
            <SelectTrigger className="h-11 w-full sm:h-9">
              <SelectValue placeholder={t("allCuisines")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t("allCuisines")}</SelectItem>
              {cuisines.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-2 text-xs text-muted-foreground">
            {t("price")}
          </Label>
          <ToggleGroup
            type="single"
            value={price}
            onValueChange={(v) => setParams({ price: v || null })}
            variant="outline"
            className="w-full"
          >
            {[1, 2, 3, 4].map((lvl) => (
              <ToggleGroupItem
                key={lvl}
                value={String(lvl)}
                aria-label={tp(String(lvl) as "1" | "2" | "3" | "4")}
                className="h-11 flex-1 text-sm sm:h-9"
              >
                {"€".repeat(lvl)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>

      <div>
        <Label className="mb-2.5 text-xs text-muted-foreground">
          {t("features")}
        </Label>
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
                  "rounded-full border px-3 py-2 text-sm transition-colors sm:py-1.5",
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
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Qidiruv + mobil filtr tugmasi */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchLabel")}
            className="h-11 pl-9"
          />
          {draft ? (
            <button
              type="button"
              onClick={() => setDraft("")}
              aria-label={t("reset")}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>

        {/* Mobil: pastdan chiquvchi panel */}
        <Drawer>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              className="h-11 shrink-0 gap-2 px-3.5 lg:hidden"
            >
              <SlidersHorizontal className="size-4" />
              {t("open")}
              {activeCount > 0 ? (
                <Badge className="ml-0.5 size-5 justify-center rounded-full p-0 text-[0.6875rem] tabular-nums">
                  {activeCount}
                </Badge>
              ) : null}
            </Button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[88dvh]">
            <DrawerHeader className="text-left">
              <DrawerTitle className="font-heading text-xl">
                {t("title")}
              </DrawerTitle>
            </DrawerHeader>
            <div className="overflow-y-auto px-4 pb-2">{fields}</div>
            <DrawerFooter className="flex-row gap-2 border-t">
              <Button
                variant="outline"
                onClick={reset}
                disabled={activeCount === 0 && !q}
                className="h-11 flex-1"
              >
                {t("reset")}
              </Button>
              <DrawerClose asChild>
                <Button className="h-11 flex-[2]">{resultLabel}</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Desktop: doimiy ko'rinadigan filtrlar */}
      <div className="hidden lg:block">
        <Separator className="mb-5" />
        {fields}
        {activeCount > 0 || q ? (
          <div className="mt-5 flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {t("activeCount", { count: activeCount })}
            </span>
            <Button variant="ghost" size="sm" onClick={reset} className="gap-1.5">
              <X className="size-3.5" />
              {t("reset")}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
