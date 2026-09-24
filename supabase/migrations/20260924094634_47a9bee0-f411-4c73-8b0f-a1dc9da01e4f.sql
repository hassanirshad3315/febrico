
create type public.app_role as enum ('admin','editor');
create table public.user_roles (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, role app_role not null, unique(user_id, role));
grant select on public.user_roles to authenticated; grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create or replace function public.has_role(_user_id uuid, _role app_role) returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.user_roles where user_id=_user_id and role=_role) $$;
create policy "own roles" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "admin manage roles" on public.user_roles for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path=public as $$ begin new.updated_at = now(); return new; end $$;

create table public.categories (id uuid primary key default gen_random_uuid(), parent_id uuid references public.categories(id) on delete set null, name text not null, slug text not null unique, description text, image text, sort_order int not null default 0, published boolean not null default true, created_at timestamptz not null default now());
create table public.collections (id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique, description text, banner text, thumbnail text, featured boolean not null default false, status text not null default 'published' check (status in ('draft','published','scheduled')), starts_at timestamptz, ends_at timestamptz, sort_order int not null default 0, seo_title text, seo_description text, created_at timestamptz not null default now());
create table public.products (
 id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique, sku text not null unique,
 subtitle text, short_description text, description text, price int not null check (price>=0), sale_price int check (sale_price>=0),
 category_id uuid references public.categories(id) on delete set null, collection_id uuid references public.collections(id) on delete set null,
 fabric text, fit text, season text, care text, sizes text[] not null default '{}', colors text[] not null default '{}', tags text[] not null default '{}',
 images text[] not null default '{}', image_alts text[] not null default '{}', focal text not null default 'center top',
 stock int not null default 0, stock_status text not null default 'in_stock' check (stock_status in ('in_stock','low_stock','sold_out','coming_soon','pre_order')),
 status text not null default 'published' check (status in ('draft','published')),
 is_new boolean not null default false, is_featured boolean not null default false, is_trending boolean not null default false, is_best_seller boolean not null default false, on_sale boolean not null default false,
 seo_title text, seo_description text, related_ids uuid[] not null default '{}',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create index on public.products(category_id); create index on public.products(collection_id); create index on public.products(created_at desc);
create trigger t_products_upd before update on public.products for each row execute function public.touch_updated_at();
create table public.product_costs (product_id uuid primary key references public.products(id) on delete cascade, cost_price int not null default 0);

create table public.hero_slides (id uuid primary key default gen_random_uuid(), title text not null, subtitle text, cta_label text, cta_url text, cta2_label text, cta2_url text, image text not null, mobile_image text, video text, align text not null default 'left', overlay int not null default 30, focal text not null default 'center', sort_order int not null default 0, status text not null default 'published' check (status in ('draft','published','scheduled')), starts_at timestamptz, ends_at timestamptz, created_at timestamptz not null default now());
create table public.announcements (id uuid primary key default gen_random_uuid(), text text not null, mobile_text text, link text, priority int not null default 0, active boolean not null default true, starts_at timestamptz, ends_at timestamptz, countdown_to timestamptz, created_at timestamptz not null default now());
create table public.campaigns (id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique, type text not null default 'seasonal', headline text, description text, hero_image text, banner text, cta_label text, cta_url text, countdown_message text, show_countdown boolean not null default false, starts_at timestamptz, ends_at timestamptz, status text not null default 'published' check (status in ('draft','published','scheduled')), created_at timestamptz not null default now());
create table public.campaign_products (campaign_id uuid references public.campaigns(id) on delete cascade, product_id uuid references public.products(id) on delete cascade, sort_order int not null default 0, primary key(campaign_id, product_id));
create table public.lookbooks (id uuid primary key default gen_random_uuid(), title text not null, slug text not null unique, description text, cover text, status text not null default 'published', sort_order int not null default 0, created_at timestamptz not null default now());
create table public.lookbook_items (id uuid primary key default gen_random_uuid(), lookbook_id uuid not null references public.lookbooks(id) on delete cascade, image text not null, caption text, hotspots jsonb not null default '[]', sort_order int not null default 0);
create table public.homepage_sections (id uuid primary key default gen_random_uuid(), type text not null, title text, subtitle text, enabled boolean not null default true, sort_order int not null default 0, config jsonb not null default '{}');
create table public.site_settings (key text primary key, value jsonb not null, updated_at timestamptz not null default now());
create table public.pages (slug text primary key, title text not null, content text not null default '', seo_title text, seo_description text, updated_at timestamptz not null default now());
create table public.media_assets (id uuid primary key default gen_random_uuid(), url text not null, name text, alt text, created_at timestamptz not null default now());

create table public.orders (id uuid primary key default gen_random_uuid(), order_number bigint generated always as identity (start with 10001), customer_name text, phone text, city text, source text not null default 'bag', status text not null default 'whatsapp_opened' check (status in ('new_inquiry','whatsapp_opened','contacted','confirmed','processing','shipped','delivered','cancelled')), total int not null default 0, notes text, session_id text, campaign_slug text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create index on public.orders(created_at desc); create index on public.orders(status);
create trigger t_orders_upd before update on public.orders for each row execute function public.touch_updated_at();
create table public.order_items (id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade, product_id uuid references public.products(id) on delete set null, product_name text not null, sku text, size text, color text, qty int not null default 1 check (qty>0 and qty<100), unit_price int not null default 0);
create index on public.order_items(order_id); create index on public.order_items(product_id);
create table public.order_events (id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade, status text not null, note text, created_at timestamptz not null default now());
create table public.analytics_events (id bigint generated always as identity primary key, event_type text not null check (event_type in ('page_view','product_view','collection_view','campaign_view','search','wishlist_add','wishlist_remove','quick_view','product_click','whatsapp_click','whatsapp_inquiry','bag_add','cta_click')), product_id uuid references public.products(id) on delete set null, collection_id uuid references public.collections(id) on delete set null, campaign_slug text, source text, session_id text, path text, query text, created_at timestamptz not null default now());
create index on public.analytics_events(created_at desc); create index on public.analytics_events(product_id, created_at); create index on public.analytics_events(event_type, created_at);
create table public.notify_requests (id uuid primary key default gen_random_uuid(), product_id uuid references public.products(id) on delete cascade, contact text not null check (char_length(contact) between 5 and 120), consent boolean not null check (consent), created_at timestamptz not null default now());
create table public.newsletter_subscribers (id uuid primary key default gen_random_uuid(), email text not null unique check (char_length(email) between 5 and 255), created_at timestamptz not null default now());

-- grants
grant select on public.categories, public.collections, public.products, public.hero_slides, public.announcements, public.campaigns, public.campaign_products, public.lookbooks, public.lookbook_items, public.homepage_sections, public.site_settings, public.pages to anon, authenticated;
grant insert, update, delete on public.categories, public.collections, public.products, public.hero_slides, public.announcements, public.campaigns, public.campaign_products, public.lookbooks, public.lookbook_items, public.homepage_sections, public.site_settings, public.pages, public.media_assets, public.product_costs, public.orders, public.order_items, public.order_events, public.notify_requests, public.newsletter_subscribers to authenticated;
grant select on public.media_assets, public.product_costs, public.orders, public.order_items, public.order_events, public.analytics_events, public.notify_requests, public.newsletter_subscribers to authenticated;
grant insert on public.analytics_events, public.notify_requests, public.newsletter_subscribers to anon, authenticated;
grant all on all tables in schema public to service_role;

do $$ declare t text; begin
 foreach t in array array['categories','collections','products','hero_slides','announcements','campaigns','campaign_products','lookbooks','lookbook_items','homepage_sections','site_settings','pages','media_assets','product_costs','orders','order_items','order_events','analytics_events','notify_requests','newsletter_subscribers'] loop
  execute format('alter table public.%I enable row level security', t);
  execute format('create policy "admin all %s" on public.%I for all to authenticated using (public.has_role(auth.uid(),''admin'')) with check (public.has_role(auth.uid(),''admin''))', t, t);
 end loop; end $$;

create policy "public cats" on public.categories for select using (published);
create policy "public cols" on public.collections for select using (status='published' or (status='scheduled' and coalesce(starts_at,now())<=now() and coalesce(ends_at,now()+interval '1 day')>now()));
create policy "public prods" on public.products for select using (status='published');
create policy "public hero" on public.hero_slides for select using (status in ('published','scheduled') and coalesce(starts_at,now())<=now() and coalesce(ends_at,now()+interval '1 day')>now());
create policy "public ann" on public.announcements for select using (active and coalesce(starts_at,now())<=now() and coalesce(ends_at,now()+interval '1 day')>now());
create policy "public camp" on public.campaigns for select using (status in ('published','scheduled') and coalesce(starts_at,now())<=now() and coalesce(ends_at,now()+interval '1 day')>now());
create policy "public camp prods" on public.campaign_products for select using (true);
create policy "public lb" on public.lookbooks for select using (status='published');
create policy "public lbi" on public.lookbook_items for select using (true);
create policy "public sections" on public.homepage_sections for select using (true);
create policy "public settings" on public.site_settings for select using (key not like 'private_%');
create policy "public pages" on public.pages for select using (true);
create policy "anon events" on public.analytics_events for insert to anon, authenticated with check (char_length(coalesce(session_id,'')) <= 64 and char_length(coalesce(path,'')) <= 300 and char_length(coalesce(query,'')) <= 120);
create policy "anon notify" on public.notify_requests for insert to anon, authenticated with check (consent);
create policy "anon news" on public.newsletter_subscribers for insert to anon, authenticated with check (true);

-- ranking
create or replace function public.ranked_products(_metric text, _limit int default 12)
returns table(product_id uuid, score numeric) language plpgsql stable security definer set search_path=public as $$
declare w jsonb; tz text := 'Asia/Karachi'; now_l timestamp := (now() at time zone tz); wk_start timestamptz; mo_start timestamptz;
begin
 wk_start := date_trunc('week', now_l) at time zone tz;
 mo_start := date_trunc('month', now_l) at time zone tz;
 select value into w from site_settings where key='private_trending_weights';
 w := coalesce(w, '{"view":1,"interaction":2,"whatsapp":5,"order":10,"growth":3}');
 if _metric = 'best_sellers' then
  return query select oi.product_id, sum(oi.qty)::numeric from order_items oi join orders o on o.id=oi.order_id join products p on p.id=oi.product_id
   where o.status in ('confirmed','processing','shipped','delivered') and p.status='published' group by 1 order by 2 desc limit _limit;
 elsif _metric = 'top_week' then
  return query select e.product_id, count(distinct e.session_id)::numeric + coalesce((select sum(oi.qty)*5 from order_items oi join orders o on o.id=oi.order_id where oi.product_id=e.product_id and o.status in ('confirmed','processing','shipped','delivered') and o.created_at>=wk_start),0)
   from analytics_events e join products p on p.id=e.product_id and p.status='published' where e.created_at >= wk_start and e.event_type in ('product_view','whatsapp_click','wishlist_add','bag_add') group by e.product_id order by 2 desc limit _limit;
 elsif _metric = 'most_loved' then
  return query select p.id, (coalesce((select sum(oi.qty) from order_items oi join orders o on o.id=oi.order_id where oi.product_id=p.id and o.status in ('confirmed','processing','shipped','delivered') and o.created_at>=mo_start),0)*3
    + (select count(*) from analytics_events e where e.product_id=p.id and e.created_at>=mo_start and e.event_type in ('wishlist_add','whatsapp_click')))::numeric s
   from products p where p.status='published' order by s desc limit _limit;
 else -- trending
  return query with cur as (
    select e.product_id,
     sum(case when e.event_type='product_view' then (w->>'view')::numeric when e.event_type in ('wishlist_add','quick_view','product_click','bag_add') then (w->>'interaction')::numeric when e.event_type in ('whatsapp_click','whatsapp_inquiry') then (w->>'whatsapp')::numeric else 0 end) s
    from analytics_events e where e.created_at >= now()-interval '7 days' and e.product_id is not null group by 1),
   prev as (select e.product_id, count(*)::numeric c from analytics_events e where e.created_at >= now()-interval '14 days' and e.created_at < now()-interval '7 days' and e.product_id is not null group by 1),
   ord as (select oi.product_id, sum(oi.qty)::numeric q from order_items oi join orders o on o.id=oi.order_id where o.status in ('confirmed','processing','shipped','delivered') and o.created_at>=now()-interval '7 days' group by 1)
   select c.product_id, c.s + coalesce(ord.q,0)*(w->>'order')::numeric + greatest(c.s - coalesce(prev.c,0),0)/greatest(coalesce(prev.c,1),1)*(w->>'growth')::numeric
   from cur c join products p on p.id=c.product_id and p.status='published' left join prev on prev.product_id=c.product_id left join ord on ord.product_id=c.product_id order by 2 desc limit _limit;
 end if;
end $$;
grant execute on function public.ranked_products(text,int) to anon, authenticated;

create or replace function public.ranked_collections(_period text, _limit int default 2)
returns table(collection_id uuid, score numeric) language plpgsql stable security definer set search_path=public as $$
declare tz text := 'Asia/Karachi'; st timestamptz; begin
 st := case when _period='month' then date_trunc('month', now() at time zone tz) at time zone tz else date_trunc('week', now() at time zone tz) at time zone tz end;
 return query select c.id, (select count(*) from analytics_events e left join products p on p.id=e.product_id where e.created_at>=st and (e.collection_id=c.id or p.collection_id=c.id))::numeric s
  from collections c where c.status='published' order by s desc limit _limit;
end $$;
grant execute on function public.ranked_collections(text,int) to anon, authenticated;

-- storage
create policy "media public read" on storage.objects for select using (bucket_id='media');
create policy "media admin write" on storage.objects for insert to authenticated with check (bucket_id='media' and public.has_role(auth.uid(),'admin'));
create policy "media admin update" on storage.objects for update to authenticated using (bucket_id='media' and public.has_role(auth.uid(),'admin'));
create policy "media admin delete" on storage.objects for delete to authenticated using (bucket_id='media' and public.has_role(auth.uid(),'admin'));

-- ============ SEED ============
insert into public.categories (name, slug, description, image, sort_order) values
('Ready To Wear','ready-to-wear','Stitched pieces, ready the moment they arrive.','/images/look-4.jpg',1),
('Unstitched','unstitched','Premium fabrics to tailor your way.','/images/look-6.jpg',2),
('Suits','suits','Two and three piece suits for every day and occasion.','/images/look-1.jpg',3),
('Dresses','dresses','Flowing silhouettes and modern cuts.','/images/look-2.jpg',4),
('Co-Ords','co-ords','Matched sets with effortless ease.','/images/look-3.jpg',5),
('Tops','tops','Kurtas and shirts to layer and repeat.','/images/look-4.jpg',6),
('Bottoms','bottoms','Trousers, shalwars and culottes.','/images/look-6.jpg',7),
('Shawls & Dupattas','shawls-dupattas','Finishing layers in chiffon, organza and wool.','/images/hero-1.jpg',8),
('Accessories','accessories','Considered details.','/images/look-5.jpg',9);
insert into public.categories (name, slug, parent_id, sort_order) select '2 Piece','2-piece',id,1 from public.categories where slug='unstitched';
insert into public.categories (name, slug, parent_id, sort_order) select '3 Piece','3-piece',id,2 from public.categories where slug='unstitched';

insert into public.collections (name, slug, description, banner, thumbnail, featured, sort_order) values
('New Season','new-season','The latest silhouettes, textures and colour stories.','/images/hero-1.jpg','/images/look-1.jpg',true,1),
('Signature','signature','Refined essentials in our most considered fabrics.','/images/look-1.jpg','/images/look-1.jpg',true,2),
('Festive','festive','Embellished pieces for celebrations and evenings.','/images/hero-2.jpg','/images/look-5.jpg',true,3),
('Casual','casual','Easy prints and relaxed cuts for everyday.','/images/look-3.jpg','/images/look-3.jpg',false,4),
('Formal','formal','Velvet, raw silk and heirloom embroidery.','/images/look-2.jpg','/images/look-2.jpg',true,5),
('Winter','winter','Khaddar, karandi and velvet for cooler days.','/images/hero-1.jpg','/images/look-2.jpg',false,6),
('Summer','summer','Breathable lawn and cambric in soft palettes.','/images/look-6.jpg','/images/look-6.jpg',false,7),
('Sale','sale','Selected styles at reduced prices.','/images/look-4.jpg','/images/look-4.jpg',false,8);

with src(n, name, cat, col, fabric, season, price, sale, img1, img2, colors, tags) as (values
 (1,'Ivory Embroidered Raw Silk 3 Piece','suits','signature','Raw Silk','All Season',24500,null,'look-1','look-5','{Ivory}','{embroidered,formal}'),
 (2,'Noir Velvet Embroidered Kurta','dresses','formal','Velvet','Winter',28900,null,'look-2','look-1','{Black}','{velvet,embroidered,formal}'),
 (3,'Rose Printed Lawn Co-Ord Set','co-ords','casual','Lawn','Summer',8900,6900,'look-3','look-6','{Rose,Pink}','{printed,lawn}'),
 (4,'Sage Khaddar 3 Piece Suit','suits','winter','Khaddar','Winter',12900,null,'look-1','look-2','{Sage}','{khaddar,winter}'),
 (5,'Mustard Embroidered Cambric Kurta','tops','new-season','Cambric','All Season',7900,null,'look-4','look-3','{Mustard}','{embroidered,cambric}'),
 (6,'Emerald Raw Silk Festive Suit','suits','festive','Raw Silk','All Season',32500,null,'look-5','look-2','{Emerald}','{festive,gota}'),
 (7,'Sky Printed Lawn 3 Piece','unstitched','summer','Lawn','Summer',6500,null,'look-6','look-3','{Sky Blue}','{printed,lawn,unstitched}'),
 (8,'Champagne Organza Formal Gown','dresses','festive','Organza','All Season',45000,null,'look-1','look-5','{Champagne}','{formal,organza}'),
 (9,'Blush Chiffon Dupatta','shawls-dupattas','signature','Chiffon','All Season',3900,2900,'look-3','look-1','{Blush}','{dupatta}'),
 (10,'Olive Karandi Embroidered Shawl','shawls-dupattas','winter','Karandi','Winter',5900,null,'look-1','look-2','{Olive}','{shawl,winter}'),
 (11,'Ivory Cambric Straight Trousers','bottoms','signature','Cambric','All Season',3500,null,'look-4','look-6','{Ivory}','{trousers}'),
 (12,'Midnight Velvet 2 Piece','suits','formal','Velvet','Winter',26500,21900,'look-2','look-5','{Black,Navy}','{velvet}'),
 (13,'Powder Blue Embroidered Lawn 2 Piece','unstitched','summer','Lawn','Summer',5900,null,'look-6','look-4','{Powder Blue}','{lawn,unstitched,embroidered}'),
 (14,'Terracotta Printed Khaddar Kurta','tops','winter','Khaddar','Winter',6900,null,'look-4','look-3','{Terracotta}','{printed,khaddar}'),
 (15,'Pearl Net Embellished Suit','suits','festive','Net','All Season',38900,null,'look-1','look-5','{Pearl}','{festive,embellished}'),
 (16,'Dusty Rose Cotton Co-Ord','co-ords','new-season','Cotton','Summer',9500,null,'look-3','look-4','{Dusty Rose}','{co-ord}'),
 (17,'Jade Gota Organza Dupatta','shawls-dupattas','festive','Organza','All Season',4900,null,'look-5','look-1','{Jade}','{gota,dupatta}'),
 (18,'Onyx Silk Culottes','bottoms','formal','Silk','All Season',5500,4400,'look-2','look-4','{Black}','{culottes}'),
 (19,'Saffron Cambric 3 Piece Unstitched','unstitched','new-season','Cambric','All Season',7500,null,'look-4','look-6','{Saffron}','{unstitched,cambric}'),
 (20,'Seafoam Lawn Shirt','tops','summer','Lawn','Summer',4500,3500,'look-6','look-3','{Seafoam}','{lawn}'),
 (21,'Ivory Pearl Clutch','accessories','signature','Satin','All Season',4200,null,'look-1','look-4','{Ivory}','{clutch}'),
 (22,'Bottle Green Velvet Shawl','shawls-dupattas','winter','Velvet','Winter',8900,null,'look-5','look-2','{Bottle Green}','{velvet,shawl}'),
 (23,'Blossom Printed Lawn Kurta','tops','casual','Lawn','Summer',4900,null,'look-3','look-6','{Pink}','{printed}'),
 (24,'Heritage Jamawar 3 Piece','suits','signature','Jamawar','Winter',21500,null,'look-2','look-1','{Maroon,Gold}','{jamawar,heritage}')
)
insert into public.products (name, slug, sku, subtitle, short_description, description, price, sale_price, category_id, collection_id, fabric, fit, season, care, sizes, colors, tags, images, image_alts, stock, stock_status, is_new, is_featured, is_trending, is_best_seller, on_sale, seo_title, seo_description, created_at)
select s.name, lower(regexp_replace(s.name,'[^a-zA-Z0-9]+','-','g')), 'FB-' || lpad(s.n::text,4,'0'),
 s.fabric || ' · ' || initcap(replace(s.col,'-',' ')),
 'A ' || lower(s.fabric) || ' piece from the ' || initcap(replace(s.col,'-',' ')) || ' edit.',
 'Crafted in ' || lower(s.fabric) || ', this piece balances traditional craft with a contemporary silhouette. Final details, measurements and availability are confirmed on WhatsApp before dispatch.',
 s.price, s.sale, (select id from public.categories c where c.slug=s.cat), (select id from public.collections c where c.slug=s.col),
 s.fabric, case when s.cat in ('unstitched','shawls-dupattas','accessories') then null else 'Regular fit' end, s.season,
 'Dry clean recommended. Iron on low heat on the reverse.',
 case when s.cat in ('unstitched','shawls-dupattas','accessories') then '{One Size}'::text[] else '{XS,S,M,L,XL}'::text[] end,
 s.colors::text[], s.tags::text[], array['/images/'||s.img1||'.jpg','/images/'||s.img2||'.jpg'],
 array[s.name||' — front view', s.name||' — styled view'],
 case when s.n in (8,15) then 3 when s.n=10 then 0 else 20 + s.n end,
 case when s.n in (8,15) then 'low_stock' when s.n=10 then 'sold_out' when s.n=22 then 'pre_order' else 'in_stock' end,
 s.n % 3 = 0 or s.col='new-season', s.n in (1,6,8,15), false, false, s.sale is not null,
 s.name || ' | FABRICO', 'Shop the ' || s.name || ' in ' || lower(s.fabric) || ' from FABRICO.',
 now() - (s.n || ' days')::interval
from src s;
insert into public.product_costs (product_id, cost_price) select id, (price*0.45)::int from public.products;

insert into public.hero_slides (title, subtitle, cta_label, cta_url, cta2_label, cta2_url, image, align, overlay, focal, sort_order) values
('The Art of Everyday Elegance','Discover the latest FABRICO collection.','Shop New Arrivals','/new-in','Explore the Collection','/collections/new-season','/images/hero-1.jpg','left',25,'70% center',1),
('Made For The Moment','Festive pieces in raw silk, net and organza.','Shop Festive','/collections/festive','View Lookbook','/lookbook','/images/hero-2.jpg','right',35,'30% center',2);

insert into public.announcements (text, mobile_text, link, priority) values
('New season has arrived — shop the latest collection','New season has arrived','/new-in',2),
('Selected styles now reduced — shop the sale','Sale now on','/collections/sale',1);

insert into public.campaigns (name, slug, type, headline, description, hero_image, banner, cta_label, cta_url, countdown_message, show_countdown, starts_at, ends_at) values
('The Winter Edit','winter-edit','seasonal','The Winter Edit','Khaddar, karandi and velvet — layered for cooler days.','/images/hero-1.jpg','/images/look-2.jpg','Shop Winter','/collections/winter',null,false,now()-interval '10 days',now()+interval '60 days'),
('Festive Moments','festive-moments','festive','Festive Moments','Embellished silhouettes for celebrations and evenings.','/images/hero-2.jpg','/images/look-5.jpg','Shop Festive','/collections/festive',null,false,now()-interval '5 days',now()+interval '45 days'),
('Season Sale','season-sale','sale','Up to 25% Off Selected Styles','A limited selection of pieces at reduced prices.','/images/look-4.jpg','/images/look-3.jpg','Shop Sale','/collections/sale','Sale ends in',true,now()-interval '2 days',now()+interval '9 days');
insert into public.campaign_products (campaign_id, product_id, sort_order) select c.id, p.id, row_number() over () from public.campaigns c join public.products p on (c.slug='winter-edit' and p.season='Winter') or (c.slug='festive-moments' and p.tags && '{festive,formal,gota}') or (c.slug='season-sale' and p.on_sale);

insert into public.lookbooks (title, slug, description, cover) values ('Modern Pakistani Classics','modern-classics','Six looks exploring craft, colour and quiet confidence.','/images/look-1.jpg');
insert into public.lookbook_items (lookbook_id, image, caption, hotspots, sort_order)
select l.id, x.img, x.cap, (select coalesce(jsonb_agg(jsonb_build_object('x',h.x,'y',h.y,'product_id',p.id)),'[]') from (values (x.s1,45,40),(x.s2,55,78)) h(sku,x,y) join public.products p on p.sku=h.sku), x.o
from public.lookbooks l, (values ('/images/look-1.jpg','Ivory raw silk, hand-finished.','FB-0001','FB-0009',1),('/images/look-2.jpg','Velvet after dark.','FB-0002','FB-0018',2),('/images/look-5.jpg','Emerald and gota for the festive season.','FB-0006','FB-0017',3),('/images/look-3.jpg','Printed ease.','FB-0003','FB-0023',4)) x(img,cap,s1,s2,o);

insert into public.homepage_sections (type, title, subtitle, sort_order, config) values
('hero',null,null,1,'{}'),('trust',null,null,2,'{}'),
('categories','Shop by Category','Find your next piece',3,'{}'),
('featured_collection','Featured Collection',null,4,'{"collection_slug":"new-season"}'),
('product_carousel','New In','Just arrived',5,'{"source":"new","limit":10,"cta_label":"View All New Arrivals","cta_url":"/new-in"}'),
('editorial','The Winter Edit','Khaddar, karandi and velvet — layered for cooler days.',6,'{"image":"/images/look-2.jpg","cta_label":"Explore","cta_url":"/campaign/winter-edit","align":"left"}'),
('product_carousel','Top This Week',null,7,'{"source":"top_week","limit":10,"badge":"Trending This Week"}'),
('top_collection','Top Collection This Week',null,8,'{"period":"week"}'),
('product_carousel','Trending Now',null,9,'{"source":"trending","limit":10}'),
('occasions','Shop by Occasion',null,10,'{"items":[{"title":"Everyday Elegance","url":"/collections/casual","image":"/images/look-3.jpg"},{"title":"Festive Moments","url":"/collections/festive","image":"/images/look-5.jpg"},{"title":"Formal Edit","url":"/collections/formal","image":"/images/look-2.jpg"},{"title":"Summer Essentials","url":"/collections/summer","image":"/images/look-6.jpg"}]}'),
('product_carousel','Best Sellers',null,11,'{"source":"best_sellers","limit":10,"badge":"Best Seller"}'),
('lookbook','Modern Pakistani Classics','The Lookbook',12,'{"lookbook_slug":"modern-classics"}'),
('product_carousel','Most Loved This Month',null,13,'{"source":"most_loved","limit":10}'),
('top_collection','Top Collection This Month',null,14,'{"period":"month"}'),
('shop_the_look','Shop The Look',null,15,'{"lookbook_slug":"modern-classics","index":2}'),
('social','@fabrico',null,16,'{"items":[{"image":"/images/look-1.jpg","url":"/product/ivory-embroidered-raw-silk-3-piece"},{"image":"/images/look-3.jpg","url":"/collections/casual"},{"image":"/images/look-5.jpg","url":"/collections/festive"},{"image":"/images/look-6.jpg","url":"/collections/summer"},{"image":"/images/look-2.jpg","url":"/collections/formal"},{"image":"/images/look-4.jpg","url":"/new-in"}]}'),
('brand_story','FABRICO','Discover contemporary Pakistani fashion with FABRICO — where modern silhouettes meet timeless elegance.',17,'{"image":"/images/hero-1.jpg","cta_label":"About Us","cta_url":"/about"}'),
('whatsapp_cta','Order in one message','Browse, add to your bag and send your order on WhatsApp. Our team confirms availability and delivery.',18,'{}'),
('newsletter','Join the FABRICO Edit','New arrivals, campaigns and early access — occasionally, never noisily.',19,'{}');

insert into public.site_settings (key, value) values
('whatsapp','{"number":"923000000000","label":"Chat with FABRICO","default_message":"Hello FABRICO, I have a question."}'),
('whatsapp_template','{"greeting":"Hello FABRICO,\nI would like to place an order for:","item":"{{index}}. {{product_name}}\nSKU: {{sku}}\nSize: {{size}}\nColor: {{color}}\nQty: {{quantity}}\nPrice: PKR {{price}}\n{{product_url}}","total":"Total: PKR {{total}}","closing":"Please confirm availability and delivery details."}'),
('trust','{"items":["Secure Ordering","WhatsApp Support","Pakistan-Wide Delivery","Easy Returns"]}'),
('footer','{"tagline":"Modern Pakistani fashion, thoughtfully designed.","instagram":"https://instagram.com","facebook":"https://facebook.com","tiktok":"https://tiktok.com"}'),
('seo','{"site_title":"FABRICO — Modern Pakistani Fashion","site_description":"Contemporary Pakistani women''s fashion: ready to wear, unstitched, festive and formal. Order easily on WhatsApp."}'),
('size_chart','{"unit":"inches","rows":[["XS","32","26","35","38"],["S","34","28","37","39"],["M","36","30","39","40"],["L","39","33","42","41"],["XL","42","36","45","42"]],"columns":["Size","Bust","Waist","Hip","Shirt Length"],"notes":"Measurements are body measurements. Garment measurements vary by style — ask on WhatsApp for specifics."}'),
('private_trending_weights','{"view":1,"interaction":2,"whatsapp":5,"order":10,"growth":3}'),
('mega_menu','{"promo_image":"/images/look-5.jpg","promo_title":"Festive Moments","promo_url":"/campaign/festive-moments"}');

insert into public.pages (slug, title, content) values
('about','About FABRICO','FABRICO is a contemporary Pakistani fashion label.\n\nOur official story is coming soon. In the meantime, explore our collections and reach us anytime on WhatsApp.'),
('contact','Contact','The quickest way to reach us is WhatsApp. Use the chat button on any page and our team will respond during business hours.'),
('shipping','Shipping','Delivery timelines and charges are confirmed on WhatsApp when your order is placed. We deliver across Pakistan.'),
('returns','Returns & Exchanges','Please contact us on WhatsApp within the return window stated on your order confirmation. Items must be unworn with tags attached.'),
('faqs','Frequently Asked Questions','How do I order?\nAdd pieces to your bag and tap Proceed to WhatsApp. We confirm availability, delivery and payment in chat.\n\nIs an account required?\nNo. You can order without an account.\n\nHow do I find my size?\nSee our Size Guide, or ask us on WhatsApp.'),
('size-guide','Size Guide','How to measure:\nBust — around the fullest part.\nWaist — around the natural waistline.\nHip — around the fullest part of the hips.'),
('privacy','Privacy Policy','We collect only what is needed to process your enquiries and orders. Anonymous browsing data helps us improve the store.'),
('terms','Terms of Service','Orders are confirmed only after our team verifies availability on WhatsApp.');

-- sample analytics
insert into public.analytics_events (event_type, product_id, collection_id, source, session_id, path, created_at)
select (array['product_view','product_view','product_view','product_view','quick_view','wishlist_add','whatsapp_click','bag_add','product_click'])[1+floor(random()*9)::int],
 p.id, p.collection_id, (array['product_page','quick_view','bag','floating'])[1+floor(random()*4)::int],
 'seed-' || floor(random()*400)::int, '/product/' || p.slug, now() - (random()*40 || ' days')::interval
from generate_series(1,2500) g cross join lateral (select * from public.products order by random()+g*0 limit 1) p;
insert into public.analytics_events (event_type, session_id, path, created_at)
select 'page_view', 'seed-' || floor(random()*400)::int, '/', now() - (random()*40 || ' days')::interval from generate_series(1,1500);

-- sample orders
do $$ declare i int; oid uuid; st text; p record; q int; begin
 for i in 1..28 loop
  st := (array['whatsapp_opened','contacted','confirmed','confirmed','processing','shipped','delivered','delivered','cancelled'])[1+floor(random()*9)::int];
  insert into public.orders (customer_name, phone, city, source, status, created_at) values
   ((array['Ayesha Khan','Mahnoor Ali','Fatima Raza','Sana Malik','Hira Qureshi','Zainab Shah','Amna Tariq','Iqra Butt'])[1+floor(random()*8)::int], '0300' || lpad(floor(random()*9999999)::text,7,'0'),
    (array['Lahore','Karachi','Islamabad','Faisalabad','Multan'])[1+floor(random()*5)::int], (array['bag','product_page','quick_view','floating','campaign'])[1+floor(random()*5)::int], st, now() - (random()*35 || ' days')::interval) returning id into oid;
  for p in select * from public.products order by random() limit 1+floor(random()*3)::int loop
   q := 1+floor(random()*2)::int;
   insert into public.order_items (order_id, product_id, product_name, sku, size, color, qty, unit_price) values (oid, p.id, p.name, p.sku, p.sizes[1+floor(random()*array_length(p.sizes,1))::int], p.colors[1], q, coalesce(p.sale_price,p.price));
  end loop;
  update public.orders set total=(select sum(qty*unit_price) from public.order_items where order_id=oid) where id=oid;
  insert into public.order_events (order_id, status, note) values (oid, st, 'Seeded');
 end loop; end $$;
