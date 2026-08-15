# MapleHub / super_blog Project Status

_Last updated: 2026-08-14 02:41 UTC_

This file records the current state before resuming work on the blog project.

## Current repo state

- Project: MapleHub / `super_blog`
- Path: `D:\Factory\super_blog`
- Production site: <https://www.maplehub.cloud>
- Branch: `main`
- Remote: `https://github.com/webllrzjohnson/super_blog.git`
- Latest pushed commit at this checkpoint: `291477f6f5ac0f050f339e5806f3af65151e77bb`
- Latest short commit: `291477f fix: use public upload urls for generated images`
- Deployment: Coolify from GitHub `main`
- Important deployment rule: Coolify does **not** auto-deploy for this project; Louie manually triggers deployment.
- Database: direct Postgres. Do **not** reintroduce Supabase assumptions.

## Current phase

The project is in the **AdSense/content-quality and admin publishing refinement phase**.

Recent work centers on:

- AI-assisted post generation.
- Admin-managed AI model/API key settings.
- Generated featured images.
- Public upload URLs for generated images.
- AdSense verification/readiness.
- Short/thin post rewrite planning.

Relevant recent commits:

```text
291477f fix: use public upload urls for generated images
0b99e10 fix: require generated post images
3331297 fix: save generated featured images directly
4a24b2e feat: manage ai api keys in admin
a6d4268 fix: render AdSense verification script
```

## Production health at checkpoint

Checked on 2026-08-14:

- <https://www.maplehub.cloud/> returned `200 OK`.
- <https://www.maplehub.cloud/blog> returned `200 OK`.
- <https://www.maplehub.cloud/api/posts> returned `200 OK` and returned live posts.

## Current local working tree

There are existing local changes and untracked files. These were present before the handoff file was created and should be reviewed before any broad commit.

Modified:

```text
package.json
package-lock.json
```

The package changes appear to add dev dependencies for local document/spreadsheet generation:

```text
docx
exceljs
```

Untracked:

```text
.hermes.md
documents/
plans/adsense-short-post-rewrites.json
plans/apply-humanized-rewrites.mjs
plans/building-inventory-app-plan.md
plans/humanized-rewrites/
plans/show-rewrite.mjs
plans/validate-adsense-rewrites.mjs
plans/validate-humanized-rewrites.mjs
plans/verify-live-rewrites.mjs
scripts/generate-superintendent-docs.mjs
scripts/superintendent-docs/
```

Do not accidentally commit all of these together. Group them by purpose before committing.

## Documentation and plans found

- `README.md` — current project setup/deployment notes.
- `.hermes.md` — project rules, currently untracked locally.
- `plans/comments-scope.md` — comments are documented as a future Phase 4 feature.
- `plans/building-inventory-app-plan.md` — separate building-inventory app/product plan, not current production blog code.
- `plans/adsense-short-post-rewrites.json` — planned rewrite/consolidation package for short/thin AdSense-risk posts.
- `plans/humanized-rewrites/` — local rewrite drafts referenced by verification scripts.

## Database / migration status

Migration source:

```text
db/migrations/0001_initial.sql
```

Production `/api/posts` is returning content, so the production database is active.

No new migration was identified during this switch-in checkpoint.

## AdSense/content cleanup state

The current cleanup plan targets short/thin or overlapping posts, including:

- `respecting-shared-space-update` — recommended action: consolidate into canonical `respecting-shared-space`, then retire/redirect duplicate URL.
- `heat-wave-chaos-in-the-building` — recommended action: expand/rewrite.
- `respecting-shared-space` — recommended action: canonical rewrite/merge.
- `basement-flooding-old-townhouses` — recommended action: expand/rewrite.
- `scooters-in-hallway-problem` — recommended action: modest expansion.

Important content constraints:

- Do not name or imply Louie's employer publicly.
- Keep the house style human and specific.
- Remove invented identifying details such as tenant names, unit numbers, and employer references.
- Avoid padded AI-sounding rewrites.
- Validate drafts before any production update.
- Do not publish or mutate production content without Louie's approval.

Relevant local scripts:

```text
plans/validate-adsense-rewrites.mjs
plans/validate-humanized-rewrites.mjs
plans/apply-humanized-rewrites.mjs
plans/verify-live-rewrites.mjs
```

`verify-live-rewrites.mjs` references a local backup path:

```text
D:/Factory/super_blog-archives/adsense-originals-2026-07-19T18-32-36-276Z.json
```

Confirm that archive exists before applying/verifying production rewrites.

