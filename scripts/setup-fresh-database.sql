-- Fresh BMM database only. Run once in Supabase SQL Editor.
-- All four migrations are applied in one transaction.
begin;
do $$ begin
 if exists(select 1 from information_schema.tables where table_schema='public') then
 raise exception 'Public tables already exist. Stop and inspect before running setup.';
 end if;
end $$;

-- 001_academy.sql
-- Apply in the Supabase SQL editor or using the Supabase migration CLI.
create table public.admins (user_id uuid primary key references auth.users(id) on delete cascade);
create table public.applications (
 id uuid primary key default gen_random_uuid(),
 name text not null check (length(name) between 2 and 120),
 email text not null unique check(length(email)<=254),
 phone text not null check(length(phone)<=25),
 country text not null check(length(country)<=80),
 experience text not null check(experience in ('beginner','some','experienced')),
 reason text not null check(length(reason) between 10 and 2000),
 duration text not null check(duration in ('6','12','unsure')),
 language text not null check(language in ('sq','en')),
 status text not null default 'New' check(status in ('New','Contacted','Interested','Follow-up Required','Joined','Not Ready','Closed')),
 notes text not null default '' check(length(notes)<=10000),
 marketing_consent boolean not null default false,
 marketing_consented_at timestamptz,
 marketing_withdrawn_at timestamptz,
 privacy_version text not null,
 privacy_acknowledged_at timestamptz not null,
 admin_email_sent boolean not null default false,
 applicant_email_sent boolean not null default false,
 created_at timestamptz not null default now()
);
create index applications_created on public.applications(created_at desc);
create table public.audit_logs(id bigint generated always as identity primary key,actor uuid,action text not null,record_id uuid,created_at timestamptz not null default now());
create table public.rate_limits(key text primary key,requests integer not null,expires_at timestamptz not null);
create table public.membership_configuration(duration_months integer primary key,price_eur numeric not null);
insert into public.membership_configuration values (6,900),(12,1500);
alter table public.admins enable row level security;
alter table public.applications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.rate_limits enable row level security;
alter table public.membership_configuration enable row level security;
-- No client policies. All application access is through authorized server routes.
revoke all on public.admins,public.applications,public.audit_logs,public.rate_limits,public.membership_configuration from anon,authenticated;
create or replace function public.consume_rate_limit(bucket_key text,max_requests integer,window_seconds integer) returns boolean language plpgsql security definer set search_path = public as $$
declare n integer;
begin
 delete from public.rate_limits where expires_at < now();
 insert into public.rate_limits(key,requests,expires_at) values(bucket_key,1,now()+make_interval(secs=>window_seconds))
 on conflict(key) do update set requests=rate_limits.requests+1 returning requests into n;
 return n<=max_requests;
end; $$;
revoke all on function public.consume_rate_limit(text,integer,integer) from public,anon,authenticated;
grant execute on function public.consume_rate_limit(text,integer,integer) to service_role;
-- Atomic mutations preserve the audit trail together with the record change.
create function public.update_academy_application(actor_id uuid,application_id uuid,new_status text,new_notes text,withdraw_marketing boolean default false)
returns void language plpgsql security definer set search_path=public as $$
begin
 if not exists(select 1 from admins where user_id=actor_id) then raise exception 'Unauthorized'; end if;
 update applications set status=new_status,notes=new_notes,
 marketing_consent=case when withdraw_marketing then false else marketing_consent end,
 marketing_withdrawn_at=case when withdraw_marketing then now() else marketing_withdrawn_at end
 where id=application_id;
 if not found then raise exception 'Application not found'; end if;
 insert into audit_logs(actor,action,record_id) values(actor_id,case when withdraw_marketing then 'application.consent_withdrawn' else 'application.updated' end,application_id);
end; $$;
create function public.delete_academy_application(actor_id uuid,application_id uuid)
returns void language plpgsql security definer set search_path=public as $$
begin
 if not exists(select 1 from admins where user_id=actor_id) then raise exception 'Unauthorized'; end if;
 delete from applications where id=application_id;
 if not found then raise exception 'Application not found'; end if;
 insert into audit_logs(actor,action,record_id) values(actor_id,'application.deleted',application_id);
