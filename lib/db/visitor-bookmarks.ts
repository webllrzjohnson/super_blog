import sql from "@/lib/db";
import { hasDatabaseConfig } from "@/lib/db-config";
import { BOOKMARK_SYNC_MAX_SLUGS } from "@/lib/bookmarks-sync";

function normalizeSlugs(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of raw) {
    if (typeof x !== "string") continue;
    const s = x.trim();
    if (!s || seen.has(s)) continue;
    if (out.length >= BOOKMARK_SYNC_MAX_SLUGS) break;
    seen.add(s);
    out.push(s);
  }
  return out;
}

export async function getVisitorBookmarkSlugs(
  visitorHash: string,
): Promise<string[] | null> {
  if (!hasDatabaseConfig()) return null;

  try {
    const rows = await sql<Array<{ slugs: unknown }>>`
      SELECT slugs
      FROM visitor_bookmarks
      WHERE visitor_hash = ${visitorHash}
      LIMIT 1
    `;
    return normalizeSlugs(rows[0]?.slugs);
  } catch (err) {
    console.error("getVisitorBookmarkSlugs error:", err);
    return null;
  }
}

export async function setVisitorBookmarkSlugs(
  visitorHash: string,
  slugs: string[],
): Promise<boolean> {
  if (!hasDatabaseConfig()) return false;

  const normalized = normalizeSlugs(slugs);
  try {
    await sql`
      INSERT INTO visitor_bookmarks (visitor_hash, slugs, updated_at)
      VALUES (${visitorHash}, ${sql.json(normalized)}, NOW())
      ON CONFLICT (visitor_hash) DO UPDATE
      SET slugs = EXCLUDED.slugs, updated_at = EXCLUDED.updated_at
    `;
    return true;
  } catch (err) {
    console.error("setVisitorBookmarkSlugs error:", err);
    return false;
  }
}