### Validation run on 2026-08-14

Read-only validation was run after this status file was created:

```bash
node plans/validate-adsense-rewrites.mjs
node plans/validate-humanized-rewrites.mjs
```

Results:

- `plans/validate-humanized-rewrites.mjs` passed for four rewrite drafts:
  - `heat-wave-chaos-in-the-building` — 650 words, 1 internal link, no flags
  - `respecting-shared-space` — 738 words, 1 internal link, no flags
  - `basement-flooding-old-townhouses` — 753 words, 1 internal link, no flags
  - `scooters-in-hallway-problem` — 669 words, 1 internal link, no flags
- `plans/validate-adsense-rewrites.mjs` was updated and now passes.
- The retired duplicate slug `respecting-shared-space-update` is allowed only when its action is `consolidate`, and the validator reports it as:

```text
retired duplicate missing from live API
```

This is informational only and no longer fails validation.

Current clean AdSense rewrite package results:

- `heat-wave-chaos-in-the-building` — expand, 650 live words → 808 proposed words, no flags
- `respecting-shared-space` — rewrite, 738 live words → 849 proposed words, no flags
- `basement-flooding-old-townhouses` — expand, 753 live words → 865 proposed words, no flags
- `scooters-in-hallway-problem` — expand, 669 live words → 934 proposed words, no flags

## Recommended next work

### Phase 1 — Stabilize local work buckets

1. Decide whether `.hermes.md` should be committed as project rules.
2. Decide whether `documents/` and `scripts/superintendent-docs/` belong in this repo or should be moved elsewhere.
3. Keep the AdSense rewrite plan files separate from the superintendent document generator work.

### Phase 2 — AdSense rewrite cleanup

1. Validate local rewrite drafts without changing production.
2. Review the five targeted posts for factual accuracy and house style.
3. Confirm duplicate handling for `respecting-shared-space-update`:
   - merge useful content into `respecting-shared-space`
   - decide whether to delete, unpublish, or redirect the duplicate slug
4. Apply approved rewrites through the admin/API workflow only after Louie approves the exact content changes.
5. Verify live pages and `/api/posts` after production changes.

### Phase 3 — README/deployment cleanup

1. Update `README.md` to mention current AI image/upload behavior, admin API key settings, content idea capture, and AdSense cleanup flow.
2. Add a deployment handoff note reminding that Coolify deploy is manual.
3. Record any migration status if new migrations are added later.

### Phase 4 — Later features

- Comments are scoped in `plans/comments-scope.md` but should remain later-phase unless Louie chooses it.
- Building inventory app is a separate product plan and should not be mixed into MapleHub blog code without explicit direction.

## Recommended immediate next step

Start with **Phase 1 + Phase 2 read-only validation**:

```bash
node plans/validate-adsense-rewrites.mjs
node plans/validate-humanized-rewrites.mjs
```

Then review the generated report and decide whether to apply any content changes.

Current validation result: both rewrite validators pass.

### Production rewrite application on 2026-08-14

Louie approved applying the four validated humanized rewrites.

Command run:

```bash
node plans/apply-humanized-rewrites.mjs --apply
```

Result:

- Original post backup saved outside the repo:

```text
D:/Factory/super_blog-archives/adsense-originals-2026-08-14T03-09-38-845Z.json
```

- Updated live posts:
  - `heat-wave-chaos-in-the-building`
  - `respecting-shared-space`
  - `basement-flooding-old-townhouses`
  - `scooters-in-hallway-problem`
- Script-reported `Live API verification passed`.
- Independent verification confirmed:
  - all four live API titles match expected titles
  - all four live API bodies match the committed markdown drafts
  - all four public `/blog/<slug>` pages return `200`
  - `respecting-shared-space-update` is not present in `/api/posts`

Next step: after Coolify/static cache behavior settles, browser-check the four public pages visually and confirm the AdSense/content cleanup looks good in the live layout.

### Visual rewrite-page browser check on 2026-08-14

The four AdSense-rewritten public pages were checked in the browser after cache settled:

```text
https://www.maplehub.cloud/blog/heat-wave-chaos-in-the-building
https://www.maplehub.cloud/blog/respecting-shared-space
https://www.maplehub.cloud/blog/basement-flooding-old-townhouses
https://www.maplehub.cloud/blog/scooters-in-hallway-problem
```

Verification result:

