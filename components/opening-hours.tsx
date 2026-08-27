import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { OpeningHours, WeekdayKey } from "@/lib/types";

const ORDER: WeekdayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

/** JS getDay(): 0=Yakshanba → bizning kalitlarga moslash */
function todayKey(): WeekdayKey {
  const map: WeekdayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const berlinNow = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Europe/Berlin" })
  );
  return map[berlinNow.getDay()];
}

export function OpeningHoursList({ hours }: { hours: OpeningHours }) {
  const t = useTranslations("weekday");
  const closed = useTranslations("restaurantPage")("closed");
  const today = todayKey();

  return (
    <dl className="space-y-1.5 text-sm">
      {ORDER.map((day) => {
        const slots = hours?.[day];
        const isToday = day === today;
        return (
          <div
            key={day}
            className={cn(
              "flex items-baseline justify-between gap-4",
              isToday && "font-medium text-foreground"
            )}
          >
            <dt className={cn(!isToday && "text-muted-foreground")}>
              {t(day)}
            </dt>
            <dd className={cn("tabular-nums", !isToday && "text-muted-foreground")}>
              {slots && slots.length > 0
                ? slots.map((s, i) => (
                    <span key={i}>
                      {i > 0 ? ", " : ""}
                      {s.open}–{s.close}
                    </span>
                  ))
                : closed}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
