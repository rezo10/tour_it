-- Tour It — Full database schema (Supabase).
-- Run in Supabase → SQL Editor once. Re-run is safe (uses IF NOT EXISTS).
-- This single file is equivalent to running the migrations in order:
--   001 (planner_drafts), 002 (ERD), 003 (display_name trigger),
--   004 (community fields), 005 (admin role).

-- =========================================================================
-- 1) Planner draft (legacy table used by the planner UI sync)
-- =========================================================================
create table if not exists public.planner_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create index if not exists planner_drafts_user_id_idx on public.planner_drafts (user_id);

alter table public.planner_drafts enable row level security;

drop policy if exists "Users can read own planner draft"   on public.planner_drafts;
drop policy if exists "Users can insert own planner draft" on public.planner_drafts;
drop policy if exists "Users can update own planner draft" on public.planner_drafts;
drop policy if exists "Users can delete own planner draft" on public.planner_drafts;

create policy "Users can read own planner draft"
  on public.planner_drafts for select using (auth.uid() = user_id);
create policy "Users can insert own planner draft"
  on public.planner_drafts for insert with check (auth.uid() = user_id);
create policy "Users can update own planner draft"
  on public.planner_drafts for update using (auth.uid() = user_id);
create policy "Users can delete own planner draft"
  on public.planner_drafts for delete using (auth.uid() = user_id);

-- =========================================================================
-- 2) Profiles (extends auth.users)
-- =========================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  bio text,
  avatar_url text,
  role text not null default 'user',
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists avatar_url text,
  add column if not exists role text not null default 'user';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_role_check'
  ) then
    alter table public.profiles
      add constraint profiles_role_check
      check (role in ('user', 'admin'));
  end if;
end$$;

alter table public.profiles enable row level security;

-- Helper used in policies below — returns true when the calling user is admin.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

drop policy if exists "Profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users can update own profile"     on public.profiles;
drop policy if exists "Users can insert own profile"     on public.profiles;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- New auth user → profile row with a sensible default display_name
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
      nullif(trim(new.raw_user_meta_data->>'nickname'), ''),
      nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profile rows for any pre-existing auth users
insert into public.profiles (id, display_name)
select
  id,
  coalesce(
    nullif(trim(raw_user_meta_data->>'display_name'), ''),
    nullif(trim(raw_user_meta_data->>'nickname'), ''),
    nullif(trim(raw_user_meta_data->>'full_name'), ''),
    split_part(email, '@', 1)
  )
from auth.users
on conflict (id) do nothing;

-- =========================================================================
-- 3) Plans + nested day/items
-- =========================================================================
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  country text not null,
  city text not null,
  trip_type text not null,
  preferences jsonb not null default '{}'::jsonb,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists plans_user_id_idx on public.plans (user_id);
create index if not exists plans_public_idx on public.plans (is_public) where is_public = true;
create index if not exists plans_trip_type_idx on public.plans (trip_type);

alter table public.plans enable row level security;

drop policy if exists "Anyone can view public plans" on public.plans;
drop policy if exists "Users can view own plans"     on public.plans;
drop policy if exists "Users can insert own plans"   on public.plans;
drop policy if exists "Users can update own plans"   on public.plans;
drop policy if exists "Users can delete own plans"   on public.plans;

create policy "Anyone can view public plans" on public.plans for select using (is_public = true);
create policy "Users can view own plans"     on public.plans for select using (auth.uid() = user_id);
create policy "Users can insert own plans"   on public.plans for insert with check (auth.uid() = user_id);
create policy "Users can update own plans"   on public.plans for update using (auth.uid() = user_id);
create policy "Users can delete own plans"   on public.plans for delete using (auth.uid() = user_id or public.is_admin());

create table if not exists public.plan_days (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans (id) on delete cascade,
  day_number int not null,
  title text not null,
  unique (plan_id, day_number)
);
alter table public.plan_days enable row level security;

drop policy if exists "Plan days follow plan access" on public.plan_days;
drop policy if exists "Owners manage plan_days"      on public.plan_days;

create policy "Plan days follow plan access"
  on public.plan_days for select
  using (
    exists (select 1 from public.plans p
            where p.id = plan_days.plan_id
              and (p.is_public = true or p.user_id = auth.uid()))
  );
create policy "Owners manage plan_days"
  on public.plan_days for all
  using (exists (select 1 from public.plans p where p.id = plan_days.plan_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.plans p where p.id = plan_days.plan_id and p.user_id = auth.uid()));

