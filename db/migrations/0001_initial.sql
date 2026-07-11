-- Direct Postgres schema for super_blog (Coolify deployment).
-- Safe to re-run: uses IF NOT EXISTS / additive ALTER statements.

create extension if not exists pgcrypto;

create table if not exists posts (
  id text primary key,
  title text not null,
  slug text not null unique,
  excerpt text not null,
  content text not null,
  category text not null check (category in ('Life', 'Work', 'Hobbies', 'Experience')),
  tags text[] default '{}',
  featured_image text,
  featured_image_alt text,
  author_name text not null,
  author_avatar text,
  author_bio text,
  published_at timestamptz not null,
  updated_at timestamptz,
  read_time integer not null default 1,
  status text not null check (status in ('draft', 'scheduled', 'published'))
);

alter table posts add column if not exists featured_image_alt text;

create index if not exists posts_slug_idx on posts (slug);
create index if not exists posts_status_idx on posts (status);
create index if not exists posts_published_at_idx on posts (published_at desc);

create table if not exists site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists post_reactions (
  post_id text not null references posts (id) on delete cascade,
  voter_hash text not null,
  kind text not null check (kind in ('helpful', 'thanks', 'insight')),
  created_at timestamptz not null default now(),
  primary key (post_id, voter_hash)
);

create index if not exists post_reactions_post_id_idx on post_reactions (post_id);

create table if not exists outbound_click_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  post_slug text not null,
  href text not null,
  link_host text not null,
  is_affiliate boolean not null
);

create index if not exists outbound_click_events_created_at_idx
  on outbound_click_events (created_at desc);
create index if not exists outbound_click_events_post_slug_idx
  on outbound_click_events (post_slug);
create index if not exists outbound_click_events_affiliate_idx
  on outbound_click_events (is_affiliate)
  where is_affiliate = true;

create table if not exists visitor_bookmarks (
  visitor_hash text primary key,
  slugs jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  constraint visitor_bookmarks_slugs_array check (jsonb_typeof(slugs) = 'array')
);

create table if not exists post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id text not null references posts (id) on delete cascade,
  author_name text not null,
  body text not null,
  visitor_hash text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  constraint post_comments_author_len check (
    char_length(trim(author_name)) >= 1 and char_length(author_name) <= 120
  ),
  constraint post_comments_body_len check (
    char_length(trim(body)) >= 1 and char_length(body) <= 8000
  )
);

create index if not exists post_comments_post_status_created_idx
  on post_comments (post_id, status, created_at desc);
