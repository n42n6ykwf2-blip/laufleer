-- Laufleer MVP — demo ma'lumotlar
-- 3 ta restoran (Berlin, München, Hamburg), har biri menyu va stollar bilan

-- ============================================================
-- Schnitzelhaus Berlin
-- ============================================================
with r as (
  insert into restaurants (slug, name, cuisine, description, street, house_number,
    postal_code, city, country, phone, cover_image_url, opening_hours)
  values (
    'schnitzelhaus-berlin',
    'Schnitzelhaus Berlin',
    'Deutsch',
    jsonb_build_object(
      'de', 'Klassische deutsche Küche im Herzen von Berlin-Mitte. Frisch zubereitete Schnitzel, hausgemachte Kartoffelsalate und regionale Biere.',
      'en', 'Classic German cuisine in the heart of Berlin-Mitte. Freshly prepared schnitzel, homemade potato salads and regional beers.'
    ),
    'Friedrichstraße', '112',
    '10117', 'Berlin', 'DE',
    '+493012345678',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200',
    jsonb_build_object(
      'mon', jsonb_build_array(jsonb_build_object('open','11:30','close','22:00')),
      'tue', jsonb_build_array(jsonb_build_object('open','11:30','close','22:00')),
      'wed', jsonb_build_array(jsonb_build_object('open','11:30','close','22:00')),
      'thu', jsonb_build_array(jsonb_build_object('open','11:30','close','23:00')),
      'fri', jsonb_build_array(jsonb_build_object('open','11:30','close','23:30')),
      'sat', jsonb_build_array(jsonb_build_object('open','12:00','close','23:30')),
      'sun', jsonb_build_array(jsonb_build_object('open','12:00','close','21:00'))
    )
  )
  returning id
),
cat_starter as (
  insert into menu_categories (restaurant_id, name, sort_order)
  select id, jsonb_build_object('de','Vorspeisen','en','Starters'), 1 from r
  returning id, restaurant_id
),
cat_main as (
  insert into menu_categories (restaurant_id, name, sort_order)
  select id, jsonb_build_object('de','Hauptgerichte','en','Main courses'), 2 from r
  returning id, restaurant_id
),
cat_dessert as (
  insert into menu_categories (restaurant_id, name, sort_order)
  select id, jsonb_build_object('de','Nachspeisen','en','Desserts'), 3 from r
  returning id, restaurant_id
),
ins_items as (
  insert into menu_items (restaurant_id, category_id, name, description, price_cents, sort_order)
  select restaurant_id, id,
    jsonb_build_object('de','Kartoffelsuppe','en','Potato soup'),
    jsonb_build_object('de','Mit geräucherter Wurst und Kräutern','en','With smoked sausage and herbs'),
    690, 1 from cat_starter
  union all
  select restaurant_id, id,
    jsonb_build_object('de','Brezel mit Obatzda','en','Pretzel with Obatzda'),
    jsonb_build_object('de','Bayerischer Käseaufstrich','en','Bavarian cheese spread'),
    750, 2 from cat_starter
  union all
  select restaurant_id, id,
    jsonb_build_object('de','Wiener Schnitzel','en','Wiener Schnitzel'),
    jsonb_build_object('de','Vom Kalb mit Kartoffelsalat und Preiselbeeren','en','Veal, with potato salad and lingonberry'),
    2490, 1 from cat_main
  union all
  select restaurant_id, id,
    jsonb_build_object('de','Schweinshaxe','en','Roast pork knuckle'),
    jsonb_build_object('de','Mit Semmelknödel und Sauerkraut','en','With bread dumpling and sauerkraut'),
    2190, 2 from cat_main
  union all
  select restaurant_id, id,
    jsonb_build_object('de','Currywurst mit Pommes','en','Currywurst with fries'),
    jsonb_build_object('de','Berliner Klassiker','en','Berlin classic'),
    1290, 3 from cat_main
  union all
  select restaurant_id, id,
    jsonb_build_object('de','Apfelstrudel','en','Apple strudel'),
    jsonb_build_object('de','Warm, mit Vanillesauce','en','Warm, with vanilla sauce'),
    790, 1 from cat_dessert
  returning 1
),
ins_tables as (
  insert into restaurant_tables (restaurant_id, label, capacity)
  select id, 'T1', 2 from r
  union all select id, 'T2', 2 from r
  union all select id, 'T3', 4 from r
  union all select id, 'T4', 4 from r
  union all select id, 'T5', 6 from r
  union all select id, 'T6', 8 from r
  returning 1
)
select 1;

