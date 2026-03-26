# Comments feature — scope (Phase 4)

This document defines what “comments” would mean for this blog if you implement them later. It is a product/technical scope, not a promise of delivery.

## Goals

- Let readers respond to a post in public view without requiring accounts (initially), while staying resilient to spam and abuse.
- Keep moderation practical for a single-author blog.

## Out of scope (first iteration)

- Full threaded discussions (nested replies) beyond one optional “reply depth.”
- Rich text / embedded media in comments.
- Social login (GitHub, Google) unless you later add bookmark/reaction account linking.

## Proposed MVP

**Data model**

- `post_comments` table: `id`, `post_id` (FK), `parent_id` nullable (self-FK for optional one-level threading), `author_display` (string, max length), `body` (plain text, max length), `status` (`pending` | `approved` | `spam` | `rejected`), `created_at`, `moderator_note` optional.
- Opaque `visitor_hash` (same approach as reactions) plus IP rate limits to reduce duplicate identities without storing raw IPs in the comment row.

**Flow**

1. Public form on the post page when `isPostPubliclyVisible(post)` (same gate as reactions).
2. New submissions default to `pending` (or `approved` with aggressive spam scoring if you prefer open comments — not recommended without moderation UI).
3. Admin UI: list pending comments, approve/reject/mark spam, optional edit of display name only.

**Abuse / safety**

- Rate limits per IP and per visitor id (stricter than reactions).
- Honeypot field + minimum time-on-page heuristic (optional).
- Blocklist for URLs and obvious spam patterns in `body`.
- Max lengths enforced server-side; sanitize/strip HTML (treat as plain text only).

**API shape (sketch)**

- `POST /api/blog/[slug]/comments` — create pending comment (validated body, optional parent id for thread).
- `GET /api/blog/[slug]/comments` — list approved comments for public display (cursor or simple offset).
- Admin-only routes for moderation CRUD (session-protected), separate from public GET.

## Alternatives

- **Static / third-party**: Utterances (GitHub issues), Giscus, or hosted Disqus — faster to ship, different privacy tradeoffs.
- **Email-only**: “Reply by email” link without public thread — minimal moderation surface.

## Dependencies

- Supabase (or equivalent) for persistence; same deployment assumptions as posts and reactions.
- Migration + RLS: public read approved only; inserts via service role from API routes (mirror reactions pattern).

## Decision checklist before building

1. Moderation default: pending vs auto-approve?
2. Threading: flat only vs one-level replies?
3. Notification: email on new pending comment?
4. GDPR / retention: how long to keep IP-derived hashes and rejected spam?

When these are decided, implementation can follow the reactions pattern (slug → post id, visibility checks, rate limits, hashed visitor id).
