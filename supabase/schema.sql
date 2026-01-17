-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PRODUCTS TABLE
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  slug text not null unique,
  description text,
  price decimal(10,2) not null,
  image text,
  category text,
  is_new boolean default false,
  is_sale boolean default false,
  inventory_count integer default 0
);

-- COLLECTIONS TABLE
create table public.collections (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  slug text not null unique,
  description text,
  image text
);

-- PRODUCT_COLLECTIONS (Many-to-Many)
create table public.product_collections (
  product_id uuid references public.products(id) on delete cascade,
  collection_id uuid references public.collections(id) on delete cascade,
  primary key (product_id, collection_id)
);

-- ORDERS TABLE
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_email text not null,
  status text default 'pending', -- pending, paid, shipped, delivered, cancelled
  total decimal(10,2) not null,
  shipping_address jsonb
);

-- ORDER ITEMS TABLE
create table public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  quantity integer not null,
  price_at_time decimal(10,2) not null,
  selected_variant jsonb -- { size: "M", color: "Black" }
);

-- ENABLE ROW LEVEL SECURITY
alter table public.products enable row level security;
alter table public.collections enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- RLS POLICIES

-- Products are readable by everyone, writable by service role only (admin)
create policy "Products are viewable by everyone" on public.products
  for select using (true);

-- Collections are readable by everyone
create policy "Collections are viewable by everyone" on public.collections
  for select using (true);

-- Orders: Users can insert their own orders (conceptually), but usually handled by backend/payment webhook. 
-- For now, allow insert for public (demo mode) or authenticated users.
create policy "Anyone can create orders" on public.orders
  for insert with check (true);
  
create policy "Users can view their own orders via email lookup" on public.orders
  for select using (true); -- Simplified for demo; ideally filter by auth.uid()

-- Order Items
create policy "Anyone can create order items" on public.order_items
  for insert with check (true);

create policy "Items viewable related to order" on public.order_items
  for select using (true);

-- STORAGE BUCKETS (Optional: for manually uploading images later)
insert into storage.buckets (id, name, public) values ('products', 'products', true);
create policy "Public Access" on storage.objects for select using ( bucket_id = 'products' );
