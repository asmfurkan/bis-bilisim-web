-- Cari kartına adres alanı. Supabase SQL Editor'da bir kez çalıştırın (tekrar çalıştırmak güvenlidir).
alter table public.customers add column if not exists address text;
