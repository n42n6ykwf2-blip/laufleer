"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  return (
    <div className="inline-flex rounded-md border border-border bg-card overflow-hidden text-sm">
      {routing.locales.map((code) => (
        <button
          key={code}
          type="button"
          disabled={pending}
          onClick={() => {
            if (code === locale) return;
            startTransition(() => {
              router.replace(pathname, { locale: code });
            });
          }}
          className={cn(
            "px-3 py-1.5 font-medium uppercase transition-colors",
            code === locale
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted"
          )}
          aria-current={code === locale ? "true" : undefined}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
