-- VETRA v3 analytics migration
-- NON-BREAKING: creates one new table and indexes; no existing tables are modified.
create table if not exists public.analytics_events (
  event_id text primary key,
  event_type text not null check (event_type in ('view','lead')),
  product_id text not null,
  store_id text not null,
  session_id text,
  client_at timestamptz not null,
  path text,
  user_agent text,
  referrer text,
  created_at timestamptz not null default now()
);
create index if not exists analytics_events_product_idx on public.analytics_events(product_id, created_at desc);
create index if not exists analytics_events_store_idx on public.analytics_events(store_id, created_at desc);
create index if not exists analytics_events_type_idx on public.analytics_events(event_type, created_at desc);
alter table public.analytics_events enable row level security;
-- No public RLS policies. The Vercel function uses the service-role key server-side.
