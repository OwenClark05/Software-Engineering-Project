-- Run in the Supabase SQL Editor. If profiles already exists, it must have
-- uid UUID referencing auth.users(id) and username TEXT (or VARCHAR).
create table if not exists public.profiles (
  uid uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  created_at timestamptz not null default now()
);

-- Fails safely if an existing table has duplicate usernames: resolve those first.
create unique index if not exists profiles_username_login_key
  on public.profiles (username);

alter table public.profiles enable row level security;
grant select on public.profiles to authenticated;
grant select on public.profiles to service_role;

-- No anonymous lookup policy: the server performs the username lookup.
drop policy if exists "Read own login profile" on public.profiles;
create policy "Read own login profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = uid);
