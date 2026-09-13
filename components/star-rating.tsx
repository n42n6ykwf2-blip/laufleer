"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const STARS = [1, 2, 3, 4, 5] as const;

/**
 * Yulduzli reyting.
 * `onChange` berilmasa — faqat ko'rsatadi; berilsa — tanlash mumkin
 * (radiogroup, har tugma kamida 40px teginish maydoni).
 */
export function StarRating({
  value,
  onChange,
  size = "sm",
  label,
}: {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
  label?: string;
}) {
  const icon = size === "lg" ? "size-7" : size === "md" ? "size-5" : "size-4";
  const filled = (n: number) =>
    n <= Math.round(value)
      ? "fill-primary text-primary"
      : "fill-transparent text-muted-foreground/40";

  if (!onChange) {
    return (
      <span
        role="img"
        aria-label={label}
        className="inline-flex items-center gap-0.5"
      >
        {STARS.map((n) => (
          <Star key={n} className={cn(icon, filled(n))} aria-hidden />
        ))}
      </span>
    );
  }

  return (
    <div role="radiogroup" aria-label={label} className="inline-flex gap-0.5">
      {STARS.map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} / 5`}
          onClick={() => onChange(n)}
          className="rounded-md p-1.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Star className={cn(icon, filled(n))} aria-hidden />
        </button>
      ))}
    </div>
  );
}
