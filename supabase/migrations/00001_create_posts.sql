-- Create posts table for the blog
create table if not exists public.posts (
  id text primary key,
  title text not null,
  slug text not null unique,
  excerpt text not null,
  content text not null,
  category text not null check (category in ('Life', 'Work', 'Hobbies', 'Experience')),
  tags text[] default '{}',
  featured_image text,
  author_name text not null,
  author_avatar text,
  author_bio text,
  published_at date not null,
  updated_at date,
  read_time integer not null default 1,
  status text not null check (status in ('draft', 'published'))
);

-- Enable RLS
alter table public.posts enable row level security;

-- Public can read published posts only
create policy "Public can read published posts"
  on public.posts for select
  using (status = 'published');

-- Service role can do everything (used by API routes)
create policy "Service role full access"
  on public.posts for all
  using (true)
  with check (true);

-- Create index for common queries
create index if not exists posts_slug_idx on public.posts (slug);
create index if not exists posts_status_idx on public.posts (status);
create index if not exists posts_published_at_idx on public.posts (published_at desc);
