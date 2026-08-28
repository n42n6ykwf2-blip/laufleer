import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PanelNav } from "@/components/partner/panel-nav";
import { SignOutButton } from "@/components/partner/sign-out-button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function PanelLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/partner/login`);

  const t = await getTranslations({ locale, namespace: "partner.profile" });

  return (
    <div className="mx-auto max-w-3xl px-4 pt-6 pb-16 sm:px-6 sm:pt-10">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {t("signedInAs")} {user.email}
        </p>
        <SignOutButton />
      </div>

      <div className="mb-8">
        <PanelNav />
      </div>

      {children}
    </div>
  );
}
