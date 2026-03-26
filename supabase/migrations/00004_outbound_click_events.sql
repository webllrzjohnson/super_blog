-- Anonymous outbound / affiliate link clicks (instrumentation only; no user ids)
create table if not exists public.outbound_click_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  post_slug text not null,
  href text not null,
  link_host text not null,
  is_affiliate boolean not null
);

create index if not exists outbound_click_events_created_at_idx
  on public.outbound_click_events (created_at desc);

create index if not exists outbound_click_events_post_slug_idx
  on public.outbound_click_events (post_slug);

create index if not exists outbound_click_events_affiliate_idx
  on public.outbound_click_events (is_affiliate)
  where is_affiliate = true;

alter table public.outbound_click_events enable row level security;

create policy "Service role full access outbound_click_events"
  on public.outbound_click_events for all
  using (true)
  with check (true);