- All four pages returned `200`.
- Hero images rendered.
- Article title/excerpt/tag blocks rendered correctly.
- Body headings and paragraphs were readable and aligned.
- Sidebar, newsletter, recent posts, tags, comments, reactions, and related-post sections rendered normally.
- No broken hero images, overlapping text, duplicate markdown H1 artifacts, public employer references, placeholder image-alt labels, or leftover `---CONTENT---` markers were found.

### Garmin battery article rewrite on 2026-08-14

Louie approved applying the Garmin Epix Pro Gen 2 battery article correction.

Target post:

```text
garmin-epix-pro-gen-2-battery-life-tips
```

Corrected factual framing:

- The watch was not lasting only a few days.
- Louie's normal baseline was about `27 days`.
- The optimized result was `31+ days` by turning off features Louie did not really need.
- Research source used: Garmin's official Epix Pro Gen 2 Sapphire 51 mm specs and Garmin's battery-drain support article.

Rewrite package:

```text
plans/rewrite-packages/garmin-epix-pro-gen-2-battery-life-2026-08-14.md
plans/rewrite-packages/garmin-epix-pro-gen-2-battery-life-2026-08-14.json
```

Original post backup saved outside the repo:

```text
D:/Factory/super_blog-archives/garmin-battery-original-2026-08-14T03-57-11-145Z.json
```

Verification after production update:

- Live API update completed successfully.
- Live API title, excerpt, and content matched the approved rewrite package.
- Public page returned `200`:
  - `https://www.maplehub.cloud/blog/garmin-epix-pro-gen-2-battery-life-tips`
- Public page contains the corrected `27 days` and `31+` framing.
- Public page no longer contains the old incorrect few-days baseline wording.

### Garmin battery article tone revision on 2026-08-14

Louie requested a follow-up edit so the post does not point out or mention the previous mistake. The live article was revised to focus directly on how Louie got `31+ days` from the Garmin watch.

Changes applied:

- Rewrote the intro/excerpt to say the watch was already giving about `27 days` on a charge.
- Reframed the result as a practical setup that pushed battery life past `31 days`.
- Removed mistake/correction wording from the post body.
- Updated the featured-image alt text so it no longer repeated the old few-days framing.

Backup before this tone revision:

```text
D:/Factory/super_blog-archives/garmin-battery-pre-tone-revision-2026-08-14T04-15-33-867Z.json
```

Verification after the tone revision:

- Live API update completed successfully.
- Public page returned `200`.
- Public page contains `27 days` and `31+` framing.
- Public page includes the new excerpt.
- Public page includes the new featured-image alt text.
- Public page no longer contains mistake/correction/few-days framing.

### Internal-link cleanup application on 2026-08-15

Louie approved applying the first internal-link cleanup package.

Package:

```text
plans/internal-link-package-2026-08-14.json
plans/internal-link-package-2026-08-14.md
```

Original post backup saved outside the repo:

```text
D:/Factory/super_blog-archives/internal-link-originals-2026-08-15T01-12-47-353Z.json
```

Updated live posts:

- `this-isn-t-a-landfill-ongoing-battles-with-garbage-compactor-misuse-in-residential-buildings`
- `why-following-the-plan-actually-matters`
- `coming-back-to-running-after-knee-injury`
- `the-audit-nobody-wants-to-run`
- `the-mould-problem-dangers-resolution-and-prevention`
- `how-superintendents-handle-faucet-repairs-step-by-step-process-guide`
- `the-elevator-woes-better-habits-building-experience`
- `no-i-cant-read-your-mind-why-reporting-building-issues-matters`
- `why-your-building-garbage-compactor-matters`

Verification after production update:

- Live API content matched the approved package for all 9 posts.
- All 9 public pages returned `200`.
- All 9 public pages contained their expected target `/blog/...` internal link.
- No public employer references, placeholder image labels, or `---CONTENT---` markers were found on the updated public pages.

### Internal-link cleanup batch 2 application on 2026-08-15

Louie approved applying the second internal-link cleanup package.

Package:

```text
plans/internal-link-package-2026-08-15-batch-2.json
plans/internal-link-package-2026-08-15-batch-2.md
```

Original post backup saved outside the repo:

```text
D:/Factory/super_blog-archives/internal-link-batch-2-originals-2026-08-15T01-21-37-949Z.json
```

Updated live posts:

