-- 005 — Admin role on profiles + admin-aware RLS for moderation.
--
-- Run AFTER 004_community_and_avatars.sql in Supabase → SQL Editor.
-- Idempotent: every statement uses IF NOT EXISTS / DROP IF EXISTS / OR REPLACE.

-- --- profiles.role ----------------------------------------------------------
alter table public.profiles
  add column if not exists role text not null default 'user';

-- Tighten the allowed values. Recreate the constraint defensively so
-- re-running the migration after a schema tweak doesn't break.
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

-- --- helper: is_admin() -----------------------------------------------------
-- Returns TRUE when the currently authenticated user has role='admin'.
-- SECURITY DEFINER so RLS on profiles doesn't recurse back into itself.
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

-- The function must be invokable by anon + authenticated roles.
grant execute on function public.is_admin() to anon, authenticated;

-- --- posts: admin can update/delete any row --------------------------------
drop policy if exists "Users can update own posts" on public.posts;
create policy "Users can update own posts"
  on public.posts for update
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can delete own posts" on public.posts;
create policy "Users can delete own posts"
  on public.posts for delete
  using (auth.uid() = user_id or public.is_admin());

-- --- comments: admin can update/delete any row ------------------------------
drop policy if exists "Users can update own comments" on public.comments;
create policy "Users can update own comments"
  on public.comments for update
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can delete own comments" on public.comments;
create policy "Users can delete own comments"
  on public.comments for delete
  using (auth.uid() = user_id or public.is_admin());

-- --- plans: admin can delete any plan (visibility unchanged) ----------------
drop policy if exists "Users can delete own plans" on public.plans;
create policy "Users can delete own plans"
  on public.plans for delete
  using (auth.uid() = user_id or public.is_admin());

-- ---------------------------------------------------------------------------
-- BOOTSTRAP — promote a specific user to admin (run separately).
-- Replace the email and uncomment to use:
--
--   update public.profiles
--   set role = 'admin'
--   where id = (select id from auth.users where email = 'YOUR_EMAIL@example.com');
-- ---------------------------------------------------------------------------
