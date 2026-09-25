-- VETRA 4.2 cross-device publishing
-- Additive migration: creates a public-content table and a public media bucket.
create table if not exists public.site_content (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.site_content enable row level security;
-- No public table policies: the Vercel server function uses the service-role key.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'marketplace-media',
  'marketplace-media',
  true,
  3000000,
  array['image/webp','image/jpeg','image/png','image/gif','video/mp4','video/webm']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
