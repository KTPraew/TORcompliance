-- Create storage buckets for TOR documents and UI/image files

-- Bucket สำหรับไฟล์ TOR (PDF, DOCX, etc.) — private
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'tor-files',
  'tor-files',
  false,
  52428800,  -- 50 MB
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
)
on conflict (id) do nothing;

-- Bucket สำหรับรูปภาพ UI — private
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'ui-files',
  'ui-files',
  false,
  10485760,  -- 10 MB
  array[
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/gif'
  ]
)
on conflict (id) do nothing;

-- ============================================================
-- RLS policies for tor-files
-- Path convention: {user_id}/{project_id}/{filename}
-- ============================================================

-- SELECT: users can read their own files
create policy "tor-files: owner can select"
  on storage.objects for select
  using (
    bucket_id = 'tor-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- INSERT: users can upload to their own folder
create policy "tor-files: owner can insert"
  on storage.objects for insert
  with check (
    bucket_id = 'tor-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- UPDATE: users can update (replace) their own files
create policy "tor-files: owner can update"
  on storage.objects for update
  using (
    bucket_id = 'tor-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- DELETE: users can delete their own files
create policy "tor-files: owner can delete"
  on storage.objects for delete
  using (
    bucket_id = 'tor-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- RLS policies for ui-files
-- Path convention: {user_id}/{project_id}/{filename}
-- ============================================================

-- SELECT: users can read their own files
create policy "ui-files: owner can select"
  on storage.objects for select
  using (
    bucket_id = 'ui-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- INSERT: users can upload to their own folder
create policy "ui-files: owner can insert"
  on storage.objects for insert
  with check (
    bucket_id = 'ui-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- UPDATE: users can update (replace) their own files
create policy "ui-files: owner can update"
  on storage.objects for update
  using (
    bucket_id = 'ui-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- DELETE: users can delete their own files
create policy "ui-files: owner can delete"
  on storage.objects for delete
  using (
    bucket_id = 'ui-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
