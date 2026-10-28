-- Run once in the Supabase SQL Editor before deploying v4.6.
begin;
create table if not exists public.seller_accounts (
 id uuid primary key default gen_random_uuid(),
 store_id text not null unique,
 username text not null unique,
 password_hash text not null,
 salt text not null,
 session_version integer not null default 1,
 enabled boolean not null default true,
 failed_attempts integer not null default 0,
 locked_until timestamptz,
 created_at timestamptz not null default now()
);
alter table public.seller_accounts enable row level security;
revoke all on public.seller_accounts from anon, authenticated;
grant all on public.seller_accounts to service_role;
-- Only the server may invoke this atomic, ownership-checked content patch.
create or replace function public.seller_edit_content(p_store text, p_product text default null, p_name text default null, p_logo text default null)
returns void language plpgsql security definer set search_path=public as $$
declare doc jsonb; arr jsonb; found boolean := false;
begin
 select data into doc from public.site_content where id='main' for update;
 if doc is null then raise exception 'No published content'; end if;
 if not exists(select 1 from jsonb_array_elements(doc->'stores') s where s->>'id'=p_store) then raise exception 'Store unavailable'; end if;
 if p_logo is not null and p_product is null then
  select jsonb_agg(case when s->>'id'=p_store then jsonb_set(s,'{logo}',to_jsonb(p_logo)) else s end order by ord) into arr from jsonb_array_elements(doc->'stores') with ordinality as t(s,ord);
  doc := jsonb_set(doc,'{stores}',arr);
 elsif p_product is not null and length(trim(p_name)) between 1 and 160 then
  if not exists(select 1 from jsonb_array_elements(doc->'products') p where p->>'id'=p_product and p->>'store'=p_store) then raise exception 'Product does not belong to this store'; end if;
  select jsonb_agg(case when p->>'id'=p_product and p->>'store'=p_store then jsonb_set(p,'{name}',to_jsonb(trim(p_name))) else p end order by ord) into arr from jsonb_array_elements(doc->'products') with ordinality as t(p,ord);
  doc := jsonb_set(doc,'{products}',arr);
 else raise exception 'Only logo and product names can be edited'; end if;
 update public.site_content set data=doc,updated_at=clock_timestamp() where id='main';
end $$;
revoke all on function public.seller_edit_content(text,text,text,text) from public, anon, authenticated;
grant execute on function public.seller_edit_content(text,text,text,text) to service_role;
commit;
