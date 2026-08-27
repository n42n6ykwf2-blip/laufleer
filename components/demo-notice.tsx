import { getTranslations } from "next-intl/server";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "notice" | "bookingWarning" | "successWarning";

/**
 * Loyiha ishga tushmaganini ochiq aytadigan xabar.
 * Band qilish oqimida ko'rsatilishi muhim — aks holda foydalanuvchi
 * haqiqiy stol band qildim deb o'ylab qolishi mumkin.
 */
export async function DemoNotice({
  variant = "notice",
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  const t = await getTranslations("demo");

  return (
    <div
      role="note"
      className={cn(
        "flex gap-2.5 rounded-lg border border-primary/25 bg-primary/6 p-3.5",
        className
      )}
    >
      <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
      <div className="min-w-0 text-sm leading-relaxed">
        <span className="font-medium">{t("title")}</span>{" "}
        <span className="text-muted-foreground">{t(variant)}</span>
      </div>
    </div>
  );
}
