-- 004 — Community completeness: post title/category/image/plan link,
--       nested comments (parent_comment_id), and profile avatar_url.
--
-- Run AFTER 002_erd_schema.sql in Supabase SQL Editor.
-- Idempotent: every change uses IF NOT EXISTS / DROP IF EXISTS.

-- --- profiles ---------------------------------------------------------------
alter table public.profiles
  add column if not exists avatar_url text;

-- --- posts: add structured fields used by the Community module --------------
alter table public.posts
  add column if not exists title text,
  add column if not exists category text,
  add column if not exists image_url text,
  add column if not exists plan_id uuid references public.plans (id) on delete set null;

create index if not exists posts_plan_id_idx on public.posts (plan_id);
create index if not exists posts_category_idx on public.posts (category);

-- --- comments: support nested replies ---------------------------------------
alter table public.comments
  add column if not exists parent_comment_id uuid references public.comments (id) on delete cascade;

create index if not exists comments_post_id_idx on public.comments (post_id);
create index if not exists comments_parent_idx on public.comments (parent_comment_id);

-- Update comment policy to allow update of own comments (edit support)
drop policy if exists "Users can update own comments" on public.comments;
create policy "Users can update own comments"
  on public.comments for update
  using (auth.uid() = user_id);
