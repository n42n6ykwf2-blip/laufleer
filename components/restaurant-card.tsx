import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { localizedText, priceLevelSymbol } from "@/lib/format";
import type { Restaurant } from "@/lib/types";
import type { Locale } from "@/i18n/routing";

interface Props {
  restaurant: Restaurant;
  locale: Locale;
  featureLabels: Record<string, string>;
  priority?: boolean;
}

export function RestaurantCard({
  restaurant: r,
  locale,
  featureLabels,
  priority = false,
}: Props) {
  const description = localizedText(r.description, locale);
  const price = priceLevelSymbol(r.price_level);
  const place = [r.neighborhood, r.city].filter(Boolean).join(", ");
  const shownFeatures = (r.features ?? []).slice(0, 2);

  return (
    <article className="group">
      <Link
        href={`/r/${r.slug}`}
        className="block rounded-lg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {/* Rasm — editorial nisbat, ustiga gradient qo'yilmaydi */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted sm:aspect-[3/2]">
          {r.cover_image_url ? (
            <Image
              src={r.cover_image_url}
              alt=""
              fill
              priority={priority}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
          ) : null}
        </div>

        <div className="pt-3.5">
          {/* Ustki qator: oshxona turi va narx darajasi */}
          <div className="flex items-baseline justify-between gap-3">
            <span className="eyebrow truncate">{r.cuisine}</span>
            {price ? (
              <span
                className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground"
                aria-label={`${r.price_level} / 4`}
              >
                {price}
              </span>
            ) : null}
          </div>

          <h3 className="mt-1.5 font-heading text-xl leading-tight font-semibold tracking-tight transition-colors group-hover:text-primary">
            {r.name}
          </h3>

          {place ? (
            <p className="mt-1 text-sm text-muted-foreground">{place}</p>
          ) : null}

          {description ? (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}

          {shownFeatures.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {shownFeatures.map((f) => (
                <Badge
                  key={f}
                  variant="secondary"
                  className="rounded-full font-normal"
                >
                  {featureLabels[f] ?? f}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
