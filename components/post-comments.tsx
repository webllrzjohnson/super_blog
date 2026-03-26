'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  VISITOR_DEVICE_HEADER,
  getOrCreateVisitorDeviceId,
} from '@/lib/visitor-device-id'

type PublicComment = {
  id: string
  authorName: string
  body: string
  createdAt: string
}

export function PostComments({ slug }: { slug: string }) {
  const [comments, setComments] = useState<PublicComment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [authorName, setAuthorName] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [visitorId, setVisitorId] = useState('')

  useEffect(() => {
    setVisitorId(getOrCreateVisitorDeviceId())
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/blog/${encodeURIComponent(slug)}/comments`)
      if (!res.ok) throw new Error('Failed to load comments')
      const data = (await res.json()) as { comments?: PublicComment[] }
      setComments(Array.isArray(data.comments) ? data.comments : [])
    } catch {
      setError('Could not load comments.')
      setComments([])
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    void load()
  }, [load])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setNotice(null)
    const vid = visitorId || getOrCreateVisitorDeviceId()
    if (!vid) {
      setError('Comments require browser storage. Enable cookies/storage and try again.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/blog/${encodeURIComponent(slug)}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [VISITOR_DEVICE_HEADER]: vid,
        },
        body: JSON.stringify({
          authorName: authorName.trim(),
          body: body.trim(),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Could not submit comment.')
      }
      setNotice(typeof data.message === 'string' ? data.message : 'Submitted for review.')
      setAuthorName('')
      setBody('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit comment.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mt-12 pt-8 border-t border-border/60" aria-labelledby="comments-heading">
      <h2 id="comments-heading" className="text-lg font-medium text-foreground mb-4">
        Comments
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        New notes are reviewed before they appear. Be kind and on-topic.
      </p>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading comments…</p>
      ) : error && comments.length === 0 ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        <ul className="space-y-6 mb-10 list-none m-0 p-0">
          {comments.length === 0 ? (
            <li className="text-sm text-muted-foreground">No comments yet — add the first below.</li>
          ) : (
            comments.map((c) => (
              <li key={c.id} className="text-sm border-b border-border/40 pb-4 last:border-0">
                <p className="font-medium text-foreground">{c.authorName}</p>
                <p className="text-xs text-muted-foreground mb-2">
                  {new Date(c.createdAt).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
                <p className="text-foreground/90 whitespace-pre-wrap">{c.body}</p>
              </li>
            ))
          )}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <div className="space-y-2">
          <Label htmlFor="comment-name">Name</Label>
          <Input
            id="comment-name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            maxLength={120}
            required
            autoComplete="name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="comment-body">Comment</Label>
          <Textarea
            id="comment-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            maxLength={8000}
            required
            placeholder="Share your thoughts…"
          />
        </div>
        {notice && <p className="text-sm text-green-700 dark:text-green-500">{notice}</p>}
        {error && comments.length > 0 && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit for review'}
        </Button>
      </form>
    </section>
  )
}
