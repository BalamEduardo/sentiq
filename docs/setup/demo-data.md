# Demo Data

This project includes a controlled seed script for local or remote development Supabase projects.

The script uses the Supabase service role key from your shell environment. Do not put real service role keys, real passwords, or generated public tokens in committed files.

## Environment

Copy `.env.example` to `.env.local` or export the variables in your shell:

```bash
SUPABASE_URL="https://your-dev-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-dev-service-role-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

DEMO_RESTAURANT_ADMIN_EMAIL="admin.demo@sentiq.dev"
DEMO_RESTAURANT_ADMIN_PASSWORD="change-this-dev-password"
DEMO_MANAGER_EMAIL="manager.demo@sentiq.dev"
DEMO_MANAGER_PASSWORD="change-this-dev-password"
```

Optional platform admin:

```bash
DEMO_PLATFORM_ADMIN_EMAIL="platform.demo@sentiq.dev"
DEMO_PLATFORM_ADMIN_PASSWORD="change-this-dev-password"
```

Use dummy development emails only. The script rejects emails that do not look like demo/dev addresses.
Replace every `change-this-dev-password` placeholder before running the seed. The script rejects placeholder passwords and passwords shorter than 12 characters. When `CI=true`, the script prints demo emails and URLs but does not print passwords.

## Run

```bash
pnpm seed:demo
```

The script creates or updates:

- Demo restaurant, account, and settings.
- Branches `Centro` and `Norte`.
- Zones for Centro and Norte.
- Restaurant admin and manager Auth users.
- `user_profiles` for valid roles.
- Manager assignment limited to Centro.
- Demo waiters.
- One demo device.
- QR and device survey links.
- Demo feedback responses.
- One pending alert and one attended alert.

At the end it prints:

- Demo credentials from your environment.
- Current `/s/<token>` QR URL.
- Current `/d/<token>` device URL.
- Useful IDs.

The printed public tokens are shown only at runtime. The database stores only `token_hash` and `token_last4`.

## Idempotency

The script searches by stable demo identifiers such as slug, email, branch slug, device name, internal waiter code, and response metadata.

Running it again updates the same demo rows. QR and device links are reused, but their public tokens are regenerated each run so the script can print valid current URLs without storing plaintext tokens.

## Validate

After running:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

Then verify in Supabase that these tables have demo rows:

- `restaurants`
- `restaurant_accounts`
- `restaurant_settings`
- `branches`
- `zones`
- `user_profiles`
- `manager_branch_assignments`
- `devices`
- `survey_links`
- `feedback_responses`
- `feedback_alerts`

Confirm `survey_links` has no plaintext token column or value. It should only contain `token_hash` and `token_last4`.

## Functional Checks

Open the QR URL printed by the script:

```text
/s/<token>
```

It should load public survey configuration for the demo restaurant.

Open the device URL:

```text
/d/<token>
```

When device capture is implemented, this should identify the demo device and zone.

With a restaurant admin JWT, `regenerate_qr_token` can be called with the printed `branch_centro_id`. The old QR token should stop working and the new URL should load `/s/<token>`.

Use `submit_feedback` with the printed QR/device tokens to verify:

- Positive feedback creates a response without alert.
- `general_experience <= 3` creates a response with `has_alert = true` and a pending alert.
- Phone without consent fails.
- Ratings outside `1..5` fail.

## Reset

For local development, the cleanest reset is to reset the local Supabase database and run migrations again, then re-run:

```bash
pnpm seed:demo
```

For remote development, delete rows marked with `metadata.demo_seed = "cor-75-demo"` for feedback responses first, then delete dependent demo alerts/responses if needed. Prefer using a disposable dev project over cleaning production-like environments manually.
