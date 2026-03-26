import { createServerClient, hasSupabaseConfig } from '@/lib/supabase/server'

export type CommentRow = {
  id: string
  post_id: string
  author_name: string
  body: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  visitor_hash: string | null
}

export type PublicComment = {
  id: string
  authorName: string
  body: string
  createdAt: string
}

export async function listApprovedCommentsForPost(postId: string): Promise<PublicComment[]> {
  if (!hasSupabaseConfig()) return []

  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('post_comments')
      .select('id, author_name, body, created_at')
      .eq('post_id', postId)
      .eq('status', 'approved')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('listApprovedCommentsForPost:', error)
      return []
    }

    return (data ?? []).map((r) => ({
      id: r.id as string,
      authorName: r.author_name as string,
      body: r.body as string,
      createdAt: r.created_at as string,
    }))
  } catch (err) {
    console.error('listApprovedCommentsForPost error:', err)
    return []
  }
}

export async function insertPendingComment(input: {
  postId: string
  authorName: string
  body: string
  visitorHash: string | null
}): Promise<{ id: string } | null> {
  if (!hasSupabaseConfig()) return null

  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('post_comments')
      .insert({
        post_id: input.postId,
        author_name: input.authorName.trim(),
        body: input.body.trim(),
        visitor_hash: input.visitorHash,
        status: 'pending',
      })
      .select('id')
      .single()

    if (error) {
      console.error('insertPendingComment:', error)
      return null
    }
    return data ? { id: data.id as string } : null
  } catch (err) {
    console.error('insertPendingComment error:', err)
    return null
  }
}

export async function listCommentsForModeration(
  status: 'pending' | 'approved' | 'rejected'
): Promise<CommentRow[]> {
  if (!hasSupabaseConfig()) return []

  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('post_comments')
      .select('id, post_id, author_name, body, status, created_at, visitor_hash')
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) {
      console.error('listCommentsForModeration:', error)
      return []
    }

    return (data ?? []) as CommentRow[]
  } catch (err) {
    console.error('listCommentsForModeration error:', err)
    return []
  }
}

export async function setCommentStatus(
  id: string,
  status: 'approved' | 'rejected'
): Promise<boolean> {
  if (!hasSupabaseConfig()) return false

  try {
    const supabase = createServerClient()
    const { error } = await supabase.from('post_comments').update({ status }).eq('id', id)

    if (error) {
      console.error('setCommentStatus:', error)
      return false
    }
    return true
  } catch (err) {
    console.error('setCommentStatus error:', err)
    return false
  }
}