- `nursing-a-knee-injury-week-two-update-superintendent`
- `not-all-heroes-wear-capes-superintendent-subsidized-housing-toronto`
- `hidden-cost-of-illegal-garbage-disposal`
- `customer-service-building-superintendent-why-it-matters`
- `failed-g-driving-test-twice-motivation-lane-change-tips`
- `honesty-builds-trust-character-building-superintendent`
- `why-your-underground-parking-garage-is-not-a-storage-unit`
- `first-acupuncture-treatment-running-injury-knee-recovery`
- `the-fine-line-between-compassion-and-burnout-in-working-as-a-building-superintendent`

Verification after production update:

- Live API content matched the approved package for all 9 posts.
- All 9 public pages returned `200`.
- All 9 public pages contained their expected target `/blog/...` internal link.
- No public employer references, placeholder image labels, or `---CONTENT---` markers were found on the updated public pages.

### Internal-link cleanup batch 3 application on 2026-08-15

Louie approved applying the third internal-link cleanup package.

Package:

```text
plans/internal-link-package-2026-08-15-batch-3.json
plans/internal-link-package-2026-08-15-batch-3.md
```

Original post backup saved outside the repo:

```text
D:/Factory/super_blog-archives/internal-link-batch-3-originals-2026-08-15T01-29-27-410Z.json
```

Updated live posts:

- `what-is-a-notice-of-entry-noe-and-what-it-isnt`
- `getting-back-in-shape-after-accident-fitness-routine`
- `tenant-escalating-issues-to-management-skipping-work-order-process`
- `why-harassing-building-staff-has-to-stop`
- `what-its-like-to-be-a-superintendent-for-subsidized-housing`
- `back-from-knee-injury-5k-run-goal`
- `how-pest-problems-start-and-spread-in-your-home`
- `tenant-representatives-advocacy-vs-disruption`
- `subsidized-vs-private-apartment-superintendent-differences`

Verification after production update:

- Live API content matched the approved package for all 9 posts.
- All 9 public pages returned `200`.
- All 9 public pages contained their expected target `/blog/...` internal link.
- No public employer references, placeholder image labels, or `---CONTENT---` markers were found on the updated public pages.

### Internal-link cleanup batch 4/final application on 2026-08-15

Louie approved applying the final internal-link cleanup package.

Package:

```text
plans/internal-link-package-2026-08-15-batch-4.json
plans/internal-link-package-2026-08-15-batch-4.md
```

Original post backup saved outside the repo:

```text
D:/Factory/super_blog-archives/internal-link-batch-4-originals-2026-08-15T01-35-11-509Z.json
```

Updated live posts:

- `three-days-sibbald-point-camping-georgina`
- `garbage-compactor-machine-down-when-your-worst-building-nightmare-shows-up-on-a-tuesday`
- `the-people-behind-your-building-why-good-staff-matter-more-than-you-think`
- `dealing-with-difficult-tenants-disputes-evictions-high-maintenance`
- `what-happens-after-you-talk-to-noisy-tenant`
- `parking-areas-multi-unit-buildings-residents-rules-enforcement`
- `psychology-behind-garbage-chaos-subsidized-housing`
- `writing-through-the-noise-why-i-started-blogging-as-a-superintendent`
- `garmin-epix-pro-gen-2-battery-life-tips`

Verification after production update:

- Live API content matched the approved package for all 9 posts.
- All 9 public pages returned `200`.
- All 9 public pages contained their expected target `/blog/...` internal link.
- No public employer references, placeholder image labels, or `---CONTENT---` markers were found on the updated public pages.
- Follow-up live audit found `0` published posts without internal blog links.

### Short-post expansion and generated-post minimum on 2026-08-15

Louie approved applying the short-post expansion package and setting 700 words as the standard minimum length for future generated posts.

Package:

```text
plans/short-post-expansion-package-2026-08-15.json
plans/short-post-expansion-package-2026-08-15.md
```

Original post backup saved outside the repo:

```text
D:/Factory/super_blog-archives/short-post-expansion-originals-2026-08-15T02-18-57-865Z.json
```

Updated live posts:

- `heat-wave-chaos-in-the-building`: 650 → 773 words
- `scooters-in-hallway-problem`: 669 → 786 words

Verification after production update:

- Live API content matched the approved package for both posts.
- Both public pages returned `200`.
- Both public pages contained the approved added paragraphs.
- No public employer references, placeholder image labels, or `---CONTENT---` markers were found on the updated public pages.

Future generated-post standard:

- `lib/generated-post-quality.ts` now enforces `MIN_GENERATED_WORDS = 700`.
- `lib/generated-post-quality.test.ts` covers the 700-word minimum so a 699-word generated post is blocked as too thin.

### Post-deploy verification on 2026-08-15

