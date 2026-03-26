-- Optional alt text for featured images (accessibility / SEO)
alter table public.posts
  add column if not exists featured_image_alt text;
