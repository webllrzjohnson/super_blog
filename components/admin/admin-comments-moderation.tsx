'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

type Row = {
  id: string
  post_id: string
  author_name: string
  body: string
  status: string
  created_at: string
}

export function AdminCommentsModeration() {
  const [configured, setConfigured] = useState(true)
  const [comments, setComments] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/comments/moderate?status=pending', {
        credentials: 'include',
      })
      if (!res.ok) {
        throw new Error('Failed to load queue')
      }
      const data = (await res.json()) as { configured?: boolean; comments?: Row[] }
      if (data.configured === false) {
        setConfigured(false)
        setComments([])
        return
      }
      setConfigured(true)
      setComments(Array.isArray(data.comments) ? data.comments : [])
    } catch {
      toast.error('Could not load comment queue')
      setComments([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const act = async (id: string, action: 'approve' | 'reject') => {
    setBusyId(id)
    try {
      const res = await fetch('/api/comments/moderate', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, action }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Update failed')
      }
      setComments((prev) => prev.filter((c) => c.id !== id))
      toast.success(action === 'approve' ? 'Comment approved' : 'Comment rejected')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setBusyId(null)
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>
  }

  if (!configured) {
    return (
      <p className="text-sm text-amber-700 dark:text-amber-500">
        Comments need Supabase with migration 00006_post_comments.sql and service role env vars.
      </p>
    )
  }

  if (comments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No pending comments. New submissions will appear here.
      </p>
    )
  }

  return (
    <ul className="space-y-6 list-none m-0 p-0 max-w-3xl">
      {comments.map((c) => (
        <li
          key={c.id}
          className="rounded-lg border border-border p-4 space-y-3 bg-muted/20"
        >
          <div className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
            <span className="font-mono">Post: {c.post_id}</span>
            <time dateTime={c.created_at}>
              {new Date(c.created_at).toLocaleString()}
            </time>
          </div>
          <p className="font-medium text-foreground">{c.author_name}</p>
          <p className="text-sm whitespace-pre-wrap text-foreground/90">{c.body}</p>
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              disabled={busyId === c.id}
              onClick={() => void act(c.id, 'approve')}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={busyId === c.id}
              onClick={() => void act(c.id, 'reject')}
            >
              Reject
            </Button>
          </div>
        </li>
      ))}
    </ul>
  )
}
