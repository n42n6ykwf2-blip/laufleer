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
    .map((cat) => ({
      category: cat,
      items: items
        .filter((i) => i.category_id === cat.id && i.is_available)
        .sort((a, b) => a.sort_order - b.sort_order),
    }))
    .filter((g) => g.items.length > 0);

  if (grouped.length === 0) {
    return null;
  }

  return (
    <div className="space-y-10">
      {grouped.map(({ category, items }) => (
        <section key={category.id}>
          <h3 className="text-xl font-semibold mb-4 border-b border-border pb-2">
            {localizedText(category.name, locale)}
          </h3>
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li key={item.id} className="py-4 flex gap-4 items-start">
                <div className="flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-medium">
                      {localizedText(item.name, locale)}
                    </p>
                    <p className="whitespace-nowrap font-semibold text-primary">
                      {formatPrice(item.price_cents, locale, item.currency)}
                    </p>
                  </div>
                  {localizedText(item.description, locale) ? (
                    <p className="text-sm text-muted-foreground mt-1">
                      {localizedText(item.description, locale)}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
