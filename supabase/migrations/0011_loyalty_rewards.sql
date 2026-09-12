-- Laufleer — sodiqlik chegirmasi (bronda avtomatik qo'llanadi)
--
-- Kod tizimi ATAYIN yo'q: mijoz kod ko'rsatmaydi, restoran qo'lda
-- kiritmaydi. Chegirma bron qilishda avtomatik bronga bog'lanadi.
--
-- Aylana: har tashrif +1 ball, 10 ballda 10% chegirma, chegirma
-- yaratilganda ball ayiriladi, balans 0 ga tushadi va yana yig'iladi.
--
-- Chegirma hayot sikli:
--   active   -> chegirma tayyor, bronga bog'lanmagan
--   reserved -> bronga bog'langan, tashrif hali bo'lmagan
--   redeemed -> tashrif bo'ldi, chegirma ishlatildi
--   bron bekor bo'lsa/kelmasa: reserved -> active (mijozga QAYTADI)

-- ============================================================
-- 1) Restoran sozlamalari
-- ============================================================
alter table restaurants
  add column if not exists loyalty_threshold smallint not null default 10
    check (loyalty_threshold between 1 and 1000),
  add column if not exists loyalty_discount_percent smallint not null default 10
    check (loyalty_discount_percent between 1 and 100);

-- Standart 10 -> 1. Avval chegara 10 bo'lsa mijoz BITTA tashrifdan
-- keyin chegirma olardi.
alter table restaurants
  alter column loyalty_points_per_visit set default 1;

-- ============================================================
-- 2) Chegirmalar
-- ============================================================
create table if not exists loyalty_rewards (
  id               uuid primary key default gen_random_uuid(),
  account_id       uuid not null references loyalty_accounts(id) on delete cascade,
  restaurant_id    uuid not null references restaurants(id) on delete cascade,
  discount_percent smallint not null check (discount_percent between 1 and 100),
  points_spent     smallint not null check (points_spent > 0),
  status           text not null default 'active'
                   check (status in ('active','reserved','redeemed','expired','cancelled')),
  expires_at       timestamptz,            -- null = muddatsiz
  reserved_at      timestamptz,
  redeemed_at      timestamptz,
  created_at       timestamptz not null default now()
);

create index if not exists loyalty_rewards_account_idx
  on loyalty_rewards (account_id, status);
create index if not exists loyalty_rewards_restaurant_idx
  on loyalty_rewards (restaurant_id, status);

-- Faol chegirmani tez topish uchun
create index if not exists loyalty_rewards_active_lookup
  on loyalty_rewards (account_id, restaurant_id) where status = 'active';

-- ============================================================
-- 3) Bron bilan bog'lanish
--    Bog'lanish FAQAT bir yo'nalishda — aylana FK bo'lmasligi uchun
--    loyalty_rewards da reservation_id ustuni yo'q.
-- ============================================================
alter table reservations
  add column if not exists discount_percent smallint
    check (discount_percent between 1 and 100),
  add column if not exists reward_id uuid
    references loyalty_rewards(id) on delete set null;

-- Bitta chegirma ikki bronga tushmasin
create unique index if not exists reservations_reward_unique
  on reservations (reward_id) where reward_id is not null;

-- ============================================================
-- 4) RLS — faqat o'qish; yozish service_role orqali
--
-- Rekursiyadan ehtiyot (0009/0010 saboq): bu siyosatlar `customers`
-- va `restaurants` ni o'qiydi. Teskarisi — o'sha jadvallar
-- siyosatlarining loyalty_rewards ni o'qishi — TAQIQLANADI.
-- ============================================================
alter table loyalty_rewards enable row level security;

create policy "customer reads own rewards"
  on loyalty_rewards for select to authenticated
  using (exists (
    select 1 from customers c
    where c.user_id = (select auth.uid())
      and c.loyalty_account_id = loyalty_rewards.account_id
  ));

create policy "owner reads own restaurant rewards"
  on loyalty_rewards for select to authenticated
  using (exists (
    select 1 from restaurants r
    where r.id = loyalty_rewards.restaurant_id
      and r.owner_id = (select auth.uid())
  ));
