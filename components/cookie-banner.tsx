"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "laufleer.cookies.acknowledged";

export function CookieBanner() {
  const t = useTranslations("cookies");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card p-4 shadow-lg"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">{t("message")}</p>
        <Button
          size="sm"
          onClick={() => {
            window.localStorage.setItem(STORAGE_KEY, "1");
            setVisible(false);
          }}
        >
          {t("acknowledge")}
        </Button>
      </div>
    </div>
  );
}