-- ============================================================
-- Osteria Bella Napoli — München
-- ============================================================
with r as (
  insert into restaurants (slug, name, cuisine, description, street, house_number,
    postal_code, city, country, phone, cover_image_url, opening_hours)
  values (
    'osteria-bella-napoli-muenchen',
    'Osteria Bella Napoli',
    'Italienisch',
    jsonb_build_object(
      'de', 'Authentische neapolitanische Pizza aus dem Holzofen und hausgemachte Pasta im gemütlichen Ambiente.',
      'en', 'Authentic Neapolitan wood-fired pizza and homemade pasta in a cosy setting.'
    ),
    'Sendlinger Straße', '24',
    '80331', 'München', 'DE',
    '+498945678900',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200',
    jsonb_build_object(
      'mon', jsonb_build_array(),
      'tue', jsonb_build_array(jsonb_build_object('open','17:00','close','23:00')),
      'wed', jsonb_build_array(jsonb_build_object('open','17:00','close','23:00')),
      'thu', jsonb_build_array(jsonb_build_object('open','17:00','close','23:00')),
      'fri', jsonb_build_array(jsonb_build_object('open','12:00','close','23:30')),
      'sat', jsonb_build_array(jsonb_build_object('open','12:00','close','23:30')),
      'sun', jsonb_build_array(jsonb_build_object('open','12:00','close','22:00'))
    )
  )
  returning id
),
cat_pizza as (
  insert into menu_categories (restaurant_id, name, sort_order)
  select id, jsonb_build_object('de','Pizza','en','Pizza'), 1 from r
  returning id, restaurant_id
),
cat_pasta as (
  insert into menu_categories (restaurant_id, name, sort_order)
  select id, jsonb_build_object('de','Pasta','en','Pasta'), 2 from r
  returning id, restaurant_id
),
cat_dolci as (
  insert into menu_categories (restaurant_id, name, sort_order)
  select id, jsonb_build_object('de','Dolci','en','Desserts'), 3 from r
  returning id, restaurant_id
),
ins_items as (
  insert into menu_items (restaurant_id, category_id, name, description, price_cents, sort_order)
  select restaurant_id, id,
    jsonb_build_object('de','Margherita','en','Margherita'),
    jsonb_build_object('de','San-Marzano-Tomaten, Fior di Latte, Basilikum','en','San Marzano tomatoes, fior di latte, basil'),
    1090, 1 from cat_pizza
  union all
  select restaurant_id, id,
    jsonb_build_object('de','Diavola','en','Diavola'),
    jsonb_build_object('de','Salami piccante, Chili, Mozzarella','en','Spicy salami, chili, mozzarella'),
    1290, 2 from cat_pizza
  union all
  select restaurant_id, id,
    jsonb_build_object('de','Quattro Formaggi','en','Quattro Formaggi'),
    jsonb_build_object('de','Vier Käse: Mozzarella, Gorgonzola, Fontina, Parmigiano','en','Four cheeses: mozzarella, gorgonzola, fontina, parmigiano'),
    1390, 3 from cat_pizza
  union all
  select restaurant_id, id,
    jsonb_build_object('de','Spaghetti Carbonara','en','Spaghetti Carbonara'),
    jsonb_build_object('de','Guanciale, Pecorino, Ei','en','Guanciale, pecorino, egg'),
    1490, 1 from cat_pasta
  union all
  select restaurant_id, id,
    jsonb_build_object('de','Tagliatelle al Ragù','en','Tagliatelle al Ragù'),
    jsonb_build_object('de','Klassisches Rindfleischragout','en','Classic beef ragù'),
    1590, 2 from cat_pasta
  union all
  select restaurant_id, id,
    jsonb_build_object('de','Tiramisù','en','Tiramisù'),
    jsonb_build_object('de','Nach altem Familienrezept','en','From an old family recipe'),
    690, 1 from cat_dolci
  returning 1
),
ins_tables as (
  insert into restaurant_tables (restaurant_id, label, capacity)
  select id, 'A1', 2 from r
  union all select id, 'A2', 2 from r
  union all select id, 'A3', 4 from r
  union all select id, 'A4', 4 from r
  union all select id, 'A5', 6 from r
  returning 1
)
select 1;

