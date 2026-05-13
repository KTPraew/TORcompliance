-- Add image_url column to projects
alter table public.projects add column if not exists image_url text;

-- Create public bucket for project cover images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-images',
  'project-images',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
on conflict (id) do nothing;

-- RLS policies for project-images
create policy "project-images: public can read"
  on storage.objects for select
  using (bucket_id = 'project-images');

create policy "project-images: owner can insert"
  on storage.objects for insert
  with check (
    bucket_id = 'project-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "project-images: owner can update"
  on storage.objects for update
  using (
    bucket_id = 'project-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "project-images: owner can delete"
  on storage.objects for delete
  using (
    bucket_id = 'project-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
