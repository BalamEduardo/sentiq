-- RLS manual verification queries for COR-124 / T-055.
--
-- Status: documented manual fixture.
-- A transacted runner based on these fixtures was executed against Supabase
-- project sentiq (wdurjrzkfjnlaatenwnb) with ROLLBACK, and fixture cleanup was
-- verified by checking that rls-restaurant-a / rls-restaurant-b do not persist.
--
-- Command used:
-- pnpm dlx supabase db query --linked --file .codex-local\rls-matrix-runner.sql --output json
-- Intended environment: Supabase local SQL editor or psql connected to the local DB.
--
-- How to run manually:
-- 1. Start Supabase local and apply migrations.
-- 2. Run the fixture block as an owner role that can seed auth.users and public tables.
-- 3. For each actor, run the matching "set local role" and JWT claim block in a transaction.
-- 4. Compare results with docs/security/rls-permission-matrix.md.
-- 5. Run the cleanup block at the end.
--
-- Notes:
-- - These queries do not add a test dependency or modify app code.
-- - They intentionally do not use service_role in application code.
-- - `auth.uid()` in Supabase reads `request.jwt.claim.sub`; the blocks below set it manually.

begin;

-- Stable fixture IDs.
select
  '00000000-0000-0000-0000-0000000000a1'::uuid as restaurant_a,
  '00000000-0000-0000-0000-0000000000b1'::uuid as restaurant_b,
  '00000000-0000-0000-0000-000000000101'::uuid as platform_admin_user,
  '00000000-0000-0000-0000-000000000102'::uuid as restaurant_admin_a_user,
  '00000000-0000-0000-0000-000000000103'::uuid as restaurant_admin_b_user,
  '00000000-0000-0000-0000-000000000104'::uuid as manager_a_user,
  '00000000-0000-0000-0000-000000000105'::uuid as authenticated_without_profile_user;

insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000101', 'rls-platform-admin@example.test', crypt('password', gen_salt('bf')), now(), now(), now()),
  ('00000000-0000-0000-0000-000000000102', 'rls-admin-a@example.test', crypt('password', gen_salt('bf')), now(), now(), now()),
  ('00000000-0000-0000-0000-000000000103', 'rls-admin-b@example.test', crypt('password', gen_salt('bf')), now(), now(), now()),
  ('00000000-0000-0000-0000-000000000104', 'rls-manager-a@example.test', crypt('password', gen_salt('bf')), now(), now(), now()),
  ('00000000-0000-0000-0000-000000000105', 'rls-no-profile@example.test', crypt('password', gen_salt('bf')), now(), now(), now())
on conflict (id) do nothing;

insert into public.restaurants (id, name, legal_name, slug, contact_name, contact_email, contact_phone, status)
values
  ('00000000-0000-0000-0000-0000000000a1', 'RLS Restaurant A', 'RLS Restaurant A SA', 'rls-restaurant-a', 'Owner A', 'owner-a@example.test', '5551000001', 'active'),
  ('00000000-0000-0000-0000-0000000000b1', 'RLS Restaurant B', 'RLS Restaurant B SA', 'rls-restaurant-b', 'Owner B', 'owner-b@example.test', '5551000002', 'active')
on conflict (id) do nothing;

insert into public.restaurant_accounts (id, restaurant_id, plan_code, account_status, implementation_fee_mxn, monthly_fee_mxn)
values
  ('00000000-0000-0000-0000-00000000a201', '00000000-0000-0000-0000-0000000000a1', 'demo', 'active', 0, 0),
  ('00000000-0000-0000-0000-00000000b201', '00000000-0000-0000-0000-0000000000b1', 'demo', 'active', 0, 0)
on conflict (id) do nothing;

insert into public.restaurant_settings (id, restaurant_id, primary_color, question_general_text, question_attention_text, question_food_text, question_speed_text, contact_consent_text)
values
  ('00000000-0000-0000-0000-00000000a301', '00000000-0000-0000-0000-0000000000a1', '#0f766e', 'General A', 'Attention A', 'Food A', 'Speed A', 'Consent A'),
  ('00000000-0000-0000-0000-00000000b301', '00000000-0000-0000-0000-0000000000b1', '#1d4ed8', 'General B', 'Attention B', 'Food B', 'Speed B', 'Consent B')
