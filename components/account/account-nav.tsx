"use client";

import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/account", key: "profile" },
  { href: "/account/bookings", key: "bookings" },
] as const;

export function AccountNav() {
  const t = useTranslations("account.panel");
  const pathname = usePathname();
  const reduce = useReducedMotion();

  return (
    <nav
      aria-label={t("profile")}
      className="-mx-4 overflow-x-auto border-b border-border px-4 sm:mx-0 sm:px-0"
    >
      <ul className="flex min-w-max gap-1 sm:gap-2">
        {ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative block px-3 py-3 text-sm font-medium transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t(item.key)}
                {active ? (
                  <motion.span
                    layoutId="account-nav-underline"
                    className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary"
                    transition={
                      reduce
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 420, damping: 34 }
                    }
                  />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
