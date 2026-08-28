-- Laufleer — qo'shimcha demo restoranlar (jami 12 ta bo'ladi)
-- 8 shahar, 11 xil oshxona, turli narx darajalari

-- ============================================================
-- 1) Restoranlar
-- ============================================================
insert into restaurants (
  slug, name, cuisine, description, street, house_number, postal_code, city,
  country, phone, cover_image_url, opening_hours, price_level, features, neighborhood
)
values
  ('anatolia-grill-berlin', 'Anatolia Grill', 'Türkisch',
   '{"de":"Holzkohlegrill, frisches Fladenbrot und Mezze wie in Istanbul. Seit 1998 in Kreuzberg.","en":"Charcoal grill, fresh flatbread and mezze like in Istanbul. In Kreuzberg since 1998."}'::jsonb,
   'Oranienstraße', '46', '10969', 'Berlin', 'DE', '+493061285544',
   'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200',
   '{"mon":[{"open":"11:00","close":"23:00"}],"tue":[{"open":"11:00","close":"23:00"}],"wed":[{"open":"11:00","close":"23:00"}],"thu":[{"open":"11:00","close":"24:00"}],"fri":[{"open":"11:00","close":"01:00"}],"sat":[{"open":"11:00","close":"01:00"}],"sun":[{"open":"12:00","close":"23:00"}]}'::jsonb,
   1, '{family_friendly,groups,vegan_options}', 'Kreuzberg'),

  ('gruenkern-berlin', 'Grünkern', 'Vegan',
   '{"de":"Rein pflanzliche Küche aus regionalen Zutaten. Wechselnde Wochenkarte, alles hausgemacht.","en":"Fully plant-based cooking from regional produce. Weekly changing menu, everything house-made."}'::jsonb,
   'Kastanienallee', '78', '10435', 'Berlin', 'DE', '+493044057712',
   'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=1200',
   '{"mon":[],"tue":[{"open":"17:30","close":"22:30"}],"wed":[{"open":"17:30","close":"22:30"}],"thu":[{"open":"17:30","close":"22:30"}],"fri":[{"open":"17:30","close":"23:00"}],"sat":[{"open":"12:00","close":"23:00"}],"sun":[{"open":"12:00","close":"21:00"}]}'::jsonb,
   2, '{vegan_options,terrace,wheelchair_accessible}', 'Prenzlauer Berg'),

  ('koji-sushi-muenchen', 'Kōji Sushi', 'Japanisch',
   '{"de":"Omakase am Tresen und klassische Nigiri. Fisch täglich frisch, Reis nach Edomae-Art.","en":"Omakase at the counter and classic nigiri. Fish delivered daily, rice prepared Edomae style."}'::jsonb,
   'Leopoldstraße', '52', '80802', 'München', 'DE', '+498933076680',
   'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200',
   '{"mon":[],"tue":[{"open":"18:00","close":"23:00"}],"wed":[{"open":"18:00","close":"23:00"}],"thu":[{"open":"18:00","close":"23:00"}],"fri":[{"open":"18:00","close":"23:30"}],"sat":[{"open":"18:00","close":"23:30"}],"sun":[]}'::jsonb,
   3, '{bar,wheelchair_accessible}', 'Schwabing'),

  ('hanoi-kueche-hamburg', 'Hanoi Küche', 'Vietnamesisch',
   '{"de":"Phở nach Familienrezept, Sommerrollen und Bánh mì. Klein, laut und ehrlich.","en":"Family-recipe phở, summer rolls and bánh mì. Small, loud and honest."}'::jsonb,
   'Susannenstraße', '19', '20357', 'Hamburg', 'DE', '+494043092255',
   'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200',
   '{"mon":[{"open":"12:00","close":"22:00"}],"tue":[{"open":"12:00","close":"22:00"}],"wed":[{"open":"12:00","close":"22:00"}],"thu":[{"open":"12:00","close":"22:00"}],"fri":[{"open":"12:00","close":"23:00"}],"sat":[{"open":"12:00","close":"23:00"}],"sun":[{"open":"13:00","close":"21:00"}]}'::jsonb,
   1, '{vegan_options,family_friendly}', 'Sternschanze'),

  ('brauhaus-sankt-martin-koeln', 'Brauhaus Sankt Martin', 'Deutsch',
   '{"de":"Kölsch vom Fass, Himmel un Ääd und Halver Hahn. Echtes Brauhaus mit langen Tischen.","en":"Kölsch on tap, Himmel un Ääd and Halver Hahn. A real brewhouse with long shared tables."}'::jsonb,
   'Buttermarkt', '11', '50667', 'Köln', 'DE', '+492212577931',
   'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200',
   '{"mon":[{"open":"11:30","close":"23:30"}],"tue":[{"open":"11:30","close":"23:30"}],"wed":[{"open":"11:30","close":"23:30"}],"thu":[{"open":"11:30","close":"24:00"}],"fri":[{"open":"11:30","close":"01:00"}],"sat":[{"open":"11:00","close":"01:00"}],"sun":[{"open":"11:00","close":"22:00"}]}'::jsonb,
   2, '{terrace,groups,family_friendly}', 'Altstadt'),

  ('masala-haus-frankfurt', 'Masala Haus', 'Indisch',
   '{"de":"Nordindische Currys aus dem Tandoor, frisch gemahlene Gewürze, viele vegetarische Gerichte.","en":"North Indian curries from the tandoor, freshly ground spices, many vegetarian dishes."}'::jsonb,
   'Schweizer Straße', '34', '60594', 'Frankfurt am Main', 'DE', '+496962004417',
   'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=1200',
   '{"mon":[{"open":"12:00","close":"22:30"}],"tue":[{"open":"12:00","close":"22:30"}],"wed":[{"open":"12:00","close":"22:30"}],"thu":[{"open":"12:00","close":"22:30"}],"fri":[{"open":"12:00","close":"23:00"}],"sat":[{"open":"12:00","close":"23:00"}],"sun":[{"open":"13:00","close":"22:00"}]}'::jsonb,
   2, '{vegan_options,family_friendly,groups}', 'Sachsenhausen'),

  ('bistro-lumiere-stuttgart', 'Bistro Lumière', 'Französisch',
   '{"de":"Menü in vier Gängen, täglich neu je nach Markt. Kleine Karte, große Weinauswahl.","en":"A four-course menu, rewritten daily around the market. Small menu, large wine list."}'::jsonb,
   'Calwer Straße', '23', '70173', 'Stuttgart', 'DE', '+497112265588',
   'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200',
   '{"mon":[],"tue":[],"wed":[{"open":"18:30","close":"23:00"}],"thu":[{"open":"18:30","close":"23:00"}],"fri":[{"open":"18:30","close":"23:30"}],"sat":[{"open":"18:30","close":"23:30"}],"sun":[{"open":"12:00","close":"15:00"}]}'::jsonb,
   4, '{bar,wheelchair_accessible}', 'Mitte'),

  ('casa-iberica-duesseldorf', 'Casa Ibérica', 'Spanisch',
   '{"de":"Tapas zum Teilen, Jamón Ibérico von der Schneidemaschine und Paella für zwei.","en":"Tapas to share, Jamón Ibérico sliced to order and paella for two."}'::jsonb,
   'Speditionstraße', '9', '40221', 'Düsseldorf', 'DE', '+492113020166',
   'https://images.unsplash.com/photo-1481931098730-318b6f776db0?w=1200',
   '{"mon":[{"open":"17:00","close":"23:00"}],"tue":[{"open":"17:00","close":"23:00"}],"wed":[{"open":"17:00","close":"23:00"}],"thu":[{"open":"17:00","close":"23:30"}],"fri":[{"open":"17:00","close":"24:00"}],"sat":[{"open":"12:00","close":"24:00"}],"sun":[{"open":"12:00","close":"22:00"}]}'::jsonb,
   3, '{terrace,bar,groups}', 'Medienhafen'),

  ('taverna-elia-leipzig', 'Taverna Elia', 'Griechisch',
   '{"de":"Gegrillter Oktopus, Meze und Wein von der Peloponnes. Im Sommer sitzt man im Hof.","en":"Grilled octopus, meze and wine from the Peloponnese. In summer you sit in the courtyard."}'::jsonb,
   'Karl-Liebknecht-Straße', '62', '04275', 'Leipzig', 'DE', '+493413912240',
   'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=1200',
   '{"mon":[{"open":"17:00","close":"23:00"}],"tue":[{"open":"17:00","close":"23:00"}],"wed":[{"open":"17:00","close":"23:00"}],"thu":[{"open":"17:00","close":"23:00"}],"fri":[{"open":"17:00","close":"24:00"}],"sat":[{"open":"12:00","close":"24:00"}],"sun":[{"open":"12:00","close":"22:00"}]}'::jsonb,
   2, '{terrace,family_friendly,groups,vegan_options}', 'Südvorstadt')
