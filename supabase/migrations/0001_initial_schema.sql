create extension if not exists "pgcrypto";

create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text null,
  slug text not null unique,
  contact_name text null,
  contact_email text null,
  contact_phone text null,
  status text not null default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.restaurant_accounts (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id),
  plan_code text not null,
  account_status text not null,
  implementation_fee_mxn numeric null,
  monthly_fee_mxn numeric null,
  notes text null,
  started_at timestamptz null,
  cancelled_at timestamptz null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.restaurant_settings (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id),
  logo_url text null,
  logo_storage_path text null,
  primary_color text null,
  secondary_color text null,
  survey_welcome_text text null,
  survey_thank_you_text text null,
  question_general_text text null,
  question_attention_text text null,
  question_food_text text null,
  question_speed_text text null,
  contact_consent_text text null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.branches (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id),
  name text not null,
  slug text not null,
  address text null,
  internal_phone text null,
  notes text null,
  status text not null default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (restaurant_id, slug)
);

create table public.zones (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id),
  branch_id uuid not null references public.branches(id),
  name text not null,
  status text not null default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.user_profiles (
  id uuid primary key references auth.users(id),
  restaurant_id uuid null references public.restaurants(id),
  full_name text not null,
  email text not null,
  role text not null,
  status text not null default 'active',
  created_by uuid null references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.manager_branch_assignments (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id),
  manager_user_id uuid not null references auth.users(id),
  branch_id uuid not null references public.branches(id),
  status text not null default 'active',
  created_at timestamptz default now(),
  created_by uuid null references auth.users(id),
  unique (manager_user_id, branch_id)
);

create table public.waiters (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id),
  branch_id uuid not null references public.branches(id),
  name text not null,
  internal_code text null,
  status text not null default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.devices (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id),
  branch_id uuid not null references public.branches(id),
  zone_id uuid null references public.zones(id),
  name text not null,
  description text null,
  status text not null default 'active',
  last_used_at timestamptz null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.survey_links (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id),
  branch_id uuid not null references public.branches(id),
  zone_id uuid null references public.zones(id),
  device_id uuid null references public.devices(id),
  type text not null,
  name text null,
  token_hash text not null unique,
  token_last4 text null,
  status text not null default 'active',
  created_by uuid null references auth.users(id),
  regenerated_at timestamptz null,
  revoked_at timestamptz null,
  last_used_at timestamptz null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.feedback_responses (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id),
  branch_id uuid not null references public.branches(id),
  zone_id uuid null references public.zones(id),
  device_id uuid null references public.devices(id),
  survey_link_id uuid not null references public.survey_links(id),
  waiter_id uuid null references public.waiters(id),
  source text not null,
  general_experience smallint not null,
  service_attention smallint not null,
  food_quality smallint not null,
  service_speed smallint not null,
  comment text null,
  customer_phone text null,
  consent_to_contact boolean not null default false,
  consent_text_snapshot text null,
  has_alert boolean not null default false,
  metadata jsonb null,
  created_at timestamptz default now()
);

create table public.feedback_alerts (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id),
  branch_id uuid not null references public.branches(id),
  zone_id uuid null references public.zones(id),
  device_id uuid null references public.devices(id),
  response_id uuid not null unique references public.feedback_responses(id),
  source text not null,
  general_experience smallint not null,
  status text not null default 'pending',
  attended_by uuid null references auth.users(id),
  attended_at timestamptz null,
  internal_note text null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.rate_limit_counters (
  id uuid primary key default gen_random_uuid(),
  scope_key text not null,
  survey_link_id uuid not null references public.survey_links(id),
  source text not null,
  window_start timestamptz not null,
  request_count integer not null default 0,
  expires_at timestamptz not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
