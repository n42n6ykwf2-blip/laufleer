-- Laufleer — mijoz hisobi
--
-- Mehmon sifatida bron qilish O'ZGARMAYDI. Hisob majburiy emas —
-- u ballar, bronlar tarixi va feedback uchun kerak.
--
-- Muhim: loyalty_accounts allaqachon email bo'yicha ochiladi (mehmon
-- tashrifidan keyin). Ro'yxatdan o'tgan mijoz o'sha hisobga ulanadi,
-- shuning uchun avval yig'ilgan ballar yo'qolmaydi.

-- ============================================================
-- 1) Jadval
-- ============================================================
create table if not exists customers (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null unique references auth.users(id) on delete cascade,
  first_name         text not null,
  last_name          text not null,
  email              text not null,
  phone              text,
  loyalty_account_id uuid references loyalty_accounts(id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create unique index if not exists customers_email_key
  on customers (lower(email));

-- Tashqi kalitlar indekslanadi (indekssiz FK sekin cascade beradi)
create index if not exists customers_loyalty_idx
  on customers (loyalty_account_id);

-- ============================================================
-- 2) Himoya triggeri
--    Mijoz o'z yozuvidagi email va loyalty_account_id ni
--    o'zgartira olmasligi kerak — aks holda begona sodiqlik
--    hisobiga ulanib olishi mumkin.
--    service_role (auth.uid() bo'sh) cheklovsiz o'tadi.
-- ============================================================
create or replace function protect_customer_links()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new;                          -- service_role yo'li
  end if;
  new.email              := old.email;
  new.loyalty_account_id := old.loyalty_account_id;
  new.user_id            := old.user_id;
  new.updated_at         := now();
  return new;
end;
$$;

drop trigger if exists trg_protect_customer_links on customers;
create trigger trg_protect_customer_links
  before update on customers
  for each row execute function protect_customer_links();

-- ============================================================
-- 3) RLS
--    auth.uid() (select auth.uid()) ga o'raladi — aks holda
--    funksiya har qator uchun qayta chaqiriladi.
-- ============================================================
alter table customers enable row level security;

create policy "customer reads own row"
  on customers for select to authenticated
  using (user_id = (select auth.uid()));

create policy "customer creates own row"
  on customers for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "customer updates own row"
  on customers for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Ommaviy o'qish siyosati ATAYIN yo'q — mijoz ma'lumoti shaxsiy.

-- ============================================================
-- 4) Mijoz o'z ballarini ko'ra olsin (faqat o'qish)
--    Yozish hamon service_role orqali — o'ziga ball qo'sha olmaydi.
-- ============================================================
create policy "customer reads own loyalty balances"
  on loyalty_balances for select to authenticated
  using (exists (
    select 1 from customers c
    where c.user_id = (select auth.uid())
      and c.loyalty_account_id = loyalty_balances.account_id
  ));

create policy "customer reads own loyalty transactions"
  on loyalty_transactions for select to authenticated
  using (exists (
    select 1 from customers c
    where c.user_id = (select auth.uid())
      and c.loyalty_account_id = loyalty_transactions.account_id
  ));

create policy "customer reads own loyalty account"
  on loyalty_accounts for select to authenticated
  using (exists (
    select 1 from customers c
    where c.user_id = (select auth.uid())
      and c.loyalty_account_id = loyalty_accounts.id
  ));
