-- Laufleer — sodiqlik tizimi, rezervatsiya holatlari va RLS tezligi
--
-- 1) RLS siyosatlarida auth.uid() (select auth.uid()) ga o'raladi —
--    aks holda u HAR QATOR uchun qayta chaqiriladi (Supabase tavsiyasi)
-- 2) Indekslanmagan tashqi kalit qo'shiladi
-- 3) Rezervatsiyaga 'completed' va 'no_show' holatlari
-- 4) Sodiqlik: hisob, balans va tranzaksiyalar

-- ============================================================
-- 1) Yetishmayotgan tashqi kalit indeksi
-- ============================================================
create index if not exists menu_items_restaurant_idx
  on menu_items (restaurant_id);

-- ============================================================
-- 2) RLS siyosatlarini tezroq shaklga o'tkazish
-- ============================================================
drop policy if exists "owner reads own restaurant"   on restaurants;
drop policy if exists "owner creates own restaurant" on restaurants;
drop policy if exists "owner updates own restaurant" on restaurants;

create policy "owner reads own restaurant"
  on restaurants for select to authenticated
  using (owner_id = (select auth.uid()));

create policy "owner creates own restaurant"
  on restaurants for insert to authenticated
  with check (owner_id = (select auth.uid()));

create policy "owner updates own restaurant"
  on restaurants for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

drop policy if exists "owner manages own menu_categories"   on menu_categories;
drop policy if exists "owner manages own menu_items"        on menu_items;
drop policy if exists "owner manages own restaurant_tables" on restaurant_tables;
drop policy if exists "owner reads own reservations"        on reservations;

create policy "owner manages own menu_categories"
  on menu_categories for all to authenticated
  using (exists (
    select 1 from restaurants r
    where r.id = menu_categories.restaurant_id
      and r.owner_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from restaurants r
    where r.id = menu_categories.restaurant_id
      and r.owner_id = (select auth.uid())
  ));

create policy "owner manages own menu_items"
  on menu_items for all to authenticated
  using (exists (
    select 1 from restaurants r
    where r.id = menu_items.restaurant_id
      and r.owner_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from restaurants r
    where r.id = menu_items.restaurant_id
      and r.owner_id = (select auth.uid())
  ));

create policy "owner manages own restaurant_tables"
  on restaurant_tables for all to authenticated
  using (exists (
    select 1 from restaurants r
    where r.id = restaurant_tables.restaurant_id
      and r.owner_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from restaurants r
    where r.id = restaurant_tables.restaurant_id
      and r.owner_id = (select auth.uid())
  ));

create policy "owner reads own reservations"
  on reservations for select to authenticated
  using (exists (
    select 1 from restaurants r
    where r.id = reservations.restaurant_id
      and r.owner_id = (select auth.uid())
  ));

-- Egasi rezervatsiya holatini o'zgartira olishi kerak
-- (tasdiqlash, bekor qilish, "keldi" deb belgilash)
create policy "owner updates own reservations"
  on reservations for update to authenticated
  using (exists (
    select 1 from restaurants r
    where r.id = reservations.restaurant_id
      and r.owner_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from restaurants r
    where r.id = reservations.restaurant_id
      and r.owner_id = (select auth.uid())
  ));

-- Storage siyosatlari ham xuddi shunday
drop policy if exists "owner uploads own restaurant images" on storage.objects;
create policy "owner uploads own restaurant images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'restaurant-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "owner updates own restaurant images" on storage.objects;
create policy "owner updates own restaurant images"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'restaurant-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "owner deletes own restaurant images" on storage.objects;
create policy "owner deletes own restaurant images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'restaurant-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- ============================================================
-- 3) Rezervatsiya holatlari: kelgan / kelmagan
-- ============================================================
alter table reservations drop constraint if exists reservations_status_check;
alter table reservations add constraint reservations_status_check
  check (status in ('pending', 'confirmed', 'cancelled', 'completed', 'no_show'));

create index if not exists reservations_status_idx
  on reservations (restaurant_id, status);

-- ============================================================
-- 4) Sodiqlik tizimi
-- ============================================================
alter table restaurants
  add column if not exists loyalty_enabled boolean not null default false,
  add column if not exists loyalty_points_per_visit smallint not null default 10
    check (loyalty_points_per_visit between 0 and 1000);

-- Mijoz hisobi — platforma bo'ylab email orqali aniqlanadi
create table if not exists loyalty_accounts (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  name       text,
  phone      text,
  created_at timestamptz not null default now()
);

create unique index if not exists loyalty_accounts_email_key
  on loyalty_accounts (lower(email));

-- Har restoran o'z dasturini yuritadi → balans juftlik bo'yicha
create table if not exists loyalty_balances (
  account_id    uuid not null references loyalty_accounts(id) on delete cascade,
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  points        integer not null default 0 check (points >= 0),
  updated_at    timestamptz not null default now(),
  primary key (account_id, restaurant_id)
);

create index if not exists loyalty_balances_restaurant_idx
  on loyalty_balances (restaurant_id);

-- Ballar tarixi (audit uchun — balans shu yerdan kelib chiqadi)
create table if not exists loyalty_transactions (
  id             uuid primary key default gen_random_uuid(),
  account_id     uuid not null references loyalty_accounts(id) on delete cascade,
  restaurant_id  uuid not null references restaurants(id) on delete cascade,
  reservation_id uuid references reservations(id) on delete set null,
  points         integer not null,          -- + ishlangan, − sarflangan
  kind           text not null check (kind in ('earned', 'redeemed', 'adjusted')),
  note           text,
  created_at     timestamptz not null default now()
);

create index if not exists loyalty_tx_account_idx
  on loyalty_transactions (account_id, created_at desc);
create index if not exists loyalty_tx_restaurant_idx
  on loyalty_transactions (restaurant_id, created_at desc);
create index if not exists loyalty_tx_reservation_idx
  on loyalty_transactions (reservation_id)
  where reservation_id is not null;

-- Bitta rezervatsiya uchun ikki marta ball berilmasin
create unique index if not exists loyalty_tx_one_earn_per_reservation
  on loyalty_transactions (reservation_id)
  where kind = 'earned' and reservation_id is not null;

-- ============================================================
-- 5) Sodiqlik RLS — shaxsiy ma'lumot, ommaga yopiq
-- ============================================================
alter table loyalty_accounts     enable row level security;
alter table loyalty_balances     enable row level security;
alter table loyalty_transactions enable row level security;

-- Restoran egasi faqat o'z dasturidagi balans va tarixni ko'radi
create policy "owner reads own loyalty balances"
  on loyalty_balances for select to authenticated
  using (exists (
    select 1 from restaurants r
    where r.id = loyalty_balances.restaurant_id
      and r.owner_id = (select auth.uid())
  ));

create policy "owner reads own loyalty transactions"
  on loyalty_transactions for select to authenticated
  using (exists (
    select 1 from restaurants r
    where r.id = loyalty_transactions.restaurant_id
      and r.owner_id = (select auth.uid())
  ));

-- Egasi o'z mijozlarining hisob ma'lumotini ko'ra oladi
create policy "owner reads related loyalty accounts"
  on loyalty_accounts for select to authenticated
  using (exists (
    select 1
    from loyalty_balances b
    join restaurants r on r.id = b.restaurant_id
    where b.account_id = loyalty_accounts.id
      and r.owner_id = (select auth.uid())
  ));

-- Yozish faqat server action (service_role) orqali — siyosat berilmaydi