on conflict (slug) do nothing;

-- ============================================================
-- 2) Menyu kategoriyalari
-- ============================================================
insert into menu_categories (restaurant_id, name, sort_order)
select r.id, v.name, v.ord
from (values
  ('anatolia-grill-berlin',      '{"de":"Mezze","en":"Mezze"}'::jsonb, 1),
  ('anatolia-grill-berlin',      '{"de":"Vom Grill","en":"From the grill"}'::jsonb, 2),
  ('gruenkern-berlin',           '{"de":"Kleine Gerichte","en":"Small plates"}'::jsonb, 1),
  ('gruenkern-berlin',           '{"de":"Hauptgerichte","en":"Mains"}'::jsonb, 2),
  ('koji-sushi-muenchen',        '{"de":"Nigiri","en":"Nigiri"}'::jsonb, 1),
  ('koji-sushi-muenchen',        '{"de":"Menüs","en":"Set menus"}'::jsonb, 2),
  ('hanoi-kueche-hamburg',       '{"de":"Suppen","en":"Soups"}'::jsonb, 1),
  ('hanoi-kueche-hamburg',       '{"de":"Snacks","en":"Snacks"}'::jsonb, 2),
  ('brauhaus-sankt-martin-koeln','{"de":"Kölsche Klassiker","en":"Cologne classics"}'::jsonb, 1),
  ('brauhaus-sankt-martin-koeln','{"de":"Getränke","en":"Drinks"}'::jsonb, 2),
  ('masala-haus-frankfurt',      '{"de":"Vorspeisen","en":"Starters"}'::jsonb, 1),
  ('masala-haus-frankfurt',      '{"de":"Currys","en":"Curries"}'::jsonb, 2),
  ('bistro-lumiere-stuttgart',   '{"de":"Menü","en":"Tasting menu"}'::jsonb, 1),
  ('bistro-lumiere-stuttgart',   '{"de":"À la carte","en":"À la carte"}'::jsonb, 2),
  ('casa-iberica-duesseldorf',   '{"de":"Tapas frías","en":"Cold tapas"}'::jsonb, 1),
  ('casa-iberica-duesseldorf',   '{"de":"Tapas calientes","en":"Hot tapas"}'::jsonb, 2),
  ('taverna-elia-leipzig',       '{"de":"Meze","en":"Meze"}'::jsonb, 1),
  ('taverna-elia-leipzig',       '{"de":"Vom Grill","en":"From the grill"}'::jsonb, 2)
) as v(slug, name, ord)
join restaurants r on r.slug = v.slug
where not exists (
  select 1 from menu_categories mc
  where mc.restaurant_id = r.id and mc.sort_order = v.ord
);

