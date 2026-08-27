-- Laufleer — restoran egaligi, tekshiruv holati va xavfsizlik
--
-- Restoranlar tizimga o'zlari ro'yxatdan o'tadi (Supabase Auth, email+parol).
-- Yangi profil `draft` holatida yaratiladi, egasi uni tekshiruvga yuboradi
-- (`pending`), admin tasdiqlagach (`approved`) ommaviy ro'yxatda ko'rinadi.

-- ============================================================
-- 1) Egalik va holat ustunlari
-- ============================================================
alter table restaurants
  add column if not exists owner_id uuid references auth.users(id) on delete cascade,
  add column if not exists status text not null default 'draft'
    check (status in ('draft', 'pending', 'approved', 'rejected')),
  add column if not exists rejection_reason text,
  add column if not exists submitted_at timestamptz,
  add column if not exists reviewed_at timestamptz;

-- Bir egaga bitta restoran (MVP cheklovi)
create unique index if not exists restaurants_owner_unique
  on restaurants (owner_id) where owner_id is not null;

create index if not exists restaurants_status_idx on restaurants (status);

-- ============================================================
-- 2) Egasi statusni o'zi tasdiqlay olmasligi kerak
--    Faqat draft/rejected -> pending o'tishiga ruxsat.
--    service_role (admin) orqali kelgan so'rovlarda auth.uid() bo'sh —
--    ular hech qanday cheklovsiz o'tadi.
-- ============================================================
create or replace function protect_restaurant_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new;                       -- service_role / admin yo'li
  end if;

  if new.status is distinct from old.status then
    if not (old.status in ('draft', 'rejected') and new.status = 'pending') then
      new.status := old.status;       -- ruxsatsiz o'zgarish bekor qilinadi
    end if;
  end if;

  -- Egasi tekshiruv maydonlarini o'zgartira olmaydi
  new.rejection_reason := old.rejection_reason;
  new.reviewed_at      := old.reviewed_at;
  new.owner_id         := old.owner_id;

  return new;
end;
$$;

drop trigger if exists trg_protect_restaurant_status on restaurants;
create trigger trg_protect_restaurant_status
  before update on restaurants
  for each row execute function protect_restaurant_status();

-- ============================================================
-- 3) RLS — restaurants
--    Ommaga faqat tasdiqlangan restoranlar ko'rinadi.
-- ============================================================
drop policy if exists "public read restaurants" on restaurants;

create policy "public read approved restaurants"
  on restaurants for select
  using (status = 'approved');

create policy "owner reads own restaurant"
  on restaurants for select
  to authenticated
  using (owner_id = auth.uid());

create policy "owner creates own restaurant"
  on restaurants for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy "owner updates own restaurant"
  on restaurants for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- ============================================================
-- 4) RLS — menyu va stollar
--    Ommaga: faqat tasdiqlangan restoranniki.
--    Egasiga: o'z restoraniniki to'liq.
-- ============================================================
drop policy if exists "public read menu_categories"   on menu_categories;
drop policy if exists "public read menu_items"        on menu_items;
drop policy if exists "public read restaurant_tables" on restaurant_tables;

create policy "public read approved menu_categories"
  on menu_categories for select
  using (exists (
    select 1 from restaurants r
    where r.id = menu_categories.restaurant_id and r.status = 'approved'
  ));

create policy "owner manages own menu_categories"
  on menu_categories for all
  to authenticated
  using (exists (
    select 1 from restaurants r
    where r.id = menu_categories.restaurant_id and r.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from restaurants r
    where r.id = menu_categories.restaurant_id and r.owner_id = auth.uid()
  ));

create policy "public read approved menu_items"
  on menu_items for select
  using (exists (
    select 1 from restaurants r
    where r.id = menu_items.restaurant_id and r.status = 'approved'
  ));

create policy "owner manages own menu_items"
  on menu_items for all
  to authenticated
  using (exists (
    select 1 from restaurants r
    where r.id = menu_items.restaurant_id and r.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from restaurants r
    where r.id = menu_items.restaurant_id and r.owner_id = auth.uid()
  ));

create policy "public read approved restaurant_tables"
  on restaurant_tables for select
  using (exists (
    select 1 from restaurants r
    where r.id = restaurant_tables.restaurant_id and r.status = 'approved'
  ));

create policy "owner manages own restaurant_tables"
  on restaurant_tables for all
  to authenticated
  using (exists (
    select 1 from restaurants r
    where r.id = restaurant_tables.restaurant_id and r.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from restaurants r
    where r.id = restaurant_tables.restaurant_id and r.owner_id = auth.uid()
  ));

-- ============================================================
-- 5) RLS — rezervatsiyalar
--    Egasi o'z restoranidagi bandliklarni ko'ra oladi.
--    Yozish hamon faqat server action (service_role) orqali.
-- ============================================================
create policy "owner reads own reservations"
  on reservations for select
  to authenticated
  using (exists (
    select 1 from restaurants r
    where r.id = reservations.restaurant_id and r.owner_id = auth.uid()
  ));

-- ============================================================
-- 6) Rasm saqlash — Supabase Storage (EU regioni)
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'restaurant-images',
  'restaurant-images',
  true,
  5242880,                                   -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do nothing;

-- Rasmlarni hamma ko'ra oladi (ommaviy sahifada kerak)
drop policy if exists "public read restaurant images" on storage.objects;
create policy "public read restaurant images"
  on storage.objects for select
  using (bucket_id = 'restaurant-images');

-- Yuklash: faqat tizimga kirgan foydalanuvchi, o'z papkasiga.
-- Papka nomi = foydalanuvchi id si (masalan "<uid>/cover.webp").
drop policy if exists "owner uploads own restaurant images" on storage.objects;
create policy "owner uploads own restaurant images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'restaurant-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "owner updates own restaurant images" on storage.objects;
create policy "owner updates own restaurant images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'restaurant-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "owner deletes own restaurant images" on storage.objects;
create policy "owner deletes own restaurant images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'restaurant-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
