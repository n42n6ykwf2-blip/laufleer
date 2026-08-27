import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { localizedText } from "@/lib/format";
import type { Restaurant } from "@/lib/types";
import type { Locale } from "@/i18n/routing";

interface Props {
  restaurant: Restaurant;
  locale: Locale;
  ctaLabel: string;
}

export function RestaurantCard({ restaurant, locale, ctaLabel }: Props) {
  const description = localizedText(restaurant.description, locale);
  return (
    <Link href={`/r/${restaurant.slug}`} className="block group">
      <Card className="overflow-hidden transition-shadow group-hover:shadow-md h-full flex flex-col">
        <div className="relative aspect-[16/10] bg-muted">
          {restaurant.cover_image_url ? (
            <Image
              src={restaurant.cover_image_url}
              alt={restaurant.name}
              fill
              sizes="(min-width: 768px) 33vw, 100vw"
              className="object-cover"
            />
          ) : null}
        </div>
        <div className="p-5 flex flex-col gap-2 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg leading-tight">
              {restaurant.name}
            </h3>
            {restaurant.cuisine ? (
              <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {restaurant.cuisine}
              </span>
            ) : null}
          </div>
          {restaurant.city ? (
            <p className="text-sm text-muted-foreground">{restaurant.city}</p>
          ) : null}
          {description ? (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {description}
            </p>
          ) : null}
          <p className="mt-auto pt-3 text-sm font-medium text-primary">
            {ctaLabel} →
          </p>
        </div>
      </Card>
    </Link>
  );
}