end; $$;
revoke all on function public.update_academy_application(uuid,uuid,text,text,boolean) from public,anon,authenticated;
revoke all on function public.delete_academy_application(uuid,uuid) from public,anon,authenticated;
grant execute on function public.update_academy_application(uuid,uuid,text,text,boolean) to service_role;
grant execute on function public.delete_academy_application(uuid,uuid) to service_role;
grant usage on schema public to service_role;
grant select on public.admins,public.membership_configuration to service_role;
grant select,insert,update,delete on public.applications to service_role;
grant select,insert on public.audit_logs to service_role;
grant usage,select on sequence public.audit_logs_id_seq to service_role;

-- 002_gold_requests.sql
-- Additive migration: leaves Academy tables, functions and data unchanged.
create table public.gold_requests (
 id uuid primary key default gen_random_uuid(),
 name text not null check(length(name) between 2 and 120),
 email text not null unique check(email=lower(email) and length(email)<=254),
 broker_id text not null check(broker_id ~ '^[A-Za-z0-9_-]{1,80}$'),
 language text not null check(language in ('sq','en')),
 status text not null default 'Pending Verification' check(status in ('Pending Verification','Approved','Invitation Sent','Rejected')),
 created_at timestamptz not null default now(),
 privacy_version text not null,
 privacy_acknowledged_at timestamptz not null,
 approved_at timestamptz,
 approved_by uuid references auth.users(id) on delete set null,
 invitation_sent_at timestamptz,
 invitation_sent_by uuid references auth.users(id) on delete set null,
 admin_email_sent boolean not null default false,
 check ((status in ('Approved','Invitation Sent')) = (approved_at is not null)),
 check ((status='Invitation Sent') = (invitation_sent_at is not null))
);
create unique index gold_requests_broker_unique on public.gold_requests(lower(broker_id));
create index gold_requests_created on public.gold_requests(created_at desc);
alter table public.gold_requests enable row level security;
revoke all on public.gold_requests from anon,authenticated;
grant select,insert,update,delete on public.gold_requests to service_role;
create function public.review_gold_request(actor_id uuid,request_id uuid,requested_action text,manually_verified boolean default false)
returns void language plpgsql security definer set search_path=public as $$
declare current_status text;
begin
 if not exists(select 1 from admins where user_id=actor_id) then raise exception 'Unauthorized'; end if;
 select status into current_status from gold_requests where id=request_id for update;
 if not found then raise exception 'Request not found'; end if;
 if requested_action='approve' and current_status='Pending Verification' and manually_verified is true then
   update gold_requests set status='Approved',approved_at=now(),approved_by=actor_id where id=request_id;
 elsif requested_action='invitation_sent' and current_status='Approved' then
   update gold_requests set status='Invitation Sent',invitation_sent_at=now(),invitation_sent_by=actor_id where id=request_id;
 elsif requested_action='reject' and current_status in ('Pending Verification','Approved') then
   update gold_requests set status='Rejected',approved_at=null,approved_by=null where id=request_id;
 elsif requested_action='reopen' and current_status='Rejected' then
   update gold_requests set status='Pending Verification' where id=request_id;
 else raise exception 'Invalid transition or manual verification missing';
 end if;
 insert into audit_logs(actor,action,record_id) values(actor_id,'gold_request.'||requested_action,request_id);
end; $$;
revoke all on function public.review_gold_request(uuid,uuid,text,boolean) from public,anon,authenticated;
grant execute on function public.review_gold_request(uuid,uuid,text,boolean) to service_role;

-- 003_gold_whatsapp.sql
-- Apply once after 002. Preserve existing requests without inventing phone numbers.
-- New request phone numbers are mandatory in server validation. NULL is retained
-- for historical records so their review/status changes continue to work.
alter table public.gold_requests add column phone text;
alter table public.gold_requests add constraint gold_requests_phone_format check (
 phone is null or (
   length(phone)<=25 and phone ~ '^\+[1-9][0-9 ()-]{6,24}$'
   and length(regexp_replace(phone,'[^0-9]','','g')) between 7 and 15
 )
);

-- 004_support_requests.sql
-- Additive: Academy and Gold access workflows remain unchanged.
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
