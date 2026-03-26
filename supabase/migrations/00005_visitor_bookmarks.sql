-- Ordered bookmark lists per anonymous visitor (hashed id from client UUID)
create table if not exists public.visitor_bookmarks (
  visitor_hash text primary key,
  slugs jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  constraint visitor_bookmarks_slugs_array check (jsonb_typeof(slugs) = 'array')
);

alter table public.visitor_bookmarks enable row level security;

create policy "Service role full access visitor_bookmarks"
  on public.visitor_bookmarks for all
  using (true)
  with check (true);
