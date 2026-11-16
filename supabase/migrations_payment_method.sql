-- Ödeme yöntemi (Nakit, Havale, Fiş, Banka POS, Şahsi Kart). Supabase SQL Editor'da bir kez çalıştırın.
alter table public.transactions add column if not exists payment_method text;
alter table public.payment_logs add column if not exists payment_method text;
