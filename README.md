# Super Blog

A personal blog built with Next.js, direct Postgres, AI-assisted content generation, and Resend.

## Stack

- Next.js App Router
- React
- Tailwind CSS
- Direct Postgres via `postgres`
- Resend for contact/newsletter email
- Claude/Groq/OpenAI for content and image generation
- Coolify for deployment

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure environment variables:

   ```env
   DATABASE_URL=postgres://user:password@host:5432/database
   # or DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD

   ADMIN_SESSION_SECRET=change-me-to-a-long-random-secret
   ADMIN_PASSWORD=change-me-for-first-login
   CONTENT_IDEA_CAPTURE_SECRET=change-me-to-a-long-random-secret

   NEXT_PUBLIC_SITE_URL=https://your-domain.example

   RESEND_API_KEY=
   RESEND_FROM_EMAIL=
   CONTACT_EMAIL=

   ANTHROPIC_API_KEY=
   GROQ_API_KEY=
   OPENAI_API_KEY=
   ```

3. Apply database schema:

   ```bash
   psql "$DATABASE_URL" -f db/migrations/0001_initial.sql
   ```

4. Run locally:

   ```bash
   npm run dev
   ```

## Verification

```bash
npm test
npm run lint
npm run build
```

## Coolify deployment

This project is intended to deploy from GitHub through Coolify.

Required production settings:

- `DATABASE_URL` or equivalent `DB_*` variables
- `ADMIN_SESSION_SECRET`
- email/AI variables for the enabled features

Run `db/migrations/0001_initial.sql` against the production Postgres database before using posts, settings, comments, reactions, bookmarks sync, or outbound click stats.

## Telegram / Hermes idea capture

Set `CONTENT_IDEA_CAPTURE_SECRET` in the production environment and in the Hermes/local shell that will forward Telegram ideas. Then capture an idea with:

```bash
SUPER_BLOG_URL=https://www.maplehub.cloud \
CONTENT_IDEA_CAPTURE_SECRET=*** \
node scripts/capture-telegram-idea.mjs "Blog idea: elevator outage communication lesson priority: high notes: what happened and what I learned"
```

Supported message shape:

```text
Blog idea: Basement flooding morning routine
Category: Work
Priority: high
Target: 2026-08-01
Notes: Rain, old townhomes, paperwork, technician follow-up.
```

## Notes

- If no database env vars are configured, public pages fall back to empty/default data where possible.
- Admin write actions require database configuration.
- Uploaded files are stored in the container path used by the app upload route; ensure Coolify volume persistence if uploads must survive redeploys.
