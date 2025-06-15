
-- Orders table to track purchases for both Stripe and PayPal
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  course_id int not null references public.courses(id) on delete cascade,
  provider text not null, -- 'stripe' or 'paypal'
  provider_order_id text, -- Stripe session id, PayPal order id etc
  status text not null default 'pending', -- pending/paid/failed/cancelled
  amount numeric,
  currency text default 'usd',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.orders enable row level security;

-- Only order owner can select
create policy "User can view their own orders"
  on public.orders for select
  using (user_id = auth.uid());

-- User can insert their own order
create policy "User can create their own order"
  on public.orders for insert
  with check (user_id = auth.uid());

-- User can update their own orders
create policy "User can update their own order"
  on public.orders for update
  using (user_id = auth.uid());

