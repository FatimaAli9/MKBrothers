create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text not null default 'MK Brothers',
  price numeric not null check (price >= 0),
  original_price numeric check (original_price is null or original_price >= 0),
  category text not null check (category in ('men', 'women', 'luxury', 'oud', 'unisex')),
  image text not null default '',
  images jsonb not null default '[]'::jsonb,
  description text not null default '',
  notes jsonb not null default '{"top":[],"heart":[],"base":[]}'::jsonb,
  sizes jsonb not null default '[]'::jsonb,
  rating numeric not null default 0 check (rating >= 0 and rating <= 5),
  review_count integer not null default 0 check (review_count >= 0),
  in_stock boolean not null default true,
  featured boolean not null default false,
  is_new boolean not null default false,
  is_bestseller boolean not null default false,
  volume text not null default '',
  concentration text not null default '',
  reviews jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  phone text,
  address jsonb not null default '{}'::jsonb,
  wishlist jsonb not null default '[]'::jsonb,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

drop policy if exists "Users can read own profile" on public.user_profiles;
create policy "Users can read own profile"
on public.user_profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Admins can read profiles" on public.user_profiles;
create policy "Admins can read profiles"
on public.user_profiles
for select
to authenticated
using (
  exists (
    select 1 from public.user_profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
);

drop policy if exists "Users can insert own profile" on public.user_profiles;
create policy "Users can insert own profile"
on public.user_profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.user_profiles;
create policy "Users can update own profile"
on public.user_profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Anyone can read products" on public.products;
create policy "Anyone can read products"
on public.products
for select
to anon, authenticated
using (true);

drop policy if exists "Admin dashboard can insert products" on public.products;
create policy "Admin dashboard can insert products"
on public.products
for insert
to authenticated
with check (
  exists (
    select 1 from public.user_profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
);

drop policy if exists "Admin dashboard can update products" on public.products;
create policy "Admin dashboard can update products"
on public.products
for update
to authenticated
using (
  exists (
    select 1 from public.user_profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
)
with check (
  exists (
    select 1 from public.user_profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
);

drop policy if exists "Admin dashboard can delete products" on public.products;
create policy "Admin dashboard can delete products"
on public.products
for delete
to authenticated
using (
  exists (
    select 1 from public.user_profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
);

create or replace function public.set_product_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_product_updated_at on public.products;
create trigger set_product_updated_at
before update on public.products
for each row
execute function public.set_product_updated_at();

create table if not exists public.orders (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  user_name text not null,
  user_email text not null,
  items jsonb not null,
  subtotal numeric not null,
  shipping_cost numeric not null default 0,
  total numeric not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  payment_method text not null default 'cod' check (payment_method = 'cod'),
  address jsonb not null,
  phone text not null,
  email_sent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;

drop policy if exists "Customers can create their own orders" on public.orders;
create policy "Customers can create their own orders"
on public.orders
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Customers can read their own orders" on public.orders;
create policy "Customers can read their own orders"
on public.orders
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Admin dashboard can read all orders" on public.orders;
create policy "Admin dashboard can read all orders"
on public.orders
for select
to authenticated
using (
  exists (
    select 1 from public.user_profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
);

drop policy if exists "Customers can cancel recent pending orders" on public.orders;
create policy "Customers can cancel recent pending orders"
on public.orders
for update
to authenticated
using (
  auth.uid() = user_id
  and status in ('pending', 'confirmed')
  and created_at >= now() - interval '15 minutes'
)
with check (
  auth.uid() = user_id
  and status = 'cancelled'
);

drop policy if exists "Admin dashboard can update orders" on public.orders;
create policy "Admin dashboard can update orders"
on public.orders
for update
to authenticated
using (
  exists (
    select 1 from public.user_profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
)
with check (
  exists (
    select 1 from public.user_profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
);

drop policy if exists "Admin dashboard can delete terminal orders" on public.orders;
create policy "Admin dashboard can delete terminal orders"
on public.orders
for delete
to authenticated
using (
  status in ('cancelled', 'delivered')
  and exists (
    select 1 from public.user_profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
);

create or replace function public.set_order_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_order_updated_at on public.orders;
create trigger set_order_updated_at
before update on public.orders
for each row
execute function public.set_order_updated_at();
