alter table public.restaurants
  add constraint restaurants_status_check
  check (status in ('active', 'inactive', 'suspended'));

alter table public.restaurant_accounts
  add constraint restaurant_accounts_plan_code_check
  check (plan_code in ('demo', 'basico', 'pro', 'custom'));

alter table public.restaurant_accounts
  add constraint restaurant_accounts_account_status_check
  check (account_status in ('demo', 'pilot', 'active', 'paused', 'cancelled'));

alter table public.branches
  add constraint branches_status_check
  check (status in ('active', 'inactive'));

alter table public.zones
  add constraint zones_status_check
  check (status in ('active', 'inactive'));

alter table public.waiters
  add constraint waiters_status_check
  check (status in ('active', 'inactive'));

alter table public.devices
  add constraint devices_status_check
  check (status in ('active', 'inactive', 'lost', 'revoked'));

alter table public.survey_links
  add constraint survey_links_type_check
  check (type in ('qr', 'device'));

alter table public.survey_links
  add constraint survey_links_status_check
  check (status in ('active', 'inactive', 'revoked'));

alter table public.survey_links
  add constraint survey_links_type_device_consistency_check
  check (
    (type = 'qr' and device_id is null)
    or (type = 'device' and device_id is not null)
  );

alter table public.feedback_responses
  add constraint feedback_responses_source_check
  check (source in ('qr', 'device'));

alter table public.feedback_responses
  add constraint feedback_responses_scores_check
  check (
    general_experience between 1 and 5
    and service_attention between 1 and 5
    and food_quality between 1 and 5
    and service_speed between 1 and 5
  );

alter table public.feedback_responses
  add constraint feedback_responses_phone_consent_check
  check (customer_phone is null or consent_to_contact = true);

alter table public.feedback_responses
  add constraint feedback_responses_has_alert_consistency_check
  check (has_alert = (general_experience <= 3));

alter table public.feedback_alerts
  add constraint feedback_alerts_source_check
  check (source in ('qr', 'device'));

alter table public.feedback_alerts
  add constraint feedback_alerts_general_experience_check
  check (general_experience between 1 and 3);

alter table public.feedback_alerts
  add constraint feedback_alerts_status_check
  check (status in ('pending', 'attended'));

alter table public.rate_limit_counters
  add constraint rate_limit_counters_source_check
  check (source in ('qr', 'device'));

alter table public.rate_limit_counters
  add constraint rate_limit_counters_request_count_check
  check (request_count >= 0);

alter table public.rate_limit_counters
  add constraint rate_limit_counters_window_check
  check (expires_at > window_start);

create unique index survey_links_one_active_qr_per_branch_idx
  on public.survey_links (branch_id)
  where type = 'qr' and status = 'active';

create index branches_restaurant_id_idx
  on public.branches (restaurant_id);

create index user_profiles_restaurant_id_idx
  on public.user_profiles (restaurant_id);

create index user_profiles_role_idx
  on public.user_profiles (role);

create index manager_branch_assignments_manager_user_id_idx
  on public.manager_branch_assignments (manager_user_id);

create index manager_branch_assignments_branch_id_idx
  on public.manager_branch_assignments (branch_id);

create index devices_restaurant_id_branch_id_idx
  on public.devices (restaurant_id, branch_id);

create index survey_links_restaurant_id_branch_id_idx
  on public.survey_links (restaurant_id, branch_id);

create index survey_links_type_status_idx
  on public.survey_links (type, status);

create index feedback_responses_restaurant_id_created_at_idx
  on public.feedback_responses (restaurant_id, created_at desc);

create index feedback_responses_branch_id_created_at_idx
  on public.feedback_responses (branch_id, created_at desc);

create index feedback_responses_survey_link_id_idx
  on public.feedback_responses (survey_link_id);

create index feedback_responses_source_idx
  on public.feedback_responses (source);

create index feedback_responses_has_alert_idx
  on public.feedback_responses (has_alert);

create index feedback_alerts_restaurant_id_status_created_at_idx
  on public.feedback_alerts (restaurant_id, status, created_at desc);

create index feedback_alerts_branch_id_status_created_at_idx
  on public.feedback_alerts (branch_id, status, created_at desc);

create index rate_limit_counters_scope_key_window_start_idx
  on public.rate_limit_counters (scope_key, window_start);
