# SentiQ Agent Notes

## Project

SentiQ is a SaaS product for restaurant feedback. Phase 2 uses a static-export
Next.js frontend with Supabase and Cloudflare Pages.

## Constraints

- Use `pnpm`.
- Use Next.js App Router with `src/`.
- Keep the app compatible with static export.
- Do not add `src/app/api`.
- Do not add Next.js API routes, backend Express/Nest, or sensitive Server
  Actions.
- Do not commit secrets. `.env.example` must only include public variables.

## Route Conventions

- `/s/:token` is the branch QR survey.
- `/d/:token` is the device-mode survey.
- `/app` is for restaurant admins and managers.
- `/platform-admin` is for platform admins.
- Do not create `/f`, `/kiosk`, `/admin`, `/mesa`, or `/mesero`.
