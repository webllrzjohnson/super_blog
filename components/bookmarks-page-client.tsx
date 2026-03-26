'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { PostCard } from '@/components/post-card'
import { useBookmarks } from '@/components/bookmarks-provider'
import { Button } from '@/components/ui/button'
import type { Post } from '@/lib/types'

export function BookmarksPageClient() {
  const { slugs, hydrated, removeBookmark } = useBookmarks()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/posts')
        if (!res.ok) throw new Error('Failed to load posts')
        const data = (await res.json()) as Post[]
        if (!cancelled) setPosts(Array.isArray(data) ? data : [])
      } catch {
        if (!cancelled) setError('Could not load posts.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const bySlug = useMemo(() => {
    const m = new Map<string, Post>()
    for (const p of posts) {
      m.set(p.slug, p)
    }
    return m
  }, [posts])

  const bookmarkedPosts = useMemo(() => {
    const list: Post[] = []
    for (const slug of slugs) {
      const p = bySlug.get(slug)
      if (p) list.push(p)
    }
    return list
  }, [slugs, bySlug])

  const staleSlugs = useMemo(() => {
    return slugs.filter((s) => !bySlug.has(s))
  }, [slugs, bySlug])

  if (!hydrated || loading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>
  }

  if (slugs.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-8 text-center space-y-4">
        <p className="text-muted-foreground">
          No bookmarks yet. Open a post and tap <strong className="text-foreground">Bookmark</strong>.
        </p>
        <Button variant="outline" asChild>
          <Link href="/blog">Browse blog</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {staleSlugs.length > 0 && (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
          <p className="font-medium mb-1">Some bookmarks are no longer available</p>
          <p className="text-amber-800/90 dark:text-amber-200/90 mb-2">
            These slugs may point to drafts or removed posts:
          </p>
          <ul className="list-disc list-inside space-y-1 mb-3">
            {staleSlugs.map((s) => (
              <li key={s}>
                <code className="text-xs">{s}</code>{' '}
                <button
                  type="button"
                  className="underline text-foreground/90 hover:text-foreground"
                  onClick={() => removeBookmark(s)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {bookmarkedPosts.length === 0 && staleSlugs.length > 0 ? null : (
        <div className="space-y-8">
          {bookmarkedPosts.map((post) => (
            <div key={post.id} className="relative group/card">
              <PostCard post={post} />
              <div className="mt-2">
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                  onClick={() => removeBookmark(post.slug)}
                >
                  Remove from bookmarks
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
