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
