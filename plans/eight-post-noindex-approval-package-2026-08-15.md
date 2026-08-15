# Eight-post noindex approval package — 2026-08-15

Status: prepared for approval only. Nothing in this package has been applied to production.

## Purpose

Temporarily remove the highest-risk articles from the public search index while they are rewritten, consolidated, sourced, or reframed. This is intended to reduce AdSense low-value-content risk without deleting posts or changing their public URLs.

## Important constraint

The current post model/API does not expose a per-post `noindex` field. Applying this package requires one of these implementation choices:

1. **Code-controlled slug list**: add a small approved high-risk slug set in code and emit `robots: { index: false, follow: true }` from `app/blog/[slug]/page.tsx` for matching slugs.
   - Fastest and most reversible.
   - Requires deploy to change list.
2. **Database-backed post SEO field**: add a `noindex`/`robots_index` column and Admin control.
   - Better long-term editorial control.
   - Requires schema migration, Admin UI/API work, and more testing.
3. **Temporary robots.txt disallow**: not recommended for this case because it can block recrawling of the article meta tags and is less precise for AdSense quality review.

Recommended first step: option 1, code-controlled slug list, then rewrite/consolidate articles and remove slugs from the list as each article is fixed.

## Proposed temporary noindex list

| #   | Slug                                                                 | Primary risk                                                                                                                 | Recommended editorial action                                                                                                                         |
| --- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `psychology-behind-garbage-chaos-subsidized-housing`                 | Unsupported psychological/health assertions; stigmatizing generalizations; “well-documented” style claims without citations. | Rewrite as a concrete building-observation piece with neutral language, no amateur diagnosis, and official/public-health sources where needed.       |
| 2   | `why-harassing-building-staff-has-to-stop`                           | Unsupported trauma/cortisol/sleep/liability/OHSA claims; high-sensitivity workplace conduct topic.                           | Reframe around boundaries, documentation, respectful communication, and cite official workplace-safety/legal sources if claims remain.               |
| 3   | `what-is-a-notice-of-entry-noe-and-what-it-isnt`                     | Ontario legal guidance without direct Residential Tenancies Act / LTB sourcing; risk of overconfident advice.                | Rewrite with official sources, clear “not legal advice” scope, and practical building-operations framing.                                            |
| 4   | `first-acupuncture-treatment-running-injury-knee-recovery`           | Personal experience drifts toward treatment advice without medical sourcing.                                                 | Keep as first-person recovery log; remove treatment recommendations or cite credible health sources with careful scope.                              |
| 5   | `the-mould-problem-dangers-resolution-and-prevention`                | Health/remediation guidance without public-health or environmental-health sources.                                           | Rewrite with official/public-health sources, caveats, and clear distinction between observation, maintenance response, and professional remediation. |
| 6   | `how-pest-problems-start-and-spread-in-your-home`                    | Overgeneralizes resident behaviour and underplays building-level/system causes.                                              | Rewrite to balance resident, building, contractor, and maintenance factors; add official/public-health pest guidance where factual claims remain.    |
| 7   | `dealing-with-difficult-tenants-disputes-evictions-high-maintenance` | Broad legal/process guidance; potentially adversarial framing around tenants.                                                | Consolidate into a neutral documentation-and-communication article; cite official tenancy/process sources if eviction/legal process remains.         |
| 8   | `the-audit-nobody-wants-to-run`                                      | Sensitive subsidized-housing eligibility narrative; privacy/reputational risk.                                               | Rewrite with anonymization, policy citations if any policy claims remain, and focus on process integrity rather than personal suspicion.             |

## Proposed code-controlled implementation shape

If approved, add a helper such as:

```ts
const TEMPORARILY_NOINDEXED_POST_SLUGS = new Set([
  "psychology-behind-garbage-chaos-subsidized-housing",
  "why-harassing-building-staff-has-to-stop",
  "what-is-a-notice-of-entry-noe-and-what-it-isnt",
  "first-acupuncture-treatment-running-injury-knee-recovery",
  "the-mould-problem-dangers-resolution-and-prevention",
  "how-pest-problems-start-and-spread-in-your-home",
  "dealing-with-difficult-tenants-disputes-evictions-high-maintenance",
  "the-audit-nobody-wants-to-run",
]);
```

Then in `generateMetadata` for `app/blog/[slug]/page.tsx`, emit:

```ts
robots: TEMPORARILY_NOINDEXED_POST_SLUGS.has(slug)
  ? { index: false, follow: true }
  : { index: true, follow: true };
```

Do **not** unpublish the posts. Keep `follow: true` so internal links can still be crawled.

## Verification checklist if Louie approves applying noindex

1. Add a regression test that every listed slug emits `noindex, follow` metadata.
2. Add a regression test that normal posts remain `index, follow`.
3. Run:
   - `npm run test`
   - `npm run lint`
   - `npm run build`
   - `git diff --check`
4. Browser/HTTP verify a listed article page has `<meta name="robots" content="noindex, follow">`.
5. Browser/HTTP verify a strong normal article remains indexable.
6. Commit and push.
7. Louie manually deploys in Coolify.
8. Production verify the same two article classes.
9. Record the temporary noindex state and removal criteria in `PROJECT_STATUS.md`.

## Removal criteria

Remove each slug from the temporary noindex list when the article has been substantially rewritten or consolidated and passes these checks:

- specific first-hand event, setting, constraints, and outcome;
- no unsupported medical/legal/safety/psychological claims;
- official citations where authority is needed;
- neutral and non-stigmatizing language;
- non-generic internal links placed contextually, not mechanically at the end;
- image/alt text matches the actual article; and
- article remains at or above the 700-word generated-content floor without filler.
