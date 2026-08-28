"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  saveCategory,
  deleteCategory,
  saveItem,
  deleteItem,
} from "@/lib/actions/menu";
import { formatPrice, localizedText } from "@/lib/format";
import type { MenuCategory, MenuItem } from "@/lib/types";
import type { Locale } from "@/i18n/routing";

/** "12,50" yoki "12.50" → 1250 */
function toCents(value: string): number {
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}
function fromCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

interface ItemDraft {
  nameDe: string;
  nameEn: string;
  descDe: string;
  descEn: string;
  price: string;
  isAvailable: boolean;
}

const emptyDraft: ItemDraft = {
  nameDe: "",
  nameEn: "",
  descDe: "",
  descEn: "",
  price: "",
  isAvailable: true,
};

function ItemForm({
  draft,
  setDraft,
  onSave,
  onCancel,
  pending,
}: {
  draft: ItemDraft;
  setDraft: (d: ItemDraft) => void;
  onSave: () => void;
  onCancel: () => void;
  pending: boolean;
}) {
  const t = useTranslations("partner.menu");

  return (
    <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-3.5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label className="mb-1.5 text-xs">{t("itemNameDe")}</Label>
          <Input
            value={draft.nameDe}
            onChange={(e) => setDraft({ ...draft, nameDe: e.target.value })}
            className="h-11 sm:h-10"
          />
        </div>
        <div>
          <Label className="mb-1.5 text-xs">{t("itemNameEn")}</Label>
          <Input
            value={draft.nameEn}
            onChange={(e) => setDraft({ ...draft, nameEn: e.target.value })}
            className="h-11 sm:h-10"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label className="mb-1.5 text-xs">{t("itemDescDe")}</Label>
          <Textarea
            rows={2}
            value={draft.descDe}
            onChange={(e) => setDraft({ ...draft, descDe: e.target.value })}
          />
        </div>
        <div>
          <Label className="mb-1.5 text-xs">{t("itemDescEn")}</Label>
          <Textarea
            rows={2}
            value={draft.descEn}
            onChange={(e) => setDraft({ ...draft, descEn: e.target.value })}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="w-32">
          <Label className="mb-1.5 text-xs">{t("price")} (€)</Label>
          <Input
            inputMode="decimal"
            value={draft.price}
            onChange={(e) => setDraft({ ...draft, price: e.target.value })}
            placeholder="12,50"
            className="h-11 sm:h-10"
          />
        </div>
        <label className="flex cursor-pointer items-center gap-2 pb-2.5 text-sm">
          <Checkbox
            checked={draft.isAvailable}
            onCheckedChange={(v) =>
              setDraft({ ...draft, isAvailable: v === true })
            }
          />
          {t("available")}
        </label>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={onSave}
          disabled={pending || !draft.nameDe.trim()}
          className="h-10"
        >
          {pending ? <Loader2 className="size-3.5 animate-spin" /> : null}
          {t("save")}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onCancel}
          disabled={pending}
          className="h-10"
        >
          {t("cancel")}
        </Button>
      </div>
    </div>
  );
}

