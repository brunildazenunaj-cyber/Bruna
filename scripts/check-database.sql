-- Read-only production preflight. Run in the correct Supabase project's SQL Editor.
-- No applicant information is selected and nothing is changed.
begin transaction read only;
select
 to_regclass('public.applications') as academy_table,
 to_regclass('public.admins') as admin_allowlist,
 to_regclass('public.audit_logs') as audit_table,
 to_regclass('public.rate_limits') as rate_limit_table,
 to_regprocedure('public.consume_rate_limit(text,integer,integer)') as rate_limit_function,
 to_regclass('public.gold_requests') as gold_table,
 to_regclass('public.gold_requests_broker_unique') as gold_broker_index,
 to_regclass('public.gold_requests_created') as gold_date_index,
 to_regprocedure('public.review_gold_request(uuid,uuid,text,boolean)') as gold_review_function;
select c.relname as table_name,c.relrowsecurity as rls_enabled,
 has_table_privilege('anon',c.oid,'SELECT') as anon_can_read,
 has_table_privilege('authenticated',c.oid,'SELECT') as authenticated_can_read,
 has_table_privilege('service_role',c.oid,'SELECT') as server_can_read
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relname in ('applications','gold_requests','admins');
select column_name,data_type,is_nullable,column_default
from information_schema.columns where table_schema='public' and table_name='gold_requests'
order by ordinal_position;
select conname,pg_get_constraintdef(oid) as definition
from pg_constraint where conrelid=to_regclass('public.gold_requests');
select p.proname,p.prosecdef as security_definer,
 has_function_privilege('anon',p.oid,'EXECUTE') as anon_can_execute,
 has_function_privilege('authenticated',p.oid,'EXECUTE') as authenticated_can_execute,
 has_function_privilege('service_role',p.oid,'EXECUTE') as server_can_execute,
 pg_get_functiondef(p.oid) as function_definition
from pg_proc p where p.oid=to_regprocedure('public.review_gold_request(uuid,uuid,text,boolean)');
select policyname,roles,cmd from pg_policies where schemaname='public' and tablename='gold_requests';
commit;
