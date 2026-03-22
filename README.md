# Blog

A personal blog built with Next.js, Supabase, and Resend.

## Setup

1. **Copy environment variables**
   ```bash
   cp .env.example .env.local
   ```

2. **Configure required vars**
   - `ADMIN_PASSWORD` — Password for `/admin` (required)
   - `NEXT_PUBLIC_SITE_URL` — Your domain (e.g. `https://yourblog.com`)

3. **Supabase (for persisted posts)**
   - Create a project at [supabase.com](https://supabase.com)
   - Run the migration: `supabase/migrations/00001_create_posts.sql`
   - Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - After first admin login, call `POST /api/seed` (with session cookie) to seed sample posts

4. **Resend (for newsletter & contact form)**
   - Sign up at [resend.com](https://resend.com)
   - Add `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CONTACT_EMAIL`

5. **Run**
   ```bash
   npm install
   npm run dev
   ```

## Without Supabase

The site works without Supabase: it uses hardcoded sample posts. The admin dashboard will show "Failed to save" when creating/editing until Supabase is configured.

## Scripts

- `npm run dev` — Start dev server
- `npm run build` — Build for production
- `npm run start` — Start production server
