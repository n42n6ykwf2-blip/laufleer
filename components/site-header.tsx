import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/language-switcher";

export async function SiteHeader() {
  const app = await getTranslations("app");
  const demo = await getTranslations("demo");

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur-[2px] supports-[backdrop-filter]:bg-background/85">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <Link
            href="/"
            className="group flex items-baseline gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <span className="font-heading text-xl font-semibold tracking-tight text-primary sm:text-[1.375rem]">
              {app("name")}
            </span>
            <span className="hidden text-xs text-muted-foreground lg:inline">
              {app("tagline")}
            </span>
          </Link>

          {/* Loyiha ishga tushmagani doimiy ko'rinib tursin */}
          <Badge
            variant="outline"
            title={demo("notice")}
            className="shrink-0 rounded-full border-primary/35 bg-primary/8 text-[0.625rem] font-medium tracking-wide text-primary uppercase"
          >
            {demo("badge")}
          </Badge>
        </div>

        <LanguageSwitcher />
      </div>
    </header>
  );
}
