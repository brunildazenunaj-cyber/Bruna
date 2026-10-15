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
