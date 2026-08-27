"use client";

import * as React from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Umumiy animatsiya primitivlari.
 * Hammasi `prefers-reduced-motion` ni hurmat qiladi — foydalanuvchi
 * harakatni kamaytirsa, elementlar animatsiyasiz darhol ko'rinadi.
 */

const EASE = [0.22, 0.61, 0.36, 1] as const;

export function FadeIn({
  children,
  className,
  delay = 0,
  y = 12,
  as: Component = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "section" | "li" | "header";
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[Component];

  return (
    <MotionTag
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE, delay }}
    >
      {children}
    </MotionTag>
  );
}

/** Ro'yxat konteyneri — bolalarni ketma-ket paydo qiladi */
export function Stagger({
  children,
  className,
  gap = 0.06,
}: {
  children: React.ReactNode;
  className?: string;
  gap?: number;
}) {
  const reduce = useReducedMotion();

  const variants: Variants = {
    hidden: {},
    show: {
      transition: { staggerChildren: reduce ? 0 : gap },
    },
  };

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  );
}

/** Stagger ichidagi element */
export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();

  const variants: Variants = {
    hidden: reduce ? { opacity: 1 } : { opacity: 0, y: 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: EASE },
    },
  };

  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}

/** Ekranga kirganda paydo bo'ladi — uzun sahifalar uchun */
export function InView({
  children,
  className,
  y = 16,
}: {
  children: React.ReactNode;
  className?: string;
  y?: number;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-64px" }}
      transition={{ duration: 0.55, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Bosilganda biroz kichrayadigan interaktiv o'ram */
export function Pressable({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={cn("touch-manipulation", className)}
      whileTap={reduce ? undefined : { scale: 0.985 }}
      transition={{ duration: 0.15, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
