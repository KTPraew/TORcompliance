-- Create projects table
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  status text not null default 'pending'
    check (status in ('pending', 'in_progress', 'completed', 'failed')),
  score integer not null default 0,
  checklist_count integer not null default 0,
  passed_count integer not null default 0,
  failed_count integer not null default 0,
  review_count integer not null default 0,
  tor_file_name text,
  ui_file_name text,
  category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.projects enable row level security;

-- Policies
create policy "Users can select own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can insert own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on public.projects for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

-- Auto-update updated_at trigger (security invoker, no search_path)
create or replace function public.handle_projects_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_projects_updated
  before update on public.projects
  for each row execute procedure public.handle_projects_updated_at();
