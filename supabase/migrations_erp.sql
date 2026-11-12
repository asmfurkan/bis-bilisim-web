-- ERP geliştirmeleri: ortak cari (customers), döviz kuru (exchange_rates) ve USD işlemleri.
-- Supabase Dashboard > SQL Editor içinde bir kez çalıştırın (tekrar çalıştırmak güvenlidir).

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.exchange_rates (
  currency text primary key,
  rate numeric(12,4) not null,
  updated_at timestamptz not null default now()
);

-- USD kayıtlarda amount / paid_amount dolar cinsindendir; usd_amount aynı tutarı ayrıca saklar.
alter table public.transactions
  add column if not exists currency text not null default 'TRY',
  add column if not exists usd_amount numeric(14,2);

-- Mevcut müşteri adlarını cari listesine aktar
insert into public.customers (name, phone)
select distinct on (name) name, phone from (
  select customer_name as name, phone from public.devices
  union all
  select coalesce(customer_name, contact_name), customer_phone from public.transactions
) s
where name is not null and btrim(name) <> '' and name <> '—'
on conflict (name) do nothing;

alter table public.customers enable row level security;
alter table public.exchange_rates enable row level security;
-- Policy yok: yalnızca service_role (API route'ları) erişir.
