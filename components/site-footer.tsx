import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function SiteFooter() {
  const t = await getTranslations("nav");
  const app = await getTranslations("app");
  const partner = await getTranslations("partner");

  return (
    <footer className="mt-20 border-t border-border/70">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs">
            <p className="font-heading text-lg font-semibold tracking-tight text-primary">
              {app("name")}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {app("description")}
            </p>
          </div>

          <nav className="flex flex-col gap-3 text-sm sm:items-end">
            <Link
              href="/partner"
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              {partner("nav")}
            </Link>
            <Link
              href="/impressum"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("impressum")}
            </Link>
            <Link
              href="/datenschutz"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("datenschutz")}
            </Link>
          </nav>
        </div>

        <p className="mt-10 border-t border-border/70 pt-6 text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {app("name")}
        </p>
      </div>
    </footer>
  );
}
