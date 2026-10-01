-- Pin set_updated_at's search_path and keep is_admin() out of the public API
-- (/rest/v1/rpc). RLS policies reference the function by OID, so they follow
-- it to the new schema.

alter function public.set_updated_at() set search_path = '';

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

alter function public.is_admin() set schema private;
