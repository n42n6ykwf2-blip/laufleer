"use server";

import { cookies } from "next/headers";
import { PARTNER_COOKIE, partnerAccessCode } from "@/lib/partner-gate";

export async function verifyPartnerCode(
  code: string
): Promise<{ ok: boolean }> {
  const expected = partnerAccessCode();
  if (!expected) return { ok: true }; // to'siq o'chirilgan (lokal)

  if (code.trim() !== expected) return { ok: false };

  const store = await cookies();
  store.set(PARTNER_COOKIE, expected, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 kun
  });

  return { ok: true };
}