-- ============================================================
-- 3) Menyu taomlari
-- ============================================================
insert into menu_items (restaurant_id, category_id, name, description, price_cents, sort_order)
select r.id, c.id, v.name, v.descr, v.price, v.ord
from (values
  -- Anatolia Grill
  ('anatolia-grill-berlin', 1, '{"de":"Hummus","en":"Hummus"}'::jsonb, '{"de":"Mit Olivenöl, Kreuzkümmel und warmem Fladenbrot","en":"With olive oil, cumin and warm flatbread"}'::jsonb, 590, 1),
  ('anatolia-grill-berlin', 1, '{"de":"Sigara Böreği","en":"Sigara Böreği"}'::jsonb, '{"de":"Knusprige Röllchen mit Schafskäse und Petersilie","en":"Crisp rolls with sheep cheese and parsley"}'::jsonb, 650, 2),
  ('anatolia-grill-berlin', 1, '{"de":"Gefüllte Weinblätter","en":"Stuffed vine leaves"}'::jsonb, '{"de":"Mit Reis, Pinienkernen und Zitrone, vegan","en":"With rice, pine nuts and lemon, vegan"}'::jsonb, 620, 3),
  ('anatolia-grill-berlin', 2, '{"de":"Adana Kebap","en":"Adana kebab"}'::jsonb, '{"de":"Scharf gewürztes Lammhack vom Holzkohlegrill","en":"Spiced minced lamb from the charcoal grill"}'::jsonb, 1490, 1),
  ('anatolia-grill-berlin', 2, '{"de":"Hähnchenspieß","en":"Chicken skewer"}'::jsonb, '{"de":"Mit Joghurt, Bulgur und Salat","en":"With yoghurt, bulgur and salad"}'::jsonb, 1390, 2),
  ('anatolia-grill-berlin', 2, '{"de":"Gemüseteller","en":"Grilled vegetable plate"}'::jsonb, '{"de":"Aubergine, Paprika, Zucchini, vegan","en":"Aubergine, pepper, courgette, vegan"}'::jsonb, 1190, 3),

  -- Grünkern
  ('gruenkern-berlin', 1, '{"de":"Rote-Bete-Tatar","en":"Beetroot tartare"}'::jsonb, '{"de":"Mit Kapern, Schnittlauch und Cashewcreme","en":"With capers, chives and cashew cream"}'::jsonb, 990, 1),
  ('gruenkern-berlin', 1, '{"de":"Kürbissuppe","en":"Pumpkin soup"}'::jsonb, '{"de":"Mit geröstetem Kürbiskernöl","en":"With toasted pumpkin seed oil"}'::jsonb, 850, 2),
  ('gruenkern-berlin', 1, '{"de":"Sauerteigbrot","en":"Sourdough bread"}'::jsonb, '{"de":"Hausgebacken, mit Kräuterbutter aus Hafer","en":"House-baked, with oat-based herb butter"}'::jsonb, 480, 3),
  ('gruenkern-berlin', 2, '{"de":"Pilzrisotto","en":"Mushroom risotto"}'::jsonb, '{"de":"Steinpilze, Petersilienwurzel, Hefeflocken","en":"Porcini, parsley root, nutritional yeast"}'::jsonb, 1890, 1),
  ('gruenkern-berlin', 2, '{"de":"Grünkernbratling","en":"Green spelt patty"}'::jsonb, '{"de":"Mit Ofengemüse und Kräuteröl","en":"With roasted vegetables and herb oil"}'::jsonb, 1690, 2),
  ('gruenkern-berlin', 2, '{"de":"Wochengericht","en":"Dish of the week"}'::jsonb, '{"de":"Wechselt jeden Dienstag, bitte erfragen","en":"Changes every Tuesday, please ask"}'::jsonb, 1790, 3),

  -- Kōji Sushi
  ('koji-sushi-muenchen', 1, '{"de":"Lachs","en":"Salmon"}'::jsonb, '{"de":"Zwei Stück, mit Wasabi aus frischer Wurzel","en":"Two pieces, with wasabi from fresh root"}'::jsonb, 720, 1),
  ('koji-sushi-muenchen', 1, '{"de":"Thunfisch (Akami)","en":"Tuna (akami)"}'::jsonb, '{"de":"Zwei Stück, kurz mariniert","en":"Two pieces, lightly marinated"}'::jsonb, 890, 2),
  ('koji-sushi-muenchen', 1, '{"de":"Gelbschwanz","en":"Yellowtail"}'::jsonb, '{"de":"Zwei Stück, mit Yuzu-Salz","en":"Two pieces, with yuzu salt"}'::jsonb, 940, 3),
  ('koji-sushi-muenchen', 2, '{"de":"Omakase klein","en":"Omakase, short"}'::jsonb, '{"de":"Zehn Stück nach Wahl des Küchenchefs","en":"Ten pieces chosen by the chef"}'::jsonb, 6900, 1),
  ('koji-sushi-muenchen', 2, '{"de":"Omakase groß","en":"Omakase, full"}'::jsonb, '{"de":"Sechzehn Stück, mit Suppe und Dessert","en":"Sixteen pieces, with soup and dessert"}'::jsonb, 11800, 2),

  -- Hanoi Küche
  ('hanoi-kueche-hamburg', 1, '{"de":"Phở Bò","en":"Phở Bò"}'::jsonb, '{"de":"Rinderbrühe, zwölf Stunden gekocht","en":"Beef broth, simmered twelve hours"}'::jsonb, 1290, 1),
  ('hanoi-kueche-hamburg', 1, '{"de":"Phở Chay","en":"Phở Chay"}'::jsonb, '{"de":"Gemüsebrühe mit Tofu und Pilzen, vegan","en":"Vegetable broth with tofu and mushrooms, vegan"}'::jsonb, 1190, 2),
  ('hanoi-kueche-hamburg', 2, '{"de":"Sommerrollen","en":"Summer rolls"}'::jsonb, '{"de":"Drei Stück, mit Erdnusssauce","en":"Three pieces, with peanut sauce"}'::jsonb, 690, 1),
  ('hanoi-kueche-hamburg', 2, '{"de":"Bánh mì","en":"Bánh mì"}'::jsonb, '{"de":"Baguette mit eingelegtem Gemüse und Koriander","en":"Baguette with pickled vegetables and coriander"}'::jsonb, 790, 2),
  ('hanoi-kueche-hamburg', 2, '{"de":"Frühlingsrollen","en":"Fried spring rolls"}'::jsonb, '{"de":"Vier Stück, knusprig frittiert","en":"Four pieces, crisply fried"}'::jsonb, 650, 3),

  -- Brauhaus Sankt Martin
  ('brauhaus-sankt-martin-koeln', 1, '{"de":"Himmel un Ääd","en":"Himmel un Ääd"}'::jsonb, '{"de":"Blutwurst mit Apfelmus und Kartoffelpüree","en":"Black pudding with apple sauce and mashed potato"}'::jsonb, 1450, 1),
  ('brauhaus-sankt-martin-koeln', 1, '{"de":"Halver Hahn","en":"Halver Hahn"}'::jsonb, '{"de":"Roggenbrötchen mit altem Gouda und Senf","en":"Rye roll with aged Gouda and mustard"}'::jsonb, 690, 2),
  ('brauhaus-sankt-martin-koeln', 1, '{"de":"Rheinischer Sauerbraten","en":"Rhenish sauerbraten"}'::jsonb, '{"de":"Mit Rosinensauce, Rotkohl und Klößen","en":"With raisin sauce, red cabbage and dumplings"}'::jsonb, 1990, 3),
  ('brauhaus-sankt-martin-koeln', 2, '{"de":"Kölsch 0,2 l","en":"Kölsch 0.2 l"}'::jsonb, '{"de":"Vom Fass, im Kranz serviert","en":"On tap, served in a Kranz"}'::jsonb, 240, 1),
  ('brauhaus-sankt-martin-koeln', 2, '{"de":"Apfelsaftschorle","en":"Apple spritzer"}'::jsonb, '{"de":"0,3 l","en":"0.3 l"}'::jsonb, 320, 2),

  -- Masala Haus
  ('masala-haus-frankfurt', 1, '{"de":"Samosa","en":"Samosa"}'::jsonb, '{"de":"Zwei Stück, mit Kartoffel und Erbsen, vegan","en":"Two pieces, with potato and peas, vegan"}'::jsonb, 590, 1),
  ('masala-haus-frankfurt', 1, '{"de":"Papadam","en":"Papadam"}'::jsonb, '{"de":"Mit drei Chutneys","en":"With three chutneys"}'::jsonb, 390, 2),
  ('masala-haus-frankfurt', 2, '{"de":"Butter Chicken","en":"Butter chicken"}'::jsonb, '{"de":"Mild, mit Tomate und Sahne","en":"Mild, with tomato and cream"}'::jsonb, 1690, 1),
  ('masala-haus-frankfurt', 2, '{"de":"Palak Paneer","en":"Palak paneer"}'::jsonb, '{"de":"Spinat mit hausgemachtem Käse, vegetarisch","en":"Spinach with house-made cheese, vegetarian"}'::jsonb, 1490, 2),
  ('masala-haus-frankfurt', 2, '{"de":"Chana Masala","en":"Chana masala"}'::jsonb, '{"de":"Kichererbsen, scharf, vegan","en":"Chickpeas, spicy, vegan"}'::jsonb, 1390, 3),

  -- Bistro Lumière
  ('bistro-lumiere-stuttgart', 1, '{"de":"Vier Gänge","en":"Four courses"}'::jsonb, '{"de":"Täglich wechselnd, mit Weinbegleitung möglich","en":"Changing daily, wine pairing available"}'::jsonb, 8900, 1),
  ('bistro-lumiere-stuttgart', 1, '{"de":"Weinbegleitung","en":"Wine pairing"}'::jsonb, '{"de":"Vier Gläser, vom Sommelier gewählt","en":"Four glasses, chosen by the sommelier"}'::jsonb, 5400, 2),
  ('bistro-lumiere-stuttgart', 2, '{"de":"Entenbrust","en":"Duck breast"}'::jsonb, '{"de":"Mit Rotweinjus und Sellerie","en":"With red wine jus and celeriac"}'::jsonb, 3400, 1),
  ('bistro-lumiere-stuttgart', 2, '{"de":"Saibling","en":"Char"}'::jsonb, '{"de":"Mit Beurre blanc und Fenchel","en":"With beurre blanc and fennel"}'::jsonb, 3200, 2),

  -- Casa Ibérica
  ('casa-iberica-duesseldorf', 1, '{"de":"Jamón Ibérico","en":"Jamón Ibérico"}'::jsonb, '{"de":"36 Monate gereift, von Hand geschnitten","en":"Aged 36 months, hand-sliced"}'::jsonb, 1890, 1),
  ('casa-iberica-duesseldorf', 1, '{"de":"Aceitunas","en":"Olives"}'::jsonb, '{"de":"Dreierlei, mariniert, vegan","en":"Three kinds, marinated, vegan"}'::jsonb, 490, 2),
  ('casa-iberica-duesseldorf', 2, '{"de":"Gambas al Ajillo","en":"Gambas al ajillo"}'::jsonb, '{"de":"Garnelen in Knoblauchöl mit Chili","en":"Prawns in garlic oil with chili"}'::jsonb, 1290, 1),
  ('casa-iberica-duesseldorf', 2, '{"de":"Patatas Bravas","en":"Patatas bravas"}'::jsonb, '{"de":"Mit scharfer Tomatensauce, vegan","en":"With spicy tomato sauce, vegan"}'::jsonb, 690, 2),
  ('casa-iberica-duesseldorf', 2, '{"de":"Paella für zwei","en":"Paella for two"}'::jsonb, '{"de":"Mit Meeresfrüchten, 40 Minuten Wartezeit","en":"With seafood, 40 minutes waiting time"}'::jsonb, 4200, 3),

  -- Taverna Elia
  ('taverna-elia-leipzig', 1, '{"de":"Tzatziki","en":"Tzatziki"}'::jsonb, '{"de":"Mit Pitabrot","en":"With pita bread"}'::jsonb, 550, 1),
  ('taverna-elia-leipzig', 1, '{"de":"Gigantes","en":"Gigantes"}'::jsonb, '{"de":"Riesenbohnen in Tomatensauce, vegan","en":"Giant beans in tomato sauce, vegan"}'::jsonb, 690, 2),
  ('taverna-elia-leipzig', 1, '{"de":"Saganaki","en":"Saganaki"}'::jsonb, '{"de":"Gebratener Schafskäse mit Honig","en":"Pan-fried sheep cheese with honey"}'::jsonb, 790, 3),
  ('taverna-elia-leipzig', 2, '{"de":"Oktopus","en":"Octopus"}'::jsonb, '{"de":"Vom Grill, mit Zitrone und Oregano","en":"Grilled, with lemon and oregano"}'::jsonb, 2290, 1),
  ('taverna-elia-leipzig', 2, '{"de":"Lammkoteletts","en":"Lamb chops"}'::jsonb, '{"de":"Vier Stück, mit Ofenkartoffeln","en":"Four pieces, with roast potatoes"}'::jsonb, 2490, 2)
) as v(slug, cat, name, descr, price, ord)
join restaurants r on r.slug = v.slug
join menu_categories c on c.restaurant_id = r.id and c.sort_order = v.cat
where not exists (
  select 1 from menu_items mi
  where mi.category_id = c.id and mi.sort_order = v.ord
);

