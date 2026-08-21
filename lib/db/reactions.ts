import sql from "@/lib/db";
import { hasDatabaseConfig } from "@/lib/db-config";
import type { ReactionKind } from "@/lib/reactions";
import { emptyReactionCounts } from "@/lib/reactions";

export type ReactionSummary = {
  counts: Record<ReactionKind, number>;
  mine: ReactionKind | null;
};

type ReactionRow = {
  kind: ReactionKind;
  voter_hash: string;
};

export async function getReactionSummaryForPost(
  postId: string,
  voterHash: string | null,
): Promise<ReactionSummary> {
  if (!hasDatabaseConfig()) {
    return { counts: emptyReactionCounts(), mine: null };
  }

  try {
    const rows = await sql<ReactionRow[]>`
      SELECT kind, voter_hash
      FROM post_reactions
      WHERE post_id = ${postId}
    `;
    const counts = emptyReactionCounts();
    let mine: ReactionKind | null = null;

    for (const row of rows) {
      if (row.kind in counts) counts[row.kind] += 1;
      if (voterHash && row.voter_hash === voterHash) mine = row.kind;
    }

    return { counts, mine };
  } catch (err) {
    console.error("getReactionSummaryForPost error:", err);
    return { counts: emptyReactionCounts(), mine: null };
  }
}

export async function setPostReaction(
  postId: string,
  voterHash: string,
  kind: ReactionKind | null,
): Promise<boolean> {
  if (!hasDatabaseConfig()) return false;

  try {
    if (kind === null) {
      await sql`
        DELETE FROM post_reactions
        WHERE post_id = ${postId} AND voter_hash = ${voterHash}
      `;
      return true;
    }

    await sql`
      INSERT INTO post_reactions (post_id, voter_hash, kind)
      VALUES (${postId}, ${voterHash}, ${kind})
      ON CONFLICT (post_id, voter_hash) DO UPDATE
      SET kind = EXCLUDED.kind
    `;
    return true;
  } catch (err) {
    console.error("setPostReaction error:", err);
    return false;
  }
}
