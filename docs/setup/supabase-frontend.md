# Supabase Frontend

The frontend uses the official `@supabase/supabase-js` browser client with only
public environment variables.

## Required Variables

Configure these values locally and in Cloudflare Pages:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=
```

The browser client validates these variables when it is first used and throws a
controlled `PublicEnvError` if any required value is missing or an app URL is
invalid.

## Client Utilities

- `src/config/env.ts` validates public frontend configuration.
- `src/lib/supabase/client.ts` creates the browser Supabase client.
- `src/lib/supabase/session.ts` exposes session helpers.
- `src/lib/supabase/functions.ts` invokes Supabase Edge Functions with typed
  input and output.
- `src/types/supabase.ts` contains placeholder database types until generated
  types are available.

## Security Notes

Never expose service-role or server-only keys in frontend code, `.env.local`, or
Cloudflare Pages variables. Edge Functions belong in Supabase, not in Next.js API
routes, because this app is deployed as a static export.
