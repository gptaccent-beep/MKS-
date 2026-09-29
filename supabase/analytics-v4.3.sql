-- VETRA 4.3 analytics upgrade: adds sale/order-request events.
alter table public.analytics_events drop constraint if exists analytics_events_event_type_check;
alter table public.analytics_events add constraint analytics_events_event_type_check check (event_type in ('view','lead','sale'));
create index if not exists analytics_events_time_idx on public.analytics_events(created_at desc);
