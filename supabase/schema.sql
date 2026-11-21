-- Tribulum Supabase PostgreSQL Schema & Row Level Security
-- Run this entire script in your Supabase Dashboard -> SQL Editor.

create extension if not exists pgcrypto;

-- 0. Authenticated Farmer / FPO Member Profiles (Google & Phone OTP sign-in)
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  auth_provider text not null default 'phone',
  email text,
  phone text,
  full_name text,
  village text,
  fpo_name text,
  preferred_language text not null default 'English' check (preferred_language in ('English', 'Marathi', 'Hindi')),
  updated_at timestamptz not null default now()
);

-- 1. Enrolments (Watch, Scout, Care, Full-Care)
create table if not exists public.enrolments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null default auth.uid(),
  tier text not null check (tier in ('watch', 'scout', 'care', 'full-care')),
  acres numeric(10, 2) not null check (acres > 0),
  name text not null,
  phone text not null,
  village text not null,
  fpo_name text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

-- 2. FPO Applications
create table if not exists public.fpo_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null default auth.uid(),
  fpo_name text not null,
  contact_name text not null,
  phone text not null,
  district text not null,
  member_count integer not null check (member_count > 0),
  total_acres numeric(12, 2) not null check (total_acres > 0),
  pricing_tier text not null check (pricing_tier in ('solo_fpo', 'cluster', 'full_konkan')),
  created_at timestamptz not null default now()
);

-- 3. Village Applications (Gaon packs)
create table if not exists public.village_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null default auth.uid(),
  village text not null,
  pack_size text not null check (pack_size in ('gaon_50', 'gaon_100', 'gaon_200')),
  contact_name text not null,
  phone text not null,
  district text not null,
  created_at timestamptz not null default now()
);

-- 4. Fertiliser Requests
create table if not exists public.fertiliser_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null default auth.uid(),
  crop text not null,
  season text not null,
  acres numeric(10, 2) not null check (acres > 0),
  soil_type text not null,
  n numeric(8, 2),
  p numeric(8, 2),
  k numeric(8, 2),
  ph numeric(4, 2),
  phone text not null,
  created_at timestamptz not null default now()
);

-- 5. Contact Messages
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null default auth.uid(),
  type text not null check (type in ('team', 'fpo_partnership', 'field_support')),
  name text not null,
  phone text not null,
  message text not null,
  created_at timestamptz not null default now()
);

-- 6. Callback Requests
create table if not exists public.callback_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null default auth.uid(),
  name text not null,
  phone text not null,
  preferred_slot text not null,
  created_at timestamptz not null default now()
);

-- 7. Gemini 4 Hydrogen Advisor History (persisted for signed-in users)
create table if not exists public.advisor_queries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  language text not null check (language in ('English', 'Marathi', 'Hindi')),
  question text not null,
  answer text not null,
  created_at timestamptz not null default now()
);

-- If tables already existed from an earlier run, ensure user_id column exists
alter table public.enrolments add column if not exists user_id uuid references auth.users(id) on delete set null default auth.uid();
alter table public.fpo_applications add column if not exists user_id uuid references auth.users(id) on delete set null default auth.uid();
alter table public.village_applications add column if not exists user_id uuid references auth.users(id) on delete set null default auth.uid();
alter table public.fertiliser_requests add column if not exists user_id uuid references auth.users(id) on delete set null default auth.uid();
alter table public.contact_messages add column if not exists user_id uuid references auth.users(id) on delete set null default auth.uid();
alter table public.callback_requests add column if not exists user_id uuid references auth.users(id) on delete set null default auth.uid();

-- Enable Row Level Security on every table
alter table public.user_profiles enable row level security;
alter table public.enrolments enable row level security;
alter table public.fpo_applications enable row level security;
alter table public.village_applications enable row level security;
alter table public.fertiliser_requests enable row level security;
alter table public.contact_messages enable row level security;
alter table public.callback_requests enable row level security;
alter table public.advisor_queries enable row level security;

-- user_profiles: owner read/insert/update only
drop policy if exists "Users read own profile" on public.user_profiles;
create policy "Users read own profile"
  on public.user_profiles for select to authenticated
  using (auth.uid() = id);

drop policy if exists "Users insert own profile" on public.user_profiles;
create policy "Users insert own profile"
  on public.user_profiles for insert to authenticated
  with check (auth.uid() = id);

drop policy if exists "Users update own profile" on public.user_profiles;
create policy "Users update own profile"
  on public.user_profiles for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Public INSERT only for anon + authenticated (no anonymous public read)
drop policy if exists "Allow public insert on enrolments" on public.enrolments;
create policy "Allow public insert on enrolments"
  on public.enrolments for insert to anon, authenticated
  with check (user_id is null or auth.uid() = user_id);

drop policy if exists "Authenticated users read own enrolments" on public.enrolments;
create policy "Authenticated users read own enrolments"
  on public.enrolments for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Allow public insert on fpo_applications" on public.fpo_applications;
create policy "Allow public insert on fpo_applications"
  on public.fpo_applications for insert to anon, authenticated
  with check (user_id is null or auth.uid() = user_id);

drop policy if exists "Allow public insert on village_applications" on public.village_applications;
create policy "Allow public insert on village_applications"
  on public.village_applications for insert to anon, authenticated
  with check (user_id is null or auth.uid() = user_id);

drop policy if exists "Allow public insert on fertiliser_requests" on public.fertiliser_requests;
create policy "Allow public insert on fertiliser_requests"
  on public.fertiliser_requests for insert to anon, authenticated
  with check (user_id is null or auth.uid() = user_id);

drop policy if exists "Authenticated users read own fertiliser requests" on public.fertiliser_requests;
create policy "Authenticated users read own fertiliser requests"
  on public.fertiliser_requests for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Allow public insert on contact_messages" on public.contact_messages;
create policy "Allow public insert on contact_messages"
  on public.contact_messages for insert to anon, authenticated
  with check (user_id is null or auth.uid() = user_id);

drop policy if exists "Allow public insert on callback_requests" on public.callback_requests;
create policy "Allow public insert on callback_requests"
  on public.callback_requests for insert to anon, authenticated
  with check (user_id is null or auth.uid() = user_id);

-- advisor_queries: authenticated owner read/insert only
drop policy if exists "Users read own advisor queries" on public.advisor_queries;
create policy "Users read own advisor queries"
  on public.advisor_queries for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users insert own advisor queries" on public.advisor_queries;
create policy "Users insert own advisor queries"
  on public.advisor_queries for insert to authenticated
  with check (auth.uid() = user_id);