Louie manually triggered Coolify deployment after commit `de56743 feat: enforce 700 word generated post minimum`.

Verified production at `https://www.maplehub.cloud` after deployment:

- `/` returned `200`.
- `/blog` returned `200`.
- `/about` returned `200`.
- `/contact` returned `200`.
- `/privacy` returned `200`.
- `/disclaimer` returned `200`.
- `/robots.txt` returned `200`.
- `/sitemap.xml` returned `200`.
- `/ads.txt` returned `200` with the Google publisher record.
- `/api/posts` returned `200` with 43 published posts.
- Follow-up live API audit found `0` published posts under 700 words.
- Follow-up live API audit found `0` published posts missing internal blog links.
- Expanded posts still verified at 773 and 786 words.
- Browser check of `heat-wave-chaos-in-the-building` showed the approved added paragraphs rendered publicly.
- Browser console check returned no console messages and no JavaScript errors.

No migration was required.

### Next.js proxy convention cleanup on 2026-08-15

Migrated the deprecated Next.js `middleware.ts` convention to the Next.js 16 `proxy.ts` convention.

Changed files:

- Removed `middleware.ts`.
- Added `proxy.ts` with the existing `/admin/:path*` guard exported as `proxy`.

Verification:

- `npm run test` passed: 26 files, 139 tests.
- `npm run lint` passed.
- `npm run build` passed.
- The previous Next.js `middleware` deprecation warning no longer appears in the build output.

Deployment note: this code change requires the usual manual Coolify deploy before the production runtime uses `proxy.ts` instead of `middleware.ts`.

### Proxy migration post-deploy verification on 2026-08-15

Louie manually triggered Coolify deployment after commit `2acecbd fix: migrate middleware to proxy convention`.

Verified production at `https://www.maplehub.cloud` after deployment:

- `/` returned `200`.
- `/blog` returned `200` and rendered in the browser.
- `/about` returned `200`.
- `/contact` returned `200`.
- `/privacy` returned `200`.
- `/disclaimer` returned `200`.
- `/robots.txt` returned `200`.
- `/sitemap.xml` returned `200`.
- `/ads.txt` returned `200`.
- `/api/posts` returned `200` with 43 published posts.
- Live content audit found `0` published posts under 700 words.
- Live content audit found `0` published posts missing internal blog links.
- Live content audit found no public employer references, duplicate markdown H1s, or placeholder markers.
- Browser console on `/blog` returned no console messages and no JavaScript errors.
- Unauthenticated `/admin/posts` redirected to `/admin`, confirming the proxy guard is active.

No migration was required.

### Homepage/blog product polish on 2026-08-15

Completed a low-risk visual/product polish pass after the proxy deployment.

Changed files:

- `app/page.tsx`
- `app/blog/page.tsx`
- `components/sidebar.tsx`

What changed:

- Added homepage trust/context cards explaining real field notes, readable depth, and related reading.
- Added a homepage author-card note that clarifies the site covers building work, tech, training, recovery, and time away from the noise.
- Added a short recent-posts context line so the homepage feels more guided.
- Made newsletter copy more specific to field notes, training stories, and building lessons.
- Added blog-index topic lane links for building operations, superintendent life, running/recovery, and garbage/shared spaces.
- Added blog-index context cards for post count, real-work coverage, and browse/search behavior.
- Strengthened sidebar trust copy around anonymous practical notes from the building floor.

Verification:

- `npm run test` passed: 26 files, 139 tests.
- `npm run lint` passed.
- `npm run build` passed.
- Local production server smoke check passed for `/` and `/blog`.
- Browser console check returned no console messages and no JavaScript errors.
- Local production server was stopped after verification.

Deployment note: this visual polish requires the usual manual Coolify deploy before production reflects it.

### Homepage/blog polish post-deploy verification on 2026-08-15

Louie manually triggered Coolify deployment for commit `79e64b4 feat: polish homepage and blog discovery`.

Verified production at `https://www.maplehub.cloud` after deployment:

- `/` returned `200` and shows the new homepage trust/context cards: real field notes, readable depth, and related reading.
- `/` shows the new author-card context note about building work, tech, training, recovery, and time away from the noise.
- `/` shows the updated recent-posts context line.
- `/blog` returned `200` and shows the new topic lane links: building operations, superintendent life, running/recovery, and garbage/shared spaces.
- `/blog` shows the new blog context cards: 43 published notes, built around real work, and browse/search.
- `/about`, `/contact`, `/privacy`, `/disclaimer`, `/resources`, `/robots.txt`, `/sitemap.xml`, `/ads.txt`, and `/api/posts` all returned `200`.
- `/api/posts` returned 43 published posts.
- Live content audit found `0` published posts under 700 words.
- Live content audit found `0` published posts missing internal blog links.
- Browser console checks on `/` and `/blog` returned no console messages and no JavaScript errors.

