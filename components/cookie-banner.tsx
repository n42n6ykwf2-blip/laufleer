"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "laufleer.cookies.acknowledged";

export function CookieBanner() {
  const t = useTranslations("cookies");
  const reduce = useReducedMotion();
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      // Shaxsiy rejim yoki bloklangan saqlash — bannerni ko'rsatmaymiz
    }
  }, []);

  const dismiss = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* e'tiborsiz */
    }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          role="region"
          aria-label="Cookies"
          initial={reduce ? false : { y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 320, damping: 34 }}
          className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-1px_12px_rgba(0,0,0,0.04)]"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t("message")}
            </p>
            <Button onClick={dismiss} className="h-11 shrink-0 sm:h-9">
              {t("acknowledge")}
            </Button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
