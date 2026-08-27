"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const reduce = useReducedMotion();

  return (
    <div
      role="group"
      aria-label="Sprache / Language"
      className="relative inline-flex rounded-md border border-border bg-card p-0.5"
    >
      {routing.locales.map((code) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            disabled={pending}
            onClick={() => {
              if (active) return;
              startTransition(() => {
                router.replace(pathname, { locale: code });
              });
            }}
            aria-current={active ? "true" : undefined}
            className={cn(
              // Mobilda teginish maydoni kamida 36px (WCAG 2.5.8 dan kengroq)
              "relative flex min-h-9 items-center rounded-[5px] px-3 text-xs font-medium uppercase tracking-wide transition-colors sm:min-h-7 sm:px-2.5",
              "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              active
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {active && (
              <motion.span
                layoutId="locale-pill"
                className="absolute inset-0 rounded-[5px] bg-primary"
                transition={
                  reduce
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 420, damping: 34 }
                }
              />
            )}
            <span className="relative z-10">{code}</span>
          </button>
        );
      })}
    </div>
  );
}
