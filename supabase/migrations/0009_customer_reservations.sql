-- Laufleer — mijoz o'z bronlarini ko'rishi
--
-- Bog'lanish `guest_email` bo'yicha, yangi ustun qo'shilmaydi.
-- Sababi: odam ro'yxatdan o'tishdan oldin mehmon sifatida bron qilgan
-- bo'lishi mumkin — email bo'yicha bog'lasak, o'sha bronlar ham
-- avtomatik ko'rinadi. Sodiqlik ballari bilan bir xil mantiq.
--
-- MUHIM: mijozga UPDATE huquqi ATAYIN berilmaydi. Bersak, u statusni
-- 'completed' qilib o'ziga sodiqlik ballari yozib olardi. Bekor qilish
-- faqat server action orqali (service_role), u yerda barcha shartlar
-- tekshiriladi.

-- Email bo'yicha qidirish uchun indeks
create index if not exists reservations_guest_email_idx
  on reservations (lower(guest_email));

-- Mijoz faqat O'QIY oladi
create policy "customer reads own reservations"
  on reservations for select to authenticated
  using (
    reservations.guest_email is not null
    and exists (
      select 1 from customers c
      where c.user_id = (select auth.uid())
        and lower(c.email) = lower(reservations.guest_email)
    )
  );

-- Mijoz bron qilgan restoran nomini ko'rishi kerak.
-- Tasdiqlanmagan (draft/pending) restoranda bron qilgan bo'lsa ham
-- nomini ko'rsin — aks holda ro'yxatda bo'sh qator chiqadi.
create policy "customer reads restaurants of own reservations"
  on restaurants for select to authenticated
  using (exists (
    select 1
    from reservations r
    join customers c on lower(c.email) = lower(r.guest_email)
    where r.restaurant_id = restaurants.id
      and c.user_id = (select auth.uid())
  ));