create table if not exists public.plan_items (
  id uuid primary key default gen_random_uuid(),
  plan_day_id uuid not null references public.plan_days (id) on delete cascade,
  order_index int not null,
  name text not null,
  description text not null default '',
  duration text not null default '',
  category text not null default '',
  lat double precision not null,
  lng double precision not null,
  unique (plan_day_id, order_index)
);
alter table public.plan_items enable row level security;

drop policy if exists "Plan items follow day access" on public.plan_items;
drop policy if exists "Owners manage plan_items"     on public.plan_items;

create policy "Plan items follow day access"
  on public.plan_items for select
  using (
    exists (select 1 from public.plan_days d
            join public.plans p on p.id = d.plan_id
            where d.id = plan_items.plan_day_id
              and (p.is_public = true or p.user_id = auth.uid()))
  );
create policy "Owners manage plan_items"
  on public.plan_items for all
  using (
    exists (select 1 from public.plan_days d
            join public.plans p on p.id = d.plan_id
            where d.id = plan_items.plan_day_id and p.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.plan_days d
            join public.plans p on p.id = d.plan_id
            where d.id = plan_items.plan_day_id and p.user_id = auth.uid())
  );

-- =========================================================================
-- 4) Community: posts (with title/category/image/plan link)
-- =========================================================================
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.posts
  add column if not exists title text,
  add column if not exists category text,
  add column if not exists image_url text,
  add column if not exists plan_id uuid references public.plans (id) on delete set null;

create index if not exists posts_created_idx  on public.posts (created_at desc);
create index if not exists posts_plan_id_idx  on public.posts (plan_id);
create index if not exists posts_category_idx on public.posts (category);

alter table public.posts enable row level security;

drop policy if exists "Posts are readable by everyone"      on public.posts;
drop policy if exists "Authenticated users can create posts" on public.posts;
drop policy if exists "Users can update own posts"          on public.posts;
drop policy if exists "Users can delete own posts"          on public.posts;

create policy "Posts are readable by everyone"
  on public.posts for select using (true);
create policy "Authenticated users can create posts"
  on public.posts for insert with check (auth.uid() = user_id);
create policy "Users can update own posts"
  on public.posts for update using (auth.uid() = user_id or public.is_admin());
create policy "Users can delete own posts"
  on public.posts for delete using (auth.uid() = user_id or public.is_admin());

-- =========================================================================
-- 5) Comments (with nested replies via parent_comment_id)
-- =========================================================================
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.comments
  add column if not exists parent_comment_id uuid references public.comments (id) on delete cascade;

create index if not exists comments_post_id_idx on public.comments (post_id);
create index if not exists comments_parent_idx  on public.comments (parent_comment_id);

alter table public.comments enable row level security;

drop policy if exists "Comments readable for post viewers"  on public.comments;
drop policy if exists "Authenticated users can comment"     on public.comments;
drop policy if exists "Users can update own comments"       on public.comments;
drop policy if exists "Users can delete own comments"       on public.comments;

create policy "Comments readable for post viewers"
  on public.comments for select using (true);
create policy "Authenticated users can comment"
  on public.comments for insert with check (auth.uid() = user_id);
create policy "Users can update own comments"
  on public.comments for update using (auth.uid() = user_id or public.is_admin());
create policy "Users can delete own comments"
  on public.comments for delete using (auth.uid() = user_id or public.is_admin());

-- =========================================================================
-- 6) Post likes
-- =========================================================================
create table if not exists public.post_likes (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  primary key (post_id, user_id)
);

alter table public.post_likes enable row level security;

drop policy if exists "Likes are readable"       on public.post_likes;
drop policy if exists "Users can manage own likes" on public.post_likes;
drop policy if exists "Users can remove own likes" on public.post_likes;

create policy "Likes are readable"          on public.post_likes for select using (true);
create policy "Users can manage own likes"  on public.post_likes for insert with check (auth.uid() = user_id);
create policy "Users can remove own likes"  on public.post_likes for delete using (auth.uid() = user_id);

-- =========================================================================
-- 7) Follows
-- =========================================================================
create table if not exists public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

alter table public.follows enable row level security;

drop policy if exists "Follows readable"  on public.follows;
drop policy if exists "Users can follow"  on public.follows;
drop policy if exists "Users can unfollow" on public.follows;

create policy "Follows readable"   on public.follows for select using (true);
create policy "Users can follow"   on public.follows for insert with check (auth.uid() = follower_id);
create policy "Users can unfollow" on public.follows for delete using (auth.uid() = follower_id);
