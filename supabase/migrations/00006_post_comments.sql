create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id text not null references public.posts (id) on delete cascade,
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
  on public.post_comments (post_id, status, created_at desc);

alter table public.post_comments enable row level security;

create policy "Service role full access post_comments"
  on public.post_comments for all
  using (true)
  with check (true);
