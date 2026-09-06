-- Cihaz Servis Takip ve Yönetim Sistemi - şema kurulumu
-- Bu dosyayı Supabase Dashboard > SQL Editor içinde bir kez çalıştırın.
--
-- Not: Tüm okuma/yazma işlemleri Next.js API route'ları üzerinden,
-- sunucu tarafında SUPABASE_SERVICE_ROLE_KEY ile yapılır (RLS'yi bypass eder).
-- Bu yüzden tabloda herhangi bir public RLS policy TANIMLANMAZ; anon/publishable
-- anahtarla doğrudan bu tabloya erişim mümkün olmaz, müşteri verileri korunur.
--
-- Gerekli ortam değişkenleri (.env.local):
--   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
--   SUPABASE_SERVICE_ROLE_KEY=<Settings > API > service_role secret key>
--   ADMIN_SECRET_KEY=<yönetim paneli şifresi>

create extension if not exists pgcrypto;

create table if not exists public.devices (
  id uuid primary key default gen_random_uuid(),
  tracking_code text not null unique,
  customer_name text not null,
  phone text not null,
  phone_digits text generated always as (regexp_replace(phone, '\D', '', 'g')) stored,
  model text not null,
  serial_no text,
  complaint text not null,
  service_note text,
  status text not null default 'kayit_alindi'
    check (status in ('kayit_alindi', 'ariza_tespiti', 'onarimda', 'hazir', 'teslim_edildi')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists devices_phone_digits_idx on public.devices (phone_digits);
create index if not exists devices_tracking_code_idx on public.devices (tracking_code);
create index if not exists devices_status_idx on public.devices (status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists devices_set_updated_at on public.devices;
create trigger devices_set_updated_at
before update on public.devices
for each row
execute function public.set_updated_at();

alter table public.devices enable row level security;
-- Kasıtlı olarak hiçbir policy eklenmedi: anon/authenticated rollerinin
-- tabloya erişimi yok. Sadece service_role (API route'larımız) erişebilir.