No migration was required.

### Trust-page polish on 2026-08-15

Completed a low-risk AdSense/trust-page polish pass.

Changed files:

- `app/about/page.tsx`
- `app/contact/page.tsx`
- `app/privacy/page.tsx`
- `app/disclaimer/page.tsx`
- `app/resources/page.tsx`

What changed:

- Added clearer trust/context headers and summary cards across About, Contact, Privacy, Disclaimer, and Resources.
- Added About-page cues for personal perspective, anonymized stories, and practical-not-advice framing.
- Removed an overly specific fallback About-page employer-size reference from source copy.
- Added Contact-page expectations around appropriate messages, privacy of submissions, and non-emergency use.
- Added Privacy-page at-a-glance cards for user-provided data, ads/affiliate handling, and reader choices; updated the visible policy update date for this copy/layout pass.
- Added Disclaimer-page cards for no-extra-cost affiliate links, clear labels, and reader trust first.
- Added Resources-page cards clarifying templates are general examples, require review before use, and support organized follow-up.

Verification:

- `npm run test` passed: 26 files, 139 tests.
- `npm run lint` passed.
- `npm run build` passed.
- Local production server smoke check used port 3001 because an old node process was occupying port 3000.
- Local `/about` was visually checked in-browser and rendered cleanly.
- Local `/contact`, `/privacy`, `/disclaimer`, and `/resources` returned `200` and included the new trust markers.
- Browser console returned no console messages and no JavaScript errors.
- Temporary local verification server on port 3001 was stopped.
- Leftover Node process occupying port 3000 was identified and stopped with `taskkill.exe`.

Deployment note: this trust-page polish requires the usual manual Coolify deploy before production reflects it. No migration is required.

### Trust-page polish post-deploy verification on 2026-08-15

Louie manually triggered Coolify deployment for commit `14bf07b feat: polish public trust pages`.

Verified production at `https://www.maplehub.cloud` after deployment:

- `/`, `/blog`, `/about`, `/contact`, `/privacy`, `/disclaimer`, `/resources`, `/robots.txt`, `/sitemap.xml`, `/ads.txt`, and `/api/posts` all returned `200`.
- `/about` shows the new trust header/card shell: About the author, personal perspective, anonymized stories, and practical notes.
- `/contact` shows the new contact expectation cards: good reasons to write, private by default, and no emergency channel.
- `/privacy` shows the new privacy summary cards: what you provide, ads and affiliates, and your choices.
- `/disclaimer` shows the new disclosure summary cards: no extra cost, clear labels, and reader trust first.
- `/resources` shows the new resource-use cards: general examples, review before use, and built from practice.
- Browser console on `/about` returned no console messages and no JavaScript errors.
- `/api/posts` returned 43 published posts.
- Live content audit found `0` published posts under 700 words and `0` published posts missing internal blog links.

Note: the admin-managed About body still contains older employer-size wording. The source-code fallback was cleaned in commit `14bf07b`, but the live custom About content would need a separate approved Admin content update if Louie wants that sentence generalized too.

No migration was required.

### About-page admin content cleanup on 2026-08-15

Louie approved a small Admin content cleanup after the trust-page deploy verification.

What changed in production Admin settings:

- Archived the original `pages.about` setting outside the repo at `D:/Factory/super_blog-archives/about-page-original-2026-08-15T04-09-45-306Z.json`.
- Replaced the older sentence that referenced becoming a Senior Building Superintendent at one of the largest subsidized housing companies in North America.
- New generalized wording says the career pivot was "into building operations" and avoids employer-size specificity.

Verification:

- `/about` returned `200`.
- Public About page no longer contains "largest subsidized housing companies".
- Public About page no longer contains the older "I became a Senior Building Superintendent" sentence.
- Public About page contains "wild career pivot into building operations".
- Public About page still contains the trust cards: Personal perspective, Anonymized stories, Practical notes.
- Browser console on `/about` returned no console messages and no JavaScript errors.
- Temporary Admin API script was removed after use; repo remained clean before this status update.

No deployment or migration was required because this was a production Admin settings update.

### Blog illustration style standard on 2026-08-15

