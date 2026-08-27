# Laufleer — MVP 1-bosqich

**Germaniya bozori** uchun restoran boshqaruv platformasi. Bu birinchi bosqich mijozning uchdan-uchgacha oqimini qamrab oladi: restoran topish → menyu ko'rish → stol band qilish. Autentifikatsiya yo'q, buyurtma yo'q, sodiqlik dasturi yo'q — ular keyingi bosqichlarga.

## Texnologik stek

- **Next.js 16** (App Router, React Server Components, TypeScript)
- **Supabase** (Postgres, EU regioni — Frankfurt)
- **Tailwind CSS v4**
- **next-intl** (nemis + ingliz, `de` — standart)
- **Zod** + **react-hook-form** validatsiya uchun
- **react-phone-number-input** — dunyodagi barcha telefon raqamlar
- **date-fns** + **date-fns-tz** (`Europe/Berlin`)
- **Vercel** (Frankfurt regioni)

## Loyihani lokal ishga tushirish

### 1. Supabase loyiha yaratish

1. https://supabase.com ga kiring va yangi loyiha yarating.
2. **Muhim:** region — `Frankfurt (eu-central-1)` ni tanlang (GDPR uchun).
3. Loyiha yaratilgach, **SQL Editor** ochib, quyidagi tartibda ishga tushiring:
   - `supabase/migrations/0001_init.sql` — jadval, RLS
   - `supabase/migrations/0002_seed.sql` — 3 ta demo restoran
4. **Settings → API** dan quyidagilarni oling:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` kalit → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` kalit → `SUPABASE_SERVICE_ROLE_KEY` (**maxfiy!**)

### 2. Muhit o'zgaruvchilari

```bash
cp .env.local.example .env.local
# .env.local ni ochib, Supabase qiymatlarini kiriting
```

### 3. Ishga tushirish

```bash
npm install
npm run dev
```

Brauzer: http://localhost:3000 (avtomatik `/de` ga yo'naltiradi).

## Loyiha strukturasi

```
app/[locale]/
  page.tsx                          # restoranlar ro'yxati (kirish nuqtasi 1)
  r/[slug]/page.tsx                 # restoran + menyu (kirish nuqtasi 2 — to'g'ridan-to'g'ri link)
  r/[slug]/book/page.tsx            # band qilish formasi
  r/[slug]/book/success/page.tsx    # tasdiqlash
  impressum/page.tsx                # § 5 TMG uchun placeholder
  datenschutz/page.tsx              # DSGVO Art. 13 uchun placeholder
components/
  restaurant-card.tsx, menu-section.tsx, booking-form.tsx,
  opening-hours.tsx, language-switcher.tsx, cookie-banner.tsx
  ui/                               # oddiy Tailwind komponentlari
lib/
  supabase/server.ts                # anon RSC klient
  supabase/admin.ts                 # service-role klient (faqat server action)
  actions/create-reservation.ts     # bandlik mantiqi bilan server action
  validation/reservation.ts         # Zod sxemasi
  format.ts, types.ts, utils.ts
i18n/
  routing.ts, request.ts, navigation.ts
messages/
  de.json                           # NEMIS — haqiqat manbasi
  en.json                           # inglizcha tarjima
supabase/migrations/
  0001_init.sql                     # sxema + RLS
  0002_seed.sql                     # 3 demo restoran
```

## Kirish oqimlari

Mijoz stol band qilishning ikki yo'li mavjud (boshqasi yo'q):
1. **Ilova ichida**: `/de` (yoki `/en`) → restoran kartochkasi → "Menü ansehen" → "Tisch reservieren".
2. **To'g'ridan-to'g'ri link**: `https://laufleer.app/de/r/schnitzelhaus-berlin` (QR-kod yoki ulashilgan URL) → to'g'ridan-to'g'ri restoran sahifasi.

Har ikkalasi ham bir xil `createReservation` server actionidan o'tadi.

## Bandlik mantiqi (MVP)

`lib/actions/create-reservation.ts` ichida:
1. `capacity >= party_size` bo'lgan stollarni yuklaydi.
2. `[reservation_at, reservation_at + 90 daqiqa)` oralig'ida kesishmagan stolni tanlaydi.
3. Eng kichik sig'imli bo'sh stolni oladi (isrofni kamaytirish).
4. Bo'sh stol yo'q bo'lsa — `noTableAvailable` xatosini qaytaradi.

## Vercel'ga deploy

1. GitHub'ga push:
   ```bash
   git add .
   git commit -m "Laufleer MVP: discover, menu, book"
   git push
   ```
2. https://vercel.com da **Import Project** → GitHub repositoriyasini tanlang.
3. **Framework**: Next.js (avtomatik topiladi).
4. **Environment Variables**: `.env.local` dagi uchtasini qo'shing.
5. **Region**: `Frankfurt, Germany (fra1)`.
6. Deploy.

## GDPR bazasi (bu bosqichda bajarilgan)

- Cookie banner (`components/cookie-banner.tsx`) — faqat texnik cookie, tracker yo'q.
- `/impressum` va `/datenschutz` marshrutlari (placeholder matn bilan).
- Band qilish formasi ma'lumotni minimallashtiradi: ism + (telefon YOKI email) + kishilar soni + vaqt.
- Google Fonts `next/font` orqali o'zimizda xost qilinadi (uchinchi tomon IP oqib ketishi yo'q).
- Ma'lumotlar EU'da qoladi (Supabase EU + Vercel fra1).

## Keyingi bosqichlar (bu MVP dan tashqarida)

Restoran admin paneli, sodiqlik dasturi, buyurtma/yetkazib berish, to'lovlar, mijoz hisoblari, restoran qidiruvi/filtrlari, sharhlar, ish vaqtini majburlash, SMS/email xabarnomalar, Impressum/Datenschutz to'liq matni.
