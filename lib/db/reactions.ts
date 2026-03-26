import { createServerClient, hasSupabaseConfig } from '@/lib/supabase/server'
import type { ReactionKind } from '@/lib/reactions'
import { emptyReactionCounts } from '@/lib/reactions'

export type ReactionSummary = {
  counts: Record<ReactionKind, number>
  mine: ReactionKind | null
}

export async function getReactionSummaryForPost(
  postId: string,
  voterHash: string | null
): Promise<ReactionSummary> {
  if (!hasSupabaseConfig()) {
    return { counts: emptyReactionCounts(), mine: null }
  }

  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('post_reactions')
      .select('kind, voter_hash')
      .eq('post_id', postId)

    if (error) {
      console.error('getReactionSummaryForPost:', error)
      return { counts: emptyReactionCounts(), mine: null }
    }

    const counts = emptyReactionCounts()
    let mine: ReactionKind | null = null

    for (const row of data ?? []) {
      const k = row.kind as ReactionKind
      if (k in counts) {
        counts[k] += 1
      }
      if (voterHash && row.voter_hash === voterHash) {
        mine = k
      }
    }

    return { counts, mine }
  } catch (err) {
    console.error('getReactionSummaryForPost error:', err)
    return { counts: emptyReactionCounts(), mine: null }
  }
}

export async function setPostReaction(
  postId: string,
  voterHash: string,
  kind: ReactionKind | null
): Promise<boolean> {
  if (!hasSupabaseConfig()) {
    return false
  }

  try {
    const supabase = createServerClient()
    if (kind === null) {
      const { error } = await supabase
        .from('post_reactions')
        .delete()
        .eq('post_id', postId)
        .eq('voter_hash', voterHash)

      if (error) {
        console.error('setPostReaction delete:', error)
        return false
      }
      return true
    }

    const { error } = await supabase.from('post_reactions').upsert(
      {
        post_id: postId,
        voter_hash: voterHash,
        kind,
      },
      { onConflict: 'post_id,voter_hash' }
    )

    if (error) {
      console.error('setPostReaction upsert:', error)
      return false
    }
    return true
  } catch (err) {
    console.error('setPostReaction error:', err)
    return false
  }
}
