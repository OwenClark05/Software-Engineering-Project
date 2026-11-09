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

-- Create the username profile in the same transaction as the Auth account.
-- A duplicate username aborts signup instead of leaving an unusable account.
create or replace function public.create_signup_profile()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  requested_username text := trim(new.raw_user_meta_data ->> 'username');
begin
  -- Allow admin-created accounts without metadata to use manual profile setup.
  if requested_username is null then
    return new;
  end if;
  if requested_username !~ '^[A-Za-z0-9_]{3,30}$' then
    raise exception 'Invalid username';
  end if;
  insert into public.profiles (uid, username)
  values (new.id, requested_username);
  return new;
end;
$$;

revoke all on function public.create_signup_profile() from public, anon, authenticated;
drop trigger if exists create_signup_profile on auth.users;
create trigger create_signup_profile
  after insert on auth.users
  for each row execute function public.create_signup_profile();