Louie provided `C:/Users/louie/Pictures/must replicate.jpeg` as the target visual style for future MapleHub blog illustrations.

Style direction extracted from the reference:

- Cinematic cel-shaded editorial illustration.
- Detailed building-operations environmental storytelling.
- Strong architectural perspective with believable stairs, doors, hallways, railings, service rooms, sidewalks, and apartment interiors.
- Thick clean ink outlines, crisp linework, hand-painted background texture, and subtle film grain.
- Warm daylight or practical interior light, deep readable shadows, muted cream/green/gray building surfaces, and saturated accent objects such as blue doors, garbage bags, safety signs, tools, notices, boxes, or maintenance supplies.
- Grounded animated-story feel: realistic, slightly cinematic, human but not cute, no glossy 3D render, no plastic vector look, no childish clip art, no distorted anatomy.

What changed:

- Updated `DEFAULT_IMAGE_PROMPT_TEMPLATE` in `lib/generate-post-image-prompt.ts` so new fallback/generated image prompts use this style without named artist references.
- Added `lib/generate-post-image-prompt.test.ts` to protect the new style requirements.
- Updated the live Admin AI setting `ai.imagePromptTemplate` so future production generated images use this style immediately.
- Archived the previous live AI image prompt settings outside the repo at `D:/Factory/super_blog-archives/ai-image-prompt-template-original-2026-08-15T04-46-12-876Z.json`.

Verification:

- Live Admin settings now contain the cinematic cel-shaded style, strong architectural perspective, and garbage-bag/building-operations detail cues.
- Live Admin settings no longer contain the previous named style references.
- Temporary Admin API script was removed after use.
- `npm run test` passed: 27 files, 141 tests.
- `npm run lint` passed.
- `npm run build` passed.

Deployment note: the live Admin setting is already updated; deploy is only needed to make the source-code fallback/tested default live in the deployed app image.

### Universal excerpt-driven image prompt update on 2026-08-15

Louie clarified that the reference image style should apply across all story types, not only building/work posts, and that featured-image generation should prefer the post excerpt as the best short scene description.

What changed:

- Revised `DEFAULT_IMAGE_PROMPT_TEMPLATE` to use the topic/excerpt as the source of truth for setting and activity.
- Removed hard-coded building-operation scene bias from the image prompt default.
- Kept the cinematic cel-shaded editorial illustration style, thick ink outlines, subtle film grain, lived-in detail, and realistic animated personal-essay feel.
- Added Louie's recurring visible character traits for images where the main character appears: light-brown skin, clean-shaven head, beard, about 6 feet tall, medium build, practical activity-appropriate clothing, and a rugged black sports watch similar to a Garmin Epix Pro.
- Updated generated-post image creation so full AI post generation now creates the image after text generation and uses `excerpt || title || topic` as the image source.
- Manual editor image generation already used `excerpt || title`, and continues to do so.
- Updated the live Admin AI image prompt template immediately.
- Archived the previous live Admin image prompt setting outside the repo at `D:/Factory/super_blog-archives/ai-image-prompt-template-before-universal-excerpt-2026-08-15T08-50-19-339Z.json`.

Verification:

- Live Admin setting contains `source of truth`, the character-trait guidance, and `Do not force a building`.
- Live Admin setting no longer contains the forced `Toronto apartment building or townhouse setting` phrase.
- Temporary Admin API script was removed after use.
- `npm run test` passed: 27 files, 141 tests.
- `npm run lint` passed.
- `npm run build` passed.

Deployment note: the live Admin setting is already updated; Coolify deploy is recommended so the deployed source fallback also matches the repo.

### Excerpt-driven image prompt post-deploy verification on 2026-08-15

Louie manually triggered Coolify deployment for commit `754bab6 feat: make blog image prompts excerpt driven`.

Verified production at `https://www.maplehub.cloud` after deployment:

- `/`, `/blog`, `/about`, `/contact`, `/privacy`, `/disclaimer`, `/resources`, `/robots.txt`, `/sitemap.xml`, `/ads.txt`, and `/api/posts` all returned `200`.
- `/api/posts` returned 43 published posts.
- Live content audit found `0` published posts under 700 words and `0` published posts missing internal blog links.
- Live Admin AI image prompt setting contains the excerpt/source-of-truth guidance.
- Live Admin AI image prompt setting contains Louie's visible character guidance, including light-brown skin and a rugged black sports watch similar to a Garmin Epix Pro.
- Live Admin AI image prompt setting contains `Do not force a building`.
- Live Admin AI image prompt setting no longer contains the forced `Toronto apartment building or townhouse setting` phrase.
- Live Admin AI image prompt setting no longer contains the previous named style references.
- Browser console on `/` returned no console messages and no JavaScript errors.

