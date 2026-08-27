-- Laufleer — filtr va qidiruv uchun qo'shimcha maydonlar
-- price_level, features, neighborhood + qidiruv indeksi

alter table restaurants
  add column if not exists price_level  smallint
    check (price_level between 1 and 4),
  add column if not exists features     text[] not null default '{}',
  add column if not exists neighborhood text;

comment on column restaurants.price_level is
  '1=€ arzon, 2=€€ o''rtacha, 3=€€€ qimmat, 4=€€€€ juda qimmat';
comment on column restaurants.features is
  'terrace, vegan_options, family_friendly, wheelchair_accessible, bar, groups';

-- Nom va shahar bo'yicha matnli qidiruv uchun trigram indeksi
create extension if not exists pg_trgm;

create index if not exists restaurants_name_trgm_idx
  on restaurants using gin (name gin_trgm_ops);

create index if not exists restaurants_cuisine_idx  on restaurants (cuisine);
create index if not exists restaurants_price_idx    on restaurants (price_level);
create index if not exists restaurants_features_idx on restaurants using gin (features);

-- Mavjud 3 restoranni to'ldirish
update restaurants set price_level = 2, neighborhood = 'Mitte',
  features = '{terrace,family_friendly,groups}'
  where slug = 'schnitzelhaus-berlin' and price_level is null;

update restaurants set price_level = 2, neighborhood = 'Altstadt',
  features = '{vegan_options,family_friendly,groups}'
  where slug = 'osteria-bella-napoli-muenchen' and price_level is null;

update restaurants set price_level = 3, neighborhood = 'Altona',
  features = '{terrace,bar,wheelchair_accessible}'
  where slug = 'fischmarkt-speisehalle-hamburg' and price_level is null;
