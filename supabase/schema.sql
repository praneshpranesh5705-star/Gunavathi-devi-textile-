-- ===========================================================================
-- Gunavathi Tex — Supabase schema
-- ===========================================================================
-- Run this ONCE in your Supabase project:
--   Dashboard -> SQL Editor -> New query -> paste this whole file -> Run
--
-- It is safe to run more than once: every statement is idempotent.
--
-- What it creates:
--   1. `products` table (the catalogue)
--   2. Row Level Security so visitors can read published rows and only a
--      signed-in owner can write
--   3. `product-images` storage bucket + its access policies
--   4. The four original products as seed data
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- 1. The products table
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  name        text        not null,
  slug        text        not null unique,
  price       text        not null default '',
  unit        text        not null default '',
  description text        not null default '',
  image_url   text        not null default '',
  category    text        not null default 'Name Tape & Name Rope',
  sort_order  integer     not null default 0,
  published   boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- The storefront always queries published rows in sort order, so index that.
create index if not exists products_published_sort_idx
  on public.products (published, sort_order);


-- ---------------------------------------------------------------------------
-- 2. Keep updated_at honest
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();


-- ---------------------------------------------------------------------------
-- 3. Row Level Security
-- ---------------------------------------------------------------------------
-- This is the real security boundary. The admin UI hides buttons, but these
-- policies are what actually stop an unauthorised write — even if somebody
-- calls the Supabase REST API directly with the public anon key.
-- ---------------------------------------------------------------------------
alter table public.products enable row level security;

-- Visitors (and the owner) may read published products.
drop policy if exists "Published products are readable by everyone" on public.products;
create policy "Published products are readable by everyone"
  on public.products
  for select
  to anon, authenticated
  using (published = true);

-- The owner may read everything, including drafts.
drop policy if exists "Owner can read all products" on public.products;
create policy "Owner can read all products"
  on public.products
  for select
  to authenticated
  using (true);

-- Only a signed-in user may insert.
drop policy if exists "Owner can insert products" on public.products;
create policy "Owner can insert products"
  on public.products
  for insert
  to authenticated
  with check (true);

-- Only a signed-in user may update.
drop policy if exists "Owner can update products" on public.products;
create policy "Owner can update products"
  on public.products
  for update
  to authenticated
  using (true)
  with check (true);

-- Only a signed-in user may delete.
drop policy if exists "Owner can delete products" on public.products;
create policy "Owner can delete products"
  on public.products
  for delete
  to authenticated
  using (true);


-- ---------------------------------------------------------------------------
-- 4. Storage bucket for product photos
-- ---------------------------------------------------------------------------
-- Public bucket: anyone may VIEW a photo (the storefront needs to), but only
-- a signed-in owner may upload, replace or delete one.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880, -- 5 MB
  array['image/jpeg','image/png','image/webp','image/avif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Anyone may read a product photo.
drop policy if exists "Product images are publicly readable" on storage.objects;
create policy "Product images are publicly readable"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'product-images');

-- Only a signed-in owner may upload.
drop policy if exists "Owner can upload product images" on storage.objects;
create policy "Owner can upload product images"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'product-images');

-- Only a signed-in owner may replace.
drop policy if exists "Owner can update product images" on storage.objects;
create policy "Owner can update product images"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'product-images')
  with check (bucket_id = 'product-images');

-- Only a signed-in owner may delete.
drop policy if exists "Owner can delete product images" on storage.objects;
create policy "Owner can delete product images"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'product-images');


-- ---------------------------------------------------------------------------
-- 5. Seed the four original products
-- ---------------------------------------------------------------------------
-- These are the products that were previously hardcoded in the page. They are
-- inserted only if the table is empty, so re-running this file will not
-- duplicate them or overwrite edits you have made.
-- ---------------------------------------------------------------------------
insert into public.products (name, slug, price, unit, description, image_url, category, sort_order, published)
select * from (values
  (
    'Cotton Name Tape',
    'cotton-name-tape',
    '₹120',
    'per roll',
    'Durable woven name tapes for school uniforms, garments, bags and custom labelling.',
    'https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=900&q=85',
    'Name Tape & Name Rope',
    1,
    true
  ),
  (
    'Custom Printed Name Tape',
    'custom-printed-name-tape',
    '₹180',
    'per roll',
    'Custom name tapes with your required text, colour and finish for uniforms and garments.',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=85',
    'Name Tape & Name Rope',
    2,
    true
  ),
  (
    'Woven Name Rope',
    'woven-name-rope',
    '₹250',
    'per bundle',
    'Strong woven name ropes and textile cords suitable for garment and identification applications.',
    'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=85',
    'Name Tape & Name Rope',
    3,
    true
  ),
  (
    'Custom Textile Labels',
    'custom-textile-labels',
    '₹300',
    'per order',
    'Made-to-order textile labels and name products for schools, businesses and garment units.',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85',
    'Name Tape & Name Rope',
    4,
    true
  )
) as seed(name, slug, price, unit, description, image_url, category, sort_order, published)
where not exists (select 1 from public.products);


-- ---------------------------------------------------------------------------
-- Done. Next: create your owner account (see SETUP.md step 5).
-- ---------------------------------------------------------------------------
