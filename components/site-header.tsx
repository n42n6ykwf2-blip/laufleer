import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";

export async function SiteHeader() {
  const app = await getTranslations("app");

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur-[2px] supports-[backdrop-filter]:bg-background/85">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
        <Link
          href="/"
          className="group flex items-baseline gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span className="font-heading text-xl font-semibold tracking-tight text-primary sm:text-[1.375rem]">
            {app("name")}
          </span>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            {app("tagline")}
          </span>
        </Link>

        <LanguageSwitcher />
      </div>
    </header>
  );
}