on conflict (id) do nothing;

insert into public.user_profiles (id, restaurant_id, full_name, email, role, status)
values
  ('00000000-0000-0000-0000-000000000101', null, 'RLS Platform Admin', 'rls-platform-admin@example.test', 'platform_admin', 'active'),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-0000000000a1', 'RLS Admin A', 'rls-admin-a@example.test', 'restaurant_admin', 'active'),
  ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-0000000000b1', 'RLS Admin B', 'rls-admin-b@example.test', 'restaurant_admin', 'active'),
  ('00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-0000000000a1', 'RLS Manager A', 'rls-manager-a@example.test', 'manager', 'active')
on conflict (id) do nothing;

insert into public.branches (id, restaurant_id, name, slug, status)
values
  ('00000000-0000-0000-0000-00000000a401', '00000000-0000-0000-0000-0000000000a1', 'RLS Branch A1', 'rls-a1', 'active'),
  ('00000000-0000-0000-0000-00000000a402', '00000000-0000-0000-0000-0000000000a1', 'RLS Branch A2', 'rls-a2', 'active'),
  ('00000000-0000-0000-0000-00000000b401', '00000000-0000-0000-0000-0000000000b1', 'RLS Branch B1', 'rls-b1', 'active')
on conflict (id) do nothing;

insert into public.zones (id, restaurant_id, branch_id, name, status)
values
  ('00000000-0000-0000-0000-00000000a501', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-00000000a401', 'RLS Zone A1', 'active'),
  ('00000000-0000-0000-0000-00000000a502', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-00000000a402', 'RLS Zone A2', 'active'),
  ('00000000-0000-0000-0000-00000000b501', '00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-00000000b401', 'RLS Zone B1', 'active')
on conflict (id) do nothing;

insert into public.manager_branch_assignments (id, restaurant_id, manager_user_id, branch_id, status, created_by)
values
  ('00000000-0000-0000-0000-00000000a601', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-00000000a401', 'active', '00000000-0000-0000-0000-000000000102')
on conflict (id) do nothing;

insert into public.waiters (id, restaurant_id, branch_id, name, internal_code, status)
values
  ('00000000-0000-0000-0000-00000000a701', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-00000000a401', 'RLS Waiter A1', 'A1', 'active'),
  ('00000000-0000-0000-0000-00000000a702', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-00000000a402', 'RLS Waiter A2', 'A2', 'active'),
  ('00000000-0000-0000-0000-00000000b701', '00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-00000000b401', 'RLS Waiter B1', 'B1', 'active')
on conflict (id) do nothing;

insert into public.devices (id, restaurant_id, branch_id, zone_id, name, status)
values
  ('00000000-0000-0000-0000-00000000a801', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-00000000a401', '00000000-0000-0000-0000-00000000a501', 'RLS Device A1', 'active'),
  ('00000000-0000-0000-0000-00000000a802', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-00000000a402', '00000000-0000-0000-0000-00000000a502', 'RLS Device A2', 'active'),
  ('00000000-0000-0000-0000-00000000b801', '00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-00000000b401', '00000000-0000-0000-0000-00000000b501', 'RLS Device B1', 'active')
on conflict (id) do nothing;

insert into public.survey_links (id, restaurant_id, branch_id, zone_id, device_id, type, name, token_hash, token_last4, status, created_by)
values
  ('00000000-0000-0000-0000-00000000a901', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-00000000a401', '00000000-0000-0000-0000-00000000a501', null, 'qr', 'RLS QR A1', 'rls-token-hash-a1', 'sha1', 'active', '00000000-0000-0000-0000-000000000102'),
  ('00000000-0000-0000-0000-00000000a902', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-00000000a402', '00000000-0000-0000-0000-00000000a502', null, 'qr', 'RLS QR A2', 'rls-token-hash-a2', 'sha2', 'active', '00000000-0000-0000-0000-000000000102'),
  ('00000000-0000-0000-0000-00000000b901', '00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-00000000b401', '00000000-0000-0000-0000-00000000b501', null, 'qr', 'RLS QR B1', 'rls-token-hash-b1', 'shb1', 'active', '00000000-0000-0000-0000-000000000103')
on conflict (id) do nothing;

insert into public.feedback_responses (
  id, restaurant_id, branch_id, zone_id, device_id, survey_link_id, waiter_id, source,
  general_experience, service_attention, food_quality, service_speed, comment,
  customer_phone, consent_to_contact, consent_text_snapshot, has_alert
)
values
  ('00000000-0000-0000-0000-00000000aa01', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-00000000a401', '00000000-0000-0000-0000-00000000a501', null, '00000000-0000-0000-0000-00000000a901', '00000000-0000-0000-0000-00000000a701', 'qr', 2, 2, 3, 3, 'RLS alert A1', '5551110001', true, 'Consent A', true),
  ('00000000-0000-0000-0000-00000000aa02', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-00000000a402', '00000000-0000-0000-0000-00000000a502', null, '00000000-0000-0000-0000-00000000a902', '00000000-0000-0000-0000-00000000a702', 'qr', 5, 5, 5, 5, 'RLS ok A2', null, false, null, false),
  ('00000000-0000-0000-0000-00000000bb01', '00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-00000000b401', '00000000-0000-0000-0000-00000000b501', null, '00000000-0000-0000-0000-00000000b901', '00000000-0000-0000-0000-00000000b701', 'qr', 1, 2, 2, 2, 'RLS alert B1', '5552220001', true, 'Consent B', true)
on conflict (id) do nothing;

insert into public.feedback_alerts (
  id, restaurant_id, branch_id, zone_id, device_id, response_id, source,
  general_experience, status
)
values
  ('00000000-0000-0000-0000-00000000ab01', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-00000000a401', '00000000-0000-0000-0000-00000000a501', null, '00000000-0000-0000-0000-00000000aa01', 'qr', 2, 'pending'),
  ('00000000-0000-0000-0000-00000000bb02', '00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-00000000b401', '00000000-0000-0000-0000-00000000b501', null, '00000000-0000-0000-0000-00000000bb01', 'qr', 1, 'pending')
on conflict (id) do nothing;

insert into public.rate_limit_counters (id, scope_key, survey_link_id, source, window_start, request_count, expires_at)
values (
  '00000000-0000-0000-0000-00000000ac01',
  'rls:scope:a1',
  '00000000-0000-0000-0000-00000000a901',
  'qr',
  date_trunc('hour', now()),
  1,
  date_trunc('hour', now()) + interval '1 hour'
)
on conflict (id) do nothing;

commit;

-- Actor helpers.
-- Run one actor block inside a transaction before its assertions.
--
-- begin;
-- set local role authenticated;
-- select set_config('request.jwt.claim.role', 'authenticated', true);
-- select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000102', true);
-- ... queries ...
-- rollback;
--
-- For anon:
-- begin;
-- set local role anon;
-- select set_config('request.jwt.claim.role', 'anon', true);
-- select set_config('request.jwt.claim.sub', '', true);
-- ... queries ...
-- rollback;

-- Expected: restaurant_admin A sees restaurant A only.
begin;
set local role authenticated;
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000102', true);
select 'admin_a_restaurants' as case_name, count(*) as rows_seen from public.restaurants;
select 'admin_a_cannot_see_b' as case_name, count(*) as rows_seen from public.restaurants where id = '00000000-0000-0000-0000-0000000000b1';
rollback;

-- Expected: manager sees only assigned branch A1 and scoped children.
begin;
set local role authenticated;
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000104', true);
select 'manager_a_branch_a1' as case_name, count(*) as rows_seen from public.branches where id = '00000000-0000-0000-0000-00000000a401';
select 'manager_a_branch_a2' as case_name, count(*) as rows_seen from public.branches where id = '00000000-0000-0000-0000-00000000a402';
select 'manager_a_branch_b1' as case_name, count(*) as rows_seen from public.branches where id = '00000000-0000-0000-0000-00000000b401';
select 'manager_a_responses' as case_name, id, customer_phone from public.feedback_responses order by id;
update public.restaurant_settings
set primary_color = '#111111'
where restaurant_id = '00000000-0000-0000-0000-0000000000a1';
-- Expected update result: 0 rows updated or RLS error, depending SQL client behavior.
rollback;

-- Expected: platform_admin sees restaurants but not individual feedback responses or alerts.
begin;
set local role authenticated;
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000101', true);
select 'platform_restaurants' as case_name, count(*) as rows_seen from public.restaurants;
select 'platform_feedback_responses' as case_name, count(*) as rows_seen from public.feedback_responses;
select 'platform_feedback_alerts' as case_name, count(*) as rows_seen from public.feedback_alerts;
rollback;

-- Expected: anon cannot read internal tables and cannot insert feedback directly.
begin;
set local role anon;
select set_config('request.jwt.claim.role', 'anon', true);
select set_config('request.jwt.claim.sub', '', true);
select 'anon_restaurants' as case_name, count(*) as rows_seen from public.restaurants;
insert into public.feedback_responses (
  restaurant_id, branch_id, survey_link_id, source,
  general_experience, service_attention, food_quality, service_speed,
  consent_to_contact, has_alert
)
values (
  '00000000-0000-0000-0000-0000000000a1',
  '00000000-0000-0000-0000-00000000a401',
  '00000000-0000-0000-0000-00000000a901',
  'qr',
  5, 5, 5, 5,
  false, false
);
-- Expected insert result: RLS error.
rollback;

-- Expected: rate_limit_counters is not frontend-accessible.
begin;
set local role authenticated;
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000102', true);
select 'rate_limit_counters_authenticated' as case_name, count(*) as rows_seen from public.rate_limit_counters;
rollback;

-- Expected: no direct delete on business tables.
begin;
set local role authenticated;
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000102', true);
delete from public.branches where restaurant_id = '00000000-0000-0000-0000-0000000000a1';
-- Expected delete result: RLS error or 0 rows deleted.
rollback;

-- Cleanup fixtures. Run as owner role after manual verification.
begin;
delete from public.rate_limit_counters where id in ('00000000-0000-0000-0000-00000000ac01');
delete from public.feedback_alerts where id in ('00000000-0000-0000-0000-00000000ab01', '00000000-0000-0000-0000-00000000bb02');
delete from public.feedback_responses where id in ('00000000-0000-0000-0000-00000000aa01', '00000000-0000-0000-0000-00000000aa02', '00000000-0000-0000-0000-00000000bb01');
delete from public.survey_links where id in ('00000000-0000-0000-0000-00000000a901', '00000000-0000-0000-0000-00000000a902', '00000000-0000-0000-0000-00000000b901');
delete from public.devices where id in ('00000000-0000-0000-0000-00000000a801', '00000000-0000-0000-0000-00000000a802', '00000000-0000-0000-0000-00000000b801');
delete from public.waiters where id in ('00000000-0000-0000-0000-00000000a701', '00000000-0000-0000-0000-00000000a702', '00000000-0000-0000-0000-00000000b701');
delete from public.manager_branch_assignments where id in ('00000000-0000-0000-0000-00000000a601');
delete from public.zones where id in ('00000000-0000-0000-0000-00000000a501', '00000000-0000-0000-0000-00000000a502', '00000000-0000-0000-0000-00000000b501');
delete from public.branches where id in ('00000000-0000-0000-0000-00000000a401', '00000000-0000-0000-0000-00000000a402', '00000000-0000-0000-0000-00000000b401');
delete from public.user_profiles where id in ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000104');
delete from public.restaurant_settings where id in ('00000000-0000-0000-0000-00000000a301', '00000000-0000-0000-0000-00000000b301');
delete from public.restaurant_accounts where id in ('00000000-0000-0000-0000-00000000a201', '00000000-0000-0000-0000-00000000b201');
delete from public.restaurants where id in ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000b1');
delete from auth.users where id in (
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000102',
  '00000000-0000-0000-0000-000000000103',
  '00000000-0000-0000-0000-000000000104',
  '00000000-0000-0000-0000-000000000105'
);
commit;
