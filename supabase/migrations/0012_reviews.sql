-- Laufleer — sharhlar (feedback)
--
-- Qoidalar:
--   * faqat "keldi" (completed) belgilangan bron uchun
--   * bir bron — bir sharh (unique indeks, kodda emas BAZADA)
--   * tashrifdan keyin 30 kun ichida (server action tekshiradi)
--   * ommaga muallif ANONIM ko'rinadi
--
-- Yozish faqat server action (service_role) orqali — shartlar u yerda.

-- ============================================================
-- 1) Jadval
-- ============================================================
create table if not exists reviews (
  id             uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references reservations(id) on delete cascade,
  restaurant_id  uuid not null references restaurants(id) on delete cascade,
  customer_id    uuid not null references customers(id) on delete cascade,
  rating         smallint not null check (rating between 1 and 5),
  comment        text check (char_length(comment) <= 1000),
  created_at     timestamptz not null default now()
);

-- "Bir bron uchun bir marta" — shu indeks kafolatlaydi
create unique index if not exists reviews_one_per_reservation
  on reviews (reservation_id);

create index if not exists reviews_restaurant_idx
  on reviews (restaurant_id, created_at desc);
create index if not exists reviews_customer_idx
  on reviews (customer_id);

-- ============================================================
-- 2) RLS — jadvalga ommaviy o'qish YO'Q
--
-- Rekursiyadan ehtiyot (0009/0010 saboq): bu siyosatlar `customers`
-- va `restaurants` ni o'qiydi; boshqa hech bir siyosat `reviews` ni
-- o'qimasligi kerak.
-- ============================================================
alter table reviews enable row level security;

create policy "customer reads own reviews"
  on reviews for select to authenticated
  using (exists (
    select 1 from customers c
    where c.id = reviews.customer_id
      and c.user_id = (select auth.uid())
  ));

create policy "owner reads own restaurant reviews"
  on reviews for select to authenticated
  using (exists (
    select 1 from restaurants r
    where r.id = reviews.restaurant_id
      and r.owner_id = (select auth.uid())
  ));

-- ============================================================
-- 3) Ommaviy ma'lumot — faqat identifikatsiyasiz ustunlar
--
-- Jadvalda customer_id bor, uni ommaga ochmaymiz. Restoran sahifasi
-- jadvalni emas, shu funksiyalarni chaqiradi. Ular customer_id,
-- reservation_id yoki ismni HECH QACHON qaytarmaydi va faqat
-- tasdiqlangan (approved) restoran uchun ishlaydi.
--
-- security definer RLS'ni chetlab o'tadi — shuning uchun qaytariladigan
-- ustunlar qat'iy cheklangan va search_path bo'sh.
-- ============================================================
create or replace function public.get_restaurant_rating(p_restaurant_id uuid)
returns table (avg_rating numeric, review_count integer)
language sql
stable
security definer
set search_path = ''
as $$
  select round(avg(rv.rating)::numeric, 1), count(*)::integer
  from public.reviews rv
  join public.restaurants r on r.id = rv.restaurant_id
  where rv.restaurant_id = p_restaurant_id
    and r.status = 'approved';
$$;

create or replace function public.get_restaurant_reviews(
  p_restaurant_id uuid,
  p_limit integer default 10
)
returns table (rating smallint, comment text, created_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select rv.rating, rv.comment, rv.created_at
  from public.reviews rv
  join public.restaurants r on r.id = rv.restaurant_id
  where rv.restaurant_id = p_restaurant_id
    and r.status = 'approved'
  order by rv.created_at desc
  limit least(greatest(coalesce(p_limit, 10), 1), 50);
$$;

revoke execute on function public.get_restaurant_rating(uuid) from public;
revoke execute on function public.get_restaurant_reviews(uuid, integer) from public;
grant execute on function public.get_restaurant_rating(uuid) to anon, authenticated;
grant execute on function public.get_restaurant_reviews(uuid, integer) to anon, authenticated;
