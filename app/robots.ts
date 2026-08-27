import type { MetadataRoute } from "next";

/**
 * Loyiha hali ishga tushmagan — qidiruv tizimlariga to'liq yopiq.
 * Ishga tushirishdan oldin bu faylni ochib qo'yish kerak
 * (va layout.tsx dagi `robots: { index: false }` ni olib tashlash).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: "/",
      },
    ],
  };
}
