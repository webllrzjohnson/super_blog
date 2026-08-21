import sql from "@/lib/db";
import { hasDatabaseConfig } from "@/lib/db-config";
import {
  normalizeContentIdeaInput,
  sortContentIdeas,
  type ContentIdea,
  type ContentIdeaInput,
} from "@/lib/content-ideas";

function mapRowToContentIdea(row: Record<string, unknown>): ContentIdea {
  return {
    id: row.id as string,
    title: row.title as string,
    notes: (row.notes as string | null) ?? "",
    category: row.category as ContentIdea["category"],
    priority: row.priority as ContentIdea["priority"],
    status: row.status as ContentIdea["status"],
    targetPublishAt: (row.target_publish_at as string | null) ?? null,
    generatedPostId: (row.generated_post_id as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    archivedAt: (row.archived_at as string | null) ?? null,
  };
}

export async function getContentIdeasFromDb(): Promise<ContentIdea[]> {
  if (!hasDatabaseConfig()) return [];

  try {
    const rows = await sql`
      SELECT id, title, notes, category, priority, status,
             target_publish_at, generated_post_id, created_at, updated_at, archived_at
      FROM content_ideas
      ORDER BY updated_at DESC
    `;
    return sortContentIdeas(
      rows.map((row) => mapRowToContentIdea(row as Record<string, unknown>)),
    );
  } catch (err) {
    console.error("getContentIdeasFromDb error:", err);
    return [];
  }
}

export async function createContentIdeaInDb(
  input: ContentIdeaInput,
): Promise<ContentIdea | null> {
  if (!hasDatabaseConfig()) return null;

  const normalized = normalizeContentIdeaInput(input);
  if (!normalized.title) return null;

  try {
    const rows = await sql`
      INSERT INTO content_ideas ${sql({
        title: normalized.title,
        notes: normalized.notes,
        category: normalized.category,
        priority: normalized.priority,
        status: normalized.status,
        target_publish_at: normalized.targetPublishAt,
      })}
      RETURNING id, title, notes, category, priority, status,
                target_publish_at, generated_post_id, created_at, updated_at, archived_at
    `;
    return rows[0]
      ? mapRowToContentIdea(rows[0] as Record<string, unknown>)
      : null;
  } catch (err) {
    console.error("createContentIdeaInDb error:", err);
    return null;
  }
}

export async function updateContentIdeaInDb(
  id: string,
  input: ContentIdeaInput & { generatedPostId?: unknown },
): Promise<ContentIdea | null> {
  if (!hasDatabaseConfig()) return null;

  const normalized = normalizeContentIdeaInput(input);
  if (!normalized.title) return null;

  const generatedPostId =
    typeof input.generatedPostId === "string" && input.generatedPostId.trim()
      ? input.generatedPostId.trim()
      : null;
  const archivedAt =
    normalized.status === "archived" ? new Date().toISOString() : null;

  try {
    const rows = await sql`
      UPDATE content_ideas
      SET title = ${normalized.title},
          notes = ${normalized.notes},
          category = ${normalized.category},
          priority = ${normalized.priority},
          status = ${normalized.status},
          target_publish_at = ${normalized.targetPublishAt},
          generated_post_id = COALESCE(${generatedPostId}, generated_post_id),
          archived_at = ${archivedAt},
          updated_at = now()
      WHERE id = ${id}
      RETURNING id, title, notes, category, priority, status,
                target_publish_at, generated_post_id, created_at, updated_at, archived_at
    `;
    return rows[0]
      ? mapRowToContentIdea(rows[0] as Record<string, unknown>)
      : null;
  } catch (err) {
    console.error("updateContentIdeaInDb error:", err);
    return null;
  }
}

export async function deleteContentIdeaFromDb(id: string): Promise<boolean> {
  if (!hasDatabaseConfig()) return false;

  try {
    await sql`DELETE FROM content_ideas WHERE id = ${id}`;
    return true;
  } catch (err) {
    console.error("deleteContentIdeaFromDb error:", err);
    return false;
  }
}
