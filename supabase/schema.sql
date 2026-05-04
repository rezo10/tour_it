-- Run this in Supabase → SQL Editor after creating your project.

create table if not exists public.planner_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create index if not exists planner_drafts_user_id_idx on public.planner_drafts (user_id);

alter table public.planner_drafts enable row level security;

create policy "Users can read own planner draft"
  on public.planner_drafts for select
  using (auth.uid() = user_id);

create policy "Users can insert own planner draft"
  on public.planner_drafts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own planner draft"
  on public.planner_drafts for update
  using (auth.uid() = user_id);

create policy "Users can delete own planner draft"
  on public.planner_drafts for delete
  using (auth.uid() = user_id);
