-- Laufleer MVP — birinchi migratsiya
-- Sxema: restoranlar, menyu, stollar, rezervatsiyalar
-- RLS: anon o'qish uchun, yozish faqat service-role bilan (server actiondan)

create extension if not exists "pgcrypto";

-- ============================================================
-- restaurants
-- ============================================================
create table if not exists restaurants (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,
  name           text not null,
  cuisine        text,
  description    jsonb not null default '{}'::jsonb,   -- {de, en}
  street         text,
  house_number   text,
  postal_code    text,
  city           text,
  country        text not null default 'DE',
  phone          text,                                 -- E.164
  cover_image_url text,
  opening_hours  jsonb not null default '{}'::jsonb,   -- {mon:[{open,close}], ...}
  timezone       text not null default 'Europe/Berlin',
  created_at     timestamptz not null default now()
);

create index if not exists restaurants_city_idx on restaurants (city);

-- ============================================================
-- menu_categories
-- ============================================================
create table if not exists menu_categories (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  name          jsonb not null default '{}'::jsonb,    -- {de, en}
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists menu_categories_restaurant_idx
  on menu_categories (restaurant_id, sort_order);

-- ============================================================
-- menu_items
-- ============================================================
create table if not exists menu_items (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  category_id   uuid not null references menu_categories(id) on delete cascade,
  name          jsonb not null default '{}'::jsonb,    -- {de, en}
  description   jsonb not null default '{}'::jsonb,    -- {de, en}
  price_cents   int not null check (price_cents >= 0),
  currency      text not null default 'EUR',
  image_url     text,
  is_available  boolean not null default true,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists menu_items_category_idx
  on menu_items (category_id, sort_order);

-- ============================================================
-- restaurant_tables
-- ============================================================
create table if not exists restaurant_tables (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  label         text not null,
  capacity      int not null check (capacity > 0),
  created_at    timestamptz not null default now()
);

create index if not exists restaurant_tables_restaurant_idx
  on restaurant_tables (restaurant_id, capacity);

-- ============================================================
-- reservations
-- ============================================================
create table if not exists reservations (
  id             uuid primary key default gen_random_uuid(),
  restaurant_id  uuid not null references restaurants(id) on delete cascade,
  table_id       uuid references restaurant_tables(id) on delete set null,
  guest_name     text not null,
  guest_phone    text,
  guest_email    text,
  party_size     int not null check (party_size between 1 and 20),
  reservation_at timestamptz not null,
  duration_min   int not null default 90 check (duration_min > 0),
  status         text not null default 'confirmed'
                 check (status in ('pending','confirmed','cancelled')),
  notes          text,
  created_at     timestamptz not null default now(),
  constraint reservations_contact_present
    check (guest_phone is not null or guest_email is not null)
);

create index if not exists reservations_restaurant_time_idx
  on reservations (restaurant_id, reservation_at);
create index if not exists reservations_table_time_idx
  on reservations (table_id, reservation_at)
  where table_id is not null;

-- ============================================================
-- Row Level Security
-- ============================================================
alter table restaurants        enable row level security;
alter table menu_categories    enable row level security;
alter table menu_items         enable row level security;
alter table restaurant_tables  enable row level security;
alter table reservations       enable row level security;

-- Anon o'qish: hamma jamoat ma'lumotlarini ko'ra oladi
create policy "public read restaurants"
  on restaurants for select using (true);

create policy "public read menu_categories"
  on menu_categories for select using (true);

create policy "public read menu_items"
  on menu_items for select using (true);

create policy "public read restaurant_tables"
  on restaurant_tables for select using (true);

-- reservations: SELECT/INSERT/UPDATE/DELETE hech qanday policy yo'q
-- => anon key hech nima qila olmaydi
-- => faqat service-role kaliti (server action ichida) yozadi
