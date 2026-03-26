-- One reaction per visitor per post (visitor_hash is opaque server-side hash)
create table if not exists public.post_reactions (
  post_id text not null references public.posts (id) on delete cascade,
  voter_hash text not null,
  kind text not null check (kind in ('helpful', 'thanks', 'insight')),
  created_at timestamptz not null default now(),
  primary key (post_id, voter_hash)
);

create index if not exists post_reactions_post_id_idx on public.post_reactions (post_id);

alter table public.post_reactions enable row level security;
