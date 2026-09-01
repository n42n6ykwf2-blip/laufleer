"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { LogOut, UserRound } from "lucide-react";
import { useRouter, Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { customerSignOut } from "@/lib/actions/customer";

/**
 * Sarlavhadagi kichik hisob boshqaruvi.
 * Kirmagan bo'lsa — "Anmelden", kirgan bo'lsa — kabinet va chiqish.
 */
export function AccountMenu({ signedIn }: { signedIn: boolean }) {
  const t = useTranslations("account");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (!signedIn) {
    return (
      <Button asChild variant="ghost" size="sm" className="h-9 gap-1.5 px-2.5">
        <Link href="/account/login">
          <UserRound className="size-4" />
          <span className="hidden sm:inline">{t("signIn")}</span>
        </Link>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-0.5">
      <Button asChild variant="ghost" size="sm" className="h-9 gap-1.5 px-2.5">
        <Link href="/account">
          <UserRound className="size-4" />
          <span className="hidden sm:inline">{t("nav")}</span>
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={t("signOut")}
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await customerSignOut();
            router.push("/");
            router.refresh();
          })
        }
        className="size-9 text-muted-foreground"
      >
        <LogOut className="size-4" />
      </Button>
    </div>
  );
}
