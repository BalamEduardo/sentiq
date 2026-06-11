# Supabase Migrations

This repository keeps database migrations in `supabase/migrations`.

## Apply Locally

Install and authenticate the Supabase CLI if it is not already available, then
start a local Supabase stack from the repository root:

```bash
supabase start
```

Apply the migrations to the local database:

```bash
supabase db reset
```

If you are working against a linked remote project, review the SQL first and use
the standard Supabase migration workflow for that environment.

## Initial Schema

`supabase/migrations/0001_initial_schema.sql` creates the Phase 2 SaaS tables:

- `restaurants`
- `restaurant_accounts`
- `restaurant_settings`
- `branches`
- `zones`
- `user_profiles`
- `manager_branch_assignments`
- `waiters`
- `devices`
- `survey_links`
- `feedback_responses`
- `feedback_alerts`
- `rate_limit_counters`

The migration includes `pgcrypto`, UUID primary keys, core foreign keys, column
defaults, and the minimum unique constraints required by COR-73.

This initial migration intentionally does not include RLS policies, seed data,
demo data, Edge Functions, frontend-derived types, token-generation logic,
token history, audit logs, broad performance indexes, or the full CHECK
constraint package planned for later tickets.

## Roles And Profile Helpers

`supabase/migrations/0002_roles_and_profile_helpers.sql` adds the technical
role and profile consistency layer required by COR-76 / T-007.

The migration adds minimum CHECK constraints to `user_profiles`:

- `role` must be one of `platform_admin`, `restaurant_admin`, or `manager`.
- `status` must be one of `active`, `invited`, or `inactive`.
- `platform_admin` profiles must not have a `restaurant_id`.
- `restaurant_admin` and `manager` profiles must have a `restaurant_id`.

It also adds the minimum status CHECK constraint to
`manager_branch_assignments`, where `status` must be `active` or `inactive`.
The existing unique constraint on `(manager_user_id, branch_id)` remains in
`0001_initial_schema.sql`.

The migration creates these SQL helpers for the RLS work planned in T-008:

- `public.is_platform_admin()`
- `public.current_restaurant_id()`
- `public.is_restaurant_admin(target_restaurant_id uuid)`
- `public.is_manager_of_branch(target_branch_id uuid)`

These helpers use `auth.uid()`, only treat `active` profiles as authorized, use
the exact technical roles above, and are independent from frontend route guards.
They are `security definer` functions with a fixed `search_path` so future RLS
policies can call them consistently. Execute permission is granted to
`authenticated`; no `service_role` behavior is exposed or required.

`supabase/migrations/0003_lock_down_role_helper_grants.sql` explicitly revokes
direct RPC execution of those helpers from `anon` and `service_role`, while
keeping execution available to `authenticated` for future RLS policies.

T-007 intentionally does not enable RLS and does not create policies. T-008 is
responsible for enabling RLS table by table and wiring policies to these
helpers.
