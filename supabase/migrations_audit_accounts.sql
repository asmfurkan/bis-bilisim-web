-- Denetim kaydı, kasa/banka hesapları ve işlem anı kuru.
-- Supabase SQL Editor'da bir kez çalıştırın (tekrar çalıştırmak güvenlidir).

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  entity text not null,            -- transaction | payment | customer | account | import
  entity_id text,
  action text not null,            -- create | update | delete | restore | import
  summary text,
  snapshot jsonb,                  -- silme/güncelleme öncesi kayıt (geri getirmek için)
  restored_at timestamptz
);
create index if not exists audit_log_created_idx on public.audit_log (created_at desc);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  kind text not null default 'kasa', -- kasa | banka
  opening_balance numeric(14,2) not null default 0,
  created_at timestamptz not null default now()
);

alter table public.payment_logs add column if not exists account_id uuid references public.accounts(id) on delete set null;
alter table public.payment_logs add column if not exists rate numeric(14,4);   -- ödeme anındaki USD kuru
alter table public.transactions add column if not exists rate numeric(14,4);   -- kayıt anındaki USD kuru

insert into public.accounts (name, kind) values ('Nakit Kasa', 'kasa'), ('Banka', 'banka')
on conflict (name) do nothing;

alter table public.audit_log enable row level security;
alter table public.accounts enable row level security;
-- Policy yok: yalnızca service_role (API route'ları) erişir.
