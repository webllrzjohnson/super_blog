import sql from "@/lib/db";
import { hasDatabaseConfig } from "@/lib/db-config";

export type CommentRow = {
  id: string;
  post_id: string;
  author_name: string;
  body: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  visitor_hash: string | null;
};

export type PublicComment = {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
};

export async function listApprovedCommentsForPost(
  postId: string,
): Promise<PublicComment[]> {
  if (!hasDatabaseConfig()) return [];

  try {
    const rows = await sql<
      Array<Pick<CommentRow, "id" | "author_name" | "body" | "created_at">>
    >`
      SELECT id, author_name, body, created_at
      FROM post_comments
      WHERE post_id = ${postId} AND status = 'approved'
      ORDER BY created_at ASC
    `;

    return rows.map((row) => ({
      id: row.id,
      authorName: row.author_name,
      body: row.body,
      createdAt: row.created_at,
    }));
  } catch (err) {
    console.error("listApprovedCommentsForPost error:", err);
    return [];
  }
}

export async function insertPendingComment(input: {
  postId: string;
  authorName: string;
  body: string;
  visitorHash: string | null;
}): Promise<{ id: string } | null> {
  if (!hasDatabaseConfig()) return null;

  try {
    const rows = await sql<Array<{ id: string }>>`
      INSERT INTO post_comments (post_id, author_name, body, visitor_hash, status)
      VALUES (${input.postId}, ${input.authorName.trim()}, ${input.body.trim()}, ${input.visitorHash}, 'pending')
      RETURNING id
    `;
    return rows[0] ?? null;
  } catch (err) {
    console.error("insertPendingComment error:", err);
    return null;
  }
}

export async function listCommentsForModeration(
  status: "pending" | "approved" | "rejected",
): Promise<CommentRow[]> {
  if (!hasDatabaseConfig()) return [];

  try {
    return await sql<CommentRow[]>`
      SELECT id, post_id, author_name, body, status, created_at, visitor_hash
      FROM post_comments
      WHERE status = ${status}
      ORDER BY created_at DESC
      LIMIT 200
    `;
  } catch (err) {
    console.error("listCommentsForModeration error:", err);
    return [];
  }
}

export async function setCommentStatus(
  id: string,
  status: "approved" | "rejected",
): Promise<boolean> {
  if (!hasDatabaseConfig()) return false;

  try {
    await sql`
      UPDATE post_comments
      SET status = ${status}
      WHERE id = ${id}
    `;
    return true;
  } catch (err) {
    console.error("setCommentStatus error:", err);
    return false;
  }
}
