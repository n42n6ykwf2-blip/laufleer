"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { LogOut } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions/auth";

export function SignOutButton() {
  const t = useTranslations("partner.profile");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await signOut();
          router.push("/partner");
          router.refresh();
        })
      }
      className="gap-1.5 text-muted-foreground"
    >
      <LogOut className="size-3.5" />
      {t("signOut")}
    </Button>
  );
}