No migration was required.

### Image prompt metaphor guardrails on 2026-08-15

Louie reported a bad image-generation outcome for `/blog/the-fine-line-between-compassion-and-burnout-in-working-as-a-building-superintendent`: the model produced an out-of-context man carrying a child/running-style scene instead of an emotionally tired superintendent/burnout scene.

Root cause:

- The excerpt contains metaphorical language about "weight" and "carrying home".
- The universal prompt previously allowed broad activity categories such as running and family time without explicitly limiting them to what the excerpt states.
- The prompt did not forbid literalizing emotional metaphors into physically carrying a person, carrying a child, running with someone, or family-outing imagery.

What changed:

- Added explicit prompt guardrails: use the excerpt as the source of truth for setting, people, activity, mood, and objects.
- Added "Do not literalize metaphors" guidance for emotional weight, carrying things home, burnout, pressure, and burden.
- Added specific negative guidance against physically carrying a person, carrying a child, carrying a heavy object, running with someone, or a family outing unless the excerpt explicitly says so.
- Added a regression test using the burnout excerpt to protect against this exact failure mode.
- Updated the live Admin AI image prompt setting immediately.
- Archived the previous live Admin prompt setting outside the repo at `D:/Factory/super_blog-archives/ai-image-prompt-template-before-metaphor-guardrails-2026-08-15T09-33-36-332Z.json`.

Verification:

- Live Admin prompt contains the metaphor, child-carrying, and running guardrails.
- Temporary Admin API script was removed after use.
- `npm run test` passed: 27 files, 142 tests.
- `npm run lint` passed.
- `npm run build` passed.

Deployment note: the live Admin setting is already updated; Coolify deploy is recommended so the deployed source fallback also matches the repo.

### Image prompt rollback note requested by Louie on 2026-08-15 05:50 EDT

Louie said he will run more image-generation tests and asked to note exactly where/when the image prompt was changed from the original because he may revert back to it.

Prompt-change locations:

- Source default: `lib/generate-post-image-prompt.ts` (`DEFAULT_IMAGE_PROMPT_TEMPLATE`).
- Source tests: `lib/generate-post-image-prompt.test.ts`.
- Generated-post image source wiring: `lib/generate-post.ts` changed image generation to use `excerpt || title || topic` after post text generation.
- Live Admin setting: `/api/settings` key `ai.imagePromptTemplate` was updated through the Admin settings API.
- Project notes: `PROJECT_STATUS.md` records each prompt update and archive path.

Prompt-change timeline:

1. `ebb42d2 feat: standardize blog image style`
   - First changed the image prompt from the prior/original template to the reference-image-inspired cinematic cel-shaded blog style.
   - Updated live Admin AI prompt setting.
   - Archived previous live Admin AI settings at `D:/Factory/super_blog-archives/ai-image-prompt-template-original-2026-08-15T04-46-12-876Z.json`.

2. `754bab6 feat: make blog image prompts excerpt driven`
   - Changed the prompt from building-operations-specific to universal excerpt-driven story scenes.
   - Added Louie's visible character traits when a main character appears.
   - Changed full AI post generation so images use `excerpt || title || topic`.
   - Updated live Admin AI prompt setting.
   - Archived previous live Admin setting at `D:/Factory/super_blog-archives/ai-image-prompt-template-before-universal-excerpt-2026-08-15T08-50-19-339Z.json`.

3. `e561650 fix: prevent literalized image prompt metaphors`
   - Added guardrails after Louie reported the burnout/compassion post generated an out-of-context man carrying a child/running-style image.
   - Added explicit instruction not to literalize emotional metaphors like "weight" or "carrying home" into physically carrying a person/child, running with someone, or family-outing imagery.
   - Updated live Admin AI prompt setting.
   - Archived previous live Admin setting at `D:/Factory/super_blog-archives/ai-image-prompt-template-before-metaphor-guardrails-2026-08-15T09-33-36-332Z.json`.

Rollback guidance:

- To revert fully to the original pre-style-change live prompt, use the archive from step 1.
- To keep the cel-shaded reference-image style but undo excerpt-driven/general-subject behavior, compare against the archive from step 2.
- To keep excerpt-driven behavior but undo only the metaphor guardrails, compare against the archive from step 3.
- Do not regenerate or replace existing production images without Louie's explicit approval.