-- ============================================================
-- 4) Stollar
-- ============================================================
insert into restaurant_tables (restaurant_id, label, capacity)
select r.id, v.label, v.capacity
from (values
  ('anatolia-grill-berlin','A1',2),('anatolia-grill-berlin','A2',4),('anatolia-grill-berlin','A3',4),('anatolia-grill-berlin','A4',6),('anatolia-grill-berlin','A5',10),
  ('gruenkern-berlin','G1',2),('gruenkern-berlin','G2',2),('gruenkern-berlin','G3',4),('gruenkern-berlin','G4',6),
  ('koji-sushi-muenchen','K1',2),('koji-sushi-muenchen','K2',2),('koji-sushi-muenchen','K3',2),('koji-sushi-muenchen','K4',4),
  ('hanoi-kueche-hamburg','H1',2),('hanoi-kueche-hamburg','H2',2),('hanoi-kueche-hamburg','H3',4),('hanoi-kueche-hamburg','H4',4),
  ('brauhaus-sankt-martin-koeln','B1',4),('brauhaus-sankt-martin-koeln','B2',4),('brauhaus-sankt-martin-koeln','B3',8),('brauhaus-sankt-martin-koeln','B4',8),('brauhaus-sankt-martin-koeln','B5',12),
  ('masala-haus-frankfurt','M1',2),('masala-haus-frankfurt','M2',4),('masala-haus-frankfurt','M3',4),('masala-haus-frankfurt','M4',6),
  ('bistro-lumiere-stuttgart','L1',2),('bistro-lumiere-stuttgart','L2',2),('bistro-lumiere-stuttgart','L3',4),
  ('casa-iberica-duesseldorf','C1',2),('casa-iberica-duesseldorf','C2',4),('casa-iberica-duesseldorf','C3',4),('casa-iberica-duesseldorf','C4',6),('casa-iberica-duesseldorf','C5',8),
  ('taverna-elia-leipzig','T1',2),('taverna-elia-leipzig','T2',4),('taverna-elia-leipzig','T3',4),('taverna-elia-leipzig','T4',6),('taverna-elia-leipzig','T5',8)
) as v(slug, label, capacity)
join restaurants r on r.slug = v.slug
where not exists (
  select 1 from restaurant_tables rt
  where rt.restaurant_id = r.id and rt.label = v.label
);
