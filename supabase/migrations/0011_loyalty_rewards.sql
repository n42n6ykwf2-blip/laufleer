-- Laufleer — sodiqlik chegirmasi (aylanma)
--
-- Ball yig'ilishi allaqachon ishlaydi (awardPoints). Bu migratsiya
-- ballarni chegirmaga aylantirish qismini qo'shadi.
--
-- Kelishilgan iqtisod:
--   har tashrif +1 ball, 10 ballda 10% chegirma, chegirma muddatsiz
--   10 ball -> chegirma -> ball 0 -> yana yig'iladi -> yana chegirma
--
-- MUHIM: ball chegirma YARATILGANDA ayiriladi, ishlatilganda emas.
-- Shunda mijoz ishlatilmagan chegirma ushlab turganda ham yangi ball
-- yig'a boshlaydi va hech narsa yo'qolmaydi.

-- ============================================================
-- 1) Restoran sozlamalari — chegara va foiz
-- ============================================================
alter table restaurants
  add column if not exists loyalty_threshold smallint not null default 10
    check (loyalty_threshold between 1 and 1000),
  add column if not exists loyalty_discount_percent smallint not null default 10
    check (loyalty_discount_percent between 1 and 100);

-- Standart 10 -> 1. Avval 10 ball/tashrif berilardi, ya'ni chegara 10
-- bo'lsa mijoz BITTA tashrifdan keyin chegirma olardi.
alter table restaurants
  alter column loyalty_points_per_visit set default 1;

-- ============================================================
-- 2) Chegirmalar
-- ============================================================
create table if not exists loyalty_rewards (
  id               uuid primary key default gen_random_uuid(),
  account_id       uuid not null references loyalty_accounts(id) on delete cascade,
  restaurant_id    uuid not null references restaurants(id) on delete cascade,
  code             text not null,
  discount_percent smallint not null check (discount_percent between 1 and 100),
  points_spent     smallint not null check (points_spent > 0),
  status           text not null default 'active'
                   check (status in ('active','redeemed','expired','cancelled')),
  expires_at       timestamptz,            -- null = muddatsiz
  redeemed_at      timestamptz,
  created_at       timestamptz not null default now()
);

create unique index if not exists loyalty_rewards_code_key
  on loyalty_rewards (upper(code));

create index if not exists loyalty_rewards_account_idx
  on loyalty_rewards (account_id, status);
create index if not exists loyalty_rewards_restaurant_idx
  on loyalty_rewards (restaurant_id, status);

-- "Bir vaqtda bitta faol chegirma" cheklovi ATAYIN yo'q — aylana
-- to'xtamasligi kerak. Takroriy yaratilishdan himoya ball ayirilishi
-- orqali: balans 0 ga tushgach, chegara yana to'planmaguncha yangi
-- chegirma yaratilmaydi.

-- ============================================================
-- 3) RLS — faqat o'qish; yaratish va tasdiqlash service_role orqali
--
-- Rekursiyadan ehtiyot (0009/0010 dagi xato): bu siyosatlar
-- `customers` va `restaurants` ni o'qiydi. Teskarisi — `restaurants`
-- yoki `customers` siyosatlarining loyalty_rewards ni o'qishi —
-- TAQIQLANADI, aks holda aylana hosil bo'lib butun so'rov yiqiladi.
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
