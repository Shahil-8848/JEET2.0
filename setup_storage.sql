-- Create the 'screenshots' bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('screenshots', 'screenshots', true)
on conflict (id) do nothing;

-- Remove existing policies to avoid conflicts
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Authenticated Upload" on storage.objects;

-- Create Policy: Allow public read access to all images in screenshots bucket
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'screenshots' );

-- Create Policy: Allow authenticated users to upload to screenshots bucket
create policy "Authenticated Upload"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'screenshots' );
