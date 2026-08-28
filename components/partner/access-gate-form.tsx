"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Loader2, Lock } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { verifyPartnerCode } from "@/lib/actions/partner-gate";

export function AccessGateForm({ next }: { next: string }) {
  const t = useTranslations("partner.gate");
  const router = useRouter();
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(false);
        startTransition(async () => {
          const result = await verifyPartnerCode(code);
          if (result.ok) {
            // `next` proxy tomonidan berilgan ichki yo'l — tashqi manzil emas
            router.replace(next.replace(/^\/(de|en)/, "") || "/partner");
            router.refresh();
          } else {
            setError(true);
          }
        });
      }}
      className="space-y-5"
    >
      <div className="flex size-11 items-center justify-center rounded-full bg-muted">
        <Lock className="size-5 text-muted-foreground" />
      </div>

      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {t("heading")}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t("text")}
        </p>
      </div>

      <div>
        <Label htmlFor="code" className="mb-2">
          {t("codeLabel")}
        </Label>
        <Input
          id="code"
          type="password"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoComplete="off"
          className="h-12 sm:h-11"
        />
        {error ? (
          <p className="mt-2 text-sm text-destructive">{t("wrongCode")}</p>
        ) : null}
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={pending || !code}
        className="h-12 w-full text-base"
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            {t("submitting")}
          </>
        ) : (
          t("submit")
        )}
      </Button>
    </form>
  );
}
