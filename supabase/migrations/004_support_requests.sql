-- Additive: Academy and Gold access workflows remain unchanged.
begin;
create table public.support_requests (
 id uuid primary key default gen_random_uuid(),
 name text not null check(length(name) between 2 and 120),
 email text not null check(email=lower(email) and length(email)<=254),
 phone text not null check(phone ~ '^\+[1-9][0-9 ()-]{6,24}$' and length(regexp_replace(phone,'[^0-9]','','g')) between 7 and 15),
 message text not null check(length(message) between 10 and 2000),
 language text not null check(language in ('sq','en')),
 status text not null default 'New' check(status in ('New','Resolved')),
 created_at timestamptz not null default now(),
 privacy_version text not null,
 privacy_acknowledged_at timestamptz not null,
 dedupe_key text not null unique,
 admin_email_sent boolean not null default false
);
create index support_requests_created on public.support_requests(created_at desc);
alter table public.support_requests enable row level security;
revoke all on public.support_requests from anon,authenticated;
grant select,insert,update,delete on public.support_requests to service_role;
create function public.manage_support_request(actor_id uuid,request_id uuid,requested_action text)
returns void language plpgsql security definer set search_path=public as $$
begin
 if not exists(select 1 from admins where user_id=actor_id) then raise exception 'Unauthorized'; end if;
 if requested_action='delete' then delete from support_requests where id=request_id;
 elsif requested_action in ('resolve','reopen') then
 update support_requests set status=case when requested_action='resolve' then 'Resolved' else 'New' end where id=request_id;
 else raise exception 'Invalid action'; end if;
 if not found then raise exception 'Request not found'; end if;
 insert into audit_logs(actor,action,record_id) values(actor_id,'support_request.'||requested_action,request_id);
end; $$;
revoke all on function public.manage_support_request(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.manage_support_request(uuid,uuid,text) to service_role;
commit;
