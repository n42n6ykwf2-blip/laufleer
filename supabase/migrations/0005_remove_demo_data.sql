-- Laufleer — namunaviy ma'lumotlarni butunlay olib tashlash
--
-- Yo'nalish o'zgardi: platformada faqat haqiqiy restoranlar bo'ladi,
-- ular tizimga o'zlari ro'yxatdan o'tib qo'shiladi.
-- Seed migratsiyalari (0002, 0004) repodan olib tashlandi; bu migratsiya
-- allaqachon bazaga tushgan namunaviy yozuvlarni tozalaydi.
--
-- menu_categories, menu_items, restaurant_tables va reservations
-- `on delete cascade` orqali avtomatik o'chadi.

delete from restaurants
where slug in (
  'schnitzelhaus-berlin',
  'osteria-bella-napoli-muenchen',
  'fischmarkt-speisehalle-hamburg',
  -- 0004 hech qachon ishga tushmagan bo'lsa ham, xavfsizlik uchun
  'anatolia-grill-berlin',
  'gruenkern-berlin',
  'koji-sushi-muenchen',
  'hanoi-kueche-hamburg',
  'brauhaus-sankt-martin-koeln',
  'masala-haus-frankfurt',
  'bistro-lumiere-stuttgart',
  'casa-iberica-duesseldorf',
  'taverna-elia-leipzig'
);

-- Sinov paytida yaratilgan rezervatsiyalar (restoranlari o'chgan bo'lsa
-- cascade bilan ketgan; qolgani bo'lsa tozalaymiz)
delete from reservations
where guest_name in ('Anna Schmidt', 'Zweiter Gast', 'Produktion Test');
