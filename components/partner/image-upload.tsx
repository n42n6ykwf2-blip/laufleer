"use client";

import * as React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const BUCKET = "restaurant-images";

interface Props {
  value: string;
  onChange: (url: string) => void;
}

export function ImageUpload({ value, onChange }: Props) {
  const t = useTranslations("partner.profile");
  const te = useTranslations("partner.profileErrors");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);

    if (!ALLOWED.includes(file.type)) {
      setError(te("imageWrongType"));
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(te("imageTooLarge"));
      return;
    }

    setUploading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("not authenticated");

      // Papka nomi foydalanuvchi id si — Storage siyosati shunga tayanadi
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/cover-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET).getPublicUrl(path);

      onChange(publicUrl);
    } catch {
      setError(te("uploadFailed"));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      {value ? (
        <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg border border-border bg-muted sm:max-w-md">
          <Image
            src={value}
            alt=""
            fill
            sizes="(min-width: 640px) 28rem, 100vw"
            className="object-cover"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label={t("imageRemove")}
            className="absolute top-2 right-2 rounded-full bg-background/90 p-2 text-foreground shadow-sm transition-colors hover:bg-background"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex aspect-[3/2] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground disabled:opacity-60 sm:max-w-md"
        >
          {uploading ? (
            <Loader2 className="size-6 animate-spin" />
          ) : (
            <ImagePlus className="size-6" />
          )}
          <span className="text-sm font-medium">
            {uploading ? t("imageUploading") : t("imageUpload")}
          </span>
        </button>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {value ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                {t("imageUploading")}
              </>
            ) : (
              t("imageReplace")
            )}
          </Button>
        ) : null}
        <p className="text-xs text-muted-foreground">{t("imageHint")}</p>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED.join(",")}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
