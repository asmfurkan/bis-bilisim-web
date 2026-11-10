-- Servis kayıtlarına adres ve kargo alanları ekler.
-- Supabase Dashboard > SQL Editor içinde bir kez çalıştırın.
alter table public.devices
  add column if not exists customer_address text,
  add column if not exists delivery_type text not null default 'Yurtiçi Kargo',
  add column if not exists cargo_tracking_no text,
  add column if not exists cargo_fee numeric(10,2);
