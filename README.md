# SentiQ

SentiQ is a SaaS product for restaurant feedback. This repository contains the
Phase 2 frontend foundation for Next.js, Tailwind CSS, shadcn/ui, Supabase, and
Cloudflare Pages.

## Stack

- Next.js App Router with TypeScript
- `src/` project layout
- Tailwind CSS
- shadcn/ui
- Supabase client-side public configuration
- Static export for Cloudflare Pages

## Getting Started

Install dependencies:

```bash
pnpm install
```

Copy the example environment file:

```bash
cp .env.example .env.local
```

Run the local development server:

```bash
pnpm dev
```

Open `http://localhost:3000`.

## Scripts

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## Routes

- `/` public landing placeholder
- `/privacidad` privacy placeholder
- `/login` auth placeholder
- `/s/:token` branch QR survey placeholder
- `/d/:token` device survey placeholder
- `/gracias` survey completion placeholder
- `/enlace-invalido` invalid survey link placeholder
- `/app` restaurant admin and manager placeholder
- `/platform-admin` platform admin placeholder

## Static Export

`next.config.ts` is configured with `output: "export"`, `trailingSlash: true`,
and `images.unoptimized: true` for Cloudflare Pages compatibility.

Dynamic token routes are placeholders in this phase. Because static export
cannot pre-render unknown token values, the current build only emits a
`placeholder` token page for each capture mode. Token resolution and hosting
rewrite behavior should be finalized before implementing capture flows.

## Environment Variables

Only public browser-safe variables are documented in `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Do not add `SUPABASE_SERVICE_ROLE_KEY` or other secrets to client-side
environment files.