-- ============================================================
-- Fischmarkt Speisehalle — Hamburg
-- ============================================================
with r as (
  insert into restaurants (slug, name, cuisine, description, street, house_number,
    postal_code, city, country, phone, cover_image_url, opening_hours)
  values (
    'fischmarkt-speisehalle-hamburg',
    'Fischmarkt Speisehalle',
    'Fisch & Meeresfrüchte',
    jsonb_build_object(
      'de', 'Täglich frischer Fang aus Nord- und Ostsee, serviert mit Blick auf den Hafen.',
      'en', 'Daily fresh catch from the North and Baltic Seas, served with a view of the harbour.'
    ),
    'Große Elbstraße', '138',
    '22767', 'Hamburg', 'DE',
    '+494038071200',
    'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=1200',
    jsonb_build_object(
      'mon', jsonb_build_array(jsonb_build_object('open','12:00','close','22:00')),
      'tue', jsonb_build_array(jsonb_build_object('open','12:00','close','22:00')),
      'wed', jsonb_build_array(jsonb_build_object('open','12:00','close','22:00')),
      'thu', jsonb_build_array(jsonb_build_object('open','12:00','close','22:30')),
      'fri', jsonb_build_array(jsonb_build_object('open','12:00','close','23:00')),
      'sat', jsonb_build_array(jsonb_build_object('open','11:00','close','23:00')),
      'sun', jsonb_build_array(jsonb_build_object('open','10:00','close','21:00'))
    )
  )
  returning id
),
cat_starter as (
  insert into menu_categories (restaurant_id, name, sort_order)
  select id, jsonb_build_object('de','Vorspeisen','en','Starters'), 1 from r
  returning id, restaurant_id
),
cat_main as (
  insert into menu_categories (restaurant_id, name, sort_order)
  select id, jsonb_build_object('de','Hauptgerichte','en','Main courses'), 2 from r
  returning id, restaurant_id
),
ins_items as (
  insert into menu_items (restaurant_id, category_id, name, description, price_cents, sort_order)
  select restaurant_id, id,
    jsonb_build_object('de','Matjes „Hausfrauenart"','en','Herring "housewife style"'),
    jsonb_build_object('de','Mit Apfel, Zwiebel und Bratkartoffeln','en','With apple, onion and fried potatoes'),
    1490, 1 from cat_starter
  union all
  select restaurant_id, id,
    jsonb_build_object('de','Nordseekrabben-Cocktail','en','North Sea shrimp cocktail'),
    jsonb_build_object('de','Auf Blattsalaten mit hausgemachter Sauce','en','On leafy greens with house-made sauce'),
    1690, 2 from cat_starter
  union all
  select restaurant_id, id,
    jsonb_build_object('de','Gebratener Zander','en','Pan-seared zander'),
    jsonb_build_object('de','Mit Petersilienkartoffeln und Rieslingsoße','en','With parsley potatoes and Riesling sauce'),
    2690, 1 from cat_main
  union all
  select restaurant_id, id,
    jsonb_build_object('de','Fischplatte für zwei','en','Fish platter for two'),
    jsonb_build_object('de','Auswahl des Tages, gegrillt und gebraten','en','Chef''s daily selection, grilled and pan-fried'),
    5490, 2 from cat_main
  returning 1
),
ins_tables as (
  insert into restaurant_tables (restaurant_id, label, capacity)
  select id, 'H1', 2 from r
  union all select id, 'H2', 2 from r
  union all select id, 'H3', 4 from r
  union all select id, 'H4', 4 from r
  union all select id, 'H5', 6 from r
  union all select id, 'H6', 8 from r
  returning 1
)
select 1;
