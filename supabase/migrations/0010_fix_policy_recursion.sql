-- Laufleer — RLS rekursiyasini tuzatish
--
-- MUAMMO: 0009 da qo'shilgan "customer reads restaurants of own reservations"
-- siyosati `restaurants` ustida turib `reservations` ni o'qiydi. Ammo
-- `reservations` ning 0007 dagi siyosatlari (`owner reads own reservations`
-- va `owner updates own reservations`) `restaurants` ni o'qiydi.
--
--   restaurants -> reservations -> restaurants -> ...
--
-- Postgres buni cheksiz rekursiya deb topib, butun so'rovni
-- "42P17 infinite recursion detected in policy" xatosi bilan to'xtatadi.
-- Natijada mijozning bronlar ro'yxati bo'sh chiqardi.
--
-- YECHIM: o'sha siyosatni olib tashlaymiz. U faqat bitta chekka holat
-- uchun edi — mijoz TASDIQLANMAGAN restoranda bron qilgan bo'lsa, nomini
-- ko'rsin. Tasdiqlangan restoranlar allaqachon ommaga ochiq
-- ("public read approved restaurants"), shuning uchun asosiy holat ishlaydi.
--
-- Chekka holat ilova tomonida hal qilinadi: so'rovda `restaurants!left(...)`
-- ishlatiladi, shunda restoran nomi o'qilmasa ham bron qatori
-- ro'yxatdan tushib ketmaydi.

drop policy if exists "customer reads restaurants of own reservations"
  on restaurants;