export function MenuManager({
  categories,
  items,
}: {
  categories: MenuCategory[];
  items: MenuItem[];
}) {
  const t = useTranslations("partner.menu");
  const locale = useLocale() as Locale;
  const reduce = useReducedMotion();
  const [pending, startTransition] = React.useTransition();

  const [newCatDe, setNewCatDe] = React.useState("");
  const [newCatEn, setNewCatEn] = React.useState("");
  const [addingIn, setAddingIn] = React.useState<string | null>(null);
  const [editingItem, setEditingItem] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<ItemDraft>(emptyDraft);

  const sortedCats = [...categories].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  const addCategory = () => {
    if (!newCatDe.trim()) return;
    startTransition(async () => {
      await saveCategory({
        nameDe: newCatDe.trim(),
        nameEn: newCatEn.trim() || undefined,
        sortOrder: sortedCats.length + 1,
      });
      setNewCatDe("");
      setNewCatEn("");
    });
  };

  const persistItem = (categoryId: string, itemId?: string) => {
    startTransition(async () => {
      const catItems = items.filter((i) => i.category_id === categoryId);
      await saveItem({
        id: itemId,
        categoryId,
        nameDe: draft.nameDe.trim(),
        nameEn: draft.nameEn.trim() || undefined,
        descDe: draft.descDe.trim() || undefined,
        descEn: draft.descEn.trim() || undefined,
        priceCents: toCents(draft.price),
        isAvailable: draft.isAvailable,
        sortOrder: itemId
          ? (items.find((i) => i.id === itemId)?.sort_order ?? 1)
          : catItems.length + 1,
      });
      setAddingIn(null);
      setEditingItem(null);
      setDraft(emptyDraft);
    });
  };

  return (
    <div className="space-y-8">
      <p className="text-sm leading-relaxed text-muted-foreground">
        {t("intro")}
      </p>

      {/* Yangi kategoriya */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label className="mb-1.5 text-xs">{t("categoryNameDe")}</Label>
            <Input
              value={newCatDe}
              onChange={(e) => setNewCatDe(e.target.value)}
              placeholder={t("categoryPlaceholder")}
              className="h-11"
            />
          </div>
          <div>
            <Label className="mb-1.5 text-xs">{t("categoryNameEn")}</Label>
            <Input
              value={newCatEn}
              onChange={(e) => setNewCatEn(e.target.value)}
              className="h-11"
            />
          </div>
        </div>
        <Button
          onClick={addCategory}
          disabled={pending || !newCatDe.trim()}
          className="mt-3 h-11"
        >
          <Plus className="size-4" />
          {t("addCategory")}
        </Button>
      </div>

      {sortedCats.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          {t("noCategories")}
        </p>
      ) : null}

      {/* Kategoriyalar */}
      <div className="space-y-10">
        <AnimatePresence initial={false}>
          {sortedCats.map((cat) => {
            const catItems = items
              .filter((i) => i.category_id === cat.id)
              .sort((a, b) => a.sort_order - b.sort_order);

            return (
              <motion.section
                key={cat.id}
                layout={!reduce}
                exit={reduce ? undefined : { opacity: 0 }}
              >
                <div className="flex items-center justify-between gap-3 border-b border-border pb-2.5">
                  <h2 className="font-heading text-xl font-medium">
                    {localizedText(cat.name, locale)}
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t("delete")}
                    disabled={pending}
                    onClick={() => {
                      if (!confirm(t("deleteCategoryConfirm"))) return;
                      startTransition(async () => {
                        await deleteCategory(cat.id);
                      });
                    }}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                <ul className="mt-1 divide-y divide-border/60">
                  {catItems.map((item) =>
                    editingItem === item.id ? (
                      <li key={item.id} className="py-3">
                        <ItemForm
                          draft={draft}
                          setDraft={setDraft}
                          pending={pending}
                          onSave={() => persistItem(cat.id, item.id)}
                          onCancel={() => {
                            setEditingItem(null);
                            setDraft(emptyDraft);
                          }}
                        />
                      </li>
                    ) : (
                      <li
                        key={item.id}
                        className="flex items-baseline gap-3 py-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p
                            className={
                              item.is_available
                                ? "font-medium"
                                : "font-medium text-muted-foreground line-through"
                            }
                          >
                            {localizedText(item.name, locale)}
                          </p>
                          {localizedText(item.description, locale) ? (
                            <p className="mt-0.5 text-sm text-muted-foreground">
                              {localizedText(item.description, locale)}
                            </p>
                          ) : null}
                        </div>
                        <span className="shrink-0 text-sm tabular-nums">
                          {formatPrice(item.price_cents, locale, item.currency)}
                        </span>
                        <div className="flex shrink-0 gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={t("save")}
                            onClick={() => {
                              setEditingItem(item.id);
                              setAddingIn(null);
                              setDraft({
                                nameDe: item.name?.de ?? "",
                                nameEn: item.name?.en ?? "",
                                descDe: item.description?.de ?? "",
                                descEn: item.description?.en ?? "",
                                price: fromCents(item.price_cents),
                                isAvailable: item.is_available,
                              });
                            }}
                            className="text-muted-foreground"
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={t("delete")}
                            disabled={pending}
                            onClick={() => {
                              if (!confirm(t("deleteItemConfirm"))) return;
                              startTransition(async () => {
                                await deleteItem(item.id);
                              });
                            }}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </li>
                    )
                  )}
                </ul>

                {catItems.length === 0 && addingIn !== cat.id ? (
                  <p className="py-3 text-sm text-muted-foreground">
                    {t("noItems")}
                  </p>
                ) : null}

                {addingIn === cat.id ? (
                  <div className="mt-3">
                    <ItemForm
                      draft={draft}
                      setDraft={setDraft}
                      pending={pending}
                      onSave={() => persistItem(cat.id)}
                      onCancel={() => {
                        setAddingIn(null);
                        setDraft(emptyDraft);
                      }}
                    />
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 h-10"
                    onClick={() => {
                      setAddingIn(cat.id);
                      setEditingItem(null);
                      setDraft(emptyDraft);
                    }}
                  >
                    <Plus className="size-3.5" />
                    {t("addItem")}
                  </Button>
                )}
              </motion.section>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
