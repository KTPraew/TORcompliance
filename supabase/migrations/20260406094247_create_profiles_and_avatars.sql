-- Create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  phone text,
  organization text,
  avatar_url text,
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

create policy "profiles: owner can select"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: owner can insert"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles: owner can update"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-update updated_at
create or replace function public.handle_profiles_updated_at()
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

create trigger on_profiles_updated
  before update on public.profiles
  for each row execute procedure public.handle_profiles_updated_at();

-- ============================================================
-- Avatars bucket (public reads, owner-only writes)
-- Path convention: {user_id}/avatar.{ext}
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,  -- 5 MB
  array['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
on conflict (id) do nothing;

-- SELECT: needed for upsert to check if file already exists
create policy "avatars: owner can select"
  on storage.objects for select
  using (bucket_id = 'avatars' and owner_id = auth.uid()::text);

create policy "avatars: owner can insert"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and owner_id = auth.uid()::text);

-- UPDATE needs both using + with_check for upsert to work
create policy "avatars: owner can update"
  on storage.objects for update
  using (bucket_id = 'avatars' and owner_id = auth.uid()::text)
  with check (bucket_id = 'avatars' and owner_id = auth.uid()::text);

create policy "avatars: owner can delete"
  on storage.objects for delete
  using (bucket_id = 'avatars' and owner_id = auth.uid()::text);
