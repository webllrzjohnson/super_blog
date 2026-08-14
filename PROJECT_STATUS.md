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
