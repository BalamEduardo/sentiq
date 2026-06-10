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
