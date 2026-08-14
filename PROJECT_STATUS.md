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
