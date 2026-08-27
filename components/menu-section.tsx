import { formatPrice, localizedText } from "@/lib/format";
import type { MenuCategory, MenuItem } from "@/lib/types";
import type { Locale } from "@/i18n/routing";

interface Props {
  categories: MenuCategory[];
  items: MenuItem[];
  locale: Locale;
}

export function MenuSection({ categories, items, locale }: Props) {
  const grouped = categories
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((category) => ({
      category,
      items: items
        .filter((i) => i.category_id === category.id && i.is_available)
        .sort((a, b) => a.sort_order - b.sort_order),
    }))
    .filter((g) => g.items.length > 0);

  if (grouped.length === 0) return null;

  return (
    <div className="space-y-12">
      {grouped.map(({ category, items }) => (
        <section key={category.id}>
          <h3 className="eyebrow border-b border-border/70 pb-2.5">
            {localizedText(category.name, locale)}
          </h3>

          <ul className="mt-1">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-baseline gap-4 border-b border-border/40 py-4 last:border-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-heading text-lg leading-snug font-medium">
                    {localizedText(item.name, locale)}
                  </p>
                  {localizedText(item.description, locale) ? (
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {localizedText(item.description, locale)}
                    </p>
                  ) : null}
                </div>

                <p className="shrink-0 text-sm font-medium tabular-nums">
                  {formatPrice(item.price_cents, locale, item.currency)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
