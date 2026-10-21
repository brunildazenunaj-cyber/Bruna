-- Apply once after 002. Preserve existing requests without inventing phone numbers.
-- New request phone numbers are mandatory in server validation. NULL is retained
-- for historical records so their review/status changes continue to work.
begin;
alter table public.gold_requests add column phone text;
alter table public.gold_requests add constraint gold_requests_phone_format check (
 phone is null or (
   length(phone)<=25 and phone ~ '^\+[1-9][0-9 ()-]{6,24}$'
   and length(regexp_replace(phone,'[^0-9]','','g')) between 7 and 15
 )
);
commit;
