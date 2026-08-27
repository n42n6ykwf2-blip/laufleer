import { useTranslations } from "next-intl";
import type { OpeningHours, WeekdayKey } from "@/lib/types";

const ORDER: WeekdayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export function OpeningHoursList({ hours }: { hours: OpeningHours }) {
  const t = useTranslations("weekday");
  const closed = useTranslations("restaurantPage")("closed");

  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
      {ORDER.map((day) => {
        const slots = hours[day];
        return (
          <div key={day} className="contents">
            <dt className="text-muted-foreground">{t(day)}</dt>
            <dd>
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
